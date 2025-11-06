import { getDb } from '$lib/db';
import { passes } from '$lib/db/schema';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, platform }) => {
    const data = await request.formData();

    const title = data.get('title')?.toString();
    const owner = data.get('owner')?.toString();
    const passType = data.get('passType')?.toString();
    const price = data.get('price')?.toString();
    const availableDates = data.get('availableDates')?.toString();

    // validate
    if (!title || !owner || !passType || !price || !availableDates) {
      return fail(400, { error: 'All fields are required' });
    }

    // insert into database
    const db = await getDb(platform);
    await db.insert(passes).values({
      title,
      owner,
      passType,
      price,
      availableDates
    }).run();

    // redirect to homepage 
    throw redirect(303, '/');
  }
};
