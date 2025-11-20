import { initializeDb } from '$lib/db';
import { getSessionUser } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // connection on server start
  await initializeDb(event.platform);

  const token = event.cookies.get('session');
  console.log('🪝 Hooks - Session token:', token?.substring(0,8) + '...');

  if (token) {
    // Get user token from cookies 
    const user = await getSessionUser(event.platform, token);
    console.log('🪝 Hooks - Got user:', user?.email);
    if (user) {
      event.locals.user = user;
      event.locals.session = { token };
    }
  }

  return resolve(event);
};
