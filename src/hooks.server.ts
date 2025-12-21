import { initializeDb } from '$lib/db';
import { getSessionUser } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';


export const handle: Handle = async ({ event, resolve }) => {
  // connection on server start
  await initializeDb(event.platform);

  const token = event.cookies.get('session');
  if (token) {
    // Get user token from cookies 
    const user = await getSessionUser(event.platform, token);
    if (user) {
      event.locals.user = user;
      event.locals.session = { token };
    }
  }
  
  return resolve(event);
 };
