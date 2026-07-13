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

export const load: PageServerLoad = async ({ params, fetch }) => {
	const res = await fetch('/api/bookings/list');
	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		throw error(500, data.error ?? 'Failed to load bookings');
	}

	const bookings = (data.bookings ?? []) as Booking[];
	const booking = bookings.find((item) => item.id === params.bookingId);

	if (!booking) {
		throw error(404, 'Booking not found');
	}

	return {
		booking
	};
};
