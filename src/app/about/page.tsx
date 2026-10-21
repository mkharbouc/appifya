'use client';

import React from 'react';
import { useLanguage } from '../lib/i18n';
import { Rocket, ShieldCheck, Zap, HeartHandshake } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const { lang } = useLanguage();

  return (
    <main className="theme-page flex-1 max-w-5xl mx-auto px-6 py-16 space-y-12">
      {/* Hero Intro */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Rocket className="h-3.5 w-3.5" />
          <span>{lang === 'ar' ? 'رؤيتنا' : lang === 'fr' ? 'Notre Vision' : 'Our Mission'}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          {lang === 'ar' ? 'تمكين كل متجر من امتلاك تطبيق جوال قوي' : lang === 'fr' ? 'Chaque boutique mérite son application mobile' : 'Empowering every store with a high-performance mobile app'}
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 text-sm md:text-base leading-relaxed">
          {lang === 'ar'
            ? 'تأسست منصة Appifya لسد الفجوة بين تكلفة تطوير التطبيقات الباهظة وسرعة إطلاق المتاجر. نساعد أصحاب المتاجر وصناع المحتوى على تحويل روابطهم إلى تطبيقات تقدمية سريعة بنقرة واحدة.'
            : lang === 'fr'
            ? 'Appifya a été créée pour éliminer les barrières de coût et de complexité liées au développement mobile. Transformez vos sites en applications PWA natives en quelques secondes.'
            : 'Appifya was built to bridge the gap between expensive native app development and instant store launches. Convert any URL into a high-converting PWA in seconds.'}
        </p>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            {lang === 'ar' ? 'السرعة الفائقة' : lang === 'fr' ? 'Vitesse Éclair' : 'Ultra Fast'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === 'ar'
              ? 'تطبيقات الويب التقدمية خفيفة جداً، تفتح فورياً دون الحاجة لانتظار تحميلات المتاجر الطويلة.'
              : lang === 'fr'
              ? 'Des applications légères et optimisées qui s’ouvrent instantanément sans téléchargement lourd.'
              : 'Lightweight and optimized PWAs that launch instantly with near-zero load latency.'}
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            {lang === 'ar' ? 'فحص وأمان الأكواد' : lang === 'fr' ? 'Sécurité et Isolation' : 'Secure & Sanitized'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === 'ar'
              ? 'نظام فحص صارم لشفرات الإعلانات لمنع أي تضارب أو اختراق لصفحة المتجر الأصلية.'
              : lang === 'fr'
              ? 'Vérification automatique et sécurisation du code publicitaire pour protéger votre site.'
              : 'Strict code sanitization to keep your store isolated and safe from script collisions.'}
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            {lang === 'ar' ? 'دعم مستمر للمطورين' : lang === 'fr' ? 'Support Développeur' : 'Developer Ready'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === 'ar'
              ? 'تصدير كود نظيف وتوافق تام مع معايير Google TWA و Bubblewrap للراغبين برفع التطبيق للمتجر.'
              : lang === 'fr'
              ? 'Code source propre prêt pour le Google Play Store via Bubblewrap et TWA.'
              : 'Clean standalone source packages ready for Google Play submission via Bubblewrap.'}
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-violet-950/30 border border-zinc-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          {lang === 'ar' ? 'جاهز لتحويل متجرك اليوم؟' : lang === 'fr' ? 'Prêt à propulser votre boutique ?' : 'Ready to launch your mobile app?'}
        </h2>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 transition-all hover:opacity-95"
        >
          {lang === 'ar' ? 'ابدأ الآن مجاناً' : lang === 'fr' ? 'Commencer Gratuitement' : 'Get Started for Free'}
        </Link>
      </div>
    </main>
  );
}