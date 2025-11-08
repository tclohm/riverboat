import { auth } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    await auth.api.signOut({
      headers: request.headers
    });

    throw redirect(303, '/');
  }
};
