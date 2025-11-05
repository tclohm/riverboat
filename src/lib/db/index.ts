import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { passes } from './schema';

const sqlite = new Database('local.db');
export const db = drizzle(sqlite);

export { passes };
