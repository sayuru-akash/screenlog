import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/signin?redirect=' + encodeURIComponent(url.pathname));
	}
	const preferences = await db.userPreference.findUnique({
		where: { userId: locals.user.id }
	});
	return {
		user: locals.user,
		preferences: preferences || { timezone: 'Asia/Colombo', theme: 'system', region: null, language: null }
	};
};
