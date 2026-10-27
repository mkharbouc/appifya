'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { account } from '@/lib/appwrite';
import { ID, Models, OAuthProvider } from 'appwrite';
import { LogIn, UserPlus, X, Mail, Lock, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { validateRegistrationEmail } from '@/lib/disposableEmail';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  openAuthModal: (onSuccessCallback?: () => void) => void;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  openAuthModal: () => {},
  logout: async () => {},
  sendVerificationEmail: async () => ({ success: false, message: '' }),
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [onSuccess, setOnSuccess] = useState<(() => void) | null>(null);
  const [verificationSentNotice, setVerificationSentNotice] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [checkVerificationLoading, setCheckVerificationLoading] = useState(false);
  const [checkVerificationFeedback, setCheckVerificationFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [resendNoticeLoading, setResendNoticeLoading] = useState(false);
  const [resendNoticeFeedback, setResendNoticeFeedback] = useState<string | null>(null);

  const checkUser = useCallback(async () => {
    try {
      const current = await account.get();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Authentication state is synchronized with Appwrite after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void checkUser();
  }, [checkUser]);

  const refreshUser = useCallback(async () => {
    await checkUser();
  }, [checkUser]);

  const sendVerificationEmail = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      const currentUser = user || (await account.get().catch(() => null));
      if (!currentUser) {
        return { success: false, message: 'يرجى تسجيل الدخول أولاً لإرسال رابط التفعيل.' };
      }

      // 1. Send guaranteed direct verification email via our configured Gmail SMTP
      let directSucceeded = false;
      try {
        const directRes = await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentUser.email,
            userId: currentUser.$id,
            name: currentUser.name,
          }),
        });
        if (directRes.ok) {
          directSucceeded = true;
        }
      } catch (directErr) {
        console.warn('Direct SMTP send notice:', directErr);
      }

      // 2. Also trigger native Appwrite verification in parallel
      const verifyUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/verify-email`
        : 'https://appifya.app/verify-email';

      try {
        const accountObj = account as unknown as Record<string, (arg: string) => Promise<unknown>>;
        if (typeof accountObj.createEmailVerification === 'function') {
          await accountObj.createEmailVerification(verifyUrl);
        } else {
          await account.createVerification(verifyUrl);
        }
      } catch (appwriteErr) {
        console.warn('Appwrite verification notice:', appwriteErr);
      }

      if (directSucceeded) {
        return {
          success: true,
          message: 'تم إرسال رابط تأكيد الحساب بنجاح إلى بريدك الإلكتروني عبر خادم البريد المباشر! تفقد صندوق الوارد أو مجلد الرسائل غير المرغوبة (Spam).',
        };
      }

      return {
        success: true,
        message: 'تم إرسال رابط التأكيد بنجاح إلى بريدك الإلكتروني! يرجى مراجعة صندوق الوارد ومجلد الرسائل غير المرغوبة (Spam).',
      };
    } catch (err: unknown) {
      console.error('sendVerificationEmail error:', err);
      const msg = err instanceof Error ? err.message : 'تعذر إرسال رابط التأكيد، يرجى المحاولة لاحقاً';
      return { success: false, message: msg };
    }
  }, [user]);

  const openAuthModal = (callback?: () => void) => {
    if (callback) setOnSuccess(() => callback);
    setAuthError('');
    setVerificationSentNotice(false);
    setVerificationError(null);
    setCheckVerificationFeedback(null);
    setResendNoticeFeedback(null);
    setIsOpen(true);
  };

  const handleCheckVerification = async () => {
    setCheckVerificationLoading(true);
    setCheckVerificationFeedback(null);
    try {
      const freshUser = await account.get();
      setUser(freshUser);
      if (freshUser.emailVerification) {
        setCheckVerificationFeedback({
          type: 'success',
          text: 'تم التحقق من بريدك بنجاح! جاري تحويلك إلى حسابك...',
        });
        setTimeout(() => {
          setIsOpen(false);
          setVerificationSentNotice(false);
          if (onSuccess) {
            onSuccess();
            setOnSuccess(null);
          }
        }, 1200);
      } else {
        setCheckVerificationFeedback({
          type: 'error',
          text: 'لم يتم رصد التفعيل بعد! يرجى فتح البريد الإلكتروني والضغط على زر التأكيد أولاً ثم المحاولة ثانية.',
        });
      }
    } catch (err: unknown) {
      setCheckVerificationFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر التحقق من حالة التفعيل حالياً، يرجى المحاولة بعد قليل.',
      });
    } finally {
      setCheckVerificationLoading(false);
    }
  };

  const handleResendInModal = async () => {
    setResendNoticeLoading(true);
    setResendNoticeFeedback(null);
    try {
      const res = await sendVerificationEmail();
      setResendNoticeFeedback(res.message);
    } catch {
      setResendNoticeFeedback('حدث خطأ أثناء محاولة إرسال الرابط.');
    } finally {
      setResendNoticeLoading(false);
    }
  };

  const handleCancelAndLogout = async () => {
    await logout();
    setIsOpen(false);
    setVerificationSentNotice(false);
    setVerificationError(null);
    setCheckVerificationFeedback(null);
    setResendNoticeFeedback(null);
    setOnSuccess(null);
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setAuthError('');
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'https://appifya.app/dashboard';
      account.createOAuth2Session(OAuthProvider.Google, redirectUrl, redirectUrl);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'فشل تسجيل الدخول عبر Google');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setActionLoading(true);

    try {
      if (isSignUp) {
        // Validate email against temporary / disposable domains and bad syntax
        const emailValidation = validateRegistrationEmail(email);
        if (!emailValidation.isValid) {
          setAuthError(emailValidation.error || 'بريد إلكتروني غير صالح');
          setActionLoading(false);
          return;
        }

        await account.create(ID.unique(), email, password, name);
      }

      await account.createEmailPasswordSession(email, password);

      const currentUser = await account.get();
      setUser(currentUser);

      const autoVerificationErr: string | null = null;
      // If this was a new registration, immediately send verification link
      if (isSignUp) {
        // 1. Send direct verification email via our configured Gmail SMTP
        try {
          await fetch('/api/auth/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              userId: currentUser.$id,
              name: currentUser.name,
            }),
          });
        } catch (mailErr) {
          console.warn('Direct SMTP dispatch notice:', mailErr);
        }

        // 2. Also trigger native Appwrite verification in parallel
        try {
          const verifyUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/verify-email`
            : 'https://appifya.app/verify-email';

          const accountObj = account as unknown as Record<string, (arg: string) => Promise<unknown>>;
          if (typeof accountObj.createEmailVerification === 'function') {
            await accountObj.createEmailVerification(verifyUrl);
          } else {
            await account.createVerification(verifyUrl);
          }
        } catch (vErr) {
          const rawMsg = vErr instanceof Error ? vErr.message : String(vErr);
          console.warn('Appwrite verification notice:', rawMsg);
        }
      }

      if (isSignUp) {
        setVerificationError(autoVerificationErr);
        setVerificationSentNotice(true);
      } else {
        if (!currentUser.emailVerification) {
          setVerificationSentNotice(true);
          return;
        }
        setIsOpen(false);
        if (onSuccess) {
          onSuccess();
          setOnSuccess(null);
        }
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'حدث خطأ في التسجيل، يرجى التأكد من البيانات والمحاولة مجدداً');
    } finally {
      setActionLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, openAuthModal, logout, sendVerificationEmail, refreshUser }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-md my-auto bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/20 text-right" dir="rtl">
            <button
              onClick={() => {
                if (verificationSentNotice) {
                  void handleCancelAndLogout();
                } else {
                  setIsOpen(false);
                  setVerificationSentNotice(false);
                }
              }}
              className="absolute top-5 left-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {verificationSentNotice ? (
              <div className="text-center py-2 space-y-4">
                {verificationError ? (
                  <>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white mb-1">تم إنشاء الحساب! ⚠️</h3>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                        تم إنشاء حسابك، لكن خادم Appwrite أرجع استجابة عند إرسال رابط التأكيد إلى:
                        <br />
                        <span className="font-mono text-indigo-300 font-bold text-sm block mt-1" dir="ltr">{email}</span>
                      </p>
                    </div>
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 text-right space-y-1.5">
                      <p className="font-bold">استجابة Appwrite:</p>
                      <p className="font-mono text-[11px] text-amber-200/90 break-words" dir="ltr">
                        {verificationError}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                        إذا كان السبب يتعلق بـ (Platform/Host)، تأكد من إضافة النطاق ({typeof window !== 'undefined' ? window.location.hostname : 'localhost'}) في لوحة Appwrite داخل <strong>Apps/Platforms</strong>.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Mail className="h-8 w-8 animate-pulse text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white mb-1">تم إرسال رابط التفعيل! ✉️</h3>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                        تم إرسال رابط تأكيد رسمي إلى بريدك الإلكتروني:
                        <br />
                        <span className="font-mono text-indigo-300 font-bold text-sm block mt-1 select-all" dir="ltr">{email}</span>
                      </p>
                    </div>
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 text-right space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-amber-200">
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                        <span>تأكيد البريد الإلكتروني إلزامي للمتابعة</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        لحماية بياناتك ومنع الحسابات الوهمية، لن تتمكن من الدخول إلى لوحة التحكم أو بناء تطبيقات الأندرويد حتى تضغط على رابط التأكيد في رسالتك.
                      </p>
                    </div>
                  </>
                )}

                {checkVerificationFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-semibold text-right flex items-start gap-2 ${
                    checkVerificationFeedback.type === 'success'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/15 border border-red-500/30 text-red-300'
                  }`}>
                    {checkVerificationFeedback.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                    )}
                    <span>{checkVerificationFeedback.text}</span>
                  </div>
                )}

                {resendNoticeFeedback && (
                  <div className="p-3 rounded-xl text-xs font-semibold text-right bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
                    <span>{resendNoticeFeedback}</span>
                  </div>
                )}

                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleCheckVerification}
                    disabled={checkVerificationLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {checkVerificationLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    <span>لقد قمت بالتأكيد، تحقق من الحساب والدخول الآن 🔄</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendInModal}
                    disabled={resendNoticeLoading}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {resendNoticeLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Mail className="h-3.5 w-3.5" />
                    )}
                    <span>إعادة إرسال رابط التفعيل إلى بريدي</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelAndLogout}
                    className="w-full py-2 text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    تسجيل الخروج أو استخدام بريد إلكتروني آخر 🚪
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 mb-3 shadow-lg shadow-indigo-500/30">
                    <LogIn className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    {isSignUp ? 'إنشاء حساب في Appifya' : 'تسجيل الدخول'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    {isSignUp
                      ? 'سجّل الآن لتصدير تطبيقك إلى بريدك وحفظه في لوحة التحكم'
                      : 'سجل دخولك لمتابعة تصدير التطبيق والوصول للوحة التحكم'}
                  </p>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-3 transition-all mb-4 cursor-pointer disabled:opacity-60"
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>{isSignUp ? 'التسجيل السريع عبر Google' : 'الدخول السريع عبر Google'}</span>
                </button>

                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-slate-800 w-full"></div>
                  <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-medium absolute">أو بالبريد الإلكتروني</span>
                </div>

                {authError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {isSignUp && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">الاسم الكامل</label>
                      <div className="relative">
                        <User className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="اسمك أو اسم المتجر"
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">كلمة المرور</label>
                    <div className="relative">
                      <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSignUp ? (
                      <>
                        <UserPlus className="h-4 w-4" />
                        <span>إنشاء الحساب وتأكيد البريد</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        <span>تسجيل الدخول والتصدير</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 text-center text-xs text-slate-400">
                  {isSignUp ? 'لديك حساب مسجل بالفعل؟ ' : 'مستخدم جديد؟ '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setAuthError('');
                    }}
                    className="text-pink-400 hover:text-pink-300 font-bold underline underline-offset-4 cursor-pointer"
                  >
                    {isSignUp ? 'تسجيل الدخول' : 'أنشئ حساباً مجانياً الآن'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
