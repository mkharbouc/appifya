import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم (userId) مطلوب' }, { status: 400 });
    }

    const apiKey = process.env.APPWRITE_API_KEY;
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6ace9263003199cf4b6f';

    if (!apiKey) {
      return NextResponse.json({ error: 'مفتاح APPWRITE_API_KEY غير موجود في الخادم' }, { status: 500 });
    }

    const res = await fetch(`${endpoint}/users/${userId}/verification`, {
      method: 'PATCH',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailVerification: true }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const updatedUser = await res.json();
    return NextResponse.json({
      success: true,
      message: `تم تفعيل الحساب بنجاح (${updatedUser.email}) وتحويله للأخضر في Appwrite!`,
      user: updatedUser,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
