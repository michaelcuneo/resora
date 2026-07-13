<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();

	const activeResources = $derived(data.resources.filter((resource) => resource.active).length);
	const openMaintenance = $derived(
		data.maintenance.filter((ticket) => ticket.status !== 'completed').length
	);
	const confirmedBookings = $derived(
		data.bookings.filter((booking) => booking.status === 'confirmed').length
	);
</script>

<svelte:head>
	<title>Admin · Resora</title>
</svelte:head>

<div class="page">
	<header class="hero">
		<p class="eyebrow">Organisation administration</p>
		<h1>Admin</h1>
		<p class="sub">
			Manage {data.organization.name}, review operational activity, and monitor the health of
			resources and bookings.
		</p>
	</header>

	<section class="stats-grid" aria-label="Organisation summary">
		<article class="stat-card">
			<p class="stat-label">Users</p>
			<p class="stat-value">{data.users.length}</p>
			<p class="stat-note">People with organisation access</p>
		</article>

		<article class="stat-card">
			<p class="stat-label">Active resources</p>
			<p class="stat-value">{activeResources}</p>
			<p class="stat-note">Across {data.resourceTypes.length} resource types</p>
		</article>

		<article class="stat-card">
			<p class="stat-label">Confirmed bookings</p>
			<p class="stat-value">{confirmedBookings}</p>
			<p class="stat-note">Within the latest booking activity</p>
		</article>

		<article class="stat-card">
			<p class="stat-label">Open maintenance</p>
			<p class="stat-value">{openMaintenance}</p>
			<p class="stat-note">Tickets still requiring attention</p>
		</article>
	</section>

	<section class="admin-grid">
		<article class="panel users-panel">
			<div class="panel-head">
				<div>
					<p class="panel-kicker">Access</p>
					<h2>Organisation users</h2>
				</div>
				<span class="count">{data.users.length}</span>
			</div>

			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Role</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{#each data.users as user (user.id)}
							<tr>
								<td data-label="Name"><strong>{user.name}</strong></td>
								<td data-label="Email">{user.email}</td>
								<td data-label="Role"><span class="badge">{user.role}</span></td>
								<td data-label="Status"><span class="status" data-status={user.status}>{user.status}</span></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</article>

		<article class="panel resource-panel">
			<div class="panel-head">
				<div>
					<p class="panel-kicker">Inventory</p>
					<h2>Resources</h2>
				</div>
				<a class="text-link" href={resolve('/resources')}>Open resources</a>
			</div>

			<div class="resource-list">
				{#each data.resources.slice(0, 8) as resource (resource.id)}
					<div class="resource-row">
						<div>
							<p class="resource-name">{resource.name}</p>
							<p class="muted">{resource.resourceTypeName} · {resource.location ?? 'No location'}</p>
						</div>
						<span class="status" data-status={resource.active ? 'active' : 'inactive'}>
							{resource.active ? 'Active' : 'Inactive'}
						</span>
					</div>
				{/each}
			</div>
		</article>
	</section>

	<section class="admin-grid lower-grid">
		<article class="panel">
			<div class="panel-head">
				<div>
					<p class="panel-kicker">Activity</p>
					<h2>Recent bookings</h2>
				</div>
				<a class="text-link" href={resolve('/bookings')}>View all</a>
			</div>

			<div class="activity-list">
				{#each data.bookings.slice(0, 6) as booking (booking.id)}
					<a class="activity-row" href={resolve(`/bookings/${booking.id}`)}>
						<div>
							<p class="activity-title">{booking.resourceName}</p>
							<p class="muted">{booking.userName} · {new Date(booking.startAt).toLocaleString()}</p>
						</div>
						<span class="badge">{booking.status}</span>
					</a>
				{/each}
			</div>
		</article>

		<article class="panel">
			<div class="panel-head">
				<div>
					<p class="panel-kicker">Operations</p>
					<h2>Maintenance pressure</h2>
				</div>
				<a class="text-link" href={resolve('/maintenance')}>Open maintenance</a>
			</div>

			<div class="activity-list">
				{#each data.maintenance.filter((ticket) => ticket.status !== 'completed').slice(0, 6) as ticket (ticket.id)}
					<a class="activity-row" href={resolve(`/maintenance/${ticket.id}`)}>
						<div>
							<p class="activity-title">{ticket.title}</p>
							<p class="muted">{ticket.resourceName} · {ticket.location}</p>
						</div>
						<span class="priority" data-priority={ticket.priority}>{ticket.priority}</span>
					</a>
				{:else}
					<div class="empty">No open maintenance tickets.</div>
				{/each}
			</div>
		</article>
	</section>
</div>

<style>
	.page {
		width: 100%;
		max-width: 1600px;
		margin: 0 auto;
		padding: 2rem;
	}

	.hero {
		margin-bottom: 2rem;
	}

	.eyebrow,
	.panel-kicker {
		margin: 0 0 0.45rem;
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #6b7280;
	}

	h1,
	h2,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 0.6rem;
		font-size: 2.5rem;
		line-height: 1.05;
	}

	h2 {
		margin-bottom: 0;
		font-size: 1.2rem;
	}

	.sub {
		max-width: 760px;
		margin-bottom: 0;
		color: #4b5563;
		font-size: 1.05rem;
	}

	.stats-grid,
	.admin-grid {
		display: grid;
		gap: 1rem;
	}

	.stats-grid {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	.admin-grid {
		grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr);
		margin-top: 1rem;
		align-items: start;
	}

	.lower-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.stat-card,
	.panel {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 20px;
		box-shadow: 0 6px 24px rgba(17, 24, 39, 0.04);
	}

	.stat-card {
		padding: 1rem;
	}

	.stat-label,
	.stat-note,
	.muted {
		color: #6b7280;
	}

	.stat-label,
	.stat-note {
		margin-bottom: 0;
	}

	.stat-value {
		margin: 0.35rem 0;
		font-size: 2rem;
		font-weight: 750;
	}

	.stat-note {
		font-size: 0.85rem;
	}

	.panel {
		padding: 1rem;
		min-width: 0;
	}

	.panel-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.count,
	.badge,
	.status,
	.priority {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		font-size: 0.76rem;
		font-weight: 700;
		text-transform: capitalize;
		white-space: nowrap;
	}

	.count,
	.badge {
		padding: 0.3rem 0.6rem;
		background: #f3f4f6;
		color: #374151;
	}

	.status,
	.priority {
		padding: 0.3rem 0.6rem;
		background: #ecfdf3;
		color: #027a48;
	}

	.status[data-status='inactive'],
	.status[data-status='disabled'] {
		background: #f3f4f6;
		color: #6b7280;
	}

	.priority[data-priority='high'] {
		background: #fef2f2;
		color: #b91c1c;
	}

	.priority[data-priority='critical'] {
		background: #111827;
		color: white;
	}

	.text-link {
		font-size: 0.88rem;
		font-weight: 650;
		color: #374151;
	}

	.table-wrap {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.8rem 0.65rem;
		text-align: left;
		border-bottom: 1px solid #eef0f2;
	}

	th {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #6b7280;
	}

	td {
		font-size: 0.9rem;
	}

	.resource-list,
	.activity-list {
		display: grid;
	}

	.resource-row,
	.activity-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0.85rem 0;
		border-bottom: 1px solid #eef0f2;
	}

	.resource-row:last-child,
	.activity-row:last-child {
		border-bottom: 0;
	}

	.resource-name,
	.activity-title {
		margin: 0;
		font-weight: 700;
	}

	.muted {
		margin: 0.2rem 0 0;
		font-size: 0.86rem;
	}

	.activity-row {
		color: inherit;
		text-decoration: none;
	}

	.activity-row:hover {
		background: #fafafa;
	}

	.empty {
		padding: 1rem 0;
		color: #6b7280;
	}

	@media (max-width: 1200px) {
		.stats-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.admin-grid,
		.lower-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (max-width: 700px) {
		.page {
			padding: 1rem;
		}

		.stats-grid {
			grid-template-columns: minmax(0, 1fr);
		}

		.panel-head,
		.resource-row,
		.activity-row {
			align-items: flex-start;
		}

		table,
		thead,
		tbody,
		tr,
		th,
		td {
			display: block;
		}

		thead {
			display: none;
		}

		tr {
			padding: 0.75rem 0;
			border-bottom: 1px solid #eef0f2;
		}

		td {
			display: flex;
			justify-content: space-between;
			gap: 1rem;
			padding: 0.35rem 0;
			border: 0;
			text-align: right;
		}

		td::before {
			content: attr(data-label);
			font-weight: 700;
			color: #6b7280;
			text-align: left;
		}
	}
</style>
