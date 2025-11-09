import { auth } from "$lib/auth";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  try {
    const session = await auth.api.getSession({
      headers: event.request.headers
    });

    event.locals.session = session;
    event.locals.user = session?.user;
  } catch (e) {
    event.locals.session = null;
    event.locals.user = null;
  }

  return resolve(event);
};
