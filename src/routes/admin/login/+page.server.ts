import { error, fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { constantTimeEqual, createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS, verifySession } from '$lib/session';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	if (env.ADMIN_SESSION_SECRET && (await verifySession(cookies, env.ADMIN_SESSION_SECRET))) {
		redirect(303, '/admin');
	}

	return {
		turnstileSiteKey: env.TURNSTILE_SITE_KEY ?? '0x4AAAAAADReV1Yt9Meyoji5'
	};
};

async function verifyTurnstile(token: string, secret: string, ip?: string): Promise<boolean> {
	const body = new URLSearchParams({ secret, response: token });
	if (ip) body.append('remoteip', ip);

	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		body
	});

	const contentType = res.headers.get('content-type');
	if (!contentType?.includes('application/json')) {
		const text = await res.text();
		throw new Error(`Turnstile response was not JSON. Status: ${res.status}. Body: ${text.slice(0, 100)}...`);
	}

	const data: { success: boolean } = await res.json();
	return data.success;
}

export const actions = {
	default: async ({ request, cookies, url, getClientAddress }) => {
		const data = await request.formData();
		const password = data.get('password')?.toString();
		const turnstileToken = data.get('cf-turnstile-response')?.toString();

		if (!env.ADMIN_PASSWORD) {
			error(500, 'ADMIN_PASSWORD is not configured.');
		}

		if (!env.ADMIN_SESSION_SECRET) {
			error(500, 'ADMIN_SESSION_SECRET is not configured.');
		}

		if (!dev) {
			if (!env.TURNSTILE_SECRET_KEY) {
				error(500, 'TURNSTILE_SECRET_KEY is not configured.');
			}

			if (!turnstileToken) {
				return fail(400, { error: 'Please complete the security challenge.' });
			}

			const ip = getClientAddress();
			try {
				const valid = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
				if (!valid) {
					return fail(400, { error: 'Security challenge failed. Please try again.' });
				}
			} catch (e: any) {
				return fail(500, { error: `Turnstile verification failed: ${e.message}` });
			}
		}

		if (!password || !constantTimeEqual(password, env.ADMIN_PASSWORD)) {
			return fail(401, { error: 'Incorrect password.' });
		}

		const token = await createSessionToken(env.ADMIN_SESSION_SECRET);
		cookies.set(SESSION_COOKIE, token, {
			...SESSION_COOKIE_OPTIONS,
			secure: url.protocol === 'https:'
		});
		redirect(303, '/admin');
	}
} satisfies Actions;
