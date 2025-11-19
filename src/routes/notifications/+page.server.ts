import { getDb } from '$lib/db';
import { notifications, inquiries, passes } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';


// Convert month name to index using Map
function getMonthIndex(monthStr: string): number | undefined {
  const monthMap = new Map<string, number>([
    ['jan', 0], ['jan.', 0], ['january', 0],
    ['feb', 1], ['feb.', 1], ['february', 1],
    ['mar', 2], ['mar.', 2], ['march', 2],
    ['apr', 3], ['apr.', 3], ['april', 3],
    ['may', 4],
    ['jun', 5], ['jun.', 5], ['june', 5],
    ['jul', 6], ['jul.', 6], ['july', 6],
    ['aug', 7], ['aug.', 7], ['august', 7],
    ['sep', 8], ['sep.', 8], ['sept', 8], ['september', 8],
    ['oct', 9], ['oct.', 9], ['october', 9],
    ['nov', 10], ['nov.', 10], ['november', 10],
    ['dec', 11], ['dec.', 11], ['december', 11]
  ]);
  return monthMap.get(monthStr.toLowerCase());
}

function parseRequestedDates(dateString: string): { startDate: Date, endDate: Date } | null {
  // Format: "Dec 15-17, 2025" (same month)
  let match = dateString.match(/(\w+)\s+(\d+)-(\d),?\s+(\d+)/);
  if (match) {
    const monthStr = match[1];
    const startDay = parseInt(match[2]);
    const endDay = parseInt(match[3]);
    const year = parseIng(match[4]);

    const month = getMonthIndex(monthStr);
    if (month === undefined) return null;

    const startDate = new Date(year, month, startDay);
    const endDate = new Date(year, month, endDay);
    return { startDate, endDate };
  }
  // Format: "Dec 15 - Jan 5, 2026" (different months and years)
  match = dateString.match(/(\w+)\s+(\d+),?\s+(\d+)\s*-\s*(\w+)\s+(\d+),?\s+(\d+)/);
  if (match) {
    const startMonthStr = match[1];
    const startDay = parseInt(match[2]);
    const startYear = parseInt(match[3]);
    const endMonthStr = match[4];
    const endDay = parseInt(match[5]);
    const endYear = parseInt(match[6]);

    const startMonth = getMonthIndex(startMonthStr);
    const endMonth = getMonthIndex(endMonthStr);

    if (startMonth === undefined || endMonth === undefined) return null;

    const startDate = new Date(startYear, startMonth, startDay);
    const endDate = new Date(endYear, endMonth, endDay);
    return { startDate, startEnd };
  }

  // Format: "Nov 20 - Dec 2, 2025" (different month and same year)
  match = dateString.match(/(\w+)\s+(\d+)\s*-\s*(\w+)\s+(\d+),?\s+(\d+)/);
  if (match) {
    const startMonthStr = match[1];
    const startDay = parseInt(match[2]);
    const endMonthStr = match[3];
    const endDay = parseInt(match[4]);
    const year = parseInt(match[5]);

    const startMonth = getMonthIndex(startMonthStr);
    const endMonth = getMonthIndex(endMonthStr);

    if (startMonth === undefined || endMonth === undefined) return null;

    const startDate = new Date(year, startMonth, startDay);
    const endDate = new Date(year, endMonth, endDay);
    return { startDate, endDate };
  }

  return null;
}

// To get archive date (4AM next day after end date)
function getApprovedNotificationArchiveDate(requestedDates: string): Date {
  const parsed = parseRequestedDates(requestedDates);
  if (!parsed) {
    const date = new Date();
    date.setHours(date.getHours() + 24);
    return date;
  }

  const archiveDate = new Date(parsed.endDate);
  archiveDate.setDate(archiveDate.getDate() + 1);
  archiveDate.setHours(4, 0, 0, 0);

  return archiveDate;
}

export async function load({ platform, locals }) {
  // Check if user is logged in
  if (!locals.user) {
    throw redirect(303, '/login?returnTo=/notifications');
  }
  
  try {
    const db = await getDb(platform);
    
    // Get all non-archived notifications for the user
    const userNotifications = await db.select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, locals.user.id),
          eq(notifications.archived, false)
        )
      )
      .orderBy(desc(notifications.createdAt))
      .all();
    
    // Mark all as read when viewing notifications page
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, locals.user.id))
      .run();
    
    // Get all inquiries for the user's passes
    const userInquiries = await db.select({
      inquiry: inquiries,
      pass: passes
    })
      .from(inquiries)
      .leftJoin(passes, eq(inquiries.passId, passes.id))
      .where(eq(inquiries.receiverUserId, locals.user.id))
      .orderBy(desc(inquiries.createdAt))
      .all();
    
    return {
      notifications: userNotifications,
      inquiries: userInquiries
    };
  } catch (error) {
    console.error('Failed to load notifications page:', error);
    return { notifications: [], inquiries: [] };
  }
}

export const actions = {
  updateInquiryStatus: async ({ request, platform, locals }) => {
    // Check if user is logged in
    if (!locals.user) {
      throw redirect(303, '/login');
    }
    
    const formData = await request.formData();
    const inquiryId = parseInt(formData.get('inquiryId')?.toString() || '0');
    const status = formData.get('status')?.toString();
    
    if (!inquiryId || !status) {
      return { error: 'Invalid input' };
    }
    
    try {
      const db = await getDb(platform);
      
      // Update the inquiry status
      const inquiry = await db.select()
        .from(inquiries)
        .where(eq(inquiries.id, inquiryId))
        .get();

      if (!inquiry) {
        return { error : 'Inquiry not found' };
      }
      
      // Get pass info
      const pass = await db.select()
        .from(passes)
        .where(eq(passes.id, inquiry.passId))
        .get();

      // Update inquiry status
      await db.update(inquiries)
        .set({
          status,
          updatedAt: new Date()
        })
        .where(eq(inquiries.id, inquiryId))
        .run();

      // send notification to the requester
      const statusMessage = status === 'approved' ? 'approved' : 'declined';
      const notificationTitle = status === 'approved' ? 'Request Approved!' : 'Request Declined';
      const notificationMessage = `Your request for "${pass?.title || 'a pass'}" has been ${statusMessage}.`;
      const notificationResult = await db.insert(notifications).values({
        userId: inquiry.senderUserId,
        passId: inquiry.passId,
        type: 'inquiry',
        title: notificationTitle,
        message: notificationMessage,
        read: false,
        archived: false,
        createdAt: new Date(),
        metadata: JSON.stringify({
          inquiryId: inquiryId,
          status,
          requestedDates: inquiry.requestedDates
        })
      }).returning();


      // If approved, store archive date in metadata for scheduled archiving
      if (status === 'approved' && notificationResult[0]) {
        // archive date will be 4AM the day after requested dates end 
        const archiveDate = getApprovedNotificationArchiveDate(inquiry.requestedDates || '');
        await db.update(notifications)
          .set({
            metadata: JSON.stringify({
              inquiryId: inquiryId,
              status,
              requestedDates: inquiry.requestedDates,
              scheduledArchiveTime: archiveDate.getTime();
            })
          })
          .where(eq(notifications.id, notificationResult[0].id));
          .run();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
      return { error: 'Failed to update status' };
    }
  },

  archiveNotification: async ({ request, platform, locals }) => {
    if (!locals.user) {
      throw redirect(303, '/login');
    }

    const formData = await request.formDate();
    const notificationId = parseInt(formData.get('notificationId')?.toString() || '0');

    if (!notificationId) {
      return { error: 'Invalid notification ID' };
    }

    try {
      const db = await getDb(platform);

      await db.update(notifications)
        .set({
          archived: true,
          archivedAt: new Date()
        })
        .where(eq(notifications.id, notificationId))
        .run();

      return { success: true ;}
    } catch (error) {
      console.error('Failed to archive notification:', error);
      return { error: 'Failed to archive notification' };
    }
  }
};
