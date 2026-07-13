<script lang="ts">
	import { resolve } from '$app/paths';
	let { data } = $props();

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

	const resource = $derived(data.resource as Resource);

	let startAt = $derived(data.startAt ?? '');
	let endAt = $derived(data.endAt ?? '');
	let purpose = $derived(data.purpose ?? '');

	let bookingLoading = $state(false);
	let error = $state('');
	let message = $state('');

	function toIsoLocal(value: string) {
		return new Date(value).toISOString();
	}

	async function book() {
		bookingLoading = true;
		error = '';
		message = '';

		const res = await fetch('/api/bookings', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				resourceId: resource.id,
				startAt: toIsoLocal(startAt),
				endAt: toIsoLocal(endAt),
				purpose
			})
		});

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			error = data.error ?? 'Booking failed';
			bookingLoading = false;
			return;
		}

		message = 'Booked successfully';
		purpose = '';
		bookingLoading = false;
	}

	const statusLabel = $derived(
		resource.status === 'available'
			? 'Available'
			: resource.status === 'maintenance'
				? 'Under maintenance'
				: 'Unavailable');
</script>

<svelte:head>
	<title>{resource.name} · Resources · Resora</title>
</svelte:head>

<div class="page">
	<div class="page-head">
		<a class="back-link" href={resolve("/resources")}>← Back to resources</a>
	</div>

	<header class="hero">
		<div>
			<p class="eyebrow">Resora</p>
			<h1>{resource.name}</h1>
			<p class="sub">{resource.location ?? 'Location not set'}</p>
		</div>

		<div class="hero-meta">
			<span class={`status ${resource.status}`}>{statusLabel}</span>
			<span class="type">{resource.type}</span>
		</div>
	</header>

	<div class="layout">
		<section class="info-column">
			<article class="card">
				<h2>Overview</h2>
				<p>{resource.description ?? 'No description available.'}</p>
			</article>

			<article class="card">
				<h2>Details</h2>
				<div class="detail-grid">
					<div>
						<p class="label">Type</p>
						<p>{resource.type}</p>
					</div>

					<div>
						<p class="label">Status</p>
						<p>{statusLabel}</p>
					</div>

					{#if resource.capacity}
						<div>
							<p class="label">Capacity</p>
							<p>{resource.capacity}</p>
						</div>
					{/if}

					<div>
						<p class="label">Resource ID</p>
						<p>{resource.id}</p>
					</div>
				</div>
			</article>

			<article class="card">
				<h2>Features</h2>
				{#if resource.features?.length}
					<div class="feature-list">
						{#each resource.features as feature (feature)}
							<span class="feature">{feature}</span>
						{/each}
					</div>
				{:else}
					<p>No features listed.</p>
				{/if}
			</article>
		</section>

		<aside class="booking-column">
			<article class="card">
				<h2>Book this resource</h2>

				{#if resource.status !== 'available'}
					<div class="notice error-notice">
						This resource is not currently available for booking.
					</div>
				{/if}

				<label>
					Start
					<input bind:value={startAt} type="datetime-local" />
				</label>

				<label>
					End
					<input bind:value={endAt} type="datetime-local" />
				</label>

				<label>
					Purpose
					<input bind:value={purpose} type="text" placeholder="What is this booking for?" />
				</label>

				<div class="actions">
					<button
						class="primary"
						onclick={book}
						disabled={bookingLoading || resource.status !== 'available' || !startAt || !endAt}
					>
						{#if bookingLoading}Booking...{:else}Book resource{/if}
					</button>
				</div>

				{#if error}
					<p class="error">{error}</p>
				{/if}

				{#if message}
					<p class="message">{message}</p>
				{/if}
			</article>

			<article class="card">
				<h2>Quick links</h2>
				<div class="quick-links">
					<a href={resolve("/resources")}>Browse resources</a>
					<a href={resolve("/bookings")}>View bookings</a>
					<a href={resolve("/maintenance")}>Open maintenance</a>
				</div>
			</article>
		</aside>
	</div>
</div>

<style>
	.page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-head {
		margin-bottom: 1rem;
	}

	.back-link {
		color: #4b5563;
		text-decoration: none;
	}

	.hero {
		display: flex;
		justify-content: space-between;
		align-items: start;
		gap: 1rem;
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

	h2 {
		margin-top: 0;
	}

	.sub {
		margin: 0.6rem 0 0;
		color: #666;
		font-size: 1.05rem;
	}

	.hero-meta {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
		gap: 1rem;
	}

	.info-column,
	.booking-column {
		display: grid;
		gap: 1rem;
		align-content: start;
	}

	.card {
		background: white;
		border: 1px solid #e7e7ea;
		border-radius: 16px;
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.04);
		padding: 1rem;
	}

	.detail-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.label {
		margin: 0 0 0.35rem;
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #6b7280;
	}

	.feature-list {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.feature,
	.status,
	.type {
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.65rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 700;
	}

	.feature,
	.type {
		background: #eef2ff;
		color: #3730a3;
	}

	.status.available {
		background: #ecfdf3;
		color: #027a48;
	}

	.status.maintenance {
		background: #fff7ed;
		color: #9a3412;
	}

	.status.unavailable {
		background: #fef2f2;
		color: #b91c1c;
	}

	label {
		display: grid;
		gap: 0.45rem;
		font-weight: 600;
		margin-top: 1rem;
	}

	input,
	button {
		font: inherit;
	}

	input {
		padding: 0.8rem 0.9rem;
		border-radius: 12px;
		border: 1px solid #d8d8dd;
		background: white;
	}

	.actions {
		margin-top: 1rem;
	}

	button,
	.quick-links a {
		border: 1px solid #d8d8dd;
		background: white;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		cursor: pointer;
		text-decoration: none;
		color: inherit;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	button.primary {
		background: #111827;
		border-color: #111827;
		color: white;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.quick-links {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.notice {
		padding: 1rem;
		border-radius: 12px;
		margin-bottom: 1rem;
	}

	.error-notice,
	.error {
		color: #b42318;
		background: #fef2f2;
	}

	.error,
	.message {
		margin-top: 1rem;
	}

	.message {
		color: #027a48;
	}

	@media (max-width: 900px) {
		.page {
			padding: 1rem;
		}

		.hero,
		.layout {
			grid-template-columns: 1fr;
			display: grid;
		}

		.detail-grid {
			grid-template-columns: 1fr;
		}
	}
</style>