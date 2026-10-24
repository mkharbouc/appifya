'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../lib/i18n';
import {
  FileCode,
  ImageIcon,
  Gauge,
  QrCode,
  ArrowRight,
  Smartphone,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

interface Tool {
  href: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  badge?: string;
  title: { ar: string; en: string; fr: string };
  description: { ar: string; en: string; fr: string };
  cta: { ar: string; en: string; fr: string };
}

const TOOLS: Tool[] = [
  {
    href: '/tools/play-data-safety',
    icon: ShieldCheck,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15 border-amber-500/25',
    badge: 'New',
    title: {
      ar: 'سلامة البيانات Google Play والخصوصية',
      en: 'Google Play Data Safety & Privacy Form',
      fr: 'Sécurité des données Google Play & Privacy',
    },
    description: {
      ar: 'تجنب رفض تطبيقك في Google Play! حدد حزم SDKs لتوليد إجابات دقيقة خطوة بخطوة لاستبيان سلامة البيانات مع سياسة خصوصية مطابقة.',
      en: 'Eliminate Google Play rejections. Select your SDKs to auto-generate exact Data Safety questionnaire answers and a matched privacy policy.',
      fr: 'Évitez les refus Google Play. Générez les réponses exactes du formulaire Sécurité des données et une politique de confidentialité.',
    },
    cta: { ar: 'توليد الإجابات والخصوصية', en: 'Generate Data Safety', fr: 'Générer Sécurité' },
  },
  {
    href: '/tools/app-mockup-framer',
    icon: Smartphone,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/15 border-violet-500/25',
    badge: 'New',
    title: {
      ar: 'مصمم سكرين شوت المتجر (Mockup Framer)',
      en: 'App Store Screenshot Mockup Framer',
      fr: 'Générateur de Screenshots App Store',
    },
    description: {
      ar: 'صمّم لقطات شاشة ترويجية بمقاسات Google Play و App Store الرسمية مع إطارات أجهزة Pixel و iPhone وخلفيات متدرجة وتصدير ZIP كامل.',
      en: 'Design professional, store-compliant screenshots with modern device frames (Pixel, iPhone), gradient backgrounds, and batch ZIP export.',
      fr: 'Créez des captures d’écran d’application conformes aux stores avec cadres Pixel/iPhone, arrière-plans dégradés et export ZIP.',
    },
    cta: { ar: 'فتح المصمم', en: 'Open Framer', fr: 'Ouvrir' },
  },
  {
    href: '/tools/assetlinks-generator',
    icon: KeyRound,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15 border-cyan-500/25',
    badge: 'New',
    title: {
      ar: 'مولّد Digital Asset Links (assetlinks.json)',
      en: 'Digital Asset Links Generator',
      fr: 'Générateur Digital Asset Links',
    },
    description: {
      ar: 'أنشئ ملف assetlinks.json لربط نطاق موقعك بتطبيق الأندرويد لفتح الروابط داخل التطبيق مباشرة (App Links / TWA) مع فاحص مباشر للنطاق.',
      en: 'Generate and verify assetlinks.json for Android App Links, Trusted Web Activity (TWA), and seamless deep linking with live domain validator.',
      fr: 'Générez et validez le fichier assetlinks.json pour Android App Links et TWA avec vérificateur de domaine en direct.',
    },
    cta: { ar: 'توليد assetlinks.json', en: 'Create assetlinks.json', fr: 'Créer assetlinks.json' },
  },
  {
    href: '/tools/app-banner-generator',
    icon: Smartphone,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-500/25',
    badge: 'New',
    title: {
      ar: 'مولّد شريط التطبيق الذكي (Smart App Banner)',
      en: 'Smart App Banner Generator',
      fr: 'Générateur de Smart App Banner',
    },
    description: {
      ar: 'أنشئ كود شريط ذكي خفيف وسريع لموقعك يدعو الزوار لتحميل تطبيقك من Google Play مع تخصيص كامل للألوان وخيارات الحفظ.',
      en: 'Generate a lightweight, zero-dependency smart app banner for your website to drive Google Play installs on Android & mobile devices.',
      fr: 'Générez une bannière intelligente légère et sans dépendance pour inciter les visiteurs à installer votre application Google Play.',
    },
    cta: { ar: 'توليد الكود', en: 'Create Banner', fr: 'Créer Bannière' },
  },
  {
    href: '/tools/qr-generator',
    icon: QrCode,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15 border-cyan-500/25',
    badge: 'New',
    title: {
      ar: 'مولّد رمز QR للتطبيق',
      en: 'App QR Code Generator',
      fr: 'Générateur de QR Code',
    },
    description: {
      ar: 'أنشئ رمز QR مخصصاً لتطبيقك أو متجرك مع إضافة شعارك في المنتصف، ألوان هويتك، إطارات الدعوة للتثبيت، والتنزيل بدقة طباعة 300 DPI أو متجه SVG.',
      en: 'Generate custom, high-resolution QR codes for your PWA or store with center logo, brand colors, scan frames, and vector SVG or 300 DPI PNG export.',
      fr: 'Créez des QR codes personnalisés avec logo au centre, couleurs de votre marque, bannières d’action et téléchargement en SVG ou PNG 300 DPI.',
    },
    cta: { ar: 'توليد رمز QR', en: 'Create QR Code', fr: 'Créer QR Code' },
  },
  {
    href: '/tools/manifest-generator',
    icon: FileCode,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/15 border-indigo-500/25',
    title: {
      ar: 'مولّد Web App Manifest',
      en: 'PWA Manifest Generator',
      fr: 'Générateur de Manifest',
    },
    description: {
      ar: 'أنشئ ملف manifest.json متوافقاً مع معايير W3C لتطبيق PWA الخاص بك. معاينة مباشرة، خيارات عرض، إعدادات الأيقونات، والتحميل بنقرة واحدة.',
      en: 'Build a standards-compliant manifest.json for your PWA. Live preview, display mode, icon settings, and one-click download.',
      fr: 'Créez un manifest.json conforme aux standards W3C. Aperçu en direct, mode d\'affichage, icônes et téléchargement en un clic.',
    },
    cta: { ar: 'فتح المولّد', en: 'Open Generator', fr: 'Ouvrir' },
  },
  {
    href: '/tools/icon-generator',
    icon: ImageIcon,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/15 border-purple-500/25',
    title: {
      ar: 'مولّد أيقونات التطبيق',
      en: 'App Icon Generator',
      fr: 'Générateur d\'icônes',
    },
    description: {
      ar: 'ارفع صورة واحدة واحصل فوراً على جميع أحجام أيقونات PWA — 192، 512، maskable، Apple touch icon، وfavicon — في ملف ZIP جاهز.',
      en: 'Upload one image and get every required PWA icon size instantly — 192, 512, maskable, Apple touch icon, and favicon — in a ready-to-use ZIP.',
      fr: 'Téléchargez une image et obtenez toutes les tailles d\'icônes PWA — 192, 512, maskable, Apple touch icon et favicon — dans un ZIP.',
    },
    cta: { ar: 'فتح المولّد', en: 'Open Generator', fr: 'Ouvrir' },
  },
  {
    href: '/tools/pwa-checker',
    icon: Gauge,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-500/25',
    badge: 'New',
    title: {
      ar: 'فاحص جاهزية PWA',
      en: 'PWA Readiness Checker',
      fr: 'Vérificateur PWA',
    },
    description: {
      ar: 'الصق رابط موقعك واكتشف فوراً مدى جاهزيته ليصبح تطبيق PWA: HTTPS، manifest، service worker، viewport، وأكثر.',
      en: 'Paste your URL and instantly see how PWA-ready your site is: HTTPS, manifest, service worker, viewport, theme color, and more.',
      fr: 'Collez votre URL et découvrez instantanément si votre site est prêt pour une PWA : HTTPS, manifest, service worker, viewport et plus.',
    },
    cta: { ar: 'فحص موقعك', en: 'Check Your Site', fr: 'Vérifier' },
  },
];

export default function ToolsListClient() {
  const { lang } = useLanguage();
  const currentLang = (lang === 'ar' || lang === 'fr') ? lang : 'en';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        const titleText = tool.title[currentLang] || tool.title.en;
        const descText = tool.description[currentLang] || tool.description.en;
        const ctaText = tool.cta[currentLang] || tool.cta.en;

        return (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative flex flex-col gap-5 rounded-3xl border border-slate-800 bg-slate-900/70 p-7 hover:border-slate-700 hover:bg-slate-900 transition-all shadow-lg hover:shadow-indigo-500/5"
          >
            {tool.badge && (
              <span className="absolute top-5 end-5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {tool.badge}
              </span>
            )}

            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${tool.iconBg}`}>
              <Icon className={`h-5 w-5 ${tool.iconColor}`} />
            </div>

            <div className="flex-1 space-y-2">
              <h2 className="text-base font-bold text-white leading-snug">
                {titleText}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {descText}
              </p>
            </div>

            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${tool.iconColor} group-hover:gap-2.5 transition-all`}>
              <span>{ctaText}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
