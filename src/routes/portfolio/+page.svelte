<script lang="ts">
	import Seo from '$lib/Seo.svelte';
	import PlasmaGrid from '$lib/motion-core/plasma-grid/PlasmaGrid.svelte';
	import bornxcreate from '$lib/images/clients/bornxcreate.webp';
	import ironbreed from '$lib/images/clients/ironbreed.webp';
	import ironbreedPreview from '$lib/images/clients/ironbreed-preview.webp';
	import jb from '$lib/images/clients/jb.webp';
	import jbPreview from '$lib/images/clients/jb-preview.webp';
	import bbdecorations from '$lib/images/clients/bbdecorations.webp';
	import bbdecorationsPreview from '$lib/images/clients/bbdecorations-preview.webp';

	type Project = {
		name: string;
		category: string;
		summary: string;
		scope: string[];
		image: string;
		imageAlt: string;
		imageWidth: number;
		imageHeight: number;
		imageClass?: string;
		preview?: string;
		previewAlt?: string;
		previewWidth?: number;
		previewHeight?: number;
		href?: string;
	};

	const projects: Project[] = [
		{
			name: 'B&B Decorations',
			category: 'Local Service Business',
			summary:
				'A custom-designed website for a Central Valley event decor and rental company, built to showcase weddings, quinceaneras, service categories, client reviews, and a clear quote request path.',
			scope: ['Custom Web Design', 'Local SEO', 'Lead Generation'],
			image: bbdecorations,
			imageAlt: 'B&B Decorations logo',
			imageWidth: 360,
			imageHeight: 164,
			preview: bbdecorationsPreview,
			previewAlt: 'B&B Decorations homepage screenshot',
			previewWidth: 3600,
			previewHeight: 2084,
			href: 'https://bbdecorations.com',
		},
		{
			name: 'NPC Iron Breed Classic',
			category: 'Event Website',
			summary:
				'A custom-designed event website for a 2026 NPC national qualifier, built around athlete-first show details, registration paths, vendors, sponsors, venue information, and structured event SEO.',
			scope: ['Custom Web Design', 'Event Experience', 'Structured SEO'],
			image: ironbreed,
			imageAlt: 'NPC Iron Breed Classic logo',
			imageWidth: 320,
			imageHeight: 214,
			imageClass: 'project-logo--native',
			preview: ironbreedPreview,
			previewAlt: 'NPC Iron Breed Classic homepage screenshot',
			previewWidth: 3600,
			previewHeight: 2152,
			href: 'https://ironbreed.pages.dev',
		},
		{
			name: 'Johnathan Bernal',
			category: 'Luxury Commerce',
			summary:
				'A custom-designed Shopify Hydrogen storefront for the BoxGod brand, blending cinematic storytelling, lookbook imagery, product browsing, cart and account flows, and bespoke commission requests.',
			scope: ['Custom Web Design', 'Shopify Hydrogen', 'Commerce Flow'],
			image: jb,
			imageAlt: 'Johnathan Bernal logo',
			imageWidth: 320,
			imageHeight: 213,
			preview: jbPreview,
			previewAlt: 'BoxGod homepage screenshot',
			previewWidth: 3600,
			previewHeight: 2084,
			href: 'https://boxgod.pages.dev',
		},
		{
			name: 'BORNXCREATE',
			category: 'Brand Commerce',
			summary:
				'A product-focused storefront for a handcrafted custom footwear brand, built around made-to-order drops, cleats, apparel, creator-led storytelling, and a clear custom-order path.',
			scope: ['Storefront Design', 'Product Catalog', 'Custom Order Flow'],
			image: bornxcreate,
			imageAlt: 'BORNXCREATE logo',
			imageWidth: 360,
			imageHeight: 150,
			href: 'https://bornxcreate.shop',
		},
	];

	const description =
		'Explore Elleven Media portfolio projects for client websites, brand experiences, ecommerce, service businesses, and personal brands.';
</script>

<Seo title="Portfolio | Elleven Media Client Websites" {description} path="/portfolio" />

<section class="portfolio-hero">
	<div class="portfolio-hero-bg">
		<PlasmaGrid color="#000000" highlightColor="rgba(255, 255, 255, 0.4)" />
	</div>
	<div class="container portfolio-hero-inner">
		<p class="section-tag">Portfolio</p>
		<h1 class="portfolio-title">Selected client <em>websites</em>.</h1>
		<p class="portfolio-sub">
			A concise look at the live brands and digital experiences Elleven Media has helped shape, launch, and support.
		</p>
	</div>
</section>

<section class="portfolio-work" aria-label="Client websites">
	<div class="container portfolio-list">
		{#each projects as project, i}
			<article class="project-row" style="--index: {i};">
				<div class="row-content">
					<p class="project-category">{project.category}</p>
					<h2 class="project-title">{project.name}</h2>
					<p class="project-summary">{project.summary}</p>
					<ul class="project-scope" aria-label={`${project.name} project scope`}>
						{#each project.scope as item}
							<li>{item}</li>
						{/each}
					</ul>
					{#if project.href}
						<div class="project-link-wrapper">
							<a class="project-link" href={project.href} target="_blank" rel="noopener noreferrer">
								Visit Site <span class="arrow">&rarr;</span>
							</a>
						</div>
					{/if}
				</div>

				<div class="row-visual">
					{#if project.href}
						<a
							class="visual-glass"
							class:visual-glass--preview={project.preview}
							href={project.href}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`Visit ${project.name}`}
						>
							{#if project.preview}
								<img
									class="project-preview-image"
									src={project.preview}
									alt={project.previewAlt}
									width={project.previewWidth}
									height={project.previewHeight}
									loading="lazy"
									decoding="async"
								/>
							{:else}
								<img
									class="project-logo {project.imageClass ?? ''}"
									src={project.image}
									alt={project.imageAlt}
									width={project.imageWidth}
									height={project.imageHeight}
									loading="lazy"
									decoding="async"
								/>
							{/if}
						</a>
					{:else}
						<div class="visual-glass visual-glass--disabled">
							<img
								class="project-logo {project.imageClass ?? ''}"
								src={project.image}
								alt={project.imageAlt}
								width={project.imageWidth}
								height={project.imageHeight}
								loading="lazy"
								decoding="async"
							/>
						</div>
					{/if}
				</div>
			</article>
		{/each}
	</div>
</section>

<section class="portfolio-cta">
	<div class="container portfolio-cta-inner">
		<p class="section-tag">Next Project</p>
		<h2 class="cta-headline">Ready to build the next featured launch?</h2>
		<a href="/contact" class="btn btn-primary btn-massive">
			Start a Project <span class="arrow">&rarr;</span>
		</a>
	</div>
</section>

<style>
	.portfolio-hero {
		padding: calc(var(--nav-height) + var(--space-4xl)) 0 var(--space-3xl);
		position: relative;
		overflow: hidden;
	}

	.portfolio-hero-bg {
		position: absolute;
		inset: 0;
		z-index: 0;
		opacity: 0.6;
		pointer-events: none;
	}

	.portfolio-hero-bg::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, transparent 40%, var(--color-black) 100%);
	}

	.portfolio-hero-inner {
		position: relative;
		max-width: 920px;
	}

	.section-tag {
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--color-gray-400);
		margin-bottom: var(--space-lg);
	}

	.portfolio-title {
		font-size: clamp(2.6rem, 7vw, 6.8rem);
		font-weight: 700;
		line-height: 0.98;
		margin-bottom: var(--space-xl);
		max-width: 880px;
	}

	.portfolio-title em {
		font-style: italic;
		font-weight: 400;
	}

	.portfolio-sub {
		max-width: 680px;
		font-size: 1.12rem;
		line-height: 1.7;
		color: var(--color-gray-300);
	}

	.portfolio-work {
		padding: var(--space-xl) 0 var(--space-5xl);
	}

	.portfolio-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4xl);
	}

	.project-row {
		display: flex;
		align-items: center;
		gap: var(--space-4xl);
		padding-bottom: var(--space-4xl);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		
		opacity: 0;
		animation: fadeSlideUp 0.8s var(--ease-out) forwards;
		animation-delay: calc(var(--index, 0) * 0.15s);
	}

	.project-row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.project-row:nth-child(even) {
		flex-direction: row-reverse;
	}

	.row-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.row-visual {
		flex: 1;
		width: 100%;
		max-width: 600px;
	}

	@keyframes fadeSlideUp {
		from {
			opacity: 0;
			transform: translateY(40px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.project-category {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		color: var(--color-gray-500);
		margin-bottom: var(--space-md);
	}

	.project-title {
		font-size: clamp(2rem, 4vw, 3.5rem);
		line-height: 1.1;
		font-family: var(--font-sans);
		font-weight: 700;
		letter-spacing: -0.02em;
		margin-bottom: var(--space-lg);
	}

	.project-summary {
		font-size: 1.1rem;
		line-height: 1.6;
		color: var(--color-gray-300);
		margin-bottom: var(--space-xl);
		max-width: 540px;
	}

	.project-scope {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-bottom: var(--space-2xl);
	}

	.project-scope li {
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: var(--color-gray-300);
		font-size: 0.8rem;
		line-height: 1;
		padding: 0.65rem 0.85rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.02);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.project-link-wrapper {
		margin-top: auto;
	}

	.project-link {
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
		transition: color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out);
	}

	.project-link .arrow {
		transition: transform var(--duration-fast) var(--ease-out);
	}

	.project-link:hover {
		color: var(--color-gray-300);
		border-color: rgba(255, 255, 255, 0.25);
	}

	.project-link:hover .arrow {
		transform: translateX(6px);
	}

	.visual-glass {
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 4 / 3;
		background: rgba(13, 13, 13, 0.4);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 16px;
		padding: var(--space-2xl);
		position: relative;
		overflow: hidden;
		transition: border-color var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out);
	}

	.visual-glass::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at center, rgba(255, 255, 255, 0.03) 0%, transparent 70%);
		opacity: 0;
		transition: opacity var(--duration-normal) var(--ease-out);
	}

	.visual-glass:hover {
		border-color: rgba(255, 255, 255, 0.2);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	.visual-glass:hover::before {
		opacity: 1;
	}

	.visual-glass--preview {
		display: block;
		padding: 0;
		aspect-ratio: 16 / 10;
	}

	.visual-glass--preview::before {
		z-index: 1;
		background: linear-gradient(180deg, transparent 58%, rgba(0, 0, 0, 0.5) 100%);
		opacity: 1;
	}

	.visual-glass--disabled {
		cursor: default;
		pointer-events: none;
	}

	.project-preview-image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
	}

	.project-logo {
		position: relative;
		z-index: 1;
		width: min(80%, 320px);
		height: auto;
		max-height: 140px;
		object-fit: contain;
		filter: brightness(0) invert(1);
		opacity: 0.9;
	}

	.project-logo--native {
		filter: none;
	}

	.portfolio-cta {
		padding: var(--space-2xl) 0 var(--space-5xl);
		position: relative;
	}

	.portfolio-cta::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 400px;
		background: radial-gradient(ellipse at top, rgba(255, 255, 255, 0.03), transparent 70%);
		pointer-events: none;
	}

	.portfolio-cta-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding-top: var(--space-4xl);
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.portfolio-cta .section-tag {
		margin-bottom: var(--space-xl);
	}

	.cta-headline {
		font-family: var(--font-sans);
		font-size: clamp(3rem, 6vw, 5.5rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1.05;
		max-width: 900px;
		margin-bottom: var(--space-3xl);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.85rem 2rem;
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.btn-primary {
		background: var(--color-white);
		color: var(--color-black);
		border-radius: 4px;
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
		background: var(--color-white);
		box-shadow: 0 0 50px rgba(255, 255, 255, 0.25);
		transform: scale(1.03) translateY(-2px);
	}

	.btn-massive:hover .arrow {
		transform: translateX(8px);
	}

	@media (max-width: 900px) {
		.portfolio-hero {
			padding: calc(var(--nav-height) + var(--space-3xl)) 0 var(--space-2xl);
		}

		.project-row, .project-row:nth-child(even) {
			flex-direction: column-reverse;
			gap: var(--space-2xl);
		}

		.row-visual {
			max-width: 100%;
		}

		.portfolio-cta-inner {
			padding-top: var(--space-3xl);
		}
		
		.cta-headline {
			font-size: 2.5rem;
			margin-bottom: var(--space-2xl);
		}
	}

	@media (max-width: 576px) {
		.portfolio-hero {
			padding: calc(var(--nav-height) + var(--space-2xl)) 0 var(--space-xl);
		}

		.portfolio-title {
			font-size: 2.7rem;
			line-height: 1.05;
		}

		.portfolio-sub {
			font-size: 1rem;
		}

		.portfolio-work {
			padding-bottom: var(--space-4xl);
		}

		.project-title {
			font-size: 2.2rem;
		}

		.project-summary {
			font-size: 1rem;
			margin-bottom: var(--space-lg);
		}

		.visual-glass:not(.visual-glass--preview) {
			aspect-ratio: 1 / 1;
			padding: var(--space-xl);
		}

		.visual-glass--preview {
			aspect-ratio: 16 / 10;
			padding: 0;
		}

		.project-logo {
			width: min(90%, 280px);
			max-height: 100px;
		}

		.project-scope li {
			font-size: 0.75rem;
			padding: 0.5rem 0.75rem;
		}
	}
</style>
