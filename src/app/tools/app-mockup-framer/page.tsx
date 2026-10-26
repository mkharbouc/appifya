import type { Metadata } from 'next';
import AppMockupFramerClient from './AppMockupFramerClient';

export const metadata: Metadata = {
  title: 'App Store Screenshot Mockup Framer',
  description:
    'Create high-converting App Store and Google Play screenshots with device frames, gradient backgrounds, custom headlines, and one-click ZIP export.',
  keywords: [
    'app store screenshot generator',
    'google play screenshot framer',
    'app mockup framer online',
    'free app screenshot designer',
    'app store mockup generator',
    'google play 1080x1920 screenshot',
    'pixel device mockup screenshot',
    'pwa app screenshot tool',
    'Appifya tools',
  ],
  alternates: {
    canonical: 'https://appifya.app/tools/app-mockup-framer',
  },
  openGraph: {
    type: 'website',
    url: 'https://appifya.app/tools/app-mockup-framer',
    title: 'App Store Screenshots & Mockup Framer | Appifya',
    description:
      'Turn raw app screenshots into high-converting Google Play & App Store promotional graphics. Free ZIP export.',
    siteName: 'Appifya',
    images: [
      {
        url: '/logo.jpg.jpeg',
        width: 1200,
        height: 630,
        alt: 'App Store Screenshot Mockup Framer by Appifya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'App Store & Play Store Screenshot Mockup Framer | Appifya',
    description:
      'Generate pixel-perfect app store promotional screenshots with device frames and gradient backgrounds.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function AppMockupFramerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'App Store Screenshots & Mockup Framer',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    url: 'https://appifya.app/tools/app-mockup-framer',
    description:
      'Free browser-based tool to frame app screenshots inside modern mobile devices with custom typography, gradients, and batch ZIP export for Google Play and App Store.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Accurate Google Play (1080x2400, 1080x1920) and App Store resolutions',
      'Modern device frames (Pixel 9 Pro style, Modern Minimalist, iPhone frame)',
      'Multi-slide management with instant duplication and reordering',
      'Custom linear and mesh gradient backgrounds with glow effects',
      'Marketing headline and subtitle typography controls',
      'One-click high-resolution PNG and batch ZIP bundle download',
      'No Figma or Photoshop required, 100% free and client-side processing',
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
          text: 'Google Play requires screenshots with a 16:9 or 9:16 aspect ratio, with a minimum dimension of 320px and a maximum of 3840px. The standard industry standard for phones is 1080 x 2400 px or 1080 x 1920 px. For tablets, 7-inch (1200 x 1920 px) and 10-inch (1920 x 1200 px) are standard.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why should I frame my screenshots with device mockups instead of uploading raw images?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Framed screenshots with clear headlines and vibrant background gradients dramatically increase app store conversion rates (often by 25% to 40%). They immediately tell potential users what your app does and look professional and polished.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a limit on how many screenshots I can export in the ZIP bundle?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No limit! You can create as many slides as you need (Google Play allows up to 8 screenshots per device type) and download them all in a single organized ZIP archive.',
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
