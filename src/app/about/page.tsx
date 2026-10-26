import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us - Mission & Mobile Platform',
  description:
    'Learn how Appifya empowers online stores and creators to convert websites into fast, installable mobile PWAs without expensive native development.',
  keywords: [
    'about Appifya',
    'PWA platform mission',
    'convert store to app story',
    'Appifya team',
    'e-commerce app builder',
  ],
  alternates: {
    canonical: 'https://www.appifya.app/about',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.appifya.app/about',
    title: 'About Us - Mission & Mobile Platform | Appifya',
    description:
      'Discover Appifya mission to provide fast, lightweight, and high-converting progressive web apps for online store owners.',
    siteName: 'Appifya',
    images: [{ url: '/logo.jpg.jpeg', width: 1200, height: 630, alt: 'About Appifya' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - Mission & Mobile Platform | Appifya',
    description: 'Empowering every online store with a high-performance mobile app.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Appifya',
    url: 'https://www.appifya.app/about',
    description: 'Appifya empowers online stores and merchants to launch high-performance mobile apps without expensive development cycles.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </>
  );
}
