import { Router, Request, Response } from 'express';
import { databaseStore } from '../db/store';
import { Product } from '../types';

export const persistenceRouter = Router();

persistenceRouter.get('/cart/:userId', async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await databaseStore.getCart(String(req.params.userId)) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

persistenceRouter.put('/cart/:userId', async (req: Request, res: Response) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items as Product[] : [];
    res.json({ success: true, data: await databaseStore.saveCart(String(req.params.userId), items) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

persistenceRouter.get('/photos/:userId', async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await databaseStore.getPhotoHistory(String(req.params.userId)) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

persistenceRouter.post('/photos', async (req: Request, res: Response) => {
  try {
    res.status(201).json({ success: true, data: await databaseStore.addPhotoHistory(req.body) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

persistenceRouter.get('/notifications/:userId', async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await databaseStore.getNotificationReads(String(req.params.userId)) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

persistenceRouter.put('/notifications/:userId', async (req: Request, res: Response) => {
  try {
    const ids = Array.isArray(req.body.notificationIds) ? req.body.notificationIds : [];
    res.json({ success: true, data: await databaseStore.saveNotificationReads(String(req.params.userId), ids) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});