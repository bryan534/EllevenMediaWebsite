<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, fly } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import type { ActionData } from './$types';
	import bornxcreate from '$lib/images/clients/bazaart.webp?enhanced';
	import ironbreed from '$lib/images/clients/ironbreed.png?enhanced';
	import jb from '$lib/images/clients/jb.png?enhanced';
	import bbdecorations from '$lib/images/clients/bblogowhite.png?enhanced';

	let { form } = $props<{ form: ActionData }>();
	
	let isSubmitting = $state(false);
	let formHeight = $state<number>(0);
	const inquiryTypes = [
		'New Website',
		'SEO & Performance',
		'Hosting & Infrastructure',
		'Email & Domain Setup',
		'DevOps & Deployment',
		'General Inquiry',
	];
</script>

<svelte:head>
	<title>contact — elleven media</title>
	<meta name="description" content="Get in touch with EllevenMedia for your next digital project." />
</svelte:head>

<section class="contact-section">
	<div class="container contact-container">
		<div class="contact-header">
			<p class="section-tag">Get in Touch</p>
			<h1 class="contact-title">Let's start a <em>conversation</em>.</h1>
			<p class="contact-sub">
				Digital experiences, built to last.
			</p>
			
			<div class="services-block">
				<p class="block-label">What We Do</p>
				<ul class="services-list">
					<li>Web Design &amp; Development</li>
					<li>SEO &amp; Performance</li>
					<li>Hosting &amp; Infrastructure</li>
					<li>Email &amp; Domain Setup</li>
					<li>DevOps &amp; Deployment</li>
				</ul>
			</div>

			<div class="clients-block">
				<p class="block-label">Trusted By</p>
				<div class="clients-logos">
					<a href="https://www.bornxcreate.shop" target="_blank" rel="noopener noreferrer">
						<enhanced:img src={bornxcreate} alt="BORNXCREATE" sizes="100px" />
					</a>
					<enhanced:img src={ironbreed} alt="IronBreed" class="no-invert" sizes="100px" />
					<enhanced:img src={jb} alt="Johnathan Bernal" sizes="100px" />
					<a href="https://bbdecorations.com" target="_blank" rel="noopener noreferrer">
						<enhanced:img src={bbdecorations} alt="B&amp;B Decorations" sizes="100px" />
					</a>
				</div>
			</div>

		</div>

		<div class="contact-form-wrapper">
			{#if form?.success}
				<div 
					class="success-message"
					style:min-height="{formHeight}px"
					in:fly={{ y: 20, duration: 600, delay: 300, easing: backOut }}
					out:fade={{ duration: 200 }}
				>
					<div class="success-icon" in:fly={{ y: 20, duration: 600, delay: 500, easing: backOut }}>
						<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
							<polyline points="22 4 12 14.01 9 11.01"></polyline>
						</svg>
					</div>
					<h3 in:fly={{ y: 20, duration: 600, delay: 600, easing: backOut }}>Thank you for reaching out!</h3>
					<p in:fly={{ y: 20, duration: 600, delay: 700, easing: backOut }}>We've received your message and will get back to you shortly.</p>
				</div>
			{:else}
				<form 
					bind:clientHeight={formHeight}
					method="POST" 
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
						};
					}} 
					class="contact-form"
					out:fly={{ y: -20, duration: 300, opacity: 0 }}
					in:fade={{ duration: 300 }}
				>
					{#if form?.missing}
						<div class="error-message">Please fill in all required fields.</div>
					{:else if form?.error}
						<div class="error-message">Something went wrong sending your message. Please try again or email us directly at <a href="mailto:hello@ellevenmediagroup.com">hello@ellevenmediagroup.com</a>.</div>
					{/if}

					<!-- Honeypot Field -->
					<div class="sr-only" aria-hidden="true">
						<label for="website_url">Website URL</label>
						<input type="text" id="website_url" name="website_url" tabindex="-1" autocomplete="off" />
					</div>

					<div class="form-group">
						<label for="inquiry">Inquiry Type</label>
						<select id="inquiry" name="inquiry" value={form?.inquiry ?? ''}>
							<option value="" disabled selected>Select an inquiry type</option>
							{#each inquiryTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label for="name">Name</label>
						<input type="text" id="name" name="name" value={form?.name ?? ''} required placeholder="Jane Doe" autocomplete="name" />
					</div>

					<div class="form-group">
						<label for="email">Email</label>
						<input type="email" id="email" name="email" value={form?.email ?? ''} required placeholder="jane@example.com" autocomplete="email" />
					</div>

<div class="form-group">
						<label for="message">Message</label>
						<textarea id="message" name="message" rows="5" required placeholder="Tell us about your project...">{form?.message ?? ''}</textarea>
					</div>

					<p class="form-disclaimer">
						By submitting this form, you agree to our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms of Use</a>. We will use your information only to respond to your inquiry and provide our services.
					</p>
					<button type="submit" class="btn btn-primary submit-btn" disabled={isSubmitting}>
						{isSubmitting ? 'Sending...' : 'Send Message'}
					</button>
				</form>
			{/if}
		</div>
	</div>
</section>

<style>
	.contact-section {
		padding: calc(var(--nav-height) + var(--space-4xl)) 0 var(--space-5xl);
		min-height: 100vh;
		display: flex;
		align-items: center;
	}

	.contact-container {
		display: grid;
		grid-template-columns: 1fr 1.2fr;
		gap: var(--space-4xl);
		align-items: start;
	}

	.section-tag {
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--color-gray-400);
		margin-bottom: var(--space-lg);
	}

	.contact-title {
		font-size: clamp(2.5rem, 5vw, 4.5rem);
		font-weight: 700;
		line-height: 1.1;
		margin-bottom: var(--space-xl);
	}

	.contact-title em {
		font-style: italic;
		font-weight: 400;
	}

	.contact-sub {
		font-size: 1.2rem;
		line-height: 1.6;
		color: var(--color-white);
		font-weight: 400;
		margin-bottom: var(--space-2xl);
		max-width: 90%;
	}

	.block-label {
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--color-gray-500);
		margin-bottom: var(--space-md);
	}

	.services-block {
		margin-bottom: var(--space-2xl);
	}

	.services-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		border-left: 1px solid rgba(255, 255, 255, 0.12);
		padding-left: var(--space-lg);
	}

	.services-list li {
		font-size: 0.95rem;
		color: var(--color-gray-300);
		line-height: 1.5;
	}

	.clients-block {
		margin-top: var(--space-3xl);
	}

	.clients-logos {
		display: flex;
		align-items: center;
		gap: var(--space-xl);
		flex-wrap: wrap;
	}

	.clients-logos img {
		height: 46px;
		width: auto;
		object-fit: contain;
		filter: brightness(0) invert(1);
		opacity: 0.6;
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	.clients-logos img:hover {
		opacity: 1;
	}

	.clients-logos a {
		display: flex;
		align-items: center;
	}

	.clients-logos img.no-invert {
		filter: none;
	}

	/* Form */
	.contact-form-wrapper {
		background: var(--color-gray-900);
		padding: var(--space-3xl);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.05);
		display: grid;
		overflow: hidden;
	}

	.contact-form-wrapper > * {
		grid-area: 1 / 1;
	}

	.contact-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	label {
		font-size: 0.85rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-gray-400);
	}

	input, textarea {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		padding: 1rem;
		color: var(--color-white);
		font-family: inherit;
		font-size: 1rem;
		transition: border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out);
	}

	input::placeholder, textarea::placeholder {
		color: var(--color-gray-600);
	}

	input:focus, textarea:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.3);
		background: rgba(0, 0, 0, 0.4);
	}

	.btn {
		display: inline-block;
		padding: 0.85rem 2rem;
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		transition: all var(--duration-fast) var(--ease-out);
		cursor: pointer;
	}

	.btn-primary {
		background: var(--color-white);
		color: var(--color-black);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-gray-200);
		transform: translateY(-2px);
	}

	.btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.submit-btn {
		margin-top: calc(-1 * var(--space-lg));
		align-self: stretch;
		width: 100%;
		text-align: center;
		padding: 1.1rem 2rem;
	}

	.form-disclaimer {
		font-size: 0.55rem;
		color: var(--color-gray-600);
		line-height: 1.5;
		margin-top: calc(-1 * var(--space-xl) + var(--space-xs));
		text-align: center;
	}

	.form-disclaimer a {
		color: var(--color-gray-500);
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.form-disclaimer a:hover {
		color: var(--color-gray-300);
	}

	select {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		padding: 1rem;
		color: var(--color-white);
		font-family: inherit;
		font-size: 1rem;
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23808080' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 1rem center;
		transition: border-color var(--duration-fast) var(--ease-out), background-color var(--duration-fast) var(--ease-out);
	}

	select:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.3);
		background-color: rgba(0, 0, 0, 0.4);
	}

	select option {
		background: var(--color-gray-900);
		color: var(--color-white);
	}

	.error-message {
		color: #ff6b6b;
		font-size: 0.9rem;
		background: rgba(255, 107, 107, 0.1);
		padding: 1rem;
		border-radius: 6px;
		border: 1px solid rgba(255, 107, 107, 0.2);
	}

	.error-message a {
		color: #ff9a9a;
		text-decoration: underline;
	}

	.success-message {
		text-align: center;
		padding: var(--space-3xl) var(--space-xl);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.success-icon {
		color: #51cf66;
		margin-bottom: var(--space-lg);
	}

	.success-message h3 {
		font-size: 1.5rem;
		margin-bottom: var(--space-md);
		color: #51cf66;
	}

	.success-message p {
		color: var(--color-gray-400);
		line-height: 1.6;
	}

	@media (max-width: 992px) {
		.contact-section {
			padding: calc(var(--nav-height) + var(--space-2xl)) 0 var(--space-4xl);
			align-items: flex-start;
		}

		.contact-container {
			grid-template-columns: 1fr;
			gap: var(--space-2xl);
		}
		
		.contact-form-wrapper {
			padding: var(--space-xl);
		}
	}

	@media (max-width: 576px) {
		.contact-section {
			padding: calc(var(--nav-height) + var(--space-lg)) 0 var(--space-2xl);
		}

		.contact-title {
			font-size: 2.2rem;
			margin-bottom: var(--space-lg);
		}

		.contact-sub {
			font-size: 1rem;
		}

		.contact-form-wrapper {
			padding: var(--space-lg);
		}

		.submit-btn {
			width: 100%;
			text-align: center;
		}

		.clients-logos {
			flex-wrap: nowrap;
			justify-content: space-between;
			gap: var(--space-sm);
		}

		.clients-logos img,
		.clients-logos a img {
			height: 40px;
			flex-shrink: 1;
		}
	}
</style>
