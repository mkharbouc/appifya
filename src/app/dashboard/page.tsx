'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Smartphone, ExternalLink, Download, Plus, Loader2, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
  const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || '';

  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal();
    } else if (user) {
      loadUserApps();
    }
  }, [user, authLoading]);

  const loadUserApps = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await databases.listDocuments(databaseId, collectionId, [
        Query.equal('user_id', user.$id),
        Query.orderDesc('$createdAt'),
      ]);
      setApps(res.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <Smartphone className="h-12 w-12 text-indigo-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</h2>
        <p className="text-sm text-slate-400 mb-6">يمكنك تسجيل الدخول لاستعراض تطبيقاتك المحفوظة وحزم التصدير.</p>
        <button
          onClick={() => openAuthModal()}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20"
        >
          تسجيل الدخول الآن
        </button>
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">لوحة تحكم تطبيقاتي</h1>
          <p className="text-xs text-slate-400 mt-1">
            مرحباً بك، <span className="text-indigo-400 font-semibold">{user.name || user.email}</span>. إليك جميع التطبيقات التي أنشأتها عبر Appifya.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>إنشاء تطبيق جديد</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <Smartphone className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-1">لا توجد تطبيقات محفوظة بعد</h3>
          <p className="text-xs text-slate-400 mb-6">
            ابدأ الآن بتحويل متجرك الإلكتروني أو صفحة الهبوط إلى تطبيق PWA سريع خلال ثوانٍ.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs"
          >
            <span>إنشاء أول تطبيق لك</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div
              key={app.$id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                    style={{ backgroundColor: app.theme_color || '#6366f1' }}
                  >
                    {app.app_name ? app.app_name.substring(0, 2).toUpperCase() : 'APP'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm leading-tight">{app.app_name || 'تطبيق بدون اسم'}</h3>
                    <p className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5" dir="ltr">
                      {app.store_url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    نشط ومرتبط بالسحابة
                  </span>
                  <span className="text-slate-500">
                    {new Date(app.$createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80">
                <Link
                  href={`/app/${app.$id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>معاينة التطبيق</span>
                </Link>
                <a
                  href={`/api/proxy?export=${app.$id}`}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors"
                  title="تنزيل حزمة التصدير"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
