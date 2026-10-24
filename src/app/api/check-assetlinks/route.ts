import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 10;

interface AssetLinkTarget {
  namespace?: string;
  package_name?: string;
  sha256_cert_fingerprints?: string[];
}

interface AssetLinkStatement {
  relation?: string[];
  target?: AssetLinkTarget;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, packageName, fingerprint } = body;

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Sanitize domain
    let cleanDomain = domain.trim();
    if (!cleanDomain.startsWith('http://') && !cleanDomain.startsWith('https://')) {
      cleanDomain = `https://${cleanDomain}`;
    }

    let urlObj: URL;
    try {
      urlObj = new URL(cleanDomain);
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    if (urlObj.protocol !== 'https:') {
      return NextResponse.json({
        ok: false,
        error: 'Digital Asset Links must be served over HTTPS. HTTP is rejected by Android.',
        url: `${urlObj.origin}/.well-known/assetlinks.json`,
      });
    }

    const assetlinksUrl = `${urlObj.origin}/.well-known/assetlinks.json`;

    // Fetch the assetlinks.json
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    let res: Response;
    try {
      res = await fetch(assetlinksUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Google-AssetLinks-Validator/1.0)',
          Accept: 'application/json',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
    } catch (err: unknown) {
      clearTimeout(timeout);
      const isAbort = (err as Error)?.name === 'AbortError';
      return NextResponse.json({
        ok: false,
        error: isAbort
          ? 'Connection timed out while fetching assetlinks.json'
          : `Failed to connect to ${assetlinksUrl}. Ensure the domain is online and reachable.`,
        url: assetlinksUrl,
      });
    } finally {
      clearTimeout(timeout);
    }

    const contentType = res.headers.get('content-type') || '';
    const status = res.status;

    if (status !== 200) {
      return NextResponse.json({
        ok: false,
        status,
        contentType,
        error: `HTTP status ${status}. Android requires HTTP 200 OK (no 404 or redirect error).`,
        url: assetlinksUrl,
      });
    }

    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({
        ok: false,
        status,
        contentType,
        error: 'The file was found, but does not contain valid JSON content.',
        url: assetlinksUrl,
        rawContent: text.slice(0, 300),
      });
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json({
        ok: false,
        status,
        contentType,
        error: 'assetlinks.json must be a JSON array at top level (e.g. [{ relation: [...], target: {...} }]).',
        url: assetlinksUrl,
        parsed,
      });
    }

    const statements = parsed as AssetLinkStatement[];

    // Check for package name and fingerprint matches if provided
    let packageMatched = false;
    let fingerprintMatched = false;

    const normalizedFingerprint = fingerprint
      ? fingerprint.replace(/[^a-fA-F0-9]/g, '').toUpperCase()
      : null;

    for (const item of statements) {
      const target = item?.target;
      if (packageName && target?.package_name === packageName.trim()) {
        packageMatched = true;
      }
      if (normalizedFingerprint && Array.isArray(target?.sha256_cert_fingerprints)) {
        for (const fp of target.sha256_cert_fingerprints) {
          const normFp = String(fp).replace(/[^a-fA-F0-9]/g, '').toUpperCase();
          if (normFp === normalizedFingerprint) {
            fingerprintMatched = true;
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      status,
      contentType,
      isHttps: true,
      url: assetlinksUrl,
      itemsCount: statements.length,
      packageMatched: packageName ? packageMatched : undefined,
      fingerprintMatched: fingerprint ? fingerprintMatched : undefined,
      data: statements,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
