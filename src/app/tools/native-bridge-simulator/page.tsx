import { Suspense } from 'react';
import type { Metadata } from 'next';
import NativeBridgeClient from './NativeBridgeClient';

export const metadata: Metadata = {
  title: 'Native-Bridge Simulator (JS-to-Android Hardware API Tester)',
  description:
    'Test Android & PWA hardware APIs: Haptics, Screen Wake Lock, Native Share, and Orientation with live device simulation & safe zero-crash code.',
  keywords: [
    'native bridge simulator',
    'js to android bridge tester',
    'navigator.vibrate test',
    'screen wake lock simulator',
    'web share api test',
    'screen orientation lock js',
    'android webview javascript interface tester',
    'pwa hardware apis',
    'zero-crash device bridge wrapper',
    'Appifya developer tools',
  ],
  alternates: {
    canonical: 'https://www.appifya.app/tools/native-bridge-simulator',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.appifya.app/tools/native-bridge-simulator',
    title: 'Native-Bridge Simulator | Appifya',
    description:
      'Interactive sandbox to test JavaScript hardware APIs for Android and PWA with real-time phone simulation and safe bridge code generators.',
    siteName: 'Appifya',
    images: [
      {
        url: '/logo.jpg.jpeg',
        width: 1200,
        height: 630,
        alt: 'Native-Bridge Simulator by Appifya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Native-Bridge Simulator | Appifya',
    description:
      'Interactive sandbox to test JavaScript hardware APIs for Android and PWA with real-time phone simulation and safe bridge code generators.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function NativeBridgeSimulatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Native-Bridge Simulator (JS-to-Android Bridge Tester)',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All, Android, iOS, Web',
    browserRequirements: 'Requires JavaScript',
    url: 'https://www.appifya.app/tools/native-bridge-simulator',
    description:
      'Interactive playground to test and simulate mobile hardware JavaScript APIs: Haptics Vibration, Screen Wake Lock, Native Share, Orientation Lock, Camera, Battery, and Badging with zero-crash safe wrappers.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Interactive Haptic Vibration tester with tactile audio tick synthesis fallback',
      'Screen Wake Lock API real-time toggle & display state observer',
      'Native Web Share API tester with simulated Android Material share sheet bottom modal',
      'Screen Orientation Lock tester with 3D device tilt & rotation physics',
      'Live Camera & BarcodeDetector scanner feed stream',
      'Battery Status API inspection with real level & charging state simulation',
      'Network Information & PWA offline cache state transitions',
      'App Icon Badging counter simulation for Android Home Screen launcher',
      'GPS Geolocation & 3D Gyroscope orientation tracking',
      'Zero-crash Safe Device Bridge code generator for TypeScript, Vanilla JS, React Hook, and Android Kotlin',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Why do JavaScript hardware APIs cause undefined errors in desktop browsers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hardware APIs like navigator.vibrate or screen.orientation.lock are often not implemented or restricted in desktop browsers and certain web engines. Without feature detection and safe fallback checks, calling them directly triggers runtime TypeErrors. The Appifya Device Bridge wrapper prevents these crashes automatically.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use navigator.vibrate on iOS Safari?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Apple restricts navigator.vibrate in Safari on iOS. For cross-platform PWAs, our safe bridge wrapper provides an instant audio chime tick fallback using the Web Audio API, so users still receive subtle tactile feedback without app errors.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Screen Wake Lock help mobile web apps?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Screen Wake Lock API prevents the mobile display from dimming or locking while users are following recipes, reading books, using GPS navigation, or watching instructional media in your PWA.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I bridge JavaScript to native Android WebView code?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can attach an Android JavascriptInterface class using webView.addJavascriptInterface(WebAppInterface(this), "AndroidBridge"). The code generator in this tool includes ready-to-use Kotlin and JavaScript wrappers for seamless two-way communication.',
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

      <main className="site-main flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
          }
        >
          <NativeBridgeClient />
        </Suspense>
      </main>
    </>
  );
}
