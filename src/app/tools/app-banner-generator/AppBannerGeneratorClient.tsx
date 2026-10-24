'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  Sparkles,
  Palette,
  ArrowRight,
  RefreshCw,
  Sliders,
  Star,
  X,
  Code2,
  Layout,
  Upload,
  Globe,
  ShieldCheck,
  ShoppingBag,
  Gamepad2,
  Rocket,
  Music,
  MessageSquare,
  Landmark,
  UtensilsCrossed,
  Store,
} from 'lucide-react';

type Position = 'top-sticky' | 'top-overlay' | 'bottom-fixed' | 'floating-pill';
type DeviceTarget = 'android-only' | 'all-mobile' | 'all-devices';
type ThemePreset = 'google-play' | 'dark-slate' | 'midnight-cyber' | 'clean-white' | 'custom';
type BorderRadius = 'sharp' | 'rounded' | 'pill';

interface PresetApp {
  id: string;
  name: string;
  developer: string;
  packageId: string;
  rating: number;
  reviews: string;
  iconBg: string;
  iconType: string;
}

const PRESET_APPS: PresetApp[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Messenger',
    developer: 'WhatsApp LLC · Free',
    packageId: 'com.whatsapp',
    rating: 4.3,
    reviews: '180M+',
    iconBg: '#25D366',
    iconType: 'chat',
  },
  {
    id: 'spotify',
    name: 'Spotify: Music & Podcasts',
    developer: 'Spotify AB · Free',
    packageId: 'com.spotify.music',
    rating: 4.4,
    reviews: '34M+',
    iconBg: '#1DB954',
    iconType: 'music',
  },
  {
    id: 'duolingo',
    name: 'Duolingo: Language Lessons',
    developer: 'Duolingo · Free with Ads',
    packageId: 'com.duolingo',
    rating: 4.7,
    reviews: '21M+',
    iconBg: '#58CC02',
    iconType: 'game',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    developer: 'Telegram FZ-LLC · Free',
    packageId: 'org.telegram.messenger',
    rating: 4.3,
    reviews: '14M+',
    iconBg: '#229ED9',
    iconType: 'rocket',
  },
];

const PRESET_ICONS = [
  { id: 'store', label: 'Store', icon: Store, bg: 'from-blue-600 to-indigo-600' },
  { id: 'shopping', label: 'Shop', icon: ShoppingBag, bg: 'from-pink-500 to-rose-600' },
  { id: 'game', label: 'Game', icon: Gamepad2, bg: 'from-purple-600 to-violet-700' },
  { id: 'rocket', label: 'App', icon: Rocket, bg: 'from-cyan-500 to-blue-600' },
  { id: 'music', label: 'Music', icon: Music, bg: 'from-emerald-500 to-teal-600' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, bg: 'from-green-500 to-emerald-600' },
  { id: 'finance', label: 'Finance', icon: Landmark, bg: 'from-amber-500 to-orange-600' },
  { id: 'food', label: 'Food', icon: UtensilsCrossed, bg: 'from-orange-500 to-red-600' },
];

export default function AppBannerGeneratorClient() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';
  const fileInputId = useId();

  // ─── App Store Details ───
  const [appName, setAppName] = useState(
    lang === 'ar' ? 'تطبيقي على Google Play' : lang === 'fr' ? 'Mon Application' : 'My Mobile App'
  );
  const [developer, setDeveloper] = useState(
    lang === 'ar' ? 'Google Play · مجاناً' : lang === 'fr' ? 'Google Play · Gratuit' : 'Google Play · Free'
  );
  const [packageId, setPackageId] = useState('com.company.myapp');
  const [customUrl, setCustomUrl] = useState('');
  const [price, setPrice] = useState(lang === 'ar' ? 'مجاني' : lang === 'fr' ? 'Gratuit' : 'Free');
  const [rating, setRating] = useState('4.8');
  const [reviewCount, setReviewCount] = useState('12K+');
  const [showRating, setShowRating] = useState(true);
  const [showPlayBadge, setShowPlayBadge] = useState(true);

  // Icon
  const [iconMode, setIconMode] = useState<'preset' | 'url' | 'upload'>('preset');
  const [selectedPresetIcon, setSelectedPresetIcon] = useState('store');
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [uploadedIconData, setUploadedIconData] = useState<string | null>(null);

  // ─── Behavioral & Targeting ───
  const [position, setPosition] = useState<Position>('top-sticky');
  const [deviceTarget, setDeviceTarget] = useState<DeviceTarget>('android-only');
  const [dismissDays, setDismissDays] = useState(7);
  const [allowDismiss, setAllowDismiss] = useState(true);
  const [ctaText, setCtaText] = useState(
    lang === 'ar' ? 'تثبيت' : lang === 'fr' ? 'INSTALLER' : 'INSTALL'
  );
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [enableUtm, setEnableUtm] = useState(true);
  const [utmSource, setUtmSource] = useState('smart_banner');
  const [utmMedium, setUtmMedium] = useState('website');

  // ─── Styling & Themes ───
  const [themePreset, setThemePreset] = useState<ThemePreset>('google-play');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#202124');
  const [subtextColor, setSubtextColor] = useState('#5f6368');
  const [btnBgColor, setBtnBgColor] = useState('#01875f'); // Google Play green
  const [btnTextColor, setBtnTextColor] = useState('#ffffff');
  const [borderRadius, setBorderRadius] = useState<BorderRadius>('rounded');
  const [hasShadow, setHasShadow] = useState(true);

  // ─── Preview & Output States ───
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [previewSiteTheme, setPreviewSiteTheme] = useState<'light' | 'dark'>('light');
  const [previewDismissed, setPreviewDismissed] = useState(false);
  const [previewClickFeedback, setPreviewClickFeedback] = useState(false);
  const [copied, setCopied] = useState(false);

  // Apply theme preset
  const handleApplyPreset = (preset: ThemePreset) => {
    setThemePreset(preset);
    if (preset === 'google-play') {
      setBgColor('#ffffff');
      setTextColor('#202124');
      setSubtextColor('#5f6368');
      setBtnBgColor('#01875f');
      setBtnTextColor('#ffffff');
      setBorderRadius('rounded');
      setHasShadow(true);
    } else if (preset === 'dark-slate') {
      setBgColor('#0f172a');
      setTextColor('#f8fafc');
      setSubtextColor('#94a3b8');
      setBtnBgColor('#6366f1');
      setBtnTextColor('#ffffff');
      setBorderRadius('rounded');
      setHasShadow(true);
    } else if (preset === 'midnight-cyber') {
      setBgColor('#18181b');
      setTextColor('#fafafa');
      setSubtextColor('#a1a1aa');
      setBtnBgColor('#10b981');
      setBtnTextColor('#000000');
      setBorderRadius('pill');
      setHasShadow(true);
    } else if (preset === 'clean-white') {
      setBgColor('#f8fafc');
      setTextColor('#0f172a');
      setSubtextColor('#64748b');
      setBtnBgColor('#2563eb');
      setBtnTextColor('#ffffff');
      setBorderRadius('rounded');
      setHasShadow(false);
    }
  };

  // Populate preset app
  const handleSelectPresetApp = (app: PresetApp) => {
    setAppName(app.name);
    setDeveloper(app.developer);
    setPackageId(app.packageId);
    setRating(app.rating.toString());
    setReviewCount(app.reviews);
    setSelectedPresetIcon(app.iconType);
    setIconMode('preset');
  };

  // Upload custom icon handler
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(lang === 'ar' ? 'حجم الملف يجب ألا يتجاوز 2 ميجابايت' : 'File must be under 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedIconData(event.target?.result as string);
        setIconMode('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  // Compute final destination URL
  const getDestinationUrl = () => {
    let base = customUrl.trim();
    if (!base) {
      base = `https://play.google.com/store/apps/details?id=${packageId.trim() || 'com.example.app'}`;
    }
    if (enableUtm) {
      try {
        const u = new URL(base);
        if (utmSource) u.searchParams.set('utm_source', utmSource);
        if (utmMedium) u.searchParams.set('utm_medium', utmMedium);
        return u.toString();
      } catch {
        // Return base as is if invalid URL
      }
    }
    return base;
  };

  // Computed Icon Source for code & preview
  const getIconSvgUri = (iconId: string) => {
    // Elegant SVG fallback data-uri for each preset
    const iconColors: Record<string, { bg: string; icon: string }> = {
      store: { bg: '#4f46e5', icon: 'M4 4h16v4H4zm0 6h16v10H4z' },
      shopping: { bg: '#e11d48', icon: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z' },
      game: { bg: '#7c3aed', icon: 'M6 11h4M8 9v4m7-2h.01M19 11h.01' },
      rocket: { bg: '#0284c7', icon: 'M12 2v20M2 12h20' },
      music: { bg: '#059669', icon: 'M9 18V5l12-2v13' },
      chat: { bg: '#10b981', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
      finance: { bg: '#d97706', icon: 'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11' },
      food: { bg: '#ea580c', icon: 'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z' },
    };
    const current = iconColors[iconId] || iconColors.store;
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><rect width="48" height="48" rx="12" fill="${encodeURIComponent(
      current.bg
    )}"/><path d="${current.icon}" stroke="%23ffffff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(12, 12)"/></svg>`;
  };

  const getActiveIconSrc = () => {
    if (iconMode === 'upload' && uploadedIconData) {
      return uploadedIconData;
    }
    if (iconMode === 'url' && customIconUrl.trim()) {
      return customIconUrl.trim();
    }
    return getIconSvgUri(selectedPresetIcon);
  };

  // Google Play Logo SVG (mini inline)
  const googlePlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style="display:inline-block;vertical-align:-1px;margin-inline-end:4px;"><path d="M3.609 1.814L13.793 12 3.61 22.186c-.334-.337-.538-.803-.538-1.321V3.135c0-.518.204-.984.537-1.321zM15.207 13.414l2.457 2.457-11.23 6.386 8.773-8.843zm2.457-5.271l-2.457 2.457-8.773-8.843 11.23 6.386zm1.18 1.18l3.195 1.817c.928.528.928 1.393 0 1.921l-3.195 1.818-2.146-2.778 2.146-2.778z"/></svg>`;

  // ─── Generate Self-Contained Snippet ───
  const generateSnippet = (): string => {
    const finalUrl = getDestinationUrl();
    const finalIcon = getActiveIconSrc();
    const radiusPx = borderRadius === 'sharp' ? '0px' : borderRadius === 'pill' ? '9999px' : '10px';
    const btnRadiusPx = borderRadius === 'sharp' ? '4px' : borderRadius === 'pill' ? '9999px' : '8px';
    const isPill = position === 'floating-pill';
    const isBottom = position === 'bottom-fixed';
    const isOverlay = position === 'top-overlay';
    const shadowStyle = hasShadow
      ? '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)'
      : 'none';

    // Device check condition
    let deviceCheckCode = '';
    if (deviceTarget === 'android-only') {
      deviceCheckCode = `
    // Target Android devices only
    var isAndroid = /Android/i.test(navigator.userAgent);
    if (!isAndroid) return;`;
    } else if (deviceTarget === 'all-mobile') {
      deviceCheckCode = `
    // Target Mobile devices
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
    if (!isMobile) return;`;
    }

    const snippet = `<!-- Smart App Banner for Google Play (Generated by Appifya) -->
<script>
(function() {
  function initSmartBanner() {${deviceCheckCode}
    
    var STORAGE_KEY = 'appifya_banner_${(packageId || 'app').replace(/[^a-zA-Z0-9_]/g, '_')}';
    var DISMISS_DAYS = ${dismissDays};
    
    // Check if dismissed previously
    if (DISMISS_DAYS > 0) {
      try {
        var dismissedUntil = localStorage.getItem(STORAGE_KEY);
        if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
          return;
        }
      } catch(e) {}
    }

    // Prevent duplicate banners
    if (document.getElementById('appifya-smart-banner')) return;

    // Inject Styles
    var css = \`
      #appifya-smart-banner {
        position: ${isPill ? 'fixed' : isBottom ? 'fixed' : isOverlay ? 'fixed' : 'sticky'};
        ${isBottom || isPill ? 'bottom: ' + (isPill ? '16px' : '0') : 'top: 0'};
        ${isPill ? 'left: 50%; transform: translateX(-50%); width: calc(100% - 32px); max-width: 480px;' : 'left: 0; width: 100%;'}
        z-index: 9999999;
        box-sizing: border-box;
        background-color: ${bgColor};
        color: ${textColor};
        box-shadow: ${shadowStyle};
        border-radius: ${isPill ? '16px' : isBottom ? '16px 16px 0 0' : radiusPx};
        border: 1px solid rgba(128, 128, 128, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.4;
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
      }
      #appifya-smart-banner.sab-closing {
        transform: ${isPill ? 'translate(-50%, 40px)' : isBottom ? 'translateY(100%)' : 'translateY(-100%)'} !important;
        opacity: 0 !important;
      }
      .sab-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        position: relative;
        direction: inherit;
      }
      .sab-close {
        flex-shrink: 0;
        background: transparent;
        border: none;
        color: ${subtextColor};
        padding: 6px;
        cursor: pointer;
        display: ${allowDismiss ? 'inline-flex' : 'none'};
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        line-height: 1;
        transition: background 0.15s, color 0.15s;
        touch-action: manipulation;
      }
      .sab-close:hover {
        background: rgba(128, 128, 128, 0.15);
        color: ${textColor};
      }
      .sab-icon {
        flex-shrink: 0;
        width: 42px;
        height: 42px;
        border-radius: 10px;
        object-fit: cover;
        box-shadow: 0 2px 6px rgba(0,0,0,0.12);
      }
      .sab-info {
        flex: 1;
        min-width: 0;
        text-align: start;
      }
      .sab-title {
        font-size: 13px;
        font-weight: 700;
        color: ${textColor};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0;
      }
      .sab-dev {
        font-size: 11px;
        color: ${subtextColor};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 1px 0 0;
      }
      .sab-stars {
        display: ${showRating ? 'inline-flex' : 'none'};
        align-items: center;
        gap: 2px;
        font-size: 10px;
        font-weight: 600;
        color: #f59e0b;
        margin-top: 2px;
      }
      .sab-reviews {
        color: ${subtextColor};
        font-weight: 400;
        margin-inline-start: 2px;
      }
      .sab-btn {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background-color: ${btnBgColor};
        color: ${btnTextColor} !important;
        padding: 7px 14px;
        border-radius: ${btnRadiusPx};
        font-size: 12px;
        font-weight: 700;
        text-decoration: none !important;
        white-space: nowrap;
        border: none;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.15);
        transition: filter 0.15s ease, transform 0.15s ease;
      }
      .sab-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
      }
      .sab-btn:active {
        transform: translateY(0);
      }
    \`;

    var styleEl = document.createElement('style');
    styleEl.id = 'appifya-smart-banner-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // Build DOM
    var banner = document.createElement('div');
    banner.id = 'appifya-smart-banner';
    banner.setAttribute('role', 'banner');
    banner.setAttribute('aria-label', '${appName.replace(/'/g, "\\'")} Google Play Smart App Banner');

    banner.innerHTML = \`
      <div class="sab-wrap">
        ${
          allowDismiss
            ? `<button type="button" class="sab-close" aria-label="Dismiss banner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>`
            : ''
        }
        <img class="sab-icon" src="${finalIcon}" alt="${appName.replace(/"/g, '&quot;')}" loading="lazy" />
        <div class="sab-info">
          <p class="sab-title">${appName.replace(/</g, '&lt;')}</p>
          <p class="sab-dev">${developer.replace(/</g, '&lt;')}</p>
          ${
            showRating
              ? `<div class="sab-stars">
              <span>★</span><span>${rating}</span>
              <span class="sab-reviews">${reviewCount}</span>
            </div>`
              : ''
          }
        </div>
        <a class="sab-btn" href="${finalUrl}" ${openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''}>
          ${showPlayBadge ? googlePlaySvg : ''}
          <span>${ctaText}</span>
        </a>
      </div>
    \`;

    // Append to body or top
    if (document.body) {
      document.body.insertAdjacentElement('${position === 'top-sticky' ? 'afterbegin' : 'beforeend'}', banner);
    } else {
      window.addEventListener('DOMContentLoaded', function() {
        document.body.insertAdjacentElement('${position === 'top-sticky' ? 'afterbegin' : 'beforeend'}', banner);
      });
    }

    // Dismiss logic
    var closeBtn = banner.querySelector('.sab-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        banner.classList.add('sab-closing');
        setTimeout(function() {
          if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 360);
        if (DISMISS_DAYS > 0) {
          try {
            var expireTime = Date.now() + (DISMISS_DAYS * 86400000);
            localStorage.setItem(STORAGE_KEY, expireTime.toString());
          } catch(e) {}
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmartBanner);
  } else {
    initSmartBanner();
  }
})();
</script>`;
    return snippet;
  };

  // ─── Clipboard Copy ───
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generateSnippet());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // ─── Download HTML Demo File ───
  const handleDownloadDemo = () => {
    const snippet = generateSnippet();
    const demoHtml = `<!DOCTYPE html>
<html lang="${lang}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName} - Smart App Banner Demo</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #1e293b;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #334155;
    }
    .logo {
      font-weight: 800;
      font-size: 1.1rem;
      color: #6366f1;
    }
    main {
      flex: 1;
      max-width: 680px;
      margin: 40px auto;
      padding: 0 20px;
      text-align: center;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 12px;
    }
    p {
      color: #94a3b8;
      line-height: 1.6;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 24px;
      margin-top: 32px;
      text-align: start;
    }
  </style>
</head>
<body>
  ${snippet}
  <header>
    <div class="logo">MyWebsite.com</div>
    <div style="font-size: 13px; color: #94a3b8;">Demo Mode</div>
  </header>
  <main>
    <h1>Welcome to My Website</h1>
    <p>Notice the sleek Smart App Banner promoting the official Android app from Google Play. Try resizing your browser or opening this file on your mobile device!</p>
    <div class="card">
      <h3 style="margin-top:0;">⚡ Live Banner Activated</h3>
      <p style="margin-bottom:0;">The banner above was generated using Appifya Smart App Banner Generator. It includes zero dependencies, native Google Play linking, and dismissal memory in localStorage.</p>
    </div>
  </main>
</body>
</html>`;

    const blob = new Blob([demoHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-app-banner-demo.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="site-main flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {/* ─── Breadcrumb ─── */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">
          {lang === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-white transition-colors">
          {lang === 'ar' ? 'الأدوات' : 'Tools'}
        </Link>
        <span>/</span>
        <span className="text-emerald-400 font-semibold">
          {lang === 'ar' ? 'مولد شريط التطبيق الذكي' : 'Smart App Banner Generator'}
        </span>
      </nav>

      {/* ─── Page Header ─── */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400 mb-4 shadow-sm shadow-emerald-500/10">
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            {lang === 'ar'
              ? 'أداة مجانية 100% · كود خفيف بدون مكتبات خارجية'
              : '100% Free · Zero-Dependency Pure HTML & JS'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Smart App Banner{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            {lang === 'ar' ? 'لموقعك وتطبيقك' : 'Code Generator'}
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {lang === 'ar'
            ? 'حوّل زوار موقعك إلى مستخدمين دائمين! ولد شريطاً أنيقاً يظهر تلقائياً أعلى أو أسفل موقعك يدعو الزوار لتنزيل تطبيقك مباشرة من Google Play مع دعم كامل للتخصيص والحفظ في المتصفح.'
            : 'Drive Google Play app installs directly from your website visitors. Generate a lightweight, high-converting banner with full design customization, mobile targeting, and localStorage frequency control.'}
        </p>

        {/* Quick presets for well-known apps */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-medium me-1">
            {lang === 'ar' ? 'أمثلة سريعة للتجربة:' : 'Try quick presets:'}
          </span>
          {PRESET_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => handleSelectPresetApp(app)}
              className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-800 text-slate-300 font-medium transition-all text-[11px]"
            >
              {app.name.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Two-Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── Left Column: Customization Controls (7 cols) ─── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: App Info & Store Details */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {lang === 'ar' ? '1. بيانات التطبيق والمتجر' : '1. App Store Details'}
                </h2>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'بيانات التطبيق كما تظهر في Google Play' : 'Metadata displayed in the smart banner'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* App Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  {lang === 'ar' ? 'اسم التطبيق (App Name)' : 'App Name'}
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. My Online Store"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Developer / Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    {lang === 'ar' ? 'المطور / الوصف المختصر' : 'Publisher / Subtitle'}
                  </label>
                  <input
                    type="text"
                    value={developer}
                    onChange={(e) => setDeveloper(e.target.value)}
                    placeholder="e.g. Google Play · Free"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    {lang === 'ar' ? 'معرّف حزمة الأندرويد (Package ID)' : 'Android Package Name'}
                  </label>
                  <input
                    type="text"
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    placeholder="e.g. com.company.app"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Custom Destination URL / Override */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  {lang === 'ar' ? 'رابط مخصص بديل (اختياري)' : 'Custom Direct URL (Optional)'}
                </label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://play.google.com/store/apps/details?id=... (or direct APK link)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  {lang === 'ar'
                    ? 'اتركه فارغاً ليتم استخدام رابط Google Play الرسمي تلقائياً بناءً على Package ID.'
                    : 'Leave blank to automatically construct the standard Google Play Store URL.'}
                </p>
              </div>

              {/* Rating and Reviews */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    {lang === 'ar' ? 'التقييم (Rating)' : 'Rating (Stars)'}
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full bg-transparent text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    {lang === 'ar' ? 'عدد التقييمات' : 'Review Count'}
                  </label>
                  <input
                    type="text"
                    value={reviewCount}
                    onChange={(e) => setReviewCount(e.target.value)}
                    placeholder="e.g. 24K+"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    {lang === 'ar' ? 'السعر' : 'Price Label'}
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. Free"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Toggles: Show rating & Play badge */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showRating}
                    onChange={(e) => setShowRating(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>{lang === 'ar' ? 'إظهار نجوم التقييم' : 'Show Star Rating'}</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPlayBadge}
                    onChange={(e) => setShowPlayBadge(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>{lang === 'ar' ? 'إظهار أيقونة Google Play في الزر' : 'Show Google Play icon in button'}</span>
                </label>
              </div>

              {/* App Icon Selector */}
              <div className="pt-3 border-t border-slate-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {lang === 'ar' ? 'أيقونة التطبيق' : 'App Icon'}
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setIconMode('preset')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      iconMode === 'preset'
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'ar' ? 'نماذج جاهزة' : 'Built-in Presets'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconMode('upload')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      iconMode === 'upload'
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'ar' ? 'رفع صورة' : 'Upload Image'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconMode('url')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      iconMode === 'url'
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'ar' ? 'رابط صورة (URL)' : 'Image URL'}
                  </button>
                </div>

                {iconMode === 'preset' && (
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {PRESET_ICONS.map((p) => {
                      const IconComp = p.icon;
                      const active = selectedPresetIcon === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPresetIcon(p.id)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                            active
                              ? 'border-emerald-500 bg-emerald-500/15 shadow-sm'
                              : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className={`h-8 w-8 rounded-lg bg-gradient-to-br ${p.bg} flex items-center justify-center text-white mb-1`}
                          >
                            <IconComp className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {iconMode === 'upload' && (
                  <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <input
                      type="file"
                      id={fileInputId}
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor={fileInputId}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>{lang === 'ar' ? 'اختر ملف الصورة' : 'Choose Icon File'}</span>
                    </label>
                    <span className="text-xs text-slate-400">
                      {uploadedIconData
                        ? lang === 'ar'
                          ? '✓ تم تحميل الصورة'
                          : '✓ Icon uploaded'
                        : lang === 'ar'
                        ? 'PNG, JPG, SVG حتى 2MB'
                        : 'PNG, JPG, SVG up to 2MB'}
                    </span>
                  </div>
                )}

                {iconMode === 'url' && (
                  <input
                    type="url"
                    value={customIconUrl}
                    onChange={(e) => setCustomIconUrl(e.target.value)}
                    placeholder="https://example.com/app-icon.png"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Behavior, Placement & Targeting */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-400">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {lang === 'ar' ? '2. سلوك الشريط والظهور' : '2. Behavior & Targeting'}
                </h2>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'أين يظهر الشريط ولمن وكيف يتصرف عند الإغلاق' : 'Position, device filtering, and dismissal'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Position */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {lang === 'ar' ? 'موضع الشريط في الموقع' : 'Banner Placement'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'top-sticky', labelAr: 'أعلى (مثبت)', labelEn: 'Top Sticky', descAr: 'يدفع المحتوى' },
                    { id: 'top-overlay', labelAr: 'أعلى (عائم)', labelEn: 'Top Overlay', descAr: 'فوق المحتوى' },
                    { id: 'bottom-fixed', labelAr: 'أسفل الشاشة', labelEn: 'Bottom Bar', descAr: 'سهل الوصول' },
                    { id: 'floating-pill', labelAr: 'كبسولة عائمة', labelEn: 'Floating Card', descAr: 'تصميم عصري' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setPosition(pos.id as Position)}
                      className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                        position === pos.id
                          ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{lang === 'ar' ? pos.labelAr : pos.labelEn}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{pos.descAr}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Devices */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {lang === 'ar' ? 'الأجهزة المستهدفة للظهور' : 'Target Devices'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'android-only', labelAr: 'أجهزة أندرويد فقط', labelEn: 'Android Only' },
                    { id: 'all-mobile', labelAr: 'جميع الجوالات', labelEn: 'All Mobile' },
                    { id: 'all-devices', labelAr: 'كل الأجهزة (مع الكمبيوتر)', labelEn: 'All Devices' },
                  ].map((dev) => (
                    <button
                      key={dev.id}
                      type="button"
                      onClick={() => setDeviceTarget(dev.id as DeviceTarget)}
                      className={`py-2.5 px-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        deviceTarget === dev.id
                          ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'ar' ? dev.labelAr : dev.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dismissal Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    {lang === 'ar' ? 'فترة إخفاء الشريط بعد الإغلاق' : 'Hide After Dismissal (Days)'}
                  </label>
                  <select
                    value={dismissDays}
                    onChange={(e) => setDismissDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={0}>{lang === 'ar' ? 'دائماً يظهر (للتجربة)' : 'Always show (testing)'}</option>
                    <option value={1}>{lang === 'ar' ? 'يوم واحد (24 ساعة)' : '1 Day'}</option>
                    <option value={3}>{lang === 'ar' ? '3 أيام' : '3 Days'}</option>
                    <option value={7}>{lang === 'ar' ? '7 أيام (مستحسن)' : '7 Days (Recommended)'}</option>
                    <option value={14}>{lang === 'ar' ? '14 يوماً' : '14 Days'}</option>
                    <option value={30}>{lang === 'ar' ? '30 يوماً' : '30 Days'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    {lang === 'ar' ? 'نص زر التحميل (CTA)' : 'Button CTA Text'}
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="INSTALL"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowDismiss}
                    onChange={(e) => setAllowDismiss(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>{lang === 'ar' ? 'تمكين زر الإغلاق (✕)' : 'Allow close button (✕)'}</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={openInNewTab}
                    onChange={(e) => setOpenInNewTab(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>{lang === 'ar' ? 'فتح في علامة تبويب جديدة' : 'Open in new tab'}</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableUtm}
                    onChange={(e) => setEnableUtm(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>{lang === 'ar' ? 'إضافة وسوم تتبع UTM للرابط' : 'Append UTM campaign parameters'}</span>
                </label>
              </div>

              {enableUtm && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      UTM Source
                    </label>
                    <input
                      type="text"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      placeholder="smart_banner"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      UTM Medium
                    </label>
                    <input
                      type="text"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      placeholder="website"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Visual Styling & Colors */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-400">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {lang === 'ar' ? '3. التصميم والألوان' : '3. Styling & Themes'}
                </h2>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'اختر نمطاً مسبقاً أو حدد ألوان هويتك البصرية' : 'Presets & custom brand palette'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {lang === 'ar' ? 'قوالب الأنماط الجاهزة' : 'Theme Presets'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'google-play', name: 'Google Play', desc: 'Classic White & Green' },
                    { id: 'dark-slate', name: 'Dark Slate', desc: 'Modern High Contrast' },
                    { id: 'midnight-cyber', name: 'Midnight Glow', desc: 'Zinc & Emerald Pill' },
                    { id: 'clean-white', name: 'Minimal Light', desc: 'Subtle & Borderless' },
                  ].map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => handleApplyPreset(th.id as ThemePreset)}
                      className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                        themePreset === th.id
                          ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{th.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{th.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Pickers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {lang === 'ar' ? 'لون الخلفية' : 'Background'}
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => {
                        setBgColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="h-7 w-8 bg-transparent cursor-pointer rounded border-0"
                    />
                    <span className="text-[11px] font-mono text-slate-300 uppercase">{bgColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {lang === 'ar' ? 'لون العنوان' : 'Title Text'}
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="h-7 w-8 bg-transparent cursor-pointer rounded border-0"
                    />
                    <span className="text-[11px] font-mono text-slate-300 uppercase">{textColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {lang === 'ar' ? 'لون الزر (CTA)' : 'Button Color'}
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                    <input
                      type="color"
                      value={btnBgColor}
                      onChange={(e) => {
                        setBtnBgColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="h-7 w-8 bg-transparent cursor-pointer rounded border-0"
                    />
                    <span className="text-[11px] font-mono text-slate-300 uppercase">{btnBgColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {lang === 'ar' ? 'نص الزر' : 'Button Text'}
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                    <input
                      type="color"
                      value={btnTextColor}
                      onChange={(e) => {
                        setBtnTextColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="h-7 w-8 bg-transparent cursor-pointer rounded border-0"
                    />
                    <span className="text-[11px] font-mono text-slate-300 uppercase">{btnTextColor}</span>
                  </div>
                </div>
              </div>

              {/* Corner Rounding & Shadow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    {lang === 'ar' ? 'انحناء الحواف' : 'Border Radius'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'sharp', label: 'حادة' },
                      { id: 'rounded', label: 'دائرية' },
                      { id: 'pill', label: 'كبسولة' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setBorderRadius(r.id as BorderRadius)}
                        className={`py-2 px-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          borderRadius === r.id
                            ? 'bg-indigo-500/20 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    {lang === 'ar' ? 'الظل والعمق (Shadow)' : 'Drop Shadow'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setHasShadow(!hasShadow)}
                    className={`w-full py-2.5 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      hasShadow
                        ? 'bg-indigo-500/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {hasShadow
                      ? lang === 'ar'
                        ? '✓ مفعل (ظل ناعم مرتفع)'
                        : '✓ Enabled (Soft drop shadow)'
                      : lang === 'ar'
                      ? '✕ بدون ظل (مسطح Flat)'
                      : '✕ Disabled (Flat style)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Live Interactive Mockup & Code Output (5 cols) ─── */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          {/* Live Smartphone Interactive Preview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  {lang === 'ar' ? 'معاينة حية تفاعلية' : 'Live Interactive Preview'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Background mode toggle */}
                <button
                  type="button"
                  title="Toggle Mockup Background"
                  onClick={() => setPreviewSiteTheme(previewSiteTheme === 'light' ? 'dark' : 'light')}
                  className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {previewSiteTheme === 'light' ? '☀️ Site' : '🌙 Site'}
                </button>
                {/* Viewport switch */}
                <button
                  type="button"
                  onClick={() => setPreviewDevice(previewDevice === 'mobile' ? 'desktop' : 'mobile')}
                  className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {previewDevice === 'mobile' ? '📱 Mobile' : '💻 Full'}
                </button>
              </div>
            </div>

            {/* Mockup Frame Container */}
            <div className="flex justify-center">
              <div
                className={`w-full transition-all duration-300 ${
                  previewDevice === 'mobile' ? 'max-w-[360px]' : 'max-w-full'
                }`}
              >
                {/* Simulated Smartphone Shell */}
                <div className="rounded-[28px] border-4 border-slate-700/80 bg-slate-950 p-2 shadow-2xl relative overflow-hidden">
                  {/* Speaker & Camera notch */}
                  <div className="flex justify-center mb-1">
                    <div className="h-3.5 w-24 bg-slate-800 rounded-full flex items-center justify-center gap-2">
                      <div className="h-1.5 w-8 bg-slate-700 rounded-full" />
                      <div className="h-2 w-2 bg-slate-900 rounded-full border border-slate-700" />
                    </div>
                  </div>

                  {/* Android Status Bar */}
                  <div className="flex items-center justify-between px-3 py-1 text-[10px] text-slate-400 font-medium">
                    <span>10:24</span>
                    <div className="flex items-center gap-1.5">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Browser Address Bar */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl mx-2 my-1.5 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span className="truncate">mywebsite.com</span>
                    </div>
                    <RefreshCw className="h-2.5 w-2.5 text-slate-500" />
                  </div>

                  {/* Web Page Viewport with Smart App Banner */}
                  <div
                    className={`rounded-2xl min-h-[360px] flex flex-col relative overflow-hidden transition-colors ${
                      previewSiteTheme === 'light' ? 'bg-slate-50 text-slate-800' : 'bg-slate-900 text-slate-100'
                    }`}
                    style={{ direction: isRtl ? 'rtl' : 'ltr' }}
                  >
                    {/* ─── LIVE BANNER PREVIEW (TOP PLACEMENT) ─── */}
                    {(position === 'top-sticky' || position === 'top-overlay') && !previewDismissed && (
                      <div
                        className="transition-all duration-300 relative border-b border-black/10"
                        style={{
                          backgroundColor: bgColor,
                          color: textColor,
                          boxShadow: hasShadow ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                          borderRadius: borderRadius === 'pill' ? '12px' : borderRadius === 'sharp' ? '0' : '8px',
                          margin: position === 'top-overlay' ? '6px' : '0',
                        }}
                      >
                        <div className="flex items-center gap-2.5 p-2.5">
                          {allowDismiss && (
                            <button
                              type="button"
                              onClick={() => setPreviewDismissed(true)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full transition-colors cursor-pointer"
                              title="Dismiss Banner"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getActiveIconSrc()}
                            alt="App Icon"
                            className="h-10 w-10 rounded-xl object-cover shadow-sm shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold leading-snug truncate" style={{ color: textColor }}>
                              {appName || 'App Name'}
                            </p>
                            <p className="text-[10px] leading-tight truncate" style={{ color: subtextColor }}>
                              {developer || 'Google Play'}
                            </p>
                            {showRating && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold mt-0.5">
                                <span>★</span>
                                <span>{rating}</span>
                                <span className="text-[9px] font-normal" style={{ color: subtextColor }}>
                                  ({reviewCount})
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewClickFeedback(true);
                              setTimeout(() => setPreviewClickFeedback(false), 2000);
                            }}
                            className="shrink-0 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-transform active:scale-95 flex items-center gap-1 shadow-sm cursor-pointer"
                            style={{
                              backgroundColor: btnBgColor,
                              color: btnTextColor,
                              borderRadius:
                                borderRadius === 'pill' ? '9999px' : borderRadius === 'sharp' ? '4px' : '8px',
                            }}
                          >
                            {showPlayBadge && (
                              <span
                                dangerouslySetInnerHTML={{ __html: googlePlaySvg }}
                                className="inline-block"
                              />
                            )}
                            <span>{ctaText}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Dummy Web Page Body Content */}
                    <div className="p-4 flex-1 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <span className="font-extrabold text-xs text-indigo-500">STORE LOGO</span>
                        <div className="flex gap-2">
                          <span className="h-2 w-6 bg-slate-300 dark:bg-slate-700 rounded" />
                          <span className="h-2 w-6 bg-slate-300 dark:bg-slate-700 rounded" />
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <div className="h-3 w-3/4 bg-slate-300 dark:bg-slate-700 rounded" />
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-2 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                          Product A
                        </div>
                        <div className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                          Product B
                        </div>
                      </div>

                      {/* Dismissed notification in preview */}
                      {previewDismissed && (
                        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs text-center space-y-2">
                          <p className="font-semibold">
                            {lang === 'ar' ? 'تم إغلاق الشريط (محاكاة حفظ المتصفح)' : 'Banner dismissed by user'}
                          </p>
                          <button
                            type="button"
                            onClick={() => setPreviewDismissed(false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition-colors"
                          >
                            <RefreshCw className="h-3 w-3" />
                            <span>{lang === 'ar' ? 'إعادة إظهار الشريط' : 'Restore Banner'}</span>
                          </button>
                        </div>
                      )}

                      {/* Click install feedback toast */}
                      {previewClickFeedback && (
                        <div className="p-2 rounded-lg bg-emerald-500 text-white text-[11px] font-bold text-center animate-bounce">
                          ✓ {lang === 'ar' ? 'جاري التوجيه إلى Google Play...' : 'Opening Google Play Store...'}
                        </div>
                      )}
                    </div>

                    {/* ─── LIVE BANNER PREVIEW (BOTTOM OR FLOATING PILL) ─── */}
                    {(position === 'bottom-fixed' || position === 'floating-pill') && !previewDismissed && (
                      <div
                        className="transition-all duration-300"
                        style={{
                          backgroundColor: bgColor,
                          color: textColor,
                          boxShadow: hasShadow ? '0 10px 25px rgba(0,0,0,0.25)' : 'none',
                          borderRadius:
                            position === 'floating-pill'
                              ? '14px'
                              : borderRadius === 'sharp'
                              ? '0'
                              : '14px 14px 0 0',
                          margin: position === 'floating-pill' ? '10px' : '0',
                          border: '1px solid rgba(128, 128, 128, 0.15)',
                        }}
                      >
                        <div className="flex items-center gap-2.5 p-2.5">
                          {allowDismiss && (
                            <button
                              type="button"
                              onClick={() => setPreviewDismissed(true)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full transition-colors cursor-pointer"
                              title="Dismiss Banner"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getActiveIconSrc()}
                            alt="App Icon"
                            className="h-10 w-10 rounded-xl object-cover shadow-sm shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold leading-snug truncate" style={{ color: textColor }}>
                              {appName || 'App Name'}
                            </p>
                            <p className="text-[10px] leading-tight truncate" style={{ color: subtextColor }}>
                              {developer || 'Google Play'}
                            </p>
                            {showRating && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold mt-0.5">
                                <span>★</span>
                                <span>{rating}</span>
                                <span className="text-[9px] font-normal" style={{ color: subtextColor }}>
                                  ({reviewCount})
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewClickFeedback(true);
                              setTimeout(() => setPreviewClickFeedback(false), 2000);
                            }}
                            className="shrink-0 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-transform active:scale-95 flex items-center gap-1 shadow-sm cursor-pointer"
                            style={{
                              backgroundColor: btnBgColor,
                              color: btnTextColor,
                              borderRadius:
                                borderRadius === 'pill' ? '9999px' : borderRadius === 'sharp' ? '4px' : '8px',
                            }}
                          >
                            {showPlayBadge && (
                              <span
                                dangerouslySetInnerHTML={{ __html: googlePlaySvg }}
                                className="inline-block"
                              />
                            )}
                            <span>{ctaText}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Code Export & Download Panel ─── */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {lang === 'ar' ? 'كود الشريط الجاهز' : 'Generated Embed Code'}
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Zero Dependencies
              </span>
            </div>

            {/* Code Box */}
            <div className="relative mb-4">
              <pre className="max-h-56 overflow-x-auto overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-[11px] font-mono text-emerald-300/90 leading-relaxed scrollbar-thin">
                <code>{generateSnippet()}</code>
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? (lang === 'ar' ? 'تم النسخ بنجاح!' : 'Copied!') : lang === 'ar' ? 'نسخ الكود' : 'Copy Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadDemo}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
              >
                <Download className="h-4 w-4 text-cyan-400" />
                <span>{lang === 'ar' ? 'تحميل ملف التجربة (HTML)' : 'Download Demo File'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Platform Integration Quick Guides ─── */}
      <section className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-10 shadow-xl">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            {lang === 'ar' ? 'كيفية وضع الكود في موقعك' : 'How to Install on Any Website'}
          </h2>
          <p className="text-sm text-slate-400">
            {lang === 'ar'
              ? 'الكود متوافق مع كافة المنصات وأنظمة إدارة المحتوى بدون الحاجة لتثبيت أي ملحقات إضافية.'
              : 'Works seamlessly with WordPress, Shopify, Webflow, custom HTML, and more.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              platform: 'WordPress',
              icon: Globe,
              color: 'text-blue-400',
              stepAr: 'الصق الكود في إعدادات القالب (Customizer > Additional Scripts) أو عبر إضافة Insert Headers and Footers.',
              stepEn: 'Paste snippet inside the Customizer > Additional Scripts, or using a "WPCode / Insert Headers & Footers" plugin.',
            },
            {
              platform: 'Shopify',
              icon: ShoppingBag,
              color: 'text-emerald-400',
              stepAr: 'من لوحة التحكم: Online Store > Themes > Edit Code، افتح ملف theme.liquid والصق الكود قبل </body>.',
              stepEn: 'Go to Online Store > Themes > Edit Code, open theme.liquid and paste before the closing </body> tag.',
            },
            {
              platform: 'Webflow',
              icon: Layout,
              color: 'text-cyan-400',
              stepAr: 'في إعدادات الموقع Project Settings > Custom Code، ضع الكود في خانة Footer Code واضغط Publish.',
              stepEn: 'In Project Settings > Custom Code, paste into the Footer Code section and publish your site.',
            },
            {
              platform: 'Custom HTML / Next.js',
              icon: Code2,
              color: 'text-indigo-400',
              stepAr: 'ضع الكود في نهاية ملف index.html أو أدرجه في مكون layout أو script في مشروعك.',
              stepEn: 'Insert right before the closing </body> tag or load dynamically with a <Script> tag.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.platform}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <h3 className="text-sm font-bold text-white">{item.platform}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar' ? item.stepAr : item.stepEn}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Informational FAQ Section ─── */}
      <section className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-10">
        <h2 className="text-xl sm:text-2xl font-black text-white mb-6 text-center">
          {lang === 'ar' ? 'الأسئلة الشائعة حول Smart App Banner' : 'Frequently Asked Questions'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-start">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400">
              {lang === 'ar' ? 'لماذا يحتاج أندرويد شريطاً مخصصاً؟' : 'Why does Android need a custom banner?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'بخلاف متصفح Safari على iOS الذي يدعم وسم meta أصلي، لا يوفر متصفح Google Chrome على أندرويد شريطاً مدمجاً لمتجر Google Play للمواقع العادية، لذا فإن هذا الشريط هو الحل المعياري الأكثر كفاءة.'
                : 'Unlike Safari iOS which has a native <meta name="apple-itunes-app"> tag, Android Chrome does not provide a native Google Play smart banner for web pages. This custom lightweight script bridges the gap perfectly.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400">
              {lang === 'ar' ? 'هل يؤثر الكود على سرعة الموقع؟' : 'Does it affect page performance?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'إطلاقاً. الكود مبني بلغة JavaScript نقية بحجم أقل من 3 كيلوبايت وبدون أي مكتبات أو أطر عمل، ويتم تحميله بعد اكتمال الصفحة بدون التأثير على مؤشرات أداء Core Web Vitals.'
                : 'Not at all. The script weighs under 3 KB with zero dependencies, executes asynchronously, and has no negative impact on Google Core Web Vitals or lighthouse scores.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400">
              {lang === 'ar' ? 'كيف يتم تذكر إغلاق الزائر؟' : 'How does frequency capping work?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'عندما ينقر الزائر على زر (✕)، يحفظ الكود طابعاً زمنياً في متصفحه عبر localStorage للمدة التي حددتها (مثلاً 7 أيام)، فلا يظهر الشريط مجدداً ويزعج الزائر.'
                : 'When the visitor dismisses the banner, the script records a timestamp in localStorage for the chosen duration (e.g. 7 days), preventing banner fatigue.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400">
              {lang === 'ar' ? 'هل يدعم الرابط المباشر لتطبيق المتجر؟' : 'Does it open the native Google Play app?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'نعم، رابط Google Play الرسمي يفتح تطبيق المتجر المثبت تلقائياً على هاتف الزائر مباشرة إلى صفحة تطبيقك للتحميل الفوري بنقرة واحدة.'
                : 'Yes! Standard Google Play URLs are handled natively by Android OS, opening directly in the installed Play Store app with a single tap.'}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <div className="mt-16 rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 via-zinc-900/50 to-zinc-950/90 p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            {lang === 'ar' ? 'هل تريد تحويل موقعك لتطبيق أندرويد حقيقي؟' : 'Turn your website into a full Android app'}
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6 leading-relaxed">
            {lang === 'ar'
              ? 'مع Appifya، يمكنك تحويل متجرك أو موقعك إلى تطبيق PWA متكامل و ملف APK جاهز للنشر على Google Play مع إعلانات AdMob في دقائق.'
              : 'Appifya lets you convert any website into a high-performance PWA and downloadable Android APK with AdMob integration in minutes.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/20 transition-all"
          >
            <span>{lang === 'ar' ? 'ابدأ بناء تطبيقك مجاناً' : 'Start building for free'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
