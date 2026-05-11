<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		onComplete?: () => void;
	}

	let { onComplete }: Props = $props();

	let overlayEl: HTMLDivElement;
	let logoEl: HTMLDivElement;

	onMount(() => {
		const parts = overlayEl.querySelectorAll<SVGGeometryElement>(
			'.draw-logo path, .draw-logo polygon'
		);

		if (!parts.length) {
			onComplete?.();
			return;
		}

		parts.forEach((part, index) => {
			const length = part.getTotalLength();
			part.style.strokeDasharray = String(length);
			part.style.strokeDashoffset = String(length);
			part.style.animationDelay = `${index * 0.04}s, ${2.8 + index * 0.02}s`;
		});

		// When the last shape's fill animation finishes, run the exit sequence.
		// No { once: true } — animationend fires for each animation name on the
		// element (drawLogo first, then fillLogo), so we filter by name and
		// remove the listener manually after acting.
		const lastPart = parts[parts.length - 1];
		let isComplete = false;

		function runExitSequence() {
			if (isComplete) return;
			isComplete = true;
			lastPart.removeEventListener('animationend', onFillEnd);

			// Step 1 — logo fades into the black background
			logoEl.style.transition = 'opacity 0.65s ease';
			logoEl.style.opacity = '0';

			// Step 2 — black overlay fades out, revealing the page behind
			setTimeout(() => {
				overlayEl.style.transition = 'opacity 0.55s ease';
				overlayEl.style.opacity = '0';

				setTimeout(() => {
					onComplete?.();
				}, 560);
			}, 680);
		}

		function onFillEnd(e: Event) {
			const animationName = (e as AnimationEvent).animationName;
			if (!animationName.endsWith('svgFillLogo')) return;
			runExitSequence();
		}

		lastPart.addEventListener('animationend', onFillEnd);

		// Fallback keeps the site from staying hidden if animation events are
		// suppressed or renamed by the runtime.
		const fallbackTimer = window.setTimeout(runExitSequence, 4500);

		return () => {
			window.clearTimeout(fallbackTimer);
			lastPart.removeEventListener('animationend', onFillEnd);
		};
	});
</script>

<div bind:this={overlayEl} class="svg-preloader">
	<div bind:this={logoEl} class="logo-box">
		<svg
			class="draw-logo"
			id="Layer_2"
			data-name="Layer 2"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 167.84 112.51"
		>
			<g id="Layer_1-2" data-name="Layer 1">
				<path d="M84.23,55.33c-2.13-.64-4.01-1.76-5.62-3.34-2.72-2.67-4.08-6.05-4.08-10.13,0-1.21.1-2.37.29-3.46-7.75-6.85-17.15-9.11-27.56-9.13-7.1-.01-13.82,1.08-20.35,3.85-10.97,4.67-19.2,13.41-23.38,24.6-6.81,18.23-4.62,39.94,14.21,49.76,7.37,3.84,15.26,5,23.6,5.03,8.64.04,17.13-1.71,24.67-5.62-1.85-2.41-2.78-5.29-2.78-8.66,0-3.79.94-7.02,2.85-9.7l-1.74-2.81c-8.32,7.61-20.98,9.54-31.08,6.29-6.59-2.34-10.26-7.24-10.81-14.43l60.64-.02c1.86-7.42,2.57-15.09,1.14-22.23ZM23.84,63.48c1.82-5.89,5.54-11.02,11.19-13.84,8.67-4.33,22.24-3.7,27.06,5.87,1.08,2.47,1.75,4.77,1.91,7.96H23.84Z"/>
				<polygon points="145.56 111.1 122.03 111.1 129.81 72.92 144.44 0 167.84 .03 161.72 29.91 145.56 111.1"/>
				<path d="M129.45,0l-2.97,14.51-10.6,52.51-8.81,44.05-23.07.05c.57-.23,1.13-.5,1.68-.81,2.41-1.35,4.37-3.27,5.89-5.73,1.51-2.45,2.27-5.31,2.27-8.55,0-4.19-1.33-7.62-4-10.29-.27-.27-.55-.53-.84-.77l5.34-26.7.66-3.39c.68-.26,1.34-.57,1.98-.93,2.41-1.36,4.37-3.27,5.89-5.73,1.52-2.46,2.28-5.31,2.28-8.56,0-4.18-1.34-7.61-4.01-10.28-.31-.31-.64-.61-.97-.88L105.75,0h23.7Z"/>
			</g>
		</svg>
	</div>
</div>

<style>
	.svg-preloader {
		position: fixed;
		inset: 0;
		z-index: 999;
		background: #111;
		display: grid;
		place-items: center;
	}

	.logo-box {
		width: min(85vw, 700px);
	}

	.draw-logo {
		width: 100%;
		height: auto;
		display: block;
		overflow: visible;
	}

	.draw-logo :global(path),
	.draw-logo :global(polygon) {
		fill: transparent;
		stroke: #fff;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		animation:
			svgDrawLogo 3s ease forwards,
			svgFillLogo 0.7s ease forwards 2.8s;
	}

	@keyframes svgDrawLogo {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes svgFillLogo {
		to {
			fill: #fff;
		}
	}
</style>
