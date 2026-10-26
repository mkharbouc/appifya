import type { Metadata } from 'next';
import IconGeneratorClient from './IconGeneratorClient';

export const metadata: Metadata = {
  title: 'Free PWA App Icon Generator',
  description:
    'Upload an image to generate all required PWA icons: 192x192, 512x512, maskable, Apple touch icon, and favicon. Instant free ZIP download.',
  keywords: [
    'PWA icon generator',
    'app icon generator',
    'PWA icons all sizes',
    'generate PWA icons',
    'maskable icon generator',
    'favicon generator',
    'Apple touch icon generator',
    'web app icon sizes',
    'PWA icon pack',
    'free icon generator',
    'icon resize online',
    'Appifya tools',
  ],
  alternates: {
    canonical: 'https://appifya.app/tools/icon-generator',
  },
  openGraph: {
    type: 'website',
    url: 'https://appifya.app/tools/icon-generator',
    title: 'Free PWA App Icon Generator | Appifya',
    description:
      'Upload one image and get every PWA icon size you need — 192x192, 512x512, maskable, Apple touch icon, favicon — packaged in a single ZIP.',
    siteName: 'Appifya',
    images: [
      {
        url: '/logo.jpg.jpeg',
        width: 1200,
        height: 630,
        alt: 'PWA App Icon Generator by Appifya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PWA App Icon Generator | Appifya',
    description:
      'Generate all required PWA icon sizes from one image. Download as ZIP instantly. Free, no sign-up.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function IconGeneratorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PWA App Icon Generator',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript and Canvas API',
    url: 'https://appifya.app/tools/icon-generator',
    description:
      'Free online tool to generate all required PWA app icon sizes from a single uploaded image. Outputs 192x192, 512x512, maskable, Apple touch icon, and favicon in a ZIP file.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Upload any PNG, JPG, SVG or WebP image',
      'Generates 7 icon sizes: 72, 96, 128, 144, 152, 192, 512px',
      'Maskable icon with safe-zone padding',
      'Apple touch icon (180x180)',
      'Favicon ICO (32x32)',
      'Live per-icon preview before download',
      'One-click ZIP download',
      'Runs 100% in the browser — nothing uploaded to a server',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What icon sizes does a PWA need?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A PWA requires at minimum a 192x192 PNG for the home screen and a 512x512 PNG for the splash screen. It is also recommended to include a maskable icon (512x512 with safe-zone padding) for Android adaptive icons, an Apple touch icon (180x180) for iOS, and a 32x32 favicon for browser tabs.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a maskable icon?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A maskable icon is a PWA icon that uses the full image canvas, including the corners. Android uses it to create adaptive icons that fit different shapes (circle, squircle, rounded square). The safe zone is the inner 80% of the image, so important content should stay within that area.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my image uploaded to a server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. All processing happens in your browser using the Canvas API. Your image never leaves your device.',
        },
      },
      {
        '@type': 'Question',
        name: 'What image format should I upload?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PNG works best because it supports transparency. JPG, WebP, and SVG are also accepted. For the sharpest results, upload a square image at 512x512 pixels or larger.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I use the generated icons in my PWA manifest?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Place the icons in your public directory (e.g. /icons/) and reference them in your manifest.json under the "icons" array with the correct "src", "sizes", and "type" fields. Use our free Manifest Generator to build the full manifest.json file.',
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
      <IconGeneratorClient />
    </>
  );
}
