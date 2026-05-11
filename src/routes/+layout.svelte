<script lang="ts">
	import './layout.css';
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { SvgPreloader } from '$lib/motion-core';

	let { children } = $props();

	/* ── Preloader state ── */
	let showPreloader = $state(false);
	let pageVisible = $state(false);

	function handlePreloaderComplete() {
		showPreloader = false;
		pageVisible = true;
		document.body.style.overflow = '';
		sessionStorage.setItem('elleven_preloader_seen', '1');
	}

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				if (node.parentNode) {
					node.parentNode.removeChild(node);
				}
			},
		};
	}

	/* ── Nav state ── */
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

	function setPill(instant = false) {
		if (!pill || !itemsContainer || !itemEls[selected]) return;
		const el = itemEls[selected];
		const dims = el.getBoundingClientRect();
		const parentLeft = itemsContainer.getBoundingClientRect().left;
		if (instant) pill.style.transition = 'none';
		pill.style.width = dims.width + 'px';
		pill.style.height = dims.height + 'px';
		pill.style.left = (dims.left - parentLeft) + 'px';
		if (instant) {
			// restore transition after the paint so clicks animate again
			requestAnimationFrame(() => { pill.style.transition = ''; });
		}
	}

	$effect(() => {
		// re-run when selected changes (nav clicks only — navigations use afterNavigate)
		selected;
		setPill();
	});

	afterNavigate(() => {
		setPill(true);
	});

	function handleResize() {
		setPill();
	}

	onMount(() => {
		const seen = sessionStorage.getItem('elleven_preloader_seen');
		if (!seen) {
			showPreloader = true;
			document.body.style.overflow = 'hidden';
		} else {
			pageVisible = true;
		}
		document.documentElement.style.visibility = '';

		setTimeout(setPill, 0);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<svelte:head>
  <title>elleven media — premium digital media studio</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />

  <!-- OpenGraph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="EllevenMedia" />
  <meta property="og:title" content="EllevenMedia — Premium Digital Media Studio" />
  <meta property="og:description" content="EllevenMedia — Premium digital media & web design studio crafting elevated online experiences for individuals and brands." />
  <meta property="og:image" content="https://ellevenmediagroup.com/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content={$page.url.href} />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="EllevenMedia — Premium Digital Media Studio" />
  <meta name="twitter:description" content="EllevenMedia — Premium digital media & web design studio crafting elevated online experiences for individuals and brands." />
  <meta name="twitter:image" content="https://ellevenmediagroup.com/og-image.png" />
</svelte:head>

<!-- ── Preloader ── -->
{#if showPreloader}
	<div use:portal>
		<SvgPreloader onComplete={handlePreloaderComplete} />
	</div>
{/if}

<!-- ── Site Content ── -->
<div class="page-content" class:page-content--visible={pageVisible}>
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
				<img src="/logo-hero.svg" alt="Elleven Media" class="footer-logo-img" />
			</a>
			<div class="footer-links">
				<a href="/privacy">Privacy Policy</a>
				<a href="/terms">Terms of Service</a>
			</div>
			<p class="footer-copy">© {new Date().getFullYear()} elleven media. All rights reserved.</p>
		</div>
	</footer>
</div>

<style>
	/* ── Page fade-in ── */
	.page-content {
		opacity: 0;
		transition: opacity 0.6s ease;
	}

	.page-content--visible {
		opacity: 1;
	}

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
