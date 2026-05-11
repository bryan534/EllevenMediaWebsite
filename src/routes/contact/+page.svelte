<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, fly } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import type { ActionData } from './$types';

	let { form } = $props<{ form: ActionData }>();
	
	let isSubmitting = $state(false);
	let formHeight = $state<number>(0);
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
				Whether you have a specific project in mind or just want to explore possibilities, we'd love to hear from you.
			</p>
			
			<div class="contact-info">
				<div class="info-block">
					<h3>Email</h3>
					<a href="mailto:hello@ellevenmediagroup.com">hello@ellevenmediagroup.com</a>
				</div>
				<div class="info-block">
					<h3>Location</h3>
					<p>Los Angeles, CA</p>
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
						<label for="name">Name</label>
						<input type="text" id="name" name="name" value={form?.name ?? ''} required placeholder="Jane Doe" autocomplete="name" />
					</div>

					<div class="form-group">
						<label for="email">Email</label>
						<input type="email" id="email" name="email" value={form?.email ?? ''} required placeholder="jane@example.com" autocomplete="email" />
					</div>

					<div class="form-group">
						<label for="subject">Subject</label>
						<input type="text" id="subject" name="subject" value={form?.subject ?? ''} placeholder="Project Inquiry" />
					</div>

					<div class="form-group">
						<label for="message">Message</label>
						<textarea id="message" name="message" rows="5" required placeholder="Tell us about your project...">{form?.message ?? ''}</textarea>
					</div>

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
		font-size: 1.1rem;
		line-height: 1.6;
		color: var(--color-gray-400);
		margin-bottom: var(--space-2xl);
		max-width: 90%;
	}

	.contact-info {
		display: flex;
		gap: var(--space-2xl);
		margin-top: var(--space-3xl);
	}

	.info-block h3 {
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-gray-500);
		margin-bottom: var(--space-xs);
	}

	.info-block a, .info-block p {
		font-size: 1.05rem;
		color: var(--color-white);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.info-block a:hover {
		color: var(--color-gray-400);
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
		margin-top: var(--space-sm);
		align-self: flex-start;
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

		.contact-info {
			flex-direction: column;
			gap: var(--space-lg);
			margin-top: var(--space-xl);
		}

		.contact-form-wrapper {
			padding: var(--space-lg);
		}
		
		.submit-btn {
			width: 100%;
			text-align: center;
		}
	}
</style>
