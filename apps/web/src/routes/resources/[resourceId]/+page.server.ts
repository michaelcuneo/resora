import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type Resource = {
	id: string;
	name: string;
	location: string | null;
	description: string | null;
	type: string;
	status: 'available' | 'maintenance' | 'unavailable';
	capacity?: number | null;
	features?: string[];
};

const resourceCatalog: Resource[] = [
	{
		id: 'room-b204',
		name: 'Room B204',
		location: 'Building B · Level 2',
		description: 'Teaching room with ceiling projector and hybrid conferencing setup.',
		type: 'Room',
		status: 'available',
		capacity: 32,
		features: ['Projector', 'Whiteboard', 'Hybrid conferencing']
	},
	{
		id: 'room-a110',
		name: 'Room A110',
		location: 'Building A · Level 1',
		description: 'Large classroom used for lectures and workshops.',
		type: 'Room',
		status: 'maintenance',
		capacity: 48,
		features: ['Large display', 'Lectern audio', 'Air conditioning']
	},
	{
		id: 'canon-c300-kit-03',
		name: 'Canon C300 Kit 03',
		location: 'Media cage',
		description: 'Cinema camera kit with battery set, media cards, and tripod plate.',
		type: 'Equipment',
		status: 'available',
		features: ['Camera body', 'Battery kit', 'Media cards']
	},
	{
		id: 'tripod-kit-07',
		name: 'Tripod Kit 07',
		location: 'Media cage',
		description: 'Heavy-duty tripod for camera studio and field use.',
		type: 'Equipment',
		status: 'unavailable',
		features: ['Tripod head', 'Quick release plate']
	}
];

export const load: PageServerLoad = async ({ params, url }) => {
	const resource =
		resourceCatalog.find((item) => item.id === params.resourceId) ??
		resourceCatalog.find(
			(item) => item.id.toLowerCase() === decodeURIComponent(params.resourceId).toLowerCase()
		);

	if (!resource) {
		throw error(404, 'Resource not found');
	}

	const startAt = url.searchParams.get('startAt') ?? '';
	const endAt = url.searchParams.get('endAt') ?? '';
	const purpose = url.searchParams.get('purpose') ?? '';

	return {
		resource,
		startAt,
		endAt,
		purpose
	};
};
