import { getDb } from '$lib/db';
import { notifications } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ platform, cookies, locals }) {
  // If user is already loaded in locals, use it
  let user = locals.user || null;

  
  // If user is authenticated, get their notifications
  if (user) {
    try {
      const db = await getDb(platform);
      
      // Get recent notifications
      const userNotifications = await db.select()
        .from(notifications)
        .where(eq(notifications.userId, user.id))
        .orderBy(notifications.createdAt, 'desc')
        .limit(10)
        .all();
      
      // Count unread notifications
      const unreadCount = userNotifications.filter(n => !n.read).length;
      
      return {
        user,
        notifications: userNotifications,
        unreadCount
      };
    } catch (error) {
      console.error('Failed to load notifications:', error);
      return { user };
    }
  }
  
  return { user: null };
}
