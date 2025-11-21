import { getDb } from '$lib/db';
import { notifications, inquiries } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function load({ platform, cookies, locals }) {
  // If user is already loaded in locals, use it
  let user = locals.user || null;

  
  // If user is authenticated, get their notifications
  if (user) {
    try {
      const db = await getDb(platform);

      // Get unread notifications (for bell icon)
      const unreadNotifications = await db.select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, user.id),
            eq(notifications.read, false),
            eq(notifications.archived, false)
          )
        )
        .orderBy(desc(notifications.createdAt))
        .all();
      
      // Get pending requests count (for sidebar badge)
      const pendingRequests = await db.select()
        .from(inquiries)
        .where(
          and(
            eq(inquiries.receiverUserId, user.id),
            eq(inquiries.status, 'pending')
          )
        )
        .all();
      
      return {
        user,
        notifications: unreadNotifications,
        pendingInquiriesCount: unreadNotifications.length,
        pendingRequestCount: pendingRequests.length
      };
    } catch (error) {
      console.error('Failed to load notifications:', error);
      return { user };
    }
  }
  
  return { 
    user: null,
    notifications: [],
    unreadNotificationCount: 0,
    pendingRequestCount: 0
  };
}
