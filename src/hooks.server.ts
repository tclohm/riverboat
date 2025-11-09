import { getSessionUser } from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');
  
  if (token) {
    const user = await getSessionUser(event.platform, token);
    event.locals.user = user;
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};
