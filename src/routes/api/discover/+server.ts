import { json } from '@sveltejs/kit';
import { getTrendingShows, getTrendingMovies, getPopularShows, getPopularMovies, getTopRatedShows, getTopRatedMovies } from '$lib/services/tmdb';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const [trendingShows, trendingMovies, popularShows, popularMovies, topRatedShows, topRatedMovies] = await Promise.all([
			getTrendingShows(),
			getTrendingMovies(),
			getPopularShows(),
			getPopularMovies(),
			getTopRatedShows(),
			getTopRatedMovies()
		]);
		return json({ trendingShows, trendingMovies, popularShows, popularMovies, topRatedShows, topRatedMovies });
	} catch (e: any) {
		return json({ error: e.message || 'Failed to load discover' }, { status: 500 });
	}
};
