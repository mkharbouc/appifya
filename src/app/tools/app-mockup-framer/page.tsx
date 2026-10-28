import type { Metadata } from 'next';
import AppMockupFramerClient from './AppMockupFramerClient';

export const metadata: Metadata = {
  title: 'App Store & Play Screenshot Studio',
  description:
    'Turn raw app screenshots into store graphics. Automatic 3D device mockups, panoramic templates, AI marketing copy, and 1-click dual store ZIP export.',
  keywords: [
    'app store screenshot studio',
    'google play screenshot generator',
    'panoramic app screenshots',
    'app mockup framer online',
    'free app screenshot designer',
    'ai aso copy generator',
    'google play 1080x2400 screenshot',
    'apple 1290x2796 screenshot generator',
    'pixel device mockup screenshot',
    'pwa app screenshot tool',
    'Appifya tools',
  ],
  alternates: {
    canonical: 'https://www.appifya.app/tools/app-mockup-framer',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.appifya.app/tools/app-mockup-framer',
    title: 'App Store & Play Screenshot Studio | Appifya',
    description:
      'Turn raw app screenshots into store graphics with 3D device frames, panoramic templates, AI copy, and 1-click dual store ZIP export.',
    siteName: 'Appifya',
    images: [
      {
        url: '/logo.jpg.jpeg',
        width: 1200,
        height: 630,
        alt: 'App Store & Play Screenshot Studio by Appifya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'App Store & Play Screenshot Studio | Appifya',
    description:
      'Generate pixel-perfect app store promotional screenshots with device frames, panoramic templates, and 1-click dual-store ZIP export.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function AppMockupFramerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'App Store & Play Store Screenshot Studio',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    url: 'https://www.appifya.app/tools/app-mockup-framer',
    description:
      'Automated in-browser studio to create store-compliant screenshots for Google Play and Apple App Store. Features batch raw screenshot upload, 3D device tilt, panoramic connected canvas, AI ASO copywriting, and 1-click dual store ZIP export.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Batch upload 1 to 8 raw screenshots with automatic device placement',
      'Accurate Google Play (1080x2400, 1080x1920) and App Store (1290x2796, 1242x2688) dimensions',
      'Modern device frames (iPhone 16 Pro, Google Pixel 9 Pro, and iPad/Tablets)',
      '3D Isometric tilt angles and realistic ambient drop shadows',
      'Panoramic connected canvas template for continuous store swipe storytelling',
      'AI ASO Copywriting Assistant for 8+ app categories in Arabic & English',
      '1-Click Dual Store ZIP export (Google Play + App Store + Tablet folders)',
      '100% Client-side and privacy-friendly, zero server storage required',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are the official screenshot dimensions for Google Play?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Google Play requires screenshots with a 16:9 or 9:20 aspect ratio, with a minimum dimension of 320px and a maximum of 3840px. The standard industry standard for phones is 1080 x 2400 px or 1080 x 1920 px. For tablets, 7-inch and 10-inch tablets typically use 1200 x 1920 px.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does the 1-Click Multi-Store Export do?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The 1-Click export automatically renders your slides into both the Google Play standard (1080x2400) and the Apple App Store standard (1290x2796) and organizes them into separate folders inside a single ZIP download, complete with submission instructions.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a Panoramic Connected Canvas screenshot?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Panoramic connected screenshots feature visual ribbons, flowing gradients, and overlapping elements that continue seamlessly across adjacent slides. When prospective users swipe in the App Store or Google Play, it creates an immersive continuous journey.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are my uploaded screenshots saved on your server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. All rendering and ZIP generation happen 100% locally in your browser using HTML5 Canvas and client-side memory. Your images never leave your computer.',
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
      <AppMockupFramerClient />
    </>
  );
}
