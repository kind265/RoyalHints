import { Router, Request, Response } from 'express';
import { postgresStore } from '../db/store';

export const subscriptionsRouter = Router();

subscriptionsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    await postgresStore.subscribeToNewItems(email);
    res.status(201).json({ success: true, message: 'Subscription saved.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
