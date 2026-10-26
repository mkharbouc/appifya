import crypto from 'crypto';

const TOKEN_SECRET = process.env.AUTH_SECRET || process.env.SMTP_PASS || 'appifya-secure-verification-secret-key-2026';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function generateVerificationToken(userId: string, email: string): string {
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  const payload = JSON.stringify({ userId, email, expiresAt });
  const base64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

export function verifyCustomToken(token: string): { valid: boolean; userId?: string; email?: string; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false, error: 'رمز التفعيل غير صالح' };

    const [base64Payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(base64Payload)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return { valid: false, error: 'رمز التفعيل غير موثق أو تم التلاعب به' };
    }

    const json = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const data = JSON.parse(json);

    if (Date.now() > data.expiresAt) {
      return { valid: false, error: 'انتهت صلاحية رابط التفعيل، يرجى طلب رابط جديد' };
    }

    return { valid: true, userId: data.userId, email: data.email };
  } catch {
    return { valid: false, error: 'حدث خطأ في فك تشفير رمز التفعيل' };
  }
}
