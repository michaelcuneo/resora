import { and, eq, gt, lt } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { db, bookings, resources, users } from '@resora/db';

export async function POST({ request, locals }) {
	if (!locals.user || !locals.organization) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();

	const {
		resourceId,
		startAt,
		endAt,
		purpose
	}: {
		resourceId: string;
		startAt: string;
		endAt: string;
		purpose?: string;
	} = body;

	if (!resourceId || !startAt || !endAt) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	const organizationId = locals.organization.id;
	const userId = locals.user.id;

	const start = new Date(startAt);
	const end = new Date(endAt);

	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
		return json({ error: 'Invalid date' }, { status: 400 });
	}

	if (end <= start) {
		return json({ error: 'endAt must be after startAt' }, { status: 400 });
	}

	const resource = (
		await db
			.select()
			.from(resources)
			.where(and(eq(resources.id, resourceId), eq(resources.organizationId, organizationId)))
	)[0];

	if (!resource) {
		return json({ error: 'Resource not found' }, { status: 404 });
	}

	const user = (
		await db
			.select()
			.from(users)
			.where(and(eq(users.id, userId), eq(users.organizationId, organizationId)))
	)[0];

	if (!user) {
		return json({ error: 'User not found' }, { status: 404 });
	}

	const conflicting = await db
		.select()
		.from(bookings)
		.where(
			and(
				eq(bookings.organizationId, organizationId),
				eq(bookings.resourceId, resourceId),
				eq(bookings.status, 'confirmed'),
				lt(bookings.startAt, end),
				gt(bookings.endAt, start)
			)
		);

	if (conflicting.length > 0) {
		return json({ error: 'Resource is no longer available' }, { status: 409 });
	}

	const [booking] = await db
		.insert(bookings)
		.values({
			organizationId,
			resourceId,
			userId,
			startAt: start,
			endAt: end,
			purpose,
			status: 'confirmed'
		})
		.returning();

	return json({ booking }, { status: 201 });
}
