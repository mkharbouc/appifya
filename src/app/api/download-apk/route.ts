import { NextRequest, NextResponse } from 'next/server';

const targetRepo = 'appifya-android-engine';

function getConfig() {
  const token = process.env.GITHUB_PAT;
  const owner = process.env.GITHUB_OWNER || 'mkharbouc';
  return token && owner ? { token, owner } : null;
}

export async function GET(req: NextRequest) {
  const searchParams = new URL(req.url).searchParams;
  const appId = searchParams.get('appId');
  const fileType = (searchParams.get('type') || 'apk').toLowerCase();

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

    // Identify target asset by requested type (.aab, .keystore/.jks, or .apk)
    let targetAsset = release.assets?.find((asset) => {
      const name = asset.name.toLowerCase();
      if (fileType === 'aab') return name.endsWith('.aab');
      if (fileType === 'keystore') return name.endsWith('.jks') || name.endsWith('.keystore') || name.includes('keystore');
      return name.endsWith('.apk');
    });

    // Fallback: If AAB was requested but not generated yet, try APK
    if (!targetAsset && fileType === 'aab') {
      targetAsset = release.assets?.find((asset) => asset.name.toLowerCase().endsWith('.apk'));
    }

    if (!targetAsset) {
      return NextResponse.json(
        { error: `Requested ${fileType.toUpperCase()} asset not found in release` },
        { status: 404 }
      );
    }

    // 2. Fetch binary from GitHub Releases Assets API
    // When Accept: application/octet-stream is sent, GitHub API returns 302 Found
    // with a Location header pointing to AWS S3 pre-signed CDN download URL.
    const assetRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${targetRepo}/releases/assets/${targetAsset.id}`,
      {
        headers: {
          Accept: 'application/octet-stream',
          Authorization: `Bearer ${config.token}`,
          'User-Agent': 'Appifya',
        },
        redirect: 'manual',
      },
    );

    // If redirected to pre-signed AWS S3 URL, redirect user directly for blazing-fast mobile download
    const redirectUrl = assetRes.headers.get('location');
    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl, { status: 302 });
    }

    if (!assetRes.ok) {
      return NextResponse.redirect(targetAsset.browser_download_url);
    }

    const contentType = targetAsset.name.endsWith('.apk')
      ? 'application/vnd.android.package-archive'
      : 'application/octet-stream';

    const safeAsciiName = targetAsset.name.replace(/[^\x20-\x7E]/g, '_');
    const encodedName = encodeURIComponent(targetAsset.name);

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${safeAsciiName}"; filename*=UTF-8''${encodedName}`);
    if (targetAsset.size) {
      headers.set('Content-Length', String(targetAsset.size));
    }
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');

    return new NextResponse(assetRes.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Download binary failed:', msg);
    return NextResponse.json({ error: 'Unable to stream download: ' + msg }, { status: 500 });
  }
}
