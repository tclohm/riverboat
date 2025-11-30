import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Check if user is logged in
  if (!locals.user) {
    redirect(302, '/login');
  }

  // Get user data from locals
  const user = locals.user;

  // TODO: You can fetch additional stats from your database here
  // For now, these are placeholders
  const passCount = 0; // Number of passes user has listed
  const bookingCount = 0; // Number of bookings made
  const rating = 'N/A'; // User's average rating

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      location: user.location || null,
      bio: user.bio || null,
      createdAt: user.createdAt,
    },
    passCount,
    bookingCount,
    rating,
  };
};

export const actions: Actions = {
  updateProfile: async ({ request, locals }) => {
    if (!locals.user) {
      return { success: false, message: 'Not authenticated' };
    }

    const formData = await request.formData();
    const name = formData.get('name');
    const phone = formData.get('phone');
    const location = formData.get('location');
    const bio = formData.get('bio');

    // Validate inputs
    if (!name || name.toString().trim().length === 0) {
      return { success: false, message: 'Name is required' };
    }

    if (bio && bio.toString().length > 160) {
      return { success: false, message: 'Bio must be 160 characters or less' };
    }

    try {
      // TODO: Update user profile in your database
      // Example:
      // await db.updateUser(locals.user.id, {
      //   name: name.toString(),
      //   phone: phone.toString() || null,
      //   location: location.toString() || null,
      //   bio: bio.toString() || null,
      // });

      // Update locals
      locals.user.name = name.toString();
      locals.user.phone = phone.toString() || null;
      locals.user.location = location.toString() || null;
      locals.user.bio = bio.toString() || null;

      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  },

  deleteAccount: async ({ locals, cookies }) => {
    if (!locals.user) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      // TODO: Delete user account from your database
      // Example:
      // await db.deleteUser(locals.user.id);

      // Clear session
      cookies.delete('session', { path: '/' });

      redirect(302, '/');
    } catch (error) {
      console.error('Error deleting account:', error);
      return { success: false, message: 'Failed to delete account' };
    }
  },
};
