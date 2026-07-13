import { and, desc, eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { db, bookings, resources } from '@resora/db';

export async function GET({ locals }) {
	if (!locals.user || !locals.organization) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const organizationId = locals.organization.id;
	const userId = locals.user.id;

	const rows = await db
		.select({
			id: bookings.id,
			startAt: bookings.startAt,
			endAt: bookings.endAt,
			status: bookings.status,
			purpose: bookings.purpose,
			resourceName: resources.name
		})
		.from(bookings)
		.innerJoin(resources, eq(resources.id, bookings.resourceId))
		.where(and(eq(bookings.organizationId, organizationId), eq(bookings.userId, userId)))
		.orderBy(desc(bookings.startAt));

	return json({ bookings: rows });
}
