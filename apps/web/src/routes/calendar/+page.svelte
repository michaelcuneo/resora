<script lang="ts">
	import { resolve } from '$app/paths';
	import { untrack } from 'svelte';

	type CalendarBooking = {
		id: string;
		startAt: string;
		endAt: string;
		status: string;
		purpose: string | null;
		resourceName: string;
	};

	type CalendarDay = {
		date: Date;
		key: string;
		dayNumber: number;
		inMonth: boolean;
		isToday: boolean;
		bookings: CalendarBooking[];
	};

	let { data } = $props();

	const bookings = $state<CalendarBooking[]>(untrack(() => data.bookings) ?? []);
	const today = new Date();
	let visibleMonth = $state(new Date(today.getFullYear(), today.getMonth(), 1));
	let selectedDate = $state(dateKey(today));

	const monthLabel = $derived(
		visibleMonth.toLocaleDateString(undefined, {
			month: 'long',
			year: 'numeric'
		})
	);

	const calendarDays = $derived(buildCalendarDays(visibleMonth, bookings));
	const selectedDay = $derived(calendarDays.find((day) => day.key === selectedDate) ?? null);
	const selectedBookings = $derived(
		bookings
			.filter((booking) => dateKey(new Date(booking.startAt)) === selectedDate)
			.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
	);
	const monthBookings = $derived(
		bookings.filter((booking) => {
			const start = new Date(booking.startAt);
			return (
				start.getFullYear() === visibleMonth.getFullYear() &&
				start.getMonth() === visibleMonth.getMonth()
			);
		})
	);
	const confirmedCount = $derived(monthBookings.filter((booking) => booking.status === 'confirmed').length);
	const resourceCount = $derived(new Set(monthBookings.map((booking) => booking.resourceName)).size);

	const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	function dateKey(date: Date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function buildCalendarDays(month: Date, allBookings: CalendarBooking[]): CalendarDay[] {
		const first = new Date(month.getFullYear(), month.getMonth(), 1);
		const mondayOffset = (first.getDay() + 6) % 7;
		const gridStart = new Date(first);
		gridStart.setDate(first.getDate() - mondayOffset);

		return Array.from({ length: 42 }, (_, index) => {
			const date = new Date(gridStart);
			date.setDate(gridStart.getDate() + index);
			const key = dateKey(date);

			return {
				date,
				key,
				dayNumber: date.getDate(),
				inMonth: date.getMonth() === month.getMonth(),
				isToday: key === dateKey(today),
				bookings: allBookings
					.filter((booking) => dateKey(new Date(booking.startAt)) === key)
					.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
			};
		});
	}

	function previousMonth() {
		visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
	}

	function nextMonth() {
		visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
	}

	function goToToday() {
		visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		selectedDate = dateKey(today);
	}

	function selectDay(day: CalendarDay) {
		selectedDate = day.key;

		if (!day.inMonth) {
			visibleMonth = new Date(day.date.getFullYear(), day.date.getMonth(), 1);
		}
	}

	function formatTime(value: string) {
		return new Date(value).toLocaleTimeString(undefined, {
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function formatSelectedDate(key: string) {
		const [year, month, day] = key.split('-').map(Number);
		return new Date(year, month - 1, day).toLocaleDateString(undefined, {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Calendar · Resora</title>
</svelte:head>

<div class="page">
	<header class="hero">
		<div>
			<p class="eyebrow">Resora</p>
			<h1>Calendar</h1>
			<p class="sub">See your room and equipment bookings across the month.</p>
		</div>

		<a class="primary-link" href={resolve('/resources')}>Book a resource</a>
	</header>

	<section class="stats-grid" aria-label="Calendar summary">
		<article class="stat-card">
			<p class="stat-label">Bookings this month</p>
			<p class="stat-value">{monthBookings.length}</p>
		</article>
		<article class="stat-card">
			<p class="stat-label">Confirmed</p>
			<p class="stat-value">{confirmedCount}</p>
		</article>
		<article class="stat-card">
			<p class="stat-label">Resources in use</p>
			<p class="stat-value">{resourceCount}</p>
		</article>
	</section>

	<section class="calendar-shell">
		<div class="calendar-panel">
			<div class="calendar-toolbar">
				<div>
					<p class="toolbar-label">Month</p>
					<h2>{monthLabel}</h2>
				</div>

				<div class="toolbar-actions">
					<button type="button" onclick={previousMonth} aria-label="Previous month">←</button>
					<button type="button" onclick={goToToday}>Today</button>
					<button type="button" onclick={nextMonth} aria-label="Next month">→</button>
				</div>
			</div>

			<div class="weekday-row" aria-hidden="true">
				{#each weekdays as weekday}
					<div>{weekday.slice(0, 3)}</div>
				{/each}
			</div>

			<div class="calendar-grid">
				{#each calendarDays as day (day.key)}
					<button
						type="button"
						class="day"
						class:outside={!day.inMonth}
						class:today={day.isToday}
						class:selected={day.key === selectedDate}
						onclick={() => selectDay(day)}
						aria-label={`${day.date.toLocaleDateString()}: ${day.bookings.length} bookings`}
					>
						<div class="day-head">
							<span>{day.dayNumber}</span>
							{#if day.bookings.length > 0}
								<span class="booking-count">{day.bookings.length}</span>
							{/if}
						</div>

						<div class="day-bookings">
							{#each day.bookings.slice(0, 3) as booking (booking.id)}
								<span class="booking-chip">
									<strong>{formatTime(booking.startAt)}</strong>
									{booking.resourceName}
								</span>
							{/each}

							{#if day.bookings.length > 3}
								<span class="more-bookings">+{day.bookings.length - 3} more</span>
							{/if}
						</div>
					</button>
				{/each}
			</div>
		</div>

		<aside class="agenda-panel">
			<div class="agenda-head">
				<p class="toolbar-label">Selected day</p>
				<h2>{formatSelectedDate(selectedDate)}</h2>
				<p>{selectedBookings.length} {selectedBookings.length === 1 ? 'booking' : 'bookings'}</p>
			</div>

			{#if selectedBookings.length === 0}
				<div class="empty-state">
					<h3>No bookings</h3>
					<p>This day is clear.</p>
					<a href={resolve('/resources')}>Find a resource</a>
				</div>
			{:else}
				<div class="agenda-list">
					{#each selectedBookings as booking (booking.id)}
						<article class="agenda-item">
							<div class="agenda-time">
								<strong>{formatTime(booking.startAt)}</strong>
								<span>{formatTime(booking.endAt)}</span>
							</div>

							<div class="agenda-copy">
								<div class="agenda-title-row">
									<h3>{booking.resourceName}</h3>
									<span class={`status ${booking.status}`}>{booking.status}</span>
								</div>

								{#if booking.purpose}
									<p>{booking.purpose}</p>
								{/if}

								<a href={resolve(`/bookings/${booking.id}`)}>View booking</a>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</aside>
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
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.eyebrow,
	.toolbar-label {
		margin: 0 0 0.45rem;
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #6b7280;
	}

	h1,
	h2,
	h3,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 0;
		font-size: 2.5rem;
		line-height: 1.05;
	}

	.sub {
		max-width: 720px;
		margin: 0.75rem 0 0;
		font-size: 1.05rem;
		color: #555;
	}

	.primary-link,
	.toolbar-actions button,
	.empty-state a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0.75rem 1rem;
		border: 1px solid #d8d8dd;
		border-radius: 12px;
		background: white;
		color: inherit;
		font: inherit;
		text-decoration: none;
		cursor: pointer;
	}

	.primary-link {
		background: #111827;
		border-color: #111827;
		color: white;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.stat-card,
	.calendar-panel,
	.agenda-panel {
		background: white;
		border: 1px solid #e7e7ea;
		border-radius: 20px;
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.04);
	}

	.stat-card {
		padding: 1rem;
	}

	.stat-label {
		margin: 0;
		font-size: 0.92rem;
		color: #666;
	}

	.stat-value {
		margin: 0.5rem 0 0;
		font-size: 2rem;
		font-weight: 700;
	}

	.calendar-shell {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 360px;
		gap: 1rem;
		align-items: start;
	}

	.calendar-panel {
		min-width: 0;
		overflow: hidden;
	}

	.calendar-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.25rem;
		border-bottom: 1px solid #eceef1;
	}

	.calendar-toolbar h2,
	.agenda-head h2 {
		margin: 0;
	}

	.toolbar-actions {
		display: flex;
		gap: 0.5rem;
	}

	.toolbar-actions button:first-child,
	.toolbar-actions button:last-child {
		width: 44px;
		padding: 0;
	}

	.weekday-row,
	.calendar-grid {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
	}

	.weekday-row {
		border-bottom: 1px solid #eceef1;
		background: #fafafa;
	}

	.weekday-row div {
		padding: 0.75rem;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
	}

	.day {
		min-width: 0;
		min-height: 138px;
		padding: 0.7rem;
		border: 0;
		border-right: 1px solid #eceef1;
		border-bottom: 1px solid #eceef1;
		background: white;
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition: background 120ms ease, box-shadow 120ms ease;
	}

	.day:nth-child(7n) {
		border-right: 0;
	}

	.day:hover,
	.day.selected {
		background: #f8fafc;
	}

	.day.selected {
		box-shadow: inset 0 0 0 2px #111827;
	}

	.day.outside {
		background: #fafafa;
		color: #9ca3af;
	}

	.day.today .day-head > span:first-child {
		display: grid;
		place-items: center;
		width: 1.8rem;
		height: 1.8rem;
		border-radius: 999px;
		background: #111827;
		color: white;
	}

	.day-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		font-weight: 700;
	}

	.booking-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.45rem;
		height: 1.45rem;
		padding: 0 0.4rem;
		border-radius: 999px;
		background: #eef2ff;
		color: #3730a3;
		font-size: 0.72rem;
	}

	.day-bookings {
		display: grid;
		gap: 0.35rem;
		margin-top: 0.7rem;
	}

	.booking-chip {
		display: block;
		min-width: 0;
		padding: 0.38rem 0.45rem;
		border-radius: 8px;
		background: #f3f4f6;
		font-size: 0.72rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.booking-chip strong {
		margin-right: 0.3rem;
	}

	.more-bookings {
		font-size: 0.72rem;
		font-weight: 700;
		color: #6b7280;
	}

	.agenda-panel {
		position: sticky;
		top: 96px;
		overflow: hidden;
	}

	.agenda-head {
		padding: 1.25rem;
		border-bottom: 1px solid #eceef1;
	}

	.agenda-head p:last-child {
		margin: 0.5rem 0 0;
		color: #6b7280;
	}

	.agenda-list {
		display: grid;
	}

	.agenda-item {
		display: grid;
		grid-template-columns: 76px minmax(0, 1fr);
		gap: 1rem;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid #eceef1;
	}

	.agenda-item:last-child {
		border-bottom: 0;
	}

	.agenda-time {
		display: grid;
		align-content: start;
		gap: 0.2rem;
		font-size: 0.82rem;
	}

	.agenda-time span {
		color: #6b7280;
	}

	.agenda-title-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.agenda-title-row h3 {
		margin: 0;
		font-size: 1rem;
	}

	.agenda-copy p {
		margin: 0.45rem 0;
		color: #555;
	}

	.agenda-copy a,
	.empty-state a {
		color: inherit;
		font-weight: 700;
	}

	.status {
		display: inline-flex;
		padding: 0.25rem 0.5rem;
		border-radius: 999px;
		background: #f3f4f6;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: capitalize;
		white-space: nowrap;
	}

	.status.confirmed {
		background: #ecfdf3;
		color: #027a48;
	}

	.status.cancelled {
		background: #fef2f2;
		color: #b42318;
	}

	.empty-state {
		padding: 1.25rem;
		color: #6b7280;
	}

	.empty-state h3 {
		margin-bottom: 0.35rem;
		color: #111827;
	}

	.empty-state a {
		margin-top: 0.5rem;
	}

	@media (max-width: 1200px) {
		.calendar-shell {
			grid-template-columns: minmax(0, 1fr);
		}

		.agenda-panel {
			position: static;
		}
	}

	@media (max-width: 900px) {
		.day {
			min-height: 110px;
		}

		.booking-chip {
			font-size: 0.68rem;
		}
	}

	@media (max-width: 760px) {
		.stats-grid {
			grid-template-columns: minmax(0, 1fr);
		}

		.calendar-panel {
			overflow-x: auto;
		}

		.calendar-toolbar,
		.weekday-row,
		.calendar-grid {
			min-width: 720px;
		}
	}

	@media (max-width: 640px) {
		.page {
			padding: 1rem;
		}

		.hero,
		.calendar-toolbar,
		.agenda-title-row {
			align-items: stretch;
			flex-direction: column;
		}

		.primary-link {
			width: 100%;
		}

		.calendar-toolbar {
			min-width: 720px;
		}

		.toolbar-actions {
			width: 100%;
		}

		.toolbar-actions button:nth-child(2) {
			flex: 1;
		}

		.agenda-item {
			grid-template-columns: 64px minmax(0, 1fr);
		}
	}
</style>