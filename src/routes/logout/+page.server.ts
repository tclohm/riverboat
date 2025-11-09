import { deleteSession } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ cookies, platform }) => {
    const token = cookies.get('session');
    
    if (token) {
      await deleteSession(platform, token);
    }
    
    cookies.delete('session', { path: '/' });
    
    throw redirect(303, '/');
  }
};
