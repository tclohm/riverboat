import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { passes } from './schema';

// For local development
let localDB: any = null;

export function getDB(platform?: any) {
  // Production: Use Cloudflare D1 
  if (platform?.env?.willies_key_db) {
    return drizzleD1(platform.env.willies_key_db);
  }

  // Local dev: Use better-sqlite3
  if (!localDB) {
    const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3');
    const Database = require('better-sqlite3');
    const sqlite = new Database('local.db');
    localDB = drizzleSqlite(sqlite);
  }

  return localDB
}

export { passes };
