<script lang="ts">
	import { gsap } from "gsap";
	import { onMount } from "svelte";
	import { cn } from "../utils/cn";

	interface Image {
		src: string;
		alt?: string;
	}

	interface ComponentProps {
		/**
		 * Array of images to preload/display during the sequence.
		 */
		images: Image[];
		/**
		 * Additional CSS classes for the container.
		 */
		class?: string;
		/**
		 * Callback function triggered when the preloading animation completes.
		 */
		onComplete?: () => void;
		[prop: string]: unknown;
	}

	let {
		images,
		class: className = "",
		onComplete,
		...restProps
	}: ComponentProps = $props();

	let containerRef = $state<HTMLElement>();
	let revealImagesRef: HTMLElement[] = $state([]);
	let isScaleUpRef: HTMLElement[] = $state([]);
	let secondLoopImagesRef: HTMLImageElement[] = $state([]);

	const attachContainerRef = (node: HTMLElement) => {
		containerRef = node;
	};

	const attachRevealImageRef = (index: number) => (node: HTMLElement) => {
		revealImagesRef[index] = node;
	};

	const attachScaleUpRef = (index: number) => (node: HTMLElement) => {
		isScaleUpRef[index] = node;
	};

	const attachSecondLoopImageRef =
		(index: number) => (node: HTMLImageElement) => {
			secondLoopImagesRef[index] = node;
		};

	/* Responsive tile size: smaller on mobile */
	function getTileSize(): string {
		if (typeof window === "undefined") return "10em";
		return window.innerWidth < 640 ? "5.5em" : "10em";
	}

	onMount(() => {
		const tileSize = getTileSize();
		const middleIndex = Math.floor(images.length / 2);
		const radiusTarget = isScaleUpRef[images.length + middleIndex];
		const isScaleDownTargets = secondLoopImagesRef.filter(
			(_, i) => i !== middleIndex,
		);

		/* Collect ALL img elements inside the container for the final fade */
		const allImages = containerRef?.querySelectorAll("img") ?? [];

		const tl = gsap.timeline({
			defaults: {
				ease: "expo.inOut",
			},
			onComplete: () => {
				if (containerRef) containerRef.style.display = "none";
				if (onComplete) onComplete();
			},
		});

		if (revealImagesRef.length) {
			tl.fromTo(
				revealImagesRef,
				{
					xPercent: 500,
				},
				{
					xPercent: -500,
					duration: 2.5,
					stagger: 0.05,
				},
			);
		}

		if (isScaleDownTargets.length) {
			tl.to(
				isScaleDownTargets,
				{
					scale: 0.5,
					duration: 2,
					stagger: {
						each: 0.05,
						from: "edges",
						ease: "none",
					},
					onComplete: () => {
						if (radiusTarget) {
							radiusTarget.style.borderRadius = "0";
						}
					},
				},
				"-=0.1",
			);
		}

		if (isScaleUpRef.length) {
			tl.fromTo(
				isScaleUpRef,
				{
					width: tileSize,
					height: tileSize,
				},
				{
					width: "100vw",
					height: "100dvh",
					duration: 2,
				},
				"< 0.5",
			);
		}

		/* Fade out just the images (keep black bg) for seamless transition */
		if (allImages.length) {
			tl.to(
				allImages,
				{
					opacity: 0,
					duration: 0.6,
					ease: "power2.inOut",
				},
			);
		}

		return () => {
			tl.kill();
		};
	});
</script>

<div
	{@attach attachContainerRef}
	class={cn(
		"fixed inset-0 z-999 flex items-center justify-center overflow-hidden",
		className,
	)}
	{...restProps}
>
	<div
		class="preloader-mask relative flex items-center justify-center"
	>
		<div class="relative overflow-hidden">
			<div class="absolute flex items-center justify-center rounded-[0.5em]">
				{#each images as image, i (image.src)}
					<div {@attach attachRevealImageRef(i)} class="relative preloader-gap">
						<div
							{@attach attachScaleUpRef(i)}
							class="preloader-tile relative flex items-center justify-center rounded-[0.5em]"
						>
							<img
								loading="eager"
								src={image.src}
								alt={image.alt ?? ""}
								class="absolute h-full w-full rounded-[inherit] object-cover"
							/>
						</div>
					</div>
				{/each}
			</div>

			<div
				class="relative left-full flex items-center justify-center rounded-[0.5em]"
			>
				{#each images as image, i (image.src)}
					{@const isMiddle = i === Math.floor(images.length / 2)}
					<div
						{@attach attachRevealImageRef(images.length + i)}
						class="relative preloader-gap"
					>
						<div
							{@attach attachScaleUpRef(images.length + i)}
							class:is--radius={isMiddle}
							style={isMiddle
								? "transition: border-radius 0.5s cubic-bezier(1, 0, 0, 1);"
								: ""}
							class="preloader-tile relative flex items-center justify-center rounded-[0.5em] {isMiddle
								? 'will-change-transform'
								: ''}"
						>
							<img
								{@attach attachSecondLoopImageRef(i)}
								loading="eager"
								src={image.src}
								alt={image.alt ?? ""}
								class="absolute h-full w-full rounded-[inherit] object-cover {isMiddle
									? ''
									: 'will-change-transform'}"
							/>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.preloader-tile {
		width: 5.5em;
		height: 5.5em;
	}

	.preloader-gap {
		padding-left: 0.4em;
		padding-right: 0.4em;
	}

	.preloader-mask {
		mask-image: linear-gradient(to right, transparent, black 2em, black calc(100% - 2em), transparent);
		-webkit-mask-image: linear-gradient(to right, transparent, black 2em, black calc(100% - 2em), transparent);
	}

	@media (min-width: 640px) {
		.preloader-tile {
			width: 10em;
			height: 10em;
		}

		.preloader-gap {
			padding-left: 1em;
			padding-right: 1em;
		}

		.preloader-mask {
			mask-image: linear-gradient(to right, transparent, black 5em, black calc(100% - 5em), transparent);
			-webkit-mask-image: linear-gradient(to right, transparent, black 5em, black calc(100% - 5em), transparent);
		}
	}
</style>
