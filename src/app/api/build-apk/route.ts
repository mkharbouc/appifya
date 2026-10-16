import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';

export async function POST(req: NextRequest) {
  try {
    const { appId } = await req.json();

    const databaseId = '6ace931c00205a66e468';
    const collectionId = '6ace935d0015975c804b';

    const appDoc = await databases.getDocument(databaseId, collectionId, appId);
    if (!appDoc) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    const githubToken = process.env.GITHUB_PAT || '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';
    const githubOwner = process.env.GITHUB_OWNER || 'mkharbouc';
    const targetRepo = 'appifya-android-engine';

    // إرسال إشارة Repository Dispatch إلى GitHub Actions لبدء تجميع ملف الـ APK
    const response = await fetch(`https://api.github.com/repos/${githubOwner}/${targetRepo}/dispatches`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'build_apk',
        client_payload: {
          app_id: appId,
          app_name: appDoc.app_name || 'MyStore',
          store_url: appDoc.store_url || 'https://appifya.app',
          theme_color: appDoc.theme_color || '#6366f1',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: 'Failed to trigger build', details: errText }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Build queued in GitHub Actions' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
