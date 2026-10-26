import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { isDisposableEmail } from '@/lib/disposableEmail';
import { generateVerificationToken } from '@/lib/auth-tokens';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, userId, name } = body;

    if (!email || typeof email !== 'string' || !userId) {
      return NextResponse.json({ error: 'البريد الإلكتروني ومعرف المستخدم مطلوبان' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (isDisposableEmail(cleanEmail)) {
      return NextResponse.json({ error: 'لا يُسمح باستخدام البريد المؤقت أو الوهمي' }, { status: 400 });
    }

    const cleanName = typeof name === 'string' && name.trim() ? name.trim() : 'مستخدم Appifya';

    // Generate secure token
    const token = generateVerificationToken(userId, cleanEmail);

    // Determine verification URL
    const origin = req.nextUrl.origin || 'https://appifya.app';
    const verifyUrl = `${origin}/verify-email?token=${token}&userId=${encodeURIComponent(userId)}`;

    // Nodemailer configuration
    const smtpUser = process.env.SMTP_USER?.trim() || 'mohamedkharbouch.km@gmail.com';
    const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, '') || 'zopgvvvizsyaiidt';
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #f8fafc; padding: 24px 12px; margin: 0; direction: rtl; }
          .container { max-width: 560px; margin: 0 auto; background: #131c31; border-radius: 24px; border: 1px solid #233354; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%); padding: 36px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .header p { margin: 8px 0 0; opacity: 0.9; font-size: 13px; }
          .content { padding: 32px 24px; line-height: 1.8; text-align: right; }
          .greeting { font-size: 16px; font-weight: bold; color: #ffffff; margin-bottom: 12px; }
          .desc { font-size: 14px; color: #cbd5e1; margin-bottom: 24px; }
          .action-box { text-align: center; margin: 32px 0; }
          .verify-btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: #ffffff !important; padding: 14px 36px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 15px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); }
          .link-box { background: #0b1120; border-radius: 12px; border: 1px solid #1e293b; padding: 14px; margin-top: 24px; font-size: 12px; color: #94a3b8; word-break: break-all; text-align: left; direction: ltr; }
          .security-note { margin-top: 24px; padding: 14px; background: rgba(99, 102, 241, 0.08); border-right: 3px solid #6366f1; border-radius: 8px; font-size: 12px; color: #94a3b8; }
          .footer { padding: 20px; background: #0b1120; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>منصة Appifya</h1>
            <p>تأكيد تفعيل بريدك الإلكتروني رسميـاً</p>
          </div>
          <div class="content">
            <div class="greeting">مرحباً بك، ${cleanName} 👋</div>
            <div class="desc">
              سعداء بانضمامك إلى منصة Appifya! لتأكيد ملكيتك لهذا البريد الإلكتروني وتفعيل حسابك بالكامل (التحقق الأخضر ✅)، يرجى الضغط على زر التفعيل أدناه:
            </div>
            
            <div class="action-box">
              <a href="${verifyUrl}" class="verify-btn" target="_blank">
                تأكيد بريدي الإلكتروني وتفعيل الحساب 🚀
              </a>
            </div>

            <div class="security-note">
              🔒 <strong>ملاحظة أمنية:</strong> هذا الرابط صالح لمدة 24 ساعة فقط ومخصص لتفعيل حسابك المرتبط بالبريد <strong>${cleanEmail}</strong>. إذا لم تكن أنت من أنشأ هذا الحساب، يمكنك تجاهل هذه الرسالة بأمان.
            </div>

            <p style="font-size: 12px; color: #64748b; margin-top: 20px; text-align: center;">
              إذا لم يعمل الزر أعلاه، يمكنك نسخ الرابط التالي ولصقه في المتصفح مباشرة:
            </p>
            <div class="link-box">
              ${verifyUrl}
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Appifya Platform · جميع الحقوق محفوظة
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
مرحباً بك في Appifya، ${cleanName}!

لتأكيد بريدك الإلكتروني وتفعيل حسابك، يرجى فتح الرابط التالي:
${verifyUrl}

هذا الرابط صالح لمدة 24 ساعة.
فريق Appifya
    `;

    await transporter.sendMail({
      from: `"Appifya" <${smtpUser}>`,
      to: cleanEmail,
      subject: `تأكيد تفعيل بريدك الإلكتروني في منصة Appifya ✅`,
      text: textContent,
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رسالة التفعيل بنجاح عبر خادم البريد المباشر (Gmail SMTP)!',
    });
  } catch (err: unknown) {
    console.error('Error sending custom verification email:', err);
    const msg = err instanceof Error ? err.message : 'فشل إرسال رسالة التفعيل عبر البريد';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
