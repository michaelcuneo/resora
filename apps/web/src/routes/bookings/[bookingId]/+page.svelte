<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';

	let { data } = $props();

	type Booking = {
		id: string;
		startAt: string;
		endAt: string;
		status: string;
		purpose: string | null;
		resourceName: string;
	};

	const booking = untrack(() => data.booking) as Booking;

	let cancelling = $state(false);
	let error = $state('');
	let message = $state('');

	async function cancelBooking() {
		cancelling = true;
		error = '';
		message = '';

		const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		});

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			error = data.error ?? 'Failed to cancel booking';
			cancelling = false;
			return;
		}

		message = 'Booking cancelled';
		cancelling = false;
	}
</script>

<svelte:head>
	<title>{booking.resourceName} · Booking · Resora</title>
</svelte:head>

<div class="page">
	<div class="page-head">
		<a class="back-link" href={resolve("/bookings")}>← Back to bookings</a>
	</div>

	<header class="hero">
		<div>
			<p class="eyebrow">Resora</p>
			<h1>{booking.resourceName}</h1>
			<p class="sub">Booking reference: {booking.id}</p>
		</div>

		<div class="hero-meta">
			<span class={`status ${booking.status}`}>{booking.status}</span>
		</div>
	</header>

	<div class="layout">
		<section class="main-column">
			<article class="card">
				<h2>Booking details</h2>

				<div class="detail-grid">
					<div>
						<p class="label">Start</p>
						<p>{new Date(booking.startAt).toLocaleString()}</p>
					</div>

					<div>
						<p class="label">End</p>
						<p>{new Date(booking.endAt).toLocaleString()}</p>
					</div>

					<div>
						<p class="label">Status</p>
						<p class="capitalize">{booking.status}</p>
					</div>

					<div>
						<p class="label">Booking ID</p>
						<p>{booking.id}</p>
					</div>
				</div>
			</article>

			<article class="card">
				<h2>Purpose</h2>
				<p>{booking.purpose ?? 'No purpose was provided.'}</p>
			</article>
		</section>

		<aside class="side-column">
			<article class="card">
				<h2>Actions</h2>

				<div class="actions">
					<a class="button-link" href={resolve("/bookings")}>Open bookings list</a>

					{#if booking.status === 'confirmed'}
						<button class="danger" onclick={cancelBooking} disabled={cancelling}>
							{#if cancelling}Cancelling...{:else}Cancel booking{/if}
						</button>
					{/if}
				</div>

				{#if error}
					<p class="error">{error}</p>
				{/if}

				{#if message}
					<p class="message">{message}</p>
				{/if}
			</article>
		</aside>
	</div>
</div>

<style>
	.page {
		max-width: 1100px;
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

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
		gap: 1rem;
	}

	.main-column,
	.side-column {
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

	.hero-meta {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.status {
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.65rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 700;
		background: #eef2ff;
		color: #3730a3;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	button,
	.button-link {
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
		font: inherit;
	}

	.danger {
		background: #111827;
		border-color: #111827;
		color: white;
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

	.capitalize {
		text-transform: capitalize;
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