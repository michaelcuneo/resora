import { redirect, json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db, identityProviders, organizations, passwordCredentials, users } from '@resora/db';
import { verifyPassword } from '$lib/server/auth/password';
import { createSession, SESSION_COOKIE_NAME } from '$lib/server/auth/sessions';

export async function POST({ request, cookies }) {
	const form = await request.formData();

	const organizationSlug = String(form.get('organizationSlug') ?? '').trim();
	const email = String(form.get('email') ?? '')
		.trim()
		.toLowerCase();
	const password = String(form.get('password') ?? '');

	if (!organizationSlug || !email || !password) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	const organization = await db.query.organizations.findFirst({
		where: eq(organizations.slug, organizationSlug)
	});

	if (!organization) {
		return json({ error: 'Invalid organization or credentials' }, { status: 401 });
	}

	const localProvider = await db.query.identityProviders.findFirst({
		where: and(
			eq(identityProviders.organizationId, organization.id),
			eq(identityProviders.type, 'local'),
			eq(identityProviders.enabled, true)
		)
	});

	if (!localProvider) {
		return json({ error: 'Local login is not enabled for this organization' }, { status: 403 });
	}

	const user = await db.query.users.findFirst({
		where: and(eq(users.organizationId, organization.id), eq(users.email, email))
	});

	if (!user) {
		return json({ error: 'Invalid organization or credentials' }, { status: 401 });
	}

	const credential = await db.query.passwordCredentials.findFirst({
		where: eq(passwordCredentials.userId, user.id)
	});

	if (!credential) {
		return json({ error: 'Invalid organization or credentials' }, { status: 401 });
	}

	const valid = await verifyPassword(credential.passwordHash, password);

	if (!valid) {
		return json({ error: 'Invalid organization or credentials' }, { status: 401 });
	}

	const { token, session } = await createSession({
		userId: user.id,
		organizationId: organization.id
	});

	cookies.set(SESSION_COOKIE_NAME, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: false,
		expires: session.expiresAt
	});

	throw redirect(303, '/');
}
