'use client';

import React, { useCallback, useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { databases, DB_ID, TABLE_ID } from '@/lib/appwrite';
import { Smartphone, Download, ExternalLink, Share2, Check, ShieldCheck, Sparkles, Loader2, Info } from 'lucide-react';
import type { AppDocument, BeforeInstallPromptEvent } from '@/lib/types';

function InstallContent() {
  const params = useParams();
  const id = params?.id as string;

  const [app, setApp] = useState<AppDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const loadAppDetails = useCallback(async () => {
    try {
      setLoading(true);
      const doc = await databases.getDocument(DB_ID, TABLE_ID, id);
      setApp(doc);
    } catch (err) {
      console.error('Error loading app:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      // Loading remote Appwrite data is an external synchronization effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadAppDetails();

      // Dynamically attach manifest link
      let link = document.querySelector("link[rel*='manifest']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'manifest';
        document.head.appendChild(link);
      }
      link.href = `/app/${id}/manifest.json`;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [id, loadAppDetails]);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      setShowInstructions(true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: app?.app_name || 'Appifya PWA',
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <Smartphone className="h-12 w-12 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">التطبيق غير موجود أو تم حذفه</h2>
        <Link href="/" className="px-5 py-2.5 bg-indigo-600 rounded-xl text-xs font-semibold text-white mt-2">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 font-sans" dir="rtl">
      <div className="max-w-md w-full mx-auto space-y-6 pt-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
          <div
            className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-3xl font-black shadow-xl mb-4 border border-white/10"
            style={{ backgroundColor: app.theme_color || '#6366f1' }}
          >
            {app.app_name ? app.app_name.substring(0, 2).toUpperCase() : 'AP'}
          </div>

          <h1 className="text-2xl font-black tracking-tight">{app.app_name}</h1>
          <p className="text-xs text-slate-400 mt-1 truncate" dir="ltr">
            {app.store_url}
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 py-1.5 px-3 rounded-full border border-emerald-500/20 w-fit mx-auto">
            <ShieldCheck className="h-4 w-4" />
            <span>تطبيق PWA آمن وموثّق</span>
          </div>
        </div>

        {showInstructions && (
          <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-2xl p-4 text-xs space-y-2 text-indigo-200">
            <div className="flex items-center gap-2 font-bold text-white mb-1">
              <Info className="h-4 w-4 text-indigo-400" />
              <span>خطوات التثبيت السريع:</span>
            </div>
            <p className="leading-relaxed">
              <strong>أندرويد:</strong> اضغط على قائمة الخيارات (⋮) أعلى المتصفح ثم اختر <span className="text-white underline">&quot;تثبيت التطبيق&quot;</span>.
            </p>
            <p className="leading-relaxed">
              <strong>آيفون (iOS):</strong> اضغط على زر المشاركة أسفل Safari ثم اختر <span className="text-white underline">&quot;إضافة إلى الشاشة الرئيسية&quot;</span>.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleInstallClick}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="h-5 w-5" />
            <span>{isInstalled ? 'التطبيق مثبت بالفعل على جهازك' : 'تثبيت التطبيق على هاتفك الآن'}</span>
          </button>

          <a
            href={app.store_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <ExternalLink className="h-4 w-4" />
            <span>فتح المتجر مباشرة في المتصفح</span>
          </a>

          <button
            onClick={handleShare}
            className="w-full py-3 bg-transparent hover:bg-slate-900 border border-slate-800/60 text-slate-400 hover:text-white font-semibold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
            <span>{copied ? 'تم نسخ الرابط بنجاح!' : 'مشاركة رابط التطبيق'}</span>
          </button>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-xs space-y-2 text-slate-400 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-slate-200 mb-1">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>مميزات تطبيق الـ PWA</span>
          </div>
          <p>
            يعمل التطبيق بكامل طاقته بدون استهلاك لسعة الهاتف التخزينية، مع شاشة كاملة وسرعة فائقة دون شريط المتصفح.
          </p>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-600 mt-8">
        مشغّل بواسطة منصة <span className="text-slate-400 font-semibold">Appifya PWA</span>
      </div>
    </div>
  );
}

export default function AppInstallPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}>
      <InstallContent />
    </Suspense>
  );
}
