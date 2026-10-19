'use client';

import React from 'react';
import { useLanguage } from '../lib/i18n';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPage() {
  const { lang } = useLanguage();

  return (
    <main className="theme-page flex-1 max-w-4xl mx-auto px-6 py-16 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Shield className="h-3.5 w-3.5" />
          <span>{lang === 'ar' ? 'الأمان والامتثال' : lang === 'fr' ? 'Sécurité & Conformité' : 'Security & Compliance'}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white">
          {lang === 'ar' ? 'سياسة الخصوصية' : lang === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy'}
        </h1>
        <p className="text-xs text-slate-500 font-mono">
          {lang === 'ar' ? 'آخر تحديث: 2026' : lang === 'fr' ? 'Dernière mise à jour : 2026' : 'Last updated: 2026'}
        </p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-8 text-sm leading-relaxed text-slate-300">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-indigo-400" />
            <span>{lang === 'ar' ? '1. البيانات التي نجمعها' : lang === 'fr' ? '1. Données collectées' : '1. Information We Collect'}</span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm">
            {lang === 'ar'
              ? 'نحن نجمع فقط المعلومات الضرورية لتشغيل وتوليد تطبيقك: رابط المتجر، اسم التطبيق، الألوان المختارة، والأيقونة المرفوعة. عند اختيار AdMob، نخزن معرّف التطبيق ومعرّف وحدة الإعلان اللذين يقدمهما العميل. لا نصل إلى بيانات عملاء متجرك أو أرباح AdMob.'
              : lang === 'fr'
              ? 'Nous collectons uniquement les informations requises pour générer votre application : URL, nom, couleurs et icônes. Nous n’avons pas accès aux données de vos clients.'
              : 'We only collect details necessary to build your PWA: store URL, app name, theme color, and uploaded icons. We do not access your customers’ personal data.'}
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-800/80 pt-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="h-4 w-4 text-pink-400" />
            <span>{lang === 'ar' ? '2. شبكات الإعلانات وتحقيق الدخل' : lang === 'fr' ? '2. Publicité et Monétisation' : '2. Advertising & Monetization'}</span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm">
            {lang === 'ar'
              ? 'إعداد AdMob اختياري ومخصص لتطبيق Android. التحويل المجاني لا يحتوي على إعلانات. عند استخدامه، يتصل التطبيق بخدمات Google لعرض الإعلانات وفق إعدادات العميل، ويجب على العميل الالتزام بسياسات Google ومتطلبات الخصوصية والموافقة.'
              : lang === 'fr'
              ? 'AdMob est facultatif et réservé à Android. L’export gratuit ne contient aucune publicité. Lorsqu’il est activé, l’application communique avec les services Google selon les paramètres du client, qui doit respecter les règles Google et les exigences de consentement et de confidentialité.'
              : 'AdMob is optional and Android-only. The free export has no ads. When enabled, the app communicates with Google services under the customer’s settings; the customer must follow Google policies and applicable consent and privacy requirements.'}
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-800/80 pt-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            <span>{lang === 'ar' ? '3. حماية وتخزين البيانات' : lang === 'fr' ? '3. Stockage et Sécurité' : '3. Data Storage & Protection'}</span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm">
            {lang === 'ar'
              ? 'تتم معالجة وتخزين بيانات التكوين عبر بنية Appwrite السحابية المشفرة، مع تطبيق بروتوكولات الأمان القياسية (SSL/TLS) لحماية بياناتكم أثناء النقل والتخزين.'
              : lang === 'fr'
              ? 'Vos configurations sont stockées en toute sécurité sur notre infrastructure Appwrite avec chiffrement SSL/TLS standard.'
              : 'All configuration data is securely hosted and managed on encrypted Appwrite infrastructure with standard SSL/TLS protection.'}
          </p>
        </section>
      </div>
    </main>
  );
}
