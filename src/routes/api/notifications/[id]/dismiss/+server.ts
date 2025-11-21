import { getDb } from '$lib/db';
import { notifications } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function POST({ params, platform, locals }) {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const notificationId = parseInt(params.id);
  
  if (!notificationId) {
    return json({ error: 'Invalid notification ID' }, { status: 400 });
  }
  
  try {
    const db = await getDb(platform);
    
    // Delete the notification
    await db.delete(notifications)
      .where(eq(notifications.id, notificationId))
      .run();
    
    return json({ success: true });
  } catch (error) {
    console.error('Failed to dismiss notification:', error);
    return json({ error: 'Failed to dismiss notification' }, { status: 500 });
  }
}
