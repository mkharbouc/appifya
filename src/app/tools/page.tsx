import type { Metadata } from 'next';
import Link from 'next/link';
import { FileCode, ImageIcon, Gauge, QrCode, ArrowRight, Sparkles, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free PWA Developer Tools - Manifest Generator, Icon Generator & More',
  description:
    'A growing suite of free tools for Progressive Web App developers: manifest.json generator, app icon generator, PWA readiness checker, and more. No sign-up required.',
  keywords: [
    'PWA tools',
    'free PWA developer tools',
    'Progressive Web App tools',
    'PWA toolkit',
    'manifest generator',
    'icon generator',
    'PWA checker',
    'web app tools online',
    'free developer tools',
    'Appifya tools',
  ],
  alternates: {
    canonical: 'https://appifya.app/tools',
    languages: {
      ar: 'https://appifya.app/tools',
      en: 'https://appifya.app/tools',
      fr: 'https://appifya.app/tools',
      'x-default': 'https://appifya.app/tools',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://appifya.app/tools',
    title: 'Free PWA Developer Tools - Appifya',
    description:
      'Manifest generator, icon generator, PWA readiness checker and more — all free, no sign-up required.',
    siteName: 'Appifya',
    images: [{ url: '/logo.jpg.jpeg', width: 1200, height: 630, alt: 'Appifya PWA Tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PWA Developer Tools - Appifya',
    description: 'Manifest generator, icon generator, PWA readiness checker and more. Free, no sign-up.',
    images: ['/logo.jpg.jpeg'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Appifya PWA Developer Tools',
  url: 'https://appifya.app/tools',
  description: 'A free suite of Progressive Web App developer tools including manifest generator, icon generator, and PWA readiness checker.',
  hasPart: [
    {
      '@type': 'WebApplication',
      name: 'PWA Manifest Generator',
      url: 'https://appifya.app/tools/manifest-generator',
      applicationCategory: 'DeveloperApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'WebApplication',
      name: 'PWA App Icon Generator',
      url: 'https://appifya.app/tools/icon-generator',
      applicationCategory: 'DeveloperApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'WebApplication',
      name: 'PWA Readiness Checker',
      url: 'https://appifya.app/tools/pwa-checker',
      applicationCategory: 'DeveloperApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'WebApplication',
      name: 'App & PWA QR Code Generator',
      url: 'https://appifya.app/tools/qr-generator',
      applicationCategory: 'DeveloperApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

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

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="site-main flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-16">

        {/* Header */}
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-300 mb-4">
            <Wrench className="h-3.5 w-3.5" />
            <span>Free · No sign-up · Always growing</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            PWA{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
              Developer Tools
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Everything you need to build, validate, and ship a great Progressive Web App —
            free, browser-based, and no account required.
          </p>
        </div>

        {/* Tool cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
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
                  {/* Title rendered in all three languages for SEO, display handled via CSS */}
                  <h2 className="text-base font-bold text-white leading-snug">
                    {tool.title.en}
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {tool.description.en}
                  </p>
                </div>

                <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${tool.iconColor} group-hover:gap-2.5 transition-all`}>
                  <span>{tool.cta.en}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 via-zinc-900/50 to-zinc-950/90 p-10 text-center relative overflow-hidden shadow-2xl shadow-black/60">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-white/5 px-3 py-1 text-xs font-bold text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ready to go further?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Turn your site into a full PWA & Android APK
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto mb-7 leading-relaxed">
              The tools above handle the individual pieces. Appifya puts it all together —
              custom icon, manifest, service worker, AdMob integration, and a downloadable
              APK — in one guided workflow.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 ring-1 ring-white/10 transition-all"
            >
              <span>Start building for free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </main>
    </>
  );
}
