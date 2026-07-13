import type { Handle } from '@sveltejs/kit';
import { getRequestAuth } from '$lib/server/auth/context';

export const handle: Handle = async ({ event, resolve }) => {
	const auth = await getRequestAuth(event);

	event.locals.user = auth.user;
	event.locals.organization = auth.organization;
	event.locals.session = auth.session;

	return resolve(event);
};
