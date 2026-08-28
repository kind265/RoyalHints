import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config({ path: 'backend/.env' });
dotenv.config();

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL;
    const sslEnabled = process.env.DATABASE_SSL !== 'false' && (
      process.env.DATABASE_SSL === 'true' ||
      connectionString?.includes('sslmode=require') ||
      connectionString?.includes('render.com')
    );

    global._postgresPool = connectionString
      ? new Pool({
          connectionString,
          max: 10,
          connectionTimeoutMillis: 15000,
          ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
        })
      : new Pool({
          host: process.env.SQL_HOST,
          user: process.env.SQL_USER,
          password: process.env.SQL_PASSWORD,
          database: process.env.SQL_DB_NAME,
          max: 10,
          connectionTimeoutMillis: 15000,
        });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export { pool };
export const db = drizzle(pool, { schema });
