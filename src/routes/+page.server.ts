import { db, passes } from '$lib/db';

export async function load() {
  const allPasses = db.select().from(passes).all()
  return { passes: allPasses };
}
