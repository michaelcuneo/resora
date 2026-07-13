import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type Booking = {
	id: string;
	startAt: string;
	endAt: string;
	status: string;
	purpose: string | null;
	resourceName: string;
};

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('/api/bookings/list');
	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		throw error(500, data.error ?? 'Failed to load bookings');
	}

	return {
		bookings: (data.bookings ?? []) as Booking[]
	};
};
