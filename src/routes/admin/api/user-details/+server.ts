import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getAccount } from '$lib/torbox';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const authId = url.searchParams.get('auth_id') ?? '';
	const apiKey = env.TORBOX_API_KEY ?? '';

	if (!authId) {
		return json({ success: false, error: 'Missing auth_id' }, { status: 400 });
	}
	if (!apiKey) {
		return json({ success: false, error: 'TORBOX_API_KEY is not configured' }, { status: 500 });
	}

	const res = await getAccount(apiKey, authId);
	return json(res);
};
