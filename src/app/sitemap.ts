import type { MetadataRoute } from 'next';

const siteUrl = 'https://appifya.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/guide',
    '/admob',
    '/dashboard',
    '/tools/manifest-generator',
    '/tools/icon-generator',
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : route === '/dashboard' ? 'daily' : 'monthly',
    priority: route === '' ? 1 : route === '/dashboard' ? 0.8 : route === '/guide' || route === '/admob' ? 0.7 : 0.6,
  }));
}
