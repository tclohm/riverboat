import { getDb } from '$lib/db';
import { passes } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';

export async function load({ params, platform, locals }) {

  if (!locals.user) {
    throw redirect(303, `/login?redirect=/pass/${params.id}/edit`);
  }

  const db = await getDb(platform);
  const pass = await db.select().from(passes).where(eq(passes.id, parseInt(params.id))).get();
  
  if (!pass) {
    throw error(404, 'Pass not found');
  }

  if (pass.userId !== locals.user.id) {
    throw error(403, 'You do not have permission to edit this pass');
  }
  
  return { pass };
}

export const actions = {
  update: async ({ request, params, platform, locals }) => {
    
    if (!locals.user) {
      throw redirect(303, '/login');
    }

    // verify pass exists and belongs to user
    const db = await getDb(platform);
    const pass = await db.select().from(passes).where(eq(passes.id, parseInt(params.id))).get();

    if (!pass) {
      throw error(404, 'Pass not found');
    }

    if (pass.userId != locals.user.id) {
      throw error(403, 'You do not have permission to edit this pass');
    }

    const data = await request.formData();
    const title = data.get('title')?.toString();
    const passType = data.get('passType')?.toString();
    const price = parseInt(data.get('price')?.toString() || '0');

    // Validate - no longer require owner
    if (!title || !passType || !price) {
      return fail(400, { error: 'All fields are required' });
    }

    // Update in database - keep owner as is, don't update it
    await db.update(passes)
      .set({
        title,
        passType,
        price,
      })
      .where(eq(passes.id, parseInt(params.id)))
      .run();

    // Redirect back to detail page
    throw redirect(303, `/pass/${params.id}`);
  },
  // Delete
  delete: async ({ params, platform, locals }) => {

    if (!locals.user) {
      throw redirect(303, '/login');
    }

    // verify pass exists and belongs to user
    const db = await getDb(platform);
    const pass = await db.select().from(passes).where(eq(passes.id, parseInt(params.id))).get();

    if (!pass) {
      throw error(404, 'Pass not found');
    }

    if (pass.userId != locals.user.id) {
      throw error(403, 'You do not have permission to delete this pass');
    }

    await db.delete(passes)
      .where(eq(passes.id, parseInt(params.id)))
      .run();

    throw redirect(303, '/admin');
  }
};
