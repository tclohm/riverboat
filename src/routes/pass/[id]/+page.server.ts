import { passes, inquiries, notifications, user } from '$lib/db/schema';
import { getDb } from '$lib/db';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq, and, desc } from 'drizzle-orm';

function getMonthIndex(monthStr: string): number | undefined {
  const monthMap: { [key: string]: number } = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11
  };
  return monthMap[monthStr.toLowerCase().slice(0, 3)];
}

function parseRequestedDates(dateString: string): { startDate: Date, endDate: Date } | null {
  if (!dateString) return null;

  let match = dateString.match(/(\w+)\s+(\d+)-(\d+),?\s+(\d+)/);
  if (match) {
    const monthStr = match[1];
    const startDay = parseInt(match[2]);
    const endDay = parseInt(match[3]);
    const year = parseInt(match[4]);

    const month = getMonthIndex(monthStr);
    if (month === undefined) return null;

    const startDate = new Date(year, month, startDay);
    const endDate = new Date(year, month, endDay);
    return { startDate, endDate };
  }

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
    return { startDate, endDate };
  }

  return null;
}

export async function load({ params, platform, locals }) {
  const db = await getDb(platform);

  const passWithOwner = await db.select({
    pass: passes,
    owner: user
  }).from(passes)
  .leftJoin(user, eq(passes.userId, user.id))
  .where(eq(passes.id, parseInt(params.id)))
  .get();

  if (!passWithOwner || !passWithOwner.pass) {
    throw error(404, 'Pass not found');
  }

  const passData = {
    ...passWithOwner.pass,
    ownerName: passWithOwner.owner?.name || 'Unknown'
  };

  return { 
    pass: passData,
    user: locals.user
  };
}

export const actions = {
  createInquiry: async ({ request, params, platform, locals }) => {
    if (!locals.user) {
      throw redirect(303, `/login?returnTo=/pass/${params.id}`);
    }

    const formData = await request.formData();
    const passId = parseInt(formData.get('passId')?.toString() || 0);
    const receiverUserId = formData.get('receiverUserId')?.toString() || '';
    const message = formData.get('message')?.toString() || '';
    const requestedDates = formData.get('requestedDates')?.toString() || '';

    console.log('[createInquiry] Form data:', { passId, receiverUserId, message, contactInfo, requestedDates });

    if (!passId || !receiverUserId || !message || !requestedDates) {
      return fail(400, { error: 'All fields are required' });
    }

    const parsed = parseRequestedDates(requestedDates);
    if (!parsed) {
      return fail(400, { error: 'Invalid date format' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDateOnly = new Date(parsed.startDate);
    startDateOnly.setHours(0, 0, 0, 0);
    if (startDateOnly < today) {
      return fail(400, { error: 'Start date must be today or in the future' });
    }

    const endDateOnly = new Date(parsed.endDate);
    endDateOnly.setHours(0, 0, 0, 0);
    if (endDateOnly < today) {
      return fail(400, { error: 'End date must be today or in the future' });
    }

    try {
      const db = await getDb(platform);
      
      // Get pass and sender user info
      const pass = await db.select().from(passes).where(eq(passes.id, passId)).get();
      const senderUser = await db.select().from(user).where(eq(user.id, locals.user.id)).get();
      
      // 1. CREATE INQUIRY
      console.log('[createInquiry] Creating inquiry...');
      await db.insert(inquiries).values({
        passId,
        senderUserId: locals.user.id,
        receiverUserId,
        message,
        requestedDates,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }).run();
      
      // 2. GET THE INQUIRY ID
      const newInquiry = await db.select().from(inquiries)
        .where(
          and(
            eq(inquiries.passId, passId),
            eq(inquiries.senderUserId, locals.user.id),
            eq(inquiries.receiverUserId, receiverUserId),
            eq(inquiries.status, 'pending')
          )
        )
        .orderBy(desc(inquiries.createdAt))
        .get();
      
      console.log('[createInquiry] Inquiry created with ID:', newInquiry?.id);

      // 3. CREATE NOTIFICATION FOR PASS OWNER
      console.log('[createInquiry] Creating notification for', receiverUserId);
      await db.insert(notifications).values({
        userId: receiverUserId,
        type: 'inquiry_new',
        title: 'New Booking Request',
        message: `New booking request from ${senderUser?.name || 'A user'} for "${pass?.title || 'a pass'}"`,
        read: false,
        archived: false,
        relatedId: newInquiry?.id,
        createdAt: new Date(),
        metadata: JSON.stringify({
          inquiryId: newInquiry?.id,
          senderName: senderUser?.name,
          senderUserId: locals.user.id,
          requestedDates: requestedDates,
          passTitle: pass?.title,
          passId: passId
        })
      }).run();
      
      console.log('[createInquiry] Notification created');
      return { success: true };
    } catch (error) {
      console.error('[createInquiry] Error:', error);
      return fail(500, { error: 'Failed to send request. Please try again.' });
    }
  }
};
