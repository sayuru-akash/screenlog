import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

function dateKey(d: Date, timezone: string): string {
	return d.toLocaleDateString('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' });
}

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const userId = locals.user.id;
	const timezone = url.searchParams.get('timezone') || 'Asia/Colombo';

	try {
		const userShows = await db.userShow.findMany({
			where: { userId },
			include: { show: { include: { seasons: { include: { episodes: true } } } } }
		});

		const watchedProgress = await db.episodeProgress.findMany({
			where: { userId },
			select: { episodeId: true }
		});
		const watchedIds = new Set(watchedProgress.map((p) => p.episodeId));

		const now = new Date();
		const todayKey = dateKey(now, timezone);

		const items: any[] = [];
		for (const us of userShows) {
			for (const season of us.show.seasons) {
				for (const ep of season.episodes) {
					if (!ep.airDate || watchedIds.has(ep.id)) continue;
					const epKey = dateKey(ep.airDate, timezone);
					// Include episodes from today onwards (in user's timezone)
					if (epKey >= todayKey) {
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

		const todayDate = new Date();
		const tomorrowDate = new Date(todayDate);
		tomorrowDate.setDate(tomorrowDate.getDate() + 1);
		const weekEndDate = new Date(todayDate);
		weekEndDate.setDate(weekEndDate.getDate() + 7);
		const nextWeekEndDate = new Date(todayDate);
		nextWeekEndDate.setDate(nextWeekEndDate.getDate() + 14);

		const tomorrowKey = dateKey(tomorrowDate, timezone);
		const weekEndKey = dateKey(weekEndDate, timezone);
		const nextWeekEndKey = dateKey(nextWeekEndDate, timezone);

		for (const item of items) {
			const dKey = dateKey(new Date(item.airDate), timezone);
			if (dKey === todayKey) groups.today.push(item);
			else if (dKey === tomorrowKey) groups.tomorrow.push(item);
			else if (dKey > todayKey && dKey <= weekEndKey) groups.thisWeek.push(item);
			else if (dKey > weekEndKey && dKey <= nextWeekEndKey) groups.nextWeek.push(item);
			else groups.later.push(item);
		}

		return json({ groups });
	} catch (e: any) {
		return json({ error: e.message }, { status: 500 });
	}
};
