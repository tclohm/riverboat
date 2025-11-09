import { getDb } from '$lib/db';
import { passes } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  create: async ({ request, platform }) => {
    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const owner = formData.get('owner')?.toString();
    const price = parseInt(formData.get('price')?.toString() || '0');
    const passType = formData.get('passType')?.toString();
    const availableDates = formData.get('availableDates')?.toString();

    if (!title || !owner || !price || !passType || !availableDates) {
      return fail(400, { 
        error: 'All fields are required',
        values: { title, owner, price, passType, availableDates }
      });
    }

    try {
      const db = await getDb(platform);
      
      await db.insert(passes).values({
        title,
        owner,
        price,
        passType,
        availableDates
      });

      // Redirect to home page
      throw redirect(303, '/');
    } catch (error) {
      console.error('Failed to create pass:', error);
      return fail(500, { 
        error: 'Failed to create pass. Please try again.',
        values: { title, owner, price, passType, availableDates }
      });
    }
  },
  
  delete: async ({ request, platform }) => {
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
  }
};
