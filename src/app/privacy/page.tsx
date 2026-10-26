import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Read the Appifya privacy policy to understand how we collect, handle, and protect user data across our mobile PWA and Android conversion platform.',
  keywords: ['Appifya privacy policy', 'data protection', 'PWA privacy', 'user data security'],
  alternates: {
    canonical: 'https://appifya.app/privacy',
  },
  openGraph: {
    type: 'website',
    url: 'https://appifya.app/privacy',
    title: 'Privacy Policy | Appifya',
    description: 'Our commitment to data privacy, transparency, and personal security.',
    siteName: 'Appifya',
    images: [{ url: '/logo.jpg.jpeg', width: 1200, height: 630, alt: 'Appifya Privacy Policy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Appifya',
    description: 'Our commitment to data privacy, transparency, and personal security.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function PrivacyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy',
    url: 'https://appifya.app/privacy',
    description: 'Appifya data privacy, transparency, and personal security policies.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PrivacyClient />
    </>
  );
}
