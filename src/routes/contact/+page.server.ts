import { fail } from '@sveltejs/kit';
import { Resend } from 'resend';
import type { Actions } from './$types';
import { env } from '$env/dynamic/private';

const inquiryTypes = new Set([
	'New Website',
	'SEO & Performance',
	'Hosting & Infrastructure',
	'Email & Domain Setup',
	'DevOps & Deployment',
	'General Inquiry',
]);

function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, (char) => {
		switch (char) {
			case '&':
				return '&amp;';
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '"':
				return '&quot;';
			case "'":
				return '&#39;';
			default:
				return char;
		}
	});
}

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString();
		const email = data.get('email')?.toString();
		const inquiry = data.get('inquiry')?.toString();
		const message = data.get('message')?.toString();
		const honeypot = data.get('website_url')?.toString();

		if (honeypot) {
			return { success: true };
		}

		if (!name || !email || !message || !inquiry || !inquiryTypes.has(inquiry)) {
			return fail(400, { name, email, inquiry, message, missing: true });
		}

		if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL || !env.CONTACT_TO_EMAIL) {
			console.error('Contact form email environment variables are not configured.');
			return fail(500, { name, email, inquiry, message, error: true });
		}

		const emailSubject = `Contact Form: ${inquiry} — from ${name}`;
		const escaped = {
			name: escapeHtml(name),
			email: escapeHtml(email),
			inquiry: escapeHtml(inquiry),
			message: escapeHtml(message),
		};

		const html = `
			<h2>New Contact Form Submission</h2>
			<table style="border-collapse:collapse;width:100%;max-width:600px;font-family:sans-serif;">
				<tr><td style="padding:12px;border-bottom:1px solid #eee;font-weight:700;white-space:nowrap;vertical-align:top;">Name</td><td style="padding:12px;border-bottom:1px solid #eee;">${escaped.name}</td></tr>
				<tr><td style="padding:12px;border-bottom:1px solid #eee;font-weight:700;white-space:nowrap;vertical-align:top;">Email</td><td style="padding:12px;border-bottom:1px solid #eee;">${escaped.email}</td></tr>
				<tr><td style="padding:12px;border-bottom:1px solid #eee;font-weight:700;white-space:nowrap;vertical-align:top;">Inquiry</td><td style="padding:12px;border-bottom:1px solid #eee;">${escaped.inquiry}</td></tr>
				<tr><td style="padding:12px;border-bottom:1px solid #eee;font-weight:700;white-space:nowrap;vertical-align:top;">Message</td><td style="padding:12px;border-bottom:1px solid #eee;white-space:pre-wrap;">${escaped.message}</td></tr>
			</table>
		`;

		try {
			const resend = new Resend(env.RESEND_API_KEY);
			const { error } = await resend.emails.send({
				from: env.CONTACT_FROM_EMAIL,
				to: env.CONTACT_TO_EMAIL,
				replyTo: email,
				subject: emailSubject,
				html,
			});

			if (error) {
				console.error('Failed to send contact email:', error);
				return fail(500, { name, email, inquiry, message, error: true });
			}
		} catch (err) {
			console.error('Contact form exception:', err);
			return fail(500, { name, email, inquiry, message, error: true });
		}

		return { success: true };
	}
} satisfies Actions;
