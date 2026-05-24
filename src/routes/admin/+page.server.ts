import { fail } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { SESSION_COOKIE } from '$lib/session';
import { getVendorAccount, registerUser, getAccount, removeUser } from '$lib/torbox';
import type { Actions, PageServerLoad } from './$types';

const UNCONFIRMED_API_TOKEN = 'USER HAS NOT CONFIRMED EMAIL';
const MAX_EMAIL_LENGTH = 254;
const MAX_AUTH_ID_LENGTH = 128;
const MAX_NAME_LENGTH = 100;
const MAX_CONTACT_INFO_LENGTH = 200;
const MAX_NOTE_LENGTH = 500;
const MAX_AMOUNT_PAID = 1_000_000;
const durations = new Set(['month', '3_months', '6_months', 'year'] as const);
const DB_UNAVAILABLE =
	'D1 database binding DB is not available. Run `npm run dev` for local D1 or `npm run dev:prod-db` for production D1.';
const API_KEY_UNAVAILABLE = 'TORBOX_API_KEY is not configured.';

type Duration = typeof durations extends Set<infer T> ? T : never;

type DbUser = {
	id: number;
	email: string;
	auth_id: string;
	api_token: string;
	paid_until: string | null;
	payment_status: string;
	note: string;
	name: string | null;
	contact_info: string | null;
	amount_paid: number | null;
	added_at: string;
};

function getDb(platform: App.Platform | undefined) {
	return platform?.env.DB ?? null;
}

function getApiKey() {
	return env.TORBOX_API_KEY ?? '';
}

function isValidEmail(email: string) {
	return email.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidAuthId(authId: string) {
	return authId.length > 0 && authId.length <= MAX_AUTH_ID_LENGTH;
}

function isValidDuration(duration: string): duration is Duration {
	return durations.has(duration as Duration);
}

function parseAmountPaid(amountPaidRaw: string | undefined) {
	if (!amountPaidRaw) return { amountPaid: null, error: null };

	const amountPaid = Number(amountPaidRaw);
	if (!Number.isFinite(amountPaid) || amountPaid < 0 || amountPaid > MAX_AMOUNT_PAID) {
		return {
			amountPaid: null,
			error: `Amount paid must be between 0 and ${MAX_AMOUNT_PAID}.`
		};
	}

	return {
		amountPaid: Math.round(amountPaid * 100) / 100,
		error: null
	};
}

function getPaidUntilIso(duration: Duration, from = new Date()) {
	const paidUntilDate = new Date(from);

	if (duration === 'month') {
		paidUntilDate.setMonth(paidUntilDate.getMonth() + 1);
	} else if (duration === '3_months') {
		paidUntilDate.setMonth(paidUntilDate.getMonth() + 3);
	} else if (duration === '6_months') {
		paidUntilDate.setMonth(paidUntilDate.getMonth() + 6);
	} else {
		paidUntilDate.setFullYear(paidUntilDate.getFullYear() + 1);
	}

	return paidUntilDate.toISOString();
}

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	const apiKey = getApiKey();
	const configErrors: string[] = [];
	const databaseMode = dev ? (env.CF_REMOTE_D1 === '1' ? 'Production D1' : 'Local D1') : 'Production D1';

	let users: DbUser[] = [];
	let vendor = null;
	let vendorError: string | null = null;

	let totalRevenue = 0;

	if (!db) {
		configErrors.push(DB_UNAVAILABLE);
	} else {
		try {
			const dbResult = await db.prepare('SELECT * FROM torbox_users ORDER BY added_at DESC').all<DbUser>();
			users = dbResult.results;
			
			const now = new Date();
			for (const u of users) {
				if (u.amount_paid && u.paid_until && new Date(u.paid_until) > now) {
					totalRevenue += Number(u.amount_paid);
				}
			}
		} catch {
			configErrors.push('Could not read torbox_users from D1. Run the local and remote migrations in docs/torbox-admin.md.');
		}
	}

	if (!apiKey) {
		vendorError = API_KEY_UNAVAILABLE;
	} else {
		const vendorRes = await getVendorAccount(apiKey);
		vendor = vendorRes.success ? vendorRes.data : null;
		vendorError = vendorRes.success ? null : vendorRes.detail;
	}

	return {
		users,
		vendor,
		vendorError,
		configErrors,
		databaseMode,
		usingProductionDb: databaseMode === 'Production D1',
		totalRevenue
	};
};

export const actions = {
	logout: async ({ cookies }) => {
		cookies.delete(SESSION_COOKIE, { path: '/admin' });
		return { action: 'logout' as const, success: true };
	},

	provision: async ({ request, platform }) => {
		const db = getDb(platform);
		const apiKey = getApiKey();
		const data = await request.formData();
		const email = data.get('email')?.toString()?.trim().toLowerCase() ?? '';
		const note = data.get('note')?.toString()?.trim() ?? '';
		const name = data.get('name')?.toString()?.trim() || null;
		const contact_info = data.get('contact_info')?.toString()?.trim() || null;
		const amountPaidStr = data.get('amount_paid')?.toString()?.trim();
		const { amountPaid, error: amountPaidError } = parseAmountPaid(amountPaidStr);
		const duration = data.get('duration')?.toString() ?? 'year';

		if (!db) return fail(500, { action: 'provision' as const, error: DB_UNAVAILABLE });
		if (!apiKey) return fail(500, { action: 'provision' as const, error: API_KEY_UNAVAILABLE });
		if (!email) return fail(400, { action: 'provision' as const, error: 'Email is required.' });
		if (!isValidEmail(email)) {
			return fail(400, { action: 'provision' as const, error: 'Enter a valid email address.' });
		}
		if (name && name.length > MAX_NAME_LENGTH) {
			return fail(400, {
				action: 'provision' as const,
				error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.`
			});
		}
		if (contact_info && contact_info.length > MAX_CONTACT_INFO_LENGTH) {
			return fail(400, {
				action: 'provision' as const,
				error: `Contact info must be ${MAX_CONTACT_INFO_LENGTH} characters or fewer.`
			});
		}
		if (note.length > MAX_NOTE_LENGTH) {
			return fail(400, {
				action: 'provision' as const,
				error: `Note must be ${MAX_NOTE_LENGTH} characters or fewer.`
			});
		}
		if (amountPaidError) {
			return fail(400, { action: 'provision' as const, error: amountPaidError });
		}
		if (!isValidDuration(duration)) {
			return fail(400, { action: 'provision' as const, error: 'Select a valid duration.' });
		}

		const existing = await db
			.prepare('SELECT auth_id FROM torbox_users WHERE email = ? LIMIT 1')
			.bind(email)
			.first<{ auth_id: string }>();

		if (existing) {
			return fail(409, {
				action: 'provision' as const,
				error: 'This email is already in the local admin database.'
			});
		}

		const vendorRes = await getVendorAccount(apiKey);
		if (!vendorRes.success || !vendorRes.data) {
			return fail(400, {
				action: 'provision' as const,
				error: vendorRes.detail || 'Could not verify TorBox vendor status.'
			});
		}

		if (!vendorRes.data.can_register_new) {
			return fail(400, {
				action: 'provision' as const,
				error: 'TorBox is not currently allowing new user registration for this vendor account.'
			});
		}

		const reg = await registerUser(apiKey, email);
		if (!reg.success || !reg.data) {
			return fail(400, {
				action: 'provision' as const,
				error: reg.detail ?? 'Registration failed.'
			});
		}

		const { auth_id, password } = reg.data;
		const registeredEmail = reg.data.email.toLowerCase();
		let warning: string | undefined;
		let apiToken = '';

		// Token is immediately available for vendor-created accounts
		const acctRes = await getAccount(apiKey, auth_id);
		if (acctRes.success && acctRes.data?.api_token && acctRes.data.api_token !== UNCONFIRMED_API_TOKEN) {
			apiToken = acctRes.data.api_token;
		} else if (acctRes.success && acctRes.data?.api_token === UNCONFIRMED_API_TOKEN) {
			warning = 'User was created, but their API token is pending email confirmation.';
		} else {
			warning = `User was created, but the API token could not be fetched: ${acctRes.detail}`;
		}

		const paidUntil = getPaidUntilIso(duration);

		await db
			.prepare('INSERT INTO torbox_users (email, auth_id, api_token, paid_until, payment_status, note, name, contact_info, amount_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
			.bind(registeredEmail, auth_id, apiToken, paidUntil, 'active', note, name, contact_info, amountPaid)
			.run();

		return {
			action: 'provision' as const,
			success: true,
			password,
			email: registeredEmail,
			apiToken,
			warning
		};
	},

	remove: async ({ request, platform }) => {
		const db = getDb(platform);
		const apiKey = getApiKey();
		const data = await request.formData();
		const authId = data.get('auth_id')?.toString().trim() ?? '';

		if (!db) return fail(500, { action: 'remove' as const, error: DB_UNAVAILABLE });
		if (!apiKey) return fail(500, { action: 'remove' as const, error: API_KEY_UNAVAILABLE });
		if (!isValidAuthId(authId)) {
			return fail(400, { action: 'remove' as const, error: 'Invalid user ID.' });
		}

		const res = await removeUser(apiKey, authId);
		if (!res.success) {
			return fail(400, { action: 'remove' as const, error: res.detail ?? 'Removal failed.' });
		}

		await db.prepare('DELETE FROM torbox_users WHERE auth_id = ?').bind(authId).run();

		return { action: 'remove' as const, success: true };
	},

	renew: async ({ request, platform }) => {
		const db = getDb(platform);
		if (!db) return fail(500, { action: 'renew' as const, error: DB_UNAVAILABLE });
		const data = await request.formData();
		const authId = data.get('auth_id')?.toString().trim() ?? '';
		const duration = data.get('duration')?.toString() ?? 'year';
		
		if (!isValidAuthId(authId)) {
			return fail(400, { action: 'renew' as const, error: 'Invalid user ID.' });
		}
		if (!isValidDuration(duration)) {
			return fail(400, { action: 'renew' as const, error: 'Select a valid duration.' });
		}

		const user = await db.prepare('SELECT paid_until FROM torbox_users WHERE auth_id = ?').bind(authId).first<{ paid_until: string | null }>();
		if (!user) return fail(404, { action: 'renew' as const, error: 'User not found in local db.' });

		const currentPaidUntil = user.paid_until ? new Date(user.paid_until) : new Date();
		const now = new Date();
		const baseDate = currentPaidUntil < now ? now : currentPaidUntil;

		await db
			.prepare("UPDATE torbox_users SET paid_until = ?, payment_status = 'active' WHERE auth_id = ?")
			.bind(getPaidUntilIso(duration, baseDate), authId)
			.run();

		return { action: 'renew' as const, success: true };
	}
} satisfies Actions;
