import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { pool } from '../../src/db';
import { BACKUP_FORMAT, BACKUP_TABLES, BACKUP_VERSION } from './backup-format';

type DatabaseColumn = { column_name: string; data_type: string };
type BackupDocument = {
  format: string;
  version: number;
  createdAt: string;
  tables: Record<string, unknown[]>;
};

const JSON_COLUMNS: Record<string, Set<string>> = {
  products: new Set(['highlights', 'specifications', 'variants', 'gallery_images']),
  business_posts: new Set(['gallery_images', 'reviews']),
  shipments: new Set(['items', 'checkpoints']),
  rh_pending_checkout_orders: new Set(['order_data']),
  quotations: new Set(['admin_quote']),
  bespoke_requests: new Set(['admin_response']),
  rh_user_carts: new Set(['items']),
  rh_notification_reads: new Set(['notification_ids'])
};

const DATE_COLUMNS = new Set(['created_at', 'updated_at', 'logged_in_at', 'expires_at']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const getColumns = async (client: PoolConnection, table: string) => {
  const [rows] = await client.query<RowDataPacket[]>(
    `SELECT column_name, data_type
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ?
     ORDER BY ordinal_position`,
    [table]
  );
  return rows as DatabaseColumn[];
};

const validateBackup = (value: unknown): BackupDocument => {
  if (
    !isRecord(value) ||
    value.format !== BACKUP_FORMAT ||
    value.version !== BACKUP_VERSION ||
    !isRecord(value.tables)
  ) {
    throw new Error('Unsupported or invalid Royal Hints backup file.');
  }

  const tables = value.tables;
  const names = Object.keys(tables);
  if (
    names.length !== BACKUP_TABLES.length ||
    !BACKUP_TABLES.every(table => names.includes(table) && Array.isArray(tables[table]))
  ) {
    throw new Error('Backup is incomplete or contains unsupported tables.');
  }

  return value as BackupDocument;
};

const normalizeJson = (value: unknown) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
};

const normalizeDateForMariaDb = (value: unknown) => {
  if (value === null || value === undefined || value instanceof Date) return value;
  if (typeof value !== 'string') return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid date value in backup: ${value}`);
  return parsed.toISOString().slice(0, 23).replace('T', ' ');
};

export async function exportDatabaseBackup(): Promise<BackupDocument> {
  const client = await pool.getConnection();
  try {
    await client.beginTransaction();
    const tables: Record<string, unknown[]> = {};
    for (const table of BACKUP_TABLES) {
      const [rows] = await client.query<RowDataPacket[]>(`SELECT * FROM \`${table}\``);
      tables[table] = rows.map(row => {
        const normalized = { ...row };
        for (const column of JSON_COLUMNS[table] || []) {
          if (column in normalized) normalized[column] = normalizeJson(normalized[column]);
        }
        return normalized;
      });
    }
    await client.commit();
    return {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      createdAt: new Date().toISOString(),
      tables
    };
  } catch (error) {
    await client.rollback();
    throw error;
  } finally {
    client.release();
  }
}

export async function restoreDatabaseBackup(value: unknown): Promise<Record<string, number>> {
  const backup = validateBackup(value);
  const client = await pool.getConnection();
  try {
    await client.beginTransaction();

    const columnsByTable = new Map<string, DatabaseColumn[]>();
    for (const table of BACKUP_TABLES) {
      const columns = await getColumns(client, table);
      if (columns.length === 0) throw new Error(`MariaDB table "${table}" is not available.`);
      const knownColumns = new Set(columns.map(column => column.column_name));

      for (const [index, row] of backup.tables[table].entries()) {
        if (!isRecord(row)) throw new Error(`Invalid row ${index + 1} in backup table "${table}".`);
        const keys = Object.keys(row);
        if (keys.length !== columns.length || keys.some(key => !knownColumns.has(key))) {
          throw new Error(`Backup table "${table}" does not match the MariaDB schema.`);
        }
      }
      columnsByTable.set(table, columns);
    }

    for (const table of [...BACKUP_TABLES].reverse()) {
      await client.query(`DELETE FROM \`${table}\``);
    }
    await client.query('DELETE FROM `rh_user_sessions`');

    const importedCounts: Record<string, number> = {};
    for (const table of BACKUP_TABLES) {
      const columns = columnsByTable.get(table);
      if (!columns) throw new Error(`Backup table "${table}" was not validated.`);
      const columnNames = columns.map(column => column.column_name);
      const quotedColumns = columnNames.map(column => `\`${column}\``).join(', ');
      const placeholders = columnNames.map(() => '?').join(', ');
      const insert = `INSERT INTO \`${table}\` (${quotedColumns}) VALUES (${placeholders})`;

      for (const row of backup.tables[table]) {
        if (!isRecord(row)) throw new Error(`Backup table "${table}" was not validated.`);
        const values = columns.map(({ column_name }) => {
          const value = row[column_name];
          if (DATE_COLUMNS.has(column_name)) return normalizeDateForMariaDb(value);
          if (JSON_COLUMNS[table]?.has(column_name) && value !== null) {
            return JSON.stringify(normalizeJson(value));
          }
          return value;
        });
        await client.query(insert, values);
      }
      importedCounts[table] = backup.tables[table].length;
    }

    await client.commit();
    return importedCounts;
  } catch (error) {
    await client.rollback();
    throw error;
  } finally {
    client.release();
  }
}
