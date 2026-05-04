import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const prefs = await db.userPreference.findUnique({ where: { userId: locals.user.id } });
		return json({ preferences: prefs });
	} catch (e: any) {
		return json({ error: e.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const body = await request.json().catch(() => ({}));
	try {
		const prefs = await db.userPreference.upsert({
			where: { userId: locals.user.id },
			create: { userId: locals.user.id, theme: body.theme || 'system', region: body.region, language: body.language, timezone: body.timezone || 'Asia/Colombo' },
			update: { theme: body.theme, region: body.region, language: body.language, timezone: body.timezone }
		});
		return json({ preferences: prefs });
	} catch (e: any) {
		return json({ error: e.message }, { status: 500 });
	}
};
