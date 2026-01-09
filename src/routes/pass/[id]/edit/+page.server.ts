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

  // Parse booked dates for the calendar
  let bookedDates: { start: string; end: string }[] = [];
  try {
    bookedDates = pass.bookedDates ? JSON.parse(pass.bookedDates) : [];
  } catch {
    bookedDates = [];
  }
  
  return { 
    pass,
    bookedDates
  };
}

export const actions = {
  update: async ({ request, params, platform, locals }) => {
    if (!locals.user) {
      throw redirect(303, '/login');
    }

    const db = await getDb(platform);
    const pass = await db.select().from(passes).where(eq(passes.id, parseInt(params.id))).get();

    if (!pass) {
      throw error(404, 'Pass not found');
    }

    if (pass.userId !== locals.user.id) {
      throw error(403, 'You do not have permission to edit this pass');
    }

    const data = await request.formData();
    const title = data.get('title')?.toString();
    const passType = data.get('passType')?.toString();
    const price = parseInt(data.get('price')?.toString() || '0');

    if (!title || !passType || !price) {
      return fail(400, { error: 'All fields are required' });
    }

    await db.update(passes)
      .set({
        title,
        passType,
        price,
      })
      .where(eq(passes.id, parseInt(params.id)))
      .run();

    throw redirect(303, `/pass/${params.id}`);
  },

  // Toggle a date range (block or unblock)
  toggleBlackout: async ({ request, params, platform, locals }) => {
    if (!locals.user) {
      throw redirect(303, '/login');
    }

    const db = await getDb(platform);
    const pass = await db.select().from(passes).where(eq(passes.id, parseInt(params.id))).get();

    if (!pass) {
      throw error(404, 'Pass not found');
    }

    if (pass.userId !== locals.user.id) {
      throw error(403, 'You do not have permission to edit this pass');
    }

    const data = await request.formData();
    const startDate = data.get('startDate')?.toString();
    const endDate = data.get('endDate')?.toString();

    if (!startDate || !endDate) {
      return fail(400, { error: 'Invalid dates' });
    }

    // Parse current booked dates
    let bookedDates: { start: string; end: string }[] = [];
    try {
      bookedDates = pass.bookedDates ? JSON.parse(pass.bookedDates) : [];
    } catch {
      bookedDates = [];
    }

    // Check if this exact range exists (to toggle off)
    const existingIndex = bookedDates.findIndex(
      range => range.start === startDate && range.end === endDate
    );

    if (existingIndex !== -1) {
      // Remove it (unblock)
      bookedDates.splice(existingIndex, 1);
    } else {
      // Add it (block)
      bookedDates.push({ start: startDate, end: endDate });
      
      // Sort by start date
      bookedDates.sort((a, b) => a.start.localeCompare(b.start));
      
      // Merge overlapping/adjacent ranges
      bookedDates = mergeRanges(bookedDates);
    }

    // Save back to database
    await db.update(passes)
      .set({ bookedDates: JSON.stringify(bookedDates) })
      .where(eq(passes.id, parseInt(params.id)))
      .run();

    return { success: true };
  },

  // Remove a specific blocked date range
  removeBlackout: async ({ request, params, platform, locals }) => {
    if (!locals.user) {
      throw redirect(303, '/login');
    }

    const db = await getDb(platform);
    const pass = await db.select().from(passes).where(eq(passes.id, parseInt(params.id))).get();

    if (!pass) {
      throw error(404, 'Pass not found');
    }

    if (pass.userId !== locals.user.id) {
      throw error(403, 'You do not have permission to edit this pass');
    }

    const data = await request.formData();
    const startDate = data.get('startDate')?.toString();
    const endDate = data.get('endDate')?.toString();

    if (!startDate || !endDate) {
      return fail(400, { error: 'Invalid dates' });
    }

    // Parse current booked dates
    let bookedDates: { start: string; end: string }[] = [];
    try {
      bookedDates = pass.bookedDates ? JSON.parse(pass.bookedDates) : [];
    } catch {
      bookedDates = [];
    }

    // Remove the matching range
    bookedDates = bookedDates.filter(
      range => !(range.start === startDate && range.end === endDate)
    );

    // Save back to database
    await db.update(passes)
      .set({ bookedDates: JSON.stringify(bookedDates) })
      .where(eq(passes.id, parseInt(params.id)))
      .run();

    return { success: true };
  },

  delete: async ({ params, platform, locals }) => {
    if (!locals.user) {
      throw redirect(303, '/login');
    }

    const db = await getDb(platform);
    const pass = await db.select().from(passes).where(eq(passes.id, parseInt(params.id))).get();

    if (!pass) {
      throw error(404, 'Pass not found');
    }

    if (pass.userId !== locals.user.id) {
      throw error(403, 'You do not have permission to delete this pass');
    }

    await db.delete(passes)
      .where(eq(passes.id, parseInt(params.id)))
      .run();

    throw redirect(303, '/admin');
  }
};

// Helper function to merge overlapping or adjacent date ranges
function mergeRanges(ranges: { start: string; end: string }[]): { start: string; end: string }[] {
  if (ranges.length === 0) return [];

  const sorted = ranges.sort((a, b) => a.start.localeCompare(b.start));
  const merged: { start: string; end: string }[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    // Check if overlapping or adjacent (within 1 day)
    const lastEnd = new Date(last.end);
    const currentStart = new Date(current.start);
    
    // Add 1 day to check adjacency
    lastEnd.setDate(lastEnd.getDate() + 1);

    if (currentStart <= lastEnd) {
      // Merge: extend end if needed
      if (current.end > last.end) {
        last.end = current.end;
      }
    } else {
      merged.push(current);
    }
  }

  return merged;
}
