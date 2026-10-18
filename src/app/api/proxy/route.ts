import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { isValidPublicUrl } from '@/lib/app-config';

function safeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'pwa-package';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeUrl = searchParams.get('url');
  const appName = searchParams.get('name') || 'Appifya App';
  const themeColor = searchParams.get('theme') || '#6366f1';

  if (!isValidPublicUrl(storeUrl)) {
    return NextResponse.json({ error: 'A valid HTTPS URL is required.' }, { status: 400 });
  }

  const safeName = safeFileName(appName);
  const manifest = JSON.stringify(
    {
      name: appName,
      short_name: appName.slice(0, 12),
      start_url: './index.html',
      display: 'standalone',
      background_color: '#0f172a',
      theme_color: themeColor,
      icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
    },
    null,
    2,
  );
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="${themeColor}"><link rel="manifest" href="manifest.json"></head>
<body style="margin:0"><iframe src="${storeUrl}" title="${appName.replaceAll('"', '&quot;')}" style="border:0;width:100vw;height:100vh"></iframe>
<script>if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');</script></body></html>`;
  const serviceWorker = `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));`;
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="${themeColor}"/><text x="256" y="310" text-anchor="middle" font-size="180" font-family="Arial" fill="white">${appName.slice(0, 1).toUpperCase()}</text></svg>`;

  const archive = new JSZip();
  archive.file('index.html', html);
  archive.file('manifest.json', manifest);
  archive.file('sw.js', serviceWorker);
  archive.file('icon.svg', icon);
  const zip = await archive.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

  return new NextResponse(Buffer.from(zip), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${safeName}.zip"`,
      'Cache-Control': 'no-store',
    },
  });
}
