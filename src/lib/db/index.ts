import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { passes } from './schema';

export function getDB(platform?: any) {
  // Production: Use Cloudflare D1
  if (platform?.env?.willies_keys_db) {
    return drizzleD1(platform.env.willies_keys_db);
  }
  
  // Local dev: Dynamically import the local db file
  // This prevents bundling in production
  const { localDb } = require('./local');
  return localDb;
}

export { passes };
