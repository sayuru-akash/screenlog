import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const userId = locals.user.id;

	try {
		const showsTracked = await db.userShow.count({ where: { userId } });
		const showsCompleted = await db.userShow.count({ where: { userId, status: 'COMPLETED' } });
		const episodesWatched = await db.episodeProgress.count({ where: { userId } });
		const moviesWatched = await db.userMovie.count({ where: { userId, status: 'WATCHED' } });
		const totalMovies = await db.userMovie.count({ where: { userId } });

		// Calculate watch time from episode runtimes + movie runtimes
		const episodeProgressList = await db.episodeProgress.findMany({
			where: { userId },
			include: { episode: true }
		});
		const movieList = await db.userMovie.findMany({
			where: { userId, status: 'WATCHED' },
			include: { movie: true }
		});

		let totalWatchTimeMinutes = 0;
		for (const ep of episodeProgressList) {
			totalWatchTimeMinutes += ep.episode.runtime || 0;
		}
		for (const m of movieList) {
			totalWatchTimeMinutes += m.movie.runtime || 0;
		}

		// Top genres
		const showGenres = await db.userShow.findMany({ where: { userId }, include: { show: true } });
		const movieGenres = await db.userMovie.findMany({ where: { userId }, include: { movie: true } });
		const genreCounts = new Map<string, number>();
		for (const s of showGenres) {
			for (const g of s.show.genres) {
				genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
			}
		}
		for (const m of movieGenres) {
			for (const g of m.movie.genres) {
				genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
			}
		}
		const topGenres = Array.from(genreCounts.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);

		return json({
			showsTracked,
			showsCompleted,
			episodesWatched,
			moviesWatched,
			totalMovies,
			totalWatchTimeMinutes,
			topGenres
		});
	} catch (e: any) {
		return json({ error: e.message || 'Failed to load profile' }, { status: 500 });
	}
};
