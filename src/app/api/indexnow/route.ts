import { NextResponse } from 'next/server';

const INDEXNOW_KEY = 'c07886475f4e41b99cb5bb3a8f4cda1a';
const HOST = 'www.appifya.app';

const PUBLIC_URLS = [
  'https://www.appifya.app/',
  'https://www.appifya.app/tools',
  'https://www.appifya.app/guide',
  'https://www.appifya.app/admob',
  'https://www.appifya.app/tools/push-notification-tester',
  'https://www.appifya.app/tools/apk-permissions-auditor',
  'https://www.appifya.app/tools/app-mockup-framer',
  'https://www.appifya.app/tools/play-data-safety',
  'https://www.appifya.app/tools/assetlinks-generator',
  'https://www.appifya.app/tools/app-banner-generator',
  'https://www.appifya.app/tools/manifest-generator',
  'https://www.appifya.app/tools/icon-generator',
  'https://www.appifya.app/tools/qr-generator',
  'https://www.appifya.app/tools/pwa-checker',
  'https://www.appifya.app/about',
  'https://www.appifya.app/contact',
  'https://www.appifya.app/privacy',
  'https://www.appifya.app/terms',
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
