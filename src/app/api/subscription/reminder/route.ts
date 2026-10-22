import { NextRequest, NextResponse } from 'next/server';
import { PAYPAL_EMAIL, SUBSCRIPTION_PRICE_USD } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, daysRemaining, userName } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const isUrgent = Number(daysRemaining) <= 3;
    const subject = isUrgent
      ? `🚨 تنبيه عاجل: بقي ${daysRemaining} أيام فقط على انتهاء اشتراك AdMob Pro - Appifya`
      : `⚠️ تذكير: بقي أسبوع (${daysRemaining} أيام) على انتهاء اشتراكك في إعلانات AdMob - Appifya`;

    // In production, integrate with Resend, SendGrid, or Nodemailer SMTP.
    // For now, generate the notification payload and log securely:
    console.log(`[Subscription Notification] Sending reminder to ${email} (${daysRemaining} days left)`);

    const reminderPayload = {
      to: email,
      subject,
      recipientName: userName || email.split('@')[0],
      daysRemaining,
      isUrgent,
      renewalPrice: `$${SUBSCRIPTION_PRICE_USD}/month`,
      paypalAccount: PAYPAL_EMAIL,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Reminder notification recorded',
      details: reminderPayload,
    });
  } catch (error) {
    console.error('Failed to process reminder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
