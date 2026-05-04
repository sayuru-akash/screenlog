import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const userId = locals.user.id;
	try {
		const shows = await db.userShow.findMany({
			where: { userId },
			include: { show: true },
			orderBy: { updatedAt: 'desc' }
		});
		const movies = await db.userMovie.findMany({
			where: { userId },
			include: { movie: true },
			orderBy: { updatedAt: 'desc' }
		});
		return json({ shows, movies });
	} catch (e: any) {
		return json({ error: e.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const body = await request.json().catch(() => ({}));
	const userId = locals.user.id;
	try {
		if (body.type === 'show') {
			const existing = await db.show.findUnique({ where: { tmdbId: body.tmdbId } });
			let showId = existing?.id;
			if (!showId) {
				const show = await db.show.create({
					data: {
						tmdbId: body.tmdbId,
						title: body.title,
						overview: body.overview,
						posterPath: body.posterPath,
						backdropPath: body.backdropPath,
						firstAirDate: body.firstAirDate ? new Date(body.firstAirDate) : null,
						genres: body.genres || [],
						status: body.status
					}
				});
				showId = show.id;
			}
			const userShow = await db.userShow.upsert({
				where: { userId_showId: { userId, showId } },
				create: { userId, showId, status: body.userStatus || 'PLAN_TO_WATCH' },
				update: { status: body.userStatus || 'WATCHING' }
			});
			await db.activity.create({
				data: { userId, type: 'SHOW_ADDED', showId }
			});
			return json({ success: true, item: userShow });
		} else if (body.type === 'movie') {
			const existing = await db.movie.findUnique({ where: { tmdbId: body.tmdbId } });
			let movieId = existing?.id;
			if (!movieId) {
				const movie = await db.movie.create({
					data: {
						tmdbId: body.tmdbId,
						title: body.title,
						overview: body.overview,
						posterPath: body.posterPath,
						backdropPath: body.backdropPath,
						releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
						genres: body.genres || [],
						runtime: body.runtime,
						status: body.status
					}
				});
				movieId = movie.id;
			}
			const userMovie = await db.userMovie.upsert({
				where: { userId_movieId: { userId, movieId } },
				create: { userId, movieId, status: body.userStatus || 'PLAN_TO_WATCH' },
				update: { status: body.userStatus || 'PLAN_TO_WATCH' }
			});
			await db.activity.create({
				data: { userId, type: 'MOVIE_ADDED', movieId }
			});
			return json({ success: true, item: userMovie });
		}
		return json({ error: 'Invalid type' }, { status: 400 });
	} catch (e: any) {
		return json({ error: e.message }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const body = await request.json().catch(() => ({}));
	const userId = locals.user.id;
	try {
		if (body.type === 'show') {
			await db.userShow.deleteMany({ where: { userId, showId: body.id } });
			return json({ success: true });
		} else if (body.type === 'movie') {
			await db.userMovie.deleteMany({ where: { userId, movieId: body.id } });
			return json({ success: true });
		}
		return json({ error: 'Invalid type' }, { status: 400 });
	} catch (e: any) {
		return json({ error: e.message }, { status: 500 });
	}
};
