import { getDb } from '$lib/db';
import { notifications, inquiries, passes } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

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
      await db.update(inquiries)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(eq(inquiries.id, inquiryId))
        .run();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
      return { error: 'Failed to update status' };
    }
  }
};
