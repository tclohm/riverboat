import { passes } from '$lib/db/schema';
import { getDb } from '$lib/db';

export async function load({ platform }) {
  const db = await getDb(platform)
  const allPasses = await db.select().from(passes).all()
  return { passes: allPasses };
}
