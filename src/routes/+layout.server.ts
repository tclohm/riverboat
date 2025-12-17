import { getDb } from '$lib/db';
import { notifications, inquiries, passes, user } from '$lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function load({ platform, locals }) {
  let user_data = locals.user || null;
  let allNotifications = [];
  let userPassCount = 0;

  if (user_data) {
    try {
      const db = await getDb(platform);

      // 1. Get system notifications (approval/decline responses)
      const systemNotifs = await db.select()
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

      console.log('[+layout.server] System notifications:', systemNotifs.length);

      // 2. Get UNREAD inquiries (incoming booking requests)
      const unreadInquiries = await db.select({
        inquiry: inquiries,
        pass: passes,
        sender: user
      })
        .from(inquiries)
        .leftJoin(passes, eq(inquiries.passId, passes.id))
        .leftJoin(user, eq(inquiries.senderUserId, user.id))
        .where(
          and(
            eq(inquiries.receiverUserId, user_data.id),
            eq(inquiries.read, false)
          )
        )
        .orderBy(desc(inquiries.createdAt))
        .all();

      console.log('[+layout.server] Unread inquiries:', unreadInquiries.length);

      // 3. Transform inquiries into notification format
      const transformedInquiries = unreadInquiries.map(item => ({
        id: `inq-${item.inquiry.id}`,
        type: 'inquiry',
        inquiryId: item.inquiry.id,
        userId: user_data.id,
        passId: item.pass?.id,
        title: 'New Booking Request',
        message: `New booking request from ${item.sender?.name || 'A user'} for "${item.pass?.title || 'a pass'}"`,
        read: false,
        archived: false,
        createdAt: item.inquiry.createdAt,
        metadata: JSON.stringify({
          inquiryId: item.inquiry.id,
          senderName: item.sender?.name,
          senderUserId: item.inquiry.senderUserId,
          requestedDates: item.inquiry.requestedDates,
          passTitle: item.pass?.title,
          status: item.inquiry.status
        })
      }));

      // 4. Combine system notifications + transformed inquiries
      allNotifications = [...systemNotifs, ...transformedInquiries].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      console.log('[+layout.server] Total notifications:', allNotifications.length);

      // 5. Count user passes
      const userPasses = await db.select()
        .from(passes)
        .where(eq(passes.userId, user_data.id))
        .all();
      
      userPassCount = userPasses.length;

    } catch (error) {
      console.error('[+layout.server] Error:', error);
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
