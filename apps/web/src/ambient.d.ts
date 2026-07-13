type MaintenanceStatus =
	| 'reported'
	| 'triaged'
	| 'scheduled'
	| 'in_progress'
	| 'waiting_parts'
	| 'completed';

type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

type MaintenanceTicket = {
	id: string;
	title: string;
	resourceName: string;
	resourceType: 'room' | 'equipment';
	location: string;
	status: MaintenanceStatus;
	priority: MaintenancePriority;
	reportedAt: string;
	reportedBy: string;
	summary: string;
	impact: string;
	assignee: string | null;
	blockingBookings: boolean;
};

type UpdateMaintenanceTicketInput = {
	status?: MaintenanceStatus;
	assignee?: string | null;
	blockingBookings?: boolean;
};

type CreateMaintenanceTicketInput = {
	title: string;
	resourceName: string;
	resourceType: 'room' | 'equipment';
	location: string;
	priority: MaintenancePriority;
	reportedBy: string;
	summary: string;
	impact: string;
	blockingBookings?: boolean;
};

type MaintenanceItem = {
	id: string;
	title: string;
	resourceName: string;
	resourceType: 'room' | 'equipment' | string;
	location: string;
	status: MaintenanceStatus;
	priority: MaintenancePriority;
	reportedAt: string | null;
	summary: string;
	impact: string;
	assignee: string | null;
	blockingBookings: boolean;
};

type ResourceType = {
	id: string;
	name: string;
};

type AvailableResource = {
	id: string;
	name: string;
	location: string | null;
	description: string | null;
};

type AvailabilitySuggestion = {
	resourceId: string;
	resourceName: string;
	suggestedStartAt: string;
	suggestedEndAt: string;
	reason: string;
};

type Booking = {
	id: string;
	startAt: string;
	endAt: string;
	status: string;
	purpose: string | null;
	resourceName: string;
};

type CreateBookingInput = {
	resourceId: string;
	startAt: string;
	endAt: string;
	purpose: string;
};

type AvailabilitySearchInput = {
	resourceTypeId: string;
	startAt: string;
	endAt: string;
};

type AvailabilitySearchResult = {
	available: AvailableResource[];
	suggestions: AvailabilitySuggestion[];
};

type Booking = {
	id: string;
	startAt: string;
	endAt: string;
	status: string;
	purpose: string | null;
	resourceName: string;
};
