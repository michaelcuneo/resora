import { SESSION_COOKIE_NAME, validateSessionToken } from './sessions';

export async function getRequestAuth(localsOrRequestEvent: {
	cookies: {
		get: (name: string) => string | undefined;
	};
}) {
	const token = localsOrRequestEvent.cookies.get(SESSION_COOKIE_NAME);

	if (!token) {
		return {
			session: null,
			user: null,
			organization: null
		};
	}

	const sessionRow = await validateSessionToken(token);

	if (!sessionRow) {
		return {
			session: null,
			user: null,
			organization: null
		};
	}

	return {
		session: sessionRow,
		user: sessionRow.user,
		organization: sessionRow.organization
	};
}

export async function requireUser(event: {
	cookies: {
		get: (name: string) => string | undefined;
	};
}) {
	const auth = await getRequestAuth(event);

	if (!auth.user || !auth.organization) {
		throw new Error('Unauthorized');
	}

	return auth;
}
