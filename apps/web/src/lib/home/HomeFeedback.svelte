<script lang="ts">
	let {
		error = '',
		message = ''
	}: {
		error?: string;
		message?: string;
	} = $props();
</script>

{#if error}
	<p class="error">{error}</p>
{/if}

{#if message}
	<p class="message">{message}</p>
{/if}

<style>
	.error {
		color: #b42318;
		margin-top: 1rem;
	}

	.message {
		color: #027a48;
		margin-top: 1rem;
	}
</style>