'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { databases } from '@/lib/appwrite';
import { Download, Share2, Check, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

function PwaViewContent() {
  const params = useParams();
  const id = params?.id as string;

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [copied, setCopied] = useState(false);

  const databaseId = '6ace931c00205a66e468';
  const collectionId = '6ace935d0015975c804b';

  useEffect(() => {
    if (id) {
      loadApp();

      let manifestLink = document.querySelector("link[rel*='manifest']") as HTMLLinkElement;
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        document.head.appendChild(manifestLink);
      }
      manifestLink.href = `/app/${id}/manifest.json`;
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [id]);

  const loadApp = async () => {
    try {
      setLoading(true);
      const doc = await databases.getDocument(databaseId, collectionId, id);
      setApp(doc);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('لتثبيت التطبيق على جهازك:\n- Chrome (أندرويد): اضغط على القائمة (⋮) ثم "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق".\n- Safari (آيفون): اضغط على زر المشاركة ثم "إضافة إلى الشاشة الرئيسية".');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: app?.app_name || 'App',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4 text-center">
        <p className="text-sm font-semibold mb-3">التطبيق غير موجود</p>
        <a href="/dashboard" className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold">العودة للوحة التحكم</a>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden font-sans select-none" dir="rtl">
      {!isStandalone && (
        <header className="h-14 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-2.5 truncate">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 shadow"
              style={{ backgroundColor: app.theme_color || '#6366f1' }}
            >
              {app.app_name ? app.app_name.substring(0, 2).toUpperCase() : 'AP'}
            </div>
            <span className="font-bold text-white text-xs sm:text-sm truncate">{app.app_name}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copied ? 'تم النسخ' : 'مشاركة'}</span>
            </button>

            <button
              onClick={handleInstall}
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>تثبيت التطبيق</span>
            </button>
          </div>
        </header>
      )}

      <main className="flex-1 w-full h-full relative bg-black">
        <iframe
          src={app.store_url}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; geolocation"
          sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts allow-downloads"
        />
      </main>
    </div>
  );
}

export default function PwaViewerPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}>
      <PwaViewContent />
    </Suspense>
  );
}
