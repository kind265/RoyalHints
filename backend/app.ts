import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { productsRouter } from './routes/products';
import { postsRouter } from './routes/posts';
import { trackingRouter } from './routes/tracking';
import { quotationsRouter } from './routes/quotations';
import { bespokeRouter } from './routes/bespoke';
import { analyticsRouter } from './routes/analytics';
import { authRouter } from './routes/auth';
import { persistenceRouter } from './routes/persistence';
import { paymentsRouter } from './routes/payments';
import { subscriptionsRouter } from './routes/subscriptions';
import { pool } from '../src/db';

export function createBackendApp(): Express {
  const app = express();

  // Core Middleware
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Request Logging
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[API ${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Health Check
  app.get('/api/health', async (_req: Request, res: Response) => {
    try {
      const ping = await pool.query('SELECT 1 AS ok');
      const databaseHealthy = ping.rows?.[0]?.ok === 1;

      res.json({
        status: databaseHealthy ? 'online' : 'degraded',
        service: 'Royal Hints PostgreSQL Backend Engine',
        version: '2.0.0',
        database: databaseHealthy ? 'PostgreSQL (Cloud SQL) connected' : 'PostgreSQL unreachable',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Database health check failed:', error);
      res.status(503).json({
        status: 'offline',
        service: 'Royal Hints PostgreSQL Backend Engine',
        version: '2.0.0',
        database: 'PostgreSQL unreachable',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown database error'
      });
    }
  });

  // Register API Routers
  app.use('/api/products', productsRouter);
  app.use('/api/posts', postsRouter);
  app.use('/api/tracking', trackingRouter);
  app.use('/api/quotations', quotationsRouter);
  app.use('/api/bespoke', bespokeRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/persistence', persistenceRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/subscriptions', subscriptionsRouter);

  // 404 for unhandled API routes
  app.use('/api', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.originalUrl} not found`
    });
  });

  return app;
}
