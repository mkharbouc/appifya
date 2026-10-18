'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from './lib/i18n';
import { databases } from '@/lib/appwrite';
import { DB_ID, TABLE_ID, getErrorMessage, normalizePublicUrl } from '@/lib/app-config';
import { ID } from 'appwrite';
import {
  Smartphone,
  Globe,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { lang } = useLanguage();

  const [storeUrl, setStoreUrl] = useState('');
  const [appName, setAppName] = useState('');
  const [platform, setPlatform] = useState<'both' | 'android' | 'ios'>('both');
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [admobAppId, setAdmobAppId] = useState('');
  const [admobBannerUnitId, setAdmobBannerUnitId] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

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

      await databases.createDocument(DB_ID, TABLE_ID, ID.unique(), {
        user_id: userId,
        store_url: formattedUrl,
        app_name: finalAppName,
        theme_color: themeColor,
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

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12" dir={isRtl ? 'rtl' : 'ltr'}>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Mockup Preview */}
        <div className="lg:col-span-5 flex flex-col items-center order-2 lg:order-1">
          <div className="sticky top-24 w-full max-w-[340px]">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-[11px] font-semibold text-indigo-400 rounded-full">
                <Eye className="h-3.5 w-3.5" />
                <span>{lang === 'ar' ? 'معاينة حية للمتجر' : 'Aperçu Interactif Direct'}</span>
              </span>
              {storeUrl && (
                <button
                  type="button"
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                  title="Rafraîchir l'aperçu"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
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
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6 order-1 lg:order-2">
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
    </main>
  );
}
