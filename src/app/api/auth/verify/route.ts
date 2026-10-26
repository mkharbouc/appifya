import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomToken } from '@/lib/auth-tokens';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, userId } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'رمز التفعيل مفقود' }, { status: 400 });
    }

    const verification = verifyCustomToken(token);
    if (!verification.valid || !verification.userId) {
      return NextResponse.json({ error: verification.error || 'رمز التفعيل غير صالح أو منتهي الصلاحية' }, { status: 400 });
    }

    const targetUserId = userId || verification.userId;
    if (targetUserId !== verification.userId) {
      return NextResponse.json({ error: 'معرف المستخدم غير متطابق مع رمز التفعيل' }, { status: 400 });
    }

    // If APPWRITE_API_KEY is configured, update Appwrite server-side directly to turn the badge GREEN!
    const apiKey = process.env.APPWRITE_API_KEY;
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6ace9263003199cf4b6f';

    let appwriteServerUpdated = false;

    if (apiKey) {
      try {
        const appwriteRes = await fetch(`${endpoint}/users/${targetUserId}/verification`, {
          method: 'PATCH',
          headers: {
            'X-Appwrite-Project': projectId,
            'X-Appwrite-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emailVerification: true }),
        });

        if (appwriteRes.ok) {
          appwriteServerUpdated = true;
        } else {
          const errText = await appwriteRes.text();
          console.warn('Appwrite server update verification warning:', errText);
        }
      } catch (appwriteErr) {
        console.warn('Failed to call Appwrite server API:', appwriteErr);
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      email: verification.email,
      appwriteServerUpdated,
      message: 'تم تفعيل بريدك الإلكتروني بنجاح! أصبح حسابك الآن موثقاً بالكامل.',
    });
  } catch (err: unknown) {
    console.error('Error verifying token:', err);
    const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة التفعيل';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
