import { getDb } from '$lib/db';
import { inquiries, passes, user } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { parseRequestedDatesToRange, addBookedDateRange } from '$lib/server/dateUtils';

export async function load({ platform, locals }) {
  if (!locals.user) {
    throw redirect(303, '/login?returnTo=/requests');
  }
  
  try {
    const db = await getDb(platform);
    
    const userPasses = await db.select()
      .from(passes)
      .where(eq(passes.userId, locals.user.id))
      .all();

    if (userPasses.length === 0) {
      throw redirect(303, '/add');
    }
    
    // Get all inquiries for the user's passes
    const userInquiries = await db.select({
      inquiry: inquiries,
      pass: passes,
      sender: user
    })
    .from(inquiries)
    .leftJoin(passes, eq(inquiries.passId, passes.id))
    .leftJoin(user, eq(inquiries.senderUserId, user.id))
    .where(
      eq(inquiries.receiverUserId, locals.user.id)
    )
    .orderBy(desc(inquiries.createdAt))
    .all()

    // Mark all inquiries as read (notification seen)
    const inquiryIds = userInquiries.map(item => item.inquiry.id);
    if (inquiryIds.length > 0) {
      for (const id of inquiryIds) {
        await db.update(inquiries)
          .set({ read: true })
          .where(eq(inquiries.id, id))
          .run();
      }
    }

    // Transform the data
    const transformedInquiries = userInquiries.map(item => ({
      ...item.inquiry,
      pass: item.pass,
      senderName: item.sender?.name
    }));
    
    return {
      inquiries: transformedInquiries
    };
  } catch (error) {
    console.error('Failed to load requests page:', error);
    return { inquiries: [] };
  }
}

export const actions = {
  updateInquiryStatus: async ({ request, platform, locals }) => {
    if (!locals.user) {
      throw redirect(303, '/login');
    }
    
    const formData = await request.formData();
    const inquiryId = parseInt(formData.get('inquiryId')?.toString() || '0');
    const status = formData.get('status')?.toString();

    console.log('Processing inquiry:', inquiryId, 'with status:', status);
    
    if (!inquiryId || !status || !['approved', 'rejected'].includes(status)) {
      return { error: 'Invalid input' };
    }
    
    try {
      const db = await getDb(platform);
      
      const inquiry = await db.select()
        .from(inquiries)
        .where(eq(inquiries.id, inquiryId))
        .get();

      if (!inquiry) {
        return { error: 'Inquiry not found' };
      }

      const pass = await db.select()
        .from(passes)
        .where(eq(passes.id, inquiry.passId))
        .get();

      if (!pass || pass.userId !== locals.user.id) {
        return { error: 'Unauthorized' };
      }
      
      // Update inquiry status and mark as read
      await db.update(inquiries)
        .set({
          status: status,
          read: true,
          updatedAt: new Date()
        })
        .where(eq(inquiries.id, inquiryId))
        .run();

      // If approved, add booked dates
      if (status === 'approved' && inquiry.requestedDates) {
        const dateRange = parseRequestedDatesToRange(inquiry.requestedDates);
        
        if (dateRange) {
          console.log('Parsed date range:', dateRange);
          
          const updatedBookedDates = addBookedDateRange(
            pass.bookedDates,
            dateRange.start,
            dateRange.end
          );
          
          console.log('Updated booked dates:', updatedBookedDates);
          
          await db.update(passes)
            .set({ bookedDates: updatedBookedDates })
            .where(eq(passes.id, inquiry.passId))
            .run();
        }
      }

      console.log('Successfully updated inquiry status');
      return { success: true };
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
      return { error: 'Failed to update status' };
    }
  }
};
