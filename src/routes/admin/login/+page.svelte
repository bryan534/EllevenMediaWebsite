<script lang="ts">
	import { enhance } from '$app/forms';
	import { dev } from '$app/environment';
	import type { ActionData, PageData } from './$types';
	import { PlasmaGrid } from '$lib/motion-core';

	let { form, data }: { form: ActionData; data: PageData } = $props();
</script>

<svelte:head>
	<title>Elleven Streams Login — Elleven Media</title>
	{#if !dev}
		<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
	{/if}
</svelte:head>

<div class="login-page">
	<div class="login-plasma">
		<PlasmaGrid color="#000000" highlightColor="#ffffff" />
	</div>
	<div class="login-fade"></div>
	<div class="login-box">
		<div class="login-brand">
			<img src="/nav-logo.svg" alt="Elleven" class="login-logo" />
		</div>
		<form method="POST" use:enhance class="login-form">
			<label for="password" class="login-label">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
				class="login-input"
			/>
			{#if !dev}
				<div
					class="cf-turnstile"
					data-sitekey={data.turnstileSiteKey}
					data-theme="dark"
					data-size="flexible"
				></div>
			{/if}
			{#if form?.error}
				<p class="login-error">{form.error}</p>
			{/if}
			<button type="submit" class="login-btn">Sign in</button>
		</form>
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		position: relative;
		overflow: hidden;
	}

	.login-plasma {
		position: absolute;
		inset: 0;
		z-index: 0;
		opacity: 0.4;
		pointer-events: none;
	}

	.login-fade {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.95) 100%);
		z-index: 0;
		pointer-events: none;
	}

	.login-box {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 380px;
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
		background: rgba(255, 255, 255, 0.02);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 16px;
		padding: 2.5rem 2rem;
		box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
	}

	.login-brand {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		margin-bottom: 0.25rem;
	}

	.login-logo {
		height: 2.25rem;
		width: auto;
		object-fit: contain;
	}



	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.login-label {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: rgba(255, 255, 255, 0.4);
	}

	.login-input {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 0.85rem 1rem;
		color: #fff;
		font-size: 0.875rem;
		outline: none;
		width: 100%;
		transition: all 0.2s;
	}

	.login-input:focus {
		border-color: rgba(255, 255, 255, 0.25);
		background: rgba(255, 255, 255, 0.06);
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.04);
	}

	.login-error {
		font-size: 0.8rem;
		color: #fca5a5;
		margin: 0;
	}

	.cf-turnstile {
		align-self: center;
	}

	.login-btn {
		background: #fff;
		color: #000;
		border: none;
		border-radius: 8px;
		padding: 0.85rem;
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		cursor: pointer;
		transition: all 0.2s;
		margin-top: 0.5rem;
	}

	.login-btn:hover {
		background: rgba(255, 255, 255, 0.85);
		transform: translateY(-2px);
	}
</style>
