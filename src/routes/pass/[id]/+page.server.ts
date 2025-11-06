import { passes } from '$lib/db/schema';
import { getDB } from '$lib/db';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ params, platform }) {
  const db = getDB(platform);
  const pass = await db.select().from(passes).where(eq(passes.id, parseInt(params.id))).get();

  if (!pass) {
    throw error(404, 'Pass not found');
  }

  return { pass };
}
