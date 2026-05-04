import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ShowStatus } from '@prisma/client';
import type { RequestHandler } from './$types';

async function updateShowStatus(userId: string, showId: string) {
	const episodes = await db.episode.findMany({
		where: { season: { showId } },
		select: { id: true }
	});
	const total = episodes.length;
	if (total === 0) return;

	const watched = await db.episodeProgress.count({
		where: { userId, episodeId: { in: episodes.map((e) => e.id) } }
	});

	const userShow = await db.userShow.findUnique({
		where: { userId_showId: { userId, showId } }
	});
	if (!userShow) return;

	let status: ShowStatus;
	if (watched === 0) status = ShowStatus.PLAN_TO_WATCH;
	else if (watched === total) status = ShowStatus.COMPLETED;
	else status = ShowStatus.WATCHING;

	await db.userShow.update({
		where: { id: userShow.id },
		data: { status }
	});
}

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
			const ep = await db.episodeProgress.upsert({
				where: { userId_episodeId: { userId, episodeId: body.episodeId } },
				create: { userId, episodeId: body.episodeId },
				update: {},
				include: { episode: true }
			});
			await db.activity.create({
				data: { userId, type: 'EPISODE_WATCHED', episodeId: body.episodeId, showId: body.showId }
			});
			if (body.showId) await updateShowStatus(userId, body.showId);
			return json({ success: true, progress: ep });
		} else if (body.action === 'unwatch') {
			const episode = await db.episode.findUnique({
				where: { id: body.episodeId },
				include: { season: true }
			});
			await db.episodeProgress.deleteMany({ where: { userId, episodeId: body.episodeId } });
			if (episode) await updateShowStatus(userId, episode.season.showId);
			return json({ success: true });
		} else if (body.action === 'markSeason') {
			const season = await db.season.findUnique({
				where: { id: body.seasonId },
				include: { episodes: true }
			});
			if (!season) return json({ error: 'Season not found' }, { status: 404 });
			for (const ep of season.episodes) {
				await db.episodeProgress.upsert({
					where: { userId_episodeId: { userId, episodeId: ep.id } },
					create: { userId, episodeId: ep.id },
					update: {}
				});
			}
			await updateShowStatus(userId, season.showId);
			return json({ success: true, count: season.episodes.length });
		} else if (body.action === 'markCaughtUp') {
			const episodes = await db.episode.findMany({ where: { season: { showId: body.showId } } });
			for (const ep of episodes) {
				await db.episodeProgress.upsert({
					where: { userId_episodeId: { userId, episodeId: ep.id } },
					create: { userId, episodeId: ep.id },
					update: {}
				});
			}
			const watchedCount = await db.episodeProgress.count({
				where: { userId, episodeId: { in: episodes.map((e) => e.id) } }
			});
			const status = watchedCount === episodes.length && episodes.length > 0 ? ShowStatus.COMPLETED : ShowStatus.CAUGHT_UP;
			await db.userShow.updateMany({
				where: { userId, showId: body.showId },
				data: { status }
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
