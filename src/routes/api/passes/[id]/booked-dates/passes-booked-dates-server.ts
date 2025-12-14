import { getDb } from '$lib/db';
import { passes } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function GET({ params, platform }) {
  const passId = parseInt(params.id);
  
  if (!passId) {
    return json({ error: 'Invalid pass ID' }, { status: 400 });
  }
  
  try {
    const db = await getDb(platform);
    
    const pass = await db.select()
      .from(passes)
      .where(eq(passes.id, passId))
      .get();
    
    if (!pass) {
      return json({ error: 'Pass not found' }, { status: 404 });
    }

    // Parse booked dates from JSON
    let bookedDates = [];
    try {
      bookedDates = pass.bookedDates ? JSON.parse(pass.bookedDates) : [];
    } catch {
      bookedDates = [];
    }

    return json({ bookedDates });
  } catch (error) {
    console.error('Failed to fetch booked dates:', error);
    return json({ error: 'Failed to fetch booked dates' }, { status: 500 });
  }
}
