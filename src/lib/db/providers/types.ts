export interface DbProvider {
  connect(): Promise<any>;
  getDb(): any;
  isConnected(): boolean;
  disconnect(); Promise<void>;
}

// ensure providers and db client has proper typing for all tables in schema
export interface DbSchema {
  passes: typeof import('../schema').passes;
  user: typeof import('../schema').user;
  session: typeof import('../schema').session;
  account: typeof import('../schema').account;
  verification: typeof import('../schema').verification;
}
