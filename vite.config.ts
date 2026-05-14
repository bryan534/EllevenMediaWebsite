import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		noExternal: ['gsap']
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('gsap')) return 'vendor-gsap';
					if (id.includes('node_modules/svelte')) return 'vendor-svelte';
				}
			}
		}
	}
});
