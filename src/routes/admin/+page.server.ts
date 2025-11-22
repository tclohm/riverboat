import { getDb } from '$lib/db';
import { passes } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function load({ platform, locals }) {
  if (!locals.user) {
    throw redirect(303, '/login?redirect=/admin');
  }

  const db = await getDb(platform);
  
  // Check if user has created any passes
  const userPasses = await db.select()
    .from(passes)
    .where(eq(passes.userId, locals.user.id))
    .all();

  // If user has no passes, redirect them to add a pass
  if (userPasses.length === 0) {
    throw redirect(303, '/add');
  }

  return {
    passes: userPasses,
    user: locals.user
  };
}
