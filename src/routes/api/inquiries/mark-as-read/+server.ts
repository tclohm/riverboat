import { getDb } from '$lib/db';
import { inquiries } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function POST({ request, platform, locals }) {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { inquiryIds, status } = await request.json();

    if (!inquiryIds || !Array.isArray(inquiryIds) || inquiryIds.length === 0) {
      return json({ error: 'Invalid inquiry IDs' }, { status: 400 });
    }

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return json({ error: 'Invalid status' }, { status: 400 });
    }

    const db = await getDb(platform);

    // Mark all inquiries in this request as read
    // Only update if they belong to this user (safety check)
    for (const id of inquiryIds) {
      await db.update(inquiries)
        .set({ read: true })
        .where(
          and(
            eq(inquiries.id, id),
            eq(inquiries.senderUserId, locals.user.id),
            eq(inquiries.status, status)
          )
        )
        .run();
    }

    return json({ success: true });
  } catch (error) {
    console.error('Failed to mark inquiries as read:', error);
    return json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}
