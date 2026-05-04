import { json } from '@sveltejs/kit';
import { searchMulti } from '$lib/services/tmdb';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const q = url.searchParams.get('q') || '';
	if (!q.trim()) return json({ results: [] });
	try {
		const results = await searchMulti(q);
		return json({ results });
	} catch (e: any) {
		return json({ error: e.message || 'Search failed' }, { status: 500 });
	}
};
