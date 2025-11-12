import { passes } from '$lib/db/schema';
import { getDb } from '$lib/db';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ params, platform, locals }) {
  const db = await getDb(platform);
  const pass = await db.select().from(passes).where(eq(passes.id, parseInt(params.id))).get();

  if (!pass) {
    throw error(404, 'Pass not found');
  }

  return { pass,
    user: locals.user
  };
}
