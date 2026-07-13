<script lang="ts">
	let { children } = $props();
</script>

<div class="resources-layout">
	{@render children()}
</div>

<style>
	.resources-layout {
		min-width: 0;
	}

	.resources-layout :global(.page) {
		width: 100%;
		max-width: 1600px;
	}

	.resources-layout :global(.controls) {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.resources-layout :global(.grid) {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.resources-layout :global(.card) {
		min-width: 0;
	}

	.resources-layout :global(.card-actions),
	.resources-layout :global(.suggestion-actions) {
		align-items: stretch;
	}

	@media (max-width: 1200px) {
		.resources-layout :global(.grid) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 900px) {
		.resources-layout :global(.controls) {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (max-width: 700px) {
		.resources-layout :global(.grid) {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (max-width: 640px) {
		.resources-layout :global(.page) {
			padding: 1rem;
		}

		.resources-layout :global(.preset-row),
		.resources-layout :global(.actions),
		.resources-layout :global(.card-actions),
		.resources-layout :global(.suggestion-actions) {
			flex-direction: column;
		}

		.resources-layout :global(.preset-row > *),
		.resources-layout :global(.actions > *),
		.resources-layout :global(.card-actions > *),
		.resources-layout :global(.suggestion-actions > *) {
			width: 100%;
		}
	}
</style>
