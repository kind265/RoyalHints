import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: 'backend/.env' });

dotenv.config();

const email = (process.env.ADMIN_EMAIL || 'chikusehopeson@gmail.com').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || 'hopeson@gmail.com@415';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : undefined
});

try {
  await pool.query(
    `INSERT INTO users (id, email, username, password_hash, role, is_admin, name)
     VALUES ($1, $2, $3, $4, 'ADMIN', true, $5)
     ON CONFLICT (email) DO UPDATE SET
       username = EXCLUDED.username,
       password_hash = EXCLUDED.password_hash,
       role = 'ADMIN',
       is_admin = true,
       name = EXCLUDED.name`,
    [randomUUID(), email, email.split('@')[0], password, 'Chikuse Hopeson (Administrator)']
  );
  console.log(`Admin seeded: ${email}`);
} finally {
  await pool.end();
}
