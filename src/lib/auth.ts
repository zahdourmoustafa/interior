import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import { users, sessions, verifications, accounts } from './db/schema';
import { onUserRegistration, onUserLogin } from './hooks/registration-hooks';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: users,
      session: sessions,
      verification: verifications,
      account: accounts,
    },
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      emailVerified: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
      creditsRemaining: {
        type: 'number',
        required: false,
        defaultValue: 6,
      },
      creditsTotal: {
        type: 'number',
        required: false,
        defaultValue: 6,
      },
      subscriptionStatus: {
        type: 'string',
        required: false,
        defaultValue: 'free',
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
  // Note: Better Auth hooks will be integrated in a future update
  // For now, we'll handle credit initialization in the registration API
});
