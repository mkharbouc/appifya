import { NextRequest, NextResponse } from 'next/server';
import { databases, storage, DB_ID, TABLE_ID, BUCKET_ID } from '@/lib/appwrite';

const targetRepo = 'appifya-android-engine';

function getConfig() {
  const token = process.env.GITHUB_PAT || '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';
  const owner = process.env.GITHUB_OWNER || 'mkharbouc';
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

function getLogoUrl(appDoc: Record<string, unknown>): string {
  const iconId = typeof appDoc.icon_id === 'string' ? appDoc.icon_id : '';
  if (iconId && BUCKET_ID) {
    return storage.getFileView(BUCKET_ID, iconId).toString();
  }

  return 'https://www.appifya.app/logo.jpg.jpeg';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const appId = typeof body.appId === 'string' ? body.appId : '';
    const userId = typeof body.userId === 'string' ? body.userId : '';

    if (!appId) {
      return NextResponse.json({ error: 'appId is required' }, { status: 400 });
    }

    // Try fetching from Appwrite database if available, otherwise fall back to client payload
    let appDoc: Record<string, unknown> = {};
    try {
      if (DB_ID && TABLE_ID) {
        appDoc = await databases.getDocument(DB_ID, TABLE_ID, appId);
        if (appDoc.user_id && userId && appDoc.user_id !== userId) {
          return NextResponse.json({ error: 'You do not own this app' }, { status: 403 });
        }
      }
    } catch {
      // Server-side Appwrite client is guest, fallback to client-supplied details
    }

    const appName = typeof body.appName === 'string' && body.appName
      ? body.appName
      : typeof appDoc.app_name === 'string'
        ? appDoc.app_name
        : 'MyStore';

    const storeUrl = typeof body.storeUrl === 'string' && body.storeUrl
      ? body.storeUrl
      : typeof appDoc.store_url === 'string'
        ? appDoc.store_url
        : 'https://www.appifya.app';

    const themeColor = typeof body.themeColor === 'string' && body.themeColor
      ? body.themeColor
      : typeof appDoc.theme_color === 'string'
        ? appDoc.theme_color
        : '#6366f1';

    const logoUrl = typeof body.logoUrl === 'string' && body.logoUrl
      ? body.logoUrl
      : getLogoUrl(appDoc);

    const isProBuild = Boolean(body.isProBuild);
    const admobAppId = isProBuild
      ? (typeof body.admobAppId === 'string' ? body.admobAppId : typeof appDoc.admob_app_id === 'string' ? appDoc.admob_app_id : '')
      : '';
    const admobBannerUnitId = isProBuild
      ? (typeof body.admobBannerUnitId === 'string' ? body.admobBannerUnitId : typeof appDoc.admob_banner_unit_id === 'string' ? appDoc.admob_banner_unit_id : '')
      : '';
    const admobInterstitialUnitId = isProBuild
      ? (typeof body.admobInterstitialUnitId === 'string' ? body.admobInterstitialUnitId : typeof appDoc.admob_interstitial_unit_id === 'string' ? appDoc.admob_interstitial_unit_id : '')
      : '';

    const config = getConfig();
    if (!config) {
      return NextResponse.json({ error: 'APK builder is not configured' }, { status: 503 });
    }

    // GitHub repository_dispatch limits client_payload to a maximum of 10 keys
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${targetRepo}/dispatches`,
      {
        method: 'POST',
        headers: githubHeaders(config.token),
        body: JSON.stringify({
          event_type: 'build_apk',
          client_payload: {
            app_id: appId,
            app_name: appName,
            store_url: storeUrl,
            theme_color: themeColor,
            logo_url: logoUrl,
            package_type: isProBuild ? 'aab_bundle' : 'apk_direct',
            admob_app_id: admobAppId,
            admob_banner_unit_id: admobBannerUnitId,
            admob_interstitial_unit_id: admobInterstitialUnitId,
          },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('GitHub dispatch failed:', response.status, errText);
      return NextResponse.json({ error: `Failed to trigger build on cloud runner (${response.status})` }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: 'Build started' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('APK build request failed:', msg);
    return NextResponse.json({ error: 'Unable to start APK build: ' + msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const searchParams = new URL(req.url).searchParams;
  const appId = searchParams.get('appId');
  const startedAtValue = searchParams.get('startedAt');
  const startedAt = startedAtValue ? Date.parse(startedAtValue) : NaN;
  if (!appId) return NextResponse.json({ error: 'appId is required' }, { status: 400 });

  const config = getConfig();
  if (!config) {
    return NextResponse.json({ error: 'APK builder is not configured' }, { status: 503 });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${targetRepo}/releases?per_page=50`,
      { headers: githubHeaders(config.token), cache: 'no-store' },
    );
    if (!response.ok) {
      console.error('GitHub releases lookup failed:', response.status);
      return NextResponse.json({ error: 'Unable to check APK status' }, { status: 502 });
    }

    const releases = (await response.json()) as Array<{
      tag_name: string;
      html_url: string;
      published_at?: string | null;
      created_at?: string;
      assets?: Array<{ name: string; browser_download_url: string }>;
    }>;
    const matchingReleases = releases
      .filter((item) => item.tag_name.startsWith(`build-${appId}-`))
      .sort((left, right) => {
        const leftTime = Date.parse(left.published_at || left.created_at || '') || 0;
        const rightTime = Date.parse(right.published_at || right.created_at || '') || 0;
        return rightTime - leftTime;
      });
    const release = matchingReleases[0];

    if (release) {
      const releaseTime = Date.parse(release.published_at || release.created_at || '');
      if (Number.isFinite(startedAt) && Number.isFinite(releaseTime) && releaseTime < startedAt) {
        return NextResponse.json({ status: 'building' });
      }

      const apk = release.assets?.find((asset) => asset.name.toLowerCase().endsWith('.apk'));
      return NextResponse.json({
        status: apk ? 'completed' : 'failed',
        downloadUrl: apk ? `/api/download-apk?appId=${appId}` : undefined,
        rawDownloadUrl: apk?.browser_download_url,
        releaseUrl: release.html_url,
      });
    }

    if (Number.isFinite(startedAt)) {
      return NextResponse.json({ status: 'building' });
    }

    return NextResponse.json({ status: 'idle' });
  } catch (error) {
    console.error('APK status lookup failed:', error);
    return NextResponse.json({ error: 'Unable to check APK status' }, { status: 502 });
  }
}
