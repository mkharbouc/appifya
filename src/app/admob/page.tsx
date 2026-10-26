import type { Metadata } from 'next';
import AdmobClient from './AdmobClient';

export const metadata: Metadata = {
  title: 'Google AdMob Setup Wizard',
  description:
    'Integrate Google AdMob banner, interstitial, and rewarded ads into your mobile PWA. Maximize mobile revenue with built-in ad network tools.',
  keywords: [
    'AdMob integration',
    'monetize PWA',
    'AdMob mobile ads',
    'banner ads Android app',
    'interstitial ads PWA',
    'Appifya AdMob setup',
  ],
  alternates: {
    canonical: 'https://appifya.app/admob',
  },
  openGraph: {
    type: 'website',
    url: 'https://appifya.app/admob',
    title: 'Google AdMob Setup & App Monetization | Appifya',
    description:
      'Configure native AdMob banners and interstitial ads for your mobile app with a seamless guided wizard.',
    siteName: 'Appifya',
    images: [{ url: '/logo.jpg.jpeg', width: 1200, height: 630, alt: 'Appifya AdMob Setup' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Google AdMob Setup & App Monetization | Appifya',
    description: 'Add Google AdMob monetization to your store mobile app.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function AdmobPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Google AdMob Setup & Mobile Monetization Wizard',
    url: 'https://appifya.app/admob',
    description: 'Integrate Google AdMob banner, interstitial, and rewarded ads into your mobile PWA.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AdmobClient />
    </>
  );
}
