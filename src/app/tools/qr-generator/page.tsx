import type { Metadata } from 'next';
import QrGeneratorClient from './QrGeneratorClient';

export const metadata: Metadata = {
  title: 'Free App QR Code Generator with Custom Logo & Brand Colors - Appifya',
  description:
    'Generate high-resolution QR codes for your PWA, mobile app, store, or website. Upload your app icon logo, customize brand colors, add scan-to-install frames, and download print-ready PNG & vector SVG. 100% free with no sign-up.',
  keywords: [
    'app QR code generator',
    'PWA QR code',
    'QR code with logo',
    'custom QR code generator',
    'free QR code generator',
    'vector QR code SVG',
    'high resolution QR code print',
    'scan to install app QR code',
    'QR code generator online',
    'مولد رمز الاستجابة السريعة',
    'رمز QR للتطبيقات',
    'générateur de QR code pour application',
    'Appifya tools',
  ],
  alternates: {
    canonical: 'https://appifya.app/tools/qr-generator',
    languages: {
      ar: 'https://appifya.app/tools/qr-generator',
      en: 'https://appifya.app/tools/qr-generator',
      fr: 'https://appifya.app/tools/qr-generator',
      'x-default': 'https://appifya.app/tools/qr-generator',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://appifya.app/tools/qr-generator',
    title: 'Free App QR Code Generator with Custom Logo & Colors - Appifya',
    description:
      'Create custom, high-resolution QR codes for your PWA or mobile app. Embed your center logo, customize brand colors, add frames, and download vector SVG and print-ready PNG.',
    siteName: 'Appifya',
    images: [
      {
        url: '/logo.jpg.jpeg',
        width: 1200,
        height: 630,
        alt: 'App QR Code Generator by Appifya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free App QR Code Generator with Custom Logo & Colors - Appifya',
    description:
      'Generate customized QR codes for your app with center logo and brand colors. Download print-ready PNG & vector SVG. 100% free.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function QrGeneratorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'App & PWA QR Code Generator',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript and Canvas API',
    url: 'https://appifya.app/tools/qr-generator',
    description:
      'Free online tool to generate professional QR codes for mobile apps and PWAs. Embed center logos, customize brand colors, add call-to-action frames, and export high-resolution PNG & SVG.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Generate instant QR codes for PWA install links, websites, app stores, and Wi-Fi',
      'Embed custom app logo or icon in the center with smart masking',
      'Customizable brand foreground and background colors with transparency support',
      'Adjustable error correction level up to 30% (Level H)',
      'Download print-ready high-resolution PNG (up to 2048px) and vector SVG',
      'One-click copy image to clipboard',
      'Printable tabletop standee and poster layout',
      '100% client-side generation — no data sent to external servers',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do users install a PWA using a QR code?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'When users scan the QR code with their smartphone camera, it opens the PWA URL directly in their mobile browser (Safari on iOS or Chrome on Android). The browser automatically detects the web app manifest and prompts the user to add the app to their home screen with a single tap.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I add my app logo in the center of the QR code?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! You can upload your app icon or brand logo in PNG, JPG, or SVG format. The generator automatically applies a high error correction level (Level H - 30%) and frames the logo with a clean background badge so that the QR code remains 100% readable and scannable by all devices.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best format for printing QR codes on posters and flyers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For physical marketing materials, vector SVG is recommended because it scales infinitely without pixelation. If you need a bitmap image, choose the 2048x2048 PNG export option, which provides 300+ DPI print quality for standees, table tents, and packaging.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this QR code expire or have scan limits?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The generated QR code is a static QR code that encodes your destination URL directly. It never expires, has unlimited scans, and requires no monthly subscription or sign-up.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I track scans from this QR code?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Simply add UTM parameters to your destination URL (for example: https://your-store.com/?utm_source=qrcode&utm_medium=print&utm_campaign=store_counter). You will be able to track every scan and install in Google Analytics or your Appifya dashboard.',
        },
      },
    ],
  };

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create a Custom QR Code for Your App',
    description: 'A 3-step guide to generating a professional, scannable QR code with custom brand colors and logo.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Enter your destination URL',
        text: 'Type or paste the URL of your PWA, online store, or app download landing page.',
        url: 'https://appifya.app/tools/qr-generator#input',
      },
      {
        '@type': 'HowToStep',
        name: 'Customize colors and upload app logo',
        text: 'Select your brand foreground color, background color, and upload an icon to place in the center of the QR code.',
        url: 'https://appifya.app/tools/qr-generator#styling',
      },
      {
        '@type': 'HowToStep',
        name: 'Download vector SVG or high-resolution PNG',
        text: 'Export your print-ready QR code in PNG or vector SVG format, or print a counter standee directly.',
        url: 'https://appifya.app/tools/qr-generator#download',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <QrGeneratorClient />
    </>
  );
}
