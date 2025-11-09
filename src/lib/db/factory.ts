// src/lib/db/factory.ts
import type { DbProvider } from './providers/types';
import { SQLiteProvider } from './providers/sqlite-provider';
import { D1Provider } from './providers/d1-provider';

export class DatabaseFactory {
  static createProvider(mode: string, platform?: any): DbProvider {
    if (mode === 'production' && platform?.env?.willies_keys_db) {
      return new D1Provider(platform.env.willies_keys_db);
    }
    
    if (mode === 'development') {
      return new SQLiteProvider('local.db');
    }
    
    throw new Error(`Database provider not available for mode: ${mode}`);
  }
}
