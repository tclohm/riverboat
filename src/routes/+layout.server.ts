import { getDb } from '$lib/db';
import { notifications, inquiries, passes, user } from '$lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function load({ platform, cookies, locals }) {
  // If user is already loaded in locals, use it
  let user_data = locals.user || null;

  let unreadNotifications = [];
  let unreadInquiries = [];

  // If user is authenticated, get their notifications AND inquiries
  if (user_data) {
    try {
      const db = await getDb(platform);

      // Get unread notifications
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

      unreadNotifications = notifs;

      // Get unread inquiries received by this user (pass owner receiving booking requests)
      const inqs = await db.select({
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
            eq(inquiries.status, 'pending'),
            eq(inquiries.read, false)
          )
        )
        .orderBy(desc(inquiries.createdAt))
        .all();

      // Transform inquiries to be similar format to notifications
      unreadInquiries = inqs.map(item => ({
        id: `inquiry-${item.inquiry.id}`, // Unique ID combining type
        type: 'inquiry',
        inquiryId: item.inquiry.id,
        userId: user_data.id,
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
          passId: item.pass?.id,
          status: 'pending'
        })
      }));

    } catch (error) {
      console.error('Failed to load notifications/inquiries:', error);
      unreadNotifications = [];
      unreadInquiries = [];
    }
  }

  // Combine all notifications (both system notifications and inquiries) and sort by date
  const allNotifications = [...unreadNotifications, ...unreadInquiries].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Most recent first
  });

  return {
    user: user_data,
    notifications: allNotifications,
    unreadNotificationCount: allNotifications.length
  };
}
