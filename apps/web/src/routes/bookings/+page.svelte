<script lang="ts">
	import { resolve } from '$app/paths';
	import { untrack } from 'svelte';

	let { data } = $props();

	type Booking = {
		id: string;
		startAt: string;
		endAt: string;
		status: string;
		purpose: string | null;
		resourceName: string;
	};

	let myBookings = $state<Booking[]>(untrack(() => data.bookings) ?? []);

	let loading = $state(false);
	let error = $state('');
	let message = $state('');

	async function loadBookings() {
		loading = true;
		error = '';

		const res = await fetch('/api/bookings/list');
		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			error = data.error ?? 'Failed to load bookings';
			myBookings = [];
			loading = false;
			return;
		}

		myBookings = data.bookings ?? [];
		loading = false;
	}

	async function cancel(id: string) {
		error = '';
		message = '';

		const res = await fetch(`/api/bookings/${id}/cancel`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		});

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			error = data.error ?? 'Failed to cancel booking';
			return;
		}

		message = 'Booking cancelled';
		await loadBookings();
	}
</script>

<svelte:head>
	<title>Bookings · Resora</title>
</svelte:head>

<div class="page">
	<header class="hero">
		<p class="eyebrow">Resora</p>
		<h1>My bookings</h1>
		<p class="sub">View, refresh, and cancel your current bookings.</p>
	</header>

	<section class="section">
		<div class="section-head">
			<h2>Bookings</h2>
			<button onclick={loadBookings} disabled={loading}>
				{#if loading}Refreshing...{:else}Refresh{/if}
			</button>
		</div>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		{#if message}
			<p class="message">{message}</p>
		{/if}

		{#if loading && myBookings.length === 0}
			<div class="empty">Loading bookings...</div>
		{:else if myBookings.length === 0}
			<div class="empty">You have no bookings yet.</div>
		{:else}
			<div class="grid">
				{#each myBookings as booking (booking.id)}
					<article class="card">
						<h3>{booking.resourceName}</h3>

						<p class="muted">
							{new Date(booking.startAt).toLocaleString()} →
							{new Date(booking.endAt).toLocaleString()}
						</p>

						<p>Status: {booking.status}</p>

						{#if booking.purpose}
							<p>{booking.purpose}</p>
						{/if}

						<div class="actions">
							<a class="secondary-link" href={resolve(`/bookings/${booking.id}`)}>View details</a>

							{#if booking.status === 'confirmed'}
								<button onclick={() => cancel(booking.id)}>Cancel</button>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</section>
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

	.section {
		margin-top: 2rem;
	}

	.section-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		margin-top: 1rem;
	}

	.card,
	.empty {
		background: white;
		border: 1px solid #e7e7ea;
		border-radius: 16px;
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.04);
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

	.actions {
		margin-top: 1rem;
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	button,
	.secondary-link {
		font: inherit;
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