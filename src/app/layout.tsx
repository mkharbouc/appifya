import "./globals.css";
import React from "react";
import type { Metadata } from "next";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

export const metadata: Metadata = {
  metadataBase: new URL("https://appifya.app"),
  title: {
    default: "Appifya - Convert Your Store or Landing Page into a Fast Mobile PWA",
    template: "%s | Appifya",
  },
  description:
    "Appifya helps store owners and creators turn a website or online store into an installable PWA and Android APK with a simple, transparent workflow.",
  keywords: [
    "PWA Builder",
    "Convert store to app",
    "Next.js PWA",
    "Shopify to app",
    "YouCan to app",
    "Landing page to PWA",
    "Optional AdMob integration",
    "website to Android app",
    "store to mobile app",
    "PWA builder online",
    "convert website to APK",
    "Appifya",
  ],
  authors: [{ name: "Appifya Team" }],
  creator: "Appifya",
  alternates: {
    canonical: "https://appifya.app",
    languages: {
      ar: "https://appifya.app",
      en: "https://appifya.app",
      fr: "https://appifya.app",
      "x-default": "https://appifya.app",
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: "https://appifya.app",
    siteName: "Appifya",
    title: "Appifya - Turn Any Website or Store into a Mobile App",
    description:
      "Transform your e-commerce store or landing page into a high-converting, installable mobile app with native ads integration.",
    images: [
      {
        url: "/logo.jpg.jpeg",
        width: 1200,
        height: 630,
        alt: "Appifya PWA Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Appifya - Convert Websites to Fast Mobile PWAs",
    description:
      "Instant installable mobile apps for stores and landing pages with built-in ad networks and monetization.",
    images: ["/logo.jpg.jpeg"],
    creator: "@appifya",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/logo.jpg.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Appifya',
      url: 'https://appifya.app',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://appifya.app/?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Appifya',
      url: 'https://appifya.app',
      logo: 'https://appifya.app/logo.jpg.jpeg',
      sameAs: [
        'https://twitter.com/appifya',
        'https://github.com/appifya',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-000-000-0000',
        contactType: 'customer service',
        availableLanguage: ['Arabic', 'English', 'French'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Appifya',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web, Android',
      url: 'https://appifya.app',
      description: metadata.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      featureList: [
        'Convert any HTTPS website to PWA',
        'Generate installable Android APK',
        'Custom app name, icon, theme color',
        'Optional AdMob integration for monetization',
        'Push notification simulator',
        'Multi-language support (AR/EN/FR)',
        'RTL support for Arabic',
        'Free tier available',
      ],
    },
  ];

  return (
    <html lang="ar" dir="rtl" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="preload" as="image" href="/logo.jpg.jpeg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const saved = localStorage.getItem('app_theme');
                const theme = saved === 'light' || saved === 'dark'
                  ? saved
                  : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.dataset.theme = theme;
                const sb = localStorage.getItem('sidebar_expanded');
                if (sb === 'false') {
                  document.documentElement.style.setProperty('--sidebar-w', '64px');
                }
              } catch {}
            })();`,
          }}
        />
      </head>
      <body className="site-body antialiased bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        {structuredData.map((data, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
