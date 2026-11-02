import { Router, Request, Response } from 'express';
import { PoolClient } from 'pg';
import { pool } from '../../src/db';
import { postgresStore } from '../db/store';
import { BACKUP_FORMAT, BACKUP_TABLES, BACKUP_VERSION } from '../db/backup-format';

class BackupInputError extends Error {}

type DatabaseColumn = { column_name: string; data_type: string };
type BackupDocument = { format: string; version: number; tables: Record<string, unknown[]> };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isBackupDocument = (value: unknown): value is BackupDocument => {
  if (
    !isRecord(value) ||
    value.format !== BACKUP_FORMAT ||
    value.version !== BACKUP_VERSION ||
    !isRecord(value.tables)
  ) {
    return false;
  }
  const tableNames = Object.keys(value.tables);
  return tableNames.length === BACKUP_TABLES.length &&
    BACKUP_TABLES.every(table => tableNames.includes(table) && Array.isArray(value.tables[table]));
};

const getSessionUser = async (req: Request) => {
  const cookie = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith('royal_hints_session='));
  const token = cookie?.slice('royal_hints_session='.length);
  return token ? postgresStore.getSession(token) : undefined;
};

const requireAdmin = async (req: Request, res: Response) => {
  const user = await getSessionUser(req);
  if (!user || !(user.isAdmin || user.role === 'admin')) {
    res.status(403).json({ success: false, message: 'Administrator access is required.' });
    return false;
  }
  return true;
};

const getColumns = async (client: PoolClient, table: string) => {
  const result = await client.query<DatabaseColumn>(
    `SELECT column_name, data_type
     FROM information_schema.columns
     WHERE table_schema = current_schema() AND table_name = $1
     ORDER BY ordinal_position`,
    [table]
  );
  return result.rows;
};

export const databaseBackupRouter = Router();

databaseBackupRouter.get('/', async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const client = await pool.connect();
  let transactionStarted = false;
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    transactionStarted = true;
    const tables: Record<string, unknown[]> = {};
    for (const table of BACKUP_TABLES) {
      const result = await client.query(`SELECT * FROM "${table}"`);
      tables[table] = result.rows;
    }
    await client.query('COMMIT');
    transactionStarted = false;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="royal-hints-backup-${new Date().toISOString().slice(0, 10)}.json"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      createdAt: new Date().toISOString(),
      tables
    });
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK');
    console.error('Database backup export failed:', error);
    return res.status(500).json({ success: false, message: 'Could not export the database backup.' });
  } finally {
    client.release();
  }
});

databaseBackupRouter.post('/restore', async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const backup: unknown = req.body;
  if (!isBackupDocument(backup)) {
    return res.status(400).json({ success: false, message: 'This is not a supported Royal Hints backup file.' });
  }

  const client = await pool.connect();
  let transactionStarted = false;
  try {
    await client.query('BEGIN');
    transactionStarted = true;
    await client.query(`LOCK TABLE ${[...BACKUP_TABLES, 'rh_user_sessions'].map(table => `"${table}"`).join(', ')} IN ACCESS EXCLUSIVE MODE`);

    const columnsByTable = new Map<string, DatabaseColumn[]>();
    for (const table of BACKUP_TABLES) {
      const columns = await getColumns(client, table);
      if (columns.length === 0) {
        throw new Error(`Backup table "${table}" is not available in this database.`);
      }
      const knownColumns = new Set(columns.map(column => column.column_name));
      for (const [index, row] of backup.tables[table].entries()) {
        if (!isRecord(row)) {
          throw new BackupInputError(`Invalid row ${index + 1} in backup table "${table}".`);
        }
        const rowKeys = Object.keys(row);
        if (
          rowKeys.length !== columns.length ||
          rowKeys.some(key => !knownColumns.has(key))
        ) {
          throw new BackupInputError(`Backup table "${table}" does not match the database schema.`);
        }
      }
      columnsByTable.set(table, columns);
    }

    for (const table of [...BACKUP_TABLES].reverse()) {
      await client.query(`DELETE FROM "${table}"`);
    }
    await client.query('DELETE FROM "rh_user_sessions"');

    const importedCounts: Record<string, number> = {};
    for (const table of BACKUP_TABLES) {
      const columns = columnsByTable.get(table);
      if (!columns) throw new Error(`Backup table "${table}" was not validated.`);
      const columnNames = columns.map(column => column.column_name);
      const quotedColumns = columnNames.map(column => `"${column}"`).join(', ');
      const placeholders = columnNames.map((_, index) => `$${index + 1}`).join(', ');
      const insert = `INSERT INTO "${table}" (${quotedColumns}) VALUES (${placeholders})`;

      for (const row of backup.tables[table]) {
        if (!isRecord(row)) throw new Error(`Backup table "${table}" was not validated.`);
        const values = columns.map(({ column_name, data_type }) => {
          const value = row[column_name];
          return value !== null && (data_type === 'json' || data_type === 'jsonb')
            ? JSON.stringify(value)
            : value;
        });
        await client.query(insert, values);
      }
      importedCounts[table] = backup.tables[table].length;
    }

    await client.query('COMMIT');
    transactionStarted = false;
    return res.json({
      success: true,
      message: 'Backup restored. Sign in again because existing sessions were cleared.',
      importedCounts
    });
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK');
    console.error('Database backup restore failed:', error);
    if (error instanceof BackupInputError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Restore failed. The existing database was left unchanged.' });
  } finally {
    client.release();
  }
});
