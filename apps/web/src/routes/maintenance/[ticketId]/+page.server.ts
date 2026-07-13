import { error } from '@sveltejs/kit';
import { getMaintenanceTicket } from '$lib/server/maintenance/store';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const ticket = getMaintenanceTicket(params.ticketId);

	if (!ticket) {
		throw error(404, 'Maintenance ticket not found');
	}

	return {
		ticket
	};
};
