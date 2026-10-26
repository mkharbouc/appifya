import type { MetadataRoute } from 'next';

const siteUrl = 'https://www.appifya.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{
    route: string;
    lastModified: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }> = [
    { route: '', lastModified: '2026-10-25', changeFrequency: 'weekly', priority: 1.0 },
    { route: '/tools', lastModified: '2026-10-25', changeFrequency: 'weekly', priority: 0.9 },
    { route: '/tools/native-bridge-simulator', lastModified: '2026-10-26', changeFrequency: 'weekly', priority: 0.8 },
    { route: '/guide', lastModified: '2026-10-24', changeFrequency: 'monthly', priority: 0.8 },
    { route: '/admob', lastModified: '2026-10-24', changeFrequency: 'monthly', priority: 0.8 },
    { route: '/tools/push-notification-tester', lastModified: '2026-10-26', changeFrequency: 'weekly', priority: 0.8 },
    { route: '/tools/apk-permissions-auditor', lastModified: '2026-10-25', changeFrequency: 'weekly', priority: 0.8 },
    { route: '/tools/app-mockup-framer', lastModified: '2026-10-25', changeFrequency: 'weekly', priority: 0.8 },
    { route: '/tools/play-testers-generator', lastModified: '2026-10-26', changeFrequency: 'weekly', priority: 0.9 },
    { route: '/tools/play-data-safety', lastModified: '2026-10-25', changeFrequency: 'weekly', priority: 0.8 },
    { route: '/tools/assetlinks-generator', lastModified: '2026-10-25', changeFrequency: 'monthly', priority: 0.7 },
    { route: '/tools/app-banner-generator', lastModified: '2026-10-25', changeFrequency: 'monthly', priority: 0.7 },
    { route: '/tools/manifest-generator', lastModified: '2026-10-25', changeFrequency: 'monthly', priority: 0.7 },
    { route: '/tools/icon-generator', lastModified: '2026-10-25', changeFrequency: 'monthly', priority: 0.7 },
    { route: '/tools/qr-generator', lastModified: '2026-10-25', changeFrequency: 'monthly', priority: 0.7 },
    { route: '/tools/pwa-checker', lastModified: '2026-10-25', changeFrequency: 'monthly', priority: 0.7 },
    { route: '/about', lastModified: '2026-10-24', changeFrequency: 'monthly', priority: 0.6 },
    { route: '/contact', lastModified: '2026-10-24', changeFrequency: 'monthly', priority: 0.6 },
    { route: '/privacy', lastModified: '2026-10-24', changeFrequency: 'yearly', priority: 0.3 },
    { route: '/terms', lastModified: '2026-10-24', changeFrequency: 'yearly', priority: 0.3 },
  ];

  return routes.map((item) => ({
    url: `${siteUrl}${item.route}`,
    lastModified: new Date(item.lastModified),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}
