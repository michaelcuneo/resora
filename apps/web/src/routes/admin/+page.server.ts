import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import {
	bookings,
	db,
	organizations,
	resourceTypes,
	resources,
	users
} from '@resora/db';
import { listMaintenanceTickets } from '$lib/server/maintenance/store';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !locals.organization) {
		throw error(401, 'Authentication required');
	}

	if (locals.user.role !== 'admin') {
		throw error(403, 'Administrator access required');
	}
