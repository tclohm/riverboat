import { db, passes } from '$lib/db';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const pass = db.select().from(passes).where(eq(passes.id, parseInt(params.id))).get();

  if (!pass) {
    throw error(404, 'Pass not found');
  }

  return { pass };
}
