import type { Metadata } from 'next';
import AssetLinksGeneratorClient from './AssetLinksGeneratorClient';

export const metadata: Metadata = {
  title: 'Digital Asset Links Generator - Create assetlinks.json for Android & TWA',
  description:
    'Generate standard-compliant assetlinks.json for Android App Links, Trusted Web Activity (TWA), and Deep Linking. Live validation, SHA-256 formatter, and domain verifier. 100% free.',
  keywords: [
    'assetlinks generator',
    'assetlinks json generator',
    'digital asset links generator',
    'android app links assetlinks',
    'twa assetlinks generator',
    'trusted web activity assetlinks',
    'sha256 cert fingerprints generator',
    'well-known assetlinks.json',
    'android deep linking tool',
    'Appifya tools',
  ],
  alternates: {
    canonical: 'https://appifya.app/tools/assetlinks-generator',
    languages: {
      ar: 'https://appifya.app/tools/assetlinks-generator',
      en: 'https://appifya.app/tools/assetlinks-generator',
      fr: 'https://appifya.app/tools/assetlinks-generator',
      'x-default': 'https://appifya.app/tools/assetlinks-generator',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://appifya.app/tools/assetlinks-generator',
    title: 'Digital Asset Links Generator - Appifya',
    description:
      'Generate and validate assetlinks.json for Android App Links and TWA deep linking. Live SHA-256 format check and domain verifier.',
    siteName: 'Appifya',
    images: [
      {
        url: '/logo.jpg.jpeg',
        width: 1200,
        height: 630,
        alt: 'Digital Asset Links Generator by Appifya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Asset Links Generator - Create assetlinks.json Online',
    description:
      'Free generator for assetlinks.json required for Android App Links and Trusted Web Activity (TWA).',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function AssetLinksGeneratorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Digital Asset Links Generator',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    url: 'https://appifya.app/tools/assetlinks-generator',
    description:
      'Free online tool to generate and verify assetlinks.json files for Android App Links, Trusted Web Activities (TWA), and domain verification.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Automatic SHA-256 fingerprint formatting and hex validation',
      'Support for multiple certificates (Google Play App Signing, upload key, debug key)',
      'Multiple application statements and shared credentials relations',
      'One-click JSON copy and assetlinks.json file download',
      'Integrated live domain tester to verify https://domain/.well-known/assetlinks.json',
      'Step-by-step keytool and Google Play Console fingerprint extraction guide',
      'Hosting guides for Next.js, WordPress, Nginx, and Apache',
      '100% free with zero registration required',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a Digital Asset Links (assetlinks.json) file?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Digital Asset Links is a Google protocol that establishes verifiable relationships between websites and Android apps. The assetlinks.json file proves that your website authorizes your Android application to open its URLs directly without showing the browser prompt.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where must assetlinks.json be hosted on my website?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The file must be publicly hosted at exactly: https://yourdomain.com/.well-known/assetlinks.json. It must be served over HTTPS, return an HTTP 200 OK status code (no redirects), and have a Content-Type header of application/json.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why is assetlinks.json required for Trusted Web Activity (TWA)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In a Trusted Web Activity (TWA), Android verifies digital asset links between your APK and your web domain. If assetlinks.json is verified, Android hides the browser address bar, providing a seamless full-screen native app experience. If verification fails, Android displays the Chrome URL bar.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where can I find my SHA-256 certificate fingerprint?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'If your app is published on Google Play, go to Play Console > Setup > App Integrity > App signing key certificate, and copy the SHA-256 fingerprint. If you sign locally, run keytool -list -v -keystore your-keystore.jks in your terminal.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I include multiple SHA-256 fingerprints or multiple apps?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! It is standard practice to include both your Google Play App Signing key fingerprint and your local debug/release keystore fingerprints in the sha256_cert_fingerprints array, or include multiple statement objects for different apps.',
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
      <AssetLinksGeneratorClient />
    </>
  );
}
