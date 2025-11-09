import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { DbProvider } from './types';

export class SQLiteProvider implements DbProvider {
  private db: any = null;
  private readonly dbPath: string;

  constructor(dbPath: string = 'local.db') {
    this.dbPath = dbPath;
  }

  async connect(): Promise<any> {
    if (this.db) return this.db;

    try {
      const sqlite = new Database(this.dbPath);
      this.db = drizzle(sqlite);
    } catch (error) {
      console.error('Failed to connect to SQLite database:', error);
      throw new Error(`SQLite connection error: ${error instanceof Error ? error.message : String(error)};
      `);
    }
  }

  getDb(): any {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  isConnected(): boolean {
    return !!this.db;
  }

  async disconnect(): Promise<void> {
    if (this.db?.driver) {
      await this.db.driver.close();
      this.db = null;
    }
  }
}
