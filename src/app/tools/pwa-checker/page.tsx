import type { Metadata } from 'next';
import PwaCheckerClient from './PwaCheckerClient';

export const metadata: Metadata = {
  title: 'Free PWA Readiness Checker',
  description:
    'Check if your website is ready to become an installable PWA. Tests HTTPS, manifest.json, service worker, viewport, and theme colors instantly.',
  keywords: [
    'PWA readiness checker',
    'PWA checker',
    'is my site PWA ready',
    'PWA test online',
    'Progressive Web App checker',
    'web app manifest checker',
    'service worker checker',
    'HTTPS checker',
    'PWA audit tool',
    'free PWA validator',
    'check PWA requirements',
    'Appifya tools',
  ],
  alternates: {
    canonical: 'https://www.appifya.app/tools/pwa-checker',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.appifya.app/tools/pwa-checker',
    title: 'Free PWA Readiness Checker | Appifya',
    description:
      'Paste your URL and instantly see how PWA-ready your site is: HTTPS, manifest, service worker, viewport, theme color, and more.',
    siteName: 'Appifya',
    images: [{ url: '/logo.jpg.jpeg', width: 1200, height: 630, alt: 'PWA Readiness Checker by Appifya' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PWA Readiness Checker | Appifya',
    description: 'Paste your URL and see exactly what is blocking your site from becoming a PWA. Free, instant results.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function PwaCheckerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PWA Readiness Checker',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    url: 'https://www.appifya.app/tools/pwa-checker',
    description:
      'Free online tool that checks whether a website meets the core requirements to become a Progressive Web App: HTTPS, web app manifest, service worker, viewport meta tag, theme color, and icon configuration.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'HTTPS / secure connection check',
      'Web App Manifest (manifest.json) detection',
      'Service Worker registration check',
      'Viewport meta tag validation',
      'Theme color meta tag check',
      'Apple touch icon detection',
      'Favicon detection',
      'Installability score with pass/fail breakdown',
      'Actionable fix suggestions for each failure',
      'Direct link to Appifya builder for failed sites',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does the PWA Readiness Checker test?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It checks the core requirements for a Progressive Web App: HTTPS, a linked web app manifest (manifest.json), a registered service worker, a viewport meta tag, a theme-color meta tag, an Apple touch icon, and a favicon. Each check returns a pass, fail, or warning with a fix suggestion.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why does my site fail the service worker check?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The service worker check detects whether a site registers a service worker by examining the page source for a serviceWorker.register call. If your site uses a framework that registers the service worker at runtime (e.g. after JavaScript executes), it may not be detected. You can add a service worker manually or use Appifya to generate one automatically.',
        },
      },
      {
        '@type': 'Question',
        name: 'My site uses HTTPS but the check failed — why?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Some sites block external requests (CORS, firewalls, Cloudflare bot protection). If the checker cannot fetch your page, it will report the check as blocked rather than failed, and your actual HTTPS status is still valid.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a web app manifest and why does it matter?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A web app manifest is a JSON file (manifest.json) that tells the browser your app\'s name, icons, theme color, and display mode. Without it, browsers cannot offer an "Add to Home Screen" prompt and your site cannot be installed as a PWA.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I fix the issues the checker finds?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Each failed check includes a specific fix suggestion. For missing manifests, use the free Manifest Generator tool. For missing icons, use the Icon Generator. For a complete PWA setup including service worker and APK export, use the Appifya builder.',
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <PwaCheckerClient />
    </>
  );
}
