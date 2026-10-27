'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import PlanUpgradeModal from '@/components/PlanUpgradeModal';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '../lib/i18n';
import { databases, storage, DB_ID, TABLE_ID, BUCKET_ID } from '@/lib/appwrite';
import { Query, ID, Permission, Role } from 'appwrite';
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
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileDown,
  Loader2,
  DollarSign,
  LayoutDashboard,
  ArrowRight,
  Info,
  X,
  BadgeCheck,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Layers,
  Clock,
  PartyPopper,
  Download,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers & Validation
// ---------------------------------------------------------------------------

const ADMOB_APP_RE = /^ca-app-pub-\d{10,}~\d{8,}$/;
const ADMOB_UNIT_RE = /^ca-app-pub-\d{10,}\/\d{6,}$/;
const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB
const ALLOWED_EXTS = ['.apk', '.aab', '.ipa', '.zip'];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileExtension(name: string) {
  return name.slice(name.lastIndexOf('.')).toLowerCase();
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ current, labels }: { current: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 select-none" role="list" aria-label="Wizard steps">
      {labels.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <React.Fragment key={label}>
            <div
              role="listitem"
              aria-current={active ? 'step' : undefined}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-black transition-all ${
                  done
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : active
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : step}
              </div>
              <span
                className={`text-[11px] font-semibold whitespace-nowrap ${
                  active ? 'text-indigo-400 font-bold' : done ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className={`h-0.5 w-12 sm:w-20 mb-5 mx-1 transition-colors ${
                  step < current ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AdMobPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  // Subscription state
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
  const [subSuccessMsg, setSubSuccessMsg] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // App list & selection
  const [apps, setApps] = useState<AppDocument[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appSourceMode, setAppSourceMode] = useState<'new_upload' | 'existing_app'>('new_upload');
  const [selectedAppId, setSelectedAppId] = useState('');
  const [newAppName, setNewAppName] = useState('');
  const [newStoreUrl, setNewStoreUrl] = useState('');

  // Step state (1: App & File, 2: AdMob Units, 3: Review & Save)
  const [step, setStep] = useState(1);

  // AdMob Credentials & Formats
  const [admobAppId, setAdmobAppId] = useState('');
  const [admobBannerId, setAdmobBannerId] = useState('');
  const [admobInterstitialId, setAdmobInterstitialId] = useState('');
  const [admobRewardedId, setAdmobRewardedId] = useState('');
  const [admobAppOpenId, setAdmobAppOpenId] = useState('');
  const [admobNativeId, setAdmobNativeId] = useState('');
  const [credError, setCredError] = useState<string | null>(null);

  // File upload state
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save & Confirmation state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [savedAppId, setSavedAppId] = useState('');

  // -------------------------------------------------------------------------
  // i18n helper
  // -------------------------------------------------------------------------
  const t = useCallback((ar: string, fr: string, en: string) => {
    if (lang === 'ar') return ar;
    if (lang === 'fr') return fr;
    return en;
  }, [lang]);

  const stepLabels = [
    t('التطبيق والملف', 'Application & Fichier', 'App & File'),
    t('وحدات AdMob', 'Unités AdMob', 'AdMob Units'),
    t('المراجعة والتفعيل', 'Confirmation & Activation', 'Review & Confirm'),
  ];

  // -------------------------------------------------------------------------
  // Load User Subscription & Send Email Reminder If Due
  // -------------------------------------------------------------------------
  const refreshSubscription = useCallback(() => {
    if (!user) return;
    const sub = getUserSubscription(user.$id);
    setSubscription(sub);

    // Trigger email reminder check when subscription is close to expiration
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

  // -------------------------------------------------------------------------
  // Load apps from Appwrite
  // -------------------------------------------------------------------------
  const loadApps = useCallback(async () => {
    if (!user) return;
    try {
      setAppsLoading(true);
      const res = await databases.listDocuments(DB_ID, TABLE_ID, [
        Query.equal('user_id', user.$id),
        Query.orderDesc('$createdAt'),
      ]);
      const docs = res.documents as AppDocument[];
      setApps(docs);

      if (docs.length > 0) {
        // If user already has apps, allow choosing existing
        setSelectedAppId(docs[0].$id);
        setAdmobAppId(docs[0].admob_app_id || '');
        setAdmobBannerId(docs[0].admob_banner_unit_id || '');
        setAdmobInterstitialId(docs[0].admob_interstitial_unit_id || '');
        setAdmobRewardedId(docs[0].admob_rewarded_unit_id || '');
        setAdmobAppOpenId(docs[0].admob_app_open_unit_id || '');
        setAdmobNativeId(docs[0].admob_native_unit_id || '');
      } else {
        // Default to direct upload mode if no prior apps
        setAppSourceMode('new_upload');
      }
    } catch {
      // silent
    } finally {
      setAppsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal();
    } else if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadApps();
      void refreshSubscription();
    }
  }, [user, authLoading, loadApps, refreshSubscription, openAuthModal]);

  // When changing existing app dropdown
  const handleAppChange = (id: string) => {
    setSelectedAppId(id);
    const app = apps.find((a) => a.$id === id);
    if (app) {
      setAdmobAppId(app.admob_app_id || '');
      setAdmobBannerId(app.admob_banner_unit_id || '');
      setAdmobInterstitialId(app.admob_interstitial_unit_id || '');
      setAdmobRewardedId(app.admob_rewarded_unit_id || '');
      setAdmobAppOpenId(app.admob_app_open_unit_id || '');
      setAdmobNativeId(app.admob_native_unit_id || '');
      if (app.uploaded_file_id) {
        setUploadedFileId(app.uploaded_file_id);
        setUploadedFileName(app.uploaded_file_name || 'app-release.apk');
        setUploadedFileUrl(app.uploaded_file_url || '');
      }
    }
    setCredError(null);
  };

  // -------------------------------------------------------------------------
  // Handle File Upload (Drag & Drop or File Picker)
  // -------------------------------------------------------------------------
  const handleFile = async (file: File) => {
    setUploadError(null);
    const ext = fileExtension(file.name);
    if (!ALLOWED_EXTS.includes(ext)) {
      setUploadError(t(
        `نوع الملف غير مدعوم. الأنواع المقبولة: ${ALLOWED_EXTS.join(', ')}`,
        `Type de fichier non supporté. Types acceptés : ${ALLOWED_EXTS.join(', ')}`,
        `Unsupported file type. Accepted types: ${ALLOWED_EXTS.join(', ')}`,
      ));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setUploadError(t(
        'حجم الملف يتجاوز 100 MB. يرجى اختيار ملف أصغر.',
        'Le fichier dépasse 100 Mo. Veuillez choisir un fichier plus petit.',
        'File exceeds 100 MB. Please choose a smaller file.',
      ));
      return;
    }

    setUploadedFileId(null);
    setUploadedFileUrl('');

    // Pre-fill App Name if not set yet
    if (!newAppName) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewAppName(cleanName);
    }

    try {
      setUploading(true);
      if (!BUCKET_ID) throw new Error('Storage bucket not configured');
      const uploaded = await storage.createFile({
        bucketId: BUCKET_ID,
        fileId: ID.unique(),
        file,
        permissions: [Permission.read(Role.any())],
      });
      const url = storage.getFileView(BUCKET_ID, uploaded.$id).toString();
      setUploadedFileId(uploaded.$id);
      setUploadedFileName(file.name);
      setUploadedFileSize(file.size);
      setUploadedFileUrl(url);
    } catch (err) {
      setUploadError(
        err instanceof Error && err.message
          ? err.message
          : t('فشل رفع الملف. يرجى المحاولة مجدداً.', "Échec du téléversement.", 'Upload failed. Please try again.'),
      );
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  // -------------------------------------------------------------------------
  // Step 1 Validation -> Proceed to Step 2 (Ad Units)
  // -------------------------------------------------------------------------
  const handleNextStep1 = () => {
    setUploadError(null);
    if (appSourceMode === 'new_upload' && !newAppName.trim()) {
      setUploadError(t(
        'يرجى إدخال اسم التطبيق للمتابعة.',
        "Veuillez saisir le nom de l'application.",
        'Please enter an app name to continue.',
      ));
      return;
    }
    setStep(2);
  };

  // -------------------------------------------------------------------------
  // Step 2 Validation -> Proceed to Step 3 (Review & Confirm)
  // -------------------------------------------------------------------------
  const handleNextStep2 = () => {
    const appIdClean = admobAppId.trim();
    const bannerClean = admobBannerId.trim();
    const interstitialClean = admobInterstitialId.trim();
    const rewardedClean = admobRewardedId.trim();
    const appOpenClean = admobAppOpenId.trim();
    const nativeClean = admobNativeId.trim();

    if (appIdClean && !ADMOB_APP_RE.test(appIdClean)) {
      setCredError(t(
        'معرّف تطبيق AdMob غير صالح. الصيغة المطلوبة: ca-app-pub-XXXXXXXXXX~XXXXXXXX',
        "L'App ID AdMob doit respecter le format : ca-app-pub-XXXXXXXXXX~XXXXXXXX",
        'Invalid AdMob App ID. Format: ca-app-pub-XXXXXXXXXX~XXXXXXXX',
      ));
      return;
    }

    const checkUnit = (val: string, name: string) => {
      if (val && !ADMOB_UNIT_RE.test(val)) {
        return t(
          `صيغة معرّف وحدة ${name} غير صالحة. الصيغة المطلوبة: ca-app-pub-XXXXXXXXXX/XXXXXXXX`,
          `Format de l'unité ${name} invalide : ca-app-pub-XXXXXXXXXX/XXXXXXXX`,
          `Invalid ${name} Unit ID. Format: ca-app-pub-XXXXXXXXXX/XXXXXXXX`,
        );
      }
      return null;
    };

    const err =
      checkUnit(bannerClean, 'Banner') ||
      checkUnit(interstitialClean, 'Interstitial') ||
      checkUnit(rewardedClean, 'Rewarded') ||
      checkUnit(appOpenClean, 'App Open') ||
      checkUnit(nativeClean, 'Native');

    if (err) {
      setCredError(err);
      return;
    }

    setCredError(null);
    setStep(3);
  };

  // -------------------------------------------------------------------------
  // Subscription Activation via PayPal
  // -------------------------------------------------------------------------
  const handleActivatePayPal = () => {
    if (!user) return;
    if (!txnInput.trim()) {
      alert(t(
        'يرجى إدخال رقم المعاملة أو بريد PayPal المُرسل منه لتفعيل الاشتراك.',
        "Veuillez entrer l'identifiant de transaction ou votre email PayPal.",
        'Please enter the Transaction ID or sender PayPal email to activate.',
      ));
      return;
    }

    setSubActivating(true);
    setTimeout(() => {
      const updated = activateUserSubscription(user.$id, txnInput.trim(), 30);
      setSubscription(updated);
      setSubActivating(false);
      setShowPayModal(false);
      setSubSuccessMsg(t(
        'تم تفعيل اشتراك AdMob Pro لمدة شهر بنجاح! يمكنك الآن إضافة الإعلانات بدون حدود.',
        'Abonnement AdMob Pro activé avec succès pour 1 mois !',
        'AdMob Pro subscription activated for 1 month! You can now add unlimited ads.',
      ));
      setTimeout(() => setSubSuccessMsg(null), 6000);
    }, 800);
  };

  const copyPayPalEmail = () => {
    navigator.clipboard.writeText(PAYPAL_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  // -------------------------------------------------------------------------
  // Celebratory Multi-Stage Fireworks & Chime
  // -------------------------------------------------------------------------
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

    // Multi-stage confetti fireworks from angles and center
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

  // -------------------------------------------------------------------------
  // Step 3: Save to Database & Finish
  // -------------------------------------------------------------------------
  const handleSave = async () => {
    if (!user) return;

    // Gate: Check if user has active subscription
    if (!subscription.isActive) {
      setShowPayModal(true);
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      let targetAppId = selectedAppId;

      if (appSourceMode === 'new_upload') {
        // Create new app record in Appwrite Database
        const newDoc = await databases.createDocument(DB_ID, TABLE_ID, ID.unique(), {
          user_id: user.$id,
          app_name: newAppName.trim() || 'My Mobile App',
          store_url: newStoreUrl.trim() || 'https://appifya.app',
          theme_color: '#6366f1',
          admob_app_id: admobAppId.trim() || undefined,
          admob_banner_unit_id: admobBannerId.trim() || undefined,
        });
        targetAppId = newDoc.$id;
      } else if (targetAppId) {
        // Update existing app
        await databases.updateDocument(DB_ID, TABLE_ID, targetAppId, {
          admob_app_id: admobAppId.trim() || null,
          admob_banner_unit_id: admobBannerId.trim() || null,
        });
      }

      // Persist full multi-unit AdMob config in local storage for APK builder dispatch
      const adUnitsPayload = {
        appId: admobAppId.trim(),
        bannerId: admobBannerId.trim(),
        interstitialId: admobInterstitialId.trim(),
        rewardedId: admobRewardedId.trim(),
        appOpenId: admobAppOpenId.trim(),
        nativeId: admobNativeId.trim(),
        uploadedFileId,
        uploadedFileName,
        uploadedFileUrl,
        uploadedAt: new Date().toISOString(),
      };
      localStorage.setItem(`appifya_ad_units_${targetAppId}`, JSON.stringify(adUnitsPayload));

      setSavedAppId(targetAppId);
      setDone(true);
      triggerCelebration();
    } catch (err) {
      setSaveError(
        err instanceof Error && err.message
          ? err.message
          : t('فشل الحفظ. يرجى المحاولة مجدداً.', "Échec de l'enregistrement.", 'Save failed. Please try again.'),
      );
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Auth Loading & Guard
  // -------------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="h-16 w-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <DollarSign className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">
          {t('يرجى تسجيل الدخول للوصول إلى إعدادات AdMob', 'Connectez-vous pour accéder à AdMob', 'Please sign in to access AdMob setup')}
        </h2>
        <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
          {t(
            'سجل دخولك لحفظ معرّفات إعلاناتك، رفع تطبيقاتك، وتفعيل باقة تحقيق الأرباح مدى الحياة.',
            'Connectez-vous pour gérer vos annonces AdMob et activer votre forfait à vie.',
            'Sign in to manage AdMob ad units, upload your applications, and activate your lifetime monetization plan.',
          )}
        </p>
        <button
          onClick={() => openAuthModal()}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/25 cursor-pointer"
        >
          {t('تسجيل الدخول الآن', 'Se connecter maintenant', 'Sign In Now')}
        </button>
      </div>
    );
  }

  const selectedApp = apps.find((a) => a.$id === selectedAppId);
  const currentAppName = appSourceMode === 'new_upload' ? (newAppName || t('تطبيق جديد', 'Nouvelle application', 'New App')) : (selectedApp?.app_name || t('تطبيق بدون اسم', 'Sans titre', 'Untitled'));
  const fileRetention = getFileRetentionStatus(new Date());

  // -------------------------------------------------------------------------
  // SUCCESS & CELEBRATION SCREEN (The Celebration Moment 🎉)
  // -------------------------------------------------------------------------
  if (done) {
    return (
      <main className="theme-page flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Animated Celebration Radar & Icon */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 rounded-3xl bg-emerald-500/25 animate-ping opacity-75"></span>
          <span className="absolute inset-2 rounded-2xl border-2 border-emerald-400/40 animate-pulse"></span>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 text-white shadow-2xl shadow-emerald-500/40">
            <PartyPopper className="h-10 w-10 text-amber-200 animate-bounce" />
          </div>
        </div>

        {/* Badge & Headings */}
        <div className="space-y-3 mb-6">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 text-xs font-black uppercase tracking-wider shadow-sm">
            {t('🎉 تم ربط AdMob وتفعيل الأرباح بنجاح 100% (Pro Studio Plan)', '🎉 AdMob activé à 100% (Pro Studio)', '🎉 AdMob Monetization Activated 100% (Pro Studio)')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t('ألـف مـبـروك! تطبيقك جاهز الآن', 'Félicitations ! Votre application est prête', 'Congratulations! Your App is Ready')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            {t(
              `تم حفظ إعدادات إعلانات Google AdMob لتطبيق "${currentAppName}" بنجاح! تم تفعيل أحقية الأرباح بنسبة 100% لك بالكامل مع شهادة التوقيع الرسمية لمتجر Google Play. ملفك الآن جاهز للتجميع والتنزيل الفوري.`,
              `Les identifiants AdMob pour "${currentAppName}" ont été configurés avec 100% des revenus pour vous. Compilez ou téléchargez votre APK monétisé !`,
              `Google AdMob monetization configured for "${currentAppName}" with 100% ad earnings to you. You can now compile and download your monetized APK!`,
            )}
          </p>
        </div>

        {/* Feature Badges Card */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-4 mb-6 space-y-2.5 text-xs text-slate-200 text-start" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{t('أرباح الإعلانات 100% في حسابك البنكي مباشرة بدون أي عمولة أو اقتطاع', '100% de vos gains directement sans commission', '100% ad revenue directly to your account with zero commission')}</span>
          </div>
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{t('متوافق مع حزم Google Play الرسمية (Release Keystore) ومعتمد للتثبيت الفوري', 'Compatible Google Play et installation immédiate', 'Google Play release compatible & ready for instant install')}</span>
          </div>
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{t('تم حفظ معرّفات الوحدات الإعلانية ومزامنتها تلقائياً مع خادم البناء السحابي', 'Unités publicitaires synchronisées avec le serveur de build', 'Ad units synchronized with cloud build runner')}</span>
          </div>
        </div>

        {/* Retention alert */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 mb-6 text-xs text-amber-300 flex items-center gap-3 text-start">
          <Clock className="h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="font-bold">
              {t('تنبيه حفظ الملفات (سياسة 10 أيام)', 'Avis de conservation (10 jours)', 'File Retention Notice (10 Days)')}
            </p>
            <p className="text-[11px] text-amber-300/80 mt-0.5">
              {t(
                `يتم تخزين الملفات المرفوعة مؤقتاً لمدة ${RETENTION_DAYS} أيام على الخادم لتوفير المساحة (حتى تاريخ ${new Date(fileRetention.expiryDate).toLocaleDateString('ar-EG')}). يرجى تنزيل نسختك والاحتفاظ بها محلياً.`,
                `Les fichiers sont conservés pendant ${RETENTION_DAYS} jours maximum sur le serveur (jusqu'au ${new Date(fileRetention.expiryDate).toLocaleDateString('fr-FR')}). Veuillez télécharger votre copie.`,
                `Uploaded files are retained on our servers for up to ${RETENTION_DAYS} days (until ${new Date(fileRetention.expiryDate).toLocaleDateString('en-US')}). Please download and keep your local copy.`,
              )}
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 mb-8 text-start space-y-3" dir="ltr">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Configuration Summary</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Application</span>
              <span className="text-white font-semibold">{currentAppName}</span>
            </div>
            {admobAppId && (
              <div className="flex justify-between">
                <span className="text-slate-400">AdMob App ID</span>
                <span className="text-indigo-400 font-mono">{admobAppId}</span>
              </div>
            )}
            {admobBannerId && (
              <div className="flex justify-between">
                <span className="text-slate-400">Banner Ad</span>
                <span className="text-indigo-400 font-mono">{admobBannerId}</span>
              </div>
            )}
            {admobInterstitialId && (
              <div className="flex justify-between">
                <span className="text-slate-400">Interstitial Ad</span>
                <span className="text-indigo-400 font-mono">{admobInterstitialId}</span>
              </div>
            )}
            {admobRewardedId && (
              <div className="flex justify-between">
                <span className="text-slate-400">Rewarded Ad</span>
                <span className="text-indigo-400 font-mono">{admobRewardedId}</span>
              </div>
            )}
            {admobAppOpenId && (
              <div className="flex justify-between">
                <span className="text-slate-400">App Open Ad</span>
                <span className="text-indigo-400 font-mono">{admobAppOpenId}</span>
              </div>
            )}
            {admobNativeId && (
              <div className="flex justify-between">
                <span className="text-slate-400">Native Advanced</span>
                <span className="text-indigo-400 font-mono">{admobNativeId}</span>
              </div>
            )}
            {uploadedFileName && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-slate-400">Uploaded File</span>
                <a
                  href={uploadedFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  <span>{uploadedFileName}</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 max-w-md mx-auto">
          {/* Prominent Glowing Emerald Action Button */}
          <Link
            href={savedAppId ? `/dashboard?app=${savedAppId}` : '/dashboard'}
            onClick={() => triggerCelebration()}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Download className="h-5 w-5 animate-bounce" />
            <span>{t('📥 بناء وتنزيل ملف الـ APK المجهز بالإعلانات', "Compiler & Télécharger l'APK Monétisé", 'Build & Download Monetized APK Now')}</span>
          </Link>

          <div className="flex items-center justify-center gap-4 text-xs">
            {/* Interactive Celebration Fireworks Button */}
            <button
              type="button"
              onClick={() => triggerCelebration()}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t('أطلق الألعاب النارية مجدداً 🎉', 'Célébrer à nouveau 🎉', 'Celebrate again 🎉')}</span>
            </button>

            <span className="text-slate-600">·</span>

            <button
              type="button"
              onClick={() => {
                setDone(false);
                setStep(1);
                setUploadedFileId(null);
                setUploadedFileUrl('');
                setUploadedFileName('');
              }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
            >
              <span>{t('إعداد تطبيق آخر', 'Configurer une autre app', 'Set up another app')}</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------------------
  // MAIN WIZARD
  // -------------------------------------------------------------------------
  return (
    <main className="theme-page flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <DollarSign className="h-3.5 w-3.5" />
          <span>{t('تسييل التطبيقات عبر Google AdMob', 'Monétisation Google AdMob', 'Google AdMob Monetization')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          {t('ارفع تطبيقك وفعّل جميع أنواع الإعلانات', 'Téléversez votre app et activez les annonces AdMob', 'Upload Your App & Activate All AdMob Formats')}
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 text-xs sm:text-sm leading-relaxed">
          {t(
            'ارفع ملف تطبيقك (APK / AAB) أو اختر تطبيقك من المنصة، أدخل معرّفات AdMob، وامتلك شفرات إعلاناتك وحزم المتجر مدى الحياة بدفع لمرة واحدة فقط.',
            'Téléversez votre fichier APK/AAB ou sélectionnez une app existante. Intégrez vos annonces AdMob à vie avec un paiement unique.',
            'Upload your APK/AAB app file or pick an existing app. Add Banners, Interstitials, Rewarded & App Open units with lifetime ownership.',
          )}
        </p>
      </div>

      {/* Subscription Status Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold ${
            subscription.isActive
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400'
          }`}>
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {subscription.plan === 'agency'
                  ? t('حزمة الوكالات (نشطة · 5 تطبيقات)', 'Pack Agence (Actif · 5 apps)', 'Agency Pack Active (5 Apps)')
                  : subscription.isActive
                  ? t('باقة Standard Pro (نشطة · مدى الحياة)', 'Standard Pro (Actif · À vie)', 'Standard Pro Active (Lifetime)')
                  : t('باقة تسييل التطبيقات (غير مفعلة)', 'Plan Monétisation (Inactif)', 'Monetization Plan (Inactive)')}
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
                  : '$29 / one-time'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {subscription.isActive
                ? t('ترخيص دائم للأبد · أرباح الإعلانات 100% لك دون أي وسيط', 'Licence permanente à vie', 'Lifetime license · 100% ad revenue directly yours')
                : t('ادفع لمرة واحدة ($29) وامتلك شفرات AdMob وحزم AAB + APK الرسمية مدى الحياة', 'Payez une seule fois (29$) pour débloquer AdMob à vie', 'Pay once ($29) to own AdMob ads and Google Play binaries forever')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPayModal(true)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0 ${
            subscription.isActive
              ? 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20'
          }`}
        >
          {subscription.isActive
            ? t('ترقية / خدمات إضافية', 'Gérer / Options', 'Upgrade / Add-ons')
            : t('تفعيل الباقة ($29 لمرة واحدة)', 'Activer (29$ à vie)', 'Activate ($29 Lifetime)')}
        </button>
      </div>

      {/* Success alert when subscription activated */}
      {subSuccessMsg && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{subSuccessMsg}</span>
        </div>
      )}

      {/* Wizard Step Indicator */}
      <StepIndicator current={step} labels={stepLabels} />

      {/* ------------------------------------------------------------------ */}
      {/* STEP 1: Application Selection & File Upload                        */}
      {/* ------------------------------------------------------------------ */}
      {step === 1 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">
                {t('الخطوة 1: اختيار أو رفع التطبيق', 'Étape 1 : Choisir ou téléverser', 'Step 1: Select or Upload App')}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('حدد مصدر التطبيق المراد دمجه مع إعلانات Google AdMob.', "Sélectionnez l'application à monétiser.", 'Choose the application you want to monetize.')}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => setAppSourceMode('new_upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  appSourceMode === 'new_upload'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('رفع تطبيق جديد', 'Téléverser nouvelle app', 'Upload New App')}
              </button>
              <button
                type="button"
                onClick={() => setAppSourceMode('existing_app')}
                disabled={apps.length === 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  appSourceMode === 'existing_app'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : apps.length === 0
                    ? 'text-slate-600 cursor-not-allowed opacity-50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('من تطبيقاتي', 'Mes applications', 'My Existing Apps')}
              </button>
            </div>
          </div>

          {/* Form fields based on Mode */}
          {appSourceMode === 'new_upload' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('اسم التطبيق', "Nom de l'application", 'Application Name')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="My Store App"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('رابط المتجر أو الموقع (اختياري)', 'URL du site web (Facultatif)', 'Store / Website URL (Optional)')}
                </label>
                <input
                  type="url"
                  value={newStoreUrl}
                  onChange={(e) => setNewStoreUrl(e.target.value)}
                  placeholder="https://my-store.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  dir="ltr"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('اختر التطبيق من حسابك', 'Sélectionnez votre app', 'Select App from Account')}
              </label>
              <div className="relative">
                <select
                  value={selectedAppId}
                  onChange={(e) => handleAppChange(e.target.value)}
                  className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {appsLoading ? (
                    <option value="" disabled>{t('جاري جلب التطبيقات...', 'Chargement...', 'Loading apps...')}</option>
                  ) : apps.length === 0 ? (
                    <option value="" disabled>{t('لا توجد تطبيقات سابقة', 'Aucune app', 'No previous apps')}</option>
                  ) : (
                    apps.map((app) => (
                      <option key={app.$id} value={app.$id} className="bg-slate-900">
                        {app.app_name || t('تطبيق بدون اسم', 'Sans titre', 'Untitled')} — {app.store_url}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>
          )}

          {/* Drag & Drop File Upload Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300">
                {t('رفع ملف التطبيق (APK / AAB / ZIP)', "Fichier de l'application (APK / AAB)", 'App File (APK / AAB / ZIP)')}
              </label>
              <span className="text-[11px] text-slate-500">
                {t('بحد أقصى 100 ميجابايت', 'Max 100 Mo', 'Max 100 MB')}
              </span>
            </div>

            {!uploadedFileId ? (
              <div
                role="button"
                tabIndex={0}
                aria-label={t('منطقة رفع ملف التطبيق', 'Zone de téléversement', 'App file upload area')}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all ${
                  dragOver
                    ? 'border-indigo-400 bg-indigo-500/10'
                    : 'border-slate-700 bg-slate-950/50 hover:border-indigo-500/60 hover:bg-slate-950'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-9 w-9 text-indigo-400 animate-spin" />
                    <p className="text-xs font-semibold text-slate-300">
                      {t('جاري رفع الملف إلى الخادم الآمن...', 'Téléversement en cours...', 'Uploading file to secure server...')}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-bold text-white">
                        {t('اسحب ملف التطبيق هنا أو انقر للتصفح', 'Déposez le fichier ici ou cliquez', 'Drag app file here or click to browse')}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        APK · AAB · IPA · ZIP — {t('جاهز لإدماج إعلانات AdMob', 'Prêt pour AdMob', 'Ready for AdMob injection')}
                      </p>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".apk,.aab,.ipa,.zip"
                  className="sr-only"
                  onChange={onFileInputChange}
                  tabIndex={-1}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-white truncate">{uploadedFileName}</p>
                  <p className="text-[11px] text-slate-400">{formatBytes(uploadedFileSize)}</p>
                  <a
                    href={uploadedFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    <span>{t('معاينة / تنزيل الملف', 'Télécharger', 'Download file')}</span>
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => { setUploadedFileId(null); setUploadedFileName(''); setUploadedFileUrl(''); }}
                  className="p-2 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                  title={t('إزالة الملف', 'Supprimer', 'Remove')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {uploadError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* 10-day retention notice box */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-start gap-3 text-xs text-slate-400">
            <Clock className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold text-slate-300">
                {t('سياسة حفظ الملفات على السيرفر (10 أيام كحد أقصى)', 'Conservation des fichiers (10 jours)', 'Server File Retention Policy (10 Days Max)')}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {t(
                  'يتم الاحتفاظ بنسخ التطبيقات المرفوعة على خوادمنا لمدة 10 أيام فقط، وتُحذف تلقائياً لتوفير المساحة والأمان. يمكنك تنزيل نسختك في أي وقت خلال هذه الفترة.',
                  'Les fichiers téléversés sont conservés 10 jours maximum sur nos serveurs avant suppression automatique.',
                  'Uploaded app packages are stored on our servers for 10 days only and automatically cleaned up afterwards.',
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextStep1}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <span>{t('التالي: إدخال معرّفات AdMob', 'Suivant : Identifiants AdMob', 'Next: AdMob Ad Units')}</span>
            <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP 2: AdMob All Ad Formats Configuration                        */}
      {/* ------------------------------------------------------------------ */}
      {step === 2 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white mb-1">
              {t('الخطوة 2: جميع أنواع إعلانات Google AdMob', 'Étape 2 : Tous les formats AdMob', 'Step 2: All AdMob Ad Formats')}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t(
                'أدخل معرّف تطبيقك (App ID) ووحدات الإعلانات التي ترغب بتضمينها في التطبيق. يمكنك تفعيل أي نوع تريده.',
                'Saisissez votre App ID et les identifiants des formats publicitaires que vous souhaitez activer.',
                'Enter your AdMob App ID and the ad unit IDs you wish to activate in your application.',
              )}
            </p>
          </div>

          <div className="space-y-4">
            {/* Primary App ID */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  AdMob App ID <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-indigo-400 font-mono">ca-app-pub-XXXXXXXXXX~XXXXXXXX</span>
              </div>
              <input
                type="text"
                value={admobAppId}
                onChange={(e) => { setAdmobAppId(e.target.value); setCredError(null); }}
                placeholder="ca-app-pub-3940256099942544~3347511713"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                {t('معرّف التطبيق الرئيسي الخاص بحسابك في AdMob', 'Identifiant principal de votre application dans AdMob', 'Your primary AdMob App Identifier')}
              </p>
            </div>

            {/* Grid of Ad Formats */}
            <div className="pt-2 border-t border-slate-800/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <span>{t('وحدات الإعلانات المدعومة', 'Formats publicitaires supportés', 'Supported Ad Formats')}</span>
              </h3>

              {/* 1. Banner Ad Unit */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span>{t('1. إعلان شريطي (Banner Ad)', '1. Bannière (Banner Ad)', '1. Banner Ad Unit')}</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">ca-app-pub-XXXXXXXXXX/XXXXXXXX</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {t('يظهر في أسفل أو أعلى الشاشة داخل متجرك أو تطبيقك.', 'Affiché en haut ou en bas de l’application.', 'Appears at the bottom or top of your app screens.')}
                </p>
                <input
                  type="text"
                  value={admobBannerId}
                  onChange={(e) => { setAdmobBannerId(e.target.value); setCredError(null); }}
                  placeholder="ca-app-pub-3940256099942544/6300978111"
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 2. Interstitial Ad Unit */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    <span>{t('2. إعلان بيني كامل الشاشة (Interstitial Ad)', '2. Interstitiel (Interstitial Ad)', '2. Full-Screen Interstitial Ad')}</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">ca-app-pub-XXXXXXXXXX/XXXXXXXX</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {t('يظهر عند الانتقال بين الصفحات أو عند إتمام عملية الشراء.', 'S’affiche lors des transitions de pages ou après une action.', 'Full-screen ads shown during page transitions or actions.')}
                </p>
                <input
                  type="text"
                  value={admobInterstitialId}
                  onChange={(e) => { setAdmobInterstitialId(e.target.value); setCredError(null); }}
                  placeholder="ca-app-pub-3940256099942544/1033173712"
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 3. Rewarded Video Ad Unit */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{t('3. إعلان بمكافأة (Rewarded Video Ad)', '3. Vidéo avec récompense (Rewarded Ad)', '3. Rewarded Video Ad')}</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">ca-app-pub-XXXXXXXXXX/XXXXXXXX</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {t('يمنح المستخدم نقاطاً أو خصماً مقابل مشاهدة فيديو إعلاني كامل.', 'Offre une récompense en échange du visionnage complet.', 'Grants rewards or discounts for watching a video.')}
                </p>
                <input
                  type="text"
                  value={admobRewardedId}
                  onChange={(e) => { setAdmobRewardedId(e.target.value); setCredError(null); }}
                  placeholder="ca-app-pub-3940256099942544/5224354917"
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 4. App Open Ad Unit */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>{t('4. إعلان فتح التطبيق (App Open Ad)', '4. Annonce à l’ouverture (App Open Ad)', '4. App Open Ad')}</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">ca-app-pub-XXXXXXXXXX/XXXXXXXX</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {t('يظهر تلقائياً عندما يقوم المستخدم بفتح التطبيق أو استئنافه.', 'S’affiche lorsque l’utilisateur ouvre ou reprend l’app.', 'Displays automatically when user opens or resumes the app.')}
                </p>
                <input
                  type="text"
                  value={admobAppOpenId}
                  onChange={(e) => { setAdmobAppOpenId(e.target.value); setCredError(null); }}
                  placeholder="ca-app-pub-3940256099942544/3419835294"
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 5. Native Advanced Unit */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    <span>{t('5. إعلان مدمج أصلي (Native Advanced Ad)', '5. Annonce native (Native Advanced)', '5. Native Advanced Ad')}</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">ca-app-pub-XXXXXXXXXX/XXXXXXXX</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {t('إعلان يندمج بسلاسة مع بطاقات وتصميم واجهة التطبيق.', 'Format natif personnalisé s’intégrant à votre design.', 'Seamlessly blends with your app layout and feed.')}
                </p>
                <input
                  type="text"
                  value={admobNativeId}
                  onChange={(e) => { setAdmobNativeId(e.target.value); setCredError(null); }}
                  placeholder="ca-app-pub-3940256099942544/2247696110"
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs leading-relaxed text-indigo-300 flex items-start gap-3">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
            <div>
              <strong>{t('أين تجد معرّفات AdMob؟', 'Où trouver ces identifiants ?', 'Where to find these IDs?')}</strong>{' '}
              {t(
                'افتح حسابك في admob.google.com ← التطبيقات ← إضافة تطبيق أو اختر تطبيقك ← وحدات الإعلانات (Ad Units) ← أنشئ الوحدات المطلوبة وانسخ المعرّف الخاص بكل نوع.',
                'Ouvrez admob.google.com → Applications → Blocs d’annonces → Créer le format souhaité et copiez le code.',
                'Open admob.google.com → Apps → Ad units → Create desired ad format and copy its unit ID.',
              )}
            </div>
          </div>

          {credError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{credError}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-slate-700 bg-slate-900 text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('رجوع', 'Retour', 'Back')}
            </button>
            <button
              type="button"
              onClick={handleNextStep2}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              <span>{t('التالي: المراجعة والتأكيد', 'Suivant : Révision', 'Next: Review & Confirm')}</span>
              <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP 3: Review, Subscription & Save                                */}
      {/* ------------------------------------------------------------------ */}
      {step === 3 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white mb-1">
              {t('الخطوة 3: المراجعة وحفظ إعدادات AdMob', 'Étape 3 : Révision et enregistrement', 'Step 3: Review & Finalize AdMob Setup')}
            </h2>
            <p className="text-xs text-slate-400">
              {t('تحقق من تفاصيل التطبيق ووحدات الإعلانات قبل تفعيلها وبناء ملف الـ APK النهائي.', 'Vérifiez les informations avant la sauvegarde.', 'Review your application details and ad units before finalizing.')}
            </p>
          </div>

          {/* Subscription Check Status Card */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            subscription.isActive
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
          }`}>
            <div className="flex items-center gap-2.5">
              {subscription.isActive ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
              )}
              <div>
                <p className="font-bold">
                  {subscription.isActive
                    ? t('باقة AdMob Pro مفعلة مدى الحياة · مؤهل لتضمين الإعلانات وحزم المتجر', 'AdMob Pro à vie actif', 'Lifetime AdMob Pro Active · Store Bundles Ready')
                    : t('يتطلب تفعيل باقة Standard Pro ($29 تدفع مرة واحدة) لإتمام الحفظ وتضمين AdMob للأبد', 'Forfait Standard Pro requis (29$ à vie)', 'Standard Pro Lifetime Plan Required ($29 One-Time)')}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {subscription.isActive
                    ? t('ترخيص دائم للأبد · أرباح الإعلانات 100% لك دون أي وسيط', 'Licence permanente à vie', 'Lifetime license · 100% ad revenue directly yours')
                    : t('ادفع لمرة واحدة وامتلك شفرات AdMob وحزم AAB + APK الرسمية لمتجر Google Play للأبد', 'Payez une seule fois pour débloquer AdMob à vie', 'Pay once to own your AdMob ads and Google Play binaries forever')}
                </p>
              </div>
            </div>

            {!subscription.isActive && (
              <button
                type="button"
                onClick={() => setShowPayModal(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs cursor-pointer shrink-0 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                {t('تفعيل بـ 29$ لمرة واحدة', 'Activer (29$ à vie)', 'Activate ($29 Lifetime)')}
              </button>
            )}
          </div>

          {/* Configuration Summary Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3 text-xs" dir="ltr">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Application Name</span>
              <span className="text-white font-bold">{currentAppName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Setup Source</span>
              <span className="text-indigo-400 font-semibold">
                {appSourceMode === 'new_upload' ? 'Direct Application Upload' : 'Existing App Document'}
              </span>
            </div>

            {uploadedFileName && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 font-medium">Uploaded File</span>
                <span className="text-emerald-400 font-semibold">{uploadedFileName} ({formatBytes(uploadedFileSize)})</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Configured Ad Units</p>
              <div className="flex justify-between">
                <span className="text-slate-400">AdMob App ID:</span>
                <span className="text-white font-mono">{admobAppId || 'Not set'}</span>
              </div>
              {admobBannerId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Banner Unit:</span>
                  <span className="text-indigo-400 font-mono">{admobBannerId}</span>
                </div>
              )}
              {admobInterstitialId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Interstitial Unit:</span>
                  <span className="text-purple-400 font-mono">{admobInterstitialId}</span>
                </div>
              )}
              {admobRewardedId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Rewarded Unit:</span>
                  <span className="text-emerald-400 font-mono">{admobRewardedId}</span>
                </div>
              )}
              {admobAppOpenId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">App Open Unit:</span>
                  <span className="text-amber-400 font-mono">{admobAppOpenId}</span>
                </div>
              )}
              {admobNativeId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Native Advanced:</span>
                  <span className="text-cyan-400 font-mono">{admobNativeId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Retention notice reminder */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              {t(
                `يتم الاحتفاظ بملف التطبيق المرفوع على خوادمنا لمدة ${RETENTION_DAYS} أيام ثم يُحذف تلقائياً. تأكد من تحميل نسخة تطبيقك.`,
                `Les fichiers téléversés sont conservés pendant ${RETENTION_DAYS} jours avant suppression automatique.`,
                `Uploaded files are retained on our servers for ${RETENTION_DAYS} days before auto-cleanup.`,
              )}
            </span>
          </div>

          {saveError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={saving}
              className="flex-1 py-3 border border-slate-700 bg-slate-900 text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {t('رجوع', 'Retour', 'Back')}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>
                {saving
                  ? t('جاري الحفظ والتجهيز...', 'Enregistrement...', 'Saving & Preparing...')
                  : t('حفظ وإنهاء الإعداد', 'Sauvegarder et terminer', 'Save & Finish Setup')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* PAYPAL SUBSCRIPTION / PLAN UPGRADE MODAL                            */}
      {/* ------------------------------------------------------------------ */}
      <PlanUpgradeModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        onSuccess={() => {
          refreshSubscription();
        }}
        defaultPlan="standard"
        appId={selectedAppId || undefined}
      />

    </main>
  );
}
