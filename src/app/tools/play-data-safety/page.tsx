import { Suspense } from 'react';
import type { Metadata } from 'next';
import PlayDataSafetyClient from './PlayDataSafetyClient';

export const metadata: Metadata = {
  title: 'Play Store Data Safety Generator',
  description:
    'Generate exact answers for the Google Play Data Safety questionnaire and create compliant privacy policies for AdMob, Firebase, and SDKs.',
  keywords: [
    'google play data safety generator',
    'play console data safety form',
    'app privacy policy generator',
    'admob data safety declaration',
    'firebase crashlytics data safety',
    'onesignal data safety google play',
    'play store privacy policy generator',
    'android app data safety form helper',
    'Appifya tools',
  ],
  alternates: {
    canonical: 'https://www.appifya.app/tools/play-data-safety',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.appifya.app/tools/play-data-safety',
    title: 'Google Play Data Safety & Policy Generator | Appifya',
    description:
      'Avoid Google Play app rejections. Generate accurate Data Safety questionnaire responses and compliant privacy policies based on your SDKs.',
    siteName: 'Appifya',
    images: [
      {
        url: '/logo.jpg.jpeg',
        width: 1200,
        height: 630,
        alt: 'Google Play Data Safety Generator by Appifya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Google Play Data Safety & Policy Generator | Appifya',
    description:
      'Step-by-step answers for Google Play Console Data Safety section and tailored privacy policy.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function PlayDataSafetyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Google Play Data Safety & Privacy Form Generator',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    url: 'https://www.appifya.app/tools/play-data-safety',
    description:
      'Free online tool providing step-by-step Google Play Console Data Safety questionnaire answers and customized privacy policies for Android apps and SDKs.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Automatic SDK mapping for AdMob, Firebase Analytics, Crashlytics, OneSignal, Appwrite, and Meta',
      'Accurate question-by-question answers matching Google Play Console Data Safety wizard',
      'Tailored, legally structured Privacy Policy generator with Markdown and HTML export',
      'Data encryption in transit and user deletion compliance checks',
      'Preset profiles for AdMob PWAs, E-Commerce apps, and offline utilities',
      '100% client-side privacy, free with zero sign-up required',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the Google Play Data Safety section?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Data Safety section is a mandatory questionnaire in Google Play Console where developers must declare how their app and third-party SDKs collect, share, and protect user data.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why do apps get rejected or removed due to Data Safety mismatches?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Google automatically scans your APK/AAB binaries and detects embedded SDKs (like AdMob, Firebase, or OneSignal). If your questionnaire states you do not collect advertising IDs or crash logs but your SDK transmits them, Google rejects the release or removes your app.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does Google AdMob collect for Data Safety?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Google Mobile Ads (AdMob) collects Device or other IDs (Advertising ID / GAID) for Advertising & Analytics, as well as Diagnostics and Crash data. All data is encrypted in transit.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use the generated Privacy Policy on my website and Google Play Console?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! The generated Privacy Policy is comprehensive, accurate to your selected SDKs, and complies with Google Play requirements for public URL hosting.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}>
        <PlayDataSafetyClient />
      </Suspense>
    </>
  );
}
