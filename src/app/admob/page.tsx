'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '../lib/i18n';
import { databases, storage, DB_ID, TABLE_ID, BUCKET_ID } from '@/lib/appwrite';
import { Query, ID, Permission, Role } from 'appwrite';
import type { AppDocument } from '@/lib/types';
import {
  Smartphone,
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
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ADMOB_APP_RE = /^ca-app-pub-\d{10,}~\d{8,}$/;
const ADMOB_UNIT_RE = /^ca-app-pub-\d{10,}\/\d{6,}$/;
const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB
const ALLOWED_EXTS = ['.apk', '.aab', '.ipa'];

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
    <div className="flex items-center justify-center gap-0 mb-10 select-none" role="list" aria-label="Wizard steps">
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
                className={`text-[10px] font-semibold whitespace-nowrap ${
                  active ? 'text-indigo-300' : done ? 'text-emerald-400' : 'text-slate-600'
                }`}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className={`h-0.5 w-16 sm:w-24 mb-5 mx-1 transition-colors ${
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
// Info tip box
// ---------------------------------------------------------------------------

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs leading-6 text-indigo-300">
      <Info className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
      <div>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdMobPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  // App list
  const [apps, setApps] = useState<AppDocument[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState('');

  // Step state
  const [step, setStep] = useState(1);

  // Step 1 — credentials
  const [admobAppId, setAdmobAppId] = useState('');
  const [admobBannerId, setAdmobBannerId] = useState('');
  const [credError, setCredError] = useState<string | null>(null);

  // Step 2 — file upload
  const [appFile, setAppFile] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3 — save
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // -------------------------------------------------------------------------
  // i18n helpers
  // -------------------------------------------------------------------------

  const t = useCallback((ar: string, fr: string, en: string) => {
    if (lang === 'ar') return ar;
    if (lang === 'fr') return fr;
    return en;
  }, [lang]);

  const stepLabels = [
    t('الإعلانات', 'AdMob', 'AdMob IDs'),
    t('رفع الملف', 'Téléversement', 'Upload file'),
    t('التأكيد', 'Confirmation', 'Confirm'),
  ];

  // -------------------------------------------------------------------------
  // Load apps
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
      if (docs.length > 0 && !selectedAppId) {
        const first = docs[0];
        setSelectedAppId(first.$id);
        setAdmobAppId(first.admob_app_id || '');
        setAdmobBannerId(first.admob_banner_unit_id || '');
      }
    } catch {
      // silent — user will see empty selector
    } finally {
      setAppsLoading(false);
    }
  }, [user, selectedAppId]);

  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal();
    } else if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadApps();
    }
  }, [user, authLoading, loadApps, openAuthModal]);

  // When the selected app changes, pre-fill existing AdMob IDs
  const handleAppChange = (id: string) => {
    setSelectedAppId(id);
    const app = apps.find((a) => a.$id === id);
    if (app) {
      setAdmobAppId(app.admob_app_id || '');
      setAdmobBannerId(app.admob_banner_unit_id || '');
    }
    setCredError(null);
  };

  // -------------------------------------------------------------------------
  // Step 1 — validate credentials
  // -------------------------------------------------------------------------

  const handleNextStep1 = () => {
    const appIdClean = admobAppId.trim();
    const bannerClean = admobBannerId.trim();

    if (appIdClean && !ADMOB_APP_RE.test(appIdClean)) {
      setCredError(t(
        'معرّف تطبيق AdMob غير صالح. الصيغة المطلوبة: ca-app-pub-XXXXXXXXXX~XXXXXXXX',
        "L'identifiant AdMob doit respecter le format : ca-app-pub-XXXXXXXXXX~XXXXXXXX",
        'Invalid AdMob App ID. Expected format: ca-app-pub-XXXXXXXXXX~XXXXXXXX',
      ));
      return;
    }
    if (bannerClean && !ADMOB_UNIT_RE.test(bannerClean)) {
      setCredError(t(
        'معرّف إعلان Banner غير صالح. الصيغة المطلوبة: ca-app-pub-XXXXXXXXXX/XXXXXX',
        "L'identifiant Banner doit respecter le format : ca-app-pub-XXXXXXXXXX/XXXXXX",
        'Invalid Banner Ad Unit ID. Expected format: ca-app-pub-XXXXXXXXXX/XXXXXX',
      ));
      return;
    }
    setCredError(null);
    setStep(2);
  };

  // -------------------------------------------------------------------------
  // Step 2 — file handling
  // -------------------------------------------------------------------------

  const handleFile = async (file: File) => {
    setUploadError(null);
    const ext = fileExtension(file.name);
    if (!ALLOWED_EXTS.includes(ext)) {
      setUploadError(t(
        `نوع الملف غير مدعوم. الأنواع المقبولة: ${ALLOWED_EXTS.join(', ')}`,
        `Type de fichier non pris en charge. Types acceptés : ${ALLOWED_EXTS.join(', ')}`,
        `Unsupported file type. Accepted: ${ALLOWED_EXTS.join(', ')}`,
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

    setAppFile(file);
    setUploadedFileId(null);
    setUploadedFileUrl('');

    try {
      setUploading(true);
      if (!BUCKET_ID) throw new Error('Storage not configured');
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
      setAppFile(null);
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // -------------------------------------------------------------------------
  // Step 3 — save to Appwrite
  // -------------------------------------------------------------------------

  const handleSave = async () => {
    if (!selectedAppId) return;
    try {
      setSaving(true);
      setSaveError(null);
      await databases.updateDocument(DB_ID, TABLE_ID, selectedAppId, {
        admob_app_id: admobAppId.trim() || null,
        admob_banner_unit_id: admobBannerId.trim() || null,
      });
      setDone(true);
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
  // Loading / auth guards
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
        <Smartphone className="h-12 w-12 text-indigo-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          {t('يرجى تسجيل الدخول للوصول إلى هذه الصفحة', 'Connectez-vous pour accéder à cette page', 'Please sign in to access this page')}
        </h2>
        <button
          onClick={() => openAuthModal()}
          className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20"
        >
          {t('تسجيل الدخول', 'Se connecter', 'Sign in')}
        </button>
      </div>
    );
  }

  const selectedApp = apps.find((a) => a.$id === selectedAppId);

  // -------------------------------------------------------------------------
  // Success screen
  // -------------------------------------------------------------------------

  if (done) {
    return (
      <main className="theme-page flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/30">
          <BadgeCheck className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">
          {t('تم الإعداد بنجاح!', 'Configuration enregistrée !', 'Setup complete!')}
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto mb-8">
          {t(
            'تم حفظ إعدادات AdMob لتطبيقك. ستُطبّق هذه الإعدادات في المرة القادمة التي تبني فيها ملف APK.',
            "Les paramètres AdMob ont été enregistrés. Ils seront appliqués lors de la prochaine compilation de l'APK.",
            'AdMob settings saved. They will be applied the next time you build an APK.',
          )}
        </p>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 mb-8 text-left" dir="ltr">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">App</span>
              <span className="text-white font-semibold">{selectedApp?.app_name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">AdMob App ID</span>
              <span className="text-indigo-300 font-mono text-xs">{admobAppId.trim() || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Banner Unit ID</span>
              <span className="text-indigo-300 font-mono text-xs">{admobBannerId.trim() || '—'}</span>
            </div>
            {uploadedFileName && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t('الملف المرفوع', 'Fichier téléversé', 'Uploaded file')}</span>
                <a
                  href={uploadedFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-semibold"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  {uploadedFileName}
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 hover:opacity-90 transition-all"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t('لوحة التحكم', 'Tableau de bord', 'Go to Dashboard')}
          </Link>
          <button
            onClick={() => { setDone(false); setStep(1); setAppFile(null); setUploadedFileId(null); setUploadedFileUrl(''); setUploadedFileName(''); }}
            className="inline-flex items-center gap-2 px-6 py-3 border border-slate-700 bg-slate-900 text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-800 transition-colors"
          >
            {t('إعداد تطبيق آخر', 'Configurer une autre app', 'Set up another app')}
          </button>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------------------
  // Main wizard
  // -------------------------------------------------------------------------

  return (
    <main className="theme-page flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-14 space-y-10" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
          <DollarSign className="h-3.5 w-3.5" />
          {t('إعداد إعلانات AdMob', 'Configuration AdMob', 'AdMob Monetization Setup')}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t('فعّل الإعلانات في تطبيقك', 'Activez les publicités dans votre application', 'Activate ads in your app')}
        </h1>
        <p className="max-w-xl mx-auto text-slate-400 text-sm leading-relaxed">
          {t(
            'أدخل معرّفات حساب Google AdMob الخاص بك، ثم ارفع ملف تطبيقك. ستُطبَّق الإعدادات في بناء APK التالي.',
            "Saisissez vos identifiants Google AdMob et téléversez votre fichier. Les paramètres seront appliqués lors de la prochaine compilation.",
            'Enter your Google AdMob account IDs and upload your app file. Settings will apply on the next APK build.',
          )}
        </p>
      </div>

      {/* App selector */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          {t('اختر التطبيق', "Sélectionnez l'application", 'Select your app')}
        </label>
        {appsLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('جاري تحميل التطبيقات...', 'Chargement...', 'Loading apps...')}
          </div>
        ) : apps.length === 0 ? (
          <div className="text-sm text-slate-400">
            {t('لا توجد تطبيقات بعد. ', "Aucune application trouvée. ", 'No apps yet. ')}
            <Link href="/" className="text-indigo-400 hover:text-indigo-300 underline">
              {t('أنشئ تطبيقك الأول', 'Créez votre première app', 'Create your first app')}
            </Link>
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedAppId}
              onChange={(e) => handleAppChange(e.target.value)}
              className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {apps.map((app) => (
                <option key={app.$id} value={app.$id} className="bg-slate-900">
                  {app.app_name || t('تطبيق بدون اسم', 'Application sans titre', 'Untitled App')} — {app.store_url}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
          </div>
        )}
      </div>

      {/* Step indicator */}
      {apps.length > 0 && <StepIndicator current={step} labels={stepLabels} />}

      {/* ------------------------------------------------------------------ */}
      {/* STEP 1 — AdMob credentials                                          */}
      {/* ------------------------------------------------------------------ */}
      {step === 1 && apps.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-white mb-1">
              {t('معرّفات AdMob', 'Identifiants AdMob', 'AdMob Identifiers')}
            </h2>
            <p className="text-xs text-slate-400 leading-6">
              {t(
                'ستجد هذه المعرّفات في لوحة تحكم Google AdMob ← التطبيقات. كلاهما اختياري.',
                "Trouvez ces identifiants dans Google AdMob → Applications. Les deux sont facultatifs.",
                'Find these in your Google AdMob dashboard → Apps. Both are optional.',
              )}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                AdMob App ID
              </label>
              <input
                type="text"
                value={admobAppId}
                onChange={(e) => { setAdmobAppId(e.target.value); setCredError(null); }}
                placeholder="ca-app-pub-3940256099942544~3347511713"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                {t('الصيغة: ca-app-pub-XXXXXXXXXX~XXXXXXXX', 'Format : ca-app-pub-XXXXXXXXXX~XXXXXXXX', 'Format: ca-app-pub-XXXXXXXXXX~XXXXXXXX')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('معرّف وحدة إعلان Banner', "Identifiant de l'unité Banner", 'Banner Ad Unit ID')}
              </label>
              <input
                type="text"
                value={admobBannerId}
                onChange={(e) => { setAdmobBannerId(e.target.value); setCredError(null); }}
                placeholder="ca-app-pub-3940256099942544/6300978111"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                {t('الصيغة: ca-app-pub-XXXXXXXXXX/XXXXXXXX', 'Format : ca-app-pub-XXXXXXXXXX/XXXXXXXX', 'Format: ca-app-pub-XXXXXXXXXX/XXXXXXXX')}
              </p>
            </div>
          </div>

          <TipBox>
            {lang === 'ar' ? (
              <>
                <strong>أين أجد هذه المعرّفات؟</strong> افتح{' '}
                <a href="https://admob.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                  admob.google.com
                </a>
                {' '}← التطبيقات ← اختر تطبيقك ← إعدادات التطبيق.
                ستجد <em>معرّف التطبيق</em> في الأعلى. لإنشاء وحدة إعلانية: التطبيق ← وحدات الإعلانات ← إضافة وحدة ← Banner.
              </>
            ) : lang === 'fr' ? (
              <>
                <strong>Où trouver ces identifiants ?</strong> Ouvrez{' '}
                <a href="https://admob.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                  admob.google.com
                </a>
                {' '}→ Applications → sélectionnez votre app → Paramètres de l&apos;app.
                L&apos;<em>App ID</em> se trouve en haut. Pour l&apos;unité Banner : App → Blocs d&apos;annonces → Ajouter → Bannière.
              </>
            ) : (
              <>
                <strong>Where to find these?</strong> Open{' '}
                <a href="https://admob.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                  admob.google.com
                </a>
                {' '}→ Apps → select your app → App settings.
                The <em>App ID</em> is at the top. For the banner unit: App → Ad units → Add ad unit → Banner.
              </>
            )}
          </TipBox>

          {credError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{credError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleNextStep1}
            disabled={apps.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:opacity-90 disabled:opacity-40 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20 ring-1 ring-white/10"
          >
            {t('التالي: رفع الملف', 'Suivant : téléverser le fichier', 'Next: upload file')}
            <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP 2 — File upload                                                */}
      {/* ------------------------------------------------------------------ */}
      {step === 2 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-white mb-1">
              {t('رفع ملف التطبيق', "Téléverser le fichier de l'application", 'Upload app file')}
            </h2>
            <p className="text-xs text-slate-400 leading-6">
              {t(
                'اختر ملف APK أو AAB أو IPA (بحد أقصى 100 MB). سيُحفظ الملف في مستودع Appifya الآمن.',
                "Choisissez un fichier APK, AAB ou IPA (100 Mo maximum). Le fichier sera conservé dans le dépôt sécurisé d'Appifya.",
                'Choose an APK, AAB, or IPA file (100 MB max). The file will be stored in the Appifya secure repository.',
              )}
            </p>
          </div>

          {/* Drop zone */}
          {!uploadedFileId ? (
            <div
              role="button"
              tabIndex={0}
              aria-label={t('منطقة رفع الملف', 'Zone de téléversement', 'File upload area')}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 cursor-pointer transition-all ${
                dragOver
                  ? 'border-indigo-400 bg-indigo-500/10'
                  : 'border-slate-700 bg-slate-950/50 hover:border-indigo-500/60 hover:bg-slate-950'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
                  <p className="text-sm font-semibold text-slate-300">
                    {t('جاري الرفع...', 'Téléversement en cours...', 'Uploading...')}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">
                      {t('اسحب الملف هنا أو انقر للاختيار', 'Déposez le fichier ici ou cliquez pour choisir', 'Drag file here or click to browse')}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      APK · AAB · IPA — {t('حتى 100 MB', '100 Mo maximum', 'up to 100 MB')}
                    </p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".apk,.aab,.ipa"
                className="sr-only"
                onChange={onFileInputChange}
                tabIndex={-1}
              />
            </div>
          ) : (
            /* Uploaded file card */
            <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{uploadedFileName}</p>
                <p className="text-xs text-slate-400">{formatBytes(uploadedFileSize)}</p>
                <a
                  href={uploadedFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  {t('تنزيل الملف', 'Télécharger', 'Download file')}
                </a>
              </div>
              <button
                type="button"
                onClick={() => { setUploadedFileId(null); setAppFile(null); setUploadedFileName(''); setUploadedFileUrl(''); }}
                className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                aria-label={t('إزالة الملف', 'Supprimer', 'Remove file')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {uploadError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}

          <TipBox>
            {lang === 'ar' ? (
              <>رفع الملف <strong>اختياري</strong>. يمكنك المتابعة إلى التأكيد بدون رفع ملف إذا أردت حفظ بيانات AdMob فقط.</>
            ) : lang === 'fr' ? (
              <>Le téléversement est <strong>facultatif</strong>. Vous pouvez continuer vers la confirmation sans téléverser si vous souhaitez uniquement sauvegarder les identifiants AdMob.</>
            ) : (
              <>File upload is <strong>optional</strong>. You can proceed to confirmation without uploading if you only want to save the AdMob IDs.</>
            )}
          </TipBox>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-slate-700 bg-slate-900 text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-800 transition-colors"
            >
              {t('رجوع', 'Retour', 'Back')}
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:opacity-90 disabled:opacity-40 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20 ring-1 ring-white/10"
            >
              {t('التالي: المراجعة', 'Suivant : révision', 'Next: review')}
              <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP 3 — Review & save                                              */}
      {/* ------------------------------------------------------------------ */}
      {step === 3 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-white mb-1">
              {t('مراجعة وحفظ', 'Révision et enregistrement', 'Review and save')}
            </h2>
            <p className="text-xs text-slate-400 leading-6">
              {t(
                'تحقق من المعلومات أدناه ثم اضغط "حفظ وإنهاء".',
                'Vérifiez les informations ci-dessous, puis appuyez sur "Enregistrer".',
                'Check the details below, then press "Save & Finish".',
              )}
            </p>
          </div>

          {/* Summary card */}
          <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5 space-y-3 text-sm" dir="ltr">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 shrink-0">App</span>
              <span className="text-white font-semibold truncate">{selectedApp?.app_name || '—'}</span>
            </div>
            <div className="border-t border-slate-800 pt-3 flex items-start justify-between gap-4">
              <span className="text-slate-400 shrink-0">AdMob App ID</span>
              <span className={`font-mono text-xs text-right break-all ${admobAppId.trim() ? 'text-indigo-300' : 'text-slate-600'}`}>
                {admobAppId.trim() || t('—غير محدد—', '—non défini—', '—not set—')}
              </span>
            </div>
            <div className="border-t border-slate-800 pt-3 flex items-start justify-between gap-4">
              <span className="text-slate-400 shrink-0">Banner Unit ID</span>
              <span className={`font-mono text-xs text-right break-all ${admobBannerId.trim() ? 'text-indigo-300' : 'text-slate-600'}`}>
                {admobBannerId.trim() || t('—غير محدد—', '—non défini—', '—not set—')}
              </span>
            </div>
            {uploadedFileName ? (
              <div className="border-t border-slate-800 pt-3 flex items-center justify-between gap-4">
                <span className="text-slate-400 shrink-0">{t('الملف', 'Fichier', 'File')}</span>
                <a
                  href={uploadedFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-semibold"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  {uploadedFileName}
                </a>
              </div>
            ) : (
              <div className="border-t border-slate-800 pt-3 flex items-center justify-between gap-4">
                <span className="text-slate-400 shrink-0">{t('الملف', 'Fichier', 'File')}</span>
                <span className="text-slate-600 text-xs">{t('لم يُرفع ملف', 'Aucun fichier', 'No file uploaded')}</span>
              </div>
            )}
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
              className="flex-1 py-3 border border-slate-700 bg-slate-900 text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              {t('رجوع', 'Retour', 'Back')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-opacity shadow-lg shadow-emerald-500/20"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {saving
                ? t('جاري الحفظ...', 'Enregistrement...', 'Saving...')
                : t('حفظ وإنهاء', 'Enregistrer', 'Save & Finish')}
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
