import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getAccount } from '$lib/torbox';
import type { RequestHandler } from './$types';

const MAX_AUTH_ID_LENGTH = 128;

type LocalUser = {
	name: string | null;
	contact_info: string | null;
	amount_paid: number | null;
};

export const GET: RequestHandler = async ({ url, platform }) => {
	const authId = url.searchParams.get('auth_id')?.trim() ?? '';
	const apiKey = env.TORBOX_API_KEY ?? '';
	const db = platform?.env.DB;

	if (!authId) {
		return json({ success: false, error: 'Missing auth_id' }, { status: 400 });
	}
	if (authId.length > MAX_AUTH_ID_LENGTH) {
		return json({ success: false, error: 'Invalid auth_id' }, { status: 400 });
	}
	if (!apiKey) {
		return json({ success: false, error: 'TORBOX_API_KEY is not configured' }, { status: 500 });
	}
	if (!db) {
		return json({ success: false, error: 'D1 database binding DB is not available' }, { status: 500 });
	}

	let localUser: LocalUser | null = null;
	try {
		localUser = await db
			.prepare(
				'SELECT name, contact_info, amount_paid FROM torbox_users WHERE auth_id = ? LIMIT 1'
			)
			.bind(authId)
			.first<LocalUser>();
	} catch (e) {
		console.error('Failed to fetch local DB details', e);
		return json({ success: false, error: 'Could not read local user details' }, { status: 500 });
	}

	if (!localUser) {
		return json({ success: false, error: 'User not found' }, { status: 404 });
	}

	const res = await getAccount(apiKey, authId);

	if (res.success && res.data) {
		const data = res.data as Record<string, unknown>;
		data.name = localUser.name;
		data.contact_info = localUser.contact_info;
		if (localUser.amount_paid !== null) {
			data.amount_paid = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD'
			}).format(localUser.amount_paid);
		} else {
			data.amount_paid = null;
		}
	}

	return json(res);
};
