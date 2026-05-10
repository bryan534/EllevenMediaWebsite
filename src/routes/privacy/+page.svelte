<svelte:head>
	<title>Privacy Policy — EllevenMedia</title>
</svelte:head>

<section class="legal-section">
	<div class="container legal-container">
		<p class="section-tag">Legal</p>
		<h1 class="legal-title">Privacy Policy</h1>
		<p class="legal-date">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

		<div class="legal-content">
			<h2>1. Information We Collect</h2>
			<p>When you contact us via our website, we collect the personal information you provide, such as your name, email address, and any details included in your message.</p>

			<h2>2. How We Use Your Information</h2>
			<p>We use the information we collect strictly to communicate with you regarding your project inquiries, respond to your requests, and improve our services. We do not sell or rent your personal information to third parties.</p>

			<h2>3. Data Security</h2>
			<p>We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>

			<h2>4. Cookies and Tracking</h2>
			<p>Our website may use basic cookies to enhance user experience. We do not use intrusive tracking mechanisms or third-party advertising trackers.</p>

			<h2>5. Contact Us</h2>
			<p>If you have any questions regarding this privacy policy, you may contact us at <a href="mailto:hello@ellevenmediagroup.com">hello@ellevenmediagroup.com</a>.</p>
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
