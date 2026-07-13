<script lang="ts">
	let { children } = $props();
</script>

<div class="bookings-layout">
	{@render children()}
</div>

<style>
	.bookings-layout {
		min-width: 0;
	}

	.bookings-layout :global(.page) {
		width: 100%;
		max-width: 1600px;
	}

	.bookings-layout :global(.grid) {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.bookings-layout :global(.card) {
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.bookings-layout :global(.actions) {
		margin-top: auto;
		padding-top: 1rem;
	}

	@media (max-width: 1200px) {
		.bookings-layout :global(.grid) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 700px) {
		.bookings-layout :global(.grid) {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (max-width: 640px) {
		.bookings-layout :global(.page) {
			padding: 1rem;
		}

		.bookings-layout :global(.section-head) {
			align-items: stretch;
			flex-direction: column;
		}

		.bookings-layout :global(.section-head button),
		.bookings-layout :global(.actions > *) {
			width: 100%;
		}
	}
</style>
