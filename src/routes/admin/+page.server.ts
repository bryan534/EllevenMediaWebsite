import { fail } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { SESSION_COOKIE } from '$lib/session';
import { getVendorAccount, registerUser, getAccount, removeUser } from '$lib/torbox';
import type { Actions, PageServerLoad } from './$types';

const UNCONFIRMED_API_TOKEN = 'USER HAS NOT CONFIRMED EMAIL';
const MAX_NOTE_LENGTH = 500;
const DB_UNAVAILABLE =
	'D1 database binding DB is not available. Run `npm run dev` for local D1 or `npm run dev:prod-db` for production D1.';
const API_KEY_UNAVAILABLE = 'TORBOX_API_KEY is not configured.';

type DbUser = {
	id: number;
	email: string;
	auth_id: string;
	api_token: string;
	paid_until: string | null;
	payment_status: string;
	note: string;
	added_at: string;
};

function getDb(platform: App.Platform | undefined) {
	return platform?.env.DB ?? null;
}

function getApiKey() {
	return env.TORBOX_API_KEY ?? '';
}

function isValidEmail(email: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	const apiKey = getApiKey();
	const configErrors: string[] = [];
	const databaseMode = dev ? (env.CF_REMOTE_D1 === '1' ? 'Production D1' : 'Local D1') : 'Production D1';

	let users: DbUser[] = [];
	let vendor = null;
	let vendorError: string | null = null;

	if (!db) {
		configErrors.push(DB_UNAVAILABLE);
	} else {
		try {
			const dbResult = await db.prepare('SELECT * FROM torbox_users ORDER BY added_at DESC').all<DbUser>();
			users = dbResult.results;
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
		usingProductionDb: databaseMode === 'Production D1'
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

		if (!db) return fail(500, { action: 'provision' as const, error: DB_UNAVAILABLE });
		if (!apiKey) return fail(500, { action: 'provision' as const, error: API_KEY_UNAVAILABLE });
		if (!email) return fail(400, { action: 'provision' as const, error: 'Email is required.' });
		if (!isValidEmail(email)) {
			return fail(400, { action: 'provision' as const, error: 'Enter a valid email address.' });
		}
		if (note.length > MAX_NOTE_LENGTH) {
			return fail(400, {
				action: 'provision' as const,
				error: `Note must be ${MAX_NOTE_LENGTH} characters or fewer.`
			});
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

		// Calculate paid_until (1 year from now)
		const oneYearFromNow = new Date();
		oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
		const paidUntil = oneYearFromNow.toISOString();

		await db
			.prepare('INSERT INTO torbox_users (email, auth_id, api_token, paid_until, payment_status, note) VALUES (?, ?, ?, ?, ?, ?)')
			.bind(registeredEmail, auth_id, apiToken, paidUntil, 'active', note)
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
		const authId = data.get('auth_id')?.toString() ?? '';

		if (!db) return fail(500, { action: 'remove' as const, error: DB_UNAVAILABLE });
		if (!apiKey) return fail(500, { action: 'remove' as const, error: API_KEY_UNAVAILABLE });
		if (!authId) return fail(400, { action: 'remove' as const, error: 'Missing user ID.' });

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
		const authId = data.get('auth_id')?.toString() ?? '';
		const duration = data.get('duration')?.toString() ?? 'year';
		
		if (!authId) return fail(400, { action: 'renew' as const, error: 'Missing user ID.' });

		const user = await db.prepare('SELECT paid_until FROM torbox_users WHERE auth_id = ?').bind(authId).first<{ paid_until: string | null }>();
		if (!user) return fail(404, { action: 'renew' as const, error: 'User not found in local db.' });

		const currentPaidUntil = user.paid_until ? new Date(user.paid_until) : new Date();
		const now = new Date();
		const baseDate = currentPaidUntil < now ? now : currentPaidUntil;
		
		if (duration === 'month') {
			baseDate.setMonth(baseDate.getMonth() + 1);
		} else if (duration === '3_months') {
			baseDate.setMonth(baseDate.getMonth() + 3);
		} else if (duration === '6_months') {
			baseDate.setMonth(baseDate.getMonth() + 6);
		} else {
			baseDate.setFullYear(baseDate.getFullYear() + 1);
		}

		await db.prepare("UPDATE torbox_users SET paid_until = ?, payment_status = 'active' WHERE auth_id = ?").bind(baseDate.toISOString(), authId).run();

		return { action: 'renew' as const, success: true };
	}
} satisfies Actions;
