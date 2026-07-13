import { redirect } from '@sveltejs/kit';
import { revokeSessionToken, SESSION_COOKIE_NAME } from '$lib/server/auth/sessions';

export async function POST({ cookies }) {
	const token = cookies.get(SESSION_COOKIE_NAME);

	if (token) {
		await revokeSessionToken(token);
	}

	cookies.delete(SESSION_COOKIE_NAME, {
		path: '/'
	});

	throw redirect(303, '/login');
}
