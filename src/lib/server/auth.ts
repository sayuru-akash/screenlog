import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { db } from './db';

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: 'postgresql'
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24 // 1 day
	},
	advanced: {
		cookiePrefix: 'screenlog'
	}
});

export type Auth = typeof auth;
