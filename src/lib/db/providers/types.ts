export interface DbProvider {
  connect(): Promise<any>;
  getDb(): any;
  isConnected(): boolean;
  disconnect(); Promise<void>;
}

export interface DbSchema {
  passes: typeof import('../schema').passes;
}
