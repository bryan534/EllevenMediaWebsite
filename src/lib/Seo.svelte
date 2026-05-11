<script lang="ts">
	import { page } from '$app/stores';
	import { absoluteUrl, site } from '$lib/seo';

	type Props = {
		title: string;
		description: string;
		path?: string;
		image?: string;
		imageAlt?: string;
		type?: 'website' | 'article';
		robots?: string;
	};

	let {
		title,
		description,
		path,
		image = site.defaultImage,
		imageAlt = site.defaultImageAlt,
		type = 'website',
		robots = 'index, follow',
	}: Props = $props();

	let canonicalUrl = $derived(absoluteUrl(path ?? $page.url.pathname));
	let imageUrl = $derived(absoluteUrl(image));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="robots" content={robots} />
	<link rel="canonical" href={canonicalUrl} />

	<meta property="og:locale" content="en_US" />
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:secure_url" content={imageUrl} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={imageAlt} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:domain" content={site.domain} />
	<meta name="twitter:url" content={canonicalUrl} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />
	<meta name="twitter:image:alt" content={imageAlt} />
</svelte:head>
