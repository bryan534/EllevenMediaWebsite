export const SESSION_COOKIE = 'admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SESSION_SUBJECT = 'admin-session';
const encoder = new TextEncoder();

async function hmac(secret: string, payload: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
	return Array.from(new Uint8Array(sig))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export function constantTimeEqual(a: string, b: string): boolean {
	const aBytes = encoder.encode(a);
	const bBytes = encoder.encode(b);
	if (aBytes.length !== bBytes.length) return false;

	let diff = 0;
	for (let i = 0; i < aBytes.length; i += 1) {
		diff |= aBytes[i] ^ bBytes[i];
	}

	return diff === 0;
}

export async function createSessionToken(secret: string): Promise<string> {
	if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured.');

	const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
	const payload = `${SESSION_SUBJECT}.${expiresAt}`;
	const sig = await hmac(secret, payload);
	return `${expiresAt}.${sig}`;
}

export async function verifySession(
	cookies: { get: (name: string) => string | undefined },
	secret: string
): Promise<boolean> {
	if (!secret) return false;

	const token = cookies.get(SESSION_COOKIE);
	if (!token) return false;

	const [expiresAtRaw, sig] = token.split('.');
	const expiresAt = Number(expiresAtRaw);

	if (!Number.isFinite(expiresAt) || !sig) return false;
	if (expiresAt <= Math.floor(Date.now() / 1000)) return false;

	const expected = await hmac(secret, `${SESSION_SUBJECT}.${expiresAt}`);
	return constantTimeEqual(sig, expected);
}

export const SESSION_COOKIE_OPTIONS = {
	path: '/admin',
	httpOnly: true,
	secure: true,
	sameSite: 'lax' as const,
	maxAge: SESSION_MAX_AGE
};
