import { NextResponse } from 'next/server';
import { databases, storage, DB_ID, TABLE_ID, BUCKET_ID } from '../../../lib/appwrite';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const doc = await databases.getDocument(DB_ID, TABLE_ID, id);
    let iconUrl = '/favicon.ico';

    if (doc.icon_id) {
      iconUrl = storage.getFileView(BUCKET_ID, doc.icon_id).toString();
    }

    const manifest = {
      name: doc.app_name,
      short_name: doc.app_name,
      description: `تطبيق متجر ${doc.app_name}`,
      start_url: `/app/${id}`,
      scope: `/app/${id}`,
      display: 'standalone',
      background_color: doc.theme_color || '#020617',
      theme_color: doc.theme_color || '#020617',
      icons: [
        {
          src: iconUrl,
          sizes: '192x192 512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    };

    return NextResponse.json(manifest);
  } catch (error) {
    return NextResponse.json({ error: 'App not found' }, { status: 404 });
  }
}