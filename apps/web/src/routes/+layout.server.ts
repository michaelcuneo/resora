import { redirect } from '@sveltejs/kit';

export async function load({ locals, url }) {
	if (!locals.user && url.pathname !== '/login') {
		throw redirect(303, '/login');
	}

	return {
		user: locals.user,
		organization: locals.organization
	};
}
