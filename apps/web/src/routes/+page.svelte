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

	const upcomingBookings = $derived(
		myBookings
			.filter((booking) => new Date(booking.endAt).getTime() >= Date.now())
			.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
	);

	const upcomingCount = $derived(upcomingBookings.length);
	const confirmedCount = $derived(myBookings.filter((booking) => booking.status === 'confirmed').length);
	const recentBookings = $derived(upcomingBookings.slice(0, 3));
</script>

<svelte:head>
	<title>Dashboard · Resora</title>
</svelte:head>

<div class="page">
	<header class="hero">
		<p class="eyebrow">Resora</p>
		<h1>Dashboard</h1>
		<p class="sub">
			Get a quick view of your bookings, then jump into resources, maintenance, or the full
			bookings page.
		</p>
	</header>

	{#if error}
		<p class="error">{error}</p>
	{/if}

	<section class="stats-grid">
		<article class="stat-card">
			<p class="stat-label">Upcoming bookings</p>
			<p class="stat-value">{upcomingCount}</p>
		</article>

		<article class="stat-card">
			<p class="stat-label">Confirmed bookings</p>
			<p class="stat-value">{confirmedCount}</p>
		</article>

		<article class="stat-card">
			<p class="stat-label">Quick actions</p>
			<div class="quick-links">
				<a href={resolve("/resources")}>Find resources</a>
				<a href={resolve("/bookings")}>View bookings</a>
			</div>
		</article>
	</section>

	<section class="section">
		<div class="section-head">
			<div>
				<h2>Upcoming bookings</h2>
				<p class="section-copy">Your next confirmed and upcoming reservations.</p>
			</div>
			<div class="section-actions">
				<button class="link-button" onclick={loadBookings} disabled={loading}>
					{#if loading}Refreshing...{:else}Refresh{/if}
				</button>
				<a class="link-button" href={resolve("/bookings")}>Open bookings</a>
			</div>
		</div>

		{#if loading && myBookings.length === 0}
			<div class="empty">Loading dashboard...</div>
		{:else if recentBookings.length === 0}
			<div class="empty">
				<p>You have no upcoming bookings.</p>
				<a href={resolve("/resources")}>Find a room or equipment</a>
			</div>
		{:else}
			<div class="grid">
				{#each recentBookings as booking (booking.id)}
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
						<div class="card-actions">
							<a class="link-button" href={resolve(`/bookings/${booking.id}`)}>View booking</a>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</section>

	<section class="section action-grid">
		<a class="action-card" href={resolve("/resources")}>
			<h3>Find resources</h3>
			<p>Search rooms and equipment by availability and book what you need.</p>
		</a>

		<a class="action-card" href={resolve("/bookings")}>
			<h3>Manage bookings</h3>
			<p>Review your reservations, refresh status, and cancel when needed.</p>
		</a>

		<a class="action-card" href={resolve("/maintenance")}>
			<h3>Maintenance</h3>
			<p>Jump into operational issues, servicing, and downtime workflows.</p>
		</a>
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
		max-width: 760px;
		color: #555;
		font-size: 1.05rem;
	}

	.error {
		color: #b42318;
		margin-top: 1rem;
	}

	.stats-grid,
	.action-grid,
	.grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	}

	.stats-grid {
		margin-top: 1rem;
	}

	.stat-card,
	.card,
	.empty,
	.action-card {
		background: white;
		border: 1px solid #e7e7ea;
		border-radius: 16px;
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.04);
	}

	.stat-card,
	.card,
	.action-card {
		padding: 1rem;
	}

	.stat-label {
		margin: 0;
		color: #666;
		font-size: 0.92rem;
	}

	.stat-value {
		margin: 0.5rem 0 0;
		font-size: 2rem;
		font-weight: 700;
	}

	.quick-links {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 0.75rem;
	}

	.quick-links a,
	.link-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid #d8d8dd;
		background: white;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		color: inherit;
		text-decoration: none;
		font: inherit;
		cursor: pointer;
	}

	.section {
		margin-top: 2rem;
	}

	.section-head {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.section-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.section-copy {
		margin: 0.35rem 0 0;
		color: #666;
	}

	.card h3,
	.action-card h3 {
		margin-top: 0;
		margin-bottom: 0.4rem;
	}

	.card-actions {
		margin-top: 1rem;
	}

	.muted {
		color: #666;
	}

	.empty {
		padding: 1rem;
		color: #666;
	}

	.empty a,
	.action-card {
		color: inherit;
		text-decoration: none;
	}

	.action-card:hover,
	.quick-links a:hover,
	.link-button:hover {
		background: #fafafa;
	}

	@media (max-width: 640px) {
		.page {
			padding: 1rem;
		}

		.section-head {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>