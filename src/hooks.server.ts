import { json, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { verifySession } from '$lib/session';

const adminCsp = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com blob:",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' https://fonts.gstatic.com",
	"img-src 'self' data:",
	"frame-src https://challenges.cloudflare.com",
	"connect-src 'self'",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'"
].join('; ');

function isAdminPath(pathname: string) {
	return pathname === '/admin' || pathname.startsWith('/admin/');
}

function isAdminLoginPath(pathname: string) {
	return pathname === '/admin/login' || pathname.startsWith('/admin/login/');
}

function isAdminApiPath(pathname: string) {
	return pathname.startsWith('/admin/api/');
}

function setAdminHeaders(response: Response) {
	response.headers.set('Cache-Control', 'private, no-store, max-age=0');
	response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	response.headers.set('Content-Security-Policy', adminCsp);
	response.headers.append('Vary', 'Cookie');
	return response;
}

function adminJson(body: Record<string, unknown>, status: number) {
	const response = json(body, { status });
	setAdminHeaders(response);
	response.headers.set('X-Content-Type-Options', 'nosniff');
	return response;
}

function adminText(body: string, status: number) {
	const response = new Response(body, {
		status,
		headers: {
			'content-type': 'text/plain; charset=utf-8'
		}
	});
	setAdminHeaders(response);
	response.headers.set('X-Content-Type-Options', 'nosniff');
	return response;
}

function adminRedirect(location: string) {
	const response = new Response(null, {
		status: 303,
		headers: { location }
	});
	setAdminHeaders(response);
	return response;
}

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;
	const isAdmin = isAdminPath(pathname);

	if (isAdmin && !isAdminLoginPath(pathname)) {
		if (!env.ADMIN_SESSION_SECRET) {
			return isAdminApiPath(pathname)
				? adminJson({ success: false, error: 'Admin session is not configured.' }, 500)
				: adminText('ADMIN_SESSION_SECRET is not configured.', 500);
		}

		const authenticated = await verifySession(event.cookies, env.ADMIN_SESSION_SECRET);
		if (!authenticated) {
			return isAdminApiPath(pathname)
				? adminJson({ success: false, error: 'Unauthorized.' }, 401)
				: adminRedirect('/admin/login');
		}
	}

	const response = await resolve(event);

	if (isAdmin) {
		setAdminHeaders(response);
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
