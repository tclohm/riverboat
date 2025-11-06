import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { passes } from './schema';

let localDb: any = null;

export async function getDb(platform?: any) {
  const mode = import.meta.env.MODE;

  // Production: Use Cloudflare D1
  if (mode === 'production' && platform?.env?.willies_keys_db) {
    return drizzleD1(platform.env.willies_keys_db);
  }
  
  // Development mode: user better-sqlite3
  if (mode === 'development') {
    if (!localDb) {
      const { drizzle: drizzleSqlite } = await import('drizzle-orm/better-sqlite3');
      const DatabaseModule = await import('better-sqlite3');
      const Database = DatabaseModule.default || DatabaseModule;
      const sqlite = new Database('local.db');
      localDb = drizzleSqlite(sqlite);
    }
    return localDb;
  }
  
  throw new Error(`Database not configured for mode: ${mode}`);
}

export { passes };
