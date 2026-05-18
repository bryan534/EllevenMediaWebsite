import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	const pathname = new URL(event.request.url).pathname;
	const isAdmin = pathname.startsWith('/admin');

	if (isAdmin) {
		response.headers.set('Cache-Control', 'private, no-store, max-age=0');
		response.headers.set('X-Robots-Tag', 'noindex, nofollow');
		response.headers.set(
			'Content-Security-Policy',
			[
				"default-src 'self'",
				"script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
				"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
				"font-src 'self' https://fonts.gstatic.com",
				"img-src 'self' data:",
				"frame-src https://challenges.cloudflare.com",
				"connect-src 'self'",
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self'"
			].join('; ')
		);
	}

	if (response.headers.get('content-type')?.includes('text/html')) {
		if (!isAdmin && (event.request.method === 'GET' || event.request.method === 'HEAD')) {
			response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
		}
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('X-Frame-Options', 'SAMEORIGIN');
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	}

	return response;
};
