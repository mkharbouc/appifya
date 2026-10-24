'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '../lib/i18n';
import { databases, storage, DB_ID, TABLE_ID, BUCKET_ID } from '@/lib/appwrite';
import { appwriteConfigMissing } from '@/lib/app-config';
import { Query } from 'appwrite';
import type { AppDocument } from '@/lib/types';
import {
  getUserSubscription,
  activateUserSubscription,
  getFileRetentionStatus,
  PAYPAL_EMAIL,
  PAYPAL_DIRECT_PAY_URL,
  SUBSCRIPTION_PRICE_USD,
  RETENTION_DAYS,
  type AdMobSubscription,
} from '@/lib/subscription';
import {
  Smartphone,
  ExternalLink,
  Download,
  Plus,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
  X,
  Hammer,
  Trash2,
  AlertTriangle,
  DollarSign,
  ShieldAlert,
  Copy,
  Check,
  Sparkles,
  Settings,
  Upload,
} from 'lucide-react';

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

  // App Deletion State
  const [appToDelete, setAppToDelete] = useState<AppDocument | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // Subscription State
  const [subscription, setSubscription] = useState<AdMobSubscription>({
    isActive: false,
    plan: 'free',
    expiresAt: null,
    daysRemaining: 0,
    isExpiringSoon7d: false,
    isExpiringSoon3d: false,
    isExpired: false,
  });
  const [showPayModal, setShowPayModal] = useState(false);
  const [txnInput, setTxnInput] = useState('');
  const [subActivating, setSubActivating] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const isRtl = lang === 'ar';

  const clearBuildStart = (appId: string) => {
    localStorage.removeItem(buildStartedStorageKey(appId));
  };

  const markBuildStarted = (appId: string) => {
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
      setApps(res.documents as AppDocument[]);
    } catch (err) {
      console.error('Error loading apps:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load subscription & trigger reminders if approaching expiry
  const refreshSubscription = useCallback(() => {
    if (!user) return;
    const sub = getUserSubscription(user.$id);
    setSubscription(sub);

    // Email trigger when within 7d or 3d window
    if (sub.isActive && (sub.isExpiringSoon7d || sub.isExpiringSoon3d)) {
      const storageReminderKey = `appifya_reminder_sent_${user.$id}_${sub.isExpiringSoon3d ? '3d' : '7d'}`;
      const alreadySent = localStorage.getItem(storageReminderKey);
      if (!alreadySent) {
        fetch('/api/subscription/reminder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            userName: user.name || user.email.split('@')[0],
            daysRemaining: sub.daysRemaining,
          }),
        }).catch(() => {});
        localStorage.setItem(storageReminderKey, new Date().toISOString());
      }
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal();
    } else if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadUserApps();
      void refreshSubscription();
    }
  }, [user, authLoading, loadUserApps, refreshSubscription, openAuthModal]);

  useEffect(() => {
    if (apps.length === 0) return;

    const restoreBuildStatuses = async () => {
      await Promise.all(apps.map(async (app) => {
        try {
          const startedAt = getBuildStartedAt(app.$id);
          const response = await fetch(statusUrl(app.$id), { cache: 'no-store' });
          if (!response.ok) return;

          const result = await response.json();
          if (result.status === 'completed') {
            setBuilds((current) => ({
              ...current,
              [app.$id]: {
                status: 'completed',
                downloadUrl: result.downloadUrl,
              },
            }));
          } else if (result.status === 'building' && startedAt) {
            const isStale = Date.now() - startedAt > BUILD_TIMEOUT_MS;
            setBuilds((current) => ({
              ...current,
              [app.$id]: {
                status: isStale ? 'failed' : 'building',
                downloadUrl: result.downloadUrl,
              },
            }));
            if (isStale) {
              clearBuildStart(app.$id);
            } else {
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

  const handleTriggerBuild = async (app: AppDocument, isProBuild: boolean = false) => {
    if (isProBuild && !subscription.isActive) {
      setShowPayModal(true);
      return;
    }

    try {
      setBuildingAppId(app.$id);
      const res = await fetch('/api/build-apk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: app.$id,
          userId: user?.$id,
          appName: app.app_name,
          storeUrl: app.store_url,
          themeColor: app.theme_color,
          iconId: app.icon_id,
          isProBuild,
          admobAppId: app.admob_app_id,
          admobBannerUnitId: app.admob_banner_unit_id,
          admobInterstitialUnitId: app.admob_interstitial_unit_id,
          admobRewardedUnitId: app.admob_rewarded_unit_id,
          admobAppOpenUnitId: app.admob_app_open_unit_id,
          admobNativeUnitId: app.admob_native_unit_id,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        markBuildStarted(app.$id);
        setBuilds((current) => ({ ...current, [app.$id]: { status: 'building' } }));
        setBuildNoticeAppId(app.$id);
      } else {
        alert(data.error || (lang === 'ar' ? 'فشل إرسال طلب البناء، يرجى المحاولة مرة أخرى.' : 'Build request failed, please try again.'));
      }
    } catch (err) {
      console.error('Build trigger error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      alert((lang === 'ar' ? 'تعذر الاتصال بالسيرفر لبدء البناء: ' : 'Unable to connect to build server: ') + msg);
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
            && Boolean(startedAt && Date.now() - startedAt > BUILD_TIMEOUT_MS);
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

  // -------------------------------------------------------------------------
  // Customer Self-Service App Deletion
  // -------------------------------------------------------------------------
  const handleConfirmDelete = async () => {
    if (!appToDelete) return;

    try {
      setDeleting(true);

      // 1. Delete document from Appwrite Database
      await databases.deleteDocument(DB_ID, TABLE_ID, appToDelete.$id);

      // 2. Best-effort purge storage files if present
      if (appToDelete.icon_id && BUCKET_ID) {
        try { await storage.deleteFile(BUCKET_ID, appToDelete.icon_id); } catch {}
      }
      if (appToDelete.uploaded_file_id && BUCKET_ID) {
        try { await storage.deleteFile(BUCKET_ID, appToDelete.uploaded_file_id); } catch {}
      }

      // 3. Clear local storage records
      localStorage.removeItem(buildStartedStorageKey(appToDelete.$id));
      localStorage.removeItem(`appifya_ad_units_${appToDelete.$id}`);

      // 4. Update UI state
      setApps((prev) => prev.filter((a) => a.$id !== appToDelete.$id));
      const deletedName = appToDelete.app_name || 'App';
      setAppToDelete(null);
      setDeleteSuccessMsg(
        lang === 'ar'
          ? `تم حذف تطبيق "${deletedName}" نهائياً من حسابك.`
          : `Application "${deletedName}" has been permanently deleted.`
      );
      setTimeout(() => setDeleteSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Failed to delete app:', err);
      alert(lang === 'ar' ? 'فشل حذف التطبيق. يرجى المحاولة مرة أخرى.' : 'Failed to delete application.');
    } finally {
      setDeleting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Subscription Activation via PayPal ($19/mo)
  // -------------------------------------------------------------------------
  const handleActivatePayPal = () => {
    if (!user) return;
    if (!txnInput.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال رقم المعاملة أو بريد PayPal المُرسل منه.' : 'Please enter Transaction ID or PayPal email.');
      return;
    }
    setSubActivating(true);
    setTimeout(() => {
      const updated = activateUserSubscription(user.$id, txnInput.trim(), 30);
      setSubscription(updated);
      setSubActivating(false);
      setShowPayModal(false);
      setTxnInput('');
    }, 800);
  };

  const copyPayPalEmail = () => {
    navigator.clipboard.writeText(PAYPAL_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

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
    <main className="theme-page flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Build progress modal */}
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
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
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

      {/* Delete Confirmation Modal */}
      {appToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {lang === 'ar' ? 'تأكيد حذف التطبيق' : 'Confirm App Deletion'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'إجراء نهائي لا يمكن التراجع عنه' : 'This action cannot be undone'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1.5 text-xs">
              <p className="text-white font-bold">{appToDelete.app_name || getTxt('noName')}</p>
              <p className="text-slate-400 font-mono text-[11px] truncate" dir="ltr">{appToDelete.store_url}</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'ar'
                ? 'سيتم حذف التطبيق وجميع سجلاته وملفات الـ APK المرفوعة أو المنشأة من خوادمنا بشكل كامل ودائم.'
                : 'The application, ad units, and associated APK files will be permanently removed from our cloud servers.'}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAppToDelete(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 cursor-pointer"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>{deleting ? (lang === 'ar' ? 'جاري الحذف...' : 'Deleting...') : (lang === 'ar' ? 'تأكيد الحذف النهائي' : 'Delete Permanently')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Toast */}
      {deleteSuccessMsg && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{deleteSuccessMsg}</span>
        </div>
      )}

      {/* AdMob Subscription Status Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold ${
            subscription.isActive
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400'
          }`}>
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {subscription.isActive
                  ? (lang === 'ar' ? 'اشتراك إعلانات AdMob (نشط)' : 'AdMob Pro Active')
                  : (lang === 'ar' ? 'خدمة إعلانات AdMob غير المحدودة' : 'Unlimited AdMob Service')}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                subscription.isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
              }`}>
                ${SUBSCRIPTION_PRICE_USD} / {lang === 'ar' ? 'شهرياً' : 'month'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {subscription.isActive ? (
                <>
                  {lang === 'ar' ? 'متبقي' : 'Remaining'}:{' '}
                  <strong className={subscription.isExpiringSoon3d ? 'text-red-400' : subscription.isExpiringSoon7d ? 'text-amber-400' : 'text-emerald-400'}>
                    {subscription.daysRemaining} {lang === 'ar' ? 'يوماً' : 'days'}
                  </strong>{' '}
                  · {lang === 'ar' ? 'إعلانات وتطبيقات غير محدودة طيلة الشهر' : 'Unlimited ad injection across all apps'}
                </>
              ) : (
                lang === 'ar' ? 'فعّل إعلانات AdMob لجميع تطبيقاتك بدون حدود عبر PayPal' : 'Activate unlimited AdMob ads for all apps via PayPal'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/admob"
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-center transition-colors"
          >
            {lang === 'ar' ? 'إعداد AdMob' : 'AdMob Setup'}
          </Link>
          <button
            type="button"
            onClick={() => setShowPayModal(true)}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              subscription.isActive
                ? 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20'
            }`}
          >
            {subscription.isActive
              ? (lang === 'ar' ? 'تجديد الاشتراك' : 'Renew Plan')
              : (lang === 'ar' ? 'ترقية بـ 19$' : 'Upgrade ($19)')}
          </button>
        </div>
      </div>

      {/* Subscription Warnings (7 days & 3 days) */}
      {subscription.isActive && subscription.isExpiringSoon3d && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-red-400 shrink-0" />
            <span>
              {lang === 'ar'
                ? `🚨 تنبيه عاجل: بقي ${subscription.daysRemaining} أيام فقط على انتهاء اشتراكك في إعلانات AdMob! يرجى التجديد لتفادي توقف الخدمة.`
                : `🚨 Urgent: Only ${subscription.daysRemaining} days left on your AdMob subscription! Please renew.`}
            </span>
          </div>
          <button
            onClick={() => setShowPayModal(true)}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs cursor-pointer shrink-0"
          >
            {lang === 'ar' ? 'تجديد الآن' : 'Renew Now'}
          </button>
        </div>
      )}

      {subscription.isActive && subscription.isExpiringSoon7d && !subscription.isExpiringSoon3d && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-amber-400 shrink-0" />
            <span>
              {lang === 'ar'
                ? `⚠️ تذكير: بقي أسبوع (${subscription.daysRemaining} أيام) على انتهاء اشتراك AdMob Pro. يمكنك التجديد الآن لمواصلة إضافة الإعلانات.`
                : `⚠️ Reminder: 1 week (${subscription.daysRemaining} days) left on your AdMob Pro plan.`}
            </span>
          </div>
          <button
            onClick={() => setShowPayModal(true)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs cursor-pointer shrink-0"
          >
            {lang === 'ar' ? 'تجديد' : 'Renew'}
          </button>
        </div>
      )}

      {/* 10-day retention notice banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-start gap-3 text-xs text-slate-400">
        <Clock className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
        <div>
          <p className="font-semibold text-slate-300">
            {lang === 'ar' ? 'سياسة خوادم التخزين المؤقت (حفظ ملفات APK لمدة 10 أيام)' : 'Temporary Cloud Storage Policy (10 Days Retention)'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            {lang === 'ar'
              ? `يتم الاحتفاظ بملفات الـ APK والتطبيقات المرفوعة على السيرفر لمدة ${RETENTION_DAYS} أيام فقط من تاريخ البناء/الرفع، ثم تُحذف تلقائياً لتوفير المساحة. يرجى تنزيل نسختك والاحتفاظ بها محلياً.`
              : `Compiled APK packages and uploaded app files are retained for ${RETENTION_DAYS} days only, after which they are automatically purged. Please download and keep your local copies.`}
          </p>
        </div>
      </div>

      {/* Dashboard Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{getTxt('title')}</h1>
          <p className="text-xs text-slate-400 mt-1">
            <span className="text-indigo-400 font-semibold">{user.name || user.email}</span>, {getTxt('welcome')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admob"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all"
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span>{lang === 'ar' ? 'إعداد إعلانات AdMob' : 'AdMob Setup'}</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 ring-1 ring-white/10 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{getTxt('newApp')}</span>
          </Link>
        </div>
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
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs"
            >
              <span>{getTxt('createFirst')}</span>
              <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
            <Link
              href="/admob"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs"
            >
              <Upload className="h-3.5 w-3.5 text-indigo-400" />
              <span>{lang === 'ar' ? 'رفع تطبيق وإضافة AdMob' : 'Upload App with AdMob'}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => {
            const retention = getFileRetentionStatus(app.$createdAt);
            return (
              <div
                key={app.$id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between relative group"
              >
                <div>
                  {/* Top card bar with logo and Delete button */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-sm shrink-0"
                        style={{ backgroundColor: app.theme_color || '#6366f1' }}
                      >
                        {app.app_name ? app.app_name.substring(0, 2).toUpperCase() : 'AP'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-sm leading-tight truncate">
                          {app.app_name || getTxt('noName')}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate max-w-[170px] mt-0.5" dir="ltr">
                          {app.store_url}
                        </p>
                      </div>
                    </div>

                    {/* Customer Self-Service Delete Button */}
                    <button
                      type="button"
                      onClick={() => setAppToDelete(app)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                      title={lang === 'ar' ? 'حذف التطبيق نهائياً' : 'Delete Application'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Status badges & Retention countdown */}
                  <div className="space-y-1.5 mb-4 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        {getTxt('active')}
                      </span>
                      {app.admob_app_id && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>AdMob</span>
                        </span>
                      )}
                    </div>

                    {/* 10-Day File Retention Countdown Badge */}
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                      <Clock className="h-3 w-3 text-amber-400/80 shrink-0" />
                      <span>
                        {retention.isExpired
                          ? (lang === 'ar' ? 'انتهت مدة حفظ الملف على الخادم (10 أيام)' : 'Server 10-day retention expired')
                          : (lang === 'ar' ? `حفظ الملف بالسيرفر: متبقي ${retention.daysLeft} أيام` : `Server retention: ${retention.daysLeft} days left`)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
                    <a
                      href={app.store_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>{getTxt('preview')}</span>
                    </a>

                    <Link
                      href="/admob"
                      className="p-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
                      title={lang === 'ar' ? 'تعديل إعلانات AdMob' : 'Configure AdMob'}
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Link>

                    {/* Button 1: Free APK Build */}
                    <button
                      type="button"
                      onClick={() => handleTriggerBuild(app, false)}
                      disabled={buildingAppId === app.$id}
                      className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      title={lang === 'ar' ? 'بناء ملف APK مجاني ومباشر (بدون إعلانات)' : 'Build Free APK (Clean)'}
                    >
                      {buildingAppId === app.$id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                      ) : (
                        <Play className="h-3.5 w-3.5 fill-current text-indigo-400" />
                      )}
                      <span>{buildingAppId === app.$id ? getTxt('buildStarting') : (lang === 'ar' ? 'بناء APK (مجاني)' : 'Free APK')}</span>
                    </button>

                    {/* Button 2: Pro Studio Store Bundle (AAB + AdMob) -> triggers PayPal modal if unsubscribed */}
                    <button
                      type="button"
                      onClick={() => handleTriggerBuild(app, true)}
                      disabled={buildingAppId === app.$id}
                      className={`flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                        subscription.isActive
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
                          : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/25 ring-1 ring-indigo-400/30'
                      }`}
                      title={lang === 'ar' ? 'توليد حزمة المتجر الرسمية (AAB + APK) مع AdMob' : 'Build Store Bundle (AAB + AdMob)'}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      <span>{lang === 'ar' ? 'حزمة المتجر AAB' : 'Store AAB'}</span>
                      {!subscription.isActive && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-extrabold uppercase">
                          PRO
                        </span>
                      )}
                    </button>
                  </div>

                  {builds[app.$id]?.status === 'building' && (
                    <div className="mt-2.5 flex items-center gap-2 text-[11px] text-indigo-300">
                      <Clock className="h-3.5 w-3.5 animate-pulse" />
                      <span>{lang === 'ar' ? 'يتم تجهيز APK في الخلفية...' : 'APK is being prepared in the background...'}</span>
                    </div>
                  )}

                  {builds[app.$id]?.status === 'failed' && (
                    <div className="mt-2.5 flex items-center gap-2 text-[11px] text-rose-500">
                      <X className="h-3.5 w-3.5" />
                      <span>{getTxt('buildStuck')}</span>
                    </div>
                  )}

                  {builds[app.$id]?.status === 'completed' && builds[app.$id]?.downloadUrl && (
                    <div className="mt-2.5 flex flex-col gap-1.5">
                      <a
                        href={builds[app.$id].downloadUrl}
                        className="flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{getTxt('downloadApk')}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAYPAL SUBSCRIPTION ACTIVATION MODAL ($19/MO) */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <button
              type="button"
              onClick={() => setShowPayModal(false)}
              className="absolute top-5 left-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 mb-1">
                <Sparkles className="h-7 w-7 text-amber-300" />
              </div>
              <h3 className="text-2xl font-black text-white">
                {lang === 'ar' ? 'ترقية استوديو برو (Pro Studio)' : 'Upgrade to Pro Studio Plan'}
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                {lang === 'ar'
                  ? 'احصل على حزم Google Play الرسمية (Android AAB + APK) وفعّل إعلانات AdMob غير المحدودة وأرباح 100% لك مقابل 19$ فقط.'
                  : 'Build official Google Play release bundles (AAB + APK) and monetize unlimited apps with AdMob for just $19/mo.'}
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-center">
              <span className="text-3xl font-black text-white">$19</span>
              <span className="text-xs text-indigo-300 font-bold ms-1.5">/ {lang === 'ar' ? 'شهرياً عبر PayPal' : 'per month via PayPal'}</span>
              <p className="text-[11px] text-slate-300 mt-1">
                {lang === 'ar' ? 'يشمل حزم المتجر AAB وإعلانات AdMob وبناء تطبيقات غير محدودة' : 'Includes official Store AAB bundles, AdMob ads & unlimited builds'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{lang === 'ar' ? 'حساب PayPal المعتمد للتحويل:' : 'Official PayPal Account:'}</span>
                <span className="text-[11px] font-bold text-emerald-400">Verified</span>
              </div>

              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5" dir="ltr">
                <span className="font-mono text-sm text-indigo-300 font-bold select-all">{PAYPAL_EMAIL}</span>
                <button
                  type="button"
                  onClick={copyPayPalEmail}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Copy email"
                >
                  {copiedEmail ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <a
                href={PAYPAL_DIRECT_PAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01]"
              >
                <ExternalLink className="h-4 w-4" />
                <span>{lang === 'ar' ? 'الذهاب للدفع عبر PayPal مباشرة ($19)' : 'Pay $19 via PayPal Checkout'}</span>
              </a>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                {lang === 'ar' ? 'رقم المعاملة (Transaction ID) أو بريد PayPal المُرسل منه:' : 'Transaction ID or Sender PayPal Email:'}
              </label>
              <input
                type="text"
                value={txnInput}
                onChange={(e) => setTxnInput(e.target.value)}
                placeholder="PP-123456789 or your-paypal@gmail.com"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {lang === 'ar'
                  ? 'سيتم تفعيل الاشتراك فوراً لمدة 30 يوماً وإرسال إشعارات التجديد إلى بريدك قبل أسبوع ثم قبل 3 أيام من الانتهاء.'
                  : 'Your plan will activate for 30 days immediately with renewal reminders sent 7 days and 3 days prior to expiry.'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="flex-1 py-3 border border-slate-700 bg-slate-900 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleActivatePayPal}
                disabled={subActivating}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                {subActivating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{subActivating ? (lang === 'ar' ? 'جاري التفعيل...' : 'Activating...') : (lang === 'ar' ? 'تأكيد وتفعيل الاشتراك' : 'Confirm & Activate')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
