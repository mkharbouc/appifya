'use client';

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../lib/i18n';
import {
  Smartphone,
  Download,
  Upload,
  Sparkles,
  Palette,
  Type,
  Plus,
  Copy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FolderArchive,
  ArrowRight,
} from 'lucide-react';

// ─── Preset Resolutions ───
interface SizePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  aspect: string;
  store: 'google' | 'apple' | 'universal';
}

const SIZE_PRESETS: SizePreset[] = [
  {
    id: 'google-phone-modern',
    name: 'Google Play Phone (Modern)',
    width: 1080,
    height: 2400,
    aspect: '9:20',
    store: 'google',
  },
  {
    id: 'google-phone-16-9',
    name: 'Google Play Phone (Classic)',
    width: 1080,
    height: 1920,
    aspect: '9:16',
    store: 'google',
  },
  {
    id: 'apple-iphone-67',
    name: 'App Store 6.7" (iPhone 15/16 Pro Max)',
    width: 1290,
    height: 2796,
    aspect: '19.5:9',
    store: 'apple',
  },
  {
    id: 'apple-iphone-65',
    name: 'App Store 6.5" (iPhone 11-14 Pro Max)',
    width: 1242,
    height: 2688,
    aspect: '19.5:9',
    store: 'apple',
  },
];

// ─── Color Gradients ───
const GRADIENT_PRESETS = [
  { id: 'electric-indigo', name: 'Electric Indigo', from: '#4f46e5', to: '#7c3aed' },
  { id: 'cyber-emerald', name: 'Cyber Emerald', from: '#059669', to: '#0d9488' },
  { id: 'midnight-obsidian', name: 'Midnight Obsidian', from: '#090d16', to: '#1e293b' },
  { id: 'sunset-rose', name: 'Sunset Rose', from: '#e11d48', to: '#f59e0b' },
  { id: 'ocean-cyan', name: 'Ocean Cyan', from: '#0284c7', to: '#06b6d4' },
  { id: 'neon-violet', name: 'Neon Violet', from: '#9333ea', to: '#db2777' },
  { id: 'carbon-dark', name: 'Carbon Pure Dark', from: '#18181b', to: '#09090b' },
  { id: 'clean-slate', name: 'Modern Titanium', from: '#334155', to: '#475569' },
];

// ─── Slide Data Model ───
interface Slide {
  id: string;
  headline: string;
  subtitle: string;
  badge: string;
  showBadge: boolean;
  imageSrc: string | null;
  bgGradientId: string;
  customBgFrom: string;
  customBgTo: string;
  textColor: string;
  deviceFrame: 'pixel' | 'iphone' | 'minimal';
  devicePosition: 'bottom-cut' | 'bottom-fit' | 'centered';
  deviceTheme: 'dark' | 'silver';
  textPosition: 'top' | 'bottom';
  showShadow: boolean;
}

// Default SVG placeholder screenshots
const SAMPLE_SCREENSHOTS = [
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="2340" viewBox="0 0 1080 2340" fill="%230f172a"><rect width="1080" height="2340" fill="%23090d16"/><rect x="80" y="140" width="920" height="120" rx="24" fill="%231e293b"/><text x="140" y="215" fill="%2394a3b8" font-family="sans-serif" font-size="42">🔍 Search items, stores, deals...</text><rect x="80" y="320" width="920" height="520" rx="36" fill="%234f46e5"/><text x="140" y="520" fill="%23ffffff" font-family="sans-serif" font-size="72" font-weight="bold">Mega Sale 50% Off</text><text x="140" y="600" fill="%23c7d2fe" font-family="sans-serif" font-size="38">Exclusive mobile app rewards</text><rect x="140" y="680" width="340" height="90" rx="20" fill="%23ffffff"/><text x="210" y="740" fill="%234f46e5" font-family="sans-serif" font-size="36" font-weight="bold">Shop Now</text><text x="80" y="940" fill="%23ffffff" font-family="sans-serif" font-size="52" font-weight="bold">Trending Collections</text><rect x="80" y="1000" width="440" height="580" rx="32" fill="%231e293b"/><rect x="560" y="1000" width="440" height="580" rx="32" fill="%231e293b"/><rect x="120" y="1040" width="360" height="340" rx="24" fill="%23334155"/><rect x="600" y="1040" width="360" height="340" rx="24" fill="%23334155"/><text x="120" y="1440" fill="%23ffffff" font-family="sans-serif" font-size="36" font-weight="bold">Wireless Earbuds</text><text x="120" y="1510" fill="%2334d399" font-family="sans-serif" font-size="38" font-weight="bold">$79.99</text><text x="600" y="1440" fill="%23ffffff" font-family="sans-serif" font-size="36" font-weight="bold">Smart Watch Ultra</text><text x="600" y="1510" fill="%2334d399" font-family="sans-serif" font-size="38" font-weight="bold">$199.00</text></svg>`,
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="2340" viewBox="0 0 1080 2340" fill="%230f172a"><rect width="1080" height="2340" fill="%230b1329"/><rect x="80" y="160" width="920" height="560" rx="40" fill="%23059669"/><text x="140" y="320" fill="%23d1fae5" font-family="sans-serif" font-size="44">Total Balance</text><text x="140" y="440" fill="%23ffffff" font-family="sans-serif" font-size="108" font-weight="bold">$18,450.80</text><text x="140" y="540" fill="%23a7f3d0" font-family="sans-serif" font-size="40">▲ +14.8% this month</text><text x="80" y="820" fill="%23ffffff" font-family="sans-serif" font-size="52" font-weight="bold">Quick Actions</text><rect x="80" y="880" width="200" height="200" rx="32" fill="%231e293b"/><rect x="320" y="880" width="200" height="200" rx="32" fill="%231e293b"/><rect x="560" y="880" width="200" height="200" rx="32" fill="%231e293b"/><rect x="800" y="880" width="200" height="200" rx="32" fill="%231e293b"/><text x="80" y="1180" fill="%23ffffff" font-family="sans-serif" font-size="52" font-weight="bold">Recent Transactions</text><rect x="80" y="1240" width="920" height="200" rx="28" fill="%231e293b"/><circle cx="160" cy="1340" r="50" fill="%233b82f6"/><text x="240" y="1335" fill="%23ffffff" font-family="sans-serif" font-size="42" font-weight="bold">Apple Store</text><text x="240" y="1390" fill="%2394a3b8" font-family="sans-serif" font-size="32">Electronics</text><text x="820" y="1350" fill="%23ffffff" font-family="sans-serif" font-size="46" font-weight="bold">-$129</text></svg>`,
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="2340" viewBox="0 0 1080 2340" fill="%230f172a"><rect width="1080" height="2340" fill="%2318181b"/><circle cx="540" cy="460" r="160" fill="%23f43f5e"/><text x="540" y="740" fill="%23ffffff" font-family="sans-serif" font-size="64" font-weight="bold" text-anchor="middle">Order Confirmed!</text><text x="540" y="830" fill="%23a1a1aa" font-family="sans-serif" font-size="40" text-anchor="middle">Estimated delivery: 25-35 mins</text><rect x="80" y="980" width="920" height="640" rx="36" fill="%2327272a"/><circle cx="180" cy="1100" r="40" fill="%2310b981"/><line x1="180" y1="1140" x2="180" y2="1480" stroke="%233f3f46" stroke-width="12"/><text x="260" y="1115" fill="%23ffffff" font-family="sans-serif" font-size="42" font-weight="bold">Restaurant Preparing</text><text x="260" y="1170" fill="%23a1a1aa" font-family="sans-serif" font-size="32">Fresh organic ingredients</text><circle cx="180" cy="1320" r="40" fill="%2310b981"/><text x="260" y="1335" fill="%23ffffff" font-family="sans-serif" font-size="42" font-weight="bold">Courier on the way</text><text x="260" y="1390" fill="%23a1a1aa" font-family="sans-serif" font-size="32">Live GPS tracking active</text></svg>`,
];

export default function AppMockupFramerClient() {
  const { lang } = useLanguage();
  const fileUploadId = useId();

  // Selected Resolution
  const [selectedSize, setSelectedSize] = useState<SizePreset>(SIZE_PRESETS[0]);

  // Slides State
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 'slide-1',
      headline: lang === 'ar' ? 'اكتشف وتسوّق بسهولة' : 'Discover & Shop Seamlessly',
      subtitle:
        lang === 'ar'
          ? 'أكثر من 50 ألف منتج مع عروض حصرية وتوصيل فوري'
          : 'Browse thousands of curated items with instant delivery',
      badge: lang === 'ar' ? '★ تقييم 4.9' : '★ 4.9 RATED APP',
      showBadge: true,
      imageSrc: SAMPLE_SCREENSHOTS[0],
      bgGradientId: 'electric-indigo',
      customBgFrom: '#4f46e5',
      customBgTo: '#7c3aed',
      textColor: '#ffffff',
      deviceFrame: 'pixel',
      devicePosition: 'bottom-cut',
      deviceTheme: 'dark',
      textPosition: 'top',
      showShadow: true,
    },
    {
      id: 'slide-2',
      headline: lang === 'ar' ? 'لوحة تحكم وتحليلات ذكية' : 'Smart Analytics & Insights',
      subtitle:
        lang === 'ar'
          ? 'تتبع طلباتك وإحصائياتك المالية أولاً بأول بدقة'
          : 'Real-time financial tracking and growth performance metrics',
      badge: lang === 'ar' ? 'تحديث جديد' : 'NEW FEATURE',
      showBadge: true,
      imageSrc: SAMPLE_SCREENSHOTS[1],
      bgGradientId: 'cyber-emerald',
      customBgFrom: '#059669',
      customBgTo: '#0d9488',
      textColor: '#ffffff',
      deviceFrame: 'pixel',
      devicePosition: 'bottom-cut',
      deviceTheme: 'dark',
      textPosition: 'top',
      showShadow: true,
    },
    {
      id: 'slide-3',
      headline: lang === 'ar' ? 'توصيل سريع حتى باب بيتك' : 'Ultra Fast Order Tracking',
      subtitle:
        lang === 'ar'
          ? 'متابعة مباشرة عبر الخريطة مع إشعارات لحظية'
          : 'Live GPS location with instant courier notifications',
      badge: lang === 'ar' ? 'سرعة فائقة' : 'LIGHTNING FAST',
      showBadge: true,
      imageSrc: SAMPLE_SCREENSHOTS[2],
      bgGradientId: 'sunset-rose',
      customBgFrom: '#e11d48',
      customBgTo: '#f59e0b',
      textColor: '#ffffff',
      deviceFrame: 'pixel',
      devicePosition: 'bottom-cut',
      deviceTheme: 'dark',
      textPosition: 'top',
      showShadow: true,
    },
  ]);

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeSlide = slides[activeSlideIndex] || slides[0];

  // Update active slide
  const updateActiveSlide = (patch: Partial<Slide>) => {
    setSlides((prev) => {
      const copy = [...prev];
      copy[activeSlideIndex] = { ...copy[activeSlideIndex], ...patch };
      return copy;
    });
  };

  // Add new slide
  const handleAddSlide = () => {
    if (slides.length >= 8) return;
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      headline: lang === 'ar' ? 'عنوان الشريحة الجديد' : 'New Feature Title',
      subtitle:
        lang === 'ar'
          ? 'أضف وصفاً جذاباً لشرح ميزة التطبيق'
          : 'Add an engaging description highlight for this screen',
      badge: lang === 'ar' ? 'ميزة حصرية' : 'EXCLUSIVE',
      showBadge: false,
      imageSrc: SAMPLE_SCREENSHOTS[0],
      bgGradientId: 'midnight-obsidian',
      customBgFrom: '#090d16',
      customBgTo: '#1e293b',
      textColor: '#ffffff',
      deviceFrame: 'pixel',
      devicePosition: 'bottom-cut',
      deviceTheme: 'dark',
      textPosition: 'top',
      showShadow: true,
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  // Duplicate slide
  const handleDuplicateSlide = () => {
    if (slides.length >= 8) return;
    const dup: Slide = {
      ...activeSlide,
      id: `slide-${Date.now()}`,
    };
    const newSlides = [...slides];
    newSlides.splice(activeSlideIndex + 1, 0, dup);
    setSlides(newSlides);
    setActiveSlideIndex(activeSlideIndex + 1);
  };

  // Delete slide
  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const filtered = slides.filter((_, i) => i !== index);
    setSlides(filtered);
    if (activeSlideIndex >= filtered.length) {
      setActiveSlideIndex(filtered.length - 1);
    }
  };

  // Apply current background to all slides
  const handleApplyBgToAll = () => {
    setSlides((prev) =>
      prev.map((s) => ({
        ...s,
        bgGradientId: activeSlide.bgGradientId,
        customBgFrom: activeSlide.customBgFrom,
        customBgTo: activeSlide.customBgTo,
      }))
    );
  };

  // Apply device frame to all slides
  const handleApplyFrameToAll = () => {
    setSlides((prev) =>
      prev.map((s) => ({
        ...s,
        deviceFrame: activeSlide.deviceFrame,
        devicePosition: activeSlide.devicePosition,
        deviceTheme: activeSlide.deviceTheme,
      }))
    );
  };

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert(lang === 'ar' ? 'حجم الصورة يجب أن يكون أقل من 8 ميجابايت' : 'Image must be under 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        updateActiveSlide({ imageSrc: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── Drawing helper functions ───
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Draw wrap text helper
  const drawWrappedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
  };

  // ─── Render Canvas Pipeline ───
  const renderSlideToCanvas = useCallback(
    async (
      canvas: HTMLCanvasElement,
      slide: Slide,
      targetWidth: number,
      targetHeight: number
    ): Promise<void> => {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw Background Gradient
      let fromColor = slide.customBgFrom;
      let toColor = slide.customBgTo;
      const preset = GRADIENT_PRESETS.find((p) => p.id === slide.bgGradientId);
      if (preset) {
        fromColor = preset.from;
        toColor = preset.to;
      }

      const grad = ctx.createLinearGradient(0, 0, targetWidth * 0.8, targetHeight);
      grad.addColorStop(0, fromColor);
      grad.addColorStop(1, toColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Subtle ambient mesh glow circles
      ctx.save();
      const glowGrad = ctx.createRadialGradient(
        targetWidth * 0.5,
        targetHeight * 0.45,
        targetWidth * 0.1,
        targetWidth * 0.5,
        targetHeight * 0.45,
        targetWidth * 0.7
      );
      glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.restore();

      // Scale factors based on 1080 width baseline
      const scale = targetWidth / 1080;

      // 2. Draw Text (Headline & Subtitle & Badge)
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      let textStartY = slide.textPosition === 'top' ? 140 * scale : targetHeight - 480 * scale;

      // Badge
      if (slide.showBadge && slide.badge.trim()) {
        ctx.font = `bold ${28 * scale}px system-ui, -apple-system, sans-serif`;
        const badgeMetrics = ctx.measureText(slide.badge.toUpperCase());
        const badgePaddingX = 26 * scale;
        const badgeHeight = 54 * scale;
        const badgeWidth = badgeMetrics.width + badgePaddingX * 2;
        const badgeX = targetWidth / 2 - badgeWidth / 2;

        drawRoundedRect(ctx, badgeX, textStartY, badgeWidth, badgeHeight, badgeHeight / 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        ctx.fillStyle = slide.textColor;
        ctx.fillText(slide.badge.toUpperCase(), targetWidth / 2, textStartY + 12 * scale);
        textStartY += 80 * scale;
      }

      // Headline
      ctx.font = `900 ${72 * scale}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = slide.textColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 18 * scale;
      ctx.shadowOffsetY = 6 * scale;

      const afterHeadlineY = drawWrappedText(
        ctx,
        slide.headline,
        targetWidth / 2,
        textStartY,
        targetWidth - 160 * scale,
        86 * scale
      );

      // Subtitle
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.font = `500 ${36 * scale}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      drawWrappedText(
        ctx,
        slide.subtitle,
        targetWidth / 2,
        afterHeadlineY + 12 * scale,
        targetWidth - 220 * scale,
        48 * scale
      );
      ctx.restore();

      // 3. Draw Device Mockup & Screenshot Image
      const phoneWidth = 780 * scale;
      const phoneHeight = 1620 * scale;
      const phoneX = (targetWidth - phoneWidth) / 2;

      let phoneY = targetHeight - phoneHeight * 0.88;
      if (slide.devicePosition === 'bottom-fit') {
        phoneY = targetHeight - phoneHeight - 60 * scale;
      } else if (slide.devicePosition === 'centered') {
        phoneY = (targetHeight - phoneHeight) / 2 + 100 * scale;
      }

      // Drop shadow under phone
      if (slide.showShadow) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = 60 * scale;
        ctx.shadowOffsetY = 30 * scale;
        drawRoundedRect(ctx, phoneX, phoneY, phoneWidth, phoneHeight, 64 * scale);
        ctx.fillStyle = '#090a0f';
        ctx.fill();
        ctx.restore();
      }

      // Phone Body Frame
      ctx.save();
      drawRoundedRect(ctx, phoneX, phoneY, phoneWidth, phoneHeight, 64 * scale);
      ctx.fillStyle = slide.deviceTheme === 'silver' ? '#e2e8f0' : '#111318';
      ctx.fill();
      ctx.lineWidth = 8 * scale;
      ctx.strokeStyle = slide.deviceTheme === 'silver' ? '#cbd5e1' : '#27272a';
      ctx.stroke();

      // Screen Inner Clip
      const screenMargin = 16 * scale;
      const screenX = phoneX + screenMargin;
      const screenY = phoneY + screenMargin;
      const screenW = phoneWidth - screenMargin * 2;
      const screenH = phoneHeight - screenMargin * 2;
      const screenRadius = 50 * scale;

      ctx.save();
      drawRoundedRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
      ctx.clip();

      // Fill screen background dark
      ctx.fillStyle = '#090d16';
      ctx.fillRect(screenX, screenY, screenW, screenH);

      // Draw uploaded/sample app screenshot image
      if (slide.imageSrc) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = slide.imageSrc;

          await new Promise<void>((resolve, reject) => {
            if (img.complete) resolve();
            else {
              img.onload = () => resolve();
              img.onerror = () => reject();
            }
          });

          // Draw aspect-ratio fill inside screen
          const imgAspect = img.width / img.height;
          const screenAspect = screenW / screenH;

          let renderW = screenW;
          let renderH = screenH;
          let renderX = screenX;
          let renderY = screenY;

          if (imgAspect > screenAspect) {
            renderW = screenH * imgAspect;
            renderX = screenX + (screenW - renderW) / 2;
          } else {
            renderH = screenW / imgAspect;
            renderY = screenY; // align to top
          }

          ctx.drawImage(img, renderX, renderY, renderW, renderH);
        } catch {
          // If image fails, draw placeholder
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(screenX, screenY, screenW, screenH);
        }
      }

      // Draw Punch-Hole camera or Dynamic Island inside screen
      if (slide.deviceFrame === 'pixel') {
        // Pixel Center punch-hole
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(phoneX + phoneWidth / 2, screenY + 28 * scale, 14 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (slide.deviceFrame === 'iphone') {
        // Dynamic Island pill
        const pillW = 140 * scale;
        const pillH = 34 * scale;
        drawRoundedRect(
          ctx,
          phoneX + phoneWidth / 2 - pillW / 2,
          screenY + 18 * scale,
          pillW,
          pillH,
          pillH / 2
        );
        ctx.fillStyle = '#000000';
        ctx.fill();
      }

      ctx.restore(); // end screen clip
      ctx.restore(); // end phone context
    },
    []
  );

  // Trigger re-render whenever active slide or resolution changes
  useEffect(() => {
    if (canvasRef.current) {
      renderSlideToCanvas(
        canvasRef.current,
        activeSlide,
        selectedSize.width,
        selectedSize.height
      );
    }
  }, [activeSlide, selectedSize, renderSlideToCanvas]);

  // ─── Single Download (PNG) ───
  const handleDownloadSingle = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        saveAs(
          blob,
          `screenshot_${selectedSize.width}x${selectedSize.height}_slide_${activeSlideIndex + 1}.png`
        );
      }
    }, 'image/png');
  };

  // ─── Batch ZIP Download ───
  const handleDownloadAllZip = async () => {
    setIsExportingZip(true);
    setExportProgress(0);

    try {
      const zip = new JSZip();
      const folderName = `${selectedSize.store}_${selectedSize.width}x${selectedSize.height}`;
      const imgFolder = zip.folder(folderName) || zip;

      // Offscreen canvas for full resolution
      const offCanvas = document.createElement('canvas');

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        await renderSlideToCanvas(offCanvas, slide, selectedSize.width, selectedSize.height);

        const blob = await new Promise<Blob | null>((resolve) => {
          offCanvas.toBlob(resolve, 'image/png');
        });

        if (blob) {
          const filename = `0${i + 1}_screenshot_${selectedSize.width}x${selectedSize.height}.png`;
          imgFolder.file(filename, blob);
        }

        setExportProgress(Math.round(((i + 1) / slides.length) * 100));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `app_store_screenshots_${selectedSize.width}x${selectedSize.height}.zip`);

      // Celebrate
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      alert(lang === 'ar' ? 'حدث خطأ أثناء تصدير ملف ZIP' : 'Failed to generate ZIP archive');
    } finally {
      setIsExportingZip(false);
      setExportProgress(0);
    }
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
        <span className="text-violet-400 font-semibold">
          {lang === 'ar' ? 'مصمم سكرين شوت المتجر والإطارات' : 'App Mockup Framer'}
        </span>
      </nav>

      {/* ─── Header ─── */}
      <div className="mb-8 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3.5 py-1.5 text-xs font-bold text-violet-400 mb-4 shadow-sm shadow-violet-500/10">
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            {lang === 'ar'
              ? 'مقاسات رسمية لـ Google Play و App Store · تصدير ZIP مجاني'
              : 'Official Store Dimensions · 100% Free ZIP Export'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          App Store Screenshots{' '}
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
            {lang === 'ar' ? '& Mockup Framer' : '& Mockup Framer'}
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {lang === 'ar'
            ? 'صمّم لقطات شاشة ترويجية احترافية لتطبيقك بدقة Google Play الرسمية (1080×2400) وأجهزة Pixel و iPhone الحديثة. أضف عناوينك التسويقية وخلفيات متدرجة وقم بتصدير الحزمة كاملة بملف ZIP بنقرة واحدة.'
            : 'Turn raw app screenshots into high-converting Google Play and App Store graphics. Framed inside modern flagship devices with gradient backgrounds, marketing typography, and one-click ZIP batch export.'}
        </p>
      </div>

      {/* ─── Slide Manager Toolbar ─── */}
      <div className="mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Slide Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSlideIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeSlideIndex === idx
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{`${lang === 'ar' ? 'لقطة' : 'Slide'} #${idx + 1}`}</span>
              {slides.length > 1 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSlide(idx);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      handleDeleteSlide(idx);
                    }
                  }}
                  className="opacity-60 hover:opacity-100 hover:text-rose-400 p-0.5"
                  title="Delete slide"
                >
                  ✕
                </span>
              )}
            </button>
          ))}

          {slides.length < 8 && (
            <button
              type="button"
              onClick={handleAddSlide}
              className="px-3 py-1.5 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 hover:border-violet-500 hover:text-violet-400 text-slate-400 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-3 w-3" />
              <span>{lang === 'ar' ? 'إضافة لقطة' : 'Add Slide'}</span>
            </button>
          )}
        </div>

        {/* Global Slide Actions */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleDuplicateSlide}
            disabled={slides.length >= 8}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
            title="Duplicate Current Slide"
          >
            <Copy className="h-3.5 w-3.5 text-violet-400" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'نسخ اللقطة' : 'Duplicate'}</span>
          </button>
          <button
            type="button"
            onClick={handleApplyBgToAll}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
            title="Apply this background to all slides"
          >
            <Palette className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'تعميم الخلفية للكل' : 'Sync BG to All'}</span>
          </button>
          <button
            type="button"
            onClick={handleApplyFrameToAll}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
            title="Apply this frame to all slides"
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'تعميم الإطار للكل' : 'Sync Frame to All'}</span>
          </button>
        </div>
      </div>

      {/* ─── Main Two-Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── Left Column: Customization Controls (6 cols) ─── */}
        <div className="lg:col-span-6 space-y-5">
          {/* Section 1: Resolution & Target Store */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {lang === 'ar' ? 'مقاس المتجر الرسمي (Store Dimension)' : 'Target Store Resolution'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedSize(preset)}
                  className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                    selectedSize.id === preset.id
                      ? 'bg-violet-600/20 border-violet-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{preset.name}</span>
                    <span className="text-[10px] font-mono opacity-60">{preset.aspect}</span>
                  </div>
                  <div className="text-[11px] font-mono text-violet-400 mt-1">
                    {preset.width} × {preset.height} px
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Upload Screenshot */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {lang === 'ar' ? 'لقطة شاشة التطبيق (App Screenshot)' : 'Upload App Screen'}
              </label>
              <span className="text-[10px] text-slate-500">PNG / JPG / WebP</span>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3">
              <input
                type="file"
                id={fileUploadId}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor={fileUploadId}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-md shadow-violet-500/20"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{lang === 'ar' ? 'رفع سكرين شوت' : 'Upload Image'}</span>
              </label>
              <div className="flex-1 min-w-0 text-xs text-slate-400 truncate">
                {activeSlide.imageSrc?.startsWith('data:image/svg')
                  ? lang === 'ar'
                    ? 'نموذج تجريبي جاهز'
                    : 'Sample screen active'
                  : lang === 'ar'
                  ? '✓ تم رفع الصورة بنجاح'
                  : '✓ Custom image loaded'}
              </div>
            </div>
          </div>

          {/* Section 3: Typography & Text */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Type className="h-4 w-4 text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {lang === 'ar' ? 'النصوص الترويجية (Marketing Typography)' : 'Marketing Typography'}
              </h3>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {lang === 'ar' ? 'العنوان الرئيسي (Headline)' : 'Main Headline'}
              </label>
              <input
                type="text"
                value={activeSlide.headline}
                onChange={(e) => updateActiveSlide({ headline: e.target.value })}
                placeholder="e.g. Discover & Shop Seamlessly"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {lang === 'ar' ? 'الوصف التوضيحي (Subtitle)' : 'Subtitle Description'}
              </label>
              <input
                type="text"
                value={activeSlide.subtitle}
                onChange={(e) => updateActiveSlide({ subtitle: e.target.value })}
                placeholder="e.g. Browse thousands of curated items with instant delivery"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Badge Pill */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {lang === 'ar' ? 'شارة ترويجية (Badge)' : 'Highlight Badge'}
                </label>
                <input
                  type="text"
                  value={activeSlide.badge}
                  onChange={(e) => updateActiveSlide({ badge: e.target.value })}
                  placeholder="★ 4.9 RATED APP"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={activeSlide.showBadge}
                    onChange={(e) => updateActiveSlide({ showBadge: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-violet-500 focus:ring-0"
                  />
                  <span>{lang === 'ar' ? 'إظهار الشارة' : 'Show Badge Pill'}</span>
                </label>
              </div>
            </div>

            {/* Text Position */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {lang === 'ar' ? 'موضع النص' : 'Text Placement'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateActiveSlide({ textPosition: 'top' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    activeSlide.textPosition === 'top'
                      ? 'bg-violet-600/20 border-violet-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'ar' ? 'أعلى الشاشة (مستحسن)' : 'Top Header (Recommended)'}
                </button>
                <button
                  type="button"
                  onClick={() => updateActiveSlide({ textPosition: 'bottom' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    activeSlide.textPosition === 'bottom'
                      ? 'bg-violet-600/20 border-violet-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'ar' ? 'أسفل الشاشة' : 'Bottom Footer'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Device Mockup Framing */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Smartphone className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {lang === 'ar' ? 'إطار الجهاز (Device Mockup)' : 'Device Frame & Positioning'}
              </h3>
            </div>

            {/* Frame Style */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {lang === 'ar' ? 'نوع إطار الهاتف' : 'Device Model'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'pixel' as const, label: 'Google Pixel 9' },
                  { id: 'iphone' as const, label: 'iPhone Pro' },
                  { id: 'minimal' as const, label: 'Minimal Card' },
                ].map((fr) => (
                  <button
                    key={fr.id}
                    type="button"
                    onClick={() => updateActiveSlide({ deviceFrame: fr.id })}
                    className={`py-2 px-2 rounded-xl border text-center text-xs font-bold transition-all ${
                      activeSlide.deviceFrame === fr.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {fr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Device Position & Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {lang === 'ar' ? 'موضع الجهاز' : 'Device Placement'}
                </label>
                <select
                  value={activeSlide.devicePosition}
                  onChange={(e) =>
                    updateActiveSlide({
                      devicePosition: e.target.value as 'bottom-cut' | 'bottom-fit' | 'centered',
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="bottom-cut">{lang === 'ar' ? 'قص أسفل الشاشة (النمط العصري)' : 'Bottom Cut (Modern Standard)'}</option>
                  <option value="bottom-fit">{lang === 'ar' ? 'كامل داخل الشاشة (Floating)' : 'Floating (Fully Visible)'}</option>
                  <option value="centered">{lang === 'ar' ? 'في المنتصف' : 'Centered'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {lang === 'ar' ? 'لون حواف الجهاز' : 'Chassis Color'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateActiveSlide({ deviceTheme: 'dark' })}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      activeSlide.deviceTheme === 'dark'
                        ? 'bg-slate-800 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {lang === 'ar' ? 'أسود داكن' : 'Dark Obsidian'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateActiveSlide({ deviceTheme: 'silver' })}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      activeSlide.deviceTheme === 'silver'
                        ? 'bg-slate-200 border-emerald-500 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {lang === 'ar' ? 'تيتانيوم فضي' : 'Silver Titanium'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Background Gradients */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Palette className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {lang === 'ar' ? 'خلفيات التدرج اللوني (Gradients)' : 'Background Gradient Presets'}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GRADIENT_PRESETS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() =>
                    updateActiveSlide({
                      bgGradientId: g.id,
                      customBgFrom: g.from,
                      customBgTo: g.to,
                    })
                  }
                  className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer relative overflow-hidden group ${
                    activeSlide.bgGradientId === g.id
                      ? 'border-white ring-2 ring-violet-500 shadow-md'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                  }}
                >
                  <div className="text-[11px] font-bold text-white drop-shadow-sm truncate">
                    {g.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right Column: High-Res Live Preview & Downloads (6 cols) ─── */}
        <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-6">
          {/* Live Canvas Preview Frame */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  {lang === 'ar' ? 'معاينة حية بدقة المتجر' : 'Live High-Res Preview'}
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {selectedSize.width} × {selectedSize.height} px
              </span>
            </div>

            {/* Canvas Container with aspect-ratio preservation */}
            <div className="flex justify-center bg-slate-950 rounded-2xl p-4 border border-slate-800/80 overflow-hidden">
              <div className="w-full max-w-[320px] sm:max-w-[340px] drop-shadow-2xl">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto rounded-xl shadow-2xl transition-all"
                  style={{
                    aspectRatio: `${selectedSize.width} / ${selectedSize.height}`,
                  }}
                />
              </div>
            </div>

            {/* Slide Navigation footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs">
              <button
                type="button"
                onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeSlideIndex === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 disabled:opacity-30 text-white font-medium inline-flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                <span>{lang === 'ar' ? 'السابق' : 'Previous'}</span>
              </button>

              <span className="text-slate-400 font-medium">
                {activeSlideIndex + 1} / {slides.length}
              </span>

              <button
                type="button"
                onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                disabled={activeSlideIndex === slides.length - 1}
                className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 disabled:opacity-30 text-white font-medium inline-flex items-center gap-1 transition-colors"
              >
                <span>{lang === 'ar' ? 'التالي' : 'Next'}</span>
                <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* Export Action Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md space-y-3">
            <h3 className="text-sm font-bold text-white">
              {lang === 'ar' ? 'تصدير وتحميل الصور' : 'Export Screenshots'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'حمّل اللقطة الحالية فوراً بصيغة PNG أو صدّر كامل الحزمة في ملف ZIP واحد.'
                : 'Download current slide as PNG or export the full set in one organized ZIP bundle.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={handleDownloadSingle}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
              >
                <Download className="h-4 w-4 text-violet-400" />
                <span>
                  {lang === 'ar' ? 'تحميل الشريحة الحالية (PNG)' : 'Download Current PNG'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadAllZip}
                disabled={isExportingZip}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-all cursor-pointer"
              >
                {isExportingZip ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{`${lang === 'ar' ? 'جاري التجهيز...' : 'Building ZIP...'} ${exportProgress}%`}</span>
                  </>
                ) : (
                  <>
                    <FolderArchive className="h-4 w-4 text-amber-300" />
                    <span>{lang === 'ar' ? `تحميل الكل ZIP (${slides.length})` : `Download All ZIP (${slides.length})`}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Informational FAQ Section ─── */}
      <section className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-10">
        <h2 className="text-xl sm:text-2xl font-black text-white mb-6 text-center">
          {lang === 'ar' ? 'دليل متطلبات لقطات شاشة المتاجر' : 'Store Screenshots Requirements Guide'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-start">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-violet-400">
              {lang === 'ar' ? 'ما هي متطلبات Google Play للصور؟' : 'What are Google Play screenshot rules?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'يشترط متجر Google Play رفع صورتين على الأقل للهاتف بحد أقصى 8 صور، بنسبة عرض إلى ارتفاع 16:9 أو 9:16 وبدقة تتراوح بين 320 بكسل و 3840 بكسل. مقاس 1080×2400 هو المعيار الحديث الأكثر استخداماً.'
                : 'Google Play requires at least 2 screenshots (up to 8 per device) with a 16:9 or 9:16 aspect ratio between 320px and 3840px. 1080x2400 is the modern flagship standard.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-violet-400">
              {lang === 'ar' ? 'لماذا تزيد الإطارات والنصوص من نسبة التنزيلات؟' : 'Why do framed mockups increase installs?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'تظهر الإحصائيات أن اللقطات المؤطرة المزودة بعناوين تسويقية واضحة تزيد معدل التحويل بنسبة تتجاوز 30% مقارنة باللقطات العادية، لأنها تبرز القيمة الحقيقية للتطبيق وتجذب عين الزائر فوراً.'
                : 'A/B testing shows that screenshots featuring modern device mockups and bold benefit headlines convert up to 35% higher than raw screen captures.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-violet-400">
              {lang === 'ar' ? 'هل أحتاج برنامج Figma أو Photoshop؟' : 'Do I need Figma or Photoshop?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'لا، تتولى الأداة ضبط الأبعاد والقص والرسم بدقة البيكسل تلقائياً داخل متصفحك دون الحاجة لأي برامج تصميم معقدة أو اشتراكات شهرية مكلفة.'
                : 'No! The tool automatically handles canvas sizing, device framing, and text layout locally in your browser with zero design software or monthly subscriptions.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-violet-400">
              {lang === 'ar' ? 'هل تحتفظ المنصة بصوري المرفوعة؟' : 'Are my uploaded images kept private?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'جميع عمليات المعالجة وتوليد الصور وملف الـ ZIP تتم محلياً 100% داخل ذاكرة متصفحك عبر تقنية HTML5 Canvas ولا يتم إرسال أي صورة لخوادمنا للحفاظ على خصوصيتك الكاملة.'
                : 'All processing and ZIP creation happen 100% in your browser client memory via HTML5 Canvas. Your proprietary app screens are never uploaded or saved to any server.'}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <div className="mt-16 rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 via-zinc-900/50 to-zinc-950/90 p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            {lang === 'ar' ? 'جاهز لنشر تطبيقك على Google Play؟' : 'Ready to launch on Google Play?'}
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6 leading-relaxed">
            {lang === 'ar'
              ? 'حوّل موقعك أو متجرك إلى تطبيق PWA و APK جاهز تماماً للنشر مع أدوات Appifya المتكاملة.'
              : 'Convert your website into an installable PWA and release-ready Android APK with Appifya.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-violet-500/25 transition-all"
          >
            <span>{lang === 'ar' ? 'ابدأ بناء تطبيقك الآن' : 'Start building your app'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
