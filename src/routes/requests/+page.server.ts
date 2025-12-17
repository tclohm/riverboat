import { getDb } from '$lib/db';
import { inquiries, passes, user, notifications } from '$lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { parseRequestedDatesToRange, addBookedDateRange } from '$lib/server/dateUtils';

export async function load({ platform, locals }) {
  if (!locals.user) {
    throw redirect(303, '/login?returnTo=/requests');
  }
  
  try {
    const db = await getDb(platform);
    
    const userPasses = await db.select()
      .from(passes)
      .where(eq(passes.userId, locals.user.id))
      .all();

    if (userPasses.length === 0) {
      throw redirect(303, '/add');
    }
    
    // Get all inquiries for the user's passes
    const userInquiries = await db.select({
      inquiry: inquiries,
      pass: passes,
      sender: user
    })
    .from(inquiries)
    .leftJoin(passes, eq(inquiries.passId, passes.id))
    .leftJoin(user, eq(inquiries.senderUserId, user.id))
    .where(
      eq(inquiries.receiverUserId, locals.user.id)
    )
    .orderBy(desc(inquiries.createdAt))
    .all()

    // Mark all inquiry_new notifications as read (user is viewing the page)
    console.log('[requests/load] Marking inquiry notifications as read');
    await db.update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.userId, locals.user.id),
          eq(notifications.type, 'inquiry_new')
        )
      )
      .run();

    // Transform the data
    const transformedInquiries = userInquiries.map(item => ({
      ...item.inquiry,
      pass: item.pass,
      senderName: item.sender?.name
    }));
    
    return {
      inquiries: transformedInquiries
    };
  } catch (error) {
    console.error('Failed to load requests page:', error);
    return { inquiries: [] };
  }
}

export const actions = {
  updateInquiryStatus: async ({ request, platform, locals }) => {
    if (!locals.user) {
      throw redirect(303, '/login');
    }
    
    const formData = await request.formData();
    const inquiryId = parseInt(formData.get('inquiryId')?.toString() || '0');
    const status = formData.get('status')?.toString();

    console.log('[requests/updateInquiryStatus] Processing inquiry:', inquiryId, 'with status:', status);
    
    if (!inquiryId || !status || !['approved', 'rejected'].includes(status)) {
      return { error: 'Invalid input' };
    }
    
    try {
      const db = await getDb(platform);
      
      // Get inquiry and related data
      const inquiry = await db.select()
        .from(inquiries)
        .where(eq(inquiries.id, inquiryId))
        .get();

      if (!inquiry) {
        return { error: 'Inquiry not found' };
      }

      const pass = await db.select()
        .from(passes)
        .where(eq(passes.id, inquiry.passId))
        .get();

      if (!pass || pass.userId !== locals.user.id) {
        return { error: 'Unauthorized' };
      }
      
      const ownerUser = await db.select()
        .from(user)
        .where(eq(user.id, locals.user.id))
        .get();

      // 1. UPDATE INQUIRY STATUS
      console.log('[requests/updateInquiryStatus] Updating inquiry status to:', status);
      await db.update(inquiries)
        .set({
          status: status,
          updatedAt: new Date()
        })
        .where(eq(inquiries.id, inquiryId))
        .run();

      // 2. IF APPROVED, ADD BOOKED DATES
      if (status === 'approved' && inquiry.requestedDates) {
        const dateRange = parseRequestedDatesToRange(inquiry.requestedDates);
        
        if (dateRange) {
          console.log('[requests/updateInquiryStatus] Parsed date range:', dateRange);
          
          const updatedBookedDates = addBookedDateRange(
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

      // 3. CREATE NOTIFICATION FOR REQUESTER
      const notificationType = status === 'approved' ? 'inquiry_approved' : 'inquiry_rejected';
      const titleText = status === 'approved' ? 'Request Approved! ✓' : 'Request Declined';
      const messageText = `Your request for "${pass?.title || 'a pass'}" has been ${status}.`;
      
      console.log('[requests/updateInquiryStatus] Creating notification for', inquiry.senderUserId);
      
      await db.insert(notifications).values({
        userId: inquiry.senderUserId,
        type: notificationType,
        title: titleText,
        message: messageText,
        read: false,
        archived: false,
        relatedId: inquiryId,
        createdAt: new Date(),
        metadata: JSON.stringify({
          inquiryId: inquiryId,
          ownerName: ownerUser?.name,
          passTitle: pass?.title,
          passId: pass?.id,
          status: status
        })
      }).run();

      console.log('[requests/updateInquiryStatus] Successfully updated inquiry and created notification');
      return { success: true };
    } catch (error) {
      console.error('[requests/updateInquiryStatus] Error:', error);
      return { error: 'Failed to update status' };
    }
  }
};
