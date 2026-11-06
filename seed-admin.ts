import dotenv from 'dotenv';
import { pool } from './src/db';
import { databaseStore } from './backend/db/store';

dotenv.config({ path: 'backend/.env' });
dotenv.config();

try {
  await databaseStore.ensureSeeded();
  console.log(`Admin seeded: ${(process.env.ADMIN_EMAIL || 'chikusehopeson@gmail.com').trim().toLowerCase()}`);
} finally {
  await pool.end();
}
