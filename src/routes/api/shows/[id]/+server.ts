import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { getShowDetails, getSeasonEpisodes } from '$lib/services/tmdb';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const showId = params.id;
	try {
		const localShow = await db.show.findUnique({
			where: { id: showId },
			include: { seasons: { include: { episodes: true } } }
		});
		if (!localShow) return json({ error: 'Show not found' }, { status: 404 });

		const userShow = await db.userShow.findUnique({
			where: { userId_showId: { userId: locals.user.id, showId } }
		});

		// If no seasons cached, fetch from TMDB
		if (localShow.seasons.length === 0 && localShow.tmdbId) {
			const tmdbDetails = await getShowDetails(localShow.tmdbId);
			for (const s of tmdbDetails.seasons) {
				const season = await db.season.create({
					data: {
						showId: localShow.id,
						seasonNumber: s.seasonNumber,
						name: s.name,
						overview: s.overview,
						posterPath: s.posterPath,
						airDate: s.airDate ? new Date(s.airDate) : null,
						episodeCount: s.episodeCount
					}
				});
				const eps = await getSeasonEpisodes(localShow.tmdbId, s.seasonNumber);
				for (const ep of eps) {
					await db.episode.create({
						data: {
							seasonId: season.id,
							seasonNumber: ep.seasonNumber,
							episodeNumber: ep.episodeNumber,
							name: ep.name,
							overview: ep.overview,
							stillPath: ep.stillPath,
							airDate: ep.airDate ? new Date(ep.airDate) : null,
							runtime: ep.runtime
						}
					});
				}
			}
			const refreshed = await db.show.findUnique({
				where: { id: showId },
				include: { seasons: { include: { episodes: true } } }
			});
			return json({ show: refreshed, userShow });
		}

		return json({ show: localShow, userShow });
	} catch (e: any) {
		return json({ error: e.message }, { status: 500 });
	}
};
