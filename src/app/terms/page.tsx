import type { Metadata } from 'next';
import TermsClient from './TermsClient';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Review the terms of service governing the usage of Appifya PWA builder, Android APK packaging tools, and mobile monetization features.',
  keywords: ['Appifya terms of service', 'usage terms', 'PWA builder agreement', 'legal terms'],
  alternates: {
    canonical: 'https://appifya.app/terms',
  },
  openGraph: {
    type: 'website',
    url: 'https://appifya.app/terms',
    title: 'Terms of Service | Appifya',
    description: 'Terms and conditions for creating and managing mobile applications on Appifya.',
    siteName: 'Appifya',
    images: [{ url: '/logo.jpg.jpeg', width: 1200, height: 630, alt: 'Appifya Terms of Service' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | Appifya',
    description: 'Terms and conditions for creating and managing mobile applications on Appifya.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function TermsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service',
    url: 'https://appifya.app/terms',
    description: 'Terms of service governing the usage of Appifya PWA builder and packaging tools.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TermsClient />
    </>
  );
}
