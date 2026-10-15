import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('URL is required', { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      },
    });

    const contentType = res.headers.get('content-type') || 'text/html';
    let html = await res.text();

    // إضافة وسم base لضمان تحميل الصور وملفات الـ CSS بروابطها الأصلية
    const baseTag = `<base href="${targetUrl}">`;
    html = html.replace(/<head[^>]*>/i, `$&${baseTag}`);

    // إرجاع المحتوى بدون ترويسات الحظر (X-Frame-Options / CSP)
    const response = new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
      },
    });

    response.headers.delete('x-frame-options');
    response.headers.delete('content-security-policy');

    return response;
  } catch (err: any) {
    return new NextResponse(`Failed to fetch site: ${err.message}`, { status: 500 });
  }
}
