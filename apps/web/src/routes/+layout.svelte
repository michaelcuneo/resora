<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';

	let { data, children } = $props();

	const navItems = [
		{ href: '/', label: 'Dashboard' },
		{ href: '/bookings', label: 'Bookings' },
		{ href: '/resources', label: 'Resources' },
		{ href: '/maintenance', label: 'Maintenance' },
		{ href: '/calendar', label: 'Calendar' },
		{ href: '/admin', label: 'Admin' }
	];

	function initials(name?: string | null, email?: string | null) {
		if (name && name.trim()) {
			return name
				.trim()
				.split(/\s+/)
				.slice(0, 2)
				.map((part: string) => part[0]?.toUpperCase() ?? '')
				.join('');
		}

		return (email?.[0] ?? 'U').toUpperCase();
	}

	function isActive(href: string, pathname: string) {
		if (href === '/') return pathname === '/';
		return pathname === href || pathname.startsWith(`${href}/`);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-shell">
	<aside class="sidebar">
		<div class="brand">
			<div class="brand-mark">R</div>
			<div class="brand-copy">
				<p class="brand-name">Resora</p>
				<p class="brand-sub">Resource operations</p>
			</div>
		</div>

		<nav class="nav" aria-label="Primary">
			{#each navItems as item (item.href)}
				{@const href = item.href}
				<a
					class="nav-link"
					href={resolve(href)}
					data-active={isActive(item.href, $page.url.pathname)}
					aria-current={isActive(item.href, $page.url.pathname) ? 'page' : undefined}
				>
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>
	</aside>

	<div class="main-shell">
		<header class="topbar">
			<div class="topbar-copy">
				<p class="topbar-eyebrow">Organization</p>
				<h1 class="topbar-title">{data.organization?.name ?? 'Resora'}</h1>
			</div>

			<div class="topbar-user">
				<div class="user-meta">
					<p class="user-name">{data.user?.name ?? 'Signed in user'}</p>
					<p class="user-email">{data.user?.email ?? ''}</p>
				</div>
				<div class="avatar">
					{initials(data.user?.name, data.user?.email)}
				</div>
			</div>
		</header>

		<main class="content">
			{@render children()}
		</main>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family:
			Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		background: #f5f6f8;
		color: #111827;
	}

	:global(*) {
		box-sizing: border-box;
	}

	:global(a) {
		color: inherit;
		text-decoration: none;
	}

	.app-shell {
		min-height: 100vh;
		display: grid;
		grid-template-columns: 280px minmax(0, 1fr);
	}

	.sidebar {
		position: sticky;
		top: 0;
		height: 100vh;
		padding: 1.25rem;
		border-right: 1px solid #e5e7eb;
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 250, 251, 0.96));
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 0.5rem;
	}

	.brand-mark {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 14px;
		display: grid;
		place-items: center;
		background: #111827;
		color: white;
		font-weight: 700;
		font-size: 1rem;
		box-shadow: 0 8px 24px rgba(17, 24, 39, 0.18);
	}

	.brand-copy {
		min-width: 0;
	}

	.brand-name {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
	}

	.brand-sub {
		margin: 0.15rem 0 0;
		font-size: 0.85rem;
		color: #6b7280;
	}

	.nav {
		display: grid;
		gap: 0.4rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		min-height: 44px;
		padding: 0.8rem 0.9rem;
		border-radius: 14px;
		color: #374151;
		transition:
			background 140ms ease,
			color 140ms ease,
			transform 140ms ease,
			box-shadow 140ms ease;
	}

	.nav-link:hover {
		background: #eceff3;
		color: #111827;
		transform: translateX(2px);
	}

	.nav-link[data-active='true'] {
		background: #111827;
		color: white;
		box-shadow: 0 8px 20px rgba(17, 24, 39, 0.16);
	}

	.nav-link[data-active='true']:hover {
		background: #111827;
		color: white;
		transform: none;
	}

	.main-shell {
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.topbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.topbar-copy {
		min-width: 0;
	}

	.topbar-eyebrow {
		margin: 0 0 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #6b7280;
	}

	.topbar-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.1;
	}

	.topbar-user {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.4rem 0.45rem 0.4rem 0.9rem;
		border: 1px solid #e5e7eb;
		border-radius: 999px;
		background: white;
	}

	.user-meta {
		text-align: right;
	}

	.user-name {
		margin: 0;
		font-size: 0.92rem;
		font-weight: 600;
	}

	.user-email {
		margin: 0.1rem 0 0;
		font-size: 0.8rem;
		color: #6b7280;
	}

	.avatar {
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 999px;
		display: grid;
		place-items: center;
		background: #111827;
		color: white;
		font-size: 0.82rem;
		font-weight: 700;
		flex: 0 0 auto;
	}

	.content {
		min-width: 0;
		padding: 0;
	}

	@media (max-width: 900px) {
		.app-shell {
			grid-template-columns: 1fr;
		}

		.sidebar {
			position: static;
			height: auto;
			border-right: 0;
			border-bottom: 1px solid #e5e7eb;
		}

		.nav {
			grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		}

		.topbar {
			padding: 1rem;
			flex-direction: column;
			align-items: flex-start;
		}

		.topbar-user {
			width: 100%;
			justify-content: space-between;
			border-radius: 16px;
		}

		.user-meta {
			text-align: left;
		}
	}

	@media (max-width: 640px) {
		.sidebar {
			padding: 1rem;
		}

		.nav {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>