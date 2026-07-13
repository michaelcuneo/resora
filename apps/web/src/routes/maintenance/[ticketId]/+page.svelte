<script lang="ts">
	import { resolve } from "$app/paths";

	let { data } = $props();

	type MaintenanceStatus =
		| 'reported'
		| 'triaged'
		| 'scheduled'
		| 'in_progress'
		| 'waiting_parts'
		| 'completed';

	type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

	type Ticket = {
		id: string;
		title: string;
		status: MaintenanceStatus;
		priority: MaintenancePriority;
		summary: string;
		impact: string;
		blockingBookings: boolean;
		reportedAt: string | null;
		updatedAt: string | null;
		completedAt: string | null;
		assigneeUserId: string | null;
		reportedByUserId: string | null;
		assigneeName: string | null;
		reportedByName: string;
		resource: {
			id: string;
			name: string;
			location: string | null;
			description: string | null;
			metadata: Record<string, unknown>;
		};
	};

	const ticket = $derived(data.ticket as unknown as Ticket);

	const statusLabels: Record<MaintenanceStatus, string> = {
		reported: 'Reported',
		triaged: 'Triaged',
		scheduled: 'Scheduled',
		in_progress: 'In progress',
		waiting_parts: 'Waiting parts',
		completed: 'Completed'
	};

	const priorityLabels: Record<MaintenancePriority, string> = {
		low: 'Low',
		medium: 'Medium',
		high: 'High',
		critical: 'Critical'
	};

	const featureList = $derived(Array.isArray(ticket.resource.metadata?.features)
		? (ticket.resource.metadata.features as string[])
		: []);

	const capacity = $derived(typeof ticket.resource.metadata?.capacity === 'number' ? ticket.resource.metadata.capacity : null);
</script>

<svelte:head>
	<title>{ticket.id} · Maintenance · Resora</title>
</svelte:head>

<div class="page">
	<div class="page-head">
		<a class="back-link" href={resolve("/maintenance")}>← Back to maintenance</a>
	</div>

	<header class="hero">
		<div>
			<p class="ticket-id">{ticket.id}</p>
			<h1>{ticket.title}</h1>
			<p class="sub">{ticket.resource.name} · {ticket.resource.location ?? 'No location set'}</p>
		</div>

		<div class="hero-badges">
			<span class={`priority ${ticket.priority}`}>{priorityLabels[ticket.priority]}</span>
			<span class="status">{statusLabels[ticket.status]}</span>
		</div>
	</header>

	<section class="grid">
		<article class="card">
			<h2>Ticket details</h2>

			<div class="detail-grid">
				<div>
					<p class="label">Status</p>
					<p>{statusLabels[ticket.status]}</p>
				</div>

				<div>
					<p class="label">Priority</p>
					<p>{priorityLabels[ticket.priority]}</p>
				</div>

				<div>
					<p class="label">Reported at</p>
					<p>{ticket.reportedAt ? new Date(ticket.reportedAt).toLocaleString() : 'Unknown'}</p>
				</div>

				<div>
					<p class="label">Updated at</p>
					<p>{ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : 'Unknown'}</p>
				</div>

				<div>
					<p class="label">Completed at</p>
					<p>{ticket.completedAt ? new Date(ticket.completedAt).toLocaleString() : 'Not completed'}</p>
				</div>

				<div>
					<p class="label">Blocking bookings</p>
					<p>{ticket.blockingBookings ? 'Yes' : 'No'}</p>
				</div>

				<div>
					<p class="label">Reported by</p>
					<p>{ticket.reportedByName}</p>
				</div>

				<div>
					<p class="label">Assignee</p>
					<p>{ticket.assigneeName ?? 'Unassigned'}</p>
				</div>
			</div>
		</article>

		<article class="card">
			<h2>Summary</h2>
			<p>{ticket.summary}</p>
		</article>

		<article class="card">
			<h2>Operational impact</h2>
			<p>{ticket.impact}</p>
		</article>

		<article class="card">
			<h2>Resource details</h2>

			<div class="detail-grid">
				<div>
					<p class="label">Resource name</p>
					<p>{ticket.resource.name}</p>
				</div>

				<div>
					<p class="label">Location</p>
					<p>{ticket.resource.location ?? 'No location set'}</p>
				</div>

				{#if capacity}
					<div>
						<p class="label">Capacity</p>
						<p>{capacity}</p>
					</div>
				{/if}

				<div>
					<p class="label">Resource ID</p>
					<p>{ticket.resource.id}</p>
				</div>
			</div>

			{#if ticket.resource.description}
				<div class="section-block">
					<p class="label">Description</p>
					<p>{ticket.resource.description}</p>
				</div>
			{/if}

			{#if featureList.length > 0}
				<div class="section-block">
					<p class="label">Features</p>
					<div class="feature-list">
						{#each featureList as feature (feature)}
							<span class="feature">{feature}</span>
						{/each}
					</div>
				</div>
			{/if}
		</article>

		<article class="card">
			<h2>Actions</h2>
			<div class="actions">
				<a class="button" href={resolve("/maintenance")}>Open board view</a>
				<a class="button primary" href={resolve(`/resources/${ticket.resource.id}`)}>Open resource</a>
			</div>
		</article>
	</section>
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

	.ticket-id,
	.label {
		margin: 0 0 0.35rem;
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #6b7280;
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

	.hero-badges {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr 1fr;
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

	.detail-grid p,
	.card p {
		margin-top: 0;
	}

	.section-block {
		margin-top: 1rem;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.feature-list {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.feature,
	.priority,
	.status {
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.65rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 700;
	}

	.feature,
	.status {
		background: #eef2ff;
		color: #3730a3;
	}

	.priority.low {
		background: #f3f4f6;
		color: #374151;
	}

	.priority.medium {
		background: #fff7ed;
		color: #9a3412;
	}

	.priority.high {
		background: #fef2f2;
		color: #b91c1c;
	}

	.priority.critical {
		background: #111827;
		color: white;
	}

	.button {
		border: 1px solid #d8d8dd;
		background: white;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		cursor: pointer;
		color: inherit;
		text-decoration: none;
		font: inherit;
		display: inline-flex;
		align-items: center;
	}

	.button.primary {
		background: #111827;
		border-color: #111827;
		color: white;
	}

	@media (max-width: 800px) {
		.page {
			padding: 1rem;
		}

		.hero {
			flex-direction: column;
		}

		.grid,
		.detail-grid {
			grid-template-columns: 1fr;
		}
	}
</style>