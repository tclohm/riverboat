import { createUser, createSession } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, platform, cookies }) => {
    const data = await request.formData();
    
    const firstName = data.get('firstName')?.toString();
    const lastName = data.get('lastName')?.toString();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();

    if (!firstName || !lastName || !email || !password) {
      return fail(400, { error: 'All fields are required' });
    }

    const name = `${firstName} ${lastName}`;

    try {
      const userId = await createUser(platform, email, password, name);
      const token = await createSession(platform, userId);

      cookies.set('session', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days 
      });
      
      throw redirect(303, '/login');
    } catch (error: any) {
      return fail(400, { error: error.message || 'Signup failed' });
    }
  }
};
