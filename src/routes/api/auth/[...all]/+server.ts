import { auth } from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';

const handler: RequestHandler = async ({ request }) => {
	return auth.handler(request);
};

export { handler as GET, handler as POST };
