import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const userId = locals.user.id;
	const showId = url.searchParams.get('showId');
	try {
		if (showId) {
			const progress = await db.episodeProgress.findMany({
				where: { userId, episode: { season: { showId } } },
				include: { episode: true }
			});
			return json({ progress });
		}
		const progress = await db.episodeProgress.findMany({
			where: { userId },
			include: {
				episode: { include: { season: { include: { show: true } } } }
			},
			orderBy: { watchedAt: 'desc' },
			take: 50
		});
		return json({ progress });
	} catch (e: any) {
		return json({ error: e.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const body = await request.json().catch(() => ({}));
	const userId = locals.user.id;
	try {
		if (body.action === 'watch') {
			const ep = await db.episodeProgress.create({
				data: { userId, episodeId: body.episodeId },
				include: { episode: true }
			});
			await db.activity.create({
				data: { userId, type: 'EPISODE_WATCHED', episodeId: body.episodeId, showId: body.showId }
			});
			return json({ success: true, progress: ep });
		} else if (body.action === 'unwatch') {
			await db.episodeProgress.deleteMany({ where: { userId, episodeId: body.episodeId } });
			return json({ success: true });
		} else if (body.action === 'markSeason') {
			const episodes = await db.episode.findMany({ where: { seasonId: body.seasonId } });
			for (const ep of episodes) {
				await db.episodeProgress.upsert({
					where: { userId_episodeId: { userId, episodeId: ep.id } },
					create: { userId, episodeId: ep.id },
					update: {}
				});
			}
			return json({ success: true, count: episodes.length });
		} else if (body.action === 'markCaughtUp') {
			const episodes = await db.episode.findMany({ where: { season: { showId: body.showId } } });
			for (const ep of episodes) {
				await db.episodeProgress.upsert({
					where: { userId_episodeId: { userId, episodeId: ep.id } },
					create: { userId, episodeId: ep.id },
					update: {}
				});
			}
			await db.userShow.updateMany({
				where: { userId, showId: body.showId },
				data: { status: 'CAUGHT_UP' }
			});
			return json({ success: true, count: episodes.length });
		} else if (body.action === 'resetShow') {
			const eps = await db.episode.findMany({ where: { season: { showId: body.showId } } });
			const epIds = eps.map((e) => e.id);
			await db.episodeProgress.deleteMany({ where: { userId, episodeId: { in: epIds } } });
			await db.userShow.updateMany({
				where: { userId, showId: body.showId },
				data: { status: 'PLAN_TO_WATCH' }
			});
			return json({ success: true });
		}
		return json({ error: 'Invalid action' }, { status: 400 });
	} catch (e: any) {
		return json({ error: e.message }, { status: 500 });
	}
};
