import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PoolClient } from 'pg';
import { pool } from '../src/db';
import { postgresStore } from '../backend/db/store';
import { BACKUP_FORMAT, BACKUP_TABLES, BACKUP_VERSION } from '../backend/db/backup-format';

type DatabaseColumn = { column_name: string; data_type: string };
type BackupDocument = {
  format: string;
  version: number;
  createdAt: string;
  tables: Record<string, unknown[]>;
};

const repositoryRoot = process.cwd();
const backupDirectory = path.join(repositoryRoot, 'backup');
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

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
  const tableNames = Object.keys(tables);
  if (
    tableNames.length !== BACKUP_TABLES.length ||
    !BACKUP_TABLES.every(table => tableNames.includes(table) && Array.isArray(tables[table]))
  ) {
    throw new Error('Backup is incomplete or contains unsupported tables.');
  }

  return value as BackupDocument;
};

const createBackup = async () => {
  await postgresStore.ensureSeeded();
  await mkdir(backupDirectory, { recursive: true });

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

    const backup: BackupDocument = {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      createdAt: new Date().toISOString(),
      tables
    };
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(backupDirectory, `royal-hints-backup-${timestamp}.json`);
    await writeFile(filePath, `${JSON.stringify(backup, null, 2)}\n`, { flag: 'wx' });
    console.log(`Backup saved: ${path.relative(repositoryRoot, filePath)}`);
    console.log('Keep this file private and store another copy outside this computer.');
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const resolveBackupFile = (fileArgument?: string) => {
  if (!fileArgument) {
    throw new Error('Specify a backup file inside the backup folder, for example: npm run db:restore -- backup\\royal-hints-backup-2026-11-02T07-30-00-000Z.json');
  }
  const filePath = path.resolve(repositoryRoot, fileArgument);
  const relativePath = path.relative(backupDirectory, filePath);
  if (
    !relativePath ||
    relativePath.startsWith(`..${path.sep}`) ||
    relativePath === '..' ||
    path.isAbsolute(relativePath) ||
    path.extname(filePath).toLowerCase() !== '.json'
  ) {
    throw new Error('Choose a .json backup file inside the repository backup folder.');
  }
  return filePath;
};

const confirmRestore = async () => {
  if (!stdin.isTTY) {
    throw new Error('Restore requires an interactive terminal so the destructive action can be confirmed.');
  }

  const terminal = createInterface({ input: stdin, output: stdout });
  try {
    const answer = await terminal.question('This replaces current database records. Type RESTORE to continue: ');
    if (answer.trim() !== 'RESTORE') {
      throw new Error('Restore cancelled.');
    }
  } finally {
    terminal.close();
  }
};

const restoreBackup = async (fileArgument?: string) => {
  const filePath = resolveBackupFile(fileArgument);
  const backup = validateBackup(JSON.parse(await readFile(filePath, 'utf8')));
  await confirmRestore();
  await postgresStore.ensureSeeded();

  const client = await pool.connect();
  let transactionStarted = false;
  try {
    await client.query('BEGIN');
    transactionStarted = true;
    await client.query(
      `LOCK TABLE ${[...BACKUP_TABLES, 'rh_user_sessions'].map(table => `"${table}"`).join(', ')} IN ACCESS EXCLUSIVE MODE`
    );

    const columnsByTable = new Map<string, DatabaseColumn[]>();
    for (const table of BACKUP_TABLES) {
      const columns = await getColumns(client, table);
      if (columns.length === 0) throw new Error(`Database table "${table}" is not available.`);
      const knownColumns = new Set(columns.map(column => column.column_name));

      for (const [index, row] of backup.tables[table].entries()) {
        if (!isRecord(row)) {
          throw new Error(`Invalid row ${index + 1} in backup table "${table}".`);
        }
        const rowKeys = Object.keys(row);
        if (rowKeys.length !== columns.length || rowKeys.some(key => !knownColumns.has(key))) {
          throw new Error(`Backup table "${table}" does not match the current database schema.`);
        }
      }
      columnsByTable.set(table, columns);
    }

    for (const table of [...BACKUP_TABLES].reverse()) {
      await client.query(`DELETE FROM "${table}"`);
    }
    await client.query('DELETE FROM "rh_user_sessions"');

    let importedRecords = 0;
    for (const table of BACKUP_TABLES) {
      const columns = columnsByTable.get(table);
      if (!columns) throw new Error(`Backup table "${table}" was not validated.`);
      const quotedColumns = columns.map(column => `"${column.column_name}"`).join(', ');
      const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
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
        importedRecords += 1;
      }
    }

    await client.query('COMMIT');
    transactionStarted = false;
    console.log(`Restore complete: ${importedRecords} records imported from ${path.relative(repositoryRoot, filePath)}.`);
    console.log('All previous login sessions were cleared. Sign in again to continue.');
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const main = async () => {
  const [command, fileArgument] = process.argv.slice(2);
  if (command === 'backup') {
    await createBackup();
  } else if (command === 'restore') {
    await restoreBackup(fileArgument);
  } else {
    throw new Error('Use "backup" or "restore <backup-file>". Run from the repository root.');
  }
};

main()
  .catch(error => {
    console.error(`Database backup error: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
