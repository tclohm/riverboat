import { getDb, initializeDb } from '../src/lib/db/index';
import { passes } from '../src/lib/db/schema';

async function testDb() {
  try {
    console.log('Initializing database...');
    await initializeDb();
    
    console.log('Getting database connection...');
    const db = await getDb();
    
    console.log('Querying database...');
    const result = await db.select().from(passes);
    
    console.log('Query result:', result);
    console.log(`Found ${result.length} passes in the database`);
    
    return true;
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
}

testDb()
  .then(success => {
    console.log('Database test completed:', success ? 'SUCCESS' : 'FAILED');
    process.exit(success ? 0 : 1);
  });
