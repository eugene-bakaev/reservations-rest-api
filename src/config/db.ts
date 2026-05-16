import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../db/schema';

export type DB = MySql2Database<typeof schema>;

let pool: mysql.Pool | null = null;
let dbInstance: DB | null = null;

export function getDb(databaseUrl: string): DB {
  if (!dbInstance) {
    pool = mysql.createPool(databaseUrl);
    dbInstance = drizzle(pool, { schema, mode: 'default' });
  }
  return dbInstance;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    dbInstance = null;
  }
}
