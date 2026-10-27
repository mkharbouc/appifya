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
  getAppBuildInfo,
  recordSuccessfulBuild,
  syncAppBuildCount,
  addAppBuildCredits,
  PAYPAL_EMAIL,
  PAYPAL_DIRECT_PAY_URL,
  SUBSCRIPTION_PRICE_USD,
  RETENTION_DAYS,
  type AdMobSubscription,
} from '@/lib/subscription';
import PlanUpgradeModal from '@/components/PlanUpgradeModal';
import confetti from 'canvas-confetti';
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
  PartyPopper,
  Eye,
  Activity,
  Layers,
  Zap,
  Mail,
  Briefcase,
  Key,
} from 'lucide-react';

const BUILD_TIMEOUT_MS = 20 * 60 * 1000;
const buildStartedStorageKey = (appId: string) => `appifya_build_started_${appId}`;
const statusUrl = (appId: string) => {
  const startedAt = localStorage.getItem(buildStartedStorageKey(appId));
  const query = new URLSearchParams({ appId });
  if (startedAt) query.set('startedAt', new Date(Number(startedAt)).toISOString());
  return `/api/build-apk?${query.toString()}`;
};

const PIPELINE_STEPS = [
  {
    step: 1,
    title: { ar: 'بدء السيرفر السحابي وحجز الحاوية', en: 'Initializing Cloud Runner', fr: 'Initialisation du Cloud Runner' },
    detail: { ar: 'تهيئة بيئة لينكس سحابية معزولة لتجميع كود التطبيق', en: 'Booting isolated Linux environment for Android compilation', fr: 'Configuration de l’environnement Linux dédié' },
  },
  {
    step: 2,
    title: { ar: 'استخراج الأصول وإعداد الأيقونة وشاشات البداية', en: 'Asset & Identity Packaging', fr: 'Traitement des ressources et icônes' },
    detail: { ar: 'ضبط أيقونات HD وشاشات البداية ومطابقة إعدادات الويب', en: 'Formatting high-res icons, splash screens & manifest specs', fr: 'Formatage des icônes HD et du fichier manifest' },
  },
  {
    step: 3,
    title: { ar: 'تجميع محرك الويب وأكواد أندرويد الأصلية', en: 'Compiling Android Native Runtime', fr: 'Compilation du runtime Android' },
    detail: { ar: 'دمج أغلفة Chromium فائقة السرعة مع جسر الإشعارات الفورية', en: 'Building Chromium WebView wrapper & notification bridge', fr: 'Intégration du moteur WebKit/Chromium et des push notifications' },
  },
  {
    step: 4,
    title: { ar: 'تجميع Gradle وتوقيع الـ APK الرقمي (Keystore)', en: 'Gradle Assembly & Release Signing', fr: 'Assemblage Gradle et signature release' },
    detail: { ar: 'توليد شهادة الأمان الرقمية لضمان تثبيت التطبيق بدون تحذيرات', en: 'Signing Android package with release cryptographic keys', fr: 'Application de la signature cryptographique sécurisée' },
  },
  {
    step: 5,
    title: { ar: 'رفع الحزمة وتجهيز رابط التنزيل المباشر', en: 'Publishing & Generating CDN Download', fr: 'Génération du lien direct' },
    detail: { ar: 'تحضير الرابط المباشر والسريع للتنزيل الفوري', en: 'Finalizing instant high-speed download link', fr: 'Mise en ligne de l’APK sur le CDN' },
  },
];

const getPipelineProgress = (sec: number) => {
  if (sec < 15) return { stepIndex: 0, percent: Math.min(22, Math.max(10, 10 + sec * 0.8)) };
  if (sec < 35) return { stepIndex: 1, percent: Math.min(42, 22 + (sec - 15) * 1.0) };
  if (sec < 65) return { stepIndex: 2, percent: Math.min(68, 42 + (sec - 35) * 0.86) };
  if (sec < 95) return { stepIndex: 3, percent: Math.min(88, 68 + (sec - 65) * 0.66) };
  return { stepIndex: 4, percent: Math.min(96, 88 + (sec - 95) * 0.2) };
};

const formatTimer = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function DashboardPage() {
  const { user, loading: authLoading, openAuthModal, sendVerificationEmail } = useAuth();
  const { lang } = useLanguage();
  const [apps, setApps] = useState<AppDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildingAppId, setBuildingAppId] = useState<string | null>(null);
  const [buildNoticeAppId, setBuildNoticeAppId] = useState<string | null>(null);
  const [builds, setBuilds] = useState<Record<string, { status: 'building' | 'completed' | 'failed'; downloadUrl?: string }>>({});

  // Email verification state
  const [resendVerificationLoading, setResendVerificationLoading] = useState(false);
  const [verificationBannerMsg, setVerificationBannerMsg] = useState<string | null>(null);
  const [verificationBannerStatus, setVerificationBannerStatus] = useState<'success' | 'error' | null>(null);

  const handleSendVerification = async () => {
    setResendVerificationLoading(true);
    setVerificationBannerMsg(null);
    setVerificationBannerStatus(null);
    try {
      const res = await sendVerificationEmail();
      setVerificationBannerStatus(res.success ? 'success' : 'error');
      setVerificationBannerMsg(res.message);
    } catch (err: unknown) {
      setVerificationBannerStatus('error');
      const msg = err instanceof Error ? err.message : 'فشل إرسال رابط التأكيد، يرجى المحاولة لاحقاً.';
      setVerificationBannerMsg(msg);
    } finally {
      setResendVerificationLoading(false);
    }
  };

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

  // Celebration & Build Pipeline State
  const [celebrationApp, setCelebrationApp] = useState<{
    id: string;
    name: string;
    downloadUrl: string;
    hasAdmob?: boolean;
    isPro?: boolean;
  } | null>(null);
  const [buildElapsedSec, setBuildElapsedSec] = useState<number>(0);
  const [buildVersion, setBuildVersion] = useState<number>(0);
  const [runnerHealth, setRunnerHealth] = useState<{ status: string; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/health', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.checks?.cloud_runner) {
          setRunnerHealth(data.checks.cloud_runner);
        }
      })
      .catch(() => {});
  }, []);

  const isRtl = lang === 'ar';

  const triggerCelebration = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Cheerful audio chime via Web Audio API
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
        });
      }
    } catch {
      // Safe fallback
    }

    // Multi-stage confetti fireworks
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#38bdf8', '#8b5cf6'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0.1, y: 0.7 },
          colors: ['#10b981', '#3b82f6', '#fbbf24', '#ffffff'],
        });
      }, 200);

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 0.9, y: 0.7 },
          colors: ['#10b981', '#3b82f6', '#fbbf24', '#ffffff'],
        });
      }, 350);

      setTimeout(() => {
        confetti({
          particleCount: 110,
          spread: 100,
          origin: { y: 0.5 },
          shapes: ['circle'],
          colors: ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#ffffff'],
        });
      }, 550);
    } catch (e) {
      console.warn('Confetti effect failed:', e);
    }
  }, []);

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

  useEffect(() => {
    if (!buildNoticeAppId || builds[buildNoticeAppId]?.status !== 'building') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBuildElapsedSec(0);
      return;
    }

    const startedAt = getBuildStartedAt(buildNoticeAppId) || Date.now();
    const updateElapsed = () => {
      const sec = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      setBuildElapsedSec(sec);
    };

    updateElapsed();
    const interval = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(interval);
  }, [buildNoticeAppId, builds]);

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
          if (result.buildsCount) {
            syncAppBuildCount(app.$id, result.buildsCount, subscription.isActive);
            setBuildVersion((v) => v + 1);
          }
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

  const [selectedUpgradeAppId, setSelectedUpgradeAppId] = useState<string | null>(null);
  const [upgradeDefaultPlan, setUpgradeDefaultPlan] = useState<'standard' | 'agency'>('standard');

  const handleTriggerBuild = async (app: AppDocument, isProBuild: boolean = false) => {
    if (isProBuild && !subscription.isActive) {
      setSelectedUpgradeAppId(app.$id);
      setUpgradeDefaultPlan('standard');
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
          planTier: subscription.plan,
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
        // Immediately record build attempt and update UI state
        recordSuccessfulBuild(app.$id, Boolean(app.admob_app_id), subscription.isActive);
        setBuildVersion((v) => v + 1);
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
          if (result.buildsCount) {
            syncAppBuildCount(appId, result.buildsCount, subscription.isActive);
            setBuildVersion((v) => v + 1);
          }
          const startedAt = getBuildStartedAt(appId);
          const isStale = result.status === 'building'
            && Boolean(startedAt && Date.now() - startedAt > BUILD_TIMEOUT_MS);
          if (result.status === 'completed' && result.downloadUrl) {
            setBuilds((current) => ({
              ...current,
              [appId]: {
                status: 'completed',
                downloadUrl: result.downloadUrl,
              },
            }));
            setBuildNoticeAppId(null);
            clearBuildStart(appId);

            const appDoc = apps.find((a) => a.$id === appId);
            const appName = appDoc?.app_name || (lang === 'ar' ? 'تطبيقك' : 'Your App');
            const hasAdmob = Boolean(appDoc?.admob_app_id || appDoc?.admob_banner_unit_id);
            const isPro = subscription.isActive || hasAdmob;

            // Record successful build in quota tracker
            recordSuccessfulBuild(appId, hasAdmob, subscription.isActive);
            setBuildVersion((v) => v + 1);

            setCelebrationApp({
              id: appId,
              name: appName,
              downloadUrl: result.downloadUrl,
              hasAdmob,
              isPro,
            });
            triggerCelebration();
          } else if (isStale || result.status === 'failed') {
            setBuilds((current) => ({
              ...current,
              [appId]: {
                status: 'failed',
                downloadUrl: result.downloadUrl,
              },
            }));
            setBuildNoticeAppId(null);
            if (isStale) clearBuildStart(appId);
          }
        } catch (error) {
          console.error('Build status check failed:', error);
        }
      }));
    };

    void checkBuilds();
    const interval = window.setInterval(checkBuilds, 5000);
    return () => window.clearInterval(interval);
  }, [builds, apps, lang, triggerCelebration]);

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

  const activeBuildingApp = apps.find((app) => builds[app.$id]?.status === 'building');

  return (
    <main className="theme-page flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ── INTERACTIVE BUILD PIPELINE WAITING MODAL ── */}
      {buildNoticeAppId && builds[buildNoticeAppId]?.status === 'building' && (() => {
        const buildingApp = apps.find((app) => app.$id === buildNoticeAppId);
        const pipeline = getPipelineProgress(buildElapsedSec);
        const activeStep = PIPELINE_STEPS[pipeline.stepIndex];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-indigo-500/40 bg-slate-900 p-6 sm:p-8 text-center shadow-2xl shadow-indigo-950/70 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
              
              {/* Close Button (X) */}
              <button
                type="button"
                onClick={() => setBuildNoticeAppId(null)}
                className="absolute top-5 left-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label={getTxt('close')}
                title={lang === 'ar' ? 'إغلاق ومتابعة في الخلفية' : 'Close and continue in background'}
              >
                <X className="h-5 w-5" />
              </button>

              {/* Glowing Pulse Radar Animation */}
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-indigo-500/25 animate-ping opacity-75"></span>
                <span className="absolute inset-2 rounded-full border border-cyan-400/40 animate-pulse"></span>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/30">
                  <Hammer className="h-8 w-8 animate-bounce text-white" />
                </div>
              </div>

              {/* Title & App Info */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
                  <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                  <span>appifya-cloud-runner@v3.4</span>
                </div>
                <h2 className="text-2xl font-black text-white">
                  {lang === 'ar' ? 'جاري تجهيز تطبيقك السحابي...' : 'Building Your Mobile App...'}
                </h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  {buildingApp?.app_name ? `"${buildingApp.app_name}"` : getTxt('noName')}
                  {' · '}
                  <span className="text-slate-400 font-mono" dir="ltr">{buildingApp?.store_url}</span>
                </p>
              </div>

              {/* Elapsed Timer & Progress Bar */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Clock className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                    <span>{lang === 'ar' ? 'الوقت المنقضي:' : 'Elapsed time:'}</span>
                    <strong className="text-white font-mono">{formatTimer(buildElapsedSec)}</strong>
                  </span>
                  <span className="text-xs font-extrabold text-cyan-400 font-mono">
                    {Math.round(pipeline.percent)}%
                  </span>
                </div>

                {/* Progress bar with animated gradient */}
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-400 transition-all duration-500 ease-out shadow-sm shadow-cyan-500/50"
                    style={{ width: `${pipeline.percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-indigo-300 font-bold truncate max-w-[280px]">
                    {activeStep.title[lang] || activeStep.title.en}
                  </span>
                  <span className="text-slate-500 font-mono">
                    {lang === 'ar' ? `المرحلة ${pipeline.stepIndex + 1} من 5` : `Step ${pipeline.stepIndex + 1} of 5`}
                  </span>
                </div>
              </div>

              {/* Visual Pipeline Steps */}
              <div className="text-right sm:text-start space-y-2 max-h-48 overflow-y-auto pr-1" dir={isRtl ? 'rtl' : 'ltr'}>
                {PIPELINE_STEPS.map((s, idx) => {
                  const isDone = idx < pipeline.stepIndex;
                  const isCurrent = idx === pipeline.stepIndex;

                  return (
                    <div
                      key={s.step}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-indigo-500/15 border border-indigo-500/30'
                          : isDone
                          ? 'bg-slate-900/60 border border-slate-800/60'
                          : 'opacity-40 border border-transparent'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isDone ? (
                          <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        ) : isCurrent ? (
                          <div className="h-5 w-5 rounded-full bg-indigo-500/30 text-cyan-300 border border-indigo-400 flex items-center justify-center">
                            <Loader2 className="h-3 w-3 animate-spin" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center text-[10px] font-mono">
                            {s.step}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-bold leading-tight ${isCurrent ? 'text-white' : isDone ? 'text-slate-300' : 'text-slate-500'}`}>
                          {s.title[lang] || s.title.en}
                        </div>
                        <p className={`text-[11px] leading-snug mt-0.5 truncate ${isCurrent ? 'text-indigo-200' : 'text-slate-500'}`}>
                          {s.detail[lang] || s.detail.en}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informative Assurance Box */}
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3.5 text-xs text-slate-300 flex items-center gap-3" dir={isRtl ? 'rtl' : 'ltr'}>
                <Sparkles className="h-5 w-5 text-indigo-400 shrink-0" />
                <p className="text-[11px] leading-relaxed text-slate-300 text-right sm:text-start">
                  {lang === 'ar'
                    ? 'يمكنك إغلاق هذه النافذة بأمان ومتابعة عملك؛ السيرفر مستمر في البناء وسنطلق احتفالاً مع تنبيه مرئي فور اكتمال التجهيز!'
                    : 'You can safely close this window; the build continues on cloud runner and a celebration will notify you upon completion!'}
                </p>
              </div>

              {/* Bottom Continue Action */}
              <button
                type="button"
                onClick={() => setBuildNoticeAppId(null)}
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{lang === 'ar' ? 'المتابعة في لوحة التحكم (إغلاق النافذة)' : 'Continue in Dashboard (Close Modal)'}</span>
                <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── CELEBRATION MODAL (🎉 مبروك! تم تجهيز تطبيقك بنجاح) ── */}
      {celebrationApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-fade-in" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-center shadow-2xl shadow-emerald-500/25 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <button
              type="button"
              onClick={() => setCelebrationApp(null)}
              className="absolute top-5 left-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Floating Animated Celebration Icon */}
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-60"></span>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 text-white shadow-xl shadow-emerald-500/30">
                <PartyPopper className="h-10 w-10 text-amber-200 animate-bounce" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider">
                {celebrationApp.hasAdmob
                  ? (lang === 'ar' ? '🎉 اكتمل البناء ودمج AdMob بنجاح 100% (Pro Studio)' : '🎉 Build & AdMob Integration 100% (Pro Studio)')
                  : (lang === 'ar' ? '🎉 اكتمل البناء بنجاح 100%' : '🎉 Build Completed 100%')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {lang === 'ar' ? 'ألـف مـبـروك! تطبيقك جاهز الآن' : 'Congratulations! Your App is Ready!'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {celebrationApp.hasAdmob
                  ? (lang === 'ar'
                      ? `تم تجميع ملف الـ APK لتطبيق "${celebrationApp.name}" وتضمين إعلانات Google AdMob بنسبة أرباح 100% لك مع التوقيع الرقمي الرسمي لمتجر Google Play.`
                      : `The release APK for "${celebrationApp.name}" was compiled with Google AdMob embedded (100% revenue to you) and signed for Google Play.`)
                  : (lang === 'ar'
                      ? `تم تجميع ملف الـ APK الأصلي لتطبيق "${celebrationApp.name}" وتوقيعه رقمياً بنجاح. ملفك الآن جاهز للتثبيت الفوري على هواتف أندرويد.`
                      : `The release APK for "${celebrationApp.name}" was compiled and cryptographically signed. Your app is ready for instant installation on Android devices.`)}
              </p>
            </div>

            {/* Feature Badges Card */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-2 text-xs text-slate-200 text-right sm:text-center" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>
                  {celebrationApp.hasAdmob
                    ? (lang === 'ar' ? 'إعلانات AdMob مدمجة ومفعلة · أرباح 100% بدون أي وسيط' : 'AdMob Ads Active · 100% ad revenue directly to you')
                    : (lang === 'ar' ? 'تم الفحص الأمني والتوقيع الرقمي بنجاح' : 'Security verified & signed with release keys')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {celebrationApp.hasAdmob
                  ? (lang === 'ar'
                      ? 'يمكنك تنزيل الـ APK وتثبيته مباشرة لبدء تحقيق الأرباح فوراً من الإعلانات على هواتف عملائك.'
                      : 'Download and install the APK to start generating ad revenue immediately on your users’ devices.')
                  : (lang === 'ar'
                      ? 'يمكنك تنزيل الملف وتثبيته مباشرة أو إرساله لعملائك عبر واتساب أو موقعك الإلكتروني.'
                      : 'You can download the APK and test it on your device or distribute it directly to your users.')}
              </p>
            </div>

            {/* Download Buttons Suite (APK, AAB Bundle, Release Keystore) */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href={`/api/download-apk?appId=${celebrationApp.id}&type=apk`}
                  download={`${celebrationApp.name || 'app'}.apk`}
                  onClick={() => triggerCelebration()}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  <span>
                    {celebrationApp.hasAdmob
                      ? (lang === 'ar' ? '📥 تنزيل APK (AdMob مفعل)' : '📥 Download AdMob APK')
                      : (lang === 'ar' ? '📥 تنزيل ملف APK' : '📥 Download APK')}
                  </span>
                </a>

                {celebrationApp.isPro && (
                  <a
                    href={`/api/download-apk?appId=${celebrationApp.id}&type=aab`}
                    download={`${celebrationApp.name || 'app'}.aab`}
                    onClick={() => triggerCelebration()}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <Download className="h-4 w-4 shrink-0" />
                    <span>{lang === 'ar' ? '📦 حزمة المتجر (AAB Bundle)' : '📦 Google Play (AAB)'}</span>
                  </a>
                )}
              </div>

              {celebrationApp.isPro && (
                <div>
                  <a
                    href={`/api/download-apk?appId=${celebrationApp.id}&type=keystore`}
                    download={`${celebrationApp.name || 'app'}-release.keystore`}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Key className="h-3.5 w-3.5 text-amber-400" />
                    <span>{lang === 'ar' ? '🔑 تنزيل مفتاح التوقيع الرقمي (Release Keystore)' : '🔑 Download Dedicated Release Keystore'}</span>
                  </a>
                </div>
              )}

              {/* Mobile Installation Tip in Modal */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/20 text-right text-xs text-slate-300 space-y-1.5" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <Smartphone className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>{lang === 'ar' ? 'طريقة تثبيت التطبيق على الهاتف بدون مشاكل:' : 'How to install the APK on your phone:'}</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed space-y-1">
                  <p>
                    {lang === 'ar'
                      ? '• الخيار الأسهل: افتح موقع appifya.app من متصفح هاتفك وحمّل الملف مباشرة لتثبيته بضغطة واحدة.'
                      : '• Easiest: Open appifya.app on your mobile browser and download directly to install.'}
                  </p>
                  <p>
                    {lang === 'ar'
                      ? '• في حال أرسلته لنفسك عبر واتساب: لا تفتحه من داخل محادثة واتساب، بل افتح تطبيق "مدير الملفات / Files" في هاتفك واضغط على الملف هناك ليظهر مثبت أندرويد الرسمي فوراً.'
                      : '• If sent via WhatsApp: Open the file from your phone\'s "Files" / "Downloads" app (not from WhatsApp chat) so Android opens the native installer.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => triggerCelebration()}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{lang === 'ar' ? 'أطلق الألعاب النارية مجدداً 🎉' : 'Celebrate again 🎉'}</span>
                </button>
                <span className="text-slate-600">·</span>
                <button
                  type="button"
                  onClick={() => setCelebrationApp(null)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
                >
                  {lang === 'ar' ? 'إغلاق ومتابعة التطبيقات' : 'Close and return to apps'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RUNNER HEALTH WARNING BANNER (ADMIN VISIBILITY) ── */}
      {runnerHealth?.status === 'failed' && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-xs text-red-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-lg shadow-red-500/10">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">
                {lang === 'ar' ? 'تنبيه النظام: محرك البناء بحاجة لضبط GITHUB_PAT في Vercel' : 'System Notice: Cloud Build Runner requires GITHUB_PAT in Vercel'}
              </p>
              <p className="text-[11px] text-red-300/80 mt-0.5">
                {runnerHealth.message}
              </p>
            </div>
          </div>
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>{lang === 'ar' ? 'إضافة المفتاح في Vercel' : 'Add Key in Vercel'}</span>
          </a>
        </div>
      )}

      {/* ── TOP ACTIVE CLOUD BUILD NOTIFICATION BANNER ── */}
      {activeBuildingApp && !buildNoticeAppId && !celebrationApp && (
        <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 p-4 sm:p-5 shadow-lg shadow-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Hammer className="h-5 w-5 animate-pulse text-indigo-300" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate">
                  {lang === 'ar' ? `جاري تجهيز تطبيق "${activeBuildingApp.app_name}" في السحابة...` : `Building "${activeBuildingApp.app_name}" in cloud...`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  {lang === 'ar' ? 'سحابي نشط' : 'Cloud Active'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'ar'
                  ? 'يمكنك تصفح لوحة التحكم بحرية تامة؛ سيظهر لك احتفال مبروك وزر التنزيل فور الانتهاء!'
                  : 'Feel free to navigate your dashboard; a celebration and download button will pop up once ready!'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBuildNoticeAppId(activeBuildingApp.$id)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Activity className="h-3.5 w-3.5 text-cyan-300" />
            <span>{lang === 'ar' ? 'مشاهدة مراحل البناء' : 'View Build Pipeline'}</span>
          </button>
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

      {/* ── EMAIL VERIFICATION ALERT BANNER ── */}
      {user && user.emailVerification === false && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-start sm:items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {lang === 'ar' ? 'بريدك الإلكتروني غير مفعّل بعد' : 'Email Address Not Verified'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {lang === 'ar' ? 'مطلوب التفعيل' : 'Action Required'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {lang === 'ar'
                  ? `يرجى تأكيد بريدك الإلكتروني (${user.email}) ليصبح حسابك موثقاً بالكامل باللون الأخضر وتأمين استقبال ملفات APK والتحديثات.`
                  : `Please verify your email address (${user.email}) to activate full green verified status and ensure seamless delivery.`}
              </p>
              {verificationBannerMsg && (
                <p className={`text-xs font-bold mt-1.5 flex items-center gap-1.5 animate-in fade-in ${
                  verificationBannerStatus === 'error' ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {verificationBannerStatus === 'error' ? (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>{verificationBannerMsg}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendVerification}
            disabled={resendVerificationLoading}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-60"
          >
            {resendVerificationLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>{lang === 'ar' ? 'إرسال رابط التفعيل إلى بريدي' : 'Send Verification Link'}</span>
          </button>
        </div>
      )}

      {/* Lifetime Plan & Monetization Status Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold ${
            subscription.plan === 'agency'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : subscription.isActive
              ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400'
              : 'bg-slate-800 border border-slate-700 text-slate-400'
          }`}>
            {subscription.plan === 'agency' ? (
              <Briefcase className="h-5 w-5 text-emerald-400" />
            ) : subscription.isActive ? (
              <Sparkles className="h-5 w-5 text-indigo-400" />
            ) : (
              <DollarSign className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">
                {subscription.plan === 'agency'
                  ? (lang === 'ar' ? 'حزمة الوكالات (Agency Pack · 5 تطبيقات)' : 'Agency Pack Active (5 Apps Lifetime)')
                  : subscription.isActive
                  ? (lang === 'ar' ? 'الباقة الاحترافية (Standard Pro · مدى الحياة)' : 'Standard Pro Active (Lifetime)')
                  : (lang === 'ar' ? 'الباقة التجريبية (Free Starter)' : 'Free Starter Plan')}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                subscription.isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
              }`}>
                {subscription.plan === 'agency'
                  ? '$99 / lifetime'
                  : subscription.isActive
                  ? '$29 / lifetime'
                  : '$0 / free'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {subscription.plan === 'agency'
                ? (lang === 'ar'
                    ? 'رصيد دائم لـ 5 تطبيقات كاملة مع إعلانات AdMob وحزم AAB لكل تطبيق وشاشات White-label.'
                    : 'Lifetime credit for 5 apps with AdMob, Google Play AAB bundles & White-label splash.')
                : subscription.isActive
                ? (lang === 'ar'
                    ? 'ترخيص دائم للأبد · يشمل حزم متجر Play الرسمية (AAB + APK) ودمج AdMob الكامل و3 محاولات بناء.'
                    : 'Lifetime license · Includes Google Play AAB bundles, full AdMob ads & 3 builds.')
                : (lang === 'ar'
                    ? 'جرّب بناء APK للتأكد من توافق موقعك. قم بالترقية للحصول على حزم المتجر (AAB) و AdMob للأبد.'
                    : 'Test APK build to ensure compatibility. Upgrade once to unlock Google Play AAB and AdMob forever.')}
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
            onClick={() => {
              setSelectedUpgradeAppId(null);
              setShowPayModal(true);
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              subscription.isActive
                ? 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20'
            }`}
          >
            {subscription.isActive
              ? (lang === 'ar' ? 'ترقية / شراء إضافات' : 'Upgrade / Add-ons')
              : (lang === 'ar' ? 'ترقية الباقة ($29)' : 'Upgrade ($29)')}
          </button>
        </div>
      </div>

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
                className={`bg-slate-900 border rounded-2xl p-5 transition-all flex flex-col justify-between relative group ${
                  builds[app.$id]?.status === 'building'
                    ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-400/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
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
                  {(() => {
                    const buildInfo = getAppBuildInfo(user?.$id || '', app.$id);
                    const isFreeTier = !subscription.isActive;
                    return (
                      <div className="space-y-1.5 mb-4 text-[11px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            {getTxt('active')}
                          </span>
                          {app.admob_app_id && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>AdMob</span>
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-md border font-semibold ${
                            !isFreeTier || !buildInfo.isWatermarked
                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}>
                            {isFreeTier
                              ? (!buildInfo.isWatermarked
                                  ? (lang === 'ar' ? 'المحاولة 1: تجريبية نظيفة' : 'Trial 1: Clean build')
                                  : (lang === 'ar' ? 'نسخ تجريبية (بشعار Appifya)' : 'Trial builds (Watermarked)'))
                              : (lang === 'ar'
                                  ? `البناء المتبقي: ${buildInfo.buildsRemaining} من ${buildInfo.maxBuilds}`
                                  : `Builds: ${buildInfo.buildsRemaining}/${buildInfo.maxBuilds} left`)}
                          </span>
                          {isFreeTier && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUpgradeAppId(app.$id);
                                setUpgradeDefaultPlan('standard');
                                setShowPayModal(true);
                              }}
                              className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 font-bold hover:bg-amber-500/30 cursor-pointer text-[10px] flex items-center gap-1 shadow-sm"
                            >
                              <Sparkles className="h-3 w-3 text-amber-300" />
                              <span>{lang === 'ar' ? 'إزالة الشعار + AAB بـ 29$' : 'Remove Watermark + AAB ($29)'}</span>
                            </button>
                          )}
                          {!isFreeTier && buildInfo.buildsRemaining === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUpgradeAppId(app.$id);
                                setShowPayModal(true);
                              }}
                              className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold hover:bg-amber-500/30 cursor-pointer text-[10px]"
                            >
                              {lang === 'ar' ? '+3 محاولات بـ 9$' : '+3 Builds ($9)'}
                            </button>
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
                    );
                  })()}
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

                    {/* Button 1: Free APK Build (Never disabled - always allows building) */}
                    {(() => {
                      const appBuildInfo = getAppBuildInfo(user?.$id || '', app.$id);
                      const isFreeTier = !subscription.isActive;

                      return (
                        <button
                          type="button"
                          onClick={() => handleTriggerBuild(app, false)}
                          disabled={buildingAppId === app.$id}
                          className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                          title={
                            isFreeTier && appBuildInfo.isWatermarked
                              ? (lang === 'ar' ? 'بناء نسخة تجريبية إضافية (تتضمن شاشة وشعار Appifya)' : 'Build trial APK (with Appifya branding)')
                              : (lang === 'ar' ? 'بناء ملف APK تجريبي مجاني' : 'Build Free APK (Clean)')
                          }
                        >
                          {buildingAppId === app.$id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                          ) : (
                            <Play className="h-3.5 w-3.5 fill-current text-indigo-400" />
                          )}
                          <span>
                            {buildingAppId === app.$id
                              ? getTxt('buildStarting')
                              : isFreeTier && appBuildInfo.isWatermarked
                                ? (lang === 'ar' ? 'بناء APK (مع شعار)' : 'Build APK (Trial)')
                                : (lang === 'ar' ? 'بناء APK (تجريبي)' : 'Free APK')}
                          </span>
                        </button>
                      );
                    })()}

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

                  {/* Status Indicator & Pipeline Widget */}
                  {builds[app.$id]?.status === 'building' && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-indigo-300 font-bold">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                          </span>
                          <span>{lang === 'ar' ? 'جاري البناء في السحابة...' : 'Cloud Building Active...'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBuildNoticeAppId(app.$id)}
                          className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded-lg border border-indigo-500/30 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          <span>{lang === 'ar' ? 'عرض المراحل' : 'View Pipeline'}</span>
                        </button>
                      </div>

                      {/* Micro Progress Track */}
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-400 animate-pulse rounded-full w-3/4"></div>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-tight">
                        {lang === 'ar'
                          ? 'يتم تجميع وتوقيع الحزمة، سيظهر لك احتفال مبروك فور الجاهزية!'
                          : 'Packaging assets; a celebration will pop up as soon as it is ready!'}
                      </p>
                    </div>
                  )}

                  {builds[app.$id]?.status === 'failed' && (
                    <div className="mt-2.5 flex items-center gap-2 text-[11px] text-rose-500">
                      <X className="h-3.5 w-3.5" />
                      <span>{getTxt('buildStuck')}</span>
                    </div>
                  )}

                  {builds[app.$id]?.status === 'completed' && builds[app.$id]?.downloadUrl && (
                    <div className="mt-3 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between text-[11px] px-1 text-emerald-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>
                            {app.admob_app_id
                              ? (lang === 'ar' ? 'جاهز للتثبيت 100% (AdMob مفعل)' : 'Ready 100% (AdMob Active)')
                              : (lang === 'ar' ? 'جاهز للتثبيت 100%' : 'Ready to Install 100%')}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCelebrationApp({
                              id: app.$id,
                              name: app.app_name || 'My App',
                              downloadUrl: builds[app.$id].downloadUrl!,
                              hasAdmob: Boolean(app.admob_app_id),
                              isPro: subscription.isActive || Boolean(app.admob_app_id),
                            });
                            triggerCelebration();
                          }}
                          className="text-amber-300 hover:text-amber-200 cursor-pointer flex items-center gap-1 font-bold text-[10px] bg-amber-400/10 hover:bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-400/20 shadow-sm"
                        >
                          <PartyPopper className="h-3 w-3" />
                          <span>{lang === 'ar' ? 'احتفال 🎉' : 'Celebrate 🎉'}</span>
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href={builds[app.$id].downloadUrl?.startsWith('http') && !builds[app.$id].downloadUrl?.includes('/api/download-apk') ? `/api/download-apk?appId=${app.$id}&type=apk` : (builds[app.$id].downloadUrl || `/api/download-apk?appId=${app.$id}&type=apk`)}
                          download={`${app.app_name || 'app'}.apk`}
                          onClick={() => triggerCelebration()}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] cursor-pointer"
                        >
                          <Download className="h-4 w-4 shrink-0" />
                          <span>
                            {app.admob_app_id
                              ? (lang === 'ar' ? 'تنزيل APK' : 'APK (AdMob)')
                              : getTxt('downloadApk')}
                          </span>
                        </a>

                        {(subscription.isActive || app.admob_app_id) && (
                          <a
                            href={`/api/download-apk?appId=${app.$id}&type=aab`}
                            download={`${app.app_name || 'app'}.aab`}
                            onClick={() => triggerCelebration()}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] cursor-pointer"
                          >
                            <Download className="h-4 w-4 shrink-0" />
                            <span>{lang === 'ar' ? 'حزمة AAB' : 'AAB Bundle'}</span>
                          </a>
                        )}
                      </div>

                      {(subscription.isActive || app.admob_app_id) && (
                        <a
                          href={`/api/download-apk?appId=${app.$id}&type=keystore`}
                          download={`${app.app_name || 'app'}-release.keystore`}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[10px] font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          <Key className="h-3 w-3 text-amber-400" />
                          <span>{lang === 'ar' ? 'تنزيل مفتاح Keystore' : 'Download Keystore'}</span>
                        </a>
                      )}

                      {/* Mobile Installation Helper */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400">
                          <Smartphone className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                          <span>{lang === 'ar' ? 'تنبيه مهم للتثبيت على الهاتف:' : 'Phone Installation Notice:'}</span>
                        </div>
                        <p className="text-slate-400 text-[10px] leading-relaxed">
                          {lang === 'ar'
                            ? 'إذا قمت بنقل الملف لهاتفك عبر واتساب أو كابل، يرجى فتحه من تطبيق "مدير الملفات / Files" الأصلي وليس من داخل واتساب ليظهر لك خيار التثبيت كتطبيق. أو قم بتحميله مباشرة من متصفح الهاتف.'
                            : 'If transferred via WhatsApp, open the file from your phone\'s native "Files" or "Downloads" app (not inside WhatsApp) for Android to show the install button.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIFETIME PLAN ACTIVATION & UPGRADE MODAL */}
      <PlanUpgradeModal
        isOpen={showPayModal}
        onClose={() => {
          setShowPayModal(false);
          setSelectedUpgradeAppId(null);
        }}
        onSuccess={() => {
          setSubscription(getUserSubscription(user?.$id || ''));
        }}
        defaultPlan={upgradeDefaultPlan}
        appId={selectedUpgradeAppId || undefined}
      />

    </main>
  );
}
