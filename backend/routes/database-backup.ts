import { Router, Request, Response } from 'express';
import { databaseStore } from '../db/store';
import { exportDatabaseBackup, restoreDatabaseBackup } from '../db/backup-service';

const getSessionUser = async (req: Request) => {
  const cookie = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith('royal_hints_session='));
  const token = cookie?.slice('royal_hints_session='.length);
  return token ? databaseStore.getSession(token) : undefined;
};

const requireAdmin = async (req: Request, res: Response) => {
  const user = await getSessionUser(req);
  if (!user || !(user.isAdmin || user.role === 'admin')) {
    res.status(403).json({ success: false, message: 'Administrator access is required.' });
    return false;
  }
  return true;
};

export const databaseBackupRouter = Router();

databaseBackupRouter.get('/', async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const backup = await exportDatabaseBackup();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="royal-hints-backup-${new Date().toISOString().slice(0, 10)}.json"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.json(backup);
  } catch (error) {
    console.error('MariaDB backup export failed:', error);
    return res.status(500).json({ success: false, message: 'Could not export the database backup.' });
  }
});

databaseBackupRouter.post('/restore', async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const importedCounts = await restoreDatabaseBackup(req.body);
    return res.json({
      success: true,
      message: 'Backup restored. Sign in again because existing sessions were cleared.',
      importedCounts
    });
  } catch (error) {
    console.error('MariaDB backup restore failed:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Could not restore the database backup.'
    });
  }
});
