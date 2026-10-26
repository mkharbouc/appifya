import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Convert Website to PWA & Android APK',
  description:
    'Convert your website or online store into a fast, installable PWA and Android APK in minutes. Simple setup, custom branding, and monetization with Appifya.',
  alternates: {
    canonical: 'https://appifya.app',
  },
  openGraph: {
    type: 'website',
    url: 'https://appifya.app',
    title: 'Convert Website to PWA & Android APK | Appifya',
    description:
      'Turn your online store or landing page into a fast mobile PWA and Android APK. Zero coding required, instant APK build, and AdMob integration.',
    siteName: 'Appifya',
    images: [
      {
        url: '/logo.jpg.jpeg',
        width: 1200,
        height: 630,
        alt: 'Appifya - Convert Store or Website to PWA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert Website to PWA & Android APK | Appifya',
    description:
      'Turn your online store or landing page into a fast mobile PWA and Android APK. Zero coding required, instant APK build, and AdMob integration.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function HomePage() {
  return <HomeClient />;
}
