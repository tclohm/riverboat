import { getDb } from '$lib/db';
import { notifications, inquiries, passes } from '$lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function load({ platform, cookies, locals }) {
  // If user is already loaded in locals, use it
  let user = locals.user || null;

  let userPassCount = 0;

  // If user is authenticated, get their notifications and pass count
  if (user) {
    try {
      const db = await getDb(platform);

      // Count how many passes the user has created
      const userPasses = await db.select()
        .from(passes)
        .where(eq(passes.userId, user.id))
        .all();
      
      userPassCount = userPasses.length;

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
        userPassCount,
        notifications: unreadNotifications,
        unreadNotificationCount: unreadNotifications.length,
        pendingRequestCount: pendingRequests.length
      };
    } catch (error) {
      console.error('Failed to load layout data:', error);
      return { 
        user,
        userPassCount: 0,
        notifications: [],
        unreadNotificationCount: 0,
        pendingRequestCount: 0
      };
    }
  }
  
  return { 
    user: null,
    userPassCount: 0,
    notifications: [],
    unreadNotificationCount: 0,
    pendingRequestCount: 0
  };
}
