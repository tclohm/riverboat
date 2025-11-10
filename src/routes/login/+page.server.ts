import { verifyPassword, createSession } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, platform, cookies }) => {
    const data = await request.formData();
    
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required' });
    }

    try {
      const user = await verifyPassword(platform, email, password);
      
      if (!user) {
        return fail(400, { error: 'Invalid email or password' });
      }
      
      const token = await createSession(platform, user.id);
      
      cookies.set('session', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    } catch (error: any) {
      return fail(400, { error: error.message || 'Login failed' });
    }

    throw redirect(303, '/');
  }
};
