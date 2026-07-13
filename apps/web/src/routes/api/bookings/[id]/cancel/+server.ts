import { and, eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { db, bookings } from '@resora/db';

export async function POST({ params, locals }) {
	if (!locals.user || !locals.organization) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;
	const organizationId = locals.organization.id;
	const userId = locals.user.id;

	const existing = (
		await db
			.select()
			.from(bookings)
			.where(
				and(
					eq(bookings.id, id),
					eq(bookings.organizationId, organizationId),
					eq(bookings.userId, userId)
				)
			)
	)[0];

	if (!existing) {
		return json({ error: 'Booking not found' }, { status: 404 });
	}

	await db
		.update(bookings)
		.set({
			status: 'cancelled',
			cancelledAt: new Date()
		})
		.where(eq(bookings.id, id));

	return json({ ok: true });
}
