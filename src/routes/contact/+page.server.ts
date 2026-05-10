import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString();
		const email = data.get('email')?.toString();
		const subject = data.get('subject')?.toString();
		const message = data.get('message')?.toString();
		const honeypot = data.get('website_url')?.toString();

		// If the honeypot field has ANY content, silently reject it 
		// (pretend it was successful so the bot moves on without trying again)
		if (honeypot) {
			console.log('Bot detected and blocked via honeypot field.');
			return { success: true };
		}

		if (!name || !email || !message) {
			return fail(400, { name, email, subject, message, missing: true });
		}

		// Mock sending email or saving to DB
		console.log('Contact form submitted:', { name, email, subject, message });

		// Add a simulated delay for realism
		await new Promise(resolve => setTimeout(resolve, 800));

		return { success: true };
	}
} satisfies Actions;
