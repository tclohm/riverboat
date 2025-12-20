import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { user, account, session } from './schema';

export async function setupTestDb() {
  const testDb = new Database(':memory:');
  const db = drizzle(testDb);

  // Create tables
  await testDb.exec(`
    CREATE TABLE user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER,
      image TEXT,
      phone TEXT,
      location TEXT,
      bio TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE account (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES user(id),
      password TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE session (
      id TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      user_id TEXT NOT NULL REFERENCES user(id)
    );
  `);

  // Create test user
  const userId = randomBytes(16).toString('hex');
  const hashedPassword = await bcrypt.hash('password123', 10);

  await db.insert(user).values({
    id: userId,
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).run();

  await db.insert(account).values({
    id: randomBytes(16).toString('hex'),
    accountId: 'test@example.com',
    providerId: 'email',
    userId,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).run();

  const token = randomBytes(32).toString('hex');
  await db.insert(session).values({
    id: randomBytes(16).toString('hex'),
    userId,
    token,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  }).run();

  return { db, userId, token, testDb };
}
