import type { Metadata } from 'next';
import PlayTestersClient from './PlayTestersClient';

export const metadata: Metadata = {
  title: 'Google Play 20 Testers Link Generator',
  description:
    'Free Google Play 20 closed testers tool. Generate web opt-in and direct download links, tester invite templates, and fix "App not available" errors.',
  keywords: [
    'google play 20 testers',
    'google play 14 days 20 testers',
    'google play closed testing links',
    'app not available google play tester',
    'google play opt in link generator',
    'google play testing url formatter',
    'closed testing link inspector',
    'google play 20 testers generator',
    'google play console tester invitation',
    'appifya developer tools',
  ],
  alternates: {
    canonical: 'https://www.appifya.app/tools/play-testers-generator',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.appifya.app/tools/play-testers-generator',
    title: 'Google Play 20 Testers Link Generator & Verification Inspector | Appifya',
    description:
      'Format official opt-in URLs, create multi-channel tester invite templates, and diagnose the "App not available" error with an interactive troubleshooting checklist.',
    siteName: 'Appifya',
    images: [
      {
        url: '/logo.jpg.jpeg',
        width: 1200,
        height: 630,
        alt: 'Google Play 20 Testers Tool by Appifya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Google Play 20 Testers Link Generator & Verification Inspector | Appifya',
    description:
      'Format official opt-in URLs, create multi-channel tester invite templates, and diagnose the "App not available" error.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function PlayTestersPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Google Play 20 Testers Link Generator & Verification Inspector',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    url: 'https://www.appifya.app/tools/play-testers-generator',
    description:
      'Interactive utility to generate verified Google Play closed testing opt-in URLs, direct Play Store download links, invitation templates, and diagnose the "App not available" error.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Instant Web Opt-in & Android Play Store URL generator',
      'Package name syntax & format validator',
      'Multi-channel invitation templates (WhatsApp, Email, Reddit/Discord)',
      '14-day progress tracking countdown checklist',
      'Interactive "App Not Available" error diagnosis wizard with root cause fixes',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PlayTestersClient />
    </>
  );
}
