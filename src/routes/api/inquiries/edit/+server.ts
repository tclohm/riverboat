import { getDb } from '$lib/db';
import { inquiries } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function POST({ request, platform, locals }) {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { inquiryId, message, contactInfo, requestedDates } = await request.json();

    if (!inquiryId || !message || !contactInfo || !requestedDates) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb(platform);

    // Verify the inquiry belongs to the current user (sender)
    const inquiry = await db.select()
      .from(inquiries)
      .where(
        and(
          eq(inquiries.id, inquiryId),
          eq(inquiries.senderUserId, locals.user.id)
        )
      )
      .get();

    if (!inquiry) {
      return json({ error: 'Inquiry not found or unauthorized' }, { status: 404 });
    }

    // Can only edit pending inquiries
    if (inquiry.status !== 'pending') {
      return json({ error: 'Can only edit pending requests' }, { status: 400 });
    }

    // Update the inquiry
    await db.update(inquiries)
      .set({
        message,
        contactInfo,
        requestedDates,
        updatedAt: new Date()
      })
      .where(eq(inquiries.id, inquiryId))
      .run();

    return json({ success: true });
  } catch (error) {
    console.error('Failed to edit inquiry:', error);
    return json({ error: 'Failed to edit inquiry' }, { status: 500 });
  }
}
