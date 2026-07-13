import crypto from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { db, organizations, sessions, users } from '@resora/db';

export const SESSION_COOKIE_NAME = 'resora_session';

function sha256(value: string) {
	return crypto.createHash('sha256').update(value).digest('hex');
}

export function generateSessionToken() {
	return crypto.randomBytes(32).toString('base64url');
}

export async function createSession(params: {
	userId: string;
	organizationId: string;
	expiresInDays?: number;
}) {
	const token = generateSessionToken();
	const tokenHash = sha256(token);

	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + (params.expiresInDays ?? 14));

	const [session] = await db
		.insert(sessions)
		.values({
			userId: params.userId,
			organizationId: params.organizationId,
			tokenHash,
			expiresAt
		})
		.returning();

	return {
		session,
		token
	};
}

export async function validateSessionToken(token: string) {
	const tokenHash = sha256(token);

	const sessionRow = (await db.select().from(sessions).where(eq(sessions.tokenHash, tokenHash)))[0];

	if (!sessionRow) return null;

	if (sessionRow.expiresAt <= new Date()) {
		await db.delete(sessions).where(eq(sessions.id, sessionRow.id));
		return null;
	}

	const user = (
		await db
			.select()
			.from(users)
			.where(
				and(eq(users.id, sessionRow.userId), eq(users.organizationId, sessionRow.organizationId))
			)
	)[0];

	if (!user) {
		return null;
	}

	const organization = (
		await db.select().from(organizations).where(eq(organizations.id, sessionRow.organizationId))
	)[0];

	if (!organization) {
		return null;
	}

	await db.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.id, sessionRow.id));

	return {
		...sessionRow,
		user,
		organization
	};
}

export async function revokeSessionToken(token: string) {
	const tokenHash = sha256(token);
	await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}
