import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: 'security',
  } as Record<string, unknown>,
  output: 'standalone',
  /* config options here */
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  redirects: async () => [
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'www.appifya.app',
        },
      ],
      destination: 'https://appifya.app/:path*',
      permanent: true,
    },
  ],
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
      ],
    },
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
