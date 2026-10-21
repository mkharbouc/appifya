import type { Metadata } from 'next';
import ManifestGeneratorClient from './ManifestGeneratorClient';

export const metadata: Metadata = {
  title: 'Free PWA Manifest Generator - Create manifest.json Online',
  description:
    'Generate a complete, standard-compliant Web App Manifest (manifest.json) for your Progressive Web App. Live preview, icon upload, and one-click download. 100% free.',
  keywords: [
    'PWA manifest generator',
    'manifest.json generator',
    'web app manifest generator',
    'create manifest.json',
    'PWA builder',
    'Progressive Web App manifest',
    'manifest.json online',
    'generate manifest for PWA',
    'free PWA tools',
    'Appifya tools',
  ],
  alternates: {
    canonical: 'https://appifya.app/tools/manifest-generator',
    languages: {
      ar: 'https://appifya.app/tools/manifest-generator',
      en: 'https://appifya.app/tools/manifest-generator',
      fr: 'https://appifya.app/tools/manifest-generator',
      'x-default': 'https://appifya.app/tools/manifest-generator',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://appifya.app/tools/manifest-generator',
    title: 'Free PWA Manifest Generator - Create manifest.json Online',
    description:
      'Generate a complete, standard-compliant Web App Manifest (manifest.json) for your Progressive Web App. Live preview, icon upload, and one-click download.',
    siteName: 'Appifya',
    images: [
      {
        url: '/logo.jpg.jpeg',
        width: 1200,
        height: 630,
        alt: 'PWA Manifest Generator by Appifya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PWA Manifest Generator - Create manifest.json Online',
    description:
      'Generate a complete, standard-compliant Web App Manifest (manifest.json) for your Progressive Web App.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function ManifestGeneratorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PWA Manifest Generator',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    url: 'https://appifya.app/tools/manifest-generator',
    description:
      'Free online tool to generate standard-compliant manifest.json files for Progressive Web Apps.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Live JSON preview with syntax highlighting',
      'Full W3C Web App Manifest specification support',
      'Multi-size icon configuration (192x192, 512x512, maskable)',
      'Display modes: standalone, fullscreen, minimal-ui, browser',
      'Orientation settings: any, natural, landscape, portrait',
      'Theme and background color pickers',
      'One-click download as manifest.json',
      'Copy to clipboard with one click',
      'Direct integration with Appifya PWA Builder',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a Web App Manifest (manifest.json)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A Web App Manifest is a simple JSON file that tells the browser about your Progressive Web App and how it should behave when installed on a user\'s mobile or desktop device. It includes properties like app name, icons, start URL, theme color, and display mode.',
        },
      },
      {
        '@type': 'Question',
        name: 'What icons are required for a PWA?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Google Chrome and modern browsers require at least two icons: 192x192 PNG for the home screen and 512x512 PNG for the splash screen. It is also recommended to include a maskable icon with purpose: "maskable" for Android adaptive icons.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where should I place the manifest.json file?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Place the manifest.json file in the root directory of your website (e.g., https://example.com/manifest.json) or in your public assets folder. Then link it in the <head> of your HTML using: <link rel="manifest" href="/manifest.json">.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between name and short_name?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The "name" is the full name of the web application used in app install prompts. The "short_name" is a shorter version (ideally under 12 characters) displayed on the user\'s home screen or app launcher where space is limited.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this manifest generator free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, 100% free with no registration required. You can generate, copy, and download unlimited manifest.json files.',
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
      <ManifestGeneratorClient />
    </>
  );
}
