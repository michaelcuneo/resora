import { error, json, type RequestEvent } from '@sveltejs/kit';
import { createMaintenanceTicket, listMaintenanceTickets } from '$lib/server/maintenance/store';

const allowedResourceTypes = new Set(['room', 'equipment']);
const allowedPriorities = new Set(['low', 'medium', 'high', 'critical']);

export async function GET() {
	return json({
		tickets: listMaintenanceTickets()
	});
}

export async function POST({ request, locals }: RequestEvent) {
	const body = await request.json().catch(() => null);

	if (!body || typeof body !== 'object') {
		throw error(400, 'Invalid request body');
	}

	const title = typeof body.title === 'string' ? body.title.trim() : '';
	const resourceName = typeof body.resourceName === 'string' ? body.resourceName.trim() : '';
	const resourceType = typeof body.resourceType === 'string' ? body.resourceType : '';
	const location = typeof body.location === 'string' ? body.location.trim() : '';
	const priority = typeof body.priority === 'string' ? body.priority : '';
	const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
	const impact = typeof body.impact === 'string' ? body.impact.trim() : '';
	const blockingBookings = Boolean(body.blockingBookings);

	if (!title) throw error(400, 'Title is required');
	if (!resourceName) throw error(400, 'Resource name is required');
	if (!allowedResourceTypes.has(resourceType)) throw error(400, 'Invalid resource type');
	if (!location) throw error(400, 'Location is required');
	if (!allowedPriorities.has(priority)) throw error(400, 'Invalid priority');
	if (!summary) throw error(400, 'Summary is required');
	if (!impact) throw error(400, 'Impact is required');

	const reportedBy = locals.user?.name?.trim() || locals.user?.email?.trim() || 'Signed in user';

	const ticket = createMaintenanceTicket({
		title,
		resourceName,
		resourceType: resourceType as 'room' | 'equipment',
		location,
		priority: priority as 'low' | 'medium' | 'high' | 'critical',
		reportedBy,
		summary,
		impact,
		blockingBookings
	});

	return json({ ticket }, { status: 201 });
}
