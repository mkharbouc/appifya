import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import archiver from 'archiver';
import { PassThrough } from 'stream';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const databaseId = '6ace931c00205a66e468';
    const collectionId = '6ace935d0015975c804b';

    let appName = 'MyStoreApp';
    let storeUrl = 'https://example.com';
    let themeColor = '#6366f1';

    if (id) {
      try {
        const doc = await databases.getDocument(databaseId, collectionId, id);
        appName = doc.app_name || appName;
        storeUrl = doc.store_url || storeUrl;
        themeColor = doc.theme_color || themeColor;
      } catch (e) {
        console.error('Appwrite fetch error:', e);
      }
    }

    const safeName = appName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'app-package';

    const manifestContent = JSON.stringify(
      {
        name: appName,
        short_name: appName,
        start_url: storeUrl,
        display: 'standalone',
        background_color: '#020617',
        theme_color: themeColor,
        icons: [
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      null,
      2
    );

    const indexHtmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="${themeColor}">
  <style>
    body { margin: 0; background: #020617; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; }
    a { display: inline-block; padding: 12px 24px; background: ${themeColor}; color: #fff; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 16px; }
  </style>
</head>
<body>
  <h2>تطبيق ${appName}</h2>
  <p>جاري تحويلك إلى المتجر...</p>
  <a href="${storeUrl}">دخول المتجر مباشرة</a>
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js');
    }
    setTimeout(() => { window.location.href = "${storeUrl}"; }, 1500);
  </script>
</body>
</html>`;

    const swContent = `self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { clients.claim(); });
self.addEventListener('fetch', (e) => {});`;

    const archive = archiver('zip', { zlib: { level: 9 } });
    const passthrough = new PassThrough();

    archive.pipe(passthrough);
    archive.append(manifestContent, { name: 'manifest.json' });
    archive.append(indexHtmlContent, { name: 'index.html' });
    archive.append(swContent, { name: 'sw.js' });
    archive.finalize();

    const stream = new ReadableStream({
      start(controller) {
        passthrough.on('data', (chunk) => controller.enqueue(chunk));
        passthrough.on('end', () => controller.close());
        passthrough.on('error', (err) => controller.error(err));
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeName}.zip"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    return new NextResponse(err.message || 'Error generating package', { status: 500 });
  }
}
