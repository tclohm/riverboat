import { getDb } from '$lib/db';
import { notifications } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser } from '$lib/server/auth';

export async function load({ platform, cookies, locals }) {
  // If user is already loaded in locals, use it
  console.log('Layout load called');
  console.log('locals.user:', locals.user?.email);
  let user = null;

  // always check the session cookie
  const token = cookies.get('session');
  console.log('User from session:', user?.email);

  if (token) {
    user = await getSessionUser(platform, token);
    console.log('Using user from locals:', user?.email)
  }
  
  // fallback to locals if we cant get from session
  if (!user && locals.user) {
    user = locals.user;
    console.log('Using from locals:', user?.email);
  }

  console.log('Final user in layout load:', user?.email);
  
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
