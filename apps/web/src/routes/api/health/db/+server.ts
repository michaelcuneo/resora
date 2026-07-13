// apps/web/src/routes/api/health/db/+server.ts
import { json } from '@sveltejs/kit';
import { db, organizations } from '@resora/db';

export async function GET() {
	const orgs = await db.select().from(organizations);
	return json({ ok: true, orgs });
}
