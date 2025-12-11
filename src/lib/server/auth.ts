import { DatabaseClient } from '$lib/db/client';
import { user, session, account } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

async function getDbFromClient(platform: any) {
  const mode = import.meta.env.MODE;
  const client = DatabaseClient.getInstance();

  if (!client.isInitialized) {
    await client.initialize(mode, platform);
  }

  return client.getDb();
}

export async function createUser(platform: any, email: string, password: string, name: string) {
  const db = await getDbFromClient(platform);

  // check if user exists
  const existing = await db.select().from(user).where(eq(user.email, email)).get();
  if (existing) {
    throw new Error('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userId = randomBytes(16).toString('hex');
  await db.insert(user).values({
    id: userId,
    name,
    email,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).run();

  // store 
  await db.insert(account).values({
    id: randomBytes(16).toString('hex'),
    accountId: email,
    providerId: 'email',
    userId,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date()
  }).run();

  return userId;
}

export async function verifyPassword(platform: any, email: string, password: string) {
  const db = await getDbFromClient(platform);

  // find user
  const foundUser = await db.select().from(user).where(eq(user.email, email)).get();
  if (!foundUser) {
    return null;
  }

  const foundAccount = await db.select().from(account)
    .where(and(
      eq(account.userId, foundUser.id),
      eq(account.providerId, 'email')
    ))
    .get(); 

  if (!foundAccount || !foundAccount.password) {
    return null;
  }

  const valid = await bcrypt.compare(password, foundAccount.password);
  if (!valid) {
    return null;
  }

  return foundUser;
}

export async function createSession(platform: any, userId: string) {
  const db = await getDbFromClient(platform);

  const token = randomBytes(32).toString('hex');
  const sessionId = randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days 
 
  await db.insert(session).values({
    id: sessionId,
    userId,
    token,
    expiresAt,
    createdAt: new Date(),
    updatedAt: new Date()
  }).run();

  return token;
}

export async function getSessionUser(platform: any, token: string) {
  if (!token) return null;

  const db = await getDbFromClient(platform);

  const foundSession = await db.select().from(session)
    .where(eq(session.token, token))
    .get();

  if (!foundSession) return null;

  const foundUser = await db.select().from(user)
    .where(eq(user.id, foundSession.userId))
    .get();

  return foundUser;
}

export async function deleteSession(platform: any, token: string) {
  const db = await getDbFromClient(platform);
  await db.delete(session).where(eq(session.token, token)).run();
}
