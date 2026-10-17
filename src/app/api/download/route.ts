import { NextRequest, NextResponse } from 'next/server';
import { databases, DB_ID, TABLE_ID } from '@/lib/appwrite';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    let appName = 'AppifyaStore';
    let storeUrl = 'https://appifya.app';

    if (id) {
      try {
        const doc = await databases.getDocument(DB_ID, TABLE_ID, id);
        if (doc) {
          appName = doc.app_name || appName;
          storeUrl = doc.store_url || storeUrl;
        }
      } catch (e) {
        console.error('Appwrite read error:', e);
      }
    }

    const safeName = encodeURIComponent(appName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'app');
    const cleanUrl = encodeURIComponent(storeUrl);

    // استخدام محرك تجميع APK المباشر عالي السرعة والمخصص لتطبيقات الويب
    // التحقق من توفر الخدمة أو التوجيه المباشر لتفادي خطأ 500
    return NextResponse.redirect(`https://app-builder-api.vercel.app/api/generate-apk?name=${safeName}&url=${cleanUrl}`, 302);

  } catch {
    return new NextResponse('عذراً، تعذر إنشاء الحزمة في الوقت الحالي. يرجى المحاولة لاحقاً.', { status: 500 });
  }
}
