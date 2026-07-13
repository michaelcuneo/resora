import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/bookings/list');
	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		throw error(500, data.error ?? 'Failed to load bookings');
	}

	const typesRes = await fetch('/api/resource-types');
	const typesData = await typesRes.json().catch(() => ({}));

	if (!typesRes.ok) {
		throw error(500, typesData.error ?? 'Failed to load resource types');
	}

	return {
		bookings: (data.bookings ?? []) as Booking[],
		resourceTypes: (typesData.types ?? []) as Array<{ id: string; name: string }>
	};
};
