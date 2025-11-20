import { verifyPassword, createSession } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

export function load({ url }) {
  const returnTo = url.searchParams.get('returnTo') || '/admin';
  return { returnTo };
}

export const actions = {
  default: async ({ request, platform, cookies }) => {
    const data = await request.formData();
    // Get returnTo from form data (add this hidden field to the form)
    const returnTo = data.get('returnTo')?.toString() || '/';
    
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();

    if (!email || !password) {
      return fail(400, { 
        error: 'Email and password are required', 
        returnTo
      });
    }

    try {
      const user = await verifyPassword(platform, email, password);
      
      if (!user) {
        return fail(400, { 
          error: 'Invalid email or password', 
          returnTo
        });
      }
      
      const token = await createSession(platform, user.id);
      
      cookies.set('session', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    } catch (error: any) {
      return fail(400, { 
        error: error.message || 'Login failed', 
        returnTo
      });
    }

    throw redirect(303, returnTo);

  }
};
