import { auth } from '$lib/auth';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const data = request.formData();

    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required' });
    }

    try {
      await auth.api.signInEmail({
        body: {
          email,
          password
        }
      });

      throw redirect(303, '/');
    } catch (error: any) {
      return fail(400, { error: 'Invalid email or password' });
    }
  }
};
