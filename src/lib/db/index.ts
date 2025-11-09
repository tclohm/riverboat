import { DatabaseClient } from './client';
export * from './schema';

let clientInitialized = false;

// For async contexts
export async function getDb(platform?: any) {
  const mode = import.meta.env.MODE;
  const client = DatabaseClient.getInstance();
  
  if (!clientInitialized) {
    await client.initialize(mode, platform);
    clientInitialized = true;
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
