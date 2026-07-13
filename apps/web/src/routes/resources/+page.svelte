<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';

	let { data } = $props();

	let resourceTypes: Array<{ id: string; name: string }> = $state(untrack(() => data.resourceTypes) ?? []);
	let selectedType = $state(untrack(() => resourceTypes[0]?.id) ?? '');

	let startAt = $state('');
	let endAt = $state('');
	let purpose = $state('');

	let suggestions: Array<{
		resourceId: string;
		resourceName: string;
		suggestedStartAt: string;
		suggestedEndAt: string;
		reason: string;
	}> = $state([]);

	let available: Array<{
		id: string;
		name: string;
		location: string | null;
		description: string | null;
	}> = $state([]);

	let loading = $state(false);
	let bookingIdLoading = $state('');
	let error = $state('');
	let message = $state('');

	function setLocalDateTime(date: Date) {
		const pad = (n: number) => String(n).padStart(2, '0');
		const yyyy = date.getFullYear();
		const mm = pad(date.getMonth() + 1);
		const dd = pad(date.getDate());
		const hh = pad(date.getHours());
		const mi = pad(date.getMinutes());
		return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
	}

	function setRange(start: Date, end: Date) {
		startAt = setLocalDateTime(start);
		endAt = setLocalDateTime(end);
	}

	function setTodayMorning() {
		const start = new SvelteDate();
		start.setHours(9, 0, 0, 0);
		const end = new SvelteDate(start);
		end.setHours(12, 0, 0, 0);
		setRange(start, end);
	}

	function setTomorrowAfternoon() {
		const start = new SvelteDate();
		start.setDate(start.getDate() + 1);
		start.setHours(13, 0, 0, 0);
		const end = new SvelteDate(start);
		end.setHours(17, 0, 0, 0);
		setRange(start, end);
	}

	function setNextWeekMorning() {
		const start = new SvelteDate();
		start.setDate(start.getDate() + 7);
		start.setHours(9, 0, 0, 0);
		const end = new SvelteDate(start);
		end.setHours(12, 0, 0, 0);
		setRange(start, end);
	}

	function setDuration(hours: number) {
		if (!startAt) return;
		const start = new SvelteDate(startAt);
		const end = new SvelteDate(start);
		end.setHours(end.getHours() + hours);
		endAt = setLocalDateTime(end);
	}

	function toIsoLocal(value: string) {
		return new Date(value).toISOString();
	}

	async function search() {
		loading = true;
		error = '';
		message = '';
		suggestions = [];

		const res = await fetch('/api/availability/search', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				resourceTypeId: selectedType,
				startAt: toIsoLocal(startAt),
				endAt: toIsoLocal(endAt)
			})
		});

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			error = data.error ?? 'Search failed';
			available = [];
			loading = false;
			return;
		}

		available = data.available ?? [];
		suggestions = data.suggestions ?? [];
		loading = false;
	}

	async function book(resourceId: string) {
		bookingIdLoading = resourceId;
		error = '';
		message = '';

		const res = await fetch('/api/bookings', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				resourceId,
				startAt: toIsoLocal(startAt),
				endAt: toIsoLocal(endAt),
				purpose
			})
		});

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			error = data.error ?? 'Booking failed';
			bookingIdLoading = '';
			return;
		}

		message = 'Booked successfully';
		purpose = '';
		await search();
		bookingIdLoading = '';
	}

	async function bookSuggested(resourceId: string, suggestedStartAt: string, suggestedEndAt: string) {
		bookingIdLoading = resourceId;
		error = '';
		message = '';

		const res = await fetch('/api/bookings', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				resourceId,
				startAt: suggestedStartAt,
				endAt: suggestedEndAt,
				purpose
			})
		});

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			error = data.error ?? 'Booking failed';
			bookingIdLoading = '';
			return;
		}

		message = 'Booked next available slot';
		purpose = '';
		await search();
		bookingIdLoading = '';
	}

	setTomorrowAfternoon();
</script>

<svelte:head>
	<title>Resources · Resora</title>
</svelte:head>

<div class="page">
	<header class="hero">
		<p class="eyebrow">Resora</p>
		<h1>Find resources</h1>
		<p class="sub">
			Search rooms and equipment by type, time, and actual availability.
		</p>
	</header>

	<section class="panel">
		<h2>What do you need?</h2>

		<div class="preset-row">
			<button type="button" onclick={setTodayMorning}>Today morning</button>
			<button type="button" onclick={setTomorrowAfternoon}>Tomorrow afternoon</button>
			<button type="button" onclick={setNextWeekMorning}>Next week morning</button>
		</div>

		<div class="preset-row">
			<button type="button" onclick={() => setDuration(1)}>1 hour</button>
			<button type="button" onclick={() => setDuration(2)}>2 hours</button>
			<button type="button" onclick={() => setDuration(4)}>4 hours</button>
			<button type="button" onclick={() => setDuration(8)}>Full day</button>
		</div>

		<div class="controls">
			<label>
				Resource type
				<select bind:value={selectedType} disabled={resourceTypes.length === 0}>
					{#each resourceTypes as type (type.id)}
						<option value={type.id}>{type.name}</option>
					{/each}
				</select>
			</label>

			<label>
				Start
				<input bind:value={startAt} type="datetime-local" />
			</label>

			<label>
				End
				<input bind:value={endAt} type="datetime-local" />
			</label>
		</div>

		<label>
			Purpose
			<input bind:value={purpose} type="text" placeholder="What is this booking for?" />
		</label>

		<div class="actions">
			<button class="primary" onclick={search} disabled={loading || !selectedType || !startAt || !endAt}>
				{#if loading}Searching...{:else}Find available resources{/if}
			</button>
		</div>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		{#if message}
			<p class="message">{message}</p>
		{/if}
	</section>

	<section class="section">
		<h2>Available resources</h2>

		{#if available.length === 0}
			<div class="empty">No resources available for the selected time.</div>
		{:else}
			<div class="grid">
				{#each available as resource (resource.id)}
					<article class="card">
						<div class="card-top">
							<div>
								<h3>{resource.name}</h3>
								{#if resource.location}
									<p class="muted">{resource.location}</p>
								{/if}
							</div>
						</div>

						{#if resource.description}
							<p>{resource.description}</p>
						{/if}

						<div class="card-actions">
							<button
								class="primary"
								onclick={() => book(resource.id)}
								disabled={bookingIdLoading === resource.id}
							>
								{#if bookingIdLoading === resource.id}Booking...{:else}Book{/if}
							</button>
							<a
								class="secondary-link"
								href={resolve(`/resources/${resource.id}?startAt=${encodeURIComponent(startAt)}&endAt=${encodeURIComponent(endAt)}&purpose=${encodeURIComponent(purpose)}`)}
							>
								View details
							</a>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</section>

	{#if available.length === 0 && suggestions.length > 0}
		<section class="section">
			<h2>Next best options</h2>

			<div class="grid">
				{#each suggestions as suggestion (suggestion.resourceId)}
					<article class="card">
						<h3>{suggestion.resourceName}</h3>
						<p class="muted">{suggestion.reason}</p>
						<p>
							{new Date(suggestion.suggestedStartAt).toLocaleString()} →
							{new Date(suggestion.suggestedEndAt).toLocaleString()}
						</p>

						<div class="suggestion-actions">
							<button
								class="primary"
								onclick={() =>
									bookSuggested(
										suggestion.resourceId,
										suggestion.suggestedStartAt,
										suggestion.suggestedEndAt
									)}
								disabled={bookingIdLoading === suggestion.resourceId}
							>
								{#if bookingIdLoading === suggestion.resourceId}
									Booking...
								{:else}
									Book next available
								{/if}
							</button>
							<a
								class="secondary-link"
								href={resolve(`/resources/${suggestion.resourceId}?startAt=${encodeURIComponent(suggestion.suggestedStartAt.slice(0, 16))}&endAt=${encodeURIComponent(suggestion.suggestedEndAt.slice(0, 16))}&purpose=${encodeURIComponent(purpose)}`)}
							>
								View details
							</a>
						</div>
					</article>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem;
	}

	.hero {
		margin-bottom: 2rem;
	}

	.eyebrow {
		margin: 0 0 0.5rem;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #666;
	}

	h1 {
		margin: 0;
		font-size: 2.5rem;
		line-height: 1.05;
	}

	.sub {
		max-width: 700px;
		color: #555;
		font-size: 1.05rem;
	}

	.panel,
	.card,
	.empty {
		background: white;
		border: 1px solid #e7e7ea;
		border-radius: 16px;
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.04);
	}

	.panel {
		padding: 1.25rem;
		margin-bottom: 2rem;
	}

	.controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
		margin: 1rem 0;
	}

	.preset-row {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 0.75rem;
	}

	.actions,
	.suggestion-actions,
	.card-actions {
		margin-top: 1rem;
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.section {
		margin-top: 2rem;
	}

	.grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		margin-top: 1rem;
	}

	.card {
		padding: 1rem;
	}

	.card h3 {
		margin-top: 0;
		margin-bottom: 0.4rem;
	}

	.muted {
		color: #666;
	}

	.empty {
		padding: 1rem;
		margin-top: 1rem;
		color: #666;
	}

	label {
		display: grid;
		gap: 0.45rem;
		font-weight: 600;
	}

	input,
	select,
	button {
		font: inherit;
	}

	input,
	select {
		padding: 0.8rem 0.9rem;
		border-radius: 12px;
		border: 1px solid #d8d8dd;
		background: white;
	}

	button,
	.secondary-link {
		border: 1px solid #d8d8dd;
		background: white;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		cursor: pointer;
		color: inherit;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	button.primary {
		background: #111;
		color: white;
		border-color: #111;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error {
		color: #b42318;
		margin-top: 1rem;
	}

	.message {
		color: #027a48;
		margin-top: 1rem;
	}
</style>