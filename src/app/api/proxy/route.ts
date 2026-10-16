import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeUrl = searchParams.get('url');
    const appName = searchParams.get('name') || 'Appifya-App';
    const themeColor = searchParams.get('theme') || '#6366f1';

    if (!storeUrl) {
      return new NextResponse('URL is required', { status: 400 });
    }

    // تنظيف اسم الملف لتجنب المحارف غير الصالحة
    const safeName = appName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'pwa-package';
    const filename = `${safeName}.zip`;

    // استدعاء خدمة بناء حزمة الـ PWA
    // (أو إنشاء ملف الـ ZIP مباشرة)
    const externalApiUrl = `https://builder.appifya.app/export?url=${encodeURIComponent(storeUrl)}&name=${encodeURIComponent(appName)}&theme=${encodeURIComponent(themeColor)}`;

    // إذا كان التوليد يعتمد على مزود خارجي أو خدمة داخلية:
    const response = await fetch(externalApiUrl).catch(() => null);

    if (response && response.ok) {
      const blob = await response.blob();
      return new NextResponse(blob, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // في حال عدم توفر الخدمة الخارجية، بناء حزمة بيانات PWA قياسية
    // (manifest.json + sw.js + index.html) كملف مضغوط أو مستند
    const manifestJson = JSON.stringify({
      name: appName,
      short_name: appName,
      start_url: storeUrl,
      display: 'standalone',
      background_color: '#0f172a',
      theme_color: themeColor,
      icons: [
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }, null, 2);

    return new NextResponse(manifestJson, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${safeName}-manifest.json"`,
      },
    });

  } catch (error: any) {
    return new NextResponse(error.message || 'Error generating download', { status: 500 });
  }
}
