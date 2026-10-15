 'use client';

import React, { useEffect, useState, use } from 'react';
import { databases, storage, DB_ID, TABLE_ID, BUCKET_ID } from '@/app/lib/appwrite';
import { Download, ExternalLink, Loader2, Share2, Smartphone } from 'lucide-react';


export default function MobileAppViewer({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [appData, setAppData] = useState<any>(null);
  const [iconUrl, setIconUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => console.log('SW error:', err));
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    async function fetchAppData() {
      if (!id) return;
      try {
        const doc = await databases.getDocument(DB_ID, TABLE_ID, id);
        setAppData(doc);

        if (doc.icon_id) {
          const viewUrl = storage.getFileView(BUCKET_ID, doc.icon_id);
          setIconUrl(viewUrl.toString());
        }

        let link = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'manifest';
          document.head.appendChild(link);
        }
        link.href = `/app/${id}/manifest.json`;

      } catch (error) {
        console.error('Error fetching app:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAppData();
  }, [id]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'لتثبيت التطبيق على جهازك:\n' +
        '• من المتصفح: اضغط على أيقونة التثبيت بجوار شريط العنوان.\n' +
        '• على أندرويد: اضغط على القائمة (⋮) ثم "تثبيت التطبيق".\n' +
        '• على آيفون: اضغط زر المشاركة ثم "إضافة إلى الشاشة الرئيسية".'
      );
    }
  };

  const renderIsolatedAd = () => {
    if (!appData || !appData.ad_type || appData.ad_type === 'none') return null;

    let adContent = '';
    if (appData.ad_type === 'adsense') {
      adContent = `
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${appData.ad_client_id}" crossorigin="anonymous"></script>
        <ins class="adsbygoogle"
             style="display:inline-block;width:320px;height:50px"
             data-ad-client="${appData.ad_client_id}"
             data-ad-slot="${appData.ad_slot_id}"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      `;
    } else if (appData.ad_type === 'custom') {
      adContent = appData.custom_ad_code || '';
    }

    return (
      <div className="w-full flex items-center justify-center bg-slate-900 border-t border-slate-800 py-1 overflow-hidden z-30">
        <iframe
          srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;background:transparent;overflow:hidden;}</style></head><body>${adContent}</body></html>`}
          className="w-full h-[60px] border-0"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        <p className="text-sm text-slate-400">جاري تحميل التطبيق...</p>
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <Smartphone className="h-12 w-12 text-slate-600 mb-3" />
        <h2 className="text-xl font-bold">عذراً، لم يتم العثور على التطبيق</h2>
        <p className="text-sm text-slate-400 mt-1">تأكد من صحة الرابط أو معرّف التطبيق.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-between text-white" dir="rtl">
      <header
        className="px-5 py-3.5 flex items-center justify-between shadow-lg z-40 transition-colors"
        style={{ backgroundColor: appData.theme_color || '#0f172a' }}
      >
        <div className="flex items-center gap-3">
          {iconUrl ? (
            <img src={iconUrl} alt={appData.app_name} className="h-8 w-8 rounded-xl object-cover bg-white/10 shadow-sm" />
          ) : (
            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-bold text-white shadow-sm">
              {appData.app_name?.charAt(0)}
            </div>
          )}
          <span className="font-bold text-base text-white tracking-wide truncate max-w-[180px] sm:max-w-xs">
            {appData.app_name}
          </span>
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: appData.app_name, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('تم نسخ رابط التطبيق بنجاح!');
            }
          }}
          className="p-2 bg-black/20 hover:bg-black/30 active:scale-95 rounded-full text-white transition-all cursor-pointer"
          title="مشاركة التطبيق"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </header>

      {appData.ad_placement === 'top_banner' && renderIsolatedAd()}

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full">
        <div className="relative mb-6">
          <div
            className="absolute inset-0 rounded-3xl blur-2xl opacity-40 transform scale-110"
            style={{ backgroundColor: appData.theme_color || '#ec4899' }}
          ></div>
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={appData.app_name}
              className="relative h-28 w-28 rounded-3xl object-cover shadow-2xl border border-white/10"
            />
          ) : (
            <div
              className="relative h-28 w-28 rounded-3xl flex items-center justify-center text-4xl font-extrabold shadow-2xl border border-white/10"
              style={{ backgroundColor: appData.theme_color || '#ec4899' }}
            >
              {appData.app_name?.charAt(0)}
            </div>
          )}
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight mb-2">
          {appData.app_name}
        </h1>
        <p className="text-xs text-slate-400 font-mono mb-8 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800" dir="ltr">
          {appData.store_url}
        </p>

        <div className="w-full space-y-3">
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:opacity-95 active:scale-98 transition-all cursor-pointer text-white"
            style={{ backgroundColor: appData.theme_color || '#ec4899' }}
          >
            <Download className="h-4 w-4" />
            <span>{isInstallable ? 'تثبيت التطبيق الآن' : 'تثبيت التطبيق على جهازك'}</span>
          </button>

          <a
            href={appData.store_url}
            className="w-full py-3.5 px-6 rounded-2xl font-semibold text-sm bg-slate-900 hover:bg-slate-800/90 border border-slate-800 text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <span>فتح المتجر مباشرة</span>
            <ExternalLink className="h-4 w-4 text-slate-400" />
          </a>
        </div>
      </main>

      {appData.ad_placement === 'bottom_banner' && renderIsolatedAd()}

      <footer className="py-4 text-center text-[11px] text-slate-600 border-t border-slate-900">
        مشغّل بواسطة منصة AppForge PWA
      </footer>
    </div>
  );
}