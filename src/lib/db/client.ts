import { DatabaseFactory } from './factory';
import type { DbProvider } from './providers/types';
import * as scheam from './schema';

export class DatabaseClient {
  private static instance: DatabaseClient | null = null;
  private provider: DbProvider | null = null;
  private _isInitialized = false;

  private constructor() {}

  static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  async initialize(mode: string, platform?: any): Promise<void> {
    if (this._isInitialized) return;

    try {
      this.provider = DatabaseFactory.createProvider(mode, platform);
      await this.provider.connect();
      this._isInitialized = true;
      console.log(`Database initialized in ${mode} mode`);
    } catch (error) {
      console.error('Failed to initialize database client:', error);
      throw new Error(`Database initialization error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getDb(): any {
    if (!this._isInitialized || !this.provider) {
      throw new Error('Database client not initialized. Call initialize() first.');
    }
    return this.provider.getDb();
  }

  async disconnect(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect();
      this._isInitialized = false;
      console.log('Database disconnected');
    }
  }

  get schema() {
    return schema;
  }
    
  get isInitialized(): boolean {
    return this._isInitialized;
  }
}
