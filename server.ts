import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createBackendApp } from './backend/app';
import { postgresStore } from './backend/db/store';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

async function startServer() {
  const app = createBackendApp();
  const PORT = Number(process.env.PORT) || 3000;

  try {
    await postgresStore.ensureSeeded();
  } catch (error) {
    console.error('Database initialization failed during startup:', error);
    process.exit(1);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: 24679 } },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
    app.use(express.static(distPath));

    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Royal Hints] Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();