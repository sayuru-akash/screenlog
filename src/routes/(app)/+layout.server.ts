import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/signin?redirect=' + encodeURIComponent(url.pathname));
	}
	return {
		user: locals.user
	};
};
