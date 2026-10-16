import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const databaseId = '6ace931c00205a66e468';
    const collectionId = '6ace935d0015975c804b';

    let appName = 'MyStoreApp';
    let storeUrl = 'https://appifya.app';
    let themeColor = '#6366f1';

    if (id) {
      try {
        const doc = await databases.getDocument(databaseId, collectionId, id);
        if (doc) {
          appName = doc.app_name || appName;
          storeUrl = doc.store_url || storeUrl;
          themeColor = doc.theme_color || themeColor;
        }
      } catch (e) {
        console.error('Appwrite fetch error:', e);
      }
    }

    const safeName = appName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'app';
    const packageId = `com.appifya.${safeName.toLowerCase()}`;

    // إعداد حمولة الطلب الرسمية لمحرك بناء حزم الأندرويد السحابي
    const pwaPayload = {
      packageId: packageId,
      name: appName,
      launcherName: appName.substring(0, 12),
      appVersion: '1.0.0',
      appVersionCode: 1,
      host: storeUrl,
      startUrl: storeUrl,
      themeColor: themeColor,
      navigationColor: themeColor,
      backgroundColor: '#020617',
      enableNotifications: true,
      iconUrl: 'https://appifya.app/logo.jpg.jpeg',
      maskableIconUrl: 'https://appifya.app/logo.jpg.jpeg',
      splashScreenUrl: 'https://appifya.app/logo.jpg.jpeg',
      signing: {
        file: null,
        alias: 'my-key-alias',
        storePassword: 'Password123!',
        keyPassword: 'Password123!',
      },
    };

    // استدعاء خدمة توليد APK السحابية في الخلفية
    const response = await fetch('https://pwabuilder-cloudapk.azurewebsites.net/generateAppPackage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pwaPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate APK: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': `attachment; filename="${safeName}.apk"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('APK generation error:', err);
    return new NextResponse(
      JSON.stringify({ error: err.message || 'حدث خطأ أثناء بناء وتوليد ملف APK في الخلفية' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
