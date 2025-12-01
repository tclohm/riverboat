import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { eq, count } from 'drizzle-orm';
import { user, passes, inquiries } from '$lib/db/schema';
import { getDb } from '$lib/db';

export async function load({ platform, locals }) {
  // Check if user is logged in
  if (!locals.user) {
    redirect(302, '/login');
  }

  try {
    // Get database instance
    const db = await getDb(platform);
    // Fetch user profile

    // // Get count of passes user has listed
    const passCount = await db.select({ count: count() }).from(passes).where(eq(passes.userId, locals.user.id));
    // // Get count of bookings made
    const bookingCount = await db.select({ count: count() }).from(inquiries).where(eq(inquiries.receiverUserId, locals.user.id));

    return {
      user: {
        id: locals.user.id,
        name: locals.user.name,
        email: locals.user.email,
        phone: locals.user.phone || null,
        location: locals.user.location || null,
        bio: locals.user.bio || null,
        createdAt: locals.user.createdAt,
      },
      passCount: passCount.count,
      bookingCount: bookingCount.count,
      rating: 'N/A',
    };
  } catch (error) {
    console.error('Error loading profile:', error);
    return { 
      user: locals.user,
      passCount: 0,
      bookingCount: 0,
      rating: 'N/A',
    };
  }
};

export const actions = {
  updateProfile: async ({ request, locals, platform }) => {
    if (!locals.user) {
      return { success: false, message: 'Not authenticated' };
    }

    const formData = await request.formData();
    const name = formData.get('name')?.toString() || '';
    const phone = formData.get('phone')?.toString() || null;
    const location = formData.get('location')?.toString() || null;
    const bio = formData.get('bio')?.toString() || null;

    // Validate inputs
    if (!name || name.trim().length === 0) {
      return { success: false, message: 'Name is required' };
    }

    if (bio && bio.length > 160) {
      return { success: false, message: 'Bio must be 160 characters or less' };
    }

    try {
      // Get database instance
      const db = await getDb(platform);

      // Update user profile
      await db
        .update(user)
        .set({
          name,
          phone: phone || null,
          location: location || null,
          bio: bio || null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, locals.user.id))
        .run();

      // Update locals
      locals.user.name = name;
      locals.user.phone = phone || null;
      locals.user.location = location || null;
      locals.user.bio = bio || null;

      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  },

  deleteAccount: async ({ locals, cookies, platform }) => {
    if (!locals.user) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      // Get database instance
      const db = await getDb(platform);

      // Delete user account
      await db.delete(user).where(eq(user.id, locals.user.id)).run();

      // Clear session
      cookies.delete('session', { path: '/' });

      redirect(302, '/');
    } catch (error) {
      console.error('Error deleting account:', error);
      return { success: false, message: 'Failed to delete account' };
    }
  },
};
