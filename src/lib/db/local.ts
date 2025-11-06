import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const sqlite = new Datebase('local.db');
export const localDB = drizzle(sqlite);
