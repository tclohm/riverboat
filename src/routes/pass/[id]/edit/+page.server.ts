import { getDb } from '$lib/db';
import { passes } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';

export async function load({ params, platform }) {
  const db = await getDb(platform);
  const pass = await db.select().from(passes).where(eq(passes.id, parseInt(params.id))).get();
  
  if (!pass) {
    throw error(404, 'Pass not found');
  }
  
  return { pass };
}

export const actions = {
  update: async ({ request, params, platform }) => {
    const data = await request.formData();
    
    const title = data.get('title')?.toString();
    const owner = data.get('owner')?.toString();
    const passType = data.get('passType')?.toString();
    const price = parseInt(data.get('price')?.toString() || '0');
    const availableDates = data.get('availableDates')?.toString();

    // Validate
    if (!title || !owner || !passType || !price || !availableDates) {
      return fail(400, { error: 'All fields are required' });
    }

    // Update in database
    const db = await getDb(platform);
    await db.update(passes)
      .set({
        title,
        owner,
        passType,
        price,
        availableDates
      })
      .where(eq(passes.id, parseInt(params.id)))
      .run();

    // Redirect back to detail page
    throw redirect(303, `/pass/${params.id}`);
  },
  // Delete
  delete: async ({ params, platform }) => {
    const db = await getDb(platform);

    await db.delete(passes)
      .where(eq(passes.id, parseInt(params.id)))
      .run();

    throw redirect(303, '/');
  }
};
