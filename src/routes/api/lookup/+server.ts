import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { getShowDetails, getMovieDetails } from '$lib/services/tmdb';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const body = await request.json().catch(() => ({}));
	try {
		if (body.type === 'show') {
			let show = await db.show.findUnique({ where: { tmdbId: body.tmdbId } });
			if (!show) {
				const details = await getShowDetails(body.tmdbId);
				show = await db.show.create({
					data: {
						tmdbId: body.tmdbId,
						title: details.title,
						overview: details.overview,
						posterPath: details.posterPath,
						backdropPath: details.backdropPath,
						firstAirDate: details.firstAirDate ? new Date(details.firstAirDate) : null,
						status: details.status,
						genres: details.genres || []
					}
				});
			}
			return json({ id: show.id, type: 'show' });
		} else if (body.type === 'movie') {
			let movie = await db.movie.findUnique({ where: { tmdbId: body.tmdbId } });
			if (!movie) {
				const details = await getMovieDetails(body.tmdbId);
				movie = await db.movie.create({
					data: {
						tmdbId: body.tmdbId,
						title: details.title,
						overview: details.overview,
						posterPath: details.posterPath,
						backdropPath: details.backdropPath,
						releaseDate: details.releaseDate ? new Date(details.releaseDate) : null,
						runtime: details.runtime,
						genres: details.genres || [],
						status: details.status
					}
				});
			}
			return json({ id: movie.id, type: 'movie' });
		}
		return json({ error: 'Invalid type' }, { status: 400 });
	} catch (e: any) {
		return json({ error: e.message }, { status: 500 });
	}
};
