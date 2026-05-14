import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	if (response.headers.get('content-type')?.includes('text/html')) {
		if (event.request.method === 'GET' || event.request.method === 'HEAD') {
			response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
		}
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('X-Frame-Options', 'SAMEORIGIN');
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	}

	return response;
};
