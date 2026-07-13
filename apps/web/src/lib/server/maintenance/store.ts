const tickets: MaintenanceTicket[] = [
	{
		id: 'mt-1001',
		title: 'Projector lamp failure',
		resourceName: 'Room B204',
		resourceType: 'room',
		location: 'Building B · Level 2',
		status: 'reported',
		priority: 'high',
		reportedAt: new Date().toISOString(),
		reportedBy: 'J. Nguyen',
		summary: 'Projector shuts off after a few minutes of use.',
		impact: 'Teaching room cannot be used for presentations.',
		assignee: null,
		blockingBookings: true
	},
	{
		id: 'mt-1002',
		title: 'Tripod leg lock broken',
		resourceName: 'Tripod Kit 07',
		resourceType: 'equipment',
		location: 'Media cage',
		status: 'triaged',
		priority: 'medium',
		reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
		reportedBy: 'A. Brown',
		summary: 'Front leg slips under load and no longer locks reliably.',
		impact: 'Unsafe for camera use.',
		assignee: 'Facilities Team',
		blockingBookings: true
	},
	{
		id: 'mt-1003',
		title: 'Air conditioning service',
		resourceName: 'Room A110',
		resourceType: 'room',
		location: 'Building A · Level 1',
		status: 'scheduled',
		priority: 'low',
		reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
		reportedBy: 'System',
		summary: 'Routine quarterly HVAC servicing.',
		impact: 'Short downtime window planned.',
		assignee: 'HVAC Contractor',
		blockingBookings: false
	},
	{
		id: 'mt-1004',
		title: 'Battery replacement',
		resourceName: 'Canon C300 Kit 03',
		resourceType: 'equipment',
		location: 'Media cage',
		status: 'in_progress',
		priority: 'medium',
		reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
		reportedBy: 'R. Patel',
		summary: 'Primary battery no longer holds charge for required duration.',
		impact: 'Kit not fit for field use.',
		assignee: 'Tech Services',
		blockingBookings: true
	},
	{
		id: 'mt-1005',
		title: 'Replacement cable on order',
		resourceName: 'Room C301',
		resourceType: 'room',
		location: 'Building C · Level 3',
		status: 'waiting_parts',
		priority: 'low',
		reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
		reportedBy: 'L. Wong',
		summary: 'Display input cable damaged.',
		impact: 'Alternate input still works.',
		assignee: 'Facilities Team',
		blockingBookings: false
	},
	{
		id: 'mt-1006',
		title: 'Door closer adjusted',
		resourceName: 'Room D105',
		resourceType: 'room',
		location: 'Building D · Ground',
		status: 'completed',
		priority: 'low',
		reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
		reportedBy: 'S. Ali',
		summary: 'Door was not closing correctly after classes.',
		impact: 'Security risk after hours.',
		assignee: 'Facilities Team',
		blockingBookings: false
	}
];

function nextTicketId() {
	const max = tickets.reduce((highest, ticket) => {
		const n = Number(ticket.id.replace('mt-', ''));
		return Number.isFinite(n) ? Math.max(highest, n) : highest;
	}, 1000);

	return `mt-${max + 1}`;
}

export function listMaintenanceTickets(): MaintenanceTicket[] {
	return tickets
		.slice()
		.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
}

export function getMaintenanceTicket(id: string): MaintenanceTicket | null {
	return tickets.find((ticket) => ticket.id === id) ?? null;
}

export function createMaintenanceTicket(input: CreateMaintenanceTicketInput): MaintenanceTicket {
	const ticket: MaintenanceTicket = {
		id: nextTicketId(),
		title: input.title,
		resourceName: input.resourceName,
		resourceType: input.resourceType,
		location: input.location,
		status: 'reported',
		priority: input.priority,
		reportedAt: new Date().toISOString(),
		reportedBy: input.reportedBy,
		summary: input.summary,
		impact: input.impact,
		assignee: null,
		blockingBookings: input.blockingBookings ?? false
	};

	tickets.unshift(ticket);
	return ticket;
}

export function updateMaintenanceTicket(
	id: string,
	input: UpdateMaintenanceTicketInput
): MaintenanceTicket | null {
	const ticket = tickets.find((entry) => entry.id === id);

	if (!ticket) return null;

	if (input.status !== undefined) {
		ticket.status = input.status;
	}

	if (input.assignee !== undefined) {
		ticket.assignee = input.assignee;
	}

	if (input.blockingBookings !== undefined) {
		ticket.blockingBookings = input.blockingBookings;
	}

	return ticket;
}
