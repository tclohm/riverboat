import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { passes } from './schema';

export function getDB(platform?: any) {
  // Production: Use Cloudflare D1
  if (platform?.env?.willies_keys_db) {
    return drizzleD1(platform.env.willies_keys_db);
  }
  
  const requireFunc = eval('require');
  const { drizzle: drizzleSqlite } = requireFunc('drizzle-orm/better-sqlite3');
  const Database = requireFunc('better-sqlite3');
  const sqlite = new Database('local.db');
  return drizzleSqlite(sqlite);
}

export { passes };
