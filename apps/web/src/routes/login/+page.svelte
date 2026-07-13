<script lang="ts">
  let organizationSlug = $state('');
  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function submit() {
    loading = true;
    error = '';

    const form = new FormData();
    form.set('organizationSlug', organizationSlug);
    form.set('email', email);
    form.set('password', password);

    const res = await fetch('/auth/login', {
      method: 'POST',
      body: form
    });

    if (res.redirected) {
      window.location.href = res.url;
      return;
    }

    let data: { error?: string } = {};
    try {
      data = await res.json();
    } catch {
      // Silently ignore JSON parsing errors
    }

    error = data.error ?? 'Login failed';
    loading = false;
  }
</script>

<svelte:head>
  <title>Login • Resora</title>
</svelte:head>

<div class="wrap">
  <form class="card" onsubmit={submit}>
    <h1>Sign in</h1>

    <label>
      Organization
      <input bind:value={organizationSlug} type="text" placeholder="test-uni" required />
    </label>

    <label>
      Email
      <input bind:value={email} type="email" placeholder="admin@testuni.edu" required />
    </label>

    <label>
      Password
      <input bind:value={password} type="password" required />
    </label>

    <button class="primary" type="submit" disabled={loading}>
      {#if loading}Signing in...{:else}Sign in{/if}
    </button>

    {#if error}
      <p class="error">{error}</p>
    {/if}
  </form>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: #f7f7f8;
  }

  .wrap {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 2rem;
  }

  .card {
    width: min(100%, 420px);
    display: grid;
    gap: 1rem;
    background: white;
    border: 1px solid #e7e7ea;
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.04);
  }

  label {
    display: grid;
    gap: 0.45rem;
    font-weight: 600;
  }

  input,
  button {
    font: inherit;
  }

  input {
    padding: 0.8rem 0.9rem;
    border-radius: 12px;
    border: 1px solid #d8d8dd;
    background: white;
  }

  button {
    border: 1px solid #111;
    background: #111;
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    cursor: pointer;
  }

  .error {
    color: #b42318;
    margin: 0;
  }
</style>