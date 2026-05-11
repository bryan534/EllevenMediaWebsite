<script lang="ts">
	import { PlasmaGrid } from "$lib/motion-core";
</script>

<svelte:head>
	<meta name="description" content="EllevenMedia crafts premium websites and digital experiences for individuals and brands." />
</svelte:head>

<!-- ── Hero ── -->
<section class="hero" id="hero">
	<div class="hero-plasma">
		<PlasmaGrid color="#000000" highlightColor="#ffffff" />
	</div>
	<div class="container hero-content">
		<img src="/logo-hero.svg" alt="EllevenMedia Full Logo" class="hero-main-logo" />
		<h1 class="hero-minimal-title">Digital Media Studio</h1>
		<p class="hero-minimal-sub">
			Crafting premium digital experiences for brands that refuse to blend in.
		</p>
		<div class="hero-actions">
			<a href="/contact" class="btn btn-primary">Start a Project</a>
		</div>
	</div>
	<div class="hero-fade"></div>
</section>



<style>
	/* ── Hero ── */
	.hero {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding-top: var(--nav-height);
		text-align: center;
		overflow: hidden;
	}

	.hero-plasma {
		position: absolute;
		inset: 0;
		z-index: 0;
		opacity: 0.4;
		pointer-events: none;
	}

	.hero::before {
		content: '';
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 100%);
		pointer-events: none;
	}

	.hero-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.hero-main-logo {
		width: 800px;
		max-width: 95vw;
		height: auto;
		object-fit: contain;
		margin-bottom: var(--space-2xl);
		filter: brightness(0) invert(1);
	}

	.hero-minimal-title {
		font-family: var(--font-sans);
		font-size: 1.15rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.25em;
		color: var(--color-white);
		margin-bottom: var(--space-md);
	}

	.hero-minimal-sub {
		max-width: 480px;
		margin: 0 auto var(--space-2xl);
		font-size: 1rem;
		line-height: 1.6;
		color: var(--color-gray-400);
	}

	.hero-actions {
		display: flex;
		gap: var(--space-md);
		justify-content: center;
		flex-wrap: wrap;
	}

	.hero-fade {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 120px;
		background: linear-gradient(to top, var(--color-black), transparent);
		pointer-events: none;
	}

	/* ── Buttons ── */
	.btn {
		display: inline-block;
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
	}

	.btn-primary:hover {
		background: var(--color-gray-200);
		transform: translateY(-2px);
	}

	@media (max-width: 768px) {
		.hero-main-logo {
			width: 90vw;
			margin-bottom: var(--space-xl);
		}
		.hero-minimal-title {
			font-size: 0.9rem;
			letter-spacing: 0.15em;
		}
		.hero-minimal-sub {
			font-size: 0.95rem;
		}
	}
</style>
