<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';

	let { data } = $props();

	const statusOrder: MaintenanceStatus[] = [
		'reported',
		'triaged',
		'scheduled',
		'in_progress',
		'waiting_parts',
		'completed'
	];

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

	let items = $state<MaintenanceItem[]>(untrack(() => data.tickets) ?? []);
	let updating = $state(false);
	let creating = $state(false);
	let error = $state('');
	let message = $state('');

	let selectedStatus = $state<'all' | MaintenanceStatus>('all');
	let selectedPriority = $state<'all' | MaintenancePriority>('all');
	let search = $state('');
	let selectedId = $state<string | null>(untrack(() => items[0]?.id) ?? null);

	let reportTitle = $state('');
	let reportResourceName = $state('');
	let reportResourceType = $state<'room' | 'equipment'>('room');
	let reportLocation = $state('');
	let reportPriority = $state<MaintenancePriority>('medium');
	let reportSummary = $state('');
	let reportImpact = $state('');
	let reportBlockingBookings = $state(false);

	const filteredItems = $derived(
		items.filter((item) => {
			const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
			const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority;

			const q = search.trim().toLowerCase();
			const matchesSearch =
				q.length === 0 ||
				item.title.toLowerCase().includes(q) ||
				item.resourceName.toLowerCase().includes(q) ||
				item.location.toLowerCase().includes(q) ||
				item.id.toLowerCase().includes(q);

			return matchesStatus && matchesPriority && matchesSearch;
		})
	);

	const selectedItem = $derived(
		filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0] ?? null
	);

	const openCount = $derived(items.filter((item) => item.status !== 'completed').length);
	const blockingCount = $derived(items.filter((item) => item.blockingBookings).length);
	const criticalCount = $derived(items.filter((item) => item.priority === 'critical').length);

	const grouped = $derived(
		statusOrder.map((status) => ({
			status,
			label: statusLabels[status],
			items: filteredItems.filter((item) => item.status === status)
		}))
	);

	function selectItem(id: string) {
		selectedId = id;
		error = '';
		message = '';
	}

	function mergeUpdatedTicket(updated: MaintenanceItem) {
		items = items.map((item) => (item.id === updated.id ? updated : item));
		selectedId = updated.id;
	}

	function prependTicket(ticket: MaintenanceItem) {
		items = [ticket, ...items];
		selectedId = ticket.id;
	}

	function resetReportForm() {
		reportTitle = '';
		reportResourceName = '';
		reportResourceType = 'room';
		reportLocation = '';
		reportPriority = 'medium';
		reportSummary = '';
		reportImpact = '';
		reportBlockingBookings = false;
	}

	async function patchSelected(body: {
		status?: MaintenanceStatus;
		assignee?: string | null;
		blockingBookings?: boolean;
	}) {
		if (!selectedItem) return;

		updating = true;
		error = '';
		message = '';

		const res = await fetch(`/api/maintenance/tickets/${selectedItem.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			error = data.error ?? 'Failed to update maintenance ticket';
			updating = false;
			return;
		}

		if (data.ticket) {
			mergeUpdatedTicket(data.ticket as MaintenanceItem);
		}

		message = 'Maintenance ticket updated';
		updating = false;
	}

	async function createTicket() {
		creating = true;
		error = '';
		message = '';

		const res = await fetch('/api/maintenance/tickets', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title: reportTitle,
				resourceName: reportResourceName,
				resourceType: reportResourceType,
				location: reportLocation,
				priority: reportPriority,
				summary: reportSummary,
				impact: reportImpact,
				blockingBookings: reportBlockingBookings
			})
		});

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			error = data.error ?? 'Failed to create maintenance ticket';
			creating = false;
			return;
		}

		if (data.ticket) {
			prependTicket(data.ticket as MaintenanceItem);
		}

		resetReportForm();
		message = 'Maintenance ticket reported';
		creating = false;
	}

	async function updateStatus(status: MaintenanceStatus) {
		await patchSelected({ status });
	}

	async function assignSelected() {
		if (!selectedItem) return;

		const nextAssignee = selectedItem.assignee ?? 'Facilities Team';
		const nextStatus = selectedItem.status === 'reported' ? 'triaged' : selectedItem.status;

		await patchSelected({
			assignee: nextAssignee,
			status: nextStatus
		});
	}

	async function toggleBlocking() {
		if (!selectedItem) return;
		await patchSelected({
			blockingBookings: !selectedItem.blockingBookings
		});
	}

	$effect(() => {
		if (selectedItem) return;
		if (filteredItems.length > 0) {
			selectedId = filteredItems[0].id;
		}
	});
</script>

<svelte:head>
	<title>Maintenance · Resora</title>
</svelte:head>

<div class="page">
	<header class="hero">
		<p class="eyebrow">Resora</p>
		<h1>Maintenance</h1>
		<p class="sub">
			Track faults, service work, and operational downtime for rooms and equipment.
		</p>
	</header>

	<section class="stats-grid">
		<article class="stat-card">
			<p class="stat-label">Open tickets</p>
			<p class="stat-value">{openCount}</p>
		</article>

		<article class="stat-card">
			<p class="stat-label">Blocking bookings</p>
			<p class="stat-value">{blockingCount}</p>
		</article>

		<article class="stat-card">
			<p class="stat-label">Critical issues</p>
			<p class="stat-value">{criticalCount}</p>
		</article>
	</section>

	<section class="report-card">
		<div class="section-head">
			<div>
				<h2>Report maintenance issue</h2>
				<p class="section-copy">
					Log a new fault or servicing requirement for a room or equipment item.
				</p>
			</div>
		</div>

		<div class="report-grid">
			<label>
				Title
				<input bind:value={reportTitle} type="text" placeholder="Short issue title" />
			</label>

			<label>
				Resource name
				<input
					bind:value={reportResourceName}
					type="text"
					placeholder="Room B204 or Canon C300 Kit 03"
				/>
			</label>

			<label>
				Resource type
				<select bind:value={reportResourceType}>
					<option value="room">Room</option>
					<option value="equipment">Equipment</option>
				</select>
			</label>

			<label>
				Location
				<input bind:value={reportLocation} type="text" placeholder="Building B · Level 2" />
			</label>

			<label>
				Priority
				<select bind:value={reportPriority}>
					<option value="low">Low</option>
					<option value="medium">Medium</option>
					<option value="high">High</option>
					<option value="critical">Critical</option>
				</select>
			</label>

			<label class="checkbox-label">
				<span>Block bookings</span>
				<input bind:checked={reportBlockingBookings} type="checkbox" />
			</label>

			<label class="full">
				Summary
				<textarea bind:value={reportSummary} rows="3" placeholder="Describe the fault"></textarea>
			</label>

			<label class="full">
				Operational impact
				<textarea
					bind:value={reportImpact}
					rows="3"
					placeholder="Explain what this prevents or affects"
				></textarea>
			</label>
		</div>

		<div class="actions">
			<button class="primary" onclick={createTicket} disabled={creating}>
				{#if creating}Reporting...{:else}Report issue{/if}
			</button>
		</div>
	</section>

	<section class="filters">
		<label>
			Search
			<input bind:value={search} type="text" placeholder="Search ticket, resource, or location" />
		</label>

		<label>
			Status
			<select bind:value={selectedStatus}>
				<option value="all">All statuses</option>
				{#each statusOrder as statusOption (statusOption)}
					<option value={statusOption}>{statusLabels[statusOption]}</option>
				{/each}
			</select>
		</label>

		<label>
			Priority
			<select bind:value={selectedPriority}>
				<option value="all">All priorities</option>
				<option value="low">Low</option>
				<option value="medium">Medium</option>
				<option value="high">High</option>
				<option value="critical">Critical</option>
			</select>
		</label>
	</section>

	{#if error}
		<div class="notice error-notice">{error}</div>
	{/if}

	{#if message}
		<div class="notice success-notice">{message}</div>
	{/if}

	<section class="workspace">
		<div class="board">
			{#each grouped as group (group.status)}
				<section class="column">
					<div class="column-head">
						<h2>{group.label}</h2>
						<span>{group.items.length}</span>
					</div>

					{#if group.items.length === 0}
						<div class="empty">No tickets</div>
					{:else}
						<div class="column-list">
							{#each group.items as item (item.id)}
								<div class="ticket" data-selected={selectedItem?.id === item.id}>
									<button
										type="button"
										class="ticket-select"
										onclick={() => selectItem(item.id)}
									>
										<div class="ticket-top">
											<span class="ticket-id">{item.id}</span>
											<span class={`priority ${item.priority}`}>
												{priorityLabels[item.priority]}
											</span>
										</div>

										<h3>{item.title}</h3>
										<p class="resource">{item.resourceName}</p>
										<p class="muted">{item.location}</p>

										<div class="ticket-meta">
											<span class={`resource-type ${item.resourceType}`}>
												{item.resourceType}
											</span>

											{#if item.blockingBookings}
												<span class="blocking">Blocking bookings</span>
											{/if}
										</div>
									</button>

									<a class="detail-link" href={resolve(`/maintenance/${item.id}`)}>Open detail</a>
								</div>
							{/each}
						</div>
					{/if}
				</section>
			{/each}
		</div>

		<aside class="detail">
			{#if selectedItem}
				<div class="detail-card">
					<div class="detail-head">
						<div>
							<p class="ticket-id">{selectedItem.id}</p>
							<h2>{selectedItem.title}</h2>
							<p class="muted">{selectedItem.resourceName} · {selectedItem.location}</p>
						</div>
						<span class={`priority ${selectedItem.priority}`}>{priorityLabels[selectedItem.priority]}</span>
					</div>

					<div class="detail-grid">
						<div>
							<p class="detail-label">Status</p>
							<select
								value={selectedItem.status}
								disabled={updating}
								onchange={(e) =>
									updateStatus(
										(e.currentTarget as HTMLSelectElement).value as MaintenanceStatus
									)}
							>
								{#each statusOrder as statusOption (statusOption)}
									<option value={statusOption}>{statusLabels[statusOption]}</option>
								{/each}
							</select>
						</div>

						<div>
							<p class="detail-label">Assignee</p>
							<p>{selectedItem.assignee ?? 'Unassigned'}</p>
						</div>

						<div>
							<p class="detail-label">Reported at</p>
							<p>{selectedItem.reportedAt ? new Date(selectedItem.reportedAt).toLocaleString() : 'Unknown'}</p>
						</div>

						<div>
							<p class="detail-label">Blocking bookings</p>
							<p>{selectedItem.blockingBookings ? 'Yes' : 'No'}</p>
						</div>
					</div>

					<div class="detail-section">
						<p class="detail-label">Summary</p>
						<p>{selectedItem.summary}</p>
					</div>

					<div class="detail-section">
						<p class="detail-label">Operational impact</p>
						<p>{selectedItem.impact}</p>
					</div>

					<div class="actions">
						<button class="primary" onclick={assignSelected} disabled={updating}>
							{#if updating}Updating...{:else}Assign to facilities{/if}
						</button>
						<button onclick={toggleBlocking} disabled={updating}>
							{selectedItem.blockingBookings ? 'Allow bookings' : 'Block bookings'}
						</button>
						<a class="button-link" href={resolve(`/maintenance/${selectedItem.id}`)}>Open ticket page</a>
					</div>
				</div>
			{:else}
				<div class="detail-card empty-state">
					<h2>No ticket selected</h2>
					<p>Choose a maintenance item from the board to inspect details.</p>
				</div>
			{/if}
		</aside>
	</section>
</div>

<style>
	.page {
		max-width: 1440px;
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

	h2 {
		margin: 0;
	}

	.sub {
		max-width: 760px;
		color: #555;
		font-size: 1.05rem;
	}

	.section-head {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.section-copy {
		margin: 0.35rem 0 0;
		color: #666;
	}

	.stats-grid,
	.filters,
	.report-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}

	.report-grid .full {
		grid-column: 1 / -1;
	}

	.report-card,
	.stat-card,
	.column,
	.detail-card,
	.ticket,
	.empty,
	.notice {
		background: white;
		border: 1px solid #e7e7ea;
		border-radius: 20px;
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.04);
	}

	.report-card,
	.stat-card {
		padding: 1rem;
	}

	.report-card {
		margin-top: 1.5rem;
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

	.filters {
		margin-top: 1.5rem;
	}

	label {
		display: grid;
		gap: 0.45rem;
		font-weight: 600;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.8rem 0.9rem;
		border: 1px solid #d8d8dd;
		border-radius: 12px;
		background: white;
	}

	input,
	select,
	textarea,
	button {
		font: inherit;
	}

	input,
	select,
	textarea {
		padding: 0.8rem 0.9rem;
		border-radius: 12px;
		border: 1px solid #d8d8dd;
		background: white;
		resize: vertical;
	}

	.notice {
		padding: 1rem;
		margin-top: 1rem;
	}

	.error-notice {
		color: #b42318;
	}

	.success-notice {
		color: #027a48;
	}

	.workspace {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 380px;
		gap: 1rem;
		margin-top: 1.5rem;
		align-items: start;
	}

	.board {
		display: grid;
		grid-template-columns: repeat(6, minmax(280px, 1fr));
		gap: 1rem;
		overflow-x: auto;
		padding-bottom: 0.25rem;
	}

	.column {
		padding: 0.9rem;
		background: #f8f8f9;
	}

	.column-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.9rem;
	}

	.column-head h2 {
		font-size: 1rem;
	}

	.column-head span {
		color: #666;
		font-size: 0.9rem;
		flex: 0 0 auto;
	}

	.column-list {
		display: grid;
		gap: 0.75rem;
	}

	.ticket {
		padding: 0.85rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 18px;
		transition:
			transform 140ms ease,
			border-color 140ms ease,
			box-shadow 140ms ease;
	}

	.ticket:hover {
		transform: translateY(-1px);
	}

	.ticket[data-selected='true'] {
		border-color: #111827;
		box-shadow: 0 10px 28px rgba(17, 24, 39, 0.08);
	}

	.ticket-select {
		width: 100%;
		border: 0;
		background: transparent;
		padding: 0;
		text-align: left;
		cursor: pointer;
		display: block;
	}

	.ticket-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.ticket-id {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #6b7280;
	}

	.ticket h3 {
		margin: 0 0 0.45rem;
		font-size: 1.05rem;
		line-height: 1.25;
		word-break: break-word;
	}

	.resource {
		margin: 0;
		font-weight: 700;
		line-height: 1.25;
	}

	.muted {
		margin: 0.3rem 0 0;
		color: #666;
		line-height: 1.35;
	}

	.ticket-meta {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-top: 0.85rem;
	}

	.resource-type,
	.blocking,
	.priority {
		display: inline-flex;
		align-items: center;
		padding: 0.28rem 0.55rem;
		border-radius: 999px;
		font-size: 0.76rem;
		font-weight: 700;
		white-space: nowrap;
	}

	.resource-type {
		background: #eef2ff;
		color: #3730a3;
	}

	.resource-type.equipment {
		background: #ecfeff;
		color: #155e75;
	}

	.blocking {
		background: #fef2f2;
		color: #991b1b;
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

	.detail-link {
		margin-top: 0.8rem;
		width: 100%;
	}

	.detail-card {
		padding: 1rem;
		position: sticky;
		top: 96px;
	}

	.detail-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.detail-head h2 {
		margin: 0.25rem 0 0;
		font-size: 1.35rem;
		line-height: 1.2;
	}

	.detail-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-top: 1rem;
	}

	.detail-label {
		margin: 0 0 0.35rem;
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #6b7280;
	}

	.detail-grid p,
	.detail-section p {
		margin: 0;
	}

	.detail-section {
		margin-top: 1rem;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 1.25rem;
	}

	button,
	.button-link,
	.detail-link {
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

	.empty,
	.empty-state {
		padding: 1rem;
		color: #666;
	}

	@media (max-width: 1200px) {
		.workspace {
			grid-template-columns: 1fr;
		}

		.detail-card {
			position: static;
		}
	}

	@media (max-width: 900px) {
		.board {
			grid-template-columns: repeat(6, minmax(260px, 260px));
		}

		.detail-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.page {
			padding: 1rem;
		}

		.report-grid .full {
			grid-column: auto;
		}
	}
</style>