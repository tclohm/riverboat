import { initializeDb } from '$lib/db';
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  // connection on server start
  await initializeDb(event.platform);
  return resolve(event);
};
