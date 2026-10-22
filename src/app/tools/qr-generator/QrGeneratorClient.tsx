'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useLanguage } from '../../lib/i18n';
import {
  QrCode,
  Download,
  Upload,
  Copy,
  Printer,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Smartphone,
  Globe,
  Wifi,
  User,
  Type,
  FileCode,
  Palette,
  Check,
  Sliders,
} from 'lucide-react';

type ContentType = 'url' | 'pwa' | 'wifi' | 'vcard' | 'text';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
type FrameStyle = 'none' | 'bottom-banner' | 'top-banner' | 'card';
type LogoBadgeShape = 'circle' | 'rounded';

const COLOR_PRESETS = [
  { name: 'Obsidian Black', hex: '#090a0d' },
  { name: 'Electric Indigo', hex: '#6366f1' },
  { name: 'Royal Violet', hex: '#8b5cf6' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Ruby Rose', hex: '#f43f5e' },
  { name: 'Amber Gold', hex: '#f59e0b' },
  { name: 'Ocean Cyan', hex: '#06b6d4' },
  { name: 'Pure Navy', hex: '#1e3a8a' },
];

export default function QrGeneratorClient() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  // Content type & form state
  const [contentType, setContentType] = useState<ContentType>('pwa');
  const [url, setUrl] = useState('https://appifya.app');
  const [pwaUrl, setPwaUrl] = useState('https://appifya.app');
  const [appName, setAppName] = useState('My PWA Store');
  const [enableUtm, setEnableUtm] = useState(false);
  const [utmSource, setUtmSource] = useState('qrcode');
  const [utmMedium, setUtmMedium] = useState('offline_print');
  const [utmCampaign, setUtmCampaign] = useState('counter_standee');

  // WiFi state
  const [wifiSsid, setWifiSsid] = useState('Guest_WiFi');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  // vCard state
  const [vcardName, setVcardName] = useState('Omar Al-Saeed');
  const [vcardPhone, setVcardPhone] = useState('+966500000000');
  const [vcardEmail, setVcardEmail] = useState('contact@appifya.app');
  const [vcardCompany, setVcardCompany] = useState('Appifya Solutions');
  const [vcardWebsite, setVcardWebsite] = useState('https://appifya.app');

  // Plain text state
  const [plainText, setPlainText] = useState('Welcome to our mobile experience!');

  // Visual Customization
  const [fgColor, setFgColor] = useState('#090a0d');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isTransparentBg, setIsTransparentBg] = useState(false);
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrectionLevel>('H');
  const [margin, setMargin] = useState(2);
  const [resolution, setResolution] = useState<512 | 1024 | 2048>(1024);

  // Logo Settings
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState(22);
  const [logoBadgeShape, setLogoBadgeShape] = useState<LogoBadgeShape>('rounded');

  // Frame Settings
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('bottom-banner');
  const [frameText, setFrameText] = useState(
    lang === 'ar' ? 'امسح لتثبيت التطبيق' : lang === 'fr' ? 'Scannez pour installer l’app' : 'Scan to Install App'
  );

  // Feedback & Preview
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compute final encoded text string
  const getEncodedText = useCallback((): string => {
    switch (contentType) {
      case 'pwa': {
        let finalUrl = pwaUrl.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
          finalUrl = 'https://' + finalUrl;
        }
        if (enableUtm) {
          try {
            const u = new URL(finalUrl);
            if (utmSource) u.searchParams.set('utm_source', utmSource);
            if (utmMedium) u.searchParams.set('utm_medium', utmMedium);
            if (utmCampaign) u.searchParams.set('utm_campaign', utmCampaign);
            finalUrl = u.toString();
          } catch {
            // Keep as is if invalid URL
          }
        }
        return finalUrl;
      }
      case 'url': {
        let finalUrl = url.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
          finalUrl = 'https://' + finalUrl;
        }
        return finalUrl;
      }
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nORG:${vcardCompany}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nURL:${vcardWebsite}\nEND:VCARD`;
      case 'text':
        return plainText;
      default:
        return 'https://appifya.app';
    }
  }, [contentType, pwaUrl, url, enableUtm, utmSource, utmMedium, utmCampaign, wifiSsid, wifiEncryption, wifiPassword, vcardName, vcardCompany, vcardPhone, vcardEmail, vcardWebsite, plainText]);

  // Handle Logo Upload
  const handleLogoUpload = (file?: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setStatusMsg({
        type: 'error',
        text: lang === 'ar' ? 'حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت.' : 'File too large. Maximum size is 2MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
      // Auto-elevate error correction level for logos
      setErrorCorrection('H');
      setStatusMsg({
        type: 'success',
        text: lang === 'ar' ? 'تم تحميل الشعار بنجاح!' : 'Logo loaded successfully!',
      });
      setTimeout(() => setStatusMsg(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Render QR Code onto Canvas
  const renderQrCode = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const encodedText = getEncodedText();
    const finalBgColor = isTransparentBg ? '#00000000' : bgColor;

    // Dimensions
    const qrSize = resolution;
    let extraTop = 0;
    let extraBottom = 0;

    if (frameStyle === 'top-banner') {
      extraTop = Math.round(qrSize * 0.16);
    } else if (frameStyle === 'bottom-banner') {
      extraBottom = Math.round(qrSize * 0.16);
    } else if (frameStyle === 'card') {
      extraTop = Math.round(qrSize * 0.14);
      extraBottom = Math.round(qrSize * 0.18);
    }

    const totalWidth = qrSize;
    const totalHeight = qrSize + extraTop + extraBottom;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw frame background
    if (!isTransparentBg) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalWidth, totalHeight);
    } else {
      ctx.clearRect(0, 0, totalWidth, totalHeight);
    }

    // Generate Raw QR into temporary offscreen canvas
    const tempCanvas = document.createElement('canvas');
    try {
      await QRCode.toCanvas(tempCanvas, encodedText, {
        width: qrSize,
        margin,
        color: {
          dark: fgColor,
          light: finalBgColor,
        },
        errorCorrectionLevel: errorCorrection,
      });

      // Draw QR code onto main canvas
      ctx.drawImage(tempCanvas, 0, extraTop, qrSize, qrSize);

      // Embed Logo if present
      if (logoPreview) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const logoSize = Math.round(qrSize * (logoSizePercent / 100));
            const logoX = Math.round((qrSize - logoSize) / 2);
            const logoY = Math.round(extraTop + (qrSize - logoSize) / 2);
            const badgePadding = Math.round(logoSize * 0.14);
            const badgeSize = logoSize + badgePadding * 2;
            const badgeX = logoX - badgePadding;
            const badgeY = logoY - badgePadding;

            ctx.save();

            // Draw Badge Background
            ctx.fillStyle = isTransparentBg ? '#ffffff' : bgColor;
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = Math.round(badgePadding * 1.2);
            ctx.shadowOffsetY = Math.round(badgePadding * 0.4);

            if (logoBadgeShape === 'circle') {
              ctx.beginPath();
              ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();

              // Clip Image inside Circle
              ctx.save();
              ctx.beginPath();
              ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
              ctx.restore();
            } else {
              // Rounded Rect
              const r = Math.round(badgeSize * 0.22);
              ctx.beginPath();
              ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, r);
              ctx.fill();
              ctx.restore();

              // Clip Image inside Rounded Rect
              ctx.save();
              const imgR = Math.round(logoSize * 0.2);
              ctx.beginPath();
              ctx.roundRect(logoX, logoY, logoSize, logoSize, imgR);
              ctx.clip();
              ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
              ctx.restore();
            }
            resolve();
          };
          img.onerror = () => resolve();
          img.src = logoPreview;
        });
      }

      // Draw Call-to-action Frame Banners if enabled
      if (frameStyle === 'bottom-banner' && frameText) {
        ctx.fillStyle = fgColor;
        ctx.beginPath();
        const bannerH = extraBottom * 0.75;
        const bannerW = qrSize * 0.88;
        const bannerX = (qrSize - bannerW) / 2;
        const bannerY = qrSize + extraTop + (extraBottom - bannerH) / 2;
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, bannerH / 2);
        ctx.fill();

        ctx.fillStyle = isTransparentBg ? '#ffffff' : bgColor;
        const fontSize = Math.round(bannerH * 0.45);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(frameText, qrSize / 2, bannerY + bannerH / 2);
      } else if (frameStyle === 'top-banner' && frameText) {
        ctx.fillStyle = fgColor;
        ctx.beginPath();
        const bannerH = extraTop * 0.75;
        const bannerW = qrSize * 0.88;
        const bannerX = (qrSize - bannerW) / 2;
        const bannerY = (extraTop - bannerH) / 2;
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, bannerH / 2);
        ctx.fill();

        ctx.fillStyle = isTransparentBg ? '#ffffff' : bgColor;
        const fontSize = Math.round(bannerH * 0.45);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(frameText, qrSize / 2, bannerY + bannerH / 2);
      } else if (frameStyle === 'card') {
        // Top header label
        ctx.fillStyle = fgColor;
        ctx.font = `bold ${Math.round(extraTop * 0.35)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(appName || 'Appifya PWA', qrSize / 2, extraTop / 2);

        // Bottom CTA button
        const bannerH = extraBottom * 0.55;
        const bannerW = qrSize * 0.85;
        const bannerX = (qrSize - bannerW) / 2;
        const bannerY = qrSize + extraTop + (extraBottom - bannerH) / 2;
        ctx.beginPath();
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, bannerH / 2);
        ctx.fill();

        ctx.fillStyle = isTransparentBg ? '#ffffff' : bgColor;
        ctx.font = `bold ${Math.round(bannerH * 0.45)}px sans-serif`;
        ctx.fillText(frameText, qrSize / 2, bannerY + bannerH / 2);
      }
    } catch (err) {
      console.error('QR Render error:', err);
    }
  }, [getEncodedText, resolution, margin, fgColor, bgColor, isTransparentBg, errorCorrection, frameStyle, frameText, appName, logoPreview, logoSizePercent, logoBadgeShape]);

  // Redraw when parameters change
  useEffect(() => {
    renderQrCode();
  }, [renderQrCode]);

  // Download High-Res PNG
  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `app-qr-${Date.now()}.png`;
    a.href = url;
    a.click();
    setStatusMsg({
      type: 'success',
      text: lang === 'ar' ? 'تم تنزيل رمز QR بصيغة PNG عالية الدقة!' : 'High-resolution PNG downloaded successfully!',
    });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Download Scalable Vector SVG
  const handleDownloadSvg = async () => {
    try {
      const encodedText = getEncodedText();
      const svgString = await QRCode.toString(encodedText, {
        type: 'svg',
        margin,
        color: {
          dark: fgColor,
          light: isTransparentBg ? '#00000000' : bgColor,
        },
        errorCorrectionLevel: errorCorrection,
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `app-qr-${Date.now()}.svg`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);

      setStatusMsg({
        type: 'success',
        text: lang === 'ar' ? 'تم تنزيل ملف SVG المتجهي بنجاح!' : 'Vector SVG downloaded successfully!',
      });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error('SVG download error:', err);
    }
  };

  // Copy PNG to Clipboard
  const handleCopyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  };

  // Print Tabletop Standee Poster
  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const printableHtml = `
      <!DOCTYPE html>
      <html dir="${isRtl ? 'rtl' : 'ltr'}">
      <head>
        <title>${appName || 'Appifya'} - QR Code Standee</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #ffffff;
            color: #0f172a;
          }
          .standee-card {
            border: 2px solid #e2e8f0;
            border-radius: 28px;
            padding: 48px;
            text-align: center;
            max-width: 480px;
            width: 100%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          }
          .title {
            font-size: 28px;
            font-weight: 900;
            margin: 0 0 10px 0;
            color: #0f172a;
          }
          .subtitle {
            font-size: 14px;
            color: #64748b;
            margin: 0 0 32px 0;
            line-height: 1.5;
          }
          .qr-img {
            max-width: 320px;
            width: 100%;
            height: auto;
            border-radius: 16px;
            margin: 0 auto 32px auto;
            display: block;
          }
          .instructions {
            border-top: 1px dashed #cbd5e1;
            padding-top: 24px;
            font-size: 13px;
            font-weight: 700;
            color: #475569;
          }
          @media print {
            body { padding: 0; }
            .standee-card { border: none; box-shadow: none; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="standee-card">
          <h1 class="title">${appName || 'My PWA Store'}</h1>
          <p class="subtitle">${lang === 'ar' ? 'افتح كاميرا الهاتف وامسح الرمز لتثبيت وتشغيل التطبيق فوراً' : 'Scan with your smartphone camera to launch & install the app instantly'}</p>
          <img src="${dataUrl}" class="qr-img" alt="QR Code" />
          <div class="instructions">
            ✨ ${lang === 'ar' ? 'بدون تحميل من المتجر · سريع وآمن ومجاني' : 'No App Store download needed · Fast, secure & instant'}
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(printableHtml);
    printWin.document.close();
  };

  return (
    <main className="site-main flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Breadcrumb Header */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-slate-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-white transition-colors">
          {lang === 'ar' ? 'الرئيسية' : lang === 'fr' ? 'Accueil' : 'Home'}
        </Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-white transition-colors">
          {lang === 'ar' ? 'الأدوات' : lang === 'fr' ? 'Outils' : 'Tools'}
        </Link>
        <span>/</span>
        <span className="text-indigo-400 font-semibold">
          {lang === 'ar' ? 'مولّد رمز QR للتطبيق' : lang === 'fr' ? 'Générateur de QR Code' : 'App QR Code Generator'}
        </span>
      </nav>

      {/* Main Title & Hero Banner */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3.5 py-1 text-[11px] font-bold text-cyan-300 mb-3">
            <QrCode className="h-3.5 w-3.5" />
            <span>
              {lang === 'ar' ? 'أداة مجانية 100% · عالي الدقة للطباعة · شعار مخصص' : '100% Free · High-Res Print Ready · Custom Logo'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {lang === 'ar' ? 'مولّد رمز QR الاحترافي للتطبيقات' : lang === 'fr' ? 'Générateur de QR Code pour Applications' : 'Professional App QR Code Generator'}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            {lang === 'ar'
              ? 'أنشئ رمز استجابة سريعة فائق الدقة والوضوح لتطبيقك أو متجرك. أضف شعار علامتك في المنتصف، نسّق الألوان، اختر إطار الدعوة للتثبيت، ونزّل تصميماً جاهزاً للملصقات والطباعة.'
              : lang === 'fr'
                ? 'Générez des QR codes haute résolution pour votre PWA ou site web. Intégrez votre logo, personnalisez les couleurs de votre marque et téléchargez un format prêt pour l’impression.'
                : 'Create high-resolution custom QR codes for your PWA, store, or mobile app. Embed your center app logo, customize brand colors, add call-to-action frames, and export print-ready PNG & SVG.'}
          </p>
        </div>
      </div>

      {/* Feedback Toast */}
      {statusMsg && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border border-red-500/30 text-red-300'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Interactive Tool Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Content Type Selector */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-[10px]">1</span>
              <span>{lang === 'ar' ? 'نوع المحتوى والرابط' : lang === 'fr' ? 'Type de contenu et lien' : 'Content Type & Destination'}</span>
            </h2>

            {/* Type Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
              {[
                { id: 'pwa', label: lang === 'ar' ? 'تطبيق PWA' : 'PWA App', icon: Smartphone },
                { id: 'url', label: lang === 'ar' ? 'رابط URL' : 'Website URL', icon: Globe },
                { id: 'wifi', label: lang === 'ar' ? 'واي فاي' : 'Wi-Fi', icon: Wifi },
                { id: 'vcard', label: lang === 'ar' ? 'بطاقة عمل' : 'vCard Contact', icon: User },
                { id: 'text', label: lang === 'ar' ? 'نص حر' : 'Plain Text', icon: Type },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setContentType(id as ContentType)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    contentType === id
                      ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-md shadow-indigo-500/15'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Content Form Fields */}
            {contentType === 'pwa' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {lang === 'ar' ? 'رابط تطبيق الويب (PWA URL)' : 'PWA Destination URL'}
                  </label>
                  <div className="relative">
                    <Globe className="absolute top-3.5 start-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      type="url"
                      value={pwaUrl}
                      onChange={(e) => setPwaUrl(e.target.value)}
                      placeholder="https://my-store.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-10 pe-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {lang === 'ar' ? 'اسم التطبيق أو المتجر (للافتة المطبوعة)' : 'App or Store Name'}
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="My PWA Store"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* UTM Campaign Tracking Builder */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{lang === 'ar' ? 'تتبع الزيارات عبر معلمات UTM' : 'Campaign UTM Tracking'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnableUtm(!enableUtm)}
                      className={`h-5 w-9 rounded-full transition-colors relative cursor-pointer ${
                        enableUtm ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                          enableUtm ? (isRtl ? '-translate-x-4' : 'translate-x-4') : (isRtl ? 'right-0.5' : 'left-0.5')
                        }`}
                      />
                    </button>
                  </div>

                  {enableUtm && (
                    <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">utm_source</label>
                        <input
                          type="text"
                          value={utmSource}
                          onChange={(e) => setUtmSource(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">utm_medium</label>
                        <input
                          type="text"
                          value={utmMedium}
                          onChange={(e) => setUtmMedium(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">utm_campaign</label>
                        <input
                          type="text"
                          value={utmCampaign}
                          onChange={(e) => setUtmCampaign(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {contentType === 'url' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === 'ar' ? 'الرابط المباشر' : 'Destination URL'}
                </label>
                <div className="relative">
                  <Globe className="absolute top-3.5 start-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-10 pe-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {contentType === 'wifi' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">SSID Network Name</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MyStore_Guest"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Encryption Type</label>
                  <select
                    value={wifiEncryption}
                    onChange={(e) => setWifiEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3 (Recommended)</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">No Password (Open)</option>
                  </select>
                </div>
              </div>
            )}

            {contentType === 'vcard' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={vcardName}
                      onChange={(e) => setVcardName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Role</label>
                    <input
                      type="text"
                      value={vcardCompany}
                      onChange={(e) => setVcardCompany(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={vcardWebsite}
                    onChange={(e) => setVcardWebsite(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {contentType === 'text' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === 'ar' ? 'النص المشفر' : 'Plain Text Message'}
                </label>
                <textarea
                  rows={3}
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Step 2: Brand Colors & Visual Appearance */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-[10px]">2</span>
              <span>{lang === 'ar' ? 'هوية العلامة والألوان' : 'Brand Colors & Appearance'}</span>
            </h2>

            {/* Quick Color Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                {lang === 'ar' ? 'ألوان سريعة مقترحة' : 'Quick Color Presets'}
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setFgColor(color.hex)}
                    title={color.name}
                    className={`h-7 w-7 rounded-lg border transition-transform hover:scale-110 cursor-pointer flex items-center justify-center ${
                      fgColor === color.hex ? 'ring-2 ring-indigo-400 scale-110 border-white' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {fgColor === color.hex && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === 'ar' ? 'لون النقاط (Foreground)' : 'Foreground Color'}
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-8 w-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none uppercase"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === 'ar' ? 'لون الخلفية (Background)' : 'Background Color'}
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                  <input
                    type="color"
                    value={bgColor}
                    disabled={isTransparentBg}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-8 w-8 rounded-lg cursor-pointer bg-transparent border-0 disabled:opacity-40"
                  />
                  <input
                    type="text"
                    value={isTransparentBg ? 'Transparent' : bgColor}
                    disabled={isTransparentBg}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none uppercase disabled:text-slate-500"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setIsTransparentBg(!isTransparentBg)}
                    className={`text-[11px] px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                      isTransparentBg ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'ar' ? 'شفاف' : 'Clear'}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Correction & Margin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === 'ar' ? 'مستوى تصحيح الخطأ' : 'Error Correction Level'}
                </label>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as ErrorCorrectionLevel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="L">Level L (7% Recovery - Lowest)</option>
                  <option value="M">Level M (15% Recovery - Standard)</option>
                  <option value="Q">Level Q (25% Recovery - High)</option>
                  <option value="H">Level H (30% Recovery - Recommended for Logos)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === 'ar' ? 'الهامش الأبيض المحيط' : 'Quiet Zone Margin'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="text-xs font-mono text-slate-300 w-6 text-center">{margin}x</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Logo & Frame Customization */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-[10px]">3</span>
              <span>{lang === 'ar' ? 'شعار التطبيق والإطار الإعلاني' : 'App Logo & Frame Banner'}</span>
            </h2>

            {/* Center Logo Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                {lang === 'ar' ? 'شعار التطبيق في المركز (Center Logo)' : 'Center App Icon / Logo'}
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-indigo-500 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="h-4 w-4 text-indigo-400" />
                  <span>{logoPreview ? (lang === 'ar' ? 'تغيير الشعار' : 'Change Logo') : (lang === 'ar' ? 'رفع أيقونة التطبيق' : 'Upload App Icon')}</span>
                </button>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => setLogoPreview(null)}
                    className="px-3 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
                  >
                    {lang === 'ar' ? 'إزالة الشعار' : 'Remove'}
                  </button>
                )}

                {logoPreview && (
                  <div className="flex items-center gap-2 border border-slate-800 bg-slate-950 rounded-xl px-3 py-1.5">
                    <img src={logoPreview} alt="App logo preview" className="h-6 w-6 rounded object-cover" />
                    <span className="text-[11px] text-emerald-400 font-semibold">{lang === 'ar' ? 'الشعار مدمج' : 'Logo Active'}</span>
                  </div>
                )}
              </div>

              {/* Logo shape and size controls */}
              {logoPreview && (
                <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      {lang === 'ar' ? 'حجم الشعار النسبي' : 'Logo Size (% of QR)'}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={15}
                        max={30}
                        value={logoSizePercent}
                        onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                        className="flex-1 accent-indigo-500"
                      />
                      <span className="text-xs font-mono text-slate-300 w-8">{logoSizePercent}%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      {lang === 'ar' ? 'شكل إطار الشعار' : 'Logo Badge Shape'}
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setLogoBadgeShape('rounded')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                          logoBadgeShape === 'rounded' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-800 text-slate-400'
                        }`}
                      >
                        {lang === 'ar' ? 'مربع دائري' : 'Rounded'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogoBadgeShape('circle')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                          logoBadgeShape === 'circle' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-800 text-slate-400'
                        }`}
                      >
                        {lang === 'ar' ? 'دائري' : 'Circle'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Frame Banner Style */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                {lang === 'ar' ? 'إطار الدعوة للتثبيت (Scan Frame)' : 'Call-to-Action Frame'}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {[
                  { id: 'none', label: lang === 'ar' ? 'بدون إطار' : 'None' },
                  { id: 'bottom-banner', label: lang === 'ar' ? 'شريط سفلي' : 'Bottom Banner' },
                  { id: 'top-banner', label: lang === 'ar' ? 'شريط علوي' : 'Top Banner' },
                  { id: 'card', label: lang === 'ar' ? 'بطاقة ستاند' : 'Stand Card' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFrameStyle(id as FrameStyle)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      frameStyle === id
                        ? 'border-indigo-500 bg-indigo-500/15 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {frameStyle !== 'none' && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {lang === 'ar' ? 'نص الدعوة للإجراء (Call to action)' : 'Banner Text'}
                  </label>
                  <input
                    type="text"
                    value={frameText}
                    onChange={(e) => setFrameText(e.target.value)}
                    placeholder="Scan to Install App"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Sticky Preview & Download Hub (5 Cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="qr-preview-card rounded-3xl border border-indigo-500/25 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/95 p-6 shadow-2xl backdrop-blur relative overflow-hidden">
            {/* Ambient Corner Glow */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-indigo-500/15 blur-3xl" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{lang === 'ar' ? 'معاينة مباشرة فورية' : 'Live Preview'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                {resolution}×{resolution}px
              </span>
            </div>

            {/* Canvas Container */}
            <div className="qr-canvas-holder relative mx-auto max-w-[320px] aspect-square rounded-2xl p-4 bg-white/5 border border-white/10 flex items-center justify-center shadow-inner overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-h-full max-w-full object-contain rounded-xl drop-shadow-lg"
              />
            </div>

            {/* Download Resolution Selector */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                {lang === 'ar' ? 'دقة التصدير للطباعة' : 'Export Resolution'}
              </label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { size: 512, label: '512px (Web)' },
                  { size: 1024, label: '1024px (HD)' },
                  { size: 2048, label: '2048px (Print 300DPI)' },
                ].map(({ size, label }) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setResolution(size as 512 | 1024 | 2048)}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      resolution === size
                        ? 'border-indigo-500 bg-indigo-500/20 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Main Download CTA Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{lang === 'ar' ? 'تنزيل بصيغة PNG عالية الدقة' : 'Download High-Res PNG'}</span>
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadSvg}
                    title="Download Scalable Vector Graphics"
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileCode className="h-3.5 w-3.5 text-purple-400" />
                    <span>SVG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-indigo-400" />}
                    <span>{copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    title="Print Table Standee"
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{lang === 'ar' ? 'طباعة' : 'Print'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Helper Tip */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <Smartphone className="h-4 w-4" />
              <span>{lang === 'ar' ? 'نصيحة لتوزيع تطبيقات PWA' : 'PWA Distribution Pro-Tip'}</span>
            </div>
            <p className="leading-relaxed">
              {lang === 'ar'
                ? 'اطبع هذا الرمز على فواتير المشتريات، كروت الطاولات، أو واجهة متجرك. عند مسحه بكاميرا الهاتف، سيُفتح موقعك فوراً مع ظهور إشعار التثبيت على الشاشة الرئيسية بلمسة واحدة.'
                : 'Display this QR code on receipts, table tents, or packaging. When customers scan it with their phone camera, your PWA opens immediately with a 1-tap install prompt.'}
            </p>
          </div>
        </div>
      </div>

      {/* SEO Deep Educational & Guide Section */}
      <section className="mt-24 space-y-12 border-t border-slate-800 pt-16" aria-labelledby="seo-guide-title">
        <div className="max-w-3xl">
          <h2 id="seo-guide-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {lang === 'ar'
              ? 'دليل استخدام رموز QR لزيادة تثبيتات تطبيقات الويب التقدمية (PWA)'
              : 'The Ultimate Guide to QR Codes for Progressive Web App Growth'}
          </h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            {lang === 'ar'
              ? 'تعتبر رموز الاستجابة السريعة (QR Codes) الجسر الأقوى بين الواقع الفعلي والعالم الرقمي، حيث تتيح لعملائك الدخول لتطبيقك وتثبيته دون الحاجة للبحث في متجر التطبيقات.'
              : 'QR codes represent the most seamless bridge between physical environments and digital apps, enabling customers to launch and install your PWA with zero store search friction.'}
          </p>
        </div>

        {/* 3 Pillar Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 mb-4">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              {lang === 'ar' ? 'تثبيت فوري دون متجر تطبيقات' : 'Store-Free 1-Click Install'}
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              {lang === 'ar'
                ? 'تخطي حواجز متجر Google Play وApp Store. بمجرد المسح بكاميرا الهاتف، يتعرف المتصفح على ملف manifest.json ويعرض تثبيت التطبيق مباشرة على شاشة الهاتف.'
                : 'Bypass app store gatekeepers. Once scanned, the phone browser detects the web manifest and prompts the user to add the app directly to their home screen.'}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-4">
              <Palette className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              {lang === 'ar' ? 'تصميم مخصص يعزز ثقة العميل' : 'Branded Trust & Recognition'}
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              {lang === 'ar'
                ? 'الرموز التقليدية بالأبيض والأسود تبدو مجهولة. وضع شعار تطبيقك في المنتصف مع ألوان هويتك يرفع معدل المسح بنسبة تصل إلى 40% ويكسب ثقة الزائر فوراً.'
                : 'Generic black-and-white QR codes feel untrustworthy. Adding your brand colors and center app icon boosts scan conversion rates by up to 40%.'}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400 mb-4">
              <Printer className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              {lang === 'ar' ? 'جاهز للطباعة بدقة 300 DPI وSVG' : 'Print-Ready Vector SVG & 300 DPI'}
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              {lang === 'ar'
                ? 'لا تقلق بشأن تشويش البكسلات على المطبوعات الكبيرة. صدّر بدقة 2048px أو كملف متجهي SVG لا يتأثر بالتكبير على اللوحات الإعلانية والملصقات.'
                : 'Eliminate pixel blur on physical banners and flyers. Export at 2048px bitmap resolution or infinite vector SVG for crisp printing at any scale.'}
            </p>
          </article>
        </div>

        {/* FAQ Accordion */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-10">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="h-4 w-4" />
            <span>{lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-6">
            {lang === 'ar' ? 'كل ما تود معرفته عن رموز QR لتطبيقات PWA' : 'Everything You Need to Know About App QR Codes'}
          </h2>

          <div className="divide-y divide-slate-800 space-y-4">
            {[
              {
                q: lang === 'ar' ? 'هل يحتاج العميل لتطبيق ماسح ضوئي لقراءة رمز QR؟' : 'Do customers need a special barcode scanner app?',
                a: lang === 'ar' ? 'لا على الإطلاق. تدعم جميع هواتف iPhone وAndroid الحديثة مسح رموز QR مباشرة من خلال تطبيق الكاميرا الافتراضي دون تنزيل أي برامج إضافية.' : 'Not at all. All modern iOS and Android smartphones have built-in QR scanning directly in their native camera apps.',
              },
              {
                q: lang === 'ar' ? 'هل تنتهي صلاحية هذا الرمز أو هل هناك حد أقصى للمسحات؟' : 'Does this QR code expire or have monthly scan limits?',
                a: lang === 'ar' ? 'الرمز ثابت (Static QR Code) ويخزن الرابط مباشرة داخل الصورة، لذا فهو صالح للأبد دون أي تاريخ انتهاء وبعدد مسحات غير محدود مجاناً.' : 'No. This is a static QR code that directly encodes your destination URL. It never expires and has unlimited free scans forever.',
              },
              {
                q: lang === 'ar' ? 'هل يؤثر وضع الشعار في المنتصف على قابلية المسح؟' : 'Does placing a logo in the center affect scannability?',
                a: lang === 'ar' ? 'يقوم المولّد تلقائياً بضبط مستوى تصحيح الخطأ إلى المستوى الأعلى (Level H - 30%) مع إضافة إطار عازل خلف الشعار، مما يضمن قراءة الرمز بنسبة 100% حتى مع تغطية الشعار لجزء من المركز.' : 'Our generator automatically sets error correction to Level H (30%) and applies a clean mask behind the logo, ensuring 100% reliable scanability across all phone cameras.',
              },
              {
                q: lang === 'ar' ? 'ما هو الحجم الأدنى الموصى به لطباعة رمز QR؟' : 'What is the recommended minimum print size for QR codes?',
                a: lang === 'ar' ? 'للمسح عن قرب (كروت، فواتير) نوصي بحجم لا يقل عن 2 × 2 سم. للواجهات وطاولات المقاهي نوصي بحجم 5 × 5 سم إلى 8 × 8 سم مع ترك مسافة أمان بيضاء حول الرمز.' : 'For close-up scanning (business cards, receipts), we recommend at least 2 × 2 cm. For table tents and posters, 5 × 5 cm or larger is recommended.',
              },
            ].map((faq, i) => (
              <div key={i} className="pt-4">
                <h3 className="text-sm font-bold text-white mb-1.5">{faq.q}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA to PWA Builder */}
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-950/80 p-8 text-center space-y-4">
          <h2 className="text-2xl font-black text-white">
            {lang === 'ar' ? 'لم تقم بتحويل موقعك إلى تطبيق PWA بعد؟' : 'Haven’t converted your store to a PWA yet?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            {lang === 'ar'
              ? 'حوّل أي متجر أو موقع إلكتروني إلى تطبيق هاتف كامل بضغطة واحدة، وشاركه مع زوارك عبر هذا الرمز فوراً.'
              : 'Transform your website or store into an installable mobile app in one click with Appifya, then share it with your audience using your custom QR code.'}
          </p>
          <div className="pt-2">
            <Link
              href="/#builder"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/25 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>{lang === 'ar' ? 'ابدأ بناء تطبيقك مجاناً' : 'Build Your App for Free'}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
