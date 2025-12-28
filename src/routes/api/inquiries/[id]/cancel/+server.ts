import { getDb } from '$lib/db';
import { inquiries, inquiryEvents, passes, user, notifications } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { parseRequestedDatesToRange, removeBookedDateRange } from '$lib/server/dateUtils';

export async function POST({ params, platform, locals }) {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const inquiryId = parseInt(params.id);
  
  if (!inquiryId) {
    return json({ error: 'Invalid inquiry ID' }, { status: 400 });
  }

  try {
    const db = await getDb(platform);

    // Get the inquiry
    const inquiry = await db.select()
      .from(inquiries)
      .where(eq(inquiries.id, inquiryId))
      .get();

    if (!inquiry) {
      return json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify the user owns this booking
    if (inquiry.senderUserId !== locals.user.id) {
      return json({ error: 'You can only cancel your own bookings' }, { status: 403 });
    }

    // Check if already cancelled or rejected
    if (inquiry.status === 'cancelled') {
      return json({ error: 'This booking is already cancelled' }, { status: 400 });
    }

    if (inquiry.status === 'rejected') {
      return json({ error: 'Cannot cancel a rejected booking' }, { status: 400 });
    }

    const wasApproved = inquiry.status === 'approved';

    // Get pass info
    const pass = await db.select()
      .from(passes)
      .where(eq(passes.id, inquiry.passId))
      .get();

    // If booking was approved, release the dates
    let releasedDates = null;
    if (wasApproved && pass && inquiry.requestedDates) {
      const dateRange = parseRequestedDatesToRange(inquiry.requestedDates);
      
      if (dateRange) {
        releasedDates = {
          start: dateRange.start,
          end: dateRange.end
        };

        const updatedBookedDates = removeBookedDateRange(
          pass.bookedDates,
          dateRange.start,
          dateRange.end
        );

        await db.update(passes)
          .set({ bookedDates: updatedBookedDates })
          .where(eq(passes.id, pass.id))
          .run();
      }
    }

    // Update inquiry status
    const now = new Date();
    await db.update(inquiries)
      .set({
        status: 'cancelled',
        cancelledAt: now,
        updatedAt: now
      })
      .where(eq(inquiries.id, inquiryId))
      .run();

    // Log the event
    await db.insert(inquiryEvents).values({
      inquiryId,
      eventType: 'cancelled',
      actorUserId: locals.user.id,
      metadata: JSON.stringify({
        previousStatus: inquiry.status,
        releasedDates,
        passId: inquiry.passId
      }),
      createdAt: now
    }).run();

    // Notify the pass owner
    const canceller = await db.select()
      .from(user)
      .where(eq(user.id, locals.user.id))
      .get();

    await db.insert(notifications).values({
      userId: inquiry.receiverUserId,
      type: 'inquiry_cancelled',
      title: 'Booking Cancelled',
      message: `${canceller?.name || 'A user'} cancelled their ${wasApproved ? 'approved booking' : 'request'} for "${pass?.title || 'a pass'}"${inquiry.requestedDates ? ` (${inquiry.requestedDates})` : ''}`,
      read: false,
      archived: false,
      relatedId: inquiryId,
      createdAt: now,
      metadata: JSON.stringify({
        inquiryId,
        cancellerName: canceller?.name,
        passTitle: pass?.title,
        passId: pass?.id,
        wasApproved,
        releasedDates
      })
    }).run();

    return json({ 
      success: true,
      message: wasApproved 
        ? 'Booking cancelled. The dates are now available again.' 
        : 'Request cancelled.'
    });

  } catch (error) {
    console.error('Failed to cancel booking:', error);
    return json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
