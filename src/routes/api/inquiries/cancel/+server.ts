import { getDb } from '$lib/db';
import { inquiries, passes, notifications } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { removeBookedDateRange, parseRequestedDatesToRange } from '$lib/server/dateUtils';

export async function POST({ request, platform, locals }) {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { inquiryId } = await request.json();

    if (!inquiryId) {
      return json({ error: 'Inquiry ID is required' }, { status: 400 });
    }

    const db = await getDb(platform);

    // Get the inquiry
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

    // Can cancel pending or approved inquiries
    if (!['pending', 'approved'].includes(inquiry.status)) {
      return json({ error: 'Can only cancel pending or approved requests' }, { status: 400 });
    }

    // If approved, remove from booked dates
    if (inquiry.status === 'approved') {
      const pass = await db.select()
        .from(passes)
        .where(eq(passes.id, inquiry.passId))
        .get();

      if (pass && inquiry.requestedDates) {
        const dateRange = parseRequestedDatesToRange(inquiry.requestedDates);
        if (dateRange) {
          const updatedBookedDates = removeBookedDateRange(
            pass.bookedDates,
            dateRange.start,
            dateRange.end
          );

          await db.update(passes)
            .set({ bookedDates: updatedBookedDates })
            .where(eq(passes.id, inquiry.passId))
            .run();
        }
      }
    }

    // Update inquiry status to rejected/cancelled
    await db.update(inquiries)
      .set({
        status: 'rejected',
        updatedAt: new Date()
      })
      .where(eq(inquiries.id, inquiryId))
      .run();

    // Notify the pass owner about cancellation
    await db.insert(notifications).values({
      userId: inquiry.receiverUserId,
      type: 'inquiry_cancelled',
      title: 'Booking Cancelled',
      message: `A booking request has been cancelled by the guest`,
      read: false,
      archived: false,
      relatedId: inquiryId,
      createdAt: new Date(),
      metadata: JSON.stringify({
        inquiryId: inquiryId,
        passId: inquiry.passId,
        requestedDates: inquiry.requestedDates
      })
    }).run();

    return json({ success: true });
  } catch (error) {
    console.error('Failed to cancel inquiry:', error);
    return json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
