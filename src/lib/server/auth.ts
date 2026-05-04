import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { db } from './db';
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from '$env/static/private';

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: 'postgresql'
	}),
	secret: BETTER_AUTH_SECRET,
	baseURL: BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true,
		autoSignIn: true
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24 // 1 day
	},
	trustedOrigins: [BETTER_AUTH_URL],
	advanced: {
		cookiePrefix: 'screenlog'
	}
});

export type Auth = typeof auth;
