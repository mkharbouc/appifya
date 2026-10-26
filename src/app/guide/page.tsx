import type { Metadata } from 'next';
import GuideClient from './GuideClient';

export const metadata: Metadata = {
  title: 'App Installation Guide',
  description:
    'Step-by-step instructions to install your generated Android APK package and add your Progressive Web App to the iOS iPhone and iPad home screen.',
  keywords: [
    'install APK guide',
    'how to install APK on Android',
    'install PWA on iPhone',
    'add PWA to iOS home screen',
    'Appifya installation guide',
    'allow unknown sources Android',
    'PWA install instructions',
  ],
  alternates: {
    canonical: 'https://appifya.app/guide',
  },
  openGraph: {
    type: 'article',
    url: 'https://appifya.app/guide',
    title: 'Installation Guide - Install Android APK & iOS PWA | Appifya',
    description:
      'Step-by-step instructions on installing your APK on Android devices and adding your PWA to iPhone and iPad home screens.',
    siteName: 'Appifya',
    images: [{ url: '/logo.jpg.jpeg', width: 1200, height: 630, alt: 'Appifya Installation Guide' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Installation Guide | Appifya',
    description: 'Learn how to install your generated Android APK and iOS PWA in simple steps.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function GuidePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Install Your App After Downloading from Appifya',
    description: 'Instructions for installing generated Android APK and adding iOS Progressive Web Apps to home screens.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Download the APK file',
        text: 'Download the APK file directly from your Appifya dashboard once compilation finishes.',
        url: 'https://appifya.app/guide#step-download',
      },
      {
        '@type': 'HowToStep',
        name: 'Allow unknown sources',
        text: 'Enable installation from unknown sources in your Android security settings for your browser or file manager.',
        url: 'https://appifya.app/guide#step-security',
      },
      {
        '@type': 'HowToStep',
        name: 'Open and install the APK',
        text: 'Tap the downloaded APK file in your Downloads folder and confirm installation.',
        url: 'https://appifya.app/guide#step-install',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuideClient />
    </>
  );
}
