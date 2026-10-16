 'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { databases } from '@/lib/appwrite';
import { Smartphone, Download, ExternalLink, Share2, Check, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

export default function AppInstallPage() {
  const params = useParams();
  const id = params?.id as string;

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);

  const databaseId = '6ace931c00205a66e468';
  const collectionId = '6ace935d0015975c804b';

  useEffect(() => {
    if (id) {
      loadAppDetails();
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [id]);

  const loadAppDetails = async () => {
    try {
      setLoading(true);
      const doc = await databases.getDocument(databaseId, collectionId, id);
      setApp(doc);
    } catch (err) {
      console.error('Error loading app:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      alert(
        'لتثبيت التطبيق على جهازك:\n- على أندرويد (Chrome): اضغط على قائمة الخيارات (⋮) ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".\n- على آيفون (Safari): اضغط على زر المشاركة ثم اختر "إضافة إلى الشاشة الرئيسية".'
      );
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
        <a href="/" className="px-5 py-2.5 bg-indigo-600 rounded-xl text-xs font-semibold text-white mt-2">
          العودة للرئيسية
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 font-sans" dir="rtl">
      <div className="max-w-md w-full mx-auto space-y-8 pt-4">
        {/* App Card Header */}
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
            <span>تطبيق PWA آمن ومعتمد</span>
          </div>
        </div>

        {/* Action Buttons */}
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

        {/* Instructions Guide */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-xs space-y-2 text-slate-400 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-slate-200 mb-1">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>كيف يتم تثبيت التطبيق؟</span>
          </div>
          <p>
            تطبيقات الويب التقدمية (PWA) تعمل فوراً دون الحاجة لمتجر التطبيقات ودون استهلاك مساحة التخزين.
          </p>
          <p className="text-[11px] text-slate-500">
            إذا لم يظهر زر التثبيت التلقائي: في متصفح Chrome اضغط على قائمة الخيارات (⋮) ثم اختر <strong className="text-slate-300">"تثبيت التطبيق"</strong>.
          </p>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-600 mt-8">
        مشغّل بواسطة منصة <span className="text-slate-400 font-semibold">Appifya PWA</span>
      </div>
    </div>
  );
}