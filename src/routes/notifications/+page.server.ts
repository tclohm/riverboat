import { getDb } from '$lib/db';
import { notifications, inquiries, passes } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

// archive notification immediately (for declined requests)
export async function POST({ params, platform, locals }) {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const notificationId = parseInt(params.id);

  if (!notificationId) {
    return json({ error: 'Invalid notification ID', { status: 400 }});
  }

  try {
    const db = await getDb(platform);

    await db.update(notification)
      .set({
        archived: true,
        archivedAt: new Date()
      })
      .where(eq(notification.id, notificationId))
      .run()

    return json({ success: true });
  } catch (error) {
    console.error('Failed to archive notifications:', error);
    return json({ error: 'Failed to archive notification' }, { status: 500 });
  }
}

export async function load({ platform, locals }) {
  // Check if user is logged in
  if (!locals.user) {
    throw redirect(303, '/login?returnTo=/notifications');
  }
  
  try {
    const db = await getDb(platform);
    
    // Get all notifications for the user
    const userNotifications = await db.select()
      .from(notifications)
      .where(eq(notifications.userId, locals.user.id))
      .orderBy(desc(notifications.createdAt))
      .all();
    
    // Mark all as read
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, locals.user.id))
      .run();
    
    // Get all inquiries for the user's passes
    const userInquiries = await db.select({
      inquiry: inquiries,
      pass: passes
    })
      .from(inquiries)
      .leftJoin(passes, eq(inquiries.passId, passes.id))
      .where(eq(inquiries.receiverUserId, locals.user.id))
      .orderBy(desc(inquiries.createdAt))
      .all();
    
    return {
      notifications: userNotifications,
      inquiries: userInquiries
    };
  } catch (error) {
    console.error('Failed to load notifications page:', error);
    return { notifications: [], inquiries: [] };
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
    
    if (!inquiryId || !status) {
      return { error: 'Invalid input' };
    }
    
    try {
      const db = await getDb(platform);
      
      // Update the inquiry status
      const inquiry = await db.select()
        .from(inquiries)
        .where(eq(inquiries.id, inquiryId))
        .get();

      if (!inquiry) {
        return { error : 'Inquiry not found' };
      }

      const pass = await db.select()
        .from(passes)
        .where(eq(passes.id, inquiry.passId))
        .get();
      // send status
      await db.update(inquiries)
        .set({
          status,
          updatedAt: new Date()
        })
        .where(eq(inquiries.id, inquiryId))
        .run();

      // send notification to the requester
      const statusMessage = status === 'approved' ? 'approved' : 'declined';
      const notificationTitle = status === 'approved' ? 'Request Approved!' : 'Request Declined';
      const notificationMessage = `Your request for "${pass?.title || 'a pass'}" has been ${statusMessage}.`;
      await db.insert(notifications).values({
        userId: inquiry.senderUserId,
        passId: inquiry.passId,
        type: 'inquiry',
        title: notificationTitle,
        message: notificationMessage,
        read: false,
        createdAt: new Date(),
        metadata: JSON.stringify({
          inquiryId: inquiryId,
          status
        })
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
      return { error: 'Failed to update status' };
    }
  }
};
