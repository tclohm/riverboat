import { getDb } from '$lib/db';
import { notifications } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function load({ platform, cookies, locals }) {
  // If user is already loaded in locals, use it
  let user = locals.user || null;

  
  // If user is authenticated, get their notifications
  if (user) {
    try {
      const db = await getDb(platform);

      // Count 1: Pending inquiries (people want to use YOUR passes)
      const pendingInquiriesCount = await db.select()
        .from(inquiries)
        .where(
          and(
            eq(inquiries.receiverUserId, user.id),
            eq(inquiries.status, 'pending')
          )
        )
        .all();
      
      // Count 2: Unread notifications (responses to YOUR requests)
      const unreadNotifications = await db.select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, user.id),
            eq(notifications.read, false),
            eq(notifications.archived, false)
          )
        )
        .orderBy(notifications.createdAt, 'desc')
        .all();
      
      // Count unread notifications
      const unreadCount = pendingInquiriesCount.length + unreadNotifications.length;
      
      return {
        user,
        notifications: unreadNotifications,
        pendingInquiriesCount: pendingInquiriesCount,
        unreadCount
      };
    } catch (error) {
      console.error('Failed to load notifications:', error);
      return { user };
    }
  }
  
  return { user: null };
}
