import { drizzle } from 'drizzle-orm/mysql2';
import { createPool as createMySqlPool, Pool } from 'mysql2/promise';
import * as dotenv from 'dotenv';
import path from 'path';
import * as schema from './schema';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

declare global {
  var _mariaDbPool: Pool | undefined;
}

const getMariaDbOptions = () => {
  const host = process.env.MYSQL_HOST;
  const database = process.env.MYSQL_DATABASE;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;

  return {
    host: host || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: user || '__missing_mysql_user__',
    password: password || '',
    database: database || '__missing_mysql_database__',
    ssl: process.env.MYSQL_SSL === 'true' ? {} : undefined,
    connectionLimit: 10,
    connectTimeout: 15000,
    timezone: 'Z' as const
  };
};

export const createPool = () => {
  if (!global._mariaDbPool) {
    global._mariaDbPool = createMySqlPool(getMariaDbOptions());
  }
  return global._mariaDbPool;
};

export const pool = createPool();
export const db = drizzle(pool, { schema, mode: 'default' });
