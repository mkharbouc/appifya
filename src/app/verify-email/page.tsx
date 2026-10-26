'use client';

import React, { Suspense, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { account } from '@/lib/appwrite';
import { useAuth } from '@/context/AuthContext';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  ArrowRight,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');
  const token = searchParams.get('token');

  const { user, sendVerificationEmail, refreshUser } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>(
    (userId && secret) || token ? 'verifying' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  const verificationAttempted = useRef(false);

  useEffect(() => {
    if ((!userId || !secret) && !token) return;
    if (verificationAttempted.current) return;
    verificationAttempted.current = true;

    async function verify() {
      setStatus('verifying');
      try {
        if (token) {
          // Direct verification via server API
          const res = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, userId }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'فشل التحقق من الرابط');
          }
        } else if (userId && secret) {
          // Standard Appwrite verification token
          await account.updateVerification(userId, secret);
        }

        setStatus('success');
        await refreshUser();
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // confetti optional
        }
      } catch (err: unknown) {
        setStatus('error');
        const message = err instanceof Error ? err.message : 'حدث خطأ أثناء محاولة تفعيل الحساب';
        if (message.toLowerCase().includes('already') || message.includes('verified')) {
          setErrorMessage('هذا الحساب تم تفعيله مسبقاً بنجاح.');
        } else {
          setErrorMessage(message);
        }
      }
    }

    void verify();
  }, [userId, secret, token, refreshUser]);

  const handleResend = async () => {
    setResendLoading(true);
    setResendFeedback(null);
    try {
      const res = await sendVerificationEmail();
      setResendFeedback(res.message);
    } catch {
      setResendFeedback('فشل إرسال الرابط، يرجى المحاولة بعد قليل.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-indigo-500/10 text-center">
        {/* Verifying state */}
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-white">جاري تفعيل بريدك الإلكتروني...</h1>
            <p className="text-sm text-slate-400">
              يرجى الانتظار بضع ثوانٍ حتى يتم اعتماد التفعيل في النظام.
            </p>
          </div>
        )}

        {/* Success state */}
        {status === 'success' && (
          <div className="space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-in zoom-in duration-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                تم تفعيل بريدك الإلكتروني بنجاح! 🎉
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                أصبح حسابك الآن موثقاً بالكامل (باللون الأخضر). يمكنك الآن الاستفادة من جميع مزايا تصدير التطبيقات وبناء APK بدون أي قيود.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all"
              >
                <span>الانتقال للوحة التحكم</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl transition-all"
              >
                الصفحة الرئيسية
              </Link>
            </div>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white mb-2">تعذر تفعيل الرابط</h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                {errorMessage || 'قد يكون رابط التفعيل منتهي الصلاحية أو تم استخدامه من قبل.'}
              </p>
            </div>

            {user ? (
              <div className="pt-2">
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all disabled:opacity-50"
                >
                  {resendLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>إرسال رابط تفعيل جديد إلى بريدي</span>
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-all"
                >
                  تسجيل الدخول وطلب رابط جديد
                </Link>
              </div>
            )}

            {resendFeedback && (
              <div className="p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-indigo-300 text-xs">
                {resendFeedback}
              </div>
            )}
          </div>
        )}

        {/* Idle state: visited directly without token */}
        {status === 'idle' && (
          <div className="space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Mail className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white mb-2">تأكيد البريد الإلكتروني</h1>
              {user ? (
                user.emailVerification ? (
                  <div className="space-y-3">
                    <p className="text-sm text-emerald-400 flex items-center justify-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span>بريدك الإلكتروني ({user.email}) مفعل ومؤكد بالفعل!</span>
                    </p>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all"
                    >
                      <span>الانتقال للوحة التحكم</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-300">
                      بريدك الإلكتروني <span className="font-mono text-indigo-300 font-bold">{user.email}</span> غير مفعّل بعد.
                    </p>
                    <p className="text-xs text-slate-400">
                      اضغط على الزر أدناه لإرسال رابط تفعيل رسمي إلى بريدك ليصبح حسابك موثقاً باللون الأخضر.
                    </p>
                    <button
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all disabled:opacity-50"
                    >
                      {resendLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span>إرسال رابط التفعيل الآن</span>
                    </button>
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">
                    يرجى النقر على الرابط الذي وصلك عبر البريد الإلكتروني لإتمام التفعيل، أو تسجيل الدخول لإعادة إرسال الرابط.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-all"
                  >
                    الصفحة الرئيسية
                  </Link>
                </div>
              )}
            </div>

            {resendFeedback && (
              <div className="p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-indigo-300 text-xs">
                {resendFeedback}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span>جاري التحميل...</span>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
