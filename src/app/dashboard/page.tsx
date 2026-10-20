'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '../lib/i18n';
import { databases, DB_ID, TABLE_ID } from '@/lib/appwrite';
import { appwriteConfigMissing } from '@/lib/app-config';
import { Query } from 'appwrite';
import type { AppDocument } from '@/lib/types';
import { Smartphone, ExternalLink, Download, Plus, Loader2, ArrowRight, CheckCircle2, Clock, Play, X, Hammer, HelpCircle } from 'lucide-react';

const BUILD_TIMEOUT_MS = 20 * 60 * 1000;
const buildStartedStorageKey = (appId: string) => `appifya_build_started_${appId}`;
const statusUrl = (appId: string) => {
  const startedAt = localStorage.getItem(buildStartedStorageKey(appId));
  const query = new URLSearchParams({ appId });
  if (startedAt) query.set('startedAt', new Date(Number(startedAt)).toISOString());
  return `/api/build-apk?${query.toString()}`;
};

export default function DashboardPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const { lang } = useLanguage();
  const [apps, setApps] = useState<AppDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildingAppId, setBuildingAppId] = useState<string | null>(null);
  const [buildNoticeAppId, setBuildNoticeAppId] = useState<string | null>(null);
  const [builds, setBuilds] = useState<Record<string, { status: 'building' | 'completed' | 'failed'; downloadUrl?: string }>>({});

  const isRtl = lang === 'ar';

  const clearBuildStart = (appId: string) => {
    localStorage.removeItem(buildStartedStorageKey(appId));
  };

  const markBuildStarted = (appId: string) => {
    // This runs only after a user starts a build.
    // eslint-disable-next-line react-hooks/purity
    localStorage.setItem(buildStartedStorageKey(appId), String(Date.now()));
  };

  const getBuildStartedAt = (appId: string) => {
    const value = Number(localStorage.getItem(buildStartedStorageKey(appId)));
    return Number.isFinite(value) && value > 0 ? value : null;
  };

  const loadUserApps = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await databases.listDocuments(DB_ID, TABLE_ID, [
        Query.equal('user_id', user.$id),
        Query.orderDesc('$createdAt'),
      ]);
      setApps(res.documents);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal();
    } else if (user) {
      // Loading the user's remote documents is an external synchronization effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadUserApps();
    }
  }, [user, authLoading, loadUserApps]);

  useEffect(() => {
    if (apps.length === 0) return;

    const restoreBuildStatuses = async () => {
      await Promise.all(apps.map(async (app) => {
        try {
          const response = await fetch(statusUrl(app.$id), { cache: 'no-store' });
          if (!response.ok) return;

          const result = await response.json();
          if (result.status === 'building' || result.status === 'completed' || result.status === 'failed') {
            const startedAt = getBuildStartedAt(app.$id);
            const isStale = result.status === 'building'
              && (!startedAt || Date.now() - startedAt > BUILD_TIMEOUT_MS);
            setBuilds((current) => ({
              ...current,
              [app.$id]: {
                status: isStale ? 'failed' : result.status,
                downloadUrl: result.downloadUrl,
              },
            }));
            if (isStale) {
              clearBuildStart(app.$id);
            } else if (result.status === 'building') {
              setBuildNoticeAppId(app.$id);
            }
          }
        } catch (error) {
          console.error('Build status restore failed:', error);
        }
      }));
    };

    void restoreBuildStatuses();
  }, [apps]);

  const handleTriggerBuild = async (app: AppDocument) => {
    try {
      setBuildingAppId(app.$id);
      const res = await fetch('/api/build-apk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: app.$id, userId: user?.$id }),
      });

      const data = await res.json();
      if (res.ok) {
        markBuildStarted(app.$id);
        setBuilds((current) => ({ ...current, [app.$id]: { status: 'building' } }));
        setBuildNoticeAppId(app.$id);
      } else {
        alert(data.error || 'فشل إرسال طلب البناء، يرجى المحاولة مرة أخرى.');
      }
    } catch {
      alert('تعذر الاتصال بالسيرفر لبدء البناء');
    } finally {
      setBuildingAppId(null);
    }
  };

  useEffect(() => {
    const activeIds = Object.entries(builds)
      .filter(([, build]) => build.status === 'building')
      .map(([id]) => id);
    if (activeIds.length === 0) return;

    const checkBuilds = async () => {
      await Promise.all(activeIds.map(async (appId) => {
        try {
          const response = await fetch(statusUrl(appId), { cache: 'no-store' });
          if (!response.ok) return;
          const result = await response.json();
          const startedAt = getBuildStartedAt(appId);
          const isStale = result.status === 'building'
            && (!startedAt || Date.now() - startedAt > BUILD_TIMEOUT_MS);
          if (isStale || result.status === 'completed' || result.status === 'failed') {
            setBuilds((current) => ({
              ...current,
              [appId]: {
                status: isStale ? 'failed' : result.status,
                downloadUrl: result.downloadUrl,
              },
            }));
            setBuildNoticeAppId((current) => (current === appId ? null : current));
            if (isStale) clearBuildStart(appId);
          }
        } catch (error) {
          console.error('Build status check failed:', error);
        }
      }));
    };

    void checkBuilds();
    const interval = window.setInterval(checkBuilds, 10000);
    return () => window.clearInterval(interval);
  }, [builds]);

  const labels = {
    title: { ar: 'لوحة تحكم تطبيقاتي', en: 'My Applications', fr: 'Mes Applications' },
    welcome: {
      ar: 'مرحباً بك، إليك جميع التطبيقات التي أنشأتها عبر Appifya.',
      en: 'Welcome! Here are all the apps you have created with Appifya.',
      fr: 'Bienvenue ! Voici toutes les applications que vous avez créées avec Appifya.',
    },
    newApp: { ar: 'إنشاء تطبيق جديد', en: 'Create New App', fr: 'Nouvelle Application' },
    emptyTitle: { ar: 'لا توجد تطبيقات محفوظة بعد', en: 'No apps saved yet', fr: 'Aucune application trouvée' },
    emptyDesc: {
      ar: 'ابدأ الآن بتحويل متجرك الإلكتروني أو صفحة الهبوط إلى تطبيق أندرويد و PWA احترافي خلال دقائق.',
      en: 'Start converting your store or landing page into an Android App and PWA in minutes.',
      fr: 'Transformez votre boutique en application Android et PWA en quelques minutes.',
    },
    createFirst: { ar: 'إنشاء أول تطبيق لك', en: 'Create your first app', fr: 'Créer votre première app' },
    preview: { ar: 'معاينة المتجر', en: 'Preview Store', fr: 'Aperçu du site' },
    buildApk: { ar: 'بناء ملف APK', en: 'Build APK', fr: 'Compiler APK' },
    downloadApk: { ar: 'تنزيل APK', en: 'Download APK', fr: 'Télécharger APK' },
    active: { ar: 'نشط ومتصل بالسحابة', en: 'Cloud Synced & Active', fr: 'Actif & Synchronisé' },
    noName: { ar: 'تطبيق بدون اسم', en: 'Untitled App', fr: 'Application sans titre' },
    loginReq: { ar: 'يرجى تسجيل الدخول للوصول إلى لوحة التحكم', en: 'Please sign in to access your dashboard', fr: 'Veuillez vous connecter pour accéder au tableau de bord' },
    signInBtn: { ar: 'تسجيل الدخول الآن', en: 'Sign In Now', fr: 'Se connecter maintenant' },
    buildNoticeTitle: { ar: 'جاري تجهيز تطبيقك', en: 'Your app is being built', fr: 'Votre application est en cours de création' },
    buildNoticeText: {
      ar: 'تم إرسال الطلب بنجاح إلى خوادم البناء. يمكنك إغلاق هذه النافذة؛ سنواصل العمل في الخلفية ويظهر زر التنزيل تلقائياً عند الجاهزية.',
      en: 'Your request was sent successfully to the build servers. You can close this window; the build continues in the background and the download button will appear when ready.',
      fr: 'Votre demande a été envoyée aux serveurs de compilation. Vous pouvez fermer cette fenêtre : le traitement continue en arrière-plan et le bouton de téléchargement apparaîtra dès que le fichier sera prêt.',
    },
    buildNoticeStatus: { ar: 'جاري إنشاء ملف APK', en: 'Building APK', fr: 'Compilation de l’APK' },
    close: { ar: 'متابعة في الخلفية', en: 'Continue in background', fr: 'Continuer en arrière-plan' },
    buildStarting: { ar: 'جاري البدء...', en: 'Starting...', fr: 'Démarrage...' },
    buildStuck: {
      ar: 'تعذر إكمال البناء. يمكنك المحاولة مرة أخرى.',
      en: 'The build timed out. You can try again.',
      fr: 'La compilation a expiré. Vous pouvez réessayer.',
    },
  };

  const getTxt = (key: keyof typeof labels) => labels[key][lang] || labels[key]['en'];

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (appwriteConfigMissing.length > 0) {
    return (
      <main className="flex-1 flex items-center justify-center p-12 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-lg">
          <h2 className="text-xl font-bold text-white mb-3">إعدادات التطبيق غير مكتملة</h2>
          <p className="text-sm text-slate-400">
            يرجى إضافة متغيرات Appwrite الناقصة في إعدادات الاستضافة ثم إعادة النشر.
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <Smartphone className="h-12 w-12 text-indigo-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">{getTxt('loginReq')}</h2>
        <button
          onClick={() => openAuthModal()}
          className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20"
        >
          {getTxt('signInBtn')}
        </button>
      </div>
    );
  }

  return (
    <main className="theme-page flex-1 max-w-6xl w-full mx-auto px-6 py-10" dir={isRtl ? 'rtl' : 'ltr'}>
      {buildNoticeAppId && builds[buildNoticeAppId]?.status === 'building' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-5" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-indigo-400/30 bg-slate-900 p-7 text-center shadow-2xl shadow-indigo-950/50">
            <button
              type="button"
              onClick={() => setBuildNoticeAppId(null)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
              aria-label={getTxt('close')}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/30">
              <Hammer className="h-8 w-8 animate-pulse text-white" />
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">{getTxt('buildNoticeStatus')}</p>
            <h2 className="mb-4 text-2xl font-black text-white">{getTxt('buildNoticeTitle')}</h2>
            <p className="mx-auto max-w-md text-sm leading-7 text-slate-300">{getTxt('buildNoticeText')}</p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-indigo-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{apps.find((app) => app.$id === buildNoticeAppId)?.app_name || getTxt('noName')}</span>
            </div>
            <button
              type="button"
              onClick={() => setBuildNoticeAppId(null)}
              className="mt-7 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-500"
            >
              {getTxt('close')}
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{getTxt('title')}</h1>
          <p className="text-xs text-slate-400 mt-1">
            <span className="text-indigo-400 font-semibold">{user.name || user.email}</span>, {getTxt('welcome')}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{getTxt('newApp')}</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <Smartphone className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-1">{getTxt('emptyTitle')}</h3>
          <p className="text-xs text-slate-400 mb-6">{getTxt('emptyDesc')}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs"
          >
            <span>{getTxt('createFirst')}</span>
            <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
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
                    className="h-11 w-11 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-sm"
                    style={{ backgroundColor: app.theme_color || '#6366f1' }}
                  >
                    {app.app_name ? app.app_name.substring(0, 2).toUpperCase() : 'AP'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm leading-tight">{app.app_name || getTxt('noName')}</h3>
                    <p className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5" dir="ltr">
                      {app.store_url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    {getTxt('active')}
                  </span>
                  <span className="text-slate-500">
                    {new Date(app.$createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang === 'fr' ? 'fr-FR' : 'en-US')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80">
                <a
                  href={app.store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{getTxt('preview')}</span>
                </a>

                <button
                  onClick={() => handleTriggerBuild(app)}
                  disabled={buildingAppId === app.$id}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
                  title={getTxt('buildApk')}
                >
                  {buildingAppId === app.$id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current" />
                  )}
                  <span>{buildingAppId === app.$id ? getTxt('buildStarting') : getTxt('buildApk')}</span>
                </button>
              </div>
              {builds[app.$id]?.status === 'building' && (
                <div className="mt-3 flex items-center gap-2 text-[11px] text-indigo-300">
                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                  <span>{lang === 'ar' ? 'يتم تجهيز APK في الخلفية...' : lang === 'fr' ? 'APK en cours de préparation en arrière-plan...' : 'APK is being prepared in the background...'}</span>
                </div>
              )}
              {builds[app.$id]?.status === 'failed' && (
                <div className="mt-3 flex items-center gap-2 text-[11px] text-rose-500">
                  <X className="h-3.5 w-3.5" />
                  <span>{getTxt('buildStuck')}</span>
                </div>
              )}
              {builds[app.$id]?.status === 'completed' && builds[app.$id]?.downloadUrl && (
                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href={builds[app.$id].downloadUrl}
                    className="flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{getTxt('downloadApk')}</span>
                  </a>
                  <Link
                    href="/guide"
                    className="flex items-center justify-center gap-1.5 py-1.5 border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-xl transition-colors"
                  >
                    <HelpCircle className="h-3 w-3 text-indigo-400" />
                    <span>{lang === 'ar' ? 'كيف أثبّت التطبيق؟' : lang === 'fr' ? 'Comment installer l\'APK ?' : 'How to install?'}</span>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
