import { NextResponse } from 'next/server';

const INDEXNOW_KEY = 'c07886475f4e41b99cb5bb3a8f4cda1a';
const HOST = 'appifya.app';

const PUBLIC_URLS = [
  'https://appifya.app/',
  'https://appifya.app/tools',
  'https://appifya.app/guide',
  'https://appifya.app/admob',
  'https://appifya.app/tools/apk-permissions-auditor',
  'https://appifya.app/tools/app-mockup-framer',
  'https://appifya.app/tools/play-data-safety',
  'https://appifya.app/tools/assetlinks-generator',
  'https://appifya.app/tools/app-banner-generator',
  'https://appifya.app/tools/manifest-generator',
  'https://appifya.app/tools/icon-generator',
  'https://appifya.app/tools/qr-generator',
  'https://appifya.app/tools/pwa-checker',
  'https://appifya.app/about',
  'https://appifya.app/contact',
  'https://appifya.app/privacy',
  'https://appifya.app/terms',
];

export async function POST(request: Request) {
  try {
    let urlsToSubmit = PUBLIC_URLS;
    try {
      const body = await request.json();
      if (Array.isArray(body?.urls) && body.urls.length > 0) {
        urlsToSubmit = body.urls;
      }
    } catch {
      // Use default full URL list
    }

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList: urlsToSubmit,
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const success = res.status === 200 || res.status === 202;
    return NextResponse.json({
      success,
      status: res.status,
      submittedCount: urlsToSubmit.length,
      urls: urlsToSubmit,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'IndexNow configured',
    host: HOST,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlsCount: PUBLIC_URLS.length,
    urls: PUBLIC_URLS,
  });
}
