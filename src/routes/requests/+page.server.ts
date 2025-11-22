import { getDb } from '$lib/db';
import { inquiries, passes, user, notifications } from '$lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function load({ platform, locals }) {
  // Check if user is logged in
  if (!locals.user) {
    throw redirect(303, '/login?returnTo=/requests');
  }
  
  try {
    const db = await getDb(platform);
    
    // Get all inquiries for the user's passes, joined with pass and sender user info
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

    // Transform the data for the component
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
    // Check if user is logged in
    if (!locals.user) {
      throw redirect(303, '/login');
    }
    
    const formData = await request.formData();
    const inquiryId = parseInt(formData.get('inquiryId')?.toString() || '0');
    const status = formData.get('status')?.toString();

    console.log('Processing inquiry:', inquiryId, 'with status:', status);
    
    if (!inquiryId || !status) {
      return { error: 'Invalid input' };
    }
    
    try {
      const db = await getDb(platform);
      
      // Get the inquiry
      const inquiry = await db.select()
        .from(inquiries)
        .where(eq(inquiries.id, inquiryId))
        .get();

      if (!inquiry) {
        return { error: 'Inquiry not found' };
      }

      // Verify the user owns the pass
      const pass = await db.select()
        .from(passes)
        .where(eq(passes.id, inquiry.passId))
        .get();

      if (!pass || pass.userId !== locals.user.id) {
        return { error: 'Unauthorized' };
      }
      
      // Update inquiry status
      await db.update(inquiries)
        .set({
          status,
          updatedAt: new Date()
        })
        .where(eq(inquiries.id, inquiryId))
        .run();

      // Create notification for the requester
      const statusMessage = status === 'approved' ? 'approved' : 'declined';
      const notificationTitle = status === 'approved' ? 'Request Approved! ✓' : 'Request Declined';
      const notificationMessage = `Your request for "${pass?.title || 'a pass'}" has been ${statusMessage}.`;

      await db.insert(notifications).values({
        userId: inquiry.senderUserId,
        passId: inquiry.passId,
        type: 'inquiry',
        title: notificationTitle,
        message: notificationMessage,
        read: false,
        archived: false,
        createdAt: new Date(),
        metadata: JSON.stringify({
          inquiryId: inquiryId,
          status,
          requestedDates: inquiry.requestedDates
        })
      }).run();

      console.log('Successfully updated inquiry status and created notification');
      return { success: true };
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
      return { error: 'Failed to update status' };
    }
  }
};
