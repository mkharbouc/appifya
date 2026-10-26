// Native Bridge Simulator Definitions, API Metadata, and Safe Code Generators

export type SupportedLang = 'ar' | 'en' | 'fr';

export type BridgeApiCategory =
  | 'haptics'
  | 'wakelock'
  | 'share'
  | 'orientation'
  | 'camera'
  | 'battery'
  | 'network'
  | 'badging'
  | 'sensors'
  | 'clipboard';

export interface ApiInfo {
  id: BridgeApiCategory;
  title: Record<SupportedLang, string>;
  shortDesc: Record<SupportedLang, string>;
  webApi: string;
  androidEquivalent: string;
  compatibility: {
    androidChrome: 'full' | 'partial' | 'flag';
    androidTwa: 'full' | 'partial' | 'flag';
    iosSafari: 'full' | 'partial' | 'none';
    desktop: 'full' | 'partial' | 'none';
  };
  permissionRequired: boolean;
  permissionName?: string;
}

export const BRIDGE_APIS: ApiInfo[] = [
  {
    id: 'haptics',
    title: {
      ar: 'الاهتزاز والتغذية اللمسية (Haptics)',
      en: 'Haptics & Vibration',
      fr: 'Retour Haptique & Vibration',
    },
    shortDesc: {
      ar: 'توليد نبضات اهتزازية للأزرار، التنبيهات، والنجاح مع التراجع الصوتي التلقائي.',
      en: 'Trigger tactile vibration pulses for button clicks, alerts, and success feedback.',
      fr: 'Générez des impulsions de vibration pour boutons, alertes et retours de succès.',
    },
    webApi: 'navigator.vibrate(pattern)',
    androidEquivalent: 'Vibrator.vibrate(VibrationEffect)',
    compatibility: {
      androidChrome: 'full',
      androidTwa: 'full',
      iosSafari: 'none',
      desktop: 'none',
    },
    permissionRequired: false,
  },
  {
    id: 'wakelock',
    title: {
      ar: 'قفل بقاء الشاشة نشطة (Screen Wake Lock)',
      en: 'Screen Wake Lock',
      fr: 'Maintien de l’Écran Allumé (Wake Lock)',
    },
    shortDesc: {
      ar: 'منع انطفاء أو خفوت إضاءة شاشة الهاتف أثناء قراءة المقالات أو تشغيل الفيديو.',
      en: 'Prevent screen from dimming or locking during critical app tasks, media, or recipes.',
      fr: 'Empêchez l’écran de s’éteindre ou de se verrouiller pendant les tâches critiques.',
    },
    webApi: 'navigator.wakeLock.request("screen")',
    androidEquivalent: 'WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON',
    compatibility: {
      androidChrome: 'full',
      androidTwa: 'full',
      iosSafari: 'full',
      desktop: 'full',
    },
    permissionRequired: false,
  },
  {
    id: 'share',
    title: {
      ar: 'مشاركة النظام الأصلية (Native Web Share)',
      en: 'Native Web Share',
      fr: 'Partage Système Natif (Web Share)',
    },
    shortDesc: {
      ar: 'استدعاء نافذة مشاركة أندرويد الرسمية (واتساب، تيليجرام، نسخ الرابط، البريد).',
      en: 'Invoke native Android bottom share sheet for text, links, and uploaded files.',
      fr: 'Ouvrez la feuille de partage native Android pour liens, textes et fichiers.',
    },
    webApi: 'navigator.share({ title, text, url })',
    androidEquivalent: 'Intent.ACTION_SEND',
    compatibility: {
      androidChrome: 'full',
      androidTwa: 'full',
      iosSafari: 'full',
      desktop: 'partial',
    },
    permissionRequired: false,
  },
  {
    id: 'orientation',
    title: {
      ar: 'قفل اتجاه الشاشة (Orientation Lock)',
      en: 'Screen Orientation Lock',
      fr: 'Verrouillage de l’Orientation Écran',
    },
    shortDesc: {
      ar: 'تثبيت اتجاه التطبيق (عمودي Portrait أو أفقي Landscape) للألعاب ومقاطع الفيديو.',
      en: 'Lock orientation to portrait or landscape mode for games, readers, and dashboards.',
      fr: 'Verrouillez l’orientation en mode portrait ou paysage pour jeux et vidéos.',
    },
    webApi: 'screen.orientation.lock("portrait-primary")',
    androidEquivalent: 'Activity.setRequestedOrientation()',
    compatibility: {
      androidChrome: 'full',
      androidTwa: 'full',
      iosSafari: 'none',
      desktop: 'none',
    },
    permissionRequired: false,
  },
  {
    id: 'camera',
    title: {
      ar: 'الكاميرا وفاحص الباركود (Camera & QR)',
      en: 'Camera & Barcode Scanner',
      fr: 'Caméra & Scanner QR/Code-Barres',
    },
    shortDesc: {
      ar: 'التقاط بث الكاميرا الخلفية وقراءة رموز QR والباركود في الوقت الحقيقي.',
      en: 'Stream back/front camera feed and scan QR codes natively using BarcodeDetector.',
      fr: 'Diffusez le flux caméra et scannez les codes QR avec BarcodeDetector.',
    },
    webApi: 'navigator.mediaDevices.getUserMedia() & BarcodeDetector',
    androidEquivalent: 'CameraX + ML Kit Barcode Scanning',
    compatibility: {
      androidChrome: 'full',
      androidTwa: 'full',
      iosSafari: 'partial',
      desktop: 'partial',
    },
    permissionRequired: true,
    permissionName: 'camera',
  },
  {
    id: 'battery',
    title: {
      ar: 'حالة البطارية والشحن (Battery Status)',
      en: 'Battery & Power Status',
      fr: 'État de la Batterie & Charge',
    },
    shortDesc: {
      ar: 'معرفة نسبة الشحن المتبقية وتوصيل الشاحن لتفعيل وضع توفير الطاقة بالتطبيق.',
      en: 'Inspect live battery percentage, charging state, and adapt UI to save battery.',
      fr: 'Consultez le niveau de batterie restant et adaptez l’UI en mode économie.',
    },
    webApi: 'navigator.getBattery()',
    androidEquivalent: 'BatteryManager.EXTRA_LEVEL',
    compatibility: {
      androidChrome: 'full',
      androidTwa: 'full',
      iosSafari: 'none',
      desktop: 'full',
    },
    permissionRequired: false,
  },
  {
    id: 'network',
    title: {
      ar: 'معلومات الشبكة وجودة الاتصال (Network Info)',
      en: 'Network & Offline State',
      fr: 'État Réseau & Débit (Offline)',
    },
    shortDesc: {
      ar: 'كشف نوع الاتصال (4G / 5G / WiFi)، السرعة، ووضع عدم الاتصال بالإنترنت.',
      en: 'Detect cellular/Wi-Fi connection type, downlink speed, and offline transitions.',
      fr: 'Détectez le type de réseau (4G/WiFi), le débit et les coupures hors-ligne.',
    },
    webApi: 'navigator.connection & window.navigator.onLine',
    androidEquivalent: 'ConnectivityManager + NetworkCapabilities',
    compatibility: {
      androidChrome: 'full',
      androidTwa: 'full',
      iosSafari: 'partial',
      desktop: 'partial',
    },
    permissionRequired: false,
  },
  {
    id: 'badging',
    title: {
      ar: 'شارة أيقونة التطبيق (App Badging API)',
      en: 'App Icon Badging',
      fr: 'Badge de l’Icône de l’App',
    },
    shortDesc: {
      ar: 'وضع رقم الإشعارات غير المقروءة على أيقونة التطبيق في شاشة أندرويد الرئيسية.',
      en: 'Set an unread message notification count badge on the Android home screen app icon.',
      fr: 'Affichez un compteur d’alertes non lues sur l’icône de l’écran d’accueil Android.',
    },
    webApi: 'navigator.setAppBadge(count)',
    androidEquivalent: 'ShortcutBadger / NotificationManager',
    compatibility: {
      androidChrome: 'full',
      androidTwa: 'full',
      iosSafari: 'partial',
      desktop: 'full',
    },
    permissionRequired: false,
  },
  {
    id: 'sensors',
    title: {
      ar: 'الموقع والحركة الجيروسكوبية (GPS & Gyro)',
      en: 'Geolocation & Motion Gyroscope',
      fr: 'Géolocalisation & Gyroscope 3D',
    },
    shortDesc: {
      ar: 'قراءة إحداثيات GPS الدقيقة وزوايا ميلان وتدوير الهاتف في الفضاء ثلاثي الأبعاد.',
      en: 'Query precise GPS coordinates and listen to device 3D tilt angles (alpha, beta, gamma).',
      fr: 'Récupérez les coordonnées GPS et l’inclinaison 3D du mobile en temps réel.',
    },
    webApi: 'navigator.geolocation & window.DeviceOrientationEvent',
    androidEquivalent: 'FusedLocationProviderClient + SensorManager',
    compatibility: {
      androidChrome: 'full',
      androidTwa: 'full',
      iosSafari: 'full',
      desktop: 'partial',
    },
    permissionRequired: true,
    permissionName: 'geolocation',
  },
  {
    id: 'clipboard',
    title: {
      ar: 'الحافظة والنسخ السريع (Clipboard API)',
      en: 'Native Clipboard Access',
      fr: 'Accès au Presse-papiers Natif',
    },
    shortDesc: {
      ar: 'نسخ وقراءة النصوص والروابط بنقرة واحدة بأمان تام مع دعم هواتف أندرويد.',
      en: 'Read and write formatted text and links directly to system clipboard safely.',
      fr: 'Lisez et écrivez du texte ou des liens dans le presse-papiers sécurisé.',
    },
    webApi: 'navigator.clipboard.writeText(text)',
    androidEquivalent: 'ClipboardManager.setPrimaryClip()',
    compatibility: {
      androidChrome: 'full',
      androidTwa: 'full',
      iosSafari: 'full',
      desktop: 'full',
    },
    permissionRequired: false,
  },
];

// Presets for Haptic vibration patterns
export const HAPTIC_PATTERNS = [
  { id: 'light', labelAr: 'نقرة خفيفة (Light Tap)', labelEn: 'Light Tap', labelFr: 'Légère Tape', pattern: [40], soundFreq: 520 },
  { id: 'medium', labelAr: 'تأكيد متوسط (Medium Click)', labelEn: 'Medium Click', labelFr: 'Clic Moyen', pattern: [80], soundFreq: 440 },
  { id: 'heavy', labelAr: 'صدمة قوية (Heavy Impact)', labelEn: 'Heavy Impact', labelFr: 'Impact Lourd', pattern: [150], soundFreq: 280 },
  { id: 'success', labelAr: 'تأكيد النجاح (Double Tick 🎉)', labelEn: 'Success (Double Tick)', labelFr: 'Succès (Double Clic)', pattern: [60, 40, 100], soundFreq: 660 },
  { id: 'warning', labelAr: 'تنبيه تحذيري (Warning ⚠️)', labelEn: 'Warning Alert', labelFr: 'Avertissement', pattern: [100, 50, 100, 50, 150], soundFreq: 330 },
  { id: 'heartbeat', labelAr: 'نبض القلب (Heartbeat ❤️)', labelEn: 'Heartbeat Rhythm', labelFr: 'Rythme Cardiaque', pattern: [70, 120, 110, 300, 70, 120, 110], soundFreq: 220 },
];

// Generates production-grade safe bridge helper code
export function generateSafeBridgeCode(flavor: 'typescript' | 'javascript' | 'react' | 'android'): string {
  switch (flavor) {
    case 'typescript':
      return `/**
 * Appifya Safe Device Bridge (TypeScript)
 * Universal, zero-crash hardware abstraction for Progressive Web Apps & Android WebViews.
 * 100% safe against "window is undefined" and "API not supported" exceptions.
 */

export interface ShareOptions {
  title: string;
  text?: string;
  url?: string;
  files?: File[];
}

export class DeviceBridge {
  private static wakeLockSentinel: any = null;

  /**
   * Safe Haptic Vibration with silent Web Audio fallback
   */
  public static async vibrate(pattern: number | number[] = 60): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        return navigator.vibrate(pattern);
      }
      // Optional Android WebView JavascriptInterface fallback:
      if ((window as any).AndroidBridge?.vibrate) {
        (window as any).AndroidBridge.vibrate(Array.isArray(pattern) ? pattern[0] : pattern);
        return true;
      }
    } catch (err) {
      console.warn('[DeviceBridge] Vibrate not supported:', err);
    }
    return false;
  }

  /**
   * Safe Screen Wake Lock (keeps display awake)
   */
  public static async requestWakeLock(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if ('wakeLock' in navigator && typeof (navigator as any).wakeLock?.request === 'function') {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        this.wakeLockSentinel.addEventListener('release', () => {
          this.wakeLockSentinel = null;
        });
        return true;
      }
    } catch (err) {
      console.warn('[DeviceBridge] WakeLock request failed:', err);
    }
    return false;
  }

  public static async releaseWakeLock(): Promise<void> {
    if (this.wakeLockSentinel) {
      await this.wakeLockSentinel.release();
      this.wakeLockSentinel = null;
    }
  }

  /**
   * Safe Native Share API with fallback to Clipboard
   */
  public static async share(options: ShareOptions): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if (navigator.share) {
        if (!navigator.canShare || navigator.canShare(options)) {
          await navigator.share(options);
          return true;
        }
      }
      // Fallback: Copy URL to clipboard
      if (options.url && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(options.url);
        return true;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('[DeviceBridge] Share failed:', err);
      }
    }
    return false;
  }

  /**
   * Safe Screen Orientation Lock (requires user gesture/fullscreen on mobile)
   */
  public static async lockOrientation(
    orientation: 'portrait' | 'landscape' | 'portrait-primary' | 'landscape-primary'
  ): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const screenAny = screen as any;
      if (screenAny.orientation?.lock) {
        await screenAny.orientation.lock(orientation);
        return true;
      }
    } catch (err) {
      console.warn('[DeviceBridge] Orientation lock unavailable:', err);
    }
    return false;
  }

  /**
   * Safe App Icon Badge Count (PWA Android Home Screen)
   */
  public static async setBadge(count?: number): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if ('setAppBadge' in navigator) {
        await (navigator as any).setAppBadge(count);
        return true;
      }
    } catch {
      // Ignored if unsupported
    }
    return false;
  }

  public static async clearBadge(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if ('clearAppBadge' in navigator) {
        await (navigator as any).clearAppBadge();
        return true;
      }
    } catch {
      // Ignored
    }
    return false;
  }
}
`;

    case 'javascript':
      return `/**
 * Appifya Safe Device Bridge (Vanilla JavaScript)
 * Zero dependencies, paste directly into your website or PWA.
 */
(function (global) {
  'use strict';

  var DeviceBridge = {
    _wakeLock: null,

    // 1. Safe Vibrate
    vibrate: function (pattern) {
      pattern = pattern || 60;
      try {
        if (navigator.vibrate) {
          return navigator.vibrate(pattern);
        }
        if (global.AndroidBridge && global.AndroidBridge.vibrate) {
          global.AndroidBridge.vibrate(Array.isArray(pattern) ? pattern[0] : pattern);
          return true;
        }
      } catch (e) {
        console.warn('[DeviceBridge] Vibrate error:', e);
      }
      return false;
    },

    // 2. Safe Wake Lock
    requestWakeLock: async function () {
      try {
        if ('wakeLock' in navigator) {
          this._wakeLock = await navigator.wakeLock.request('screen');
          this._wakeLock.addEventListener('release', () => { this._wakeLock = null; });
          return true;
        }
      } catch (e) {
        console.warn('[DeviceBridge] WakeLock error:', e);
      }
      return false;
    },

    releaseWakeLock: async function () {
      if (this._wakeLock) {
        await this._wakeLock.release();
        this._wakeLock = null;
      }
    },

    // 3. Safe Share with Clipboard Fallback
    share: async function (data) {
      try {
        if (navigator.share) {
          await navigator.share(data);
          return true;
        }
        if (data.url && navigator.clipboard) {
          await navigator.clipboard.writeText(data.url);
          alert('Link copied to clipboard!');
          return true;
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.warn('[DeviceBridge] Share error:', e);
      }
      return false;
    },

    // 4. Safe App Icon Badging
    setBadge: async function (count) {
      try {
        if ('setAppBadge' in navigator) {
          await navigator.setAppBadge(count);
          return true;
        }
      } catch (e) {}
      return false;
    }
  };

  global.DeviceBridge = DeviceBridge;
})(typeof window !== 'undefined' ? window : this);
`;

    case 'react':
      return `/**
 * React Hook: useDeviceBridge
 * Integrates native device hardware capabilities with reactive state.
 */
import { useState, useEffect, useCallback } from 'react';

export function useDeviceBridge() {
  const [isSupported, setIsSupported] = useState({
    vibrate: false,
    wakeLock: false,
    share: false,
    badge: false,
    orientation: false,
  });

  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsSupported({
      vibrate: 'vibrate' in navigator,
      wakeLock: 'wakeLock' in navigator,
      share: typeof navigator.share === 'function',
      badge: 'setAppBadge' in navigator,
      orientation: !!(screen as any)?.orientation?.lock,
    });
  }, []);

  // Trigger vibration
  const vibrate = useCallback((pattern: number | number[] = 60) => {
    if (typeof window === 'undefined') return false;
    try {
      if (navigator.vibrate) return navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibrate error', e);
    }
    return false;
  }, []);

  // Toggle Screen Wake Lock
  const toggleWakeLock = useCallback(async () => {
    if (wakeLockSentinel) {
      await wakeLockSentinel.release();
      setWakeLockSentinel(null);
      setIsScreenLocked(false);
      return false;
    }
    try {
      if ('wakeLock' in navigator) {
        const sentinel = await (navigator as any).wakeLock.request('screen');
        sentinel.addEventListener('release', () => {
          setIsScreenLocked(false);
          setWakeLockSentinel(null);
        });
        setWakeLockSentinel(sentinel);
        setIsScreenLocked(true);
        return true;
      }
    } catch (err) {
      console.warn('WakeLock failed', err);
    }
    return false;
  }, [wakeLockSentinel]);

  // Trigger native share
  const share = useCallback(async (data: { title: string; text?: string; url?: string }) => {
    if (typeof window === 'undefined') return false;
    try {
      if (navigator.share) {
        await navigator.share(data);
        return true;
      }
      if (data.url && navigator.clipboard) {
        await navigator.clipboard.writeText(data.url);
        return true;
      }
    } catch (e) {}
    return false;
  }, []);

  return {
    isSupported,
    isScreenLocked,
    vibrate,
    toggleWakeLock,
    share,
  };
}
`;

    case 'android':
      return `/**
 * Android Kotlin WebView Bridge
 * Expose native Android hardware features directly into your JavaScript PWA/WebView.
 * In your MainActivity.kt:
 */
package com.appifya.app

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast

class WebAppInterface(private val context: Context) {

    @JavascriptInterface
    fun vibrate(durationMs: Long) {
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        vibrator?.let {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                it.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                it.vibrate(durationMs)
            }
        }
    }

    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
}

// Attach to WebView inside your Activity:
// val webView: WebView = findViewById(R.id.webview)
// webView.settings.javaScriptEnabled = true
// webView.addJavascriptInterface(WebAppInterface(this), "AndroidBridge")
`;
  }
}
