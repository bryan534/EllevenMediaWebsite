export const site = {
	name: 'Elleven Media',
	legalName: 'Elleven Media Group',
	url: 'https://ellevenmediagroup.com',
	domain: 'ellevenmediagroup.com',
	defaultImage: '/og-image.png',
	defaultImageAlt: 'Elleven Media brand mark on a black background',
};

export function absoluteUrl(path = '/') {
	if (path.startsWith('http://') || path.startsWith('https://')) return path;

	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	const canonicalPath = normalizedPath === '/' ? '/' : normalizedPath.replace(/\/$/, '');

	return `${site.url}${canonicalPath}`;
}
