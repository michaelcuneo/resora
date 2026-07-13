import { error, json, type RequestEvent } from '@sveltejs/kit';
import { getMaintenanceTicket, updateMaintenanceTicket } from '$lib/server/maintenance/store';

const allowedStatuses = new Set([
	'reported',
	'triaged',
	'scheduled',
	'in_progress',
	'waiting_parts',
	'completed'
]);

export async function GET({ params }: RequestEvent<{ ticketId: string }>) {
	const ticket = getMaintenanceTicket(params.ticketId);

	if (!ticket) {
		throw error(404, 'Maintenance ticket not found');
	}

	return json({ ticket });
}

export async function PATCH({ params, request }: RequestEvent<{ ticketId: string }>) {
	const existing = getMaintenanceTicket(params.ticketId);

	if (!existing) {
		throw error(404, 'Maintenance ticket not found');
	}

	const body = await request.json().catch(() => null);

	if (!body || typeof body !== 'object') {
		throw error(400, 'Invalid request body');
	}

	const update: {
		status?: typeof existing.status;
		assignee?: string | null;
		blockingBookings?: boolean;
	} = {};

	if ('status' in body) {
		if (typeof body.status !== 'string' || !allowedStatuses.has(body.status)) {
			throw error(400, 'Invalid maintenance status');
		}
		update.status = body.status as typeof existing.status;
	}

	if ('assignee' in body) {
		if (!(typeof body.assignee === 'string' || body.assignee === null)) {
			throw error(400, 'Invalid assignee');
		}
		update.assignee = typeof body.assignee === 'string' ? body.assignee.trim() || null : null;
	}

	if ('blockingBookings' in body) {
		if (typeof body.blockingBookings !== 'boolean') {
			throw error(400, 'Invalid blockingBookings value');
		}
		update.blockingBookings = body.blockingBookings;
	}

	const ticket = updateMaintenanceTicket(params.ticketId, update);

	if (!ticket) {
		throw error(404, 'Maintenance ticket not found');
	}

	return json({ ticket });
}
