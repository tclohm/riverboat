import { getDb } from '$lib/db';
import { passes } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  if (!locals.user) {
    throw redirect(303, '/login?returnTo=/add');
  }

  return {
    user: locals.user
  }
}

export const actions = {
  create: async ({ request, platform, locals }) => {

    if (!locals.user) {
      throw redirect(303, '/login?redirect=/add');
    }
    
    console.log("Create action called!");
    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const price = parseInt(formData.get('price')?.toString() || '0');
    const passType = formData.get('passType')?.toString();
    const availableDates = formData.get('availableDates')?.toString();

    if (!title || !price || !passType || !availableDates) {
      return fail(400, { 
        error: 'All fields are required',
        values: { title, price, passType, availableDates }
      });
    }

    try {
      const db = await getDb(platform);
      
      await db.insert(passes).values({
        title,
        price,
        passType,
        availableDates,
        userId: locals.user.id
      });
    } catch (error) {
      console.error('Failed to create pass:', error);
      return fail(500, { 
        error: 'Failed to create pass. Please try again.',
        values: { title, price, passType, availableDates }
      });
    }

    throw redirect(303, '/admin');
  },
  
  delete: async ({ request, platform, locals }) => {

    if (!locals.user) {
      throw redirect(303, '/');
    }

    const formData = await request.formData();
    const id = parseInt(formData.get('id')?.toString() || '0');

    if (!id) {
      return fail(400, { error: 'Invalid pass ID' });
    }

    try {
      const db = await getDb(platform);
      
      // Delete the pass
      await db.delete(passes).where(eq(passes.id, id));
      
      // Return success
      return { success: true };
    } catch (error) {
      console.error('Failed to delete pass:', error);
      return fail(500, { error: 'Failed to delete pass. Please try again.' });
    }

    throw redirect(303, '/')
  }

};
