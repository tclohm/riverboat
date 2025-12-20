import { DatabaseClient } from './client';
import { createMockDb } from './mock-db';
import { isMock } from './is-mock';
export * from './schema';

let clientInitialized = false;


// For async contexts
export async function getDb(platform?: any) {
  if (isMocked) return createMockDb();
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
  if (clientInitialized) return;
  
  const mode = import.meta.env.MODE;
  const client = DatabaseClient.getInstance();
  await client.initialize(mode, platform);
  clientInitialized = true;
}
