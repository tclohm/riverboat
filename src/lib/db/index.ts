import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { passes } from './schema';

let localDb: any = null;

// init local db at module load for dev 
const mode = import.meta.env.MODE;

if (mode === 'development') {
  try {
    const Database = await import('better-sqlite3').then(m => m.default);
    const { drizzle: drizzleSqlite } =  await import('drizzle-orm/better-sqlite3');
    const sqlite = new Database('local.db');
    localDb = drizzleSqlite(sqlite);
  } catch (e) {
    console.error('Failed to initialize local database:', e);
  }
}

// Regular page loads (async)
export async function getDb(platform?: any) {
   // Production: Use Cloudflare D1
  if (mode === 'production' && platform?.env?.willies_keys_db) {
    return drizzleD1(platform.env.willies_keys_db);
  }
  
  // Development mode: user better-sqlite3
  if (mode === 'development' && localDb) {
    return localDb;
  }
  
  throw new Error(`Database not configured for mode: ${mode}`);
}

// for auth (sync) - returns the already-initialized db
export function getDbSync(platform?: any) {
   if (mode === 'production' && platform?.env?.willies_keys_db) {
     return drizzleD1(platform.env.willies_keys_db);
   }

  if (mode === 'development' && localDb) {
    return localDb;
  }

  throw new Error(`Database not configured for mode: ${mode}`);
}

export { passes };
