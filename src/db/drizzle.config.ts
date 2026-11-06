import * as dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });
dotenv.config();

const host = process.env.MYSQL_HOST;
const database = process.env.MYSQL_DATABASE;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;

if (!host || !database || !user || !password) {
  throw new Error('Set MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER, and MYSQL_PASSWORD to use Drizzle Kit.');
}

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host,
    port: Number(process.env.MYSQL_PORT || 3306),
    user,
    password,
    database,
    ssl: process.env.MYSQL_SSL === 'true' ? {} : undefined
  },
  verbose: true,
};
