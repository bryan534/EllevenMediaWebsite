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
	let provisionName = $state('');
	let provisionContact = $state('');
	let provisionAmount = $state('');
	let provisionDuration = $state('year');
	let revealedTokens = $state(new Set<string>());
	let lastPassword = $state<string | null>(null);
	let lastEmail = $state<string | null>(null);
	let lastApiToken = $state<string | null>(null);
	let lastWarning = $state<string | null>(null);
	let copyStatus = $state<string | null>(null);
	let provisionPending = $state(false);
	let provisionModalOpen = $state(false);
	let removePending = $state(false);
	let renewPending = $state(false);
	let logoutPending = $state(false);
	let removeCandidate = $state<{ auth_id: string; email: string } | null>(null);
	let renewCandidate = $state<{ auth_id: string; email: string; duration: string | null } | null>(null);
	let activeDropdown = $state<string | null>(null);
	let detailsCandidate = $state<{ auth_id: string; email: string } | null>(null);
	let detailsData = $state<Record<string, unknown> | null>(null);
	let detailsLoading = $state(false);
	let detailsError = $state<string | null>(null);
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
			provisionName = '';
			provisionContact = '';
			provisionAmount = '';
			provisionDuration = 'year';
			provisionModalOpen = false;
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

	async function openDetails(auth_id: string, email: string) {
		detailsCandidate = { auth_id, email };
		detailsData = null;
		detailsError = null;
		detailsLoading = true;
		try {
			const res = await fetch(`/admin/api/user-details?auth_id=${encodeURIComponent(auth_id)}`);
			const json = await res.json();
			if (json.success && json.data) {
				detailsData = json.data as Record<string, unknown>;
			} else {
				detailsError = json.detail ?? json.error ?? 'Failed to load details.';
			}
		} catch {
			detailsError = 'Network error loading details.';
		} finally {
			detailsLoading = false;
		}
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
		<div class="admin-header-top">
			<div class="admin-header-left">
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
			</div>
			<form method="POST" action="?/logout" use:enhance={logoutEnhance}>
				<button type="submit" class="btn-logout" disabled={logoutPending}
					>{logoutPending ? 'Logging out...' : 'Log out'}</button
				>
			</form>
		</div>
		{#if data.vendor}
			<div class="admin-header-bottom">
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
					<span class="billing-label">Profit</span>
					<span class="billing-value">{moneyFormatter.format(data.totalRevenue - billingSummary.estimate)}</span>
					<span class="billing-detail">Monthly Revenue: {moneyFormatter.format(data.totalRevenue)}</span>
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

		<!-- Users table -->
		<section class="section">
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
				<h2 class="section-title" style="margin-bottom: 0;">
					Users <span class="section-count">{data.users.length}</span>
				</h2>
				<button class="btn btn--primary btn--sm" onclick={() => provisionModalOpen = true}>Add User</button>
			</div>

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
													<button class="dropdown-item dropdown-item--info" onclick={() => { openDetails(user.auth_id, user.email); activeDropdown = null; }}>
														View Details
													</button>
													<button class="dropdown-item dropdown-item--success" onclick={() => { renewCandidate = { auth_id: user.auth_id, email: user.email, duration: null }; activeDropdown = null; }}>
														Renew
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
											<button class="dropdown-item dropdown-item--info" onclick={() => { openDetails(user.auth_id, user.email); activeDropdown = null; }}>
												View Details
											</button>
											<button class="dropdown-item dropdown-item--success" onclick={() => { renewCandidate = { auth_id: user.auth_id, email: user.email, duration: null }; activeDropdown = null; }}>
												Renew
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

	{#if provisionModalOpen}
		<div
			class="modal-backdrop"
			role="presentation"
			onclick={(e) => { if (e.currentTarget === e.target && !provisionPending) provisionModalOpen = false; }}
		>
			<div class="modal" role="dialog" aria-modal="true" aria-labelledby="provision-title">
				<div class="modal-details-header" style="margin-bottom: 1.5rem;">
					<div>
						<p id="provision-title" class="modal-title">Provision New User</p>
					</div>
					<button class="details-close-btn" onclick={() => provisionModalOpen = false} aria-label="Close" disabled={provisionPending}>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
					</button>
				</div>
				<form
					method="POST"
					action="?/provision"
					use:enhance={provisionEnhance}
					class="provision-form"
					aria-busy={provisionPending}
				>
					<div class="form-grid">
						<div class="field">
							<label for="email" class="label">Email</label>
							<input id="email" name="email" type="email" required placeholder="customer@example.com" bind:value={provisionEmail} class="input" disabled={provisionPending} />
						</div>
						<div class="field">
							<label for="name" class="label">Name <span class="label-optional">(optional)</span></label>
							<input id="name" name="name" type="text" placeholder="John Doe" bind:value={provisionName} class="input" disabled={provisionPending} />
						</div>
						<div class="field">
							<label for="contact_info" class="label">Contact Info <span class="label-optional">(optional)</span></label>
							<input id="contact_info" name="contact_info" type="text" placeholder="Phone, TG, etc." bind:value={provisionContact} class="input" disabled={provisionPending} />
						</div>
						<div class="field">
							<label for="amount_paid" class="label">Amount Paid <span class="label-optional">(optional)</span></label>
							<input id="amount_paid" name="amount_paid" type="number" step="0.01" placeholder="0.00" bind:value={provisionAmount} class="input" disabled={provisionPending} />
						</div>
						<div class="field">
							<label for="duration" class="label">Initial Duration</label>
							<select id="duration" name="duration" bind:value={provisionDuration} class="input select" disabled={provisionPending}>
								<option value="month">1 Month</option>
								<option value="3_months">3 Months</option>
								<option value="6_months">6 Months</option>
								<option value="year">1 Year</option>
							</select>
						</div>
						<div class="field field--full">
							<label for="note" class="label">Note <span class="label-optional">(optional)</span></label>
							<input id="note" name="note" type="text" placeholder="e.g. Paid June 2026" bind:value={provisionNote} class="input" disabled={provisionPending} />
						</div>
					</div>
					
					{#if form?.action === 'provision' && 'error' in form}
						<p class="form-error" style="margin-bottom: 1rem;">{form.error}</p>
					{/if}

					<div class="modal-actions" style="margin-top: 1.5rem;">
						<button type="button" class="btn btn--secondary" onclick={() => provisionModalOpen = false} disabled={provisionPending}>Cancel</button>
						<button type="submit" class="btn btn--primary btn--provision" disabled={provisionPending}>{provisionPending ? 'Provisioning...' : 'Provision User'}</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	{#if renewCandidate}
		<div
			class="modal-backdrop"
			role="presentation"
			onclick={(e) => { if (e.currentTarget === e.target && !renewPending) renewCandidate = null; }}
		>
			<div class="modal" role="dialog" aria-modal="true" aria-labelledby="renew-title">
				<p id="renew-title" class="modal-title">Renew subscription</p>
				<p class="modal-copy">{renewCandidate.email}</p>

				<div class="renew-duration-grid">
					{#each [{ value: 'month', label: '1 Month' }, { value: '3_months', label: '3 Months' }, { value: '6_months', label: '6 Months' }, { value: 'year', label: '1 Year' }] as opt}
						<button
							type="button"
							class="renew-duration-btn"
							class:renew-duration-btn--selected={renewCandidate.duration === opt.value}
							onclick={() => { if (renewCandidate) renewCandidate = { ...renewCandidate, duration: opt.value }; }}
							disabled={renewPending}
						>{opt.label}</button>
					{/each}
				</div>

				<form method="POST" action="?/renew" use:enhance={renewEnhance} class="modal-actions">
					<input type="hidden" name="auth_id" value={renewCandidate.auth_id} />
					<input type="hidden" name="duration" value={renewCandidate.duration ?? ''} />
					<button
						type="button"
						class="btn btn--secondary"
						onclick={() => (renewCandidate = null)}
						disabled={renewPending}>Cancel</button
					>
					<button type="submit" class="btn btn--success" disabled={renewPending || !renewCandidate.duration}>
						{renewPending ? 'Renewing...' : 'Confirm'}
					</button>
				</form>
			</div>
		</div>
	{/if}

	{#if detailsCandidate}
		<div
			class="modal-backdrop"
			role="presentation"
			onclick={(e) => { if (e.currentTarget === e.target) detailsCandidate = null; }}
		>
			<div class="modal modal--details" role="dialog" aria-modal="true" aria-labelledby="details-title">
				<div class="modal-details-header">
					<div>
						<p id="details-title" class="modal-title">TorBox Account Details</p>
						<p class="modal-copy">{detailsCandidate.email}</p>
					</div>
					<button class="details-close-btn" onclick={() => detailsCandidate = null} aria-label="Close">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
					</button>
				</div>

				{#if detailsLoading}
					<p class="details-loading">Loading…</p>
				{:else if detailsError}
					<p class="details-error">{detailsError}</p>
				{:else if detailsData}
					<div class="details-grid">
						{#each Object.entries(detailsData) as [key, val]}
							<div class="details-row">
								<span class="details-key">{key}</span>
								<span class="details-val">{val === null ? '—' : String(val)}</span>
							</div>
						{/each}
					</div>
				{/if}
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
		position: relative;
		margin: 0 auto 2.5rem;
		max-width: 72rem;
		width: 100%;
		padding: 0 1.5rem;
		z-index: 50;
	}

	.admin-header-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.admin-header-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.btn-logout {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 500;
		transition: color 0.2s;
		padding: 0;
	}
	.btn-logout:hover {
		color: #fff;
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

	.admin-header-bottom {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
		padding-top: 1.25rem;
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

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 0.75rem;
		align-items: start;
		margin-bottom: 1rem;
	}

	.field--full {
		grid-column: 1 / -1;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
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
	.dropdown-item--info { color: #93c5fd; }
	.dropdown-item--info:hover { background: rgba(147, 197, 253, 0.1); color: #60a5fa; }

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
		z-index: 60;
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

	.renew-duration-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		margin: 1.1rem 0 0;
	}

	.renew-duration-btn {
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.78rem;
		font-weight: 600;
		padding: 0.65rem 0.75rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.renew-duration-btn:hover:not(:disabled) {
		background: rgba(52, 211, 153, 0.08);
		border-color: rgba(52, 211, 153, 0.3);
		color: #34d399;
	}

	.renew-duration-btn--selected {
		background: rgba(52, 211, 153, 0.12);
		border-color: rgba(52, 211, 153, 0.45);
		color: #34d399;
	}

	.renew-duration-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.modal--details {
		width: min(100%, 40rem);
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.modal-details-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.25rem;
		flex-shrink: 0;
	}

	.details-close-btn {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 6px;
		color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		transition: all 0.15s;
	}

	.details-close-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.25);
		color: #fff;
	}

	.details-loading {
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.84rem;
		text-align: center;
		padding: 1.5rem 0;
	}

	.details-error {
		color: #f87171;
		font-size: 0.84rem;
		padding: 0.5rem 0;
	}

	.details-grid {
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-height: 0;
	}

	.details-row {
		display: grid;
		grid-template-columns: 11rem 1fr;
		gap: 0.5rem;
		padding: 0.45rem 0.6rem;
		border-radius: 6px;
		align-items: baseline;
		min-width: 0;
	}

	.details-row:nth-child(odd) {
		background: rgba(255, 255, 255, 0.025);
	}

	.details-key {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgba(255, 255, 255, 0.35);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.details-val {
		font-size: 0.8rem;
		color: #fff;
		word-break: break-all;
		font-family: monospace;
		min-width: 0;
	}

	@media (max-width: 480px) {
		.modal--details {
			max-height: 90vh;
		}

		.details-row {
			grid-template-columns: 1fr;
			gap: 0.15rem;
			padding: 0.5rem 0.6rem;
		}

		.details-key {
			white-space: normal;
		}
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
			padding: 0 1rem;
			margin-bottom: 1.5rem;
		}

		.admin-header-top {
			padding-bottom: 1rem;
		}

		.admin-header-bottom {
			padding-top: 1rem;
			gap: 1rem;
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
