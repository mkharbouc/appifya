import { Suspense } from 'react';
import type { Metadata } from 'next';
import ApkAuditorClient from './ApkAuditorClient';

export const metadata: Metadata = {
  title: 'Android AAB / APK Permissions & SDK Auditor - Google Play 2026 Compliance Tool',
  description:
    'Free local, in-browser Android APK and AAB permissions auditor. Detect hidden third-party SDKs, high-risk permissions (QUERY_ALL_PACKAGES, location, camera), and generate tools:node="remove" manifest snippets.',
  keywords: [
    'apk permissions auditor',
    'aab permissions checker',
    'android apk manifest analyzer',
    'google play query_all_packages check',
    'android sensitive permissions checker',
    'third party sdk detector apk',
    'tools node remove generator',
    'google play 2026 compliance auditor',
    'Appifya developer tools',
  ],
  alternates: {
    canonical: 'https://appifya.app/tools/apk-permissions-auditor',
    languages: {
      ar: 'https://appifya.app/tools/apk-permissions-auditor',
      en: 'https://appifya.app/tools/apk-permissions-auditor',
      fr: 'https://appifya.app/tools/apk-permissions-auditor',
      'x-default': 'https://appifya.app/tools/apk-permissions-auditor',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://appifya.app/tools/apk-permissions-auditor',
    title: 'AAB / APK Permissions & SDK Auditor - Appifya',
    description:
      'Inspect APK and AAB manifests directly in your browser. Spot policy-violating SDKs, assess risk levels, and export removal snippets.',
    siteName: 'Appifya',
    images: [
      {
        url: '/logo.jpg.jpeg',
        width: 1200,
        height: 630,
        alt: 'Android Permissions and SDK Auditor by Appifya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Android AAB / APK Permissions & SDK Auditor',
    description:
      'Free in-browser tool to audit Android permissions and detected SDKs for Google Play Store compliance.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function ApkPermissionsAuditorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AAB / APK Android Permissions & SDK Auditor',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Android, All',
    browserRequirements: 'Requires JavaScript, runs 100% in browser',
    url: 'https://appifya.app/tools/apk-permissions-auditor',
    description:
      'Free developer utility to inspect APK, AAB, and AndroidManifest.xml files locally in the browser to identify sensitive permissions, hidden SDKs, and Google Play policy violations.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      '100% client-side APK and AAB archive parsing with zero server uploads',
      'Binary XML (AXML) and bytecode DEX scanning for third-party SDKs',
      'Google Play 2026 risk classification (Critical, High, Medium, Safe)',
      'Specific warnings for QUERY_ALL_PACKAGES, location, and media storage',
      'Ready-to-copy tools:node="remove" XML snippets for AndroidManifest.xml',
      'Export audit reports in Markdown (.md) and JSON (.json)',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Are my APK or AAB files uploaded to your server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The auditor operates 100% locally inside your web browser using JavaScript and WebAssembly. Your APK/AAB never leaves your computer.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why did Google Play reject my app with QUERY_ALL_PACKAGES?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Google Play restricts QUERY_ALL_PACKAGES to essential use cases like antivirus or file managers. Regular apps must replace it with explicit <queries> declarations.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do third-party SDKs add permissions to my APK?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Android Manifest Merger combines dependency manifests into the final app bundle during compilation. Advertising or tracking SDKs often inject location or background permissions automatically.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I remove an unwanted permission injected by an SDK?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Declare the permission in your primary AndroidManifest.xml with the tools:node="remove" attribute, which tells the compiler to exclude it from the final binary.',
        },
      },
    ],
  };

  return (
    <main className="theme-page flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center text-slate-400">Loading auditor...</div>}>
        <ApkAuditorClient />
      </Suspense>
    </main>
  );
}
