import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const databaseId = '6ace931c00205a66e468';
    const collectionId = '6ace935d0015975c804b';

    let targetUrl = 'https://appifya.app';

    if (id) {
      try {
        const doc = await databases.getDocument(databaseId, collectionId, id);
        if (doc && doc.store_url) {
          targetUrl = doc.store_url;
        }
      } catch (e) {
        console.error('Appwrite fetch error:', e);
      }
    }

    const cloudBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(targetUrl)}`;

    return NextResponse.redirect(cloudBuilderUrl);
  } catch (err: any) {
    return new NextResponse('حدث خطأ أثناء التوجيه لمحرك البناء', { status: 500 });
  }
}
