<script lang="ts">
	import Seo from '$lib/Seo.svelte';
	import PlasmaGrid from '$lib/motion-core/plasma-grid/PlasmaGrid.svelte';
	import { absoluteUrl, site } from '$lib/seo';

	type Service = {
		/** Anchor id — referenced by the floating menu (/services#id). Keep in sync with +layout.svelte. */
		id: string;
		name: string;
		/** Lowercase label used in the CTA: "Get started with ___". */
		short: string;
		/** Must match an inquiry type in contact/+page.server.ts so the form preselects it. */
		inquiry: string;
		lead: string;
		included: string[];
		idealFor: string;
	};

	const services: Service[] = [
		{
			id: 'web-design',
			name: 'Web Design & Development',
			short: 'a new website',
			inquiry: 'New Website',
			lead: 'Custom-designed websites built around your brand, not a template. Fast, responsive, and structured to turn visitors into inquiries.',
			included: [
				'Custom UI/UX design tailored to your brand',
				'Responsive builds for mobile, tablet, and desktop',
				'Modern frameworks including SvelteKit and Shopify Hydrogen',
				'Lead capture: contact forms, quote requests, and booking paths',
				'On-page SEO foundations built in from day one',
				'Launch support and a clean handoff',
			],
			idealFor: 'Local service businesses, events, commerce brands, and creators who need a site that looks as good as their work.',
		},
		{
			id: 'seo-performance',
			name: 'SEO & Performance',
			short: 'SEO & performance',
			inquiry: 'SEO & Performance',
			lead: 'Get found and load fast. We tune the technical foundations that search engines and real visitors care about most.',
			included: [
				'Core Web Vitals optimization (LCP, INP, CLS)',
				'Technical SEO audits and fixes',
				'Structured data for rich search results',
				'Local SEO for service-area businesses',
				'On-page content and metadata strategy',
				'Image, font, and script optimization',
			],
			idealFor: 'Existing sites that feel slow, rank poorly, or are not generating the leads they should.',
		},
		{
			id: 'hosting-infrastructure',
			name: 'Hosting & Infrastructure',
			short: 'hosting',
			inquiry: 'Hosting & Infrastructure',
			lead: 'Edge-first hosting on Cloudflare\u2019s global network. Fast everywhere, secure by default, and managed for you.',
			included: [
				'Cloudflare Workers and Pages deployment',
				'Global CDN and caching configuration',
				'SSL, security headers, and DDoS protection',
				'Migrations from your existing host',
				'Ongoing updates and maintenance',
			],
			idealFor: 'Businesses that want reliable, fast hosting without managing servers themselves.',
		},
		{
			id: 'email-domain',
			name: 'Email & Domain Setup',
			short: 'email & domains',
			inquiry: 'Email & Domain Setup',
			lead: 'Professional email on your own domain, configured correctly so your messages land in inboxes instead of spam.',
			included: [
				'Domain registration and transfers',
				'DNS configuration and management',
				'Professional email setup (Google Workspace, Microsoft 365, and others)',
				'SPF, DKIM, and DMARC for deliverability',
				'Forwarding and alias setup',
			],
			idealFor: 'Teams still using a personal Gmail for business, or anyone whose emails keep going to spam.',
		},
		{
			id: 'devops-deployment',
			name: 'DevOps & Deployment',
			short: 'DevOps',
			inquiry: 'DevOps & Deployment',
			lead: 'Ship with confidence. Automated pipelines that build, check, and deploy your site every time you push a change.',
			included: [
				'CI/CD pipelines with GitHub Actions and more',
				'Preview deployments for every change',
				'Environment and secrets management',
				'Container-based deployments and orchestration',
				'Rollbacks and deployment automation',
			],
			idealFor: 'Teams and developers who want repeatable, low-risk releases instead of manual uploads.',
		},
	];

	const title = 'Web Design, SEO & Hosting Services | Elleven Media';
	const description =
		'Elleven Media services: custom web design and development, SEO and performance, Cloudflare hosting, email and domain setup, and DevOps for growing businesses in California.';

	function contactHref(inquiry: string) {
		return `/contact?inquiry=${encodeURIComponent(inquiry)}`;
	}

	const pageUrl = absoluteUrl('/services');
	const jsonLd = JSON.stringify([
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
				{ '@type': 'ListItem', position: 2, name: 'Services', item: pageUrl },
			],
		},
		{
			'@context': 'https://schema.org',
			'@type': 'ItemList',
			name: `${site.name} Services`,
			itemListElement: services.map((service, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				item: {
					'@type': 'Service',
					'@id': `${pageUrl}#${service.id}`,
					name: service.name,
					description: service.lead,
					url: `${pageUrl}#${service.id}`,
					provider: { '@id': `${site.url}/#organization` },
					areaServed: { '@type': 'State', name: 'California' },
				},
			})),
		},
	]);
</script>

<Seo {title} {description} path="/services" />

<svelte:head>
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<section class="services-hero">
	<div class="services-hero-bg">
		<PlasmaGrid color="#000000" highlightColor="rgba(255, 255, 255, 0.4)" />
	</div>
	<div class="container services-hero-inner">
		<p class="section-tag">Services</p>
		<h1 class="services-title">Everything your brand needs <em>online</em>.</h1>
		<p class="services-sub">
			From the first pixel to the final deploy, Elleven Media designs, builds, hosts, and supports
			websites for growing businesses.
		</p>
		<nav class="services-index" aria-label="Jump to a service">
			{#each services as service, i}
				<a href="#{service.id}" id="services-index-{service.id}">
					<span class="index-num">{String(i + 1).padStart(2, '0')}</span>
					{service.name}
				</a>
			{/each}
		</nav>
	</div>
</section>

<section class="services-list" aria-label="Our services">
	<div class="container">
		{#each services as service, i}
			<article class="service" id={service.id} style="--index: {i};">
				<div class="service-intro">
					<span class="service-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
					<h2 class="service-name">{service.name}</h2>
					<p class="service-lead">{service.lead}</p>
					<a class="service-cta" href={contactHref(service.inquiry)} id="service-cta-{service.id}">
						Get started with {service.short} <span class="arrow">&rarr;</span>
					</a>
				</div>

				<div class="service-detail">
					<h3 class="detail-label">What&rsquo;s included</h3>
					<ul class="service-included">
						{#each service.included as item}
							<li>{item}</li>
						{/each}
					</ul>
					<div class="service-ideal">
						<h3 class="detail-label">Ideal for</h3>
						<p>{service.idealFor}</p>
					</div>
				</div>
			</article>
		{/each}
	</div>
</section>

<section class="services-cta">
	<div class="container services-cta-inner">
		<p class="section-tag">Not sure where to start?</p>
		<h2 class="cta-headline">Tell us what you need. We&rsquo;ll map out the rest.</h2>
		<div class="cta-actions">
			<a href="/contact" class="btn btn-primary btn-massive" id="services-cta-contact">
				Start a Project <span class="arrow">&rarr;</span>
			</a>
			<a href="/portfolio" class="btn-ghost" id="services-cta-portfolio">See our work</a>
		</div>
	</div>
</section>

<style>
	/* ── Hero ── */
	.services-hero {
		padding: calc(var(--nav-height) + var(--space-4xl)) 0 var(--space-3xl);
		position: relative;
		overflow: hidden;
	}

	.services-hero-bg {
		position: absolute;
		inset: 0;
		z-index: 0;
		opacity: 0.6;
		pointer-events: none;
	}

	.services-hero-bg::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, transparent 40%, var(--color-black) 100%);
	}

	.services-hero-inner {
		position: relative;
	}

	.section-tag {
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--color-gray-400);
		margin-bottom: var(--space-lg);
	}

	.services-title {
		font-size: clamp(2.6rem, 7vw, 6.4rem);
		font-weight: 700;
		line-height: 0.98;
		margin-bottom: var(--space-xl);
		max-width: 960px;
	}

	.services-title em {
		font-style: italic;
		font-weight: 400;
	}

	.services-sub {
		max-width: 640px;
		font-size: 1.12rem;
		line-height: 1.7;
		color: var(--color-gray-300);
		margin-bottom: var(--space-2xl);
	}

	.services-index {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.services-index a {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		min-height: 44px;
		padding: 0.6rem 1rem;
		font-size: 0.85rem;
		color: var(--color-gray-300);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		transition:
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			background var(--duration-fast) var(--ease-out);
	}

	.services-index a:hover,
	.services-index a:focus-visible {
		color: var(--color-white);
		border-color: rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.07);
	}

	.index-num {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		color: var(--color-gray-500);
	}

	/* ── Service rows ── */
	.services-list {
		padding: var(--space-xl) 0 var(--space-4xl);
	}

	.service {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4xl);
		padding: var(--space-4xl) 0;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		/* Keep anchored sections clear of the floating nav. */
		scroll-margin-top: calc(var(--nav-height) + var(--space-lg));
		opacity: 0;
		animation: fadeSlideUp 0.8s var(--ease-out) forwards;
		animation-delay: calc(var(--index, 0) * 0.1s);
	}

	@keyframes fadeSlideUp {
		from {
			opacity: 0;
			transform: translateY(32px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.service {
			opacity: 1;
			animation: none;
		}
	}

	.service-intro {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.service-num {
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		color: var(--color-gray-500);
		margin-bottom: var(--space-md);
	}

	.service-name {
		font-family: var(--font-sans);
		font-size: clamp(2rem, 4vw, 3.25rem);
		font-weight: 700;
		line-height: 1.08;
		letter-spacing: -0.02em;
		margin-bottom: var(--space-lg);
	}

	.service-lead {
		font-size: 1.1rem;
		line-height: 1.65;
		color: var(--color-gray-300);
		max-width: 520px;
		margin-bottom: var(--space-2xl);
	}

	.service-cta {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-white);
		border-bottom: 1px solid rgba(255, 255, 255, 0.55);
		padding-bottom: 4px;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		transition:
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.service-cta .arrow {
		transition: transform var(--duration-fast) var(--ease-out);
	}

	.service-cta:hover {
		color: var(--color-gray-300);
		border-color: rgba(255, 255, 255, 0.25);
	}

	.service-cta:hover .arrow {
		transform: translateX(6px);
	}

	.service-detail {
		background: rgba(13, 13, 13, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 16px;
		padding: var(--space-2xl);
	}

	.detail-label {
		font-family: var(--font-sans);
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--color-gray-500);
		margin-bottom: var(--space-lg);
	}

	.service-included {
		list-style: none;
		display: flex;
		flex-direction: column;
	}

	.service-included li {
		position: relative;
		padding: 0.8rem 0 0.8rem 1.75rem;
		font-size: 0.98rem;
		line-height: 1.5;
		color: var(--color-gray-200);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.service-included li:last-child {
		border-bottom: none;
	}

	.service-included li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 1.2rem;
		width: 0.7rem;
		height: 0.4rem;
		border-left: 1.5px solid var(--color-white);
		border-bottom: 1.5px solid var(--color-white);
		transform: rotate(-45deg);
	}

	.service-ideal {
		margin-top: var(--space-xl);
		padding-top: var(--space-xl);
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.service-ideal .detail-label {
		margin-bottom: var(--space-sm);
	}

	.service-ideal p {
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--color-gray-300);
	}

	/* ── Closing CTA ── */
	.services-cta {
		padding: 0 0 var(--space-5xl);
		position: relative;
	}

	.services-cta::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 400px;
		background: radial-gradient(ellipse at top, rgba(255, 255, 255, 0.03), transparent 70%);
		pointer-events: none;
	}

	.services-cta-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding-top: var(--space-4xl);
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.services-cta .section-tag {
		margin-bottom: var(--space-xl);
	}

	.cta-headline {
		font-family: var(--font-sans);
		font-size: clamp(2.5rem, 5.5vw, 5rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1.05;
		max-width: 900px;
		margin-bottom: var(--space-3xl);
	}

	.cta-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--space-xl);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.btn-primary {
		background: var(--color-white);
		color: var(--color-black);
	}

	.btn-massive {
		padding: 1.25rem 3.5rem;
		font-size: 1.1rem;
		border-radius: 999px;
		gap: 12px;
		box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
		transition: all var(--duration-normal) var(--ease-out);
	}

	.btn-massive .arrow {
		transition: transform var(--duration-normal) var(--ease-out);
	}

	.btn-massive:hover {
		box-shadow: 0 0 50px rgba(255, 255, 255, 0.25);
		transform: scale(1.03) translateY(-2px);
	}

	.btn-massive:hover .arrow {
		transform: translateX(8px);
	}

	.btn-ghost {
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-gray-300);
		border-bottom: 1px solid rgba(255, 255, 255, 0.3);
		padding-bottom: 4px;
		transition:
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.btn-ghost:hover {
		color: var(--color-white);
		border-color: var(--color-white);
	}

	/* ── Responsive ── */
	@media (max-width: 900px) {
		.services-hero {
			padding: calc(var(--nav-height) + var(--space-3xl)) 0 var(--space-2xl);
		}

		.service {
			grid-template-columns: 1fr;
			gap: var(--space-2xl);
			padding: var(--space-3xl) 0;
		}

		.services-cta-inner {
			padding-top: var(--space-3xl);
		}

		.cta-headline {
			font-size: 2.5rem;
			margin-bottom: var(--space-2xl);
		}
	}

	@media (max-width: 576px) {
		.services-hero {
			padding: calc(var(--nav-height) + var(--space-2xl)) 0 var(--space-xl);
		}

		.services-title {
			font-size: 2.7rem;
			line-height: 1.05;
		}

		.services-sub {
			font-size: 1rem;
		}

		.services-index a {
			font-size: 0.8rem;
		}

		.service-name {
			font-size: 2rem;
		}

		.service-lead {
			font-size: 1rem;
			margin-bottom: var(--space-xl);
		}

		.service-detail {
			padding: var(--space-lg);
		}

		.btn-massive {
			padding: 1.1rem 2.5rem;
			font-size: 1rem;
		}
	}
</style>
