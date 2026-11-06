import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool as PostgresPool } from 'pg';
import { pool as mariaDbPool } from '../src/db';
import { databaseStore } from '../backend/db/store';
import { exportDatabaseBackup, restoreDatabaseBackup } from '../backend/db/backup-service';
import { BACKUP_FORMAT, BACKUP_TABLES, BACKUP_VERSION } from '../backend/db/backup-format';

const backupDirectory = path.resolve(process.cwd(), 'backup');

const main = async () => {
  const sourceUrl = process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL;
  if (!sourceUrl) {
    throw new Error('Set POSTGRES_DATABASE_URL (or the existing DATABASE_URL) to the current PostgreSQL connection string.');
  }

  const source = new URL(sourceUrl);
  if (source.protocol !== 'postgres:' && source.protocol !== 'postgresql:') {
    throw new Error('The source database URL must use postgres:// or postgresql://.');
  }

  const postgresPool = new PostgresPool({
    connectionString: sourceUrl,
    ssl: process.env.POSTGRES_SSL === 'true' || source.searchParams.get('sslmode') === 'require' || source.hostname.includes('render.com')
      ? { rejectUnauthorized: false }
      : undefined,
    connectionTimeoutMillis: 15000
  });

  try {
    const client = await postgresPool.connect();
    let transactionStarted = false;
    let backup: {
      format: string;
      version: number;
      createdAt: string;
      tables: Record<string, unknown[]>;
    };

    try {
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      transactionStarted = true;
      const tables: Record<string, unknown[]> = {};
      for (const table of BACKUP_TABLES) {
        const { rows } = await client.query(`SELECT * FROM "${table}"`);
        tables[table] = rows;
      }
      await client.query('COMMIT');
      transactionStarted = false;
      backup = {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        createdAt: new Date().toISOString(),
        tables
      };
    } catch (error) {
      if (transactionStarted) await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    await mkdir(backupDirectory, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDirectory, `royal-hints-postgres-migration-${timestamp}.json`);
    await writeFile(backupPath, `${JSON.stringify(backup, null, 2)}\n`, { flag: 'wx' });
    console.log(`PostgreSQL snapshot saved before import: ${path.relative(process.cwd(), backupPath)}`);

    await databaseStore.ensureSeeded();
    const importedCounts = await restoreDatabaseBackup(backup);
    const actualCounts = await exportDatabaseBackup();
    for (const table of BACKUP_TABLES) {
      if (actualCounts.tables[table].length !== importedCounts[table]) {
        throw new Error(`Verification failed for ${table}: imported ${importedCounts[table]}, found ${actualCounts.tables[table].length}.`);
      }
    }

    const total = Object.values(importedCounts).reduce((sum, count) => sum + count, 0);
    console.log(`Migration verified: ${total} records copied into MariaDB.`);
    console.log('The PostgreSQL source has not been changed. Keep the saved snapshot securely.');
  } finally {
    await postgresPool.end();
    await mariaDbPool.end();
  }
};

main().catch(error => {
  console.error(`PostgreSQL to MariaDB migration failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
