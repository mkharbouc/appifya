import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy
 * Intercepts automated vulnerability scanner probes (WordPress, PHP, .env, fake admin endpoints)
 * and responds immediately with 404 without rendering any React tree, layout, or calling server components.
 * This saves Vercel free tier resources (Serverless Function invocations and execution time).
 */
export function proxy(_request: NextRequest) {
  return new NextResponse('Not Found', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export const config = {
  matcher: [
    // WordPress probes (scanners looking for WordPress vulnerabilities)
    '/wp-admin/:path*',
    '/wp-includes/:path*',
    '/wp-content/:path*',
    '/wp-login:path*',
    '/xmlrpc.php',

    // Scanners searching for arbitrary PHP files
    '/(.*\\.php)',

    // Probes for configuration, secret, or git files
    '/(.*\\.env.*)',
    '/(.*\\.git.*)',

    // Common CMS / generic admin portals not present in this application
    '/admin',
    '/admin/:path*',
    '/administrator/:path*',
    '/phpmyadmin/:path*',
    '/cgi-bin/:path*',
  ],
};
