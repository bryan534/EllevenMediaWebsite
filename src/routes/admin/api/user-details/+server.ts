import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getAccount } from '$lib/torbox';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, platform }) => {
	const authId = url.searchParams.get('auth_id') ?? '';
	const apiKey = env.TORBOX_API_KEY ?? '';
	const db = platform?.env.DB;

	if (!authId) {
		return json({ success: false, error: 'Missing auth_id' }, { status: 400 });
	}
	if (!apiKey) {
		return json({ success: false, error: 'TORBOX_API_KEY is not configured' }, { status: 500 });
	}

	const res = await getAccount(apiKey, authId);

	if (res.success && res.data && db) {
		try {
			const localUser = await db.prepare('SELECT name, contact_info, amount_paid FROM torbox_users WHERE auth_id = ?').bind(authId).first<{ name: string | null, contact_info: string | null, amount_paid: number | null }>();
			if (localUser) {
				const data = res.data as Record<string, any>;
				data.name = localUser.name;
				data.contact_info = localUser.contact_info;
				if (localUser.amount_paid !== null) {
					data.amount_paid = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(localUser.amount_paid);
				} else {
					data.amount_paid = null;
				}
			}
		} catch (e) {
			console.error("Failed to fetch local DB details", e);
		}
	}

	return json(res);
};
