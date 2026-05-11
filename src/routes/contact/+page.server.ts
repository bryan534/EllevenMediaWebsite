import { fail } from '@sveltejs/kit';
import { Resend } from 'resend';
import type { Actions } from './$types';
import { env } from '$env/dynamic/private';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString();
		const email = data.get('email')?.toString();
		const subject = data.get('subject')?.toString();
		const message = data.get('message')?.toString();
		const honeypot = data.get('website_url')?.toString();

		if (honeypot) {
			console.log('Bot detected and blocked via honeypot field.');
			return { success: true };
		}

		if (!name || !email || !message) {
			return fail(400, { name, email, subject, message, missing: true });
		}

		const emailSubject = subject
			? `Contact Form: ${subject} — from ${name}`
			: `Contact Form: New message from ${name}`;

		const html = `
			<h2>New Contact Form Submission</h2>
			<table style="border-collapse:collapse;width:100%;max-width:600px;font-family:sans-serif;">
				<tr><td style="padding:12px;border-bottom:1px solid #eee;font-weight:700;white-space:nowrap;vertical-align:top;">Name</td><td style="padding:12px;border-bottom:1px solid #eee;">${name}</td></tr>
				<tr><td style="padding:12px;border-bottom:1px solid #eee;font-weight:700;white-space:nowrap;vertical-align:top;">Email</td><td style="padding:12px;border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
				<tr><td style="padding:12px;border-bottom:1px solid #eee;font-weight:700;white-space:nowrap;vertical-align:top;">Subject</td><td style="padding:12px;border-bottom:1px solid #eee;">${subject || '(none provided)'}</td></tr>
				<tr><td style="padding:12px;border-bottom:1px solid #eee;font-weight:700;white-space:nowrap;vertical-align:top;">Message</td><td style="padding:12px;border-bottom:1px solid #eee;white-space:pre-wrap;">${message}</td></tr>
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
				return fail(500, { name, email, subject, message, error: true });
			}
		} catch (err) {
			console.error('Contact form exception:', err);
			return fail(500, { name, email, subject, message, error: true });
		}

		return { success: true };
	}
} satisfies Actions;
