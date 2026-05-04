import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const userId = locals.user.id;
	try {
		const userShows = await db.userShow.findMany({
			where: { userId },
			include: { show: { include: { seasons: { include: { episodes: true } } } } }
		});

		const now = new Date();
		const items: any[] = [];
		for (const us of userShows) {
			for (const season of us.show.seasons) {
				for (const ep of season.episodes) {
					if (ep.airDate && new Date(ep.airDate) >= now) {
						items.push({
							id: ep.id,
							showId: us.show.id,
							showTitle: us.show.title,
							posterPath: us.show.posterPath,
							seasonNumber: ep.seasonNumber,
							episodeNumber: ep.episodeNumber,
							episodeTitle: ep.name,
							airDate: ep.airDate.toISOString()
						});
					}
				}
			}
		}

		items.sort((a, b) => new Date(a.airDate).getTime() - new Date(b.airDate).getTime());

		const groups: Record<string, typeof items> = { today: [], tomorrow: [], thisWeek: [], nextWeek: [], later: [] };
		const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(tomorrowStart.getDate() + 1);
		const weekEnd = new Date(todayStart); weekEnd.setDate(weekEnd.getDate() + 7);
		const nextWeekEnd = new Date(todayStart); nextWeekEnd.setDate(nextWeekEnd.getDate() + 14);

		for (const item of items) {
			const d = new Date(item.airDate);
			if (d >= todayStart && d < tomorrowStart) groups.today.push(item);
			else if (d >= tomorrowStart && d < new Date(tomorrowStart.getTime() + 86400000)) groups.tomorrow.push(item);
			else if (d < weekEnd) groups.thisWeek.push(item);
			else if (d < nextWeekEnd) groups.nextWeek.push(item);
			else groups.later.push(item);
		}

		return json({ groups });
	} catch (e: any) {
		return json({ error: e.message }, { status: 500 });
	}
};
