'use client';

import React, { useState } from 'react';
import { databases, storage, DB_ID, TABLE_ID, BUCKET_ID, ID } from './lib/appwrite';
import { useLanguage } from './lib/i18n';
import {
  Smartphone,
  Globe,
  Upload,
  CheckCircle2,
  ArrowRight,
  Loader2,
  DollarSign,
  ShieldAlert,
  AlertCircle,
  Zap,
  Layers,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Apple,
  RotateCw,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import DOMPurify from 'dompurify';

export default function PwaBuilderPage() {
  const { lang, t } = useLanguage();

  const [appName, setAppName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');

  // اختيار النظام المستهدف
  const [targetPlatform, setTargetPlatform] = useState<'both' | 'android' | 'ios'>('both');

  // نمط العرض في المعاينة (شاشة المتجر الحية أم غلاف التطبيق)
  const [previewMode, setPreviewMode] = useState<'live' | 'splash'>('live');
  const [iframeKey, setIframeKey] = useState(0);

  // إعدادات الإعلانات
  const [adType, setAdType] = useState<'none' | 'adsense' | 'admob' | 'custom'>('none');
  const [adClientId, setAdClientId] = useState('');
  const [adSlotId, setAdSlotId] = useState('');
  const [adPlacement, setAdPlacement] = useState<'bottom_banner' | 'top_banner' | 'splash'>('bottom_banner');
  const [customAdCode, setCustomAdCode] = useState('');
  const [adError, setAdError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [createdAppId, setCreatedAppId] = useState<string | null>(null);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const getCleanUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  const validateAdSettings = (): boolean => {
    setAdError(null);
    if (adType === 'none') return true;

    if (adType === 'adsense' || adType === 'admob') {
      const pubRegex = /^ca-pub-\d{16}$/;
      if (!pubRegex.test(adClientId.trim())) {
        setAdError(
          lang === 'ar'
            ? 'معرّف الناشر غير صحيح. يجب أن يبدأ بـ ca-pub- متبوعاً بـ 16 رقماً.'
            : lang === 'fr'
            ? 'ID Éditeur invalide (ex: ca-pub-1234567890123456).'
            : 'Invalid Publisher ID (e.g., ca-pub-1234567890123456).'
        );
        return false;
      }
      if (!adSlotId.trim() || !/^\d+$/.test(adSlotId.trim())) {
        setAdError(
          lang === 'ar'
            ? 'معرّف الوحدة الإعلانية (Slot ID) يجب أن يحتوي على أرقام فقط.'
            : lang === 'fr'
            ? 'Le Slot ID doit contenir uniquement des chiffres.'
            : 'Ad Slot ID must contain numbers only.'
        );
        return false;
      }
    }

    if (adType === 'custom') {
      if (!customAdCode.trim()) {
        setAdError(
          lang === 'ar'
            ? 'الرجاء إدخال شفرة الإعلان المخصصة.'
            : lang === 'fr'
            ? 'Veuillez saisir votre code publicitaire.'
            : 'Please enter your custom ad code.'
        );
        return false;
      }
      const dangerousPatterns = [/<frameset/i, /<body/i, /<head/i, /<html/i, /window\.location/i];
      for (const pattern of dangerousPatterns) {
        if (pattern.test(customAdCode)) {
          setAdError(
            lang === 'ar'
              ? 'تحذير أمني: الشفرة تحتوي على وسوم غير مسموحة.'
              : lang === 'fr'
              ? 'Alerte sécurité : Le code contient des balises non autorisées.'
              : 'Security warning: The code contains disallowed tags.'
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAdSettings()) return;

    setLoading(true);

    try {
      let uploadedIconId = '';
      if (iconFile) {
        const fileRes = await storage.createFile(BUCKET_ID, ID.unique(), iconFile);
        uploadedIconId = fileRes.$id;
      }

      const formattedUrl = getCleanUrl(storeUrl);

      const sanitizedCustomCode =
        adType === 'custom'
          ? DOMPurify.sanitize(customAdCode, { ADD_TAGS: ['script', 'ins'] })
          : '';

      const payload: any = {
        user_id: 'guest_user',
        app_name: appName,
        store_url: formattedUrl,
        theme_color: themeColor,
        icon_id: uploadedIconId,
        ad_type: adType,
        ad_client_id: adClientId.trim(),
        ad_slot_id: adSlotId.trim(),
        ad_placement: adPlacement,
        custom_ad_code: sanitizedCustomCode,
        target_platform: targetPlatform
      };

      const appDoc = await databases.createDocument(
        DB_ID,
        TABLE_ID,
        ID.unique(),
        payload
      );

      setCreatedAppId(appDoc.$id);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-20 py-8">
      {/* 1. BUILDER HERO */}
      <section className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'الجيل الجديد من تطبيقات الويب' : lang === 'fr' ? 'Nouvelle Génération PWA' : 'Next-Gen PWA Builder'}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
              {t('heroTitle')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                {t('heroTitleHighlight')}
              </span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              {t('heroSub')}
            </p>
          </div>

          <form onSubmit={handleCreateApp} className="space-y-4 bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
            {/* Store URL */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {t('storeUrlLabel')}
              </label>
              <div className="relative">
                <Globe className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-3.5 h-4 w-4 text-slate-500`} />
                <input
                  type="text"
                  required
                  placeholder="https://yourstore.com"
                  value={storeUrl}
                  onChange={(e) => {
                    setStoreUrl(e.target.value);
                    setIframeKey((k) => k + 1);
                  }}
                  className={`w-full bg-slate-950 border border-slate-700/80 rounded-xl ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors`}
                  dir="ltr"
                />
              </div>
            </div>

            {/* App Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {t('appNameLabel')}
              </label>
              <div className="relative">
                <Smartphone className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-3.5 h-4 w-4 text-slate-500`} />
                <input
                  type="text"
                  required
                  placeholder={lang === 'ar' ? 'مثال: متجر الإلكترونيات' : lang === 'fr' ? 'Ex: Ma Boutique' : 'e.g. Trendy Store'}
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className={`w-full bg-slate-950 border border-slate-700/80 rounded-xl ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors`}
                />
              </div>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {t('platformLabel')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetPlatform('both')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    targetPlatform === 'both'
                      ? 'bg-gradient-to-r from-indigo-600/30 to-pink-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>{t('platformBoth')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetPlatform('android')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    targetPlatform === 'android'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-emerald-400 font-mono text-sm">🤖</span>
                  <span>{t('platformAndroid')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetPlatform('ios')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    targetPlatform === 'ios'
                      ? 'bg-slate-700/40 border-slate-400 text-white shadow-lg shadow-white/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Apple className="h-3.5 w-3.5" />
                  <span>{t('platformIos')}</span>
                </button>
              </div>
            </div>

            {/* Colors & Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t('themeColorLabel')}
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-xl p-2">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="h-7 w-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-300" dir="ltr">{themeColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t('iconLabel')}
                </label>
                <label className="flex items-center justify-center gap-2 bg-slate-950 border border-dashed border-slate-700 rounded-xl p-2.5 cursor-pointer hover:border-indigo-500 transition-colors">
                  <Upload className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-slate-400 truncate">
                    {iconFile ? iconFile.name : (lang === 'ar' ? 'اختر صورة الأيقونة' : lang === 'fr' ? 'Choisir une icône' : 'Choose icon')}
                  </span>
                  <input type="file" accept="image/*" onChange={handleIconChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Monetization */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">{t('monetizationTitle')}</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { id: 'none', label: t('noAds') },
                  { id: 'adsense', label: 'Google AdSense' },
                  { id: 'admob', label: 'Google AdMob' },
                  { id: 'custom', label: t('customCode') }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setAdType(item.id as any);
                      setAdError(null);
                    }}
                    className={`py-2 px-3 text-xs rounded-xl font-medium border transition-all cursor-pointer ${
                      adType === item.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {(adType === 'adsense' || adType === 'admob') && (
                <div className="space-y-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      {lang === 'ar' ? 'معرّف الناشر (Publisher ID)' : 'Publisher ID'}
                    </label>
                    <input
                      type="text"
                      placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                      value={adClientId}
                      onChange={(e) => setAdClientId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      {lang === 'ar' ? 'معرّف الوحدة الإعلانية (Slot ID)' : 'Slot ID'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1234567890"
                      value={adSlotId}
                      onChange={(e) => setAdSlotId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              {adType === 'custom' && (
                <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] text-slate-400">
                      {lang === 'ar' ? 'شفرة HTML أو Script الإعلانية' : 'Custom Ad Code'}
                    </label>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3" />
                      {lang === 'ar' ? 'فحص الأمان نشط' : 'Sanitizer Active'}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="<script>...</script>"
                    value={customAdCode}
                    onChange={(e) => setCustomAdCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-white resize-none"
                    dir="ltr"
                  />
                </div>
              )}

              {adType !== 'none' && (
                <div className="mt-3">
                  <label className="block text-[11px] text-slate-400 mb-1.5">
                    {lang === 'ar' ? 'موضع ظهور الإعلان' : lang === 'fr' ? 'Emplacement' : 'Ad Placement'}
                  </label>
                  <select
                    value={adPlacement}
                    onChange={(e) => setAdPlacement(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 cursor-pointer"
                  >
                    <option value="bottom_banner">
                      {lang === 'ar' ? 'بانر سفلي ثابت (شائع ومفضل)' : 'Sticky Bottom Banner'}
                    </option>
                    <option value="top_banner">
                      {lang === 'ar' ? 'بانر علوي خفيف تحت الشريط' : 'Top Header Banner'}
                    </option>
                    <option value="splash">
                      {lang === 'ar' ? 'إعلان شاشة البداية (Splash)' : 'Splash Screen'}
                    </option>
                  </select>
                </div>
              )}

              {adError && (
                <div className="mt-3 p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{adError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 text-white cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{lang === 'ar' ? 'جاري تجهيز التطبيق...' : 'Processing App...'}</span>
                </>
              ) : (
                <>
                  <span>{t('generateBtn')}</span>
                  <ArrowRight className={`h-4 w-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
          </form>

          {createdAppId && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-emerald-200">
                    {lang === 'ar' ? 'تم إنشاء التطبيق بنجاح في Appwrite!' : 'App successfully built in Appwrite!'}
                  </p>
                  <p className="text-xs text-slate-400" dir="ltr">ID: {createdAppId}</p>
                </div>
              </div>
              <a
                href={`/app/${createdAppId}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>{lang === 'ar' ? 'فتح التطبيق' : 'View App'}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Right Side: Phone Mockup مع المعاينة الحية للموقع الفعلي */}
        <div className="lg:col-span-5 flex flex-col items-center sticky top-24 space-y-3">
          {/* شريط أدوات المعاينة */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-1.5 rounded-2xl text-xs text-slate-300 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setPreviewMode('live')}
              className={`px-3 py-1 rounded-xl font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                previewMode === 'live' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'الموقع الفعلي' : 'Live Store'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('splash')}
              className={`px-3 py-1 rounded-xl font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                previewMode === 'splash' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'شاشة الغلاف' : 'App Cover'}</span>
            </button>
            {storeUrl && (
              <button
                type="button"
                onClick={() => setIframeKey((k) => k + 1)}
                title="إعادة تحميل المعاينة"
                className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* هيكل الهاتف */}
          <div className="relative w-[310px] h-[610px] bg-slate-900 border-[8px] border-slate-800 rounded-[48px] shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col justify-between">
            {/* الجزء العلوي (شريط الحالة وشريط التطبيق) */}
            <div className="z-20">
              <div className="h-7 w-full flex items-center justify-between px-6 pt-1 text-[10px] text-white" style={{ backgroundColor: themeColor }} dir="ltr">
                <span>9:41</span>
                {targetPlatform === 'ios' ? (
                  <div className="h-3.5 w-20 bg-black rounded-full flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-900 ml-auto mr-2"></div>
                  </div>
                ) : targetPlatform === 'android' ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-black mx-auto"></div>
                ) : (
                  <div className="h-2.5 w-16 bg-black/40 rounded-full"></div>
                )}
                <span className="flex items-center gap-1">
                  {targetPlatform === 'ios' && <Apple className="h-2.5 w-2.5" />}
                  100%
                </span>
              </div>

              <div className="p-2.5 text-white flex items-center gap-2 shadow-sm" style={{ backgroundColor: themeColor }}>
                <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden shrink-0">
                  {iconPreview ? (
                    <img src={iconPreview} alt="App" className="h-full w-full object-cover" />
                  ) : (
                    <Smartphone className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
                <div className="truncate flex-1">
                  <span className="font-bold text-[11px] block truncate">{appName || (lang === 'ar' ? 'اسم التطبيق' : 'App Name')}</span>
                </div>
              </div>

              {adType !== 'none' && adPlacement === 'top_banner' && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 py-1.5 text-center text-[10px] text-amber-300 font-mono">
                  [ Ad Banner: {adType} ]
                </div>
              )}
            </div>

            {/* منتصف شاشة الهاتف: المعاينة الحية للموقع الفعلي */}
            <div className="flex-1 bg-white relative overflow-hidden flex items-center justify-center">
              {storeUrl ? (
                previewMode === 'live' ? (
                  /* عرض الموقع الفعلي داخل iframe مصغر ومتجاوب */
                  <div className="w-full h-full relative overflow-hidden bg-slate-100">
                    <iframe
                      key={iframeKey}
                      src={`/api/proxy?url=${encodeURIComponent(getCleanUrl(storeUrl))}`}
                      title="Store Preview"
                      className="w-full h-full border-0 pointer-events-auto" dir="ltr"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                  </div>
                ) : (
                  /* شاشة الغلاف والشعار */
                  <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                    <div className="relative mb-3">
                      <div
                        className="absolute inset-0 rounded-2xl blur-lg opacity-40 transform scale-110"
                        style={{ backgroundColor: themeColor }}
                      ></div>
                      {iconPreview ? (
                        <img src={iconPreview} alt="App" className="relative h-16 w-16 rounded-2xl object-cover shadow-xl border border-white/10" />
                      ) : (
                        <div className="relative h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-xl" style={{ backgroundColor: themeColor }}>
                          {appName?.charAt(0) || 'P'}
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-sm text-white">{appName || 'اسم التطبيق'}</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] truncate" dir="ltr">{storeUrl}</p>
                  </div>
                )
              ) : (
                <div className="text-slate-400 text-xs space-y-2 p-4 text-center bg-slate-950 w-full h-full flex flex-col items-center justify-center">
                  <Smartphone className="h-10 w-10 mx-auto opacity-30 text-white" />
                  <p>{lang === 'ar' ? 'أدخل رابط المتجر لتشاهد صفحته الحية هنا' : 'Enter store URL to load live page'}</p>
                </div>
              )}
            </div>

            {/* الجزء السفلي (الإعلان وشريط التنقل) */}
            <div className="z-20 bg-slate-900">
              {adType !== 'none' && adPlacement === 'bottom_banner' && (
                <div className="bg-amber-500/10 border-t border-amber-500/20 py-1.5 text-center text-[10px] text-amber-300 font-mono">
                  [ Sticky Ad: {adType} ]
                </div>
              )}
              <div className="h-7 bg-slate-900 border-t border-slate-800 flex items-center justify-center">
                <div className={`h-1 rounded-full bg-slate-600 ${targetPlatform === 'ios' ? 'w-24' : 'w-14'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white">
            {lang === 'ar' ? 'لماذا تختار AppForge PWA؟' : lang === 'fr' ? 'Pourquoi choisir AppForge ?' : 'Why AppForge PWA?'}
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            {lang === 'ar'
              ? 'كل ما تحتاجه لإطلاق تطبيق متجرك وزيادة أرباحك وتثبيت ولاء عملائك.'
              : 'Everything you need to launch your mobile storefront and maximize monetization.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {lang === 'ar' ? 'تثبيت فوري دون متاجر' : 'Instant No-Store Install'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'تخطى عمولات متجر Apple و Google بنسبة 30% واجعل زوارك يثبتون تطبيقك مباشرة على الشاشة الرئيسية.'
                : 'Bypass 30% store fees and let customers install your store directly onto their home screen.'}
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-3">
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {lang === 'ar' ? 'تحقيق الدخل التلقائي' : 'Integrated Monetization'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'دمج شفرات AdSense و AdMob والشفرات المخصصة في ثوانٍ مع عزل تام يضمن سرعة وأمان المتجر.'
                : 'Seamlessly monetize with AdSense, AdMob, or custom scripts inside an isolated safe sandbox.'}
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {lang === 'ar' ? 'مدعوم بقوة Appwrite' : 'Powered by Appwrite'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'قاعدة بيانات سحابية وتخزين آمن للأيقونات والملفات يضمن بقاء تطبيقك سريعاً ومتوفراً دائماً.'
                : 'Enterprise-grade cloud databases and asset storage ensuring maximum uptime and speed.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. PRICING SECTION */}
      <section className="max-w-4xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white">
            {lang === 'ar' ? 'خطط أسعار بسيطة وشفافة' : 'Simple, Transparent Pricing'}
          </h2>
          <p className="text-slate-400 text-sm">
            {lang === 'ar' ? 'ابدأ مجاناً وادفع فقط عند تصدير الحزم النظيفة لمتجرك.' : 'Start free and upgrade only when you export clean packages.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-lg text-white">{lang === 'ar' ? 'الباقة المجانية' : 'Starter PWA'}</h3>
            <p className="text-3xl font-black text-white">$0</p>
            <p className="text-xs text-slate-400">{lang === 'ar' ? 'لتجربة المنصة وتحويل الروابط' : 'For testing and launching fast PWAs'}</p>
            <ul className="text-xs space-y-2 text-slate-300">
              <li className="flex items-center gap-2">✓ {lang === 'ar' ? 'توليد رابط PWA فوري' : 'Instant PWA link'}</li>
              <li className="flex items-center gap-2">✓ {lang === 'ar' ? 'تثبيت على أجهزة Android و iOS' : 'Install on Android & iOS'}</li>
              <li className="flex items-center gap-2">✓ {lang === 'ar' ? 'دعم دمج الإعلانات' : 'Ad monetization support'}</li>
            </ul>
          </div>

          <div className="bg-gradient-to-b from-slate-900 to-indigo-950/40 border border-indigo-500/40 p-6 rounded-3xl space-y-4 relative shadow-2xl">
            <span className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              {lang === 'ar' ? 'الأكثر طلباً' : 'Popular'}
            </span>
            <h3 className="font-bold text-lg text-white">{lang === 'ar' ? 'باقة التصدير Pro' : 'Clean Export Pro'}</h3>
            <p className="text-3xl font-black text-white">$19 <span className="text-xs text-slate-400 font-normal">{lang === 'ar' ? 'تدفع مرة واحدة' : 'one-time'}</span></p>
            <p className="text-xs text-slate-400">{lang === 'ar' ? 'للتجار والمطورين الذين يريدون الكود بالكامل' : 'Full standalone source code package'}</p>
            <ul className="text-xs space-y-2 text-slate-200">
              <li className="flex items-center gap-2">✓ {lang === 'ar' ? 'تنزيل حزمة الكود النظيف (ZIP)' : 'Download clean standalone ZIP'}</li>
              <li className="flex items-center gap-2">✓ {lang === 'ar' ? 'إزالة أي شعارات خاصة بالمنصة' : '100% Whitelabel (No branding)'}</li>
              <li className="flex items-center gap-2">✓ {lang === 'ar' ? 'ملفات جاهزة لتحويل APK عبر Bubblewrap' : 'Ready for Bubblewrap APK builder'}</li>
              <li className="flex items-center gap-2">✓ {lang === 'ar' ? 'أرباح الإعلانات لك بالكامل 100%' : '100% ad revenues are yours'}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION */}
      <section className="max-w-3xl mx-auto px-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-3xl font-bold text-white flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-indigo-400" />
            <span>{lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</span>
          </h2>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-1.5">
            <h4 className="text-sm font-bold text-white">
              {lang === 'ar' ? 'هل يعمل التطبيق مع متاجر سلة، زد، وShopify؟' : 'Does it work with Shopify, WooCommerce & Custom Stores?'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'نعم، المنصة متوافقة تماماً مع جميع منصات التجارة الإلكترونية وصفحات الهبوط المبنية بأي تقنية.'
                : 'Yes, AppForge works seamlessly with any web URL, eCommerce store, or custom landing page.'}
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-1.5">
            <h4 className="text-sm font-bold text-white">
              {lang === 'ar' ? 'كيف يستفيد زواري من تثبيت التطبيق؟' : 'How do visitors install the app?'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'بمجرد فتح الرابط، يظهر لهم زر تثبيت بنقرة واحدة ليضاف التطبيق إلى شاشتهم الرئيسية مثل أي تطبيق جوال عادي.'
                : 'Visitors get a one-click install button that adds your app directly to their home screen.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
