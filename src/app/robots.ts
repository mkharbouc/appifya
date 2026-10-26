import type { MetadataRoute } from 'next';

const siteUrl = 'https://appifya.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/app/',
          '/view/',
          '/verify-email',
          '/api/',
          '/auth/',
          '/_next/',
          '/static/',
          '/admin',
          '/wp-admin/',
          '/wp-content/',
          '/wp-includes/',
          '/*.php$',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
