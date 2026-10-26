import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Sparkles, Wrench } from 'lucide-react';
import ToolsListClient from './ToolsListClient';

export const metadata: Metadata = {
  title: 'Free PWA Developer Tools',
  description:
    'Suite of free Progressive Web App developer tools: manifest generator, icon resizer, QR generator, assetlinks validator, and APK auditor.',
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
  },
  openGraph: {
    type: 'website',
    url: 'https://appifya.app/tools',
    title: 'Free PWA Developer Tools & Utilities | Appifya',
    description:
      'Manifest generator, icon generator, PWA readiness checker and more — all free, no sign-up required.',
    siteName: 'Appifya',
    images: [{ url: '/logo.jpg.jpeg', width: 1200, height: 630, alt: 'Appifya PWA Tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PWA Developer Tools & Utilities | Appifya',
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
    {
      '@type': 'WebApplication',
      name: 'Smart App Banner Code Generator',
      url: 'https://appifya.app/tools/app-banner-generator',
      applicationCategory: 'DeveloperApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'WebApplication',
      name: 'Digital Asset Links Generator',
      url: 'https://appifya.app/tools/assetlinks-generator',
      applicationCategory: 'DeveloperApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'WebApplication',
      name: 'App Store Screenshot Mockup Framer',
      url: 'https://appifya.app/tools/app-mockup-framer',
      applicationCategory: 'DesignApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'WebApplication',
      name: 'Android AAB / APK Permissions & SDK Auditor',
      url: 'https://appifya.app/tools/apk-permissions-auditor',
      applicationCategory: 'DeveloperApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'WebApplication',
      name: 'Google Play Data Safety & Privacy Form Generator',
      url: 'https://appifya.app/tools/play-data-safety',
      applicationCategory: 'DeveloperApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

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
        <ToolsListClient />

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
