import { listMaintenanceTickets } from '$lib/server/maintenance/store';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		tickets: listMaintenanceTickets()
	};
};
