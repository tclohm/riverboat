import { DatabaseClient } from './client';
import { setupTestDb } from './test-db';
export * from './schema';

let clientInitialized = false;

const isTest = process.env.NODE_ENV === 'test';
let testDbInstance: any = null;

// For async contexts
export async function getDb(platform?: any) {
  if (isTest) {
    if (!testDbInstance) {
      const { db } = await setupTestDb();
      testDbInstance = db;
    }
    return testDbInstance;
  }


  const mode = import.meta.env.MODE;
  console.log(`Getting DB in mode: ${mode}`);

  const client = DatabaseClient.getInstance();
  
  if (!clientInitialized) {
    console.log("Initializing DB client...");
    await client.initialize(mode, platform);
    clientInitialized = true;
    console.log("DB client initialized successfully");
  }
  
  return client.getDb();
}

// For sync contexts - note: this now requires initialize 
export function getDbSync(platform?: any) {
  try {
    const client = DatabaseClient.getInstance();
    return client.getDb();
  } catch (error) {
    console.error('Failed to get database synchronously:', error);
    throw new Error(`Database sync error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper to initialize DB in hooks.server.ts
export async function initializeDb(platform?: any) {
  if (isTest) {
    await setupTestDb();
    return;
  }
  if (clientInitialized) return;
  
  const mode = import.meta.env.MODE;
  const client = DatabaseClient.getInstance();
  await client.initialize(mode, platform);
  clientInitialized = true;
}
