<script lang="ts">
	let { children } = $props();
</script>

<div class="maintenance-layout">
	{@render children()}
</div>

<style>
	.maintenance-layout {
		min-width: 0;
	}

	.maintenance-layout :global(.page) {
		width: 100%;
		max-width: 1600px;
	}

	.maintenance-layout :global(.workspace) {
		grid-template-columns: minmax(0, 1fr);
	}

	.maintenance-layout :global(.board) {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		overflow: visible;
		align-items: start;
	}

	.maintenance-layout :global(.column) {
		min-width: 0;
	}

	.maintenance-layout :global(.detail) {
		min-width: 0;
	}

	.maintenance-layout :global(.detail-card) {
		position: static;
	}

	.maintenance-layout :global(.filters label:first-child) {
		grid-column: span 2;
	}

	@media (max-width: 1200px) {
		.maintenance-layout :global(.board) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 760px) {
		.maintenance-layout :global(.board) {
			grid-template-columns: minmax(0, 1fr);
		}

		.maintenance-layout :global(.filters label:first-child) {
			grid-column: auto;
		}
	}

	@media (max-width: 640px) {
		.maintenance-layout :global(.page) {
			padding: 1rem;
		}

		.maintenance-layout :global(.stats-grid),
		.maintenance-layout :global(.filters),
		.maintenance-layout :global(.report-grid),
		.maintenance-layout :global(.detail-grid) {
			grid-template-columns: minmax(0, 1fr);
		}

		.maintenance-layout :global(.actions > *) {
			width: 100%;
		}
	}
</style>
