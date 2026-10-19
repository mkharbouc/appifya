import "./globals.css";
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
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
  },
  openGraph: {
    type: "website",
    locale: "en_US",
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
  const structuredData = {
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
    },
  };

  return (
    <html lang="ar" dir="rtl" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              const saved = localStorage.getItem('app_theme');
              const theme = saved === 'light' || saved === 'dark'
                ? saved
                : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              document.documentElement.dataset.theme = theme;
            })();`,
          }}
        />
      </head>
      <body className="site-body antialiased bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
