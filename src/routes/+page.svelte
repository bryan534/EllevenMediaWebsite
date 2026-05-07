<svelte:head>
	<meta name="description" content="EllevenMedia crafts premium websites and digital experiences for individuals and brands." />
</svelte:head>

<!-- ── Hero ── -->
<section class="hero" id="hero">
	<div class="container hero-content">
		<p class="hero-tag">Digital Media Studio</p>
		<h1 class="hero-title">We craft websites<br />that <em>elevate</em> brands.</h1>
		<p class="hero-sub">
			EllevenMedia specializes in designing and developing premium digital
			experiences for individuals and businesses who refuse to blend in.
		</p>
		<div class="hero-actions">
			<a href="#contact" class="btn btn-primary">Start a Project</a>
			<a href="#work" class="btn btn-ghost">View Our Work</a>
		</div>
	</div>
	<div class="hero-fade"></div>
</section>

<!-- ── Services ── -->
<section class="section" id="services">
	<div class="container">
		<p class="section-tag">What We Do</p>
		<h2 class="section-title">Services</h2>
		<div class="services-grid">
			<div class="service-card">
				<span class="service-num">01</span>
				<h3>Web Design</h3>
				<p>Bespoke, responsive websites designed to captivate your audience and communicate your brand.</p>
			</div>
			<div class="service-card">
				<span class="service-num">02</span>
				<h3>Development</h3>
				<p>Clean, performant code built with modern frameworks that scale with your vision.</p>
			</div>
			<div class="service-card">
				<span class="service-num">03</span>
				<h3>Brand Identity</h3>
				<p>Cohesive visual systems — from logos to color palettes — that make you unmistakable.</p>
			</div>
			<div class="service-card">
				<span class="service-num">04</span>
				<h3>Content Strategy</h3>
				<p>Purposeful content architecture that tells your story and drives meaningful engagement.</p>
			</div>
		</div>
	</div>
</section>

<!-- ── Work ── -->
<section class="section section-dark" id="work">
	<div class="container">
		<p class="section-tag">Selected Projects</p>
		<h2 class="section-title">Our Work</h2>
		<div class="work-grid">
			<div class="work-card">
				<div class="work-placeholder"></div>
				<h3>Project One</h3>
				<p>Web Design &middot; Development</p>
			</div>
			<div class="work-card">
				<div class="work-placeholder"></div>
				<h3>Project Two</h3>
				<p>Brand Identity &middot; Web Design</p>
			</div>
			<div class="work-card">
				<div class="work-placeholder"></div>
				<h3>Project Three</h3>
				<p>Content Strategy &middot; Development</p>
			</div>
		</div>
	</div>
</section>

<!-- ── About ── -->
<section class="section" id="about">
	<div class="container about-content">
		<div>
			<p class="section-tag">Who We Are</p>
			<h2 class="section-title">About EllevenMedia</h2>
		</div>
		<p class="about-text">
			We're a digital media studio obsessed with craft. Every pixel, every
			interaction, every line of code is intentional. We partner with individuals
			and brands who want more than a website — they want a digital presence that
			commands attention.
		</p>
	</div>
</section>

<!-- ── Contact CTA ── -->
<section class="section cta-section" id="contact">
	<div class="container cta-content">
		<h2 class="cta-title">Ready to elevate<br />your digital presence?</h2>
		<a href="mailto:hello@ellevenmedia.com" class="btn btn-primary btn-lg">Let's Talk</a>
	</div>
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
	}

	.hero-tag {
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--color-gray-400);
		margin-bottom: var(--space-lg);
	}

	.hero-title {
		font-size: clamp(2.5rem, 7vw, 5.5rem);
		font-weight: 700;
		line-height: 1.05;
		margin-bottom: var(--space-xl);
	}

	.hero-title em {
		font-style: italic;
		font-weight: 400;
	}

	.hero-sub {
		max-width: 560px;
		margin: 0 auto var(--space-2xl);
		font-size: 1.05rem;
		line-height: 1.7;
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

	.btn-ghost {
		border: 1px solid var(--color-gray-600);
		color: var(--color-gray-300);
	}

	.btn-ghost:hover {
		border-color: var(--color-white);
		color: var(--color-white);
		transform: translateY(-2px);
	}

	.btn-lg {
		padding: 1.1rem 3rem;
		font-size: 0.95rem;
	}

	/* ── Sections ── */
	.section {
		padding: var(--space-5xl) 0;
	}

	.section-dark {
		background: var(--color-gray-900);
	}

	.section-tag {
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--color-gray-500);
		margin-bottom: var(--space-md);
	}

	.section-title {
		font-size: clamp(2rem, 4vw, 3.5rem);
		margin-bottom: var(--space-3xl);
	}

	/* ── Services ── */
	.services-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--space-xl);
	}

	.service-card {
		padding: var(--space-2xl);
		border: var(--border-thin);
		transition: all var(--duration-normal) var(--ease-out);
	}

	.service-card:hover {
		background: rgba(255, 255, 255, 0.03);
		border-color: rgba(255, 255, 255, 0.15);
		transform: translateY(-4px);
	}

	.service-num {
		display: block;
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-gray-500);
		margin-bottom: var(--space-lg);
		letter-spacing: 0.1em;
	}

	.service-card h3 {
		font-size: 1.3rem;
		margin-bottom: var(--space-md);
	}

	.service-card p {
		font-size: 0.9rem;
		color: var(--color-gray-400);
		line-height: 1.6;
	}

	/* ── Work ── */
	.work-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-xl);
	}

	.work-card {
		cursor: pointer;
		transition: transform var(--duration-normal) var(--ease-out);
	}

	.work-card:hover {
		transform: translateY(-4px);
	}

	.work-placeholder {
		aspect-ratio: 16 / 10;
		background: var(--color-gray-800);
		margin-bottom: var(--space-lg);
		border: var(--border-thin);
	}

	.work-card h3 {
		font-size: 1.15rem;
		margin-bottom: var(--space-xs);
	}

	.work-card p {
		font-size: 0.8rem;
		color: var(--color-gray-500);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	/* ── About ── */
	.about-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3xl);
		align-items: start;
	}

	.about-text {
		font-size: 1.1rem;
		line-height: 1.8;
		color: var(--color-gray-300);
	}

	/* ── CTA ── */
	.cta-section {
		text-align: center;
		padding: var(--space-5xl) 0;
		border-top: var(--border-thin);
	}

	.cta-title {
		font-size: clamp(2rem, 5vw, 4rem);
		margin-bottom: var(--space-2xl);
	}

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.about-content {
			grid-template-columns: 1fr;
			gap: var(--space-xl);
		}

		.work-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
