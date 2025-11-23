import { getDb } from '$lib/db';
import { inquiries, passes, user, notifications } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function load({ platform, locals, url }) {
  // Check if user is logged in
  if (!locals.user) {
    throw redirect(303, '/login?returnTo=/bookings');
  }
  
  try {
    const db = await getDb(platform);

    // Mark all unread notifications as read
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, locals.user.id))
      .run();
    
    // Get all inquiries SENT by the user
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
    .all()

    // Transform the data for the component
    const transformedInquiries = userSentInquiries.map(item => ({
      ...item.inquiry,
      pass: item.pass,
      ownerName: item.owner?.name
    }));

    // Get the tab from URL query param (default to 'approved')
    const tab = url.searchParams.get('tab') || 'approved';
    
    return {
      inquiries: transformedInquiries,
      defaultTab: tab
    };
  } catch (error) {
    console.error('Failed to load bookings page:', error);
    return { 
      inquiries: [],
      defaultTab: 'approved'
    };
  }
}
