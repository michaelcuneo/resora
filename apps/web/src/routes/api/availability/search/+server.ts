import { and, asc, eq, gte, gt, lt } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { db, bookings, resources } from '@resora/db';

function addMilliseconds(date: Date, ms: number) {
	return new Date(date.getTime() + ms);
}

export async function POST({ request, locals }) {
	if (!locals.user || !locals.organization) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();

	const {
		resourceTypeId,
		startAt,
		endAt
	}: {
		resourceTypeId: string;
		startAt: string;
		endAt: string;
	} = body;

	if (!resourceTypeId || !startAt || !endAt) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	const organizationId = locals.organization.id;

	const start = new Date(startAt);
	const end = new Date(endAt);

	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
		return json({ error: 'Invalid date' }, { status: 400 });
	}

	if (end <= start) {
		return json({ error: 'endAt must be after startAt' }, { status: 400 });
	}

	const durationMs = end.getTime() - start.getTime();

	const allResources = await db
		.select()
		.from(resources)
		.where(
			and(
				eq(resources.organizationId, organizationId),
				eq(resources.resourceTypeId, resourceTypeId),
				eq(resources.active, true)
			)
		);

	const overlappingBookings = await db
		.select()
		.from(bookings)
		.where(
			and(
				eq(bookings.organizationId, organizationId),
				eq(bookings.status, 'confirmed'),
				lt(bookings.startAt, end),
				gt(bookings.endAt, start)
			)
		);

	const conflictedIds = new Set(overlappingBookings.map((booking) => booking.resourceId));
	const available = allResources.filter((resource) => !conflictedIds.has(resource.id));

	if (available.length > 0) {
		return json({ available, suggestions: [] });
	}

	const suggestions: Array<{
		resourceId: string;
		resourceName: string;
		suggestedStartAt: string;
		suggestedEndAt: string;
		reason: string;
	}> = [];

	for (const resource of allResources) {
		const resourceBookings = await db
			.select()
			.from(bookings)
			.where(
				and(
					eq(bookings.organizationId, organizationId),
					eq(bookings.resourceId, resource.id),
					eq(bookings.status, 'confirmed'),
					gte(bookings.endAt, start)
				)
			)
			.orderBy(asc(bookings.startAt));

		let candidateStart = new Date(start);

		for (const booking of resourceBookings) {
			const candidateEnd = addMilliseconds(candidateStart, durationMs);

			const overlapsCandidate = booking.startAt < candidateEnd && booking.endAt > candidateStart;

			if (overlapsCandidate) {
				candidateStart = new Date(booking.endAt);
			}
		}

		const candidateEnd = addMilliseconds(candidateStart, durationMs);

		suggestions.push({
			resourceId: resource.id,
			resourceName: resource.name,
			suggestedStartAt: candidateStart.toISOString(),
			suggestedEndAt: candidateEnd.toISOString(),
			reason: 'Next available time for this resource'
		});
	}

	suggestions.sort(
		(a, b) => new Date(a.suggestedStartAt).getTime() - new Date(b.suggestedStartAt).getTime()
	);

	return json({
		available: [],
		suggestions: suggestions.slice(0, 5)
	});
}
