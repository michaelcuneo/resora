export async function listResourceTypes(): Promise<ResourceType[]> {
	const res = await fetch('/api/resource-types');
	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.error ?? 'Failed to load resource types');
	}

	return data.types ?? [];
}
