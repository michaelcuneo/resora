import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { bookings, db, resourceTypes, resources, users } from '@resora/db';
import { listMaintenanceTickets } from '$lib/server/maintenance/store';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !locals.organization) {
		throw error(401, 'Authentication required');
	}

	if (locals.user.role !== 'admin') {
		throw error(403, 'Administrator access required');
	}

	const organizationId = locals.organization.id;

	const [organizationUsers, organizationResources, organizationResourceTypes, recentBookings] =
		await Promise.all([
			db.select().from(users).where(eq(users.organizationId, organizationId)).orderBy(users.name),
			db
				.select({
					id: resources.id,
					name: resources.name,
					location: resources.location,
					active: resources.active,
					resourceTypeId: resources.resourceTypeId
				})
				.from(resources)
				.where(eq(resources.organizationId, organizationId))
				.orderBy(resources.name),
			db
				.select()
				.from(resourceTypes)
				.where(eq(resourceTypes.organizationId, organizationId))
				.orderBy(resourceTypes.name),
			db
				.select({
					id: bookings.id,
					resourceId: bookings.resourceId,
					userId: bookings.userId,
					startAt: bookings.startAt,
					endAt: bookings.endAt,
					status: bookings.status,
					purpose: bookings.purpose
				})
				.from(bookings)
				.where(eq(bookings.organizationId, organizationId))
				.orderBy(desc(bookings.startAt))
				.limit(12)
		]);

	const resourceById = new Map(organizationResources.map((resource) => [resource.id, resource]));
	const userById = new Map(organizationUsers.map((user) => [user.id, user]));
	const typeById = new Map(organizationResourceTypes.map((type) => [type.id, type]));

	const maintenanceTickets = listMaintenanceTickets();

	return {
		users: organizationUsers,
		resources: organizationResources.map((resource) => ({
			...resource,
			resourceTypeName: typeById.get(resource.resourceTypeId)?.name ?? 'Unknown type'
		})),
		resourceTypes: organizationResourceTypes,
		bookings: recentBookings.map((booking) => ({
			...booking,
			startAt: booking.startAt.toISOString(),
			endAt: booking.endAt.toISOString(),
			resourceName: resourceById.get(booking.resourceId)?.name ?? 'Unknown resource',
			userName: userById.get(booking.userId)?.name ?? 'Unknown user'
		})),
		maintenance: maintenanceTickets,
		organization: locals.organization
	};
};
