import { passes, inquiries, notifications } from '$lib/db/schema';
import { getDb } from '$lib/db';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ params, platform, locals }) {
  const db = await getDb(platform);
  const pass = await db.select().from(passes).where(eq(passes.id, parseInt(params.id))).get();

  if (!pass) {
    throw error(404, 'Pass not found');
  }

  return { 
    pass,
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
    const receiverUserId = formData.get('receiverUserId')?.toString || '';
    const message = formData.get('message')?.toString() || '';
    const contactInfo = formData.get('contactInfo')?.toString() || '';
    const requestedDates = formData.get('requestedDates')?.toString() || '';

    if (!passId || !receiverUserId || !message || !contactInfo || !requestedDates) {
      return fail(400, { error: 'All fields are required' });
    }

    try {
      const db = await getDb(platform);
      
      // create inquiry
      const inquiryResult = await db.insert(inquiries).values({
        passId,
        senderUserId: locals.user.id,
        receiverUserId,
        message,
        contactInfo,
        requestedDates,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      // get pass
      const pass = await db.select().from(passes).where(eq(passes.id, passId)).get();
      if (!pass) {
        return fail(404, { error: 'Pass not found' });
      }

      // create notification
      await db.insert(notifications).values({
        userId: receiverUserId,
        passId,
        type: 'inquiry',
        title: 'New Pass Request',
        message: `Someone is interested in your "${pass.title}" pass for ${requestedDates}`,
        read: false,
        createdAt: new Date(),
        metadata: JSON.stringify({
          inquiryId: inquiryResult[0].id,
          requestedDates,
          senderName: locals.user.name
        })
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to create inquiry:', error);
      return fail(500, { error: 'Failed to send request. Please try again.' });
    }
  }
};
