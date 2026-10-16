'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from './lib/i18n';
import { databases, storage } from '@/lib/appwrite';
import { ID } from 'appwrite';
import {
  Smartphone,
  Globe,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Eye,
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
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [adsNetwork, setAdsNetwork] = useState('none');
  const [adsCode, setAdsCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Appwrite IDs with fallback
  const databaseId =
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ||
    process.env.NEXT_PUBLIC_DATABASE_ID ||
    '6ace935d0015975c804b';

  const collectionId =
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID ||
    process.env.NEXT_PUBLIC_COLLECTION_ID ||
    process.env.NEXT_PUBLIC_APPWRITE_TABLE_ID ||
    'pwa_db';

  const bucketId =
    process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID ||
    process.env.NEXT_PUBLIC_BUCKET_ID ||
    '';

  const isRtl = lang === 'ar';

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const executeSaveApp = async (userId: string) => {
    if (!storeUrl) {
      setStatusMsg({
        type: 'error',
        text: lang === 'ar' ? 'يرجى إدخال رابط المتجر أو صفحة الهبوط أولاً.' : 'Please enter your store or landing page URL first.',
      });
      return;
    }

    try {
      setLoading(true);
      setStatusMsg(null);

      let iconUrl = '';
      if (iconFile && bucketId) {
        try {
          const uploadRes = await storage.createFile(bucketId, ID.unique(), iconFile);
          iconUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'}/storage/buckets/${bucketId}/files/${uploadRes.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''}`;
        } catch (uploadErr) {
          console.warn('Icon upload skipped/failed:', uploadErr);
        }
      }

      const formattedUrl = storeUrl.startsWith('http://') || storeUrl.startsWith('https://')
        ? storeUrl
        : `https://${storeUrl}`;

      const finalAppName = appName.trim() || 'My PWA Store';

      await databases.createDocument(databaseId, collectionId, ID.unique(), {
        user_id: userId,
        store_url: formattedUrl,
        app_name: finalAppName,
        theme_color: themeColor,
        platform: platform,
        icon_url: iconUrl || '',
        ads_network: adsNetwork,
        ads_code: adsCode,
      });

      setStatusMsg({
        type: 'success',
        text: lang === 'ar' ? 'تم حفظ التطبيق وتصديره بنجاح! جاري تحويلك إلى لوحة التحكم...' : 'App saved and exported successfully! Redirecting...',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: err.message || (lang === 'ar' ? 'فشل حفظ التطبيق، يرجى المحاولة ثانية.' : 'Failed to save app, please try again.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrExport = () => {
    if (!storeUrl) {
      setStatusMsg({
        type: 'error',
        text: lang === 'ar' ? 'يرجى إدخال رابط المتجر أولاً.' : 'Please enter your store URL first.',
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
            <>
              حوّل متجرك أو صفحة الهبوط إلى <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">تطبيق PWA فائق السرعة</span>
            </>
          ) : lang === 'fr' ? (
            <>
              Transformez votre boutique en une <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">PWA Mobile Ultra-Rapide</span>
            </>
          ) : (
            <>
              Convert Your Store or Landing Page into a <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Fast Mobile PWA</span>
            </>
          )}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          {lang === 'ar'
            ? 'أنشئ تطبيق ويب تقدمي قابل للتثبيت بضغطة زر، مدمج بحزم إعلانية متوافقة ومربوط سحابياً مع لوحة تحكمك.'
            : 'Build an installable Progressive Web App with native ad integration, custom styles, and instant cloud sync.'}
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
        {/* Form Panel */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {lang === 'ar' ? 'رابط المتجر أو صفحة الهبوط' : 'Store or Landing Page URL'} *
            </label>
            <div className="relative">
              <Globe className="absolute right-4 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="url"
                required
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="https://yourstore.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-11 pl-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {lang === 'ar' ? 'اسم التطبيق' : 'App Name'}
            </label>
            <div className="relative">
              <Smartphone className="absolute right-4 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="Trendy Store"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-11 pl-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {lang === 'ar' ? 'المنصة المستهدفة' : 'Target Platform'}
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
                  {p === 'both' ? (lang === 'ar' ? 'الكل (موصى به)' : 'Both') : p === 'android' ? 'Android Only' : 'iOS Only'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {lang === 'ar' ? 'لون الهوية (Theme Color)' : 'Theme Color'}
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
                {lang === 'ar' ? 'أيقونة التطبيق' : 'App Icon'}
              </label>
              <label className="flex items-center justify-center gap-2 bg-slate-950 border border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-2.5 cursor-pointer text-xs text-slate-400 hover:text-white transition-all">
                <UploadCloud className="h-4 w-4" />
                <span className="truncate max-w-[150px]">{iconFile ? iconFile.name : (lang === 'ar' ? 'اختر أيقونة' : 'Upload Icon')}</span>
                <input type="file" accept="image/*" onChange={handleIconChange} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {lang === 'ar' ? 'شبكة الإعلانات (اختياري)' : 'Monetization & Ads'}
            </label>
            <select
              value={adsNetwork}
              onChange={(e) => setAdsNetwork(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="none">{lang === 'ar' ? 'بدون إعلانات' : 'No Ads'}</option>
              <option value="google_adsense">Google AdSense</option>
              <option value="custom_script">{lang === 'ar' ? 'كود إعلاني مخصص (Custom Script)' : 'Custom Ad Script'}</option>
            </select>
          </div>

          {adsNetwork !== 'none' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {lang === 'ar' ? 'كود الإعلان' : 'Ad Script Code'}
              </label>
              <textarea
                rows={3}
                value={adsCode}
                onChange={(e) => setAdsCode(e.target.value)}
                placeholder="<script async src='https://pagead2.googlesyndication.com/...'></script>"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                dir="ltr"
              />
            </div>
          )}

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
                      ? (lang === 'ar' ? 'حفظ وتصدير التطبيق إلى لوحة التحكم' : 'Save & Export to Dashboard')
                      : (lang === 'ar' ? 'تسجيل الدخول وتصدير التطبيق' : 'Sign In & Export App')}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Mockup Phone Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-24 w-full max-w-xs">
            <div className="text-center mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-[11px] font-semibold text-indigo-400 rounded-full">
                <Eye className="h-3.5 w-3.5" />
                <span>{lang === 'ar' ? 'معاينة حية للتطبيق' : 'Live Phone Preview'}</span>
              </span>
            </div>

            <div className="relative mx-auto border-[10px] border-slate-900 bg-slate-950 rounded-[44px] shadow-2xl overflow-hidden aspect-[9/19] flex flex-col ring-1 ring-slate-800">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-20"></div>

              <div
                className="h-14 px-5 pt-5 pb-2 flex items-center justify-between text-[10px] text-white font-semibold transition-colors z-10"
                style={{ backgroundColor: themeColor }}
              >
                <div className="flex items-center gap-2 truncate">
                  {iconPreview ? (
                    <img src={iconPreview} alt="App Icon" className="h-5 w-5 rounded-md object-cover" />
                  ) : (
                    <Smartphone className="h-4 w-4" />
                  )}
                  <span className="truncate">{appName || 'App Name'}</span>
                </div>
                <span>9:41</span>
              </div>

              <div className="flex-1 bg-slate-900/60 flex flex-col items-center justify-center p-4 text-center">
                {storeUrl ? (
                  <div className="space-y-3">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-bold">{appName || 'My PWA Store'}</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[200px]" dir="ltr">
                      {storeUrl}
                    </p>
                    <span className="inline-block text-[10px] px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
                      {platform === 'both' ? 'iOS & Android' : platform}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 text-slate-600">
                    <Smartphone className="h-12 w-12 mx-auto stroke-1" />
                    <p className="text-xs">{lang === 'ar' ? 'أدخل رابط المتجر لتظهر المعاينة' : 'Enter URL to preview app'}</p>
                  </div>
                )}
              </div>

              <div className="h-5 bg-slate-950 flex items-center justify-center">
                <div className="w-24 h-1 bg-slate-700 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
