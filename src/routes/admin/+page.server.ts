import { getDb } from '$lib/db';
import { passes } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function load({ platform, locals }) {
  if (!locals.user) {
    throw redirect(303, '/login?redirect=/admin');
  }

  const db = await getDb(platform);
  const userPasses = await db.select()
    .from(passes)
    .where(eq(passes.userId, locals.user.id))
    .all();

  return {
    passes: userPasses,
    user: locals.user
  };
}
