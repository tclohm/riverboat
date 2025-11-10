import { DatabaseClient } from '$lib/db/client';
import { passes } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ platform, locals }) {
  const mode = import.meta.env.MODE;
  const client = DatabaseClient.getInstance();
  const db = client.getDb();

  const allPasses = await db.select().from(passes).all()

  return { 
    passes: allPasses,
    user: locals.user
  };
}
