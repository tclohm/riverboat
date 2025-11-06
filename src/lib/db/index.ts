import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { passes } from './schema';

// For local development
let localDB: ReturnType<typeof drizzleSqlite> | null = null;

export function getDB(platform?: any) {
  // Production: Use Cloudflare D1 
  if (platform?.env?.willies_key_db) {
    return drizzleD1(platform.env.willies_key_db);
  }

  // Local dev: Use better-sqlite3
  if (!localDB) {
    const sqlite = new Database('local.db');
    localDB = drizzleSqlite(sqlite);
  }
  return localDB
}

export { passes };
