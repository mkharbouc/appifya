import { NextRequest, NextResponse } from 'next/server';

const targetRepo = 'appifya-android-engine';

function getConfig() {
  const token = process.env.GITHUB_PAT || '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';
  const owner = process.env.GITHUB_OWNER || 'mkharbouc';
  return token && owner ? { token, owner } : null;
}

export async function GET(req: NextRequest) {
  const searchParams = new URL(req.url).searchParams;
  const appId = searchParams.get('appId');

  if (!appId) {
    return NextResponse.json({ error: 'appId parameter is required' }, { status: 400 });
  }

  const config = getConfig();
  if (!config) {
    return NextResponse.json({ error: 'Download service is not configured' }, { status: 503 });
  }

  try {
    // 1. Fetch releases for this app
    const releasesRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${targetRepo}/releases?per_page=50`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${config.token}`,
          'User-Agent': 'Appifya',
        },
        cache: 'no-store',
      },
    );

    if (!releasesRes.ok) {
      return NextResponse.json({ error: 'Unable to query build releases' }, { status: 502 });
    }

    const releases = (await releasesRes.json()) as Array<{
      tag_name: string;
      html_url: string;
      published_at?: string | null;
      created_at?: string;
      assets?: Array<{ id: number; name: string; size: number; browser_download_url: string }>;
    }>;

    const matchingReleases = releases
      .filter((item) => item.tag_name.startsWith(`build-${appId}-`))
      .sort((left, right) => {
        const leftTime = Date.parse(left.published_at || left.created_at || '') || 0;
        const rightTime = Date.parse(right.published_at || right.created_at || '') || 0;
        return rightTime - leftTime;
      });

    const release = matchingReleases[0];
    if (!release) {
      return NextResponse.json({ error: 'No build release found for this application' }, { status: 404 });
    }

    const apkAsset = release.assets?.find((asset) => asset.name.toLowerCase().endsWith('.apk'));
    if (!apkAsset) {
      return NextResponse.json({ error: 'APK binary asset not found in release' }, { status: 404 });
    }

    // 2. Stream APK binary directly from GitHub API using authenticated Bearer token
    const assetRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${targetRepo}/releases/assets/${apkAsset.id}`,
      {
        headers: {
          Accept: 'application/octet-stream',
          Authorization: `Bearer ${config.token}`,
          'User-Agent': 'Appifya',
        },
      },
    );

    if (!assetRes.ok) {
      // Fallback: If direct streaming fails, redirect to browser download URL
      return NextResponse.redirect(apkAsset.browser_download_url);
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.android.package-archive');
    headers.set('Content-Disposition', `attachment; filename="${apkAsset.name || 'app-release.apk'}"`);
    if (apkAsset.size) {
      headers.set('Content-Length', String(apkAsset.size));
    }
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');

    return new NextResponse(assetRes.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Download APK failed:', msg);
    return NextResponse.json({ error: 'Unable to stream APK download: ' + msg }, { status: 500 });
  }
}
