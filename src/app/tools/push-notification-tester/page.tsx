import { Suspense } from 'react';
import type { Metadata } from 'next';
import PushTesterClient from './PushTesterClient';

export const metadata: Metadata = {
  title: 'Push Notification Payload Tester',
  description:
    'Visual Push Notification payload generator for Android and Web Push. Test FCM HTTP v1, Service Worker, and OneSignal with live browser preview.',
  keywords: [
    'push notification tester',
    'fcm payload builder',
    'firebase cloud messaging http v1 generator',
    'web push payload tester',
    'android notification preview simulator',
    'onesignal payload generator',
    'pwa push notification preview',
    'curl fcm notification tester',
    'Appifya developer tools',
  ],
  alternates: {
    canonical: 'https://www.appifya.app/tools/push-notification-tester',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.appifya.app/tools/push-notification-tester',
    title: 'Push Notification Payload Tester | Appifya',
    description:
      'Visual Push Notification simulator and payload builder for FCM HTTP v1, Web Push, and Android lock screen testing.',
    siteName: 'Appifya',
    images: [
      {
        url: '/logo.jpg.jpeg',
        width: 1200,
        height: 630,
        alt: 'Push Notification Payload Tester by Appifya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Push Notification Payload Tester | Appifya',
    description:
      'Visual Push Notification simulator and payload builder for FCM HTTP v1, Web Push, and Android lock screen testing.',
    images: ['/logo.jpg.jpeg'],
  },
};

export default function PushNotificationTesterPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Push Notification Payload Builder & Tester',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All, Android, iOS, Web',
    browserRequirements: 'Requires JavaScript',
    url: 'https://www.appifya.app/tools/push-notification-tester',
    description:
      'Free visual simulator and payload generator for Android & Web Push notifications with support for FCM HTTP v1, Web Push API, OneSignal, cURL, and live browser testing.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Interactive Android 14/15 lock screen and notification shade live visual preview',
      'FCM HTTP v1 modern payload generator with Android and WebPush channel options',
      'W3C Web Push & Service Worker showNotification payload generator',
      'OneSignal REST API v9 payload formatting',
      'Terminal-ready cURL command generator with OAuth2 Bearer token support',
      'Node.js & Python Firebase Admin SDK code generation',
      'Live native in-browser notification dispatch and audio test',
      'Pre-configured templates for E-Commerce, Order Tracking, Chat, and Breaking News',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the modern FCM HTTP v1 API?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'FCM HTTP v1 is the current official standard from Google for sending push notifications via Firebase Cloud Messaging. It uses Google Cloud OAuth 2.0 access tokens and allows fine-grained customizations for Android, WebPush, and Apple APNs.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why do images not display in Android push notifications?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Android requires the image URL to be a direct HTTPS link (JPEG, PNG, or WebP) under 1MB. Additionally, for FCM, the image must be declared under both notification.image and android.notification.image.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I test notifications on my actual browser using this tool?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Click the "Test on this Browser" button to trigger a real native Web Push notification with audio feedback right on your desktop or mobile browser.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why is NotificationChannel required on Android 13+?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Android enforces Notification Channels to let users customize notification importance. If your payload lacks a valid channel_id matching your app code, modern Android will drop the alert.',
        },
      },
    ],
  };

  return (
    <main className="theme-page flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center text-slate-400">Loading push tester...</div>}>
        <PushTesterClient />
      </Suspense>
    </main>
  );
}
