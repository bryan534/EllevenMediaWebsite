import { error, redirect } from '@sveltejs/kit';
import { verifySession } from '$lib/session';
import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	if (url.pathname.startsWith('/admin/login')) return {};

	if (!env.ADMIN_SESSION_SECRET) {
		error(500, 'ADMIN_SESSION_SECRET is not configured.');
	}

	const ok = await verifySession(cookies, env.ADMIN_SESSION_SECRET);
	if (!ok) redirect(303, '/admin/login');
	return {};
};
