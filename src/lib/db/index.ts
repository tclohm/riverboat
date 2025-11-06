import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { passes } from './schema';

export function getDB(platform?: any) {
  // Production: Use Cloudflare D1
  if (platform?.env?.willies_keys_db) {
    return drizzleD1(platform.env.willies_keys_db);
  }
  
 // Only attempt to load local DB if we're in Node.js environment
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const { localDb } = require('./local');
    return localDb;
  }
  
  throw new Error('Database not available');
}

export { passes };
