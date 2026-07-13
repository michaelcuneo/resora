<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { searchAvailability } from '$lib/home/searchAvailability';
	import { listResourceTypes } from '$lib/home/resourceTypes';
	import {
		getTodayMorningRange,
		getTomorrowAfternoonRange,
		getNextWeekMorningRange,
		addHoursToLocalDateTimeInput
	} from '$lib/home/dateTime';

	const dispatch = createEventDispatcher<{
		results: {
			available: AvailableResource[];
			suggestions: AvailabilitySuggestion[];
			purpose: string;
			startAt: string;
			endAt: string;
			selectedType: string;
		};
		error: { value: string };
	}>();

	let resourceTypes: ResourceType[] = $state([]);
	let selectedType = $state('');

	let startAt = $state('');
	let endAt = $state('');
	let purpose = $state('');

	let loading = $state(false);
	let loadingTypes = $state(false);
	let error = $state('');

	function setTodayMorning() {
		const range = getTodayMorningRange();
		startAt = range.startAt;
		endAt = range.endAt;
	}

	function setTomorrowAfternoon() {
		const range = getTomorrowAfternoonRange();
		startAt = range.startAt;
		endAt = range.endAt;
	}

	function setNextWeekMorning() {
		const range = getNextWeekMorningRange();
		startAt = range.startAt;
		endAt = range.endAt;
	}

	function setDuration(hours: number) {
		if (!startAt) return;
		endAt = addHoursToLocalDateTimeInput(startAt, hours);
	}

	async function loadTypes() {
		loadingTypes = true;
		error = '';

		try {
			resourceTypes = await listResourceTypes();

			if (resourceTypes.length > 0 && !selectedType) {
				selectedType = resourceTypes[0].id;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load resource types';
			resourceTypes = [];
			dispatch('error', { value: error });
		} finally {
			loadingTypes = false;
		}
	}

	async function search() {
		loading = true;
		error = '';

		try {
			const result = await searchAvailability({
				resourceTypeId: selectedType,
				startAt,
				endAt
			});

			dispatch('results', {
				available: result.available,
				suggestions: result.suggestions,
				purpose,
				startAt,
				endAt,
				selectedType
			});
		} catch (err) {
			error = err instanceof Error ? err.message : 'Search failed';

			dispatch('error', { value: error });
			dispatch('results', {
				available: [],
				suggestions: [],
				purpose,
				startAt,
				endAt,
				selectedType
			});
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		setTomorrowAfternoon();
		await loadTypes();
	});
</script>

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
			<select bind:value={selectedType} disabled={loadingTypes}>
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
</section>

<style>
	.panel {
		background: white;
		border: 1px solid #e7e7ea;
		border-radius: 16px;
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.04);
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

	.actions {
		margin-top: 1rem;
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

	button {
		border: 1px solid #d8d8dd;
		background: white;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		cursor: pointer;
	}

	button.primary {
		background: #111;
		color: white;
		border-color: #111;
	}

	.error {
		color: #b42318;
		margin-top: 1rem;
	}
</style>