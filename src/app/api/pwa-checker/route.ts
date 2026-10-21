import { NextRequest, NextResponse } from 'next/server';

// Cap at 10 seconds so the client doesn't wait forever
export const maxDuration = 10;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CheckResult {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warn' | 'blocked';
  detail: string;
  fix?: string;
}

export interface CheckResponse {
  url: string;
  score: number;        // 0–100
  checks: CheckResult[];
  fetchedOk: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function firstMatch(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1] ?? m[0];
  }
  return null;
}

function hasPattern(html: string, patterns: RegExp[]): boolean {
  return patterns.some((re) => re.test(html));
}

// ---------------------------------------------------------------------------
// Individual checks — all operate on the raw HTML string + final URL
// ---------------------------------------------------------------------------
function checkHttps(finalUrl: string): CheckResult {
  const pass = finalUrl.startsWith('https://');
  return {
    id: 'https',
    label: 'HTTPS',
    status: pass ? 'pass' : 'fail',
    detail: pass
      ? 'Site is served over HTTPS.'
      : 'Site is not served over HTTPS. PWAs require a secure context.',
    fix: pass ? undefined : 'Configure an SSL certificate on your server or use a CDN like Cloudflare to add HTTPS.',
  };
}

function checkManifest(html: string): CheckResult {
  const manifestHref = firstMatch(html, [
    /<link[^>]+rel=["']manifest["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']manifest["']/i,
  ]);
  if (manifestHref) {
    return {
      id: 'manifest',
      label: 'Web App Manifest',
      status: 'pass',
      detail: `Manifest linked: ${manifestHref}`,
    };
  }
  return {
    id: 'manifest',
    label: 'Web App Manifest',
    status: 'fail',
    detail: 'No <link rel="manifest"> found in the page <head>.',
    fix: 'Create a manifest.json and add <link rel="manifest" href="/manifest.json"> to your HTML <head>. Use the free Manifest Generator to build one.',
  };
}

function checkServiceWorker(html: string): CheckResult {
  const found = hasPattern(html, [
    /serviceWorker\.register\s*\(/i,
    /navigator\.serviceWorker/i,
  ]);
  if (found) {
    return {
      id: 'service-worker',
      label: 'Service Worker',
      status: 'pass',
      detail: 'Service worker registration detected in page source.',
    };
  }
  return {
    id: 'service-worker',
    label: 'Service Worker',
    status: 'warn',
    detail: 'No serviceWorker.register() call found in the page HTML. It may be registered in a separate JS file.',
    fix: 'Register a service worker in your main script: navigator.serviceWorker.register(\'/sw.js\'). Appifya generates one automatically.',
  };
}

function checkViewport(html: string): CheckResult {
  const found = hasPattern(html, [
    /<meta[^>]+name=["']viewport["'][^>]*content/i,
    /<meta[^>]+content[^>]+name=["']viewport["']/i,
  ]);
  return {
    id: 'viewport',
    label: 'Viewport Meta Tag',
    status: found ? 'pass' : 'fail',
    detail: found
      ? 'Viewport meta tag is present.'
      : 'No viewport meta tag found.',
    fix: found ? undefined : 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your HTML <head>.',
  };
}

function checkThemeColor(html: string): CheckResult {
  const value = firstMatch(html, [
    /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i,
  ]);
  if (value) {
    return {
      id: 'theme-color',
      label: 'Theme Color',
      status: 'pass',
      detail: `theme-color is set to ${value}.`,
    };
  }
  return {
    id: 'theme-color',
    label: 'Theme Color',
    status: 'warn',
    detail: 'No <meta name="theme-color"> found.',
    fix: 'Add <meta name="theme-color" content="#your-color"> to your <head> to colour the browser toolbar when installed.',
  };
}

function checkAppleTouchIcon(html: string): CheckResult {
  const found = hasPattern(html, [
    /<link[^>]+rel=["']apple-touch-icon["']/i,
  ]);
  return {
    id: 'apple-touch-icon',
    label: 'Apple Touch Icon',
    status: found ? 'pass' : 'warn',
    detail: found
      ? 'Apple touch icon is linked.'
      : 'No apple-touch-icon link found. iOS users will see a screenshot instead of an icon.',
    fix: found ? undefined : 'Add <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"> to your <head>. Use the free Icon Generator to create the image.',
  };
}

function checkFavicon(html: string, baseUrl: string): CheckResult {
  const explicit = hasPattern(html, [
    /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*href/i,
  ]);
  if (explicit) {
    return { id: 'favicon', label: 'Favicon', status: 'pass', detail: 'Favicon link found in page head.' };
  }
  // Browsers auto-fetch /favicon.ico — note that as a pass (we can't check it server-side easily)
  const origin = new URL(baseUrl).origin;
  return {
    id: 'favicon',
    label: 'Favicon',
    status: 'warn',
    detail: `No explicit favicon <link> found. Browsers will try ${origin}/favicon.ico automatically.`,
    fix: 'Add <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png"> to your <head> for explicit control.',
  };
}

function checkCharset(html: string): CheckResult {
  const found = hasPattern(html, [
    /<meta[^>]+charset/i,
    /<meta[^>]+http-equiv=["']content-type["']/i,
  ]);
  return {
    id: 'charset',
    label: 'Character Encoding',
    status: found ? 'pass' : 'warn',
    detail: found ? 'Character encoding declaration found.' : 'No charset meta tag found.',
    fix: found ? undefined : 'Add <meta charset="utf-8"> as the first element inside <head>.',
  };
}

// ---------------------------------------------------------------------------
// Score — passes count fully, warns count half, fails and blocked count zero
// ---------------------------------------------------------------------------
function calcScore(checks: CheckResult[]): number {
  const total = checks.length * 2;
  const earned = checks.reduce((sum, c) => {
    if (c.status === 'pass') return sum + 2;
    if (c.status === 'warn') return sum + 1;
    return sum;
  }, 0);
  return Math.round((earned / total) * 100);
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest): Promise<NextResponse<CheckResponse>> {
  const raw = req.nextUrl.searchParams.get('url') ?? '';

  // Normalise — prepend https:// if the user omitted the scheme
  let urlStr = raw.trim();
  if (urlStr && !/^https?:\/\//i.test(urlStr)) urlStr = 'https://' + urlStr;

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return NextResponse.json(
      { url: raw, score: 0, checks: [], fetchedOk: false, error: 'Invalid URL.' },
      { status: 400 },
    );
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json(
      { url: raw, score: 0, checks: [], fetchedOk: false, error: 'Only HTTP and HTTPS URLs are supported.' },
      { status: 400 },
    );
  }

  // Block requests to private/local addresses
  const hostname = parsed.hostname;
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local')
  ) {
    return NextResponse.json(
      { url: raw, score: 0, checks: [], fetchedOk: false, error: 'Private or local addresses are not supported.' },
      { status: 400 },
    );
  }

  // Fetch the page
  let html = '';
  let finalUrl = urlStr;
  let fetchedOk = false;

  try {
    const res = await fetch(urlStr, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AppifyaBot/1.0; +https://appifya.app)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en,ar;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(7000),
    });

    finalUrl = res.url || urlStr;

    if (!res.ok) {
      return NextResponse.json({
        url: urlStr,
        score: 0,
        checks: [],
        fetchedOk: false,
        error: `Server responded with HTTP ${res.status}. The site may be blocking automated requests.`,
      });
    }

    // Read at most 512 KB — enough for any <head> content
    const reader = res.body?.getReader();
    if (reader) {
      let received = 0;
      const chunks: Uint8Array[] = [];
      while (received < 512 * 1024) {
        const { done, value } = await reader.read();
        if (done || !value) break;
        chunks.push(value);
        received += value.length;
      }
      reader.cancel();
      const decoder = new TextDecoder();
      html = chunks.map((c) => decoder.decode(c, { stream: true })).join('');
    }

    fetchedOk = true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      url: urlStr,
      score: 0,
      checks: [],
      fetchedOk: false,
      error: `Could not reach the site: ${msg}. It may block external requests or be offline.`,
    });
  }

  // Run all checks
  const checks: CheckResult[] = [
    checkHttps(finalUrl),
    checkManifest(html),
    checkServiceWorker(html),
    checkViewport(html),
    checkThemeColor(html),
    checkAppleTouchIcon(html),
    checkFavicon(html, finalUrl),
    checkCharset(html),
  ];

  return NextResponse.json({
    url: finalUrl,
    score: calcScore(checks),
    checks,
    fetchedOk,
  });
}
