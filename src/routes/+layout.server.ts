import { getDb } from '$lib/db';
import { notifications, passes } from '$lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function load({ platform, locals }) {
  let user_data = locals.user || null;
  let allNotifications = [];
  let userPassCount = 0;

  if (user_data) {
    try {
      const db = await getDb(platform);

      // 1. FETCH ALL UNREAD NOTIFICATIONS (one query, one table)
      console.log('[+layout] Fetching notifications for user:', user_data.id);
      
      const notifs = await db.select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, user_data.id),
            eq(notifications.read, false),
            eq(notifications.archived, false)
          )
        )
        .orderBy(desc(notifications.createdAt))
        .all();

      allNotifications = notifs;
      console.log('[+layout] Found notifications:', allNotifications.length);

      // 2. COUNT USER PASSES
      const userPasses = await db.select()
        .from(passes)
        .where(eq(passes.userId, user_data.id))
        .all();
      
      userPassCount = userPasses.length;

    } catch (error) {
      console.error('[+layout] Error:', error);
      allNotifications = [];
      userPassCount = 0;
    }
  }

  return {
    user: user_data,
    notifications: allNotifications,
    unreadNotificationCount: allNotifications.length,
    userPassCount
  };
}
