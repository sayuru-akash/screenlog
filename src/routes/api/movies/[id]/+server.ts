import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const movieId = params.id;
	try {
		const movie = await db.movie.findUnique({ where: { id: movieId } });
		if (!movie) return json({ error: 'Movie not found' }, { status: 404 });
		const userMovie = await db.userMovie.findUnique({
			where: { userId_movieId: { userId: locals.user.id, movieId } }
		});
		return json({ movie, userMovie });
	} catch (e: any) {
		return json({ error: e.message }, { status: 500 });
	}
};
