<script lang="ts">
	import './layout.css';
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let { children } = $props();

	const navItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Contact', href: '/contact' },
	];

	let selected = $state(0);

	$effect(() => {
		const path = $page.url.pathname;
		if (path === '/contact') selected = 1;
		else selected = 0;
	});

	let pill: HTMLDivElement;
	let itemsContainer: HTMLDivElement;
	let itemEls: HTMLAnchorElement[] = [];

	function setPill() {
		if (!pill || !itemsContainer || !itemEls[selected]) return;
		const el = itemEls[selected];
		const dims = el.getBoundingClientRect();
		const parentLeft = itemsContainer.getBoundingClientRect().left;
		pill.style.width = dims.width + 'px';
		pill.style.height = dims.height + 'px';
		pill.style.left = (dims.left - parentLeft) + 'px';
	}

	$effect(() => {
		// re-run when selected changes
		selected;
		setPill();
	});

	onMount(() => {
		setTimeout(setPill, 0);
		window.addEventListener('resize', setPill);
		return () => window.removeEventListener('resize', setPill);
	});
</script>

<svelte:head><title>EllevenMedia — Premium Digital Media Studio</title></svelte:head>

<nav class="pill-nav" id="menu">
	<div class="pill-nav-content">
		<div class="pill" bind:this={pill}></div>
		<div class="pill-items" bind:this={itemsContainer}>

			{#each navItems as item, i}
				<a
					href={item.href}
					class="pill-item"
					class:active={selected === i}
					bind:this={itemEls[i]}
				>
					{item.label}
				</a>
			{/each}
		</div>
	</div>
</nav>

{@render children()}

<footer class="footer">
	<div class="container footer-inner">
		<a href="/" class="footer-brand" aria-label="Elleven Media Home">
			<img src="/logo.svg" alt="Elleven Media" class="footer-logo-img" />
		</a>
		<div class="footer-links">
			<a href="/privacy">Privacy Policy</a>
			<a href="/terms">Terms of Service</a>
		</div>
		<p class="footer-copy">© {new Date().getFullYear()} elleven media. All rights reserved.</p>
	</div>
</footer>

<style>
	/* ── Pill Nav ── */
	.pill-nav {
		position: fixed;
		top: 1.25rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
	}



	.pill-nav-content {
		position: relative;
	}

	.pill {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		left: 0;
		background-color: #000;
		border-radius: 2rem;
		transition: left 0.5s ease, width 0.5s ease;
		pointer-events: none;
	}

	.pill-items {
		display: flex;
		background-color: #fff;
		border-radius: 2rem;
		box-shadow: 0px 0px 0px 4px #fff;
	}

	.pill-item {
		padding: 0.75rem 1.25rem;
		border-radius: 2rem;
		cursor: pointer;
		z-index: 1;
		transition: color 1s ease;
		font-family: var(--font-sans);
		font-size: 0.85rem;
		font-weight: 500;
		letter-spacing: 0.03em;
		color: #000;
		user-select: none;
		white-space: nowrap;
	}

	.pill-item.active {
		color: #fff;
	}

	.pill-item:not(.active):hover {
		color: rgb(127, 127, 127);
	}

	/* ── Footer ── */
	.footer {
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		padding: var(--space-4xl) 0 var(--space-3xl);
	}

	.footer-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2xl);
	}

	.footer-brand {
		display: inline-block;
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	.footer-brand:hover {
		opacity: 0.7;
	}

	.footer-logo-img {
		height: 36px;
		width: auto;
		object-fit: contain;
		filter: brightness(0) invert(1);
	}

	.footer-links {
		display: flex;
		gap: var(--space-2xl);
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.footer-links a {
		color: var(--color-gray-400);
		position: relative;
		padding-bottom: 4px;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.footer-links a::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 1px;
		background: var(--color-white);
		transform: scaleX(0);
		transform-origin: right;
		transition: transform 0.4s var(--ease-out);
	}

	.footer-links a:hover {
		color: var(--color-white);
	}

	.footer-links a:hover::after {
		transform: scaleX(1);
		transform-origin: left;
	}

	.footer-copy {
		font-size: 0.8rem;
		color: var(--color-gray-600);
	}

	@media (max-width: 768px) {
		.pill-item {
			padding: 0.6rem 0.9rem;
			font-size: 0.75rem;
		}

		.footer {
			padding: var(--space-3xl) 0 var(--space-2xl);
		}
		.footer-inner {
			gap: var(--space-xl);
		}
		.footer-links {
			flex-direction: column;
			gap: var(--space-md);
			align-items: center;
		}
	}
</style>
