function toIsoLocal(value: string) {
	return new Date(value).toISOString();
}

export async function searchAvailability(
	input: AvailabilitySearchInput
): Promise<AvailabilitySearchResult> {
	const res = await fetch('/api/availability/search', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			resourceTypeId: input.resourceTypeId,
			startAt: toIsoLocal(input.startAt),
			endAt: toIsoLocal(input.endAt)
		})
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.error ?? 'Search failed');
	}

	return {
		available: data.available ?? [],
		suggestions: data.suggestions ?? []
	};
}
