import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const DEFAULT_DESTINATION = 'mohamedkharbouch.km@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message, subject } = body;

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name is required (at least 2 characters)' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json(
        { error: 'Message is required (at least 5 characters)' },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();
    const destinationEmail =
      process.env.CONTACT_DESTINATION_EMAIL ||
      process.env.SMTP_USER ||
      DEFAULT_DESTINATION;
    const emailSubject = subject?.trim() || `📬 رسالة جديدة من صفحة اتصل بنا: ${cleanName}`;

    // HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 24px; text-align: center; color: #ffffff; }
          .content { padding: 24px; line-height: 1.6; }
          .field { margin-bottom: 16px; }
          .label { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
          .value { font-size: 15px; color: #ffffff; font-weight: 500; }
          .message-box { background: #0f172a; border-radius: 12px; border: 1px solid #334155; padding: 16px; white-space: pre-wrap; font-size: 14px; color: #e2e8f0; margin-top: 8px; line-height: 1.7; }
          .footer { padding: 16px 24px; background: #0f172a; border-top: 1px solid #334155; font-size: 12px; color: #64748b; text-align: center; }
          .reply-btn { display: inline-block; background: #6366f1; color: #ffffff !important; padding: 10px 22px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; font-size: 20px;">رسالة جديدة من زائر عبر موقع Appifya</h2>
            <p style="margin: 6px 0 0; opacity: 0.9; font-size: 13px;">نموذج التواصل الرسمي - ${destinationEmail}</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">اسم المرسل</div>
              <div class="value">${cleanName}</div>
            </div>
            <div class="field">
              <div class="label">البريد الإلكتروني للمرسل</div>
              <div class="value"><a href="mailto:${cleanEmail}" style="color: #818cf8;">${cleanEmail}</a></div>
            </div>
            <div class="field">
              <div class="label">تاريخ ووقت الإرسال</div>
              <div class="value" dir="ltr" style="text-align: right;">${new Date().toLocaleString('ar-EG')}</div>
            </div>
            <div class="field">
              <div class="label">نص الرسالة</div>
              <div class="message-box">${cleanMessage}</div>
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="mailto:${cleanEmail}?subject=رد بخصوص استفسارك على Appifya" class="reply-btn">الرد على المرسل مباشرة</a>
            </div>
          </div>
          <div class="footer">
            تم استلام هذه الرسالة تلقائياً عبر صفحة اتصل بنا في منصة Appifya.
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
رسالة جديدة من صفحة اتصل بنا - Appifya
==========================================
اسم المرسل: ${cleanName}
البريد الإلكتروني: ${cleanEmail}
التاريخ: ${new Date().toISOString()}

نص الرسالة:
${cleanMessage}
==========================================
الرد المباشر: mailto:${cleanEmail}
    `;

    // 2. Delivery Strategy A: SMTP (Nodemailer)
    const smtpUser = process.env.SMTP_USER?.trim() || 'mohamedkharbouch.km@gmail.com';
    const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, '') || 'zopgvvvizsyaiidt';
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;

    if (smtpUser && smtpPass) {
      const isGmail = smtpHost.includes('gmail');
      const transporter = nodemailer.createTransport(
        isGmail
          ? {
              service: 'gmail',
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            }
          : {
              host: smtpHost,
              port: smtpPort,
              secure: smtpPort === 465,
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            }
      );

      await transporter.sendMail({
        from: `"Appifya Support" <${process.env.SMTP_FROM || smtpUser}>`,
        to: destinationEmail,
        replyTo: `"${cleanName}" <${cleanEmail}>`,
        subject: emailSubject,
        text: textContent,
        html: htmlContent,
      });

      return NextResponse.json({
        success: true,
        method: 'smtp',
        message: 'تم إرسال رسالتك بنجاح وسنتواصل معك قريباً.',
      });
    }

    // 3. Delivery Strategy B: Resend API
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Appifya Support <onboarding@resend.dev>',
          to: [destinationEmail],
          reply_to: cleanEmail,
          subject: emailSubject,
          text: textContent,
          html: htmlContent,
        }),
      });

      if (!resendRes.ok) {
        const errorData = await resendRes.json();
        throw new Error(errorData.message || 'Failed to send via Resend');
      }

      return NextResponse.json({
        success: true,
        method: 'resend',
        message: 'تم إرسال رسالتك بنجاح وسنتواصل معك قريباً.',
      });
    }

    // 4. Delivery Strategy C: Web3Forms API
    const web3Key = process.env.WEB3FORMS_ACCESS_KEY;
    if (web3Key) {
      const web3Res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: web3Key,
          name: cleanName,
          email: cleanEmail,
          message: cleanMessage,
          subject: emailSubject,
          from_name: 'Appifya Contact Form',
        }),
      });

      if (web3Res.ok) {
        return NextResponse.json({
          success: true,
          method: 'web3forms',
          message: 'تم إرسال رسالتك بنجاح وسنتواصل معك قريباً.',
        });
      }
    }

    // 5. If no email provider is configured yet on server:
    // Log message securely in server console
    console.warn('[Contact Form - Pending Server SMTP Setup]');
    console.warn(`From: ${cleanName} <${cleanEmail}>`);
    console.warn(`Message: ${cleanMessage}`);

    // Generate pre-filled mailto link so user can dispatch immediately
    const mailtoSubject = encodeURIComponent(`استفسار من: ${cleanName} - Appifya`);
    const mailtoBody = encodeURIComponent(
      `مرحباً فريق Appifya،\n\n${cleanMessage}\n\n---\nالمرسل: ${cleanName}\nالبريد: ${cleanEmail}`
    );
    const mailtoLink = `mailto:${destinationEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

    return NextResponse.json(
      {
        success: false,
        notConfigured: true,
        fallbackMailto: mailtoLink,
        destinationEmail,
        message:
          'لم يتم إعداد خادم إرسال البريد (SMTP) على السيرفر بعد. يمكنك إرسال رسالتك بنقرة واحدة عبر تطبيق البريد الخاص بك.',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
