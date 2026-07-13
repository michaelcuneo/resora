function toIsoLocal(value: string) {
	return new Date(value).toISOString();
}

export async function listMyBookings(): Promise<Booking[]> {
	const res = await fetch('/api/bookings/list');
	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.error ?? 'Failed to load bookings');
	}

	return data.bookings ?? [];
}

export async function createBooking(input: CreateBookingInput): Promise<void> {
	const res = await fetch('/api/bookings', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			resourceId: input.resourceId,
			startAt: toIsoLocal(input.startAt),
			endAt: toIsoLocal(input.endAt),
			purpose: input.purpose
		})
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.error ?? 'Booking failed');
	}
}

export async function createSuggestedBooking(input: CreateBookingInput): Promise<void> {
	const res = await fetch('/api/bookings', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			resourceId: input.resourceId,
			startAt: input.startAt,
			endAt: input.endAt,
			purpose: input.purpose
		})
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.error ?? 'Booking failed');
	}
}

export async function cancelBooking(id: string): Promise<void> {
	const res = await fetch(`/api/bookings/${id}/cancel`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' }
	});

	if (!res.ok) {
		let message = 'Failed to cancel booking';

		try {
			const data = await res.json();
			message = data.error ?? message;
		} catch {
			// ignore invalid json
		}

		throw new Error(message);
	}
}
