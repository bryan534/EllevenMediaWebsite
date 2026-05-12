<script lang="ts">
	import './layout.css';
	import '../app.css';
	import { onMount } from 'svelte';
	import { FloatingMenu, SvgPreloader } from '$lib/motion-core';

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

	const menuGroups = [
		{
			title: 'Studio',
			variant: 'muted' as const,
			links: [
				{ label: 'Portfolio', href: '/portfolio' },
				{ label: 'Contact', href: '/contact' },
		],
		},
		{
			title: 'Services',
			variant: 'default' as const,
			links: [
				{ label: 'Web Design' },
				{ label: 'SEO & Performance' },
				{ label: 'Hosting & Infrastructure' },
			],
		},
		{
			title: 'Support',
			variant: 'muted' as const,
			links: [
				{ label: 'Email & Domain Setup' },
				{ label: 'DevOps & Deployment' },
		],
		},
	];

	const floatingMenuClasses = {
		root: 'border-white/10 bg-black/85 text-white shadow-2xl shadow-black/40 backdrop-blur-xl md:max-w-[72vw] lg:max-w-[42rem]',
		overlay: 'bg-black/75',
		toggleButton: 'hover:bg-white/10',
		toggleLabel: 'text-white/70 group-hover:text-white',
		toggleLine: 'bg-white group-hover:bg-white/70',
		logo: 'justify-center',
		primaryButton: 'bg-white text-black hover:bg-neutral-200',
		secondaryButton: 'text-white/70 hover:bg-white/10 hover:text-white',
		menuWrapper: 'border-white/10',
		group: 'rounded-sm',
		groupMuted: 'bg-white/[0.06]',
		groupTitle: 'text-white/45',
		link: 'text-white/55 hover:text-white',
		linkUnderline: 'bg-white',
		divider: 'border-white/10',
	};

	onMount(() => {
		const seen = sessionStorage.getItem('elleven_preloader_seen');
		if (!seen) {
			showPreloader = true;
			document.body.style.overflow = 'hidden';
		} else {
			pageVisible = true;
		}
		document.documentElement.style.visibility = '';
	});
</script>

<svelte:head>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="application-name" content="Elleven Media" />
</svelte:head>

<!-- ── Preloader ── -->
{#if showPreloader}
	<div use:portal>
		<SvgPreloader onComplete={handlePreloaderComplete} />
	</div>
{/if}

<!-- ── Site Content ── -->
<div class="page-content" class:page-content--visible={pageVisible}>
	<FloatingMenu
		{menuGroups}
		classes={floatingMenuClasses}
		primaryButton={{ label: 'Contact', href: '/contact' }}
		secondaryButton={{ label: 'Home', href: '/' }}
	>
		{#snippet logo()}
			<a href="/" class="floating-menu-logo" aria-label="Elleven Media Home">
				<img src="/nav-logo.svg" alt="" class="floating-menu-logo-img" />
			</a>
		{/snippet}
	</FloatingMenu>

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

	.floating-menu-logo {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.floating-menu-logo-img {
		width: auto;
		height: 2.25rem;
		max-width: 5.75rem;
		object-fit: contain;
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

		.footer-links a {
			min-height: 44px;
			display: inline-flex;
			align-items: center;
		}
	}
</style>
