const BASE = 'https://api.torbox.app/v1/api/vendors';

type TorBoxEnvelope<T> = {
	success?: boolean;
	error?: string | null;
	detail?: unknown;
	data?: T | null;
};

type TorBoxResponse<T> = {
	success: boolean;
	error: string | null;
	detail: string;
	data: T | null;
	status: number;
};

export type VendorData = {
	vendor_id: number;
	vendor_name: string;
	vendor_status: string;
	users_allowed: number;
	current_users: number;
	can_register_new: boolean;
	plan: number;
	paid_until: string;
};

export type RegisterUserData = {
	auth_id: string;
	email: string;
	base_email: string;
	password: string;
	customer: string;
	vendor_id: number;
};

export type UserData = {
	auth_id: string;
	email: string;
	plan: number;
	premium_expires_at: string;
	api_token?: string;
};

function formatDetail(detail: unknown): string {
	if (typeof detail === 'string') return detail;
	if (Array.isArray(detail)) {
		return detail
			.map((item) => {
				if (item && typeof item === 'object' && 'msg' in item) {
					return String(item.msg);
				}
				return '';
			})
			.filter(Boolean)
			.join(' ');
	}
	return '';
}

async function torboxReq<T>(
	path: string,
	apiKey: string,
	init?: RequestInit
): Promise<TorBoxResponse<T>> {
	if (!apiKey) {
		return {
			success: false,
			error: 'MISSING_API_KEY',
			detail: 'TORBOX_API_KEY is not configured.',
			data: null,
			status: 0
		};
	}

	const headers = new Headers(init?.headers);
	headers.set('Authorization', `Bearer ${apiKey}`);

	let res: Response;
	try {
		res = await fetch(`${BASE}${path}`, { ...init, headers });
	} catch {
		return {
			success: false,
			error: 'NETWORK_ERROR',
			detail: 'Could not reach the TorBox API.',
			data: null,
			status: 0
		};
	}

	let body: string;
	try {
		body = await res.text();
	} catch {
		return {
			success: false,
			error: `HTTP_${res.status}`,
			detail: `TorBox returned an unreadable response (HTTP ${res.status}).`,
			data: null,
			status: res.status
		};
	}

	let json: TorBoxEnvelope<T> | null = null;
	try {
		json = JSON.parse(body) as TorBoxEnvelope<T>;
	} catch {
		return {
			success: false,
			error: `HTTP_${res.status}`,
			detail: `TorBox returned a non-JSON response (HTTP ${res.status}): ${body.slice(0, 300)}`,
			data: null,
			status: res.status
		};
	}

	const rawDetail = formatDetail(json?.detail);
	const usefulDetail = rawDetail && rawDetail.toLowerCase() !== 'ok' ? rawDetail : null;
	const usefulStatusText = res.statusText && res.statusText.toLowerCase() !== 'ok' ? res.statusText : null;
	const detail = usefulDetail || usefulStatusText || 'TorBox API request failed.';

	return {
		success: res.ok && json?.success === true,
		error: typeof json?.error === 'string' ? json.error : res.ok ? null : `HTTP_${res.status}`,
		detail,
		data: json?.data ?? null,
		status: res.status
	};
}

export const getVendorAccount = (key: string) => torboxReq<VendorData>('/account', key);

export const getAccount = (key: string, authId: string) =>
	torboxReq<UserData>(`/getaccount?user_auth_id=${encodeURIComponent(authId)}`, key);

export function registerUser(key: string, email: string) {
	const form = new FormData();
	form.append('user_email', email);
	return torboxReq<RegisterUserData>('/registeruser', key, { method: 'POST', body: form });
}

export const removeUser = (key: string, authId: string) =>
	torboxReq<null>(`/removeuser?user_auth_id=${encodeURIComponent(authId)}`, key, {
		method: 'DELETE'
	});
