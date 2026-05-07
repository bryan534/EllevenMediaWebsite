<script lang="ts">
	import './layout.css';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head><title>EllevenMedia — Premium Digital Media Studio</title></svelte:head>

<nav class="nav">
	<div class="nav-inner container">
		<a href="/" class="logo">ELLEVEN<span>MEDIA</span></a>

		<ul class="nav-links">
			<li><a href="#services">Services</a></li>
			<li><a href="#work">Work</a></li>
			<li><a href="#about">About</a></li>
			<li><a href="#contact" class="nav-cta">Get in Touch</a></li>
		</ul>
	</div>
</nav>

{@render children()}

<footer class="footer">
	<div class="container footer-inner">
		<p class="footer-logo">ELLEVEN<span>MEDIA</span></p>
		<p class="footer-copy">© {new Date().getFullYear()} EllevenMedia. All rights reserved.</p>
	</div>
</footer>

<style>
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 100;
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		background: rgba(0, 0, 0, 0.6);
		border-bottom: var(--border-thin);
	}

	.nav-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--nav-height);
	}

	.logo {
		font-family: var(--font-sans);
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		color: var(--color-white);
	}

	.logo span {
		font-weight: 300;
		opacity: 0.6;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: var(--space-xl);
		list-style: none;
	}

	.nav-links a {
		font-size: 0.85rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-gray-300);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.nav-links a:hover {
		color: var(--color-white);
	}

	.nav-cta {
		padding: 0.6rem 1.4rem;
		border: 1px solid var(--color-white);
		transition: all var(--duration-fast) var(--ease-out);
	}

	.nav-cta:hover {
		background: var(--color-white);
		color: var(--color-black) !important;
	}

	.footer {
		border-top: var(--border-thin);
		padding: var(--space-2xl) 0;
	}

	.footer-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.footer-logo {
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: 0.15em;
	}

	.footer-logo span {
		font-weight: 300;
		opacity: 0.6;
	}

	.footer-copy {
		font-size: 0.8rem;
		color: var(--color-gray-500);
	}

	@media (max-width: 768px) {
		.nav-links {
			gap: var(--space-md);
		}
		.nav-links a {
			font-size: 0.75rem;
		}
		.footer-inner {
			flex-direction: column;
			gap: var(--space-md);
			text-align: center;
		}
	}
</style>
