import { passes } from '$lib/db/schema';
import { getDB } from '$lib/db';

export async function load({ platform }) {
  const db = getDB(platform)
  const allPasses = await db.select().from(passes).all()
  return { passes: allPasses };
}
