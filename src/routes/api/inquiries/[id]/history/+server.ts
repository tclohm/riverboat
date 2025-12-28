import { getDb } from '$lib/db';
import { inquiries, inquiryEvents, user } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function GET({ params, platform, locals }) {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const inquiryId = parseInt(params.id);
  
  if (!inquiryId) {
    return json({ error: 'Invalid inquiry ID' }, { status: 400 });
  }

  try {
    const db = await getDb(platform);

    // Get the inquiry to verify access
    const inquiry = await db.select()
      .from(inquiries)
      .where(eq(inquiries.id, inquiryId))
      .get();

    if (!inquiry) {
      return json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Verify user has access (either sender or receiver)
    if (inquiry.senderUserId !== locals.user.id && inquiry.receiverUserId !== locals.user.id) {
      return json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all events for this inquiry
    const events = await db.select({
      event: inquiryEvents,
      actor: user
    })
    .from(inquiryEvents)
    .leftJoin(user, eq(inquiryEvents.actorUserId, user.id))
    .where(eq(inquiryEvents.inquiryId, inquiryId))
    .orderBy(desc(inquiryEvents.createdAt))
    .all();

    // Transform the data
    const transformedEvents = events.map(e => ({
      id: e.event.id,
      eventType: e.event.eventType,
      actorName: e.actor?.name || 'Unknown',
      actorId: e.event.actorUserId,
      metadata: e.event.metadata ? JSON.parse(e.event.metadata) : null,
      createdAt: e.event.createdAt
    }));

    return json({
      inquiryId,
      events: transformedEvents
    });

  } catch (error) {
    console.error('Failed to get inquiry history:', error);
    return json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
