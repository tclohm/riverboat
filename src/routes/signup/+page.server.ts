import { auth } from '$lib/auth';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
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
      await auth.api.signUpEmail({
        body: {
          name,
          email,
          password
        }
      });

      throw redirect(303, '/login');
    } catch (error: any) {
      return fail(400, { error: error.message || 'Signup failed' });
    }
  }
};
