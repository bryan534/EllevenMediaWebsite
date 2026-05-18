<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { PlasmaGrid } from '$lib/motion-core';
	import type { PageData, ActionData, SubmitFunction } from './$types';

		let { data, form }: { data: PageData; form: ActionData } = $props();

	function mask(val: string) {
		return '*'.repeat(val.length);
	}

	let provisionEmail = $state('');
	let provisionNote = $state('');
	let revealedTokens = $state(new Set<string>());
	let lastPassword = $state<string | null>(null);
	let lastEmail = $state<string | null>(null);
	let lastApiToken = $state<string | null>(null);
	let lastWarning = $state<string | null>(null);
	let copyStatus = $state<string | null>(null);
	let provisionPending = $state(false);
	let removePending = $state(false);
	let renewPending = $state(false);
	let logoutPending = $state(false);
	let removeCandidate = $state<{ auth_id: string; email: string } | null>(null);
	let renewCandidate = $state<{ auth_id: string; email: string; duration: string } | null>(null);
	let activeDropdown = $state<string | null>(null);
	let now = $state(new Date());
	let copyResetTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (form?.action === 'provision' && form?.success) {
			lastPassword = (form as { password?: string }).password ?? null;
			lastEmail = (form as { email?: string }).email ?? null;
			lastApiToken = (form as { apiToken?: string }).apiToken ?? null;
			lastWarning = (form as { warning?: string }).warning ?? null;
			provisionEmail = '';
			provisionNote = '';
		}
	});



	function toggleToken(authId: string) {
		const next = new Set(revealedTokens);
		if (next.has(authId)) next.delete(authId);
		else next.add(authId);
		revealedTokens = next;
	}

	function formatDate(iso: string) {
		const date = new Date(iso);
		if (Number.isNaN(date.getTime())) return '—';
		return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
	}

	function formatDateTime(date: Date | null) {
		if (!date || Number.isNaN(date.getTime())) return '—';
		return new Intl.DateTimeFormat('en-US', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(date);
	}

	function formatCountdown(target: Date | null) {
		if (!target || Number.isNaN(target.getTime())) return '—';

		const diff = target.getTime() - now.getTime();
		if (diff <= 0) return 'Invoice window open';

		const totalHours = Math.ceil(diff / (1000 * 60 * 60));
		const days = Math.floor(totalHours / 24);
		const hours = totalHours % 24;
		const dayLabel = days === 1 ? 'day' : 'days';
		const hourLabel = hours === 1 ? 'hour' : 'hours';

		if (days <= 0) return `${hours} ${hourLabel}`;
		return `${days} ${dayLabel} ${hours} ${hourLabel}`;
	}

	const planPricing: Record<number, { name: string; monthlyMsrp: number }> = {
		0: { name: 'Free', monthlyMsrp: 0 },
		1: { name: 'Essential', monthlyMsrp: 3 },
		2: { name: 'Standard', monthlyMsrp: 5 },
		3: { name: 'Pro', monthlyMsrp: 10 }
	};

	function getDiscountRate(userCount: number) {
		if (userCount >= 101) return 0.3;
		if (userCount >= 51) return 0.2;
		if (userCount >= 11) return 0.1;
		return 0;
	}

	const billingSummary = $derived.by(() => {
		if (!data.vendor) return null;

		const paidUntil = new Date(data.vendor.paid_until);
		const invoiceAt = Number.isNaN(paidUntil.getTime())
			? null
			: new Date(paidUntil.getTime() - 7 * 24 * 60 * 60 * 1000);
		const plan = planPricing[data.vendor.plan] ?? {
			name: `Plan ${data.vendor.plan}`,
			monthlyMsrp: 0
		};
		const discountRate = getDiscountRate(data.vendor.current_users);
		const gross = data.vendor.current_users * plan.monthlyMsrp;
		const estimate = gross * (1 - discountRate);

		return {
			paidUntil,
			invoiceAt,
			plan,
			discountRate,
			estimate,
			userCount: data.vendor.current_users
		};
	});

	const moneyFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	});

	async function copyText(value: string | null | undefined, label: string) {
		if (!value) return;

		try {
			await navigator.clipboard.writeText(value);
			copyStatus = `${label} copied`;
		} catch {
			copyStatus = 'Copy failed';
		}

		if (copyResetTimer) clearTimeout(copyResetTimer);
		copyResetTimer = setTimeout(() => {
			copyStatus = null;
		}, 1800);
	}

	const provisionEnhance: SubmitFunction = () => {
		provisionPending = true;
		return async ({ update }) => {
			try {
				await update();
			} finally {
				provisionPending = false;
			}
		};
	};

	const removeEnhance: SubmitFunction = () => {
		removePending = true;
		return async ({ update }) => {
			try {
				await update();
			} finally {
				removePending = false;
				removeCandidate = null;
			}
		};
	};

	const renewEnhance: SubmitFunction = () => {
		renewPending = true;
		return async ({ update }) => {
			try {
				await update();
			} finally {
				renewPending = false;
				renewCandidate = null;
			}
		};
	};

	const logoutEnhance: SubmitFunction = () => {
		logoutPending = true;
		return async ({ update }) => {
			try {
				await update();
			} finally {
				logoutPending = false;
			}
		};
	};

	onMount(() => {
		const timer = setInterval(() => {
			now = new Date();
		}, 60 * 1000);

		return () => clearInterval(timer);
	});
</script>

<svelte:head>
	<title>Elleven Streams — Elleven Media</title>
</svelte:head>

<svelte:window onclick={() => { activeDropdown = null; }} />

<main class="admin">
	<div class="admin-plasma">
		<PlasmaGrid color="#000000" highlightColor="#ffffff" />
	</div>
	<div class="admin-fade"></div>
	<header class="admin-header">
		<div class="admin-header-inner">
			<div class="admin-brand">
				<img src="/nav-logo.svg" alt="Elleven" class="admin-logo" />
				<h1 class="admin-title">Streams</h1>
			</div>
			<span
				class="env-badge"
				class:env-badge--prod={data.usingProductionDb}
				class:env-badge--local={!data.usingProductionDb}
				title={data.usingProductionDb
					? 'Admin actions write to the production D1 database.'
					: 'Admin actions write to the local D1 database.'}
			>
				{data.databaseMode}
			</span>
			{#if data.vendor}
				<div class="vendor-stats">
					<span class="stat">
						<span class="stat-label">Users</span>
						<span class="stat-value"
							>{data.vendor.current_users} / {data.vendor.users_allowed}</span
						>
					</span>
					<span class="stat-divider">·</span>
					<span class="stat">
						<span class="stat-label">Status</span>
						<span class="stat-value stat-value--{data.vendor.vendor_status}"
							>{data.vendor.vendor_status}</span
						>
					</span>
					<span class="stat-divider">·</span>
					<span class="stat">
						<span class="stat-label">Paid until</span>
						<span class="stat-value">{formatDate(data.vendor.paid_until)}</span>
					</span>
					{#if !data.vendor.can_register_new}
						<span class="badge badge--warn">Cannot register new users</span>
					{/if}
				</div>
			{/if}
			<form method="POST" action="?/logout" use:enhance={logoutEnhance} class="logout-form">
				<button type="submit" class="btn-link" disabled={logoutPending}
					>{logoutPending ? 'Logging out...' : 'Log out'}</button
				>
			</form>
		</div>
	</header>

	<div class="admin-body">
		{#if copyStatus}
			<div class="copy-toast" role="status">{copyStatus}</div>
		{/if}

		{#each data.configErrors as configError}
			<div class="alert alert--warn">{configError}</div>
		{/each}

		{#if data.vendorError}
			<div class="alert alert--error">{data.vendorError}</div>
		{/if}

		{#if billingSummary}
			<section class="billing-panel" aria-label="Billing estimate">
				<div class="billing-metric billing-metric--primary">
					<span class="billing-label">Invoice in</span>
					<span class="billing-value">{formatCountdown(billingSummary.invoiceAt)}</span>
					<span class="billing-detail">{formatDateTime(billingSummary.invoiceAt)}</span>
				</div>
				<div class="billing-metric">
					<span class="billing-label">Estimated invoice</span>
					<span class="billing-value">{moneyFormatter.format(billingSummary.estimate)}</span>
					<span class="billing-detail">
						{billingSummary.userCount} users × {billingSummary.plan.name}
						{moneyFormatter.format(billingSummary.plan.monthlyMsrp)}
					</span>
				</div>
				<div class="billing-metric">
					<span class="billing-label">Discount tier</span>
					<span class="billing-value">{Math.round(billingSummary.discountRate * 100)}%</span>
					<span class="billing-detail">Estimated from current active users</span>
				</div>
			</section>
		{/if}

		<!-- Credentials banner shown once after provisioning -->
		{#if lastPassword}
			<div class="creds-banner">
				<div class="creds-banner-inner">
					<div>
						<p class="creds-title">User created — credentials saved</p>
						<p class="creds-sub">The password is stored and can be revealed from the user list.</p>
						<div class="creds-fields">
							<div class="creds-field">
								<span class="creds-field-label">Email</span>
								<code class="creds-field-value">{lastEmail}</code>
								<button class="icon-btn" type="button" onclick={() => copyText(lastEmail, 'Email')}
									>Copy</button
								>
							</div>
							<div class="creds-field">
								<span class="creds-field-label">Password</span>
								<code class="creds-field-value">{lastPassword}</code>
								<button class="icon-btn" type="button" onclick={() => copyText(lastPassword, 'Password')}
									>Copy</button
								>
							</div>
							{#if lastApiToken}
								<div class="creds-field">
									<span class="creds-field-label">API Token</span>
									<code class="creds-field-value">{lastApiToken}</code>
									<button
										class="icon-btn"
										type="button"
										onclick={() => copyText(lastApiToken, 'API token')}>Copy</button
									>
								</div>
							{/if}
						</div>
						{#if lastWarning}
							<p class="creds-warning">{lastWarning}</p>
						{/if}
					</div>
					<button
						class="creds-dismiss"
						onclick={() => {
							lastPassword = null;
							lastEmail = null;
							lastApiToken = null;
							lastWarning = null;
						}}>Dismiss</button
					>
				</div>
			</div>
		{/if}

		<!-- Provision form -->
		<section class="section">
			<h2 class="section-title">Add User</h2>
			<form
				method="POST"
				action="?/provision"
				use:enhance={provisionEnhance}
				class="provision-form"
				aria-busy={provisionPending}
			>
				<div class="form-row">
					<div class="field">
						<label for="email" class="label">Email</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							placeholder="customer@example.com"
							bind:value={provisionEmail}
							class="input"
							disabled={provisionPending}
						/>
					</div>
					<div class="field">
						<label for="note" class="label">
							Note <span class="label-optional">(optional)</span>
						</label>
						<input
							id="note"
							name="note"
							type="text"
							placeholder="e.g. Paid June 2026"
							bind:value={provisionNote}
							class="input"
							disabled={provisionPending}
						/>
					</div>
					<button type="submit" class="btn btn--primary btn--provision" disabled={provisionPending}
						>{provisionPending ? 'Provisioning...' : 'Provision'}</button
					>
				</div>
				{#if form?.action === 'provision' && 'error' in form}
					<p class="form-error">{form.error}</p>
				{/if}
			</form>
		</section>

		<!-- Users table -->
		<section class="section">
			<h2 class="section-title">
				Users <span class="section-count">{data.users.length}</span>
			</h2>

			{#if form?.action === 'remove' && 'error' in form}
				<p class="form-error" style="margin-bottom: 1rem;">{form.error}</p>
			{/if}

			{#if data.users.length === 0}
				<p class="empty">No users provisioned yet.</p>
			{:else}
				<div class="table-wrap">
					<table class="table">
						<colgroup>
							<col class="col-email" />
							<col class="col-note" />
							<col class="col-status" />
							<col class="col-paid" />
							<col class="col-token" />
							<col class="col-action" />
						</colgroup>
						<thead>
							<tr>
								<th>Email</th>
								<th>Note</th>
								<th>Status</th>
								<th>Paid until</th>
								<th>API Token</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each data.users as user (user.auth_id)}
								<tr>
									<td class="td-email">{user.email}</td>
									<td class="td-muted">{user.note || '—'}</td>
									<td>
										{#if user.paid_until && new Date(user.paid_until) > now}
											<span class="badge badge--success">Active</span>
										{:else}
											<span class="badge badge--danger">Expired</span>
										{/if}
									</td>
									<td class="td-muted td-nowrap">
										{user.paid_until ? formatDate(user.paid_until) : '—'}
									</td>
									<td class="td-token">
										{#if user.api_token}
											{#if revealedTokens.has(user.auth_id)}
												<code class="token">{user.api_token}</code>
												<button class="btn-link" onclick={() => toggleToken(user.auth_id)}
													>Hide</button
												>
												<button
													class="btn-link"
													type="button"
													onclick={() => copyText(user.api_token, 'API token')}>Copy</button
												>
											{:else}
												<code class="token">{mask(user.api_token)}</code>
												<button class="btn-link" onclick={() => toggleToken(user.auth_id)}
													>Show</button
												>
											{/if}
										{:else}
											<span class="td-dim">—</span>
										{/if}
									</td>
									<td class="td-action">
										<div class="dropdown">
											<button
												type="button"
												class="icon-btn-ghost"
												onclick={(e) => {
													e.stopPropagation();
													activeDropdown = activeDropdown === user.auth_id ? null : user.auth_id;
												}}>
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
											</button>
											{#if activeDropdown === user.auth_id}
												<div class="dropdown-menu" onclick={(e) => e.stopPropagation()} role="menu" tabindex="0" onkeydown={(e) => { if (e.key === 'Escape') activeDropdown = null; }}>
													<button class="dropdown-item dropdown-item--success" onclick={() => { renewCandidate = { auth_id: user.auth_id, email: user.email, duration: 'month' }; activeDropdown = null; }}>
														Renew 1 Month
													</button>
													<button class="dropdown-item dropdown-item--success" onclick={() => { renewCandidate = { auth_id: user.auth_id, email: user.email, duration: '3_months' }; activeDropdown = null; }}>
														Renew 3 Months
													</button>
													<button class="dropdown-item dropdown-item--success" onclick={() => { renewCandidate = { auth_id: user.auth_id, email: user.email, duration: '6_months' }; activeDropdown = null; }}>
														Renew 6 Months
													</button>
													<button class="dropdown-item dropdown-item--success" onclick={() => { renewCandidate = { auth_id: user.auth_id, email: user.email, duration: 'year' }; activeDropdown = null; }}>
														Renew 1 Year
													</button>
													<button
														class="dropdown-item dropdown-item--danger"
														onclick={() => {
															removeCandidate = { auth_id: user.auth_id, email: user.email };
															activeDropdown = null;
														}}>Remove user</button>
												</div>
											{/if}
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div class="user-cards">
					{#each data.users as user (user.auth_id)}
						<article class="user-card">
							<div class="user-card-header">
								<div>
									<span class="user-card-label">Email</span>
									<p class="user-card-email">{user.email}</p>
								</div>
								<div class="dropdown">
									<button
										type="button"
										class="icon-btn-ghost"
										onclick={(e) => {
											e.stopPropagation();
											activeDropdown = activeDropdown === user.auth_id ? null : user.auth_id;
										}}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
									</button>
									{#if activeDropdown === user.auth_id}
										<div class="dropdown-menu" onclick={(e) => e.stopPropagation()} role="menu" tabindex="0" onkeydown={(e) => { if (e.key === 'Escape') activeDropdown = null; }}>
											<button class="dropdown-item dropdown-item--success" onclick={() => { renewCandidate = { auth_id: user.auth_id, email: user.email, duration: 'month' }; activeDropdown = null; }}>
												Renew 1 Month
											</button>
											<button class="dropdown-item dropdown-item--success" onclick={() => { renewCandidate = { auth_id: user.auth_id, email: user.email, duration: '3_months' }; activeDropdown = null; }}>
												Renew 3 Months
											</button>
											<button class="dropdown-item dropdown-item--success" onclick={() => { renewCandidate = { auth_id: user.auth_id, email: user.email, duration: '6_months' }; activeDropdown = null; }}>
												Renew 6 Months
											</button>
											<button class="dropdown-item dropdown-item--success" onclick={() => { renewCandidate = { auth_id: user.auth_id, email: user.email, duration: 'year' }; activeDropdown = null; }}>
												Renew 1 Year
											</button>
											<button
												class="dropdown-item dropdown-item--danger"
												onclick={() => {
													removeCandidate = { auth_id: user.auth_id, email: user.email };
													activeDropdown = null;
												}}>Remove user</button>
										</div>
									{/if}
								</div>
							</div>
							<div class="user-card-grid">
								<div>
									<span class="user-card-label">Status</span>
									<div>
										{#if user.paid_until && new Date(user.paid_until) > now}
											<span class="badge badge--success">Active</span>
										{:else}
											<span class="badge badge--danger">Expired</span>
										{/if}
									</div>
								</div>
								<div>
									<span class="user-card-label">Note</span>
									<p class="user-card-text">{user.note || '—'}</p>
								</div>
								<div>
									<span class="user-card-label">Paid until</span>
									<p class="user-card-text">{user.paid_until ? formatDate(user.paid_until) : '—'}</p>
								</div>
							</div>
							<div class="user-card-token">
								<span class="user-card-label">API Token</span>
								{#if user.api_token}
									{#if revealedTokens.has(user.auth_id)}
										<code class="token token--card">{user.api_token}</code>
										<div class="user-card-actions">
											<button class="btn-link" onclick={() => toggleToken(user.auth_id)}>Hide</button>
											<button
												class="btn-link"
												type="button"
												onclick={() => copyText(user.api_token, 'API token')}>Copy</button
											>
										</div>
									{:else}
										<code class="token token--card">{mask(user.api_token)}</code>
										<div class="user-card-actions">
											<button class="btn-link" onclick={() => toggleToken(user.auth_id)}>Show</button>
										</div>
									{/if}
								{:else}
									<span class="td-dim">—</span>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</section>
	</div>

	{#if renewCandidate}
		<div class="modal">
			<div class="modal-content">
				<h3>Confirm Renewal</h3>
				<p>
					Are you sure you want to add
					<strong>{renewCandidate.duration === 'year' ? '1 Year' : renewCandidate.duration === '6_months' ? '6 Months' : renewCandidate.duration === '3_months' ? '3 Months' : '1 Month'}</strong>
					to the expiration date for <strong>{renewCandidate.email}</strong>?
				</p>
				<form method="POST" action="?/renew" use:enhance={renewEnhance} class="modal-actions">
					<input type="hidden" name="auth_id" value={renewCandidate.auth_id} />
					<input type="hidden" name="duration" value={renewCandidate.duration} />
					<button
						type="button"
						class="btn btn--secondary"
						onclick={() => (renewCandidate = null)}
						disabled={renewPending}>Cancel</button
					>
					<button type="submit" class="btn btn--success" disabled={renewPending}>
						{renewPending ? 'Renewing...' : 'Confirm'}
					</button>
				</form>
			</div>
		</div>
	{/if}

	{#if removeCandidate}
		<div
			class="modal-backdrop"
			role="presentation"
			onclick={(event) => {
				if (event.currentTarget === event.target && !removePending) removeCandidate = null;
			}}
		>
			<div class="modal" role="dialog" aria-modal="true" aria-labelledby="remove-user-title">
				<p id="remove-user-title" class="modal-title">Remove user?</p>
				<p class="modal-copy">
					{removeCandidate.email} will be removed from your Elleven Streams account and reset to the
					free plan.
				</p>
				<form method="POST" action="?/remove" use:enhance={removeEnhance} class="modal-actions">
					<input type="hidden" name="auth_id" value={removeCandidate.auth_id} />
					<button
						type="button"
						class="btn btn--secondary"
						disabled={removePending}
						onclick={() => {
							removeCandidate = null;
						}}>Cancel</button
					>
					<button type="submit" class="btn btn--danger" disabled={removePending}
						>{removePending ? 'Removing...' : 'Remove user'}</button
					>
				</form>
			</div>
		</div>
	{/if}
</main>

<style>
	.admin {
		min-height: 100vh;
		padding-top: 2rem;
		position: relative;
		overflow: hidden;
	}

	.admin-plasma {
		position: fixed;
		inset: 0;
		z-index: 0;
		opacity: 0.25;
		pointer-events: none;
	}

	.admin-fade {
		position: fixed;
		inset: 0;
		background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.95) 100%);
		z-index: 0;
		pointer-events: none;
	}

	.admin-header {
		position: sticky;
		top: 2rem;
		margin: 0 auto 2.5rem;
		max-width: 72rem;
		width: calc(100% - 3rem);
		border-radius: 100px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		z-index: 50;
		padding: 0.75rem 1.5rem;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
	}

	.admin-header-inner {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.logout-form {
		margin-left: auto;
	}

	.admin-brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.admin-logo {
		height: 1.15rem;
		width: auto;
		object-fit: contain;
	}

	.admin-title {
		font-family: var(--font-sans);
		font-size: 0.85rem;
		font-weight: 600;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #fff;
		margin: 0;
	}

	.env-badge {
		border-radius: 999px;
		padding: 0.2rem 0.6rem;
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		border: 1px solid rgba(255, 255, 255, 0.14);
	}

	.env-badge--local {
		color: #93c5fd;
		background: rgba(96, 165, 250, 0.1);
		border-color: rgba(96, 165, 250, 0.22);
	}

	.env-badge--prod {
		color: #fca5a5;
		background: rgba(248, 113, 113, 0.1);
		border-color: rgba(248, 113, 113, 0.24);
	}

	.vendor-stats {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.stat-label {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: rgba(255, 255, 255, 0.35);
	}

	.stat-value {
		font-size: 0.8rem;
		font-weight: 600;
		color: #fff;
	}

	.stat-value--active {
		color: #4ade80;
	}
	.stat-value--pending {
		color: #facc15;
	}
	.stat-value--suspended {
		color: #f87171;
	}

	.stat-divider {
		color: rgba(255, 255, 255, 0.15);
		font-size: 0.75rem;
	}

	.badge {
		border-radius: 999px;
		padding: 0.2rem 0.6rem;
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.badge--warn {
		background: rgba(250, 204, 21, 0.12);
		color: #facc15;
		border: 1px solid rgba(250, 204, 21, 0.25);
	}

	.admin-body {
		max-width: 72rem;
		margin: 0 auto;
		padding: 2rem 1.5rem 5rem;
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		position: relative;
		z-index: 1;
	}

	.copy-toast {
		position: fixed;
		right: 1.25rem;
		bottom: 1.25rem;
		z-index: 50;
		border: 1px solid rgba(255, 255, 255, 0.14);
		background: rgba(0, 0, 0, 0.88);
		border-radius: 8px;
		color: #fff;
		font-size: 0.78rem;
		font-weight: 600;
		padding: 0.55rem 0.75rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
	}

	.alert {
		border-radius: 8px;
		padding: 0.85rem 1rem;
		font-size: 0.82rem;
	}

	.alert--error {
		background: rgba(248, 113, 113, 0.08);
		border: 1px solid rgba(248, 113, 113, 0.22);
		color: #fca5a5;
	}

	.alert--warn {
		background: rgba(250, 204, 21, 0.08);
		border: 1px solid rgba(250, 204, 21, 0.22);
		color: #fde68a;
	}

	.billing-panel {
		display: grid;
		grid-template-columns: 1.15fr 1fr 0.85fr;
		gap: 0.75rem;
	}

	.billing-metric {
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.02);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 0;
	}

	.billing-metric--primary {
		background: rgba(250, 204, 21, 0.03);
		border-color: rgba(250, 204, 21, 0.12);
	}

	.billing-label {
		color: rgba(255, 255, 255, 0.36);
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.billing-value {
		color: #fff;
		font-size: 1.05rem;
		font-weight: 700;
		line-height: 1.1;
	}

	.billing-detail {
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.76rem;
		line-height: 1.35;
	}

	/* Credentials banner */
	.creds-banner {
		background: rgba(74, 222, 128, 0.04);
		border: 1px solid rgba(74, 222, 128, 0.15);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-radius: 12px;
		padding: 1.25rem 1.5rem;
	}

	.creds-banner-inner {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.creds-title {
		font-size: 0.875rem;
		font-weight: 700;
		color: #4ade80;
		margin: 0 0 0.2rem;
	}

	.creds-sub {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.4);
		margin: 0 0 0.85rem;
	}

	.creds-warning {
		margin: 0.85rem 0 0;
		color: #facc15;
		font-size: 0.75rem;
	}

	.creds-fields {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.creds-field {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.creds-field-label {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgba(255, 255, 255, 0.35);
		min-width: 4.5rem;
	}

	.creds-field-value {
		font-family: monospace;
		font-size: 0.85rem;
		color: #fff;
		background: rgba(255, 255, 255, 0.07);
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		word-break: break-all;
		max-width: min(46rem, 100%);
	}

	.creds-dismiss {
		background: none;
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.5);
		border-radius: 6px;
		padding: 0.4rem 0.8rem;
		font-size: 0.75rem;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.creds-dismiss:hover {
		border-color: rgba(255, 255, 255, 0.3);
		color: #fff;
	}

	/* Sections */
	.section-title {
		font-family: var(--font-sans);
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: rgba(255, 255, 255, 0.35);
		margin: 0 0 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-count {
		background: rgba(255, 255, 255, 0.08);
		border-radius: 999px;
		padding: 0.1rem 0.45rem;
		font-size: 0.65rem;
		color: rgba(255, 255, 255, 0.4);
	}

	/* Provision form */
	.form-row {
		display: grid;
		grid-template-columns: minmax(16rem, 1.1fr) minmax(16rem, 1fr) max-content;
		gap: 0.75rem;
		align-items: end;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		min-width: 0;
	}

	.label {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: rgba(255, 255, 255, 0.4);
	}

	.label-optional {
		font-weight: 400;
		text-transform: none;
		letter-spacing: 0;
		font-size: 0.65rem;
		color: rgba(255, 255, 255, 0.25);
	}

	.input {
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		height: 2.875rem;
		padding: 0 0.9rem;
		color: #fff;
		font-size: 0.875rem;
		outline: none;
		transition: all 0.2s;
		width: 100%;
	}

	.input::placeholder {
		color: rgba(255, 255, 255, 0.2);
	}

	.input:focus {
		border-color: rgba(255, 255, 255, 0.25);
		background: rgba(255, 255, 255, 0.06);
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.04);
	}

	.input:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.btn {
		border-radius: 8px;
		padding: 0.55rem 1rem;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		cursor: pointer;
		border: none;
		transition: all 0.2s;
		white-space: nowrap;
		line-height: 1;
	}

	.btn:disabled,
	.btn-link:disabled,
	.icon-btn:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.btn--primary {
		background: #fff;
		color: #000;
	}

	.btn--primary:hover {
		background: rgba(255, 255, 255, 0.85);
		transform: translateY(-2px);
	}

	.btn--provision {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 2.875rem;
		min-width: 9.5rem;
		padding: 0 1.25rem;
	}

	.btn--secondary {
		background: rgba(255, 255, 255, 0.07);
		color: rgba(255, 255, 255, 0.72);
		border: 1px solid rgba(255, 255, 255, 0.12);
	}

	.btn--secondary:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
		transform: translateY(-2px);
	}

	.btn--danger {
		background: rgba(248, 113, 113, 0.1);
		color: #f87171;
		border: 1px solid rgba(248, 113, 113, 0.2);
	}

	.btn--danger:hover {
		background: rgba(248, 113, 113, 0.2);
		transform: translateY(-2px);
	}

	.btn--success {
		background: rgba(52, 211, 153, 0.1);
		color: #34d399;
		border: 1px solid rgba(52, 211, 153, 0.2);
	}

	.btn--success:hover {
		background: rgba(52, 211, 153, 0.2);
		transform: translateY(-2px);
	}

	.btn-link {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.35);
		font-size: 0.72rem;
		cursor: pointer;
		padding: 0;
		text-decoration: underline;
		text-underline-offset: 2px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.btn-link:hover {
		color: rgba(255, 255, 255, 0.7);
	}

	.icon-btn {
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 6px;
		color: rgba(255, 255, 255, 0.55);
		cursor: pointer;
		flex-shrink: 0;
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.07em;
		padding: 0.25rem 0.45rem;
		text-transform: uppercase;
	}

	.icon-btn:hover {
		border-color: rgba(255, 255, 255, 0.24);
		color: #fff;
	}

	.icon-btn-ghost {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		padding: 0.4rem;
		border-radius: 6px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.icon-btn-ghost:hover {
		color: #fff;
		background: rgba(255, 255, 255, 0.08);
	}

	.dropdown {
		position: relative;
		display: inline-block;
	}

	.dropdown-menu {
		position: absolute;
		right: 0;
		top: 100%;
		margin-top: 0.25rem;
		background: rgba(20, 20, 20, 0.95);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 0.35rem;
		z-index: 20;
		min-width: 130px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
	}

	.dropdown-item {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 500;
		white-space: nowrap;
		color: #fca5a5;
		background: none;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.dropdown-item--success { color: #34d399; }
	.dropdown-item--success:hover { background: rgba(52, 211, 153, 0.1); color: #10b981; }
	.dropdown-item--danger { color: #fca5a5; }
	.dropdown-item--danger:hover { background: rgba(248, 113, 113, 0.1); color: #f87171; }

	.badge {
		display: inline-block;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.badge--success { background: rgba(52, 211, 153, 0.15); color: #34d399; }
	.badge--danger { background: rgba(248, 113, 113, 0.15); color: #f87171; }

	.form-error {
		margin: 0.6rem 0 0;
		font-size: 0.8rem;
		color: #f87171;
	}

	.empty {
		color: rgba(255, 255, 255, 0.25);
		font-size: 0.875rem;
	}

	/* Table */
	.table-wrap {
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.02);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
	}

	.user-cards {
		display: none;
	}

	.table {
		width: 100%;
		table-layout: fixed;
		border-collapse: collapse;
		font-size: 0.8rem;
	}

	.col-email { width: auto; }
	.col-note { width: 15%; }
	.col-status { width: 12%; }
	.col-paid { width: 15%; }
	.col-token { width: 25%; }
	.col-action { width: 60px; }

	.table th {
		text-align: left;
		padding: 0.6rem 0.75rem;
		font-size: 0.55rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: rgba(255, 255, 255, 0.3);
		border-bottom: 1px solid rgba(255, 255, 255, 0.07);
	}

	.table td {
		padding: 0.75rem 0.75rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
		vertical-align: middle;
	}

	.table tr:last-child td {
		border-bottom: none;
	}

	.table tr:hover td {
		background: rgba(255, 255, 255, 0.015);
	}

	.td-email {
		font-weight: 500;
		color: #fff;
	}

	.td-muted {
		color: rgba(255, 255, 255, 0.35);
		font-size: 0.8rem;
	}

	.td-nowrap {
		white-space: nowrap;
	}

	.td-dim {
		color: rgba(255, 255, 255, 0.15);
	}

	.td-token {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.td-token .btn-link {
		margin-left: 0.5rem;
	}

	.td-token .btn-link + .btn-link {
		margin-left: 0.35rem;
	}

	.token {
		font-family: monospace;
		font-size: 0.72rem;
		color: rgba(255, 255, 255, 0.6);
		word-break: break-all;
	}

	.token--card {
		display: block;
		margin-top: 0.25rem;
		white-space: normal;
	}

	.td-action {
		text-align: right;
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: rgba(0, 0, 0, 0.72);
		backdrop-filter: blur(10px);
	}

	.modal {
		width: min(100%, 28rem);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		background: rgba(20, 20, 20, 0.85);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
		padding: 1.5rem;
	}

	.modal-title {
		color: #fff;
		font-size: 0.95rem;
		font-weight: 700;
		margin: 0 0 0.35rem;
	}

	.modal-copy {
		color: rgba(255, 255, 255, 0.52);
		font-size: 0.84rem;
		line-height: 1.55;
		margin: 0;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.25rem;
	}

	@media (max-width: 820px) {
		.billing-panel {
			grid-template-columns: 1fr;
		}

		.form-row {
			grid-template-columns: 1fr 1fr;
		}

		.btn--provision {
			grid-column: 1 / -1;
			width: 100%;
		}
	}

	@media (max-width: 640px) {
		.admin {
			padding-top: 1rem;
		}

		.admin-header {
			border-radius: 16px;
			padding: 1rem;
			top: 1rem;
			width: calc(100% - 2rem);
			margin-bottom: 1.5rem;
		}

		.admin-header-inner {
			gap: 1rem;
		}

		.vendor-stats {
			width: 100%;
		}

		.logout-form {
			margin-left: 0;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.field {
			width: 100%;
		}

		.btn {
			width: 100%;
			padding: 0.85rem 1rem;
		}

		.creds-banner-inner {
			flex-direction: column;
		}

		.creds-field {
			align-items: flex-start;
			flex-wrap: wrap;
		}

		.creds-field-label {
			width: 100%;
		}

		.creds-dismiss {
			width: 100%;
		}

		.table-wrap {
			display: none;
		}

		.user-cards {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
		}

		.user-card {
			border: 1px solid rgba(255, 255, 255, 0.08);
			border-radius: 12px;
			background: rgba(255, 255, 255, 0.02);
			backdrop-filter: blur(16px);
			-webkit-backdrop-filter: blur(16px);
			padding: 1.25rem;
		}

		.user-card-header {
			display: flex;
			justify-content: space-between;
			gap: 1rem;
			align-items: flex-start;
		}

		.user-card-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 0.85rem;
			margin-top: 1rem;
		}

		.user-card-token {
			border-top: 1px solid rgba(255, 255, 255, 0.07);
			margin-top: 1rem;
			padding-top: 0.85rem;
		}

		.user-card-label {
			display: block;
			color: rgba(255, 255, 255, 0.35);
			font-size: 0.6rem;
			font-weight: 700;
			letter-spacing: 0.1em;
			text-transform: uppercase;
		}

		.user-card-email,
		.user-card-text {
			margin: 0.2rem 0 0;
			line-height: 1.45;
		}

		.user-card-email {
			color: #fff;
			font-size: 0.88rem;
			font-weight: 600;
			word-break: break-word;
		}

		.user-card-text {
			color: rgba(255, 255, 255, 0.55);
			font-size: 0.82rem;
		}

		.user-card-actions {
			display: flex;
			gap: 0.85rem;
			margin-top: 0.4rem;
		}

		.btn--small {
			width: auto;
			padding: 0.55rem 0.75rem;
		}

		.copy-toast {
			left: 1rem;
			right: 1rem;
			bottom: 1rem;
			text-align: center;
		}

		.modal-actions {
			flex-direction: column-reverse;
		}
	}
</style>
