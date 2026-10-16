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
    "Build blazing-fast Progressive Web Apps with ad monetization, custom platform styling, and instant Appwrite cloud sync. Convert Shopify, YouCan, WooCommerce, or any landing page in seconds.",
  keywords: [
    "PWA Builder",
    "Convert store to app",
    "Next.js PWA",
    "Shopify to app",
    "YouCan to app",
    "Landing page to PWA",
    "AdSense monetization",
    "Appifya",
  ],
  authors: [{ name: "Appifya Team" }],
  creator: "Appifya",
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
        url: "/logo.jpg",
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
    images: ["/logo.jpg"],
    creator: "@appifya",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
