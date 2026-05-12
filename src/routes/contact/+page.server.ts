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

const contactEmailLogoUrl = 'https://cdn.ellevenmediagroup.com/ellevenlogo.png';

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

type ContactEmailFields = {
	name: string;
	email: string;
	inquiry: string;
	message: string;
	submittedAt: string;
};

function buildContactEmailHtml({ name, email, inquiry, message, submittedAt }: ContactEmailFields) {
	const escaped = {
		name: escapeHtml(name),
		email: escapeHtml(email),
		inquiry: escapeHtml(inquiry),
		message: escapeHtml(message),
		submittedAt: escapeHtml(submittedAt),
		replyHref: `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: ${inquiry} inquiry`)}`
	};

	return `
		<!doctype html>
		<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<meta name="color-scheme" content="dark">
				<meta name="supported-color-schemes" content="dark">
				<title>New Contact Form Submission</title>
				<style>
					:root {
						color-scheme: dark;
						supported-color-schemes: dark;
					}
				</style>
				</head>
				<body style="margin:0;padding:0;background:#000000;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#ffffff;">
					<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
						Internal lead notification: ${escaped.name} sent a new ${escaped.inquiry} inquiry through the Elleven Media website.
					</div>
					<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#000000;">
						<tr>
							<td align="center" style="padding:36px 16px;">
								<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:660px;background:#0d0d0d;border:1px solid #2a2a2a;border-radius:20px;overflow:hidden;">
									<tr>
										<td style="padding:30px 30px 22px;background:#000000;border-bottom:1px solid #242424;">
											<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 34px;">
												<tr>
													<td style="vertical-align:middle;">
														<img src="${contactEmailLogoUrl}" width="182" alt="Elleven Media" style="display:block;width:182px;max-width:70%;height:auto;border:0;margin:0;">
													</td>
													<td align="right" style="vertical-align:middle;">
														<span style="display:inline-block;border:1px solid #3a3a3a;border-radius:999px;padding:8px 12px;font-size:10px;line-height:1;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:#ffffff;">Internal</span>
													</td>
												</tr>
											</table>
											<p style="margin:0 0 14px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:2.8px;text-transform:uppercase;color:#a0a0a0;">Lead Notification</p>
											<h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.08;font-weight:600;letter-spacing:0;color:#ffffff;">New inquiry from ${escaped.name}</h1>
											<p style="margin:16px 0 0;font-size:16px;line-height:1.65;color:#cfcfcf;">${escaped.inquiry} submitted through ellevenmediagroup.com.</p>
										</td>
								</tr>
								<tr>
									<td style="padding:28px 30px 0;background:#0d0d0d;">
										<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
											<tr>
												<td style="padding:0 0 24px;">
													<a href="${escaped.replyHref}" style="display:inline-block;background:#ffffff;color:#000000;text-decoration:none;border-radius:999px;padding:13px 20px;font-size:14px;line-height:1;font-weight:700;">Reply to ${escaped.name}</a>
												</td>
											</tr>
										</table>
										<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #242424;border-radius:16px;overflow:hidden;background:#111111;">
											<tr>
												<td style="padding:16px 18px;border-bottom:1px solid #242424;vertical-align:top;">
													<p style="margin:0;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#808080;">Status</p>
												</td>
												<td style="padding:16px 18px;border-bottom:1px solid #242424;text-align:right;vertical-align:top;">
													<p style="margin:0;font-size:15px;line-height:1.5;font-weight:700;color:#ffffff;">New</p>
												</td>
											</tr>
											<tr>
												<td style="padding:16px 18px;border-bottom:1px solid #242424;vertical-align:top;">
													<p style="margin:0;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#808080;">Source</p>
												</td>
												<td style="padding:16px 18px;border-bottom:1px solid #242424;text-align:right;vertical-align:top;">
													<p style="margin:0;font-size:15px;line-height:1.5;font-weight:700;color:#ffffff;">Website Contact Form</p>
												</td>
											</tr>
											<tr>
												<td style="padding:16px 18px;border-bottom:1px solid #242424;vertical-align:top;">
													<p style="margin:0;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#808080;">Name</p>
												</td>
												<td style="padding:16px 18px;border-bottom:1px solid #242424;text-align:right;vertical-align:top;">
													<p style="margin:0;font-size:15px;line-height:1.5;font-weight:700;color:#ffffff;word-break:break-word;">${escaped.name}</p>
												</td>
											</tr>
											<tr>
												<td style="padding:16px 18px;border-bottom:1px solid #242424;vertical-align:top;">
													<p style="margin:0;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#808080;">Email</p>
												</td>
												<td style="padding:16px 18px;border-bottom:1px solid #242424;text-align:right;vertical-align:top;">
													<p style="margin:0;font-size:15px;line-height:1.5;font-weight:700;color:#ffffff;word-break:break-word;"><a href="${escaped.replyHref}" style="color:#ffffff;text-decoration:underline;">${escaped.email}</a></p>
												</td>
											</tr>
											<tr>
												<td style="padding:16px 18px;border-bottom:1px solid #242424;vertical-align:top;">
													<p style="margin:0;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#808080;">Inquiry</p>
												</td>
												<td style="padding:16px 18px;border-bottom:1px solid #242424;text-align:right;vertical-align:top;">
													<p style="margin:0;font-size:15px;line-height:1.5;font-weight:700;color:#ffffff;word-break:break-word;">${escaped.inquiry}</p>
												</td>
											</tr>
											<tr>
												<td style="padding:16px 18px;vertical-align:top;">
													<p style="margin:0;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#808080;">Submitted</p>
												</td>
												<td style="padding:16px 18px;text-align:right;vertical-align:top;">
													<p style="margin:0;font-size:15px;line-height:1.5;font-weight:700;color:#ffffff;">${escaped.submittedAt}</p>
												</td>
											</tr>
										</table>
									</td>
								</tr>
								<tr>
									<td style="padding:24px 30px 32px;background:#0d0d0d;">
											<div style="border:1px solid #2a2a2a;border-radius:18px;background:#000000;padding:22px;">
												<p style="margin:0 0 12px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#808080;">Message</p>
												<div style="margin:0;font-size:17px;line-height:1.75;color:#ffffff;white-space:pre-wrap;word-break:break-word;">${escaped.message}</div>
											</div>
											<p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#808080;text-align:center;">Internal notification for Elleven Media Group. The sender did not receive this email.</p>
										</td>
									</tr>
								</table>
						</td>
					</tr>
				</table>
			</body>
		</html>
	`;
}

function buildContactEmailText({ name, email, inquiry, message, submittedAt }: ContactEmailFields) {
	return [
		'Internal Lead Notification',
		'',
		'Status: New',
		'Source: Website Contact Form',
		`Name: ${name}`,
		`Email: ${email}`,
		`Inquiry: ${inquiry}`,
		`Submitted: ${submittedAt}`,
		'',
		'Message:',
		message,
		'',
		'Internal notification for Elleven Media Group. The sender did not receive this email.'
	].join('\n');
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

		const emailSubject = `Contact Form: ${inquiry} - ${name}`;
		const submittedAt = new Intl.DateTimeFormat('en-US', {
			dateStyle: 'medium',
			timeStyle: 'short',
			timeZone: 'America/Los_Angeles'
		}).format(new Date());
		const emailFields = {
			name,
			email,
			inquiry,
			message,
			submittedAt
		};

		const html = buildContactEmailHtml(emailFields);
		const text = buildContactEmailText(emailFields);

		try {
			const resend = new Resend(env.RESEND_API_KEY);
			const { error } = await resend.emails.send({
				from: env.CONTACT_FROM_EMAIL,
				to: env.CONTACT_TO_EMAIL,
				replyTo: email,
				subject: emailSubject,
				html,
				text
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
