<svelte:head>
	<title>Terms of Service — EllevenMedia</title>
</svelte:head>

<section class="legal-section">
	<div class="container legal-container">
		<p class="section-tag">Legal</p>
		<h1 class="legal-title">Terms of Service</h1>
		<p class="legal-date">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

		<div class="legal-content">
			<h2>1. Acceptance of Terms</h2>
			<p>By accessing and using the EllevenMedia website, you accept and agree to be bound by the terms and provisions of this agreement. In addition, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>

			<h2>2. Provision of Services</h2>
			<p>EllevenMedia provides digital design and development services. We reserve the right to modify or discontinue any aspect of our services or website at any time without prior notice.</p>

			<h2>3. Intellectual Property</h2>
			<p>All content included on this site, such as text, graphics, logos, images, and code, is the property of EllevenMedia or its content suppliers and protected by international copyright laws.</p>

			<h2>4. User Conduct</h2>
			<p>You agree to use our website only for lawful purposes. You are prohibited from posting on or transmitting through our site any unlawful, harmful, threatening, abusive, or otherwise objectionable material of any kind.</p>

			<h2>5. Limitation of Liability</h2>
			<p>EllevenMedia shall not be liable for any direct, indirect, incidental, consequential, or exemplary damages resulting from the use or the inability to use our services or website.</p>
		</div>
	</div>
</section>

<style>
	.legal-section {
		padding: calc(var(--nav-height) + var(--space-4xl)) 0 var(--space-5xl);
		min-height: 100vh;
	}

	.legal-container {
		max-width: 800px;
	}

	.section-tag {
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--color-gray-400);
		margin-bottom: var(--space-md);
	}

	.legal-title {
		font-family: var(--font-sans);
		font-size: clamp(2.5rem, 5vw, 4rem);
		font-weight: 700;
		line-height: 1.1;
		margin-bottom: var(--space-sm);
	}

	.legal-date {
		color: var(--color-gray-500);
		font-size: 0.9rem;
		margin-bottom: var(--space-3xl);
		padding-bottom: var(--space-xl);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.legal-content h2 {
		font-size: 1.5rem;
		margin-top: var(--space-2xl);
		margin-bottom: var(--space-md);
		color: var(--color-white);
	}

	.legal-content p {
		color: var(--color-gray-300);
		line-height: 1.8;
		margin-bottom: var(--space-lg);
		font-size: 1.05rem;
	}

	.legal-content a {
		color: var(--color-white);
		text-decoration: underline;
		text-decoration-color: rgba(255, 255, 255, 0.3);
		text-underline-offset: 4px;
		transition: text-decoration-color var(--duration-fast);
	}

	.legal-content a:hover {
		text-decoration-color: var(--color-white);
	}

	@media (max-width: 768px) {
		.legal-section {
			padding: calc(var(--nav-height) + var(--space-2xl)) 0 var(--space-4xl);
		}
	}
</style>
