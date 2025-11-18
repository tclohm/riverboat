import { getDb } from '$lib/db';
import { notifications } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function POST({ platform, locals }) {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    const db = await getDb(platform);
    
    // Update all unread notifications for the user
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, locals.user.id))
      .where(eq(notifications.read, false))
      .run();
    
    return json({ success: true });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return json({ error: 'Failed to mark all notifications as read' }, { status: 500 });
  }
}
