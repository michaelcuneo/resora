import { json } from '@sveltejs/kit';
import { db, resourceTypes } from '@resora/db';
import { eq } from 'drizzle-orm';

export async function GET({ locals }) {
	if (!locals.user || !locals.organization) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const types = await db
		.select()
		.from(resourceTypes)
		.where(eq(resourceTypes.organizationId, locals.organization.id));

	return json({ types });
}
