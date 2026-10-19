'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from './lib/i18n';
import { databases, storage } from '@/lib/appwrite';
import { BUCKET_ID, DB_ID, TABLE_ID, getErrorMessage, normalizePublicUrl } from '@/lib/app-config';
import { ID, Permission, Role } from 'appwrite';
import {
  Smartphone,
  Globe,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  ExternalLink,
  Check,
  HelpCircle,
  ShieldCheck,
  Zap,
  Layers3,
  Bell,
  Send,
  Play,
  ArrowUpRight,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { lang } = useLanguage();

  const [storeUrl, setStoreUrl] = useState('');
  const [appName, setAppName] = useState('');
  const [platform, setPlatform] = useState<'both' | 'android' | 'ios'>('both');
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState('');
  const [admobAppId, setAdmobAppId] = useState('');
  const [admobBannerUnitId, setAdmobBannerUnitId] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [notificationTitle, setNotificationTitle] = useState('عرض خاص من متجرك');
  const [notificationMessage, setNotificationMessage] = useState('خصم 50% لفترة محدودة على جميع المنتجات!');
  const [previewNotification, setPreviewNotification] = useState(false);
  const [previewNotificationKey, setPreviewNotificationKey] = useState(0);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isRtl = lang === 'ar';

  const handleUrlChange = (val: string) => {
    setStoreUrl(val);
    if (!appName && val) {
      try {
        const clean = val.replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[/?#]/)[0];
        const namePart = clean.split('.')[0];
        if (namePart) {
          setAppName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
        }
      } catch {}
    }
  };

  const getCleanPreviewUrl = () => {
    if (!storeUrl) return '';
    if (storeUrl.startsWith('http://') || storeUrl.startsWith('https://')) {
      return storeUrl;
    }
    return `https://${storeUrl}`;
  };

  const executeSaveApp = async (userId: string) => {
    if (!storeUrl) {
      setStatusMsg({
        type: 'error',
        text: lang === 'ar' ? 'يرجى إدخال رابط المتجر أولاً.' : 'Veuillez saisir l\'URL de la boutique.',
      });
      return;
    }

    try {
      setLoading(true);
      setStatusMsg(null);

      let formattedUrl: string;
      try {
        formattedUrl = normalizePublicUrl(storeUrl.trim());
      } catch {
        setStatusMsg({
          type: 'error',
          text: lang === 'ar' ? 'يرجى إدخال رابط HTTPS صالح.' : 'Please enter a valid HTTPS URL.',
        });
        return;
      }
      const finalAppName = appName.trim() || 'My PWA Store';
      const normalizedAppId = admobAppId.trim();
      const normalizedBannerUnitId = admobBannerUnitId.trim();

      if (normalizedAppId && !/^ca-app-pub-\d{10,}~\d{8,}$/.test(normalizedAppId)) {
        setStatusMsg({
          type: 'error',
          text: lang === 'ar' ? 'معرّف تطبيق AdMob غير صالح. يجب أن يكون بصيغة ca-app-pub-...~...' : 'The AdMob App ID must use the ca-app-pub-...~... format.',
        });
        return;
      }

      if (normalizedBannerUnitId && !/^ca-app-pub-\d{10,}\/\d{6,}$/.test(normalizedBannerUnitId)) {
        setStatusMsg({
          type: 'error',
          text: lang === 'ar' ? 'معرّف إعلان Banner غير صالح. يجب أن يكون بصيغة ca-app-pub-.../... .' : 'The banner ad unit ID must use the ca-app-pub-.../... format.',
        });
        return;
      }

      let iconId: string | undefined;
      if (iconFile) {
        if (!BUCKET_ID) {
          throw new Error('Appwrite Storage is not configured.');
        }

        const uploadedIcon = await storage.createFile({
          bucketId: BUCKET_ID,
          fileId: ID.unique(),
          file: iconFile,
          permissions: [Permission.read(Role.any())],
        });
        iconId = uploadedIcon.$id;
      }

      await databases.createDocument(DB_ID, TABLE_ID, ID.unique(), {
        user_id: userId,
        store_url: formattedUrl,
        app_name: finalAppName,
        theme_color: themeColor,
        icon_id: iconId,
        admob_app_id: normalizedAppId || undefined,
        admob_banner_unit_id: normalizedBannerUnitId || undefined,
      });

      setStatusMsg({
        type: 'success',
        text: lang === 'ar' ? 'تم حفظ التطبيق وتصديره بنجاح! جاري تحويلك إلى لوحة التحكم...' : 'Application enregistrée avec succès ! Redirection...',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: unknown) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: getErrorMessage(err, lang === 'ar' ? 'فشل حفظ التطبيق، يرجى المحاولة ثانية.' : 'Failed to save the application.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIconChange = (file: File | undefined) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setStatusMsg({
        type: 'error',
        text: lang === 'ar' ? 'اختر صورة PNG أو JPG أو WebP بحجم أقصى 2MB.' : 'Choose a PNG, JPG, or WebP image up to 2MB.',
      });
      return;
    }
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const handleCreateOrExport = () => {
    if (!storeUrl) {
      setStatusMsg({
        type: 'error',
        text: lang === 'ar' ? 'يرجى إدخال رابط المتجر أولاً.' : 'Veuillez saisir l\'URL de la boutique.',
      });
      return;
    }

    if (!user) {
      openAuthModal(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      });
      return;
    }

    executeSaveApp(user.$id);
  };

  const simulateNotification = () => {
    setPreviewNotificationKey((current) => current + 1);
    setPreviewNotification(true);
    if ('vibrate' in navigator) {
      navigator.vibrate([120, 70, 120]);
    }
  };

  return (
    <main className="site-main flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          {lang === 'ar' ? (
            <>حوّل متجرك أو صفحة الهبوط إلى <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">تطبيق PWA فائق السرعة</span></>
          ) : lang === 'fr' ? (
            <>Transformez votre boutique en une <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">PWA Mobile Ultra-Rapide</span></>
          ) : (
            <>Convert Your Store or Landing Page into a <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Fast Mobile PWA</span></>
          )}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          {lang === 'ar'
            ? 'أنشئ تطبيق ويب تقدمي قابل للتثبيت بضغطة زر، مدمج بحزم إعلانية متوافقة ومربوط سحابياً مع لوحة تحكمك.'
            : 'Créez une Progressive Web App installable en un clic, personnalisable et synchronisée avec le cloud.'}
        </p>
      </div>

      <section className="showcase-panel relative isolate mb-12 overflow-hidden rounded-[2rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-950 via-slate-950 to-pink-950 p-5 shadow-2xl shadow-indigo-950/30 sm:p-8" aria-labelledby="showcase-title">
        <div className="pointer-events-none absolute -left-20 -top-24 -z-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 -z-10 h-64 w-64 rounded-full bg-pink-500/15 blur-3xl" />
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              {lang === 'ar' ? 'شاهد كيف تتحول فكرتك إلى تطبيق' : lang === 'fr' ? 'Voyez votre idée devenir une application' : 'See your idea become an app'}
            </div>
            <h2 id="showcase-title" className="max-w-xl text-2xl font-black leading-tight text-white sm:text-4xl">
              {lang === 'ar' ? 'تجربة عصرية تبدأ من رابط واحد' : lang === 'fr' ? 'Une expérience moderne à partir d’un seul lien' : 'A modern experience from one simple link'}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              {lang === 'ar'
                ? 'أدخل رابط متجرك، خصص مظهر التطبيق، ثم شاهد المعاينة الفورية قبل النشر. كل خطوة واضحة ومصممة لتكسب ثقة زوارك.'
                : lang === 'fr'
                  ? 'Ajoutez votre lien, personnalisez l’apparence et prévisualisez votre application avant de la publier.'
                  : 'Add your store link, customize the look, and preview your app before publishing. Every step is clear and built to earn trust.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#builder" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-950 shadow-lg transition hover:bg-indigo-50">
                <Play className="h-3.5 w-3.5 fill-current" />
                {lang === 'ar' ? 'ابدأ التجربة' : lang === 'fr' ? 'Commencer' : 'Start building'}
              </a>
              <a href="/about" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10">
                {lang === 'ar' ? 'اكتشف الطريقة' : lang === 'fr' ? 'Découvrir' : 'Discover how it works'}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="showcase-window overflow-hidden rounded-2xl border border-white/15 bg-slate-900/80 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 truncate rounded-md bg-white/5 px-3 py-1 text-[9px] text-slate-400">appifya.app/preview</span>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src="/logo.jpg.jpeg" alt="Appifya platform preview" className="h-full w-full object-cover opacity-35" />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/95 via-indigo-950/40 to-transparent" />
                <div className="absolute inset-x-5 bottom-5">
                  <div className="mb-3 h-2 w-20 rounded-full bg-indigo-300/60" />
                  <div className="h-3 w-4/5 rounded-full bg-white/80" />
                  <div className="mt-2 h-2 w-3/5 rounded-full bg-white/30" />
                  <div className="mt-5 flex gap-2">
                    <span className="h-7 w-20 rounded-lg bg-white/90" />
                    <span className="h-7 w-14 rounded-lg bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
            <div className="showcase-step absolute -bottom-4 -left-3 rounded-xl border border-indigo-300/20 bg-slate-900/95 px-3 py-2 shadow-xl sm:-left-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300"><Check className="h-4 w-4" /></span>
                <span className="text-[10px] font-bold text-white">{lang === 'ar' ? 'جاهز للنشر' : lang === 'fr' ? 'Prêt à publier' : 'Ready to publish'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {statusMsg && (
        <div
          className={`max-w-4xl mx-auto mb-8 p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div id="builder" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Mockup Preview */}
        <div className="lg:col-span-5 flex flex-col items-center order-2 lg:order-1">
          <div className="sticky top-24 w-full max-w-[340px]">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-[11px] font-semibold text-indigo-400 rounded-full">
                <Eye className="h-3.5 w-3.5" />
                <span>{lang === 'ar' ? 'معاينة حية للمتجر' : 'Aperçu Interactif Direct'}</span>
              </span>
              {storeUrl && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIframeKey((k) => k + 1)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                    title="Rafraîchir l'aperçu"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <a
                    href={getCleanPreviewUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-semibold text-indigo-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>{lang === 'ar' ? 'فتح خارجياً' : lang === 'fr' ? 'Ouvrir' : 'Open externally'}</span>
                  </a>
                </div>
              )}
            </div>

            <div className="relative mx-auto border-[10px] border-slate-900 bg-slate-950 rounded-[48px] shadow-2xl overflow-hidden aspect-[9/19] flex flex-col ring-1 ring-slate-800">
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30"></div>

              <div
                className="h-14 px-5 pt-5 pb-2 flex items-center justify-between text-[11px] text-white font-semibold transition-colors z-20 shrink-0"
                style={{ backgroundColor: themeColor }}
              >
                <div className="flex items-center gap-2 truncate">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[140px]">{appName || 'Appifya'}</span>
                </div>
                <span className="text-[10px] opacity-90">9:41</span>
              </div>

              <div className="flex-1 bg-white relative overflow-hidden">
                {previewNotification && (
                  <div key={previewNotificationKey} className="absolute left-3 right-3 top-3 z-40 animate-[shake_0.45s_ease-in-out] rounded-2xl border border-slate-200/80 bg-white/95 p-3 text-slate-900 shadow-2xl backdrop-blur-md" role="status">
                    <div className="flex items-start gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 text-left" dir={isRtl ? 'rtl' : 'ltr'}>
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[10px] font-bold">{appName || 'Appifya Store'}</p>
                          <button type="button" onClick={() => setPreviewNotification(false)} className="text-xs text-slate-400 hover:text-slate-700" aria-label={lang === 'ar' ? 'إغلاق الإشعار' : lang === 'fr' ? 'Fermer la notification' : 'Close notification'}>×</button>
                        </div>
                        <p className="mt-1 text-xs font-bold">{notificationTitle || 'عرض خاص'}</p>
                        <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-600">{notificationMessage || 'رسالة تجريبية لمتجرك'}</p>
                        <p className="mt-1 text-[9px] text-slate-400">now · Appifya demo</p>
                      </div>
                    </div>
                  </div>
                )}
                {getCleanPreviewUrl() ? (
                  <iframe
                    key={iframeKey}
                    src={getCleanPreviewUrl()}
                    className="w-full h-full border-0 select-none"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                    <Smartphone className="h-12 w-12 text-slate-700 mb-3" />
                    <p className="text-xs text-slate-400 font-medium">
                      {lang === 'ar' ? 'أدخل رابط موقعك لمشاهدته مباشرة داخل الهاتف' : 'Saisissez l\'URL de votre site pour afficher l\'aperçu interactif'}
                    </p>
                  </div>
                )}
              </div>

              <div className="h-5 bg-slate-950 flex items-center justify-center shrink-0">
                <div className="w-28 h-1 bg-slate-700 rounded-full"></div>
              </div>
              <div className="mt-4 rounded-2xl border border-indigo-500/20 bg-indigo-950/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-300" />
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      {lang === 'ar' ? 'محاكاة الإشعارات الفورية' : lang === 'fr' ? 'Simulateur de notifications' : 'Push notification simulator'}
                    </h3>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {lang === 'ar' ? 'جرّب كيف سيظهر التنبيه داخل تطبيقك.' : lang === 'fr' ? 'Voyez comment votre notification apparaîtra.' : 'See how a notification will look in your app.'}
                    </p>
                  </div>
                </div>
                <input
                  value={notificationTitle}
                  onChange={(event) => setNotificationTitle(event.target.value)}
                  placeholder={lang === 'ar' ? 'عنوان الإشعار' : 'Notification title'}
                  className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <textarea
                  value={notificationMessage}
                  onChange={(event) => setNotificationMessage(event.target.value)}
                  placeholder={lang === 'ar' ? 'اكتب رسالتك...' : 'Write your message...'}
                  rows={2}
                  className="mb-3 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={simulateNotification}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
                >
                  <Send className="h-3.5 w-3.5" />
                  {lang === 'ar' ? 'تجربة الإشعار' : lang === 'fr' ? 'Tester la notification' : 'Test notification'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div id="create-app" className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6 order-1 lg:order-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {lang === 'ar' ? 'رابط المتجر أو صفحة الهبوط' : 'URL du magasin ou page d\'atterrissage'} *
            </label>
            <div className="relative">
              <Globe className="absolute right-4 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={storeUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://siin.shop/ar"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-11 pl-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {lang === 'ar' ? 'اسم التطبيق' : 'Nom de l\'application'}
            </label>
            <div className="relative">
              <Smartphone className="absolute right-4 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="Siin"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-11 pl-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {lang === 'ar' ? 'المنصة المستهدفة' : 'Plateforme cible'}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['both', 'android', 'ios'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    platform === p
                      ? 'bg-gradient-to-r from-indigo-500/20 to-pink-500/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p === 'both' ? (lang === 'ar' ? 'الكل (موصى به)' : 'Les deux') : p === 'android' ? 'Android' : 'iOS'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {lang === 'ar' ? 'لون الهوية (Theme Color)' : 'Couleur du thème'}
            </label>
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-2.5">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="h-8 w-10 bg-transparent cursor-pointer rounded-lg border-0"
              />
              <span className="text-xs font-mono text-slate-300 uppercase">{themeColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {lang === 'ar' ? 'أيقونة التطبيق (اختياري)' : lang === 'fr' ? 'Icône de l’application (facultatif)' : 'App icon (optional)'}
            </label>
            <label className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3 cursor-pointer hover:border-indigo-500 transition-colors">
              {iconPreview ? (
                <img src={iconPreview} alt="" className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <Smartphone className="h-8 w-8 text-slate-600" />
              )}
              <span className="text-xs text-slate-400">
                {iconFile?.name || (lang === 'ar' ? 'اختر صورة PNG أو JPG (حتى 2MB)' : 'Choose PNG or JPG image (up to 2MB)')}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => handleIconChange(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="border-t border-slate-800 pt-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              {lang === 'ar' ? 'إعلانات Google AdMob (اختياري)' : lang === 'fr' ? 'Publicités Google AdMob (facultatif)' : 'Google AdMob ads (optional)'}
            </h2>
            <p className="text-[11px] text-slate-500 mb-4">
              {lang === 'ar'
                ? 'اختياري لنسخة Android فقط. التحويل المجاني لا يحتوي على إعلانات. لن تُستخدم الإعلانات قبل اكتمال إعداد APK المدعوم بـ AdMob.'
                : lang === 'fr'
                  ? 'Optionnel et réservé à Android. L’export gratuit est sans publicité. Les annonces ne seront utilisées qu’après la mise en place du APK AdMob.'
                  : 'Optional and Android-only. The free export has no ads. Ads will only be used after the AdMob-enabled APK builder is ready.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={admobAppId}
                onChange={(e) => setAdmobAppId(e.target.value)}
                placeholder="ca-app-pub-...~..."
                aria-label="AdMob App ID"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                dir="ltr"
              />
              <input
                type="text"
                value={admobBannerUnitId}
                onChange={(e) => setAdmobBannerUnitId(e.target.value)}
                placeholder="ca-app-pub-.../..."
                aria-label="AdMob Banner Ad Unit ID"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                dir="ltr"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleCreateOrExport}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>
                    {user
                      ? (lang === 'ar' ? 'حفظ وتصدير التطبيق إلى لوحة التحكم' : 'Enregistrer & Exporter vers le tableau de bord')
                      : (lang === 'ar' ? 'تسجيل الدخول وتصدير التطبيق' : 'Connexion & Exportation')}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <section className="mt-24 space-y-10" aria-labelledby="why-appifya">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
            {lang === 'ar' ? 'لماذا Appifya؟' : lang === 'fr' ? 'Pourquoi Appifya ?' : 'Why Appifya?'}
          </p>
          <h2 id="why-appifya" className="text-2xl font-black text-white sm:text-3xl">
            {lang === 'ar'
              ? 'طريقة أبسط لإطلاق حضورك على الهاتف'
              : lang === 'fr'
                ? 'Une manière plus simple de lancer votre présence mobile'
                : 'A simpler way to launch your mobile presence'}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            {lang === 'ar'
              ? 'نختصر الخطوات التقنية المعقدة في تجربة واضحة: أضف رابطك، خصص تطبيقك، ثم تابع كل عمليات التصدير من لوحة واحدة.'
              : lang === 'fr'
                ? 'Nous simplifions les étapes techniques : ajoutez votre URL, personnalisez votre application et suivez vos exports depuis un seul tableau de bord.'
                : 'We simplify the technical steps: add your URL, customize your app, and track every export from one dashboard.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: lang === 'ar' ? 'إطلاق سريع' : lang === 'fr' ? 'Lancement rapide' : 'Fast launch',
              text: lang === 'ar' ? 'حوّل رابطاً جاهزاً إلى تجربة قابلة للتثبيت دون البدء من مشروع Android معقد.' : lang === 'fr' ? 'Transformez un site existant sans démarrer un projet Android complexe.' : 'Turn an existing site into an installable experience without starting a complex Android project.',
              color: 'bg-indigo-500/10 text-indigo-400',
            },
            {
              icon: ShieldCheck,
              title: lang === 'ar' ? 'وضوح وملكية' : lang === 'fr' ? 'Clarté et propriété' : 'Clear ownership',
              text: lang === 'ar' ? 'إعداداتك وبياناتك الإعلانية تبقى لك، ونوضح دائماً ما هو مجاني وما هو اختياري.' : lang === 'fr' ? 'Vos paramètres restent les vôtres, avec une distinction claire entre les fonctions gratuites et optionnelles.' : 'Your settings remain yours, with a clear distinction between free and optional features.',
              color: 'bg-emerald-500/10 text-emerald-400',
            },
            {
              icon: Layers3,
              title: lang === 'ar' ? 'تجربة متكاملة' : lang === 'fr' ? 'Expérience complète' : 'Complete workflow',
              text: lang === 'ar' ? 'معاينة، تخصيص، بناء APK، وتنزيل من مكان واحد مع متابعة حالة العملية.' : lang === 'fr' ? 'Prévisualisez, personnalisez, compilez et téléchargez depuis un seul endroit.' : 'Preview, customize, build, and download from one place with visible progress.',
              color: 'bg-pink-500/10 text-pink-400',
            },
          ].map(({ icon: Icon, title, text, color }) => (
            <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-base font-bold text-white">{title}</h3>
              <p className="text-xs leading-6 text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-24" aria-labelledby="how-it-works">
        <div className="mb-8 text-center">
          <h2 id="how-it-works" className="text-2xl font-black text-white sm:text-3xl">
            {lang === 'ar' ? 'كيف تعمل المنصة؟' : lang === 'fr' ? 'Comment ça marche ?' : 'How does it work?'}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            [ '01', lang === 'ar' ? 'أضف رابط موقعك' : lang === 'fr' ? 'Ajoutez votre URL' : 'Add your URL', lang === 'ar' ? 'نقبل المواقع والمتاجر التي تعمل عبر HTTPS.' : lang === 'fr' ? 'Nous acceptons les sites et boutiques en HTTPS.' : 'We support websites and stores served over HTTPS.' ],
            [ '02', lang === 'ar' ? 'خصص التطبيق' : lang === 'fr' ? 'Personnalisez' : 'Customize it', lang === 'ar' ? 'اختر الاسم واللون والأيقونة التي تمثل علامتك.' : lang === 'fr' ? 'Choisissez le nom, la couleur et l’icône de votre marque.' : 'Choose the name, color, and icon for your brand.' ],
            [ '03', lang === 'ar' ? 'صدّر وتابع' : lang === 'fr' ? 'Exportez et suivez' : 'Export and track', lang === 'ar' ? 'تابع حالة بناء APK ونزّل الملف عند جاهزيته.' : lang === 'fr' ? 'Suivez la compilation et téléchargez le fichier prêt.' : 'Track the build and download the ready file.' ],
          ].map(([number, title, text]) => (
            <div key={number} className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <span className="text-2xl font-black text-indigo-400">{number}</span>
              <div>
                <h3 className="mb-1 font-bold text-white">{title}</h3>
                <p className="text-xs leading-6 text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24 mx-auto max-w-4xl" aria-labelledby="faq">
        <div className="mb-8 text-center">
          <HelpCircle className="mx-auto mb-3 h-7 w-7 text-indigo-400" />
          <h2 id="faq" className="text-2xl font-black text-white sm:text-3xl">
            {lang === 'ar' ? 'الأسئلة الشائعة' : lang === 'fr' ? 'Questions fréquentes' : 'Frequently asked questions'}
          </h2>
        </div>
        <div className="space-y-3">
          {[
            [lang === 'ar' ? 'هل التحويل الأساسي مجاني؟' : lang === 'fr' ? 'L’export de base est-il gratuit ?' : 'Is the basic export free?', lang === 'ar' ? 'نعم، التحويل الأساسي بدون إعلانات مجاني حالياً. أي خدمة مدفوعة مستقبلية ستظهر بوضوح قبل الدفع.' : lang === 'fr' ? 'Oui, l’export de base sans publicité est actuellement gratuit. Tout futur service payant sera affiché avant le paiement.' : 'Yes. The basic export without ads is currently free. Any future paid service will be shown before payment.'],
            [lang === 'ar' ? 'هل أحتاج إلى Android Studio؟' : lang === 'fr' ? 'Ai-je besoin d’Android Studio ?' : 'Do I need Android Studio?', lang === 'ar' ? 'لا، المنصة تتولى إنشاء APK عبر خدمة بناء آلية. ستحتاج فقط إلى حسابك وبيانات تطبيقك.' : lang === 'fr' ? 'Non, la plateforme lance une compilation automatisée.' : 'No. The platform starts an automated build for you.'],
            [lang === 'ar' ? 'هل أملك أرباح AdMob؟' : lang === 'fr' ? 'Qui possède les revenus AdMob ?' : 'Who owns AdMob revenue?', lang === 'ar' ? 'نعم. عند استخدام إعدادات AdMob الخاصة بك، يبقى الحساب والأرباح ملكاً لك وتبقى مسؤولاً عن سياسات Google.' : lang === 'fr' ? 'Les paramètres et revenus restent les vôtres, sous votre responsabilité vis-à-vis de Google.' : 'Your settings and revenue remain yours, and you are responsible for Google policies.'],
            [lang === 'ar' ? 'لماذا لا تظهر بعض المواقع داخل المعاينة؟' : lang === 'fr' ? 'Pourquoi certains sites ne s’affichent-ils pas dans l’aperçu ?' : 'Why do some sites not appear in preview?', lang === 'ar' ? 'بعض المواقع تمنع التضمين داخل iframe لأسباب أمنية. في هذه الحالة استخدم زر الفتح خارجياً، ولا يمنع ذلك إنشاء التطبيق.' : lang === 'fr' ? 'Certains sites bloquent les iframe pour des raisons de sécurité. Ouvrez-les dans un nouvel onglet.' : 'Some sites block iframe embedding for security. Use the external preview link; this does not prevent app creation.'],
          ].map(([question, answer]) => (
            <details key={question} className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <summary className="cursor-pointer list-none font-bold text-white marker:hidden">{question}</summary>
              <p className="mt-3 text-sm leading-7 text-slate-400">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-24 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-900/30 to-pink-900/30 p-8 text-center">
        <h2 className="text-2xl font-black text-white">
          {lang === 'ar' ? 'ابدأ بتحويل موقعك اليوم' : lang === 'fr' ? 'Transformez votre site aujourd’hui' : 'Start converting your site today'}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">
          {lang === 'ar' ? 'ابدأ مجاناً، واحتفظ بالتحكم الكامل في إعدادات تطبيقك.' : lang === 'fr' ? 'Commencez gratuitement et gardez le contrôle de votre application.' : 'Start for free and keep full control of your app settings.'}
        </p>
        <a href="#create-app" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
          <Check className="h-4 w-4" />
          {lang === 'ar' ? 'ابدأ الآن' : lang === 'fr' ? 'Commencer' : 'Get started'}
        </a>
      </section>
    </main>
  );
}
