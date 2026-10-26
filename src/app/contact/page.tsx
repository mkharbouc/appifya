import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us & Technical Support',
  description:
    'Get in touch with the Appifya team for technical assistance, PWA conversion support, AdMob setup inquiries, or developer partnership questions.',
  keywords: [
    'Appifya contact',
    'PWA builder support',
    'technical support',
    'contact Appifya team',
    'AdMob help',
    'PWA customer support',
  ],
  alternates: {
    canonical: 'https://appifya.app/contact',
  },
  openGraph: {
    type: 'website',
    url: 'https://appifya.app/contact',
    title: 'Contact Support | Appifya',
    description:
      '24/7 technical support and dedicated customer assistance for Appifya PWA Builder.',
    siteName: 'Appifya',
    images: [{ url: '/logo.jpg.jpeg', width: 1200, height: 630, alt: 'Appifya Contact Support' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Appifya',
    description: 'We are here to assist you with your PWA conversion, mobile ads, and store apps.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function ContactPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Appifya Support & Contact',
    url: 'https://appifya.app/contact',
    description: 'Get in touch with the Appifya team for technical assistance, support, and sales inquiries.',
    mainEntity: {
      '@type': 'Organization',
      name: 'Appifya',
      email: 'support@appifya.app',
      url: 'https://appifya.app',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'technical support',
        email: 'support@appifya.app',
        availableLanguage: ['Arabic', 'English', 'French'],
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactClient />
    </>
  );
}
