'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { ID, Models } from 'appwrite';
import { LogIn, UserPlus, X, Mail, Lock, User, Loader2 } from 'lucide-react';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  openAuthModal: (onSuccessCallback?: () => void) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  openAuthModal: () => {},
  logout: async () => {},
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
  const [onSuccess, setOnSuccess] = useState<(() => void) | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const current = await account.get();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const openAuthModal = (callback?: () => void) => {
    if (callback) setOnSuccess(() => callback);
    setAuthError('');
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setActionLoading(true);

    try {
      if (isSignUp) {
        await account.create(ID.unique(), email, password, name);
      }
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);
      setIsOpen(false);
      if (onSuccess) {
        onSuccess();
        setOnSuccess(null);
      }
    } catch (err: any) {
      setAuthError(err.message || 'حدث خطأ في التسجيل، يرجى المحاولة ثانية');
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
    <AuthContext.Provider value={{ user, loading, openAuthModal, logout }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-indigo-500/10">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">
                {isSignUp ? 'إنشاء حساب جديد في Appifya' : 'تسجيل الدخول إلى Appifya'}
              </h3>
              <p className="text-xs text-slate-400">
                {isSignUp
                  ? 'سجّل حسابك لتصدير تطبيقك وحفظه داخل لوحة التحكم وتلقي التحديثات'
                  : 'سجل دخولك لحفظ وتصدير تطبيقك إلى لوحة التحكم'}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="محمد خربوش"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSignUp ? (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>إنشاء الحساب وحفظ التطبيق</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>تسجيل الدخول ومتابعة التصدير</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-400">
              {isSignUp ? 'لديك حساب بالفعل؟ ' : 'ليس لديك حساب بعد؟ '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4"
              >
                {isSignUp ? 'تسجيل الدخول' : 'أنشئ حساباً جديداً مجاناً'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
