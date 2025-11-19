import { getDb } from '$lib/db';
import { notifications } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser } from '$lib/server/auth';

export async function load({ platform, cookies, locals }) {
  // If user is already loaded in locals, use it
  let user = null;
  // always check the session cookie
  const token = cookies.get('session');
  if (token) {
    user = await getSessionUser(platform, token);
  }

  if (!user && locals.user) {
    user = locals.user
  }
  
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
