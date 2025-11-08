import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDb } from './db'; 

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false // skip for mvp 
  },
  trustedOrigins: [
    'https://localhost:5173',
    'https://2f9d364f.riverboat.pages.dev/',
  ]
});
