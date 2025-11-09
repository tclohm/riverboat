import { drizzle } from 'drizzle-orm/d1';
import type { DbProvider } from './types';

export class D1Provider implements DbProvider {
  private db: any = null;
  private readonly d1Instance: any;

  constructor(d1Instance: any) {
    this.d1Instance = d1Instance;
  }

  async connect(): Promise<any> {
    if (this.db) return this.db;

    try {
      this.db = drizzle(this.d1Instance);
      return this.db;
    } catch (error) {
      console.error('Falied to connect to D1 database:', error);
      throw new Error(`D1 connection error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getDb: any {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  isConnected(): boolean {
    return !!this.db;
  }

  async disconnect(): Promise<void> {
    this.db = null;
  }
}
