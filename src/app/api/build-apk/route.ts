import { NextRequest, NextResponse } from 'next/server';
import { databases, DB_ID, TABLE_ID } from '@/lib/appwrite';

const targetRepo = 'appifya-android-engine';

function getConfig() {
  const token = process.env.GITHUB_PAT;
  const owner = process.env.GITHUB_OWNER;
  return token && owner ? { token, owner } : null;
}

function githubHeaders(token: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Appifya',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const appId = typeof body.appId === 'string' ? body.appId : '';
    const userId = typeof body.userId === 'string' ? body.userId : '';

    if (!appId || !userId) {
      return NextResponse.json({ error: 'appId and userId are required' }, { status: 400 });
    }

    const appDoc = await databases.getDocument(DB_ID, TABLE_ID, appId);
    if (appDoc.user_id !== userId) {
      return NextResponse.json({ error: 'You do not own this app' }, { status: 403 });
    }

    const config = getConfig();
    if (!config) {
      return NextResponse.json({ error: 'APK builder is not configured' }, { status: 503 });
    }

    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${targetRepo}/dispatches`,
      {
        method: 'POST',
        headers: githubHeaders(config.token),
        body: JSON.stringify({
          event_type: 'build_apk',
          client_payload: {
            app_id: appId,
            app_name: appDoc.app_name || 'MyStore',
            store_url: appDoc.store_url || 'https://appifya.app',
            theme_color: appDoc.theme_color || '#6366f1',
          },
        }),
      },
    );

    if (!response.ok) {
      console.error('GitHub dispatch failed:', response.status);
      return NextResponse.json({ error: 'Failed to trigger build' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('APK build request failed:', error);
    return NextResponse.json({ error: 'Unable to start APK build' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const appId = new URL(req.url).searchParams.get('appId');
  if (!appId) return NextResponse.json({ error: 'appId is required' }, { status: 400 });

  const config = getConfig();
  if (!config) {
    return NextResponse.json({ error: 'APK builder is not configured' }, { status: 503 });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${targetRepo}/releases?per_page=30`,
      { headers: githubHeaders(config.token), cache: 'no-store' },
    );
    if (!response.ok) {
      console.error('GitHub releases lookup failed:', response.status);
      return NextResponse.json({ error: 'Unable to check APK status' }, { status: 502 });
    }

    const releases = (await response.json()) as Array<{
      tag_name: string;
      html_url: string;
      assets?: Array<{ name: string; browser_download_url: string }>;
    }>;
    const release = releases.find((item) => item.tag_name.startsWith(`build-${appId}-`));

    if (release) {
      const apk = release.assets?.find((asset) => asset.name.toLowerCase().endsWith('.apk'));
      return NextResponse.json({
        status: apk ? 'completed' : 'failed',
        downloadUrl: apk?.browser_download_url,
        releaseUrl: release.html_url,
      });
    }

    return NextResponse.json({ status: 'building' });
  } catch (error) {
    console.error('APK status lookup failed:', error);
    return NextResponse.json({ error: 'Unable to check APK status' }, { status: 502 });
  }
}
