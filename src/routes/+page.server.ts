import { passes } from '$lib/db/schema';
import { getDb } from '$lib/db';

export async function load({ platform, locals }) {
  const db = await getDb(platform)
  const allPasses = await db.select().from(passes).all()
  return { 
    passes: allPasses,
    user: locals.user // pass user data to page
  };
}
