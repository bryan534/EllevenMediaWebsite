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
			viewBox="0 0 104.28 112.16"
		>
			<defs>
				<style>
					.cls-1 {
						fill: #fff;
					}
				</style>
			</defs>
			<g id="Layer_1-2" data-name="Layer 1">
				<polygon class="cls-1" points="82 111.1 58.46 111.1 66.24 72.92 80.88 0 104.28 .03 98.15 29.91 82 111.1"/>
				<path class="cls-1" d="M65.88,0l-2.97,14.51-10.6,52.51-8.81,44.05-23.07.05c.57-.23,1.13-.5,1.68-.81,2.41-1.35,4.37-3.27,5.89-5.73,1.51-2.45,2.27-5.31,2.27-8.55,0-4.19-1.33-7.62-4-10.29-.27-.27-.55-.53-.84-.77l5.34-26.7.66-3.39c.68-.26,1.34-.57,1.98-.93,2.41-1.36,4.37-3.27,5.89-5.73,1.52-2.46,2.28-5.31,2.28-8.56,0-4.18-1.34-7.61-4.01-10.28-.31-.31-.64-.61-.97-.88L42.18,0h23.7Z"/>
				<path class="cls-1" d="M27.34,25.47c-4.28,0-8.01,1.5-11.19,4.49-3.18,3-4.76,6.88-4.76,11.65,0,4.15,1.37,7.58,4.12,10.27s6.15,4.03,10.18,4.03c2.03,0,3.94-.36,5.74-1.11l5.26-26.16c-2.5-2.11-5.61-3.17-9.35-3.17Z"/>
				<path class="cls-1" d="M20.02,111.05h.04c-1.8.74-3.72,1.11-5.75,1.11-4.04,0-7.43-1.35-10.18-4.04-2.75-2.68-4.13-6.11-4.13-10.27,0-4.77,1.59-8.64,4.77-11.64,3.18-3,6.91-4.5,11.19-4.5,3.75,0,6.88,1.08,9.39,3.22l-5.33,26.12Z"/>
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
		stroke-width: 0.75;
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
