import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../src/db';
import { databaseStore } from '../backend/db/store';
import { exportDatabaseBackup, restoreDatabaseBackup } from '../backend/db/backup-service';

const repositoryRoot = process.cwd();
const backupDirectory = path.join(repositoryRoot, 'backup');

const createBackup = async () => {
  await databaseStore.ensureSeeded();
  await mkdir(backupDirectory, { recursive: true });

  const backup = await exportDatabaseBackup();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(backupDirectory, `royal-hints-backup-${timestamp}.json`);
  await writeFile(filePath, `${JSON.stringify(backup, null, 2)}\n`, { flag: 'wx' });
  console.log(`Backup saved: ${path.relative(repositoryRoot, filePath)}`);
  console.log('Keep this file private and store another copy outside this computer.');
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
    if (answer.trim() !== 'RESTORE') throw new Error('Restore cancelled.');
  } finally {
    terminal.close();
  }
};

const restoreBackup = async (fileArgument?: string) => {
  const filePath = resolveBackupFile(fileArgument);
  const backup = JSON.parse(await readFile(filePath, 'utf8')) as unknown;
  await confirmRestore();
  await databaseStore.ensureSeeded();

  const importedCounts = await restoreDatabaseBackup(backup);
  const total = Object.values(importedCounts).reduce((sum, count) => sum + count, 0);
  console.log(`Restore complete: ${total} records imported from ${path.relative(repositoryRoot, filePath)}.`);
  console.log('All previous login sessions were cleared. Sign in again to continue.');
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
