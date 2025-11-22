import { getDb } from '$lib/db';
import { inquiries, passes, user } from '$lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function load({ platform, locals }) {
  // Check if user is logged in
  if (!locals.user) {
    throw redirect(303, '/login?returnTo=/bookings');
  }
  
  try {
    const db = await getDb(platform);
    
    // Get all inquiries SENT by the user (not received)
    const userSentInquiries = await db.select({
      inquiry: inquiries,
      pass: passes,
      owner: user
    })
    .from(inquiries)
    .leftJoin(passes, eq(inquiries.passId, passes.id))
    .leftJoin(user, eq(passes.userId, user.id))
    .where(
      eq(inquiries.senderUserId, locals.user.id)
    )
    .orderBy(desc(inquiries.createdAt))
    .all()

    // Count unread inquiries (inquiries that haven't been viewed yet)
    const unreadCount = userSentInquiries.filter(item => !item.inquiry.read).length;

    // Mark all inquiries as read since user is now viewing them
    await db.update(inquiries)
      .set({ read: true })
      .where(eq(inquiries.senderUserId, locals.user.id))
      .run();

    // Transform the data for the component
    const transformedInquiries = userSentInquiries.map(item => ({
      ...item.inquiry,
      pass: item.pass,
      ownerName: item.owner?.name
    }));
    
    return {
      inquiries: transformedInquiries,
      unreadCount
    };
  } catch (error) {
    console.error('Failed to load bookings page:', error);
    return { 
      inquiries: [],
      unreadCount: 0
    };
  }
}
