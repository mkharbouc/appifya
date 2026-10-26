export interface PushNotificationForm {
  title: string;
  body: string;
  iconUrl: string;
  imageUrl: string;
  targetUrl: string;
  channelId: string;
  priority: 'high' | 'normal';
  badgeUrl: string;
  sound: string;
  tag: string;
  requireInteraction: boolean;
  actions: { action: string; title: string; url?: string }[];
  customData: { key: string; value: string }[];
}

export type SupportedLang = 'ar' | 'en' | 'fr';

export function getDefaultPushForm(lang: SupportedLang = 'en'): PushNotificationForm {
  const content = {
    ar: {
      title: '🔥 عرض خاص: خصم 40% لفترة محدودة!',
      body: 'اكتشف التشكيلة الجديدة واستمتع بتوصيل مجاني لطلبك الأول اليوم.',
      action1: 'تسوق الآن 🛍️',
      action2: 'لاحقاً',
    },
    fr: {
      title: '🔥 Offre Spéciale : 40% de réduction limitée !',
      body: 'Découvrez la nouvelle collection et profitez de la livraison gratuite dès aujourd’hui.',
      action1: 'Acheter 🛍️',
      action2: 'Plus tard',
    },
    en: {
      title: '🔥 Limited Offer: 40% Off Your First Order!',
      body: 'Explore our latest arrivals and get complimentary fast shipping today.',
      action1: 'Shop Now 🛍️',
      action2: 'Later',
    },
  }[lang] || {
    title: '🔥 Limited Offer: 40% Off Your First Order!',
    body: 'Explore our latest arrivals and get complimentary fast shipping today.',
    action1: 'Shop Now 🛍️',
    action2: 'Later',
  };

  return {
    title: content.title,
    body: content.body,
    iconUrl: '/icon.svg',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
    targetUrl: 'https://appifya.app/shop/sale',
    channelId: 'promotions_channel',
    priority: 'high',
    badgeUrl: '/icon.svg',
    sound: 'default',
    tag: 'promo-sale-2026',
    requireInteraction: false,
    actions: [
      { action: 'shop_now', title: content.action1, url: 'https://appifya.app/shop' },
      { action: 'dismiss', title: content.action2 },
    ],
    customData: [
      { key: 'campaign_id', value: 'summer_promo_40' },
      { key: 'origin', value: 'appifya_push_engine' },
    ],
  };
}

export const PRESET_DEFINITIONS: Record<
  string,
  {
    label: { ar: string; en: string; fr: string };
    content: Record<SupportedLang, { title: string; body: string; action1: string; action2?: string }>;
    iconUrl: string;
    imageUrl: string;
    targetUrl: string;
    channelId: string;
    priority: 'high' | 'normal';
    tag: string;
    requireInteraction: boolean;
    customData: { key: string; value: string }[];
  }
> = {
  ecommerce: {
    label: {
      ar: 'عروض وتخفيضات (E-Commerce Sale)',
      en: 'Flash Sale (E-Commerce)',
      fr: 'Vente Flash (E-Commerce)',
    },
    content: {
      ar: {
        title: '🔥 تخفيضات نهاية الأسبوع: خصم 50%!',
        body: 'سارع بالحصول على مشترياتك المفضلة مع شحن مجاني لكافة الطلبات فوق 50$.',
        action1: 'اكتشف العروض 🛒',
        action2: 'تذكيري لاحقاً',
      },
      en: {
        title: '🔥 Weekend Flash Sale: Up to 50% Off!',
        body: 'Grab your favorite items now with free express shipping on orders over $50.',
        action1: 'Shop Deals 🛒',
        action2: 'Remind Later',
      },
      fr: {
        title: '🔥 Vente Flash du Week-end : Jusqu’à -50% !',
        body: 'Profitez de réductions immédiates et de la livraison offerte dès 50$ d’achat.',
        action1: 'Voir les offres 🛒',
        action2: 'Plus tard',
      },
    },
    iconUrl: '/icon.svg',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
    targetUrl: 'https://appifya.app/sale',
    channelId: 'marketing_alerts',
    priority: 'high',
    tag: 'flash-sale-weekend',
    requireInteraction: false,
    customData: [
      { key: 'promo_code', value: 'WEEKEND50' },
      { key: 'category', value: 'fashion' },
    ],
  },

  order_status: {
    label: {
      ar: 'تحديث الشحن والطلب (Order Tracking)',
      en: 'Order Shipping Update',
      fr: 'Suivi de Commande',
    },
    content: {
      ar: {
        title: '📦 طلبك رقم #89201 في طريقه إليك!',
        body: 'قام مندوب التوصيل باستلام الشحنة، متوقع الوصول خلال ساعتين إلى عنوانك.',
        action1: 'تتبع الشحنة على الخريطة 📍',
        action2: 'اتصال بالمندوب',
      },
      en: {
        title: '📦 Order #89201 is on its way to you!',
        body: 'The courier picked up your package. Estimated delivery arrival in 2 hours.',
        action1: 'Track Live Map 📍',
        action2: 'Call Courier',
      },
      fr: {
        title: '📦 Votre commande #89201 est en route !',
        body: 'Le livreur a récupéré votre colis. Arrivée estimée dans 2 heures à votre adresse.',
        action1: 'Suivre sur la carte 📍',
        action2: 'Appeler le livreur',
      },
    },
    iconUrl: '/icon.svg',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    targetUrl: 'https://appifya.app/orders/89201/track',
    channelId: 'orders_tracking',
    priority: 'high',
    tag: 'order-update-89201',
    requireInteraction: true,
    customData: [
      { key: 'order_id', value: '89201' },
      { key: 'carrier', value: 'fast_courier' },
    ],
  },

  chat_message: {
    label: {
      ar: 'رسالة وتنبيه محادثة (Chat / Direct Message)',
      en: 'Direct Message / Chat',
      fr: 'Message Direct / Chat',
    },
    content: {
      ar: {
        title: 'سارة أحمد 💬',
        body: 'مرحباً، هل استلمت ملف التصاميم الجديد؟ بانتظار ملاحظاتك.',
        action1: 'رد سريع ✍️',
        action2: 'تحديد كمقروء',
      },
      en: {
        title: 'Sarah Miller 💬',
        body: 'Hey! Did you review the new project designs? Let me know your thoughts.',
        action1: 'Quick Reply ✍️',
        action2: 'Mark as Read',
      },
      fr: {
        title: 'Sarah Martin 💬',
        body: 'Salut ! As-tu pu regarder les nouvelles maquettes ? Dis-moi ce que tu en penses.',
        action1: 'Répondre ✍️',
        action2: 'Marquer comme lu',
      },
    },
    iconUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    imageUrl: '',
    targetUrl: 'https://appifya.app/messages/sara',
    channelId: 'chat_messages',
    priority: 'high',
    tag: 'chat-thread-sara',
    requireInteraction: false,
    customData: [
      { key: 'sender_id', value: 'user_992' },
      { key: 'thread_id', value: 'thread_102' },
    ],
  },

  news_alert: {
    label: {
      ar: 'خبر عاجل وتنبيه فوري (Breaking News Alert)',
      en: 'Breaking News Alert',
      fr: 'Alerte Info Urgente',
    },
    content: {
      ar: {
        title: '🔴 عاجل: إعلان نتائج مؤتمر التكنولوجيا 2026',
        body: 'الكشف عن أحدث ابتكارات الذكاء الاصطناعي وتطبيقات الويب التقدمية PWA.',
        action1: 'قراءة الخبر كاملاً 📖',
      },
      en: {
        title: '🔴 Breaking: Tech Summit 2026 Keynote Announcements',
        body: 'Discover major AI breakthroughs and the next generation of Progressive Web Apps.',
        action1: 'Read Full Story 📖',
      },
      fr: {
        title: '🔴 Urgent : Grandes annonces du Sommet Tech 2026',
        body: 'Découvrez les innovations majeures en IA et applications Web Progressives.',
        action1: 'Lire l’article complet 📖',
      },
    },
    iconUrl: '/icon.svg',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    targetUrl: 'https://appifya.app/news/tech-2026',
    channelId: 'breaking_news',
    priority: 'high',
    tag: 'news-breaking-2026',
    requireInteraction: false,
    customData: [
      { key: 'article_id', value: 'tech_conf_2026' },
      { key: 'priority_score', value: '9' },
    ],
  },
};

export function getPresetPushForm(key: string, lang: SupportedLang = 'en'): PushNotificationForm {
  const preset = PRESET_DEFINITIONS[key] || PRESET_DEFINITIONS.ecommerce;
  const langKey: SupportedLang = (lang === 'ar' || lang === 'fr') ? lang : 'en';
  const c = preset.content[langKey] || preset.content.en;

  const actions: { action: string; title: string; url?: string }[] = [
    { action: 'primary_action', title: c.action1, url: preset.targetUrl },
  ];
  if (c.action2) {
    actions.push({ action: 'secondary_action', title: c.action2 });
  }

  return {
    title: c.title,
    body: c.body,
    iconUrl: preset.iconUrl,
    imageUrl: preset.imageUrl,
    targetUrl: preset.targetUrl,
    channelId: preset.channelId,
    priority: preset.priority,
    badgeUrl: '/icon.svg',
    sound: 'default',
    tag: preset.tag,
    requireInteraction: preset.requireInteraction,
    actions,
    customData: [...preset.customData],
  };
}

// ---------------------------------------------------------------------------
// Payload Generators
// ---------------------------------------------------------------------------

export function generateFcmHttpV1Payload(form: PushNotificationForm, projectId = 'your-firebase-project-id'): string {
  const dataObj: Record<string, string> = {};
  if (form.targetUrl) dataObj.url = form.targetUrl;
  for (const item of form.customData) {
    if (item.key.trim()) dataObj[item.key.trim()] = item.value;
  }

  const payload = {
    message: {
      token: 'YOUR_DEVICE_FCM_REGISTRATION_TOKEN',
      notification: {
        title: form.title,
        body: form.body,
        ...(form.imageUrl ? { image: form.imageUrl } : {}),
      },
      data: Object.keys(dataObj).length > 0 ? dataObj : undefined,
      android: {
        priority: form.priority === 'high' ? 'HIGH' : 'NORMAL',
        notification: {
          channel_id: form.channelId || 'default',
          sound: form.sound || 'default',
          ...(form.imageUrl ? { image: form.imageUrl } : {}),
          ...(form.tag ? { tag: form.tag } : {}),
          default_vibrate_timings: true,
          default_light_settings: true,
          click_action: form.targetUrl || 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
      webpush: {
        headers: {
          Urgency: form.priority === 'high' ? 'high' : 'normal',
          TTL: '86400',
        },
        notification: {
          title: form.title,
          body: form.body,
          icon: form.iconUrl || '/icon.svg',
          ...(form.imageUrl ? { image: form.imageUrl } : {}),
          ...(form.badgeUrl ? { badge: form.badgeUrl } : {}),
          ...(form.tag ? { tag: form.tag } : {}),
          requireInteraction: form.requireInteraction,
          actions: form.actions
            .filter((a) => a.title.trim())
            .map((a) => ({
              action: a.action,
              title: a.title,
            })),
          data: {
            url: form.targetUrl || '/',
            ...dataObj,
          },
        },
        fcm_options: {
          link: form.targetUrl || 'https://appifya.app',
        },
      },
    },
  };

  return JSON.stringify(payload, null, 2);
}

export function generateWebPushPayload(form: PushNotificationForm): string {
  const dataObj: Record<string, string> = {
    url: form.targetUrl || '/',
  };
  for (const item of form.customData) {
    if (item.key.trim()) dataObj[item.key.trim()] = item.value;
  }

  const payload = {
    title: form.title,
    options: {
      body: form.body,
      icon: form.iconUrl || '/icon.svg',
      ...(form.imageUrl ? { image: form.imageUrl } : {}),
      ...(form.badgeUrl ? { badge: form.badgeUrl } : {}),
      ...(form.tag ? { tag: form.tag } : {}),
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: form.requireInteraction,
      renotify: Boolean(form.tag),
      data: dataObj,
      actions: form.actions
        .filter((a) => a.title.trim())
        .map((a) => ({
          action: a.action,
          title: a.title,
        })),
    },
  };

  return JSON.stringify(payload, null, 2);
}

export function generateOneSignalPayload(form: PushNotificationForm): string {
  const customDataObj: Record<string, string> = {};
  for (const item of form.customData) {
    if (item.key.trim()) customDataObj[item.key.trim()] = item.value;
  }

  const payload = {
    app_id: 'YOUR_ONESIGNAL_APP_ID',
    include_aliases: {
      external_id: ['USER_EXTERNAL_ID'],
    },
    headings: { en: form.title },
    contents: { en: form.body },
    url: form.targetUrl || 'https://appifya.app',
    ...(form.imageUrl
      ? {
          big_picture: form.imageUrl,
          chrome_web_image: form.imageUrl,
        }
      : {}),
    ...(form.iconUrl ? { chrome_web_icon: form.iconUrl } : {}),
    android_channel_id: form.channelId || undefined,
    priority: form.priority === 'high' ? 10 : 5,
    ...(form.actions.length > 0
      ? {
          web_buttons: form.actions
            .filter((a) => a.title.trim())
            .map((a, i) => ({
              id: a.action || `btn-${i}`,
              text: a.title,
              url: a.url || form.targetUrl || 'https://appifya.app',
            })),
        }
      : {}),
    data: Object.keys(customDataObj).length > 0 ? customDataObj : undefined,
  };

  return JSON.stringify(payload, null, 2);
}

export function generateCurlCommand(form: PushNotificationForm, projectId = 'your-firebase-project-id'): string {
  const jsonPayload = generateFcmHttpV1Payload(form, projectId);

  return `curl -X POST "https://fcm.googleapis.com/v1/projects/${projectId}/messages:send" \\
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \\
  -H "Content-Type: application/json; UTF-8" \\
  -d '${jsonPayload.replace(/'/g, "'\\''")}'`;
}

export function generateNodeJsSnippet(form: PushNotificationForm): string {
  const jsonPayload = generateFcmHttpV1Payload(form);
  const parsed = JSON.parse(jsonPayload);

  return `const admin = require('firebase-admin');

// 1. Initialize Firebase Admin SDK (Service Account)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault() // or admin.credential.cert(serviceAccount)
  });
}

// 2. Prepare FCM v1 Message
const message = ${JSON.stringify(parsed.message, null, 2)};

// 3. Dispatch Notification
async function sendPush() {
  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent push notification:', response);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

sendPush();`;
}

export function generatePythonSnippet(form: PushNotificationForm): string {
  return `import firebase_admin
from firebase_admin import credentials, messaging

# 1. Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)

# 2. Build Message
message = messaging.Message(
    token='YOUR_DEVICE_FCM_REGISTRATION_TOKEN',
    notification=messaging.Notification(
        title=${JSON.stringify(form.title)},
        body=${JSON.stringify(form.body)},
        ${form.imageUrl ? `image=${JSON.stringify(form.imageUrl)},` : ''}
    ),
    android=messaging.AndroidConfig(
        priority='high' if ${JSON.stringify(form.priority)} == 'high' else 'normal',
        notification=messaging.AndroidNotification(
            channel_id=${JSON.stringify(form.channelId || 'default')},
            sound=${JSON.stringify(form.sound || 'default')},
            ${form.imageUrl ? `image=${JSON.stringify(form.imageUrl)},` : ''}
        ),
    ),
    webpush=messaging.WebpushConfig(
        notification=messaging.WebpushNotification(
            title=${JSON.stringify(form.title)},
            body=${JSON.stringify(form.body)},
            icon=${JSON.stringify(form.iconUrl || '/icon.svg')},
            ${form.imageUrl ? `image=${JSON.stringify(form.imageUrl)},` : ''}
        ),
        fcm_options=messaging.WebpushFCMOptions(
            link=${JSON.stringify(form.targetUrl || 'https://appifya.app')},
        ),
    ),
    data={
        'url': ${JSON.stringify(form.targetUrl || '/')},
        ${form.customData.map((d) => `'${d.key}': '${d.value}',`).join('\n        ')}
    }
)

# 3. Send Notification
response = messaging.send(message)
print('Successfully sent push notification:', response)
`;
}
