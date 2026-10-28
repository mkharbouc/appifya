'use client';

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../lib/i18n';
import { useAuth } from '@/context/AuthContext';
import {
  Smartphone,
  Tablet,
  Download,
  Upload,
  Sparkles,
  Palette,
  Type,
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FolderArchive,
  Wand2,
  CheckCircle2,
  Save,
  Cloud,
  FileDown,
  FileUp,
  Move,
  RotateCw,
  Maximize2,
  SlidersHorizontal,
  Undo2,
} from 'lucide-react';
import { APP_CATEGORIES_COPY, generateSmartCopy } from './aiCopySuggestions';

// ─── Preset Resolutions ───
export interface SizePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  aspect: string;
  store: 'google' | 'apple' | 'tablet';
}

export const SIZE_PRESETS: SizePreset[] = [
  {
    id: 'google-phone-modern',
    name: 'Google Play Phone (1080×2400)',
    width: 1080,
    height: 2400,
    aspect: '9:20',
    store: 'google',
  },
  {
    id: 'apple-iphone-67',
    name: 'App Store 6.7" iPhone (1290×2796)',
    width: 1290,
    height: 2796,
    aspect: '19.5:9',
    store: 'apple',
  },
  {
    id: 'google-phone-16-9',
    name: 'Google Play Classic (1080×1920)',
    width: 1080,
    height: 1920,
    aspect: '9:16',
    store: 'google',
  },
  {
    id: 'apple-iphone-65',
    name: 'App Store 6.5" iPhone (1242×2688)',
    width: 1242,
    height: 2688,
    aspect: '19.5:9',
    store: 'apple',
  },
  {
    id: 'apple-ipad-129',
    name: 'App Store 12.9" iPad (2048×2732)',
    width: 2048,
    height: 2732,
    aspect: '3:4',
    store: 'tablet',
  },
  {
    id: 'google-tablet-10',
    name: 'Google Play 10" Tablet (1200×1920)',
    width: 1200,
    height: 1920,
    aspect: '10:16',
    store: 'tablet',
  },
];

// ─── Color Gradients ───
export const GRADIENT_PRESETS = [
  { id: 'electric-indigo', name: 'Electric Indigo', from: '#4f46e5', to: '#7c3aed' },
  { id: 'cyber-emerald', name: 'Cyber Emerald', from: '#059669', to: '#0d9488' },
  { id: 'midnight-obsidian', name: 'Midnight Obsidian', from: '#090d16', to: '#1e293b' },
  { id: 'sunset-rose', name: 'Sunset Rose', from: '#e11d48', to: '#f59e0b' },
  { id: 'ocean-cyan', name: 'Ocean Cyan', from: '#0284c7', to: '#06b6d4' },
  { id: 'neon-violet', name: 'Neon Violet', from: '#9333ea', to: '#db2777' },
  { id: 'carbon-dark', name: 'Carbon Pure Dark', from: '#18181b', to: '#09090b' },
  { id: 'clean-slate', name: 'Modern Titanium', from: '#334155', to: '#475569' },
];

export type TemplateStyle = 'gradient' | 'minimalist' | 'panoramic';
export type DeviceType = 'iphone' | 'pixel' | 'tablet';
export type DeviceAngle = 'straight' | 'tilted-right' | 'tilted-left' | 'floating';
export type DeviceTheme = 'dark' | 'silver' | 'gold';
export type DevicePosition = 'bottom-cut' | 'bottom-fit' | 'centered';

// ─── Slide Data Model ───
export interface Slide {
  id: string;
  headline: string;
  subtitle: string;
  badge: string;
  showBadge: boolean;
  imageSrc: string | null;
  templateStyle: TemplateStyle;
  bgGradientId: string;
  customBgFrom: string;
  customBgTo: string;
  textColor: string;
  deviceFrame: DeviceType;
  deviceAngle: DeviceAngle;
  deviceTheme: DeviceTheme;
  devicePosition: DevicePosition;
  textPosition: 'top' | 'bottom';
  showShadow: boolean;
  // Advanced Interactive Canvas Positioning
  phoneScale: number; // 0.6 - 1.4, default 1.0
  phoneOffsetX: number; // in baseline pixels (-400 to 400)
  phoneOffsetY: number; // in baseline pixels (-600 to 600)
  phoneRotation: number; // in degrees (-35 to 35)
  textOffsetY: number; // in baseline pixels (-200 to 200)
  headlineFontSize: number; // default 70
}

const SAMPLE_SCREENSHOTS = [
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="2340" viewBox="0 0 1080 2340" fill="%230f172a"><rect width="1080" height="2340" fill="%23090d16"/><rect x="80" y="140" width="920" height="120" rx="24" fill="%231e293b"/><text x="140" y="215" fill="%2394a3b8" font-family="sans-serif" font-size="42">🔍 Search items, deals, brands...</text><rect x="80" y="320" width="920" height="520" rx="36" fill="%234f46e5"/><text x="140" y="520" fill="%23ffffff" font-family="sans-serif" font-size="72" font-weight="bold">Mega Sale 50% Off</text><text x="140" y="600" fill="%23c7d2fe" font-family="sans-serif" font-size="38">Exclusive mobile app rewards</text><rect x="140" y="680" width="340" height="90" rx="20" fill="%23ffffff"/><text x="210" y="740" fill="%234f46e5" font-family="sans-serif" font-size="36" font-weight="bold">Shop Now</text><text x="80" y="940" fill="%23ffffff" font-family="sans-serif" font-size="52" font-weight="bold">Trending Collections</text><rect x="80" y="1000" width="440" height="580" rx="32" fill="%231e293b"/><rect x="560" y="1000" width="440" height="580" rx="32" fill="%231e293b"/><rect x="120" y="1040" width="360" height="340" rx="24" fill="%23334155"/><rect x="600" y="1040" width="360" height="340" rx="24" fill="%23334155"/><text x="120" y="1440" fill="%23ffffff" font-family="sans-serif" font-size="36" font-weight="bold">Wireless Earbuds</text><text x="120" y="1510" fill="%2334d399" font-family="sans-serif" font-size="38" font-weight="bold">$79.99</text><text x="600" y="1440" fill="%23ffffff" font-family="sans-serif" font-size="36" font-weight="bold">Smart Watch Ultra</text><text x="600" y="1510" fill="%2334d399" font-family="sans-serif" font-size="38" font-weight="bold">$199.00</text></svg>`,
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="2340" viewBox="0 0 1080 2340" fill="%230f172a"><rect width="1080" height="2340" fill="%230b1329"/><rect x="80" y="160" width="920" height="560" rx="40" fill="%23059669"/><text x="140" y="320" fill="%23d1fae5" font-family="sans-serif" font-size="44">Total Balance</text><text x="140" y="440" fill="%23ffffff" font-family="sans-serif" font-size="108" font-weight="bold">$18,450.80</text><text x="140" y="540" fill="%23a7f3d0" font-family="sans-serif" font-size="40">▲ +14.8% this month</text><text x="80" y="820" fill="%23ffffff" font-family="sans-serif" font-size="52" font-weight="bold">Quick Actions</text><rect x="80" y="880" width="200" height="200" rx="32" fill="%231e293b"/><rect x="320" y="880" width="200" height="200" rx="32" fill="%231e293b"/><rect x="560" y="880" width="200" height="200" rx="32" fill="%231e293b"/><rect x="800" y="880" width="200" height="200" rx="32" fill="%231e293b"/><text x="80" y="1180" fill="%23ffffff" font-family="sans-serif" font-size="52" font-weight="bold">Recent Transactions</text><rect x="80" y="1240" width="920" height="200" rx="28" fill="%231e293b"/><circle cx="160" cy="1340" r="50" fill="%233b82f6"/><text x="240" y="1335" fill="%23ffffff" font-family="sans-serif" font-size="42" font-weight="bold">Apple Store</text><text x="240" y="1390" fill="%2394a3b8" font-family="sans-serif" font-size="32">Electronics</text><text x="820" y="1350" fill="%23ffffff" font-family="sans-serif" font-size="46" font-weight="bold">-$129</text></svg>`,
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="2340" viewBox="0 0 1080 2340" fill="%230f172a"><rect width="1080" height="2340" fill="%2318181b"/><circle cx="540" cy="460" r="160" fill="%23f43f5e"/><text x="540" y="740" fill="%23ffffff" font-family="sans-serif" font-size="64" font-weight="bold" text-anchor="middle">Order Confirmed!</text><text x="540" y="830" fill="%23a1a1aa" font-family="sans-serif" font-size="40" text-anchor="middle">Estimated delivery: 25-35 mins</text><rect x="80" y="980" width="920" height="640" rx="36" fill="%2327272a"/><circle cx="180" cy="1100" r="40" fill="%2310b981"/><line x1="180" y1="1140" x2="180" y2="1480" stroke="%233f3f46" stroke-width="12"/><text x="260" y="1115" fill="%23ffffff" font-family="sans-serif" font-size="42" font-weight="bold">Restaurant Preparing</text><text x="260" y="1170" fill="%23a1a1aa" font-family="sans-serif" font-size="32">Fresh organic ingredients</text><circle cx="180" cy="1320" r="40" fill="%2310b981"/><text x="260" y="1335" fill="%23ffffff" font-family="sans-serif" font-size="42" font-weight="bold">Courier on the way</text><text x="260" y="1390" fill="%23a1a1aa" font-family="sans-serif" font-size="32">Live GPS tracking active</text></svg>`,
];

const LOCAL_STORAGE_KEY = 'appifya_screenshot_studio_project_v1';

// ─── Default Localized Slide Generators ───
export function getDefaultLocalizedSlides(targetLang: 'ar' | 'en' | 'fr'): Slide[] {
  const isAr = targetLang === 'ar';
  const isFr = targetLang === 'fr';

  return [
    {
      id: 'slide-1',
      headline: isAr
        ? 'اكتشف وتسوّق بكل سهولة'
        : isFr
        ? 'Découvrez et Achetez Facilement'
        : 'Discover & Shop Seamlessly',
      subtitle: isAr
        ? 'أكثر من 50 ألف منتج مع عروض حصرية وتوصيل فوري لباب بيتك'
        : isFr
        ? 'Des milliers d’articles avec offres exclusives et livraison rapide'
        : 'Browse thousands of curated items with instant doorstep delivery',
      badge: isAr ? '★ تقييم 4.9 للمتجر' : isFr ? '★ NOTÉ 4.9 ÉTOILES' : '★ 4.9 TOP RATED APP',
      showBadge: true,
      imageSrc: SAMPLE_SCREENSHOTS[0],
      templateStyle: 'gradient',
      bgGradientId: 'electric-indigo',
      customBgFrom: '#4f46e5',
      customBgTo: '#7c3aed',
      textColor: '#ffffff',
      deviceFrame: 'iphone',
      deviceAngle: 'straight',
      deviceTheme: 'dark',
      devicePosition: 'bottom-cut',
      textPosition: 'top',
      showShadow: true,
      phoneScale: 1.0,
      phoneOffsetX: 0,
      phoneOffsetY: 0,
      phoneRotation: 0,
      textOffsetY: 0,
      headlineFontSize: 70,
    },
    {
      id: 'slide-2',
      headline: isAr
        ? 'لوحة تحكم وتحليلات مالية ذكية'
        : isFr
        ? 'Tableau de Bord & Analyses'
        : 'Smart Analytics & Insights',
      subtitle: isAr
        ? 'تتبع طلباتك ومصاريفك أولاً بأول بدقة وأمان مصرفي مشفر'
        : isFr
        ? 'Suivez vos finances et vos métriques en temps réel en toute sécurité'
        : 'Real-time financial tracking and growth performance metrics',
      badge: isAr ? 'أمان بنكي مشفر' : isFr ? 'SÉCURITÉ BANCAIRE' : 'BANK-GRADE SECURITY',
      showBadge: true,
      imageSrc: SAMPLE_SCREENSHOTS[1],
      templateStyle: 'gradient',
      bgGradientId: 'cyber-emerald',
      customBgFrom: '#059669',
      customBgTo: '#0d9488',
      textColor: '#ffffff',
      deviceFrame: 'iphone',
      deviceAngle: 'straight',
      deviceTheme: 'dark',
      devicePosition: 'bottom-cut',
      textPosition: 'top',
      showShadow: true,
      phoneScale: 1.0,
      phoneOffsetX: 0,
      phoneOffsetY: 0,
      phoneRotation: 0,
      textOffsetY: 0,
      headlineFontSize: 70,
    },
    {
      id: 'slide-3',
      headline: isAr
        ? 'توصيل فائق السرعة مع تتبع حي'
        : isFr
        ? 'Suivi de Commande en Direct'
        : 'Ultra Fast Order Tracking',
      subtitle: isAr
        ? 'متابعة مباشرة عبر الخريطة مع إشعارات لحظية حتى باب منزلك'
        : isFr
        ? 'Localisation GPS en temps réel et notifications instantanées chez vous'
        : 'Live GPS location with instant courier notifications straight to your door',
      badge: isAr ? 'سرعة فائقة 20 دقيقة' : isFr ? 'LIVRAISON EN 20 MIN' : 'LIGHTNING FAST',
      showBadge: true,
      imageSrc: SAMPLE_SCREENSHOTS[2],
      templateStyle: 'gradient',
      bgGradientId: 'sunset-rose',
      customBgFrom: '#e11d48',
      customBgTo: '#f59e0b',
      textColor: '#ffffff',
      deviceFrame: 'iphone',
      deviceAngle: 'straight',
      deviceTheme: 'dark',
      devicePosition: 'bottom-cut',
      textPosition: 'top',
      showShadow: true,
      phoneScale: 1.0,
      phoneOffsetX: 0,
      phoneOffsetY: 0,
      phoneRotation: 0,
      textOffsetY: 0,
      headlineFontSize: 70,
    },
  ];
}

const DEFAULT_KNOWN_HEADLINES = [
  'اكتشف وتسوّق بسهولة',
  'اكتشف وتسوّق بسهولة وسرعة',
  'اكتشف وتسوّق بكل سهولة',
  'Discover & Shop Seamlessly',
  'Découvrez et Achetez Facilement',
  'لوحة تحكم وتحليلات مالية ذكية',
  'Smart Analytics & Insights',
  'Tableau de Bord & Analyses',
  'توصيل فائق السرعة مع تتبع حي',
  'Ultra Fast Order Tracking',
  'Suivi de Commande en Direct',
];

export default function AppMockupFramerClient() {
  const { lang } = useLanguage();
  const { user, openAuthModal } = useAuth();
  const fileUploadId = useId();
  const batchUploadId = useId();
  const importFileId = useId();

  // Selected Resolution
  const [selectedSize, setSelectedSize] = useState<SizePreset>(SIZE_PRESETS[0]);
  const [globalTemplateStyle, setGlobalTemplateStyle] = useState<TemplateStyle>('gradient');

  // AI Assistant Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ecommerce');
  const [customKeyword, setCustomKeyword] = useState<string>('');
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);

  // Drag over state for batch upload
  const [isDraggingBatch, setIsDraggingBatch] = useState(false);

  // Active Tab in Controls
  const [activeTab, setActiveTab] = useState<'template' | 'mockup' | 'text' | 'adjust'>('template');

  // Project persistence notification
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Initialize slides with language-aware defaults
  const [slides, setSlides] = useState<Slide[]>(() => getDefaultLocalizedSlides(lang));
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusText, setExportStatusText] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeSlide = slides[activeSlideIndex] || slides[0];

  // Interactive Direct Dragging on Canvas State
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragTarget, setDragTarget] = useState<'device' | 'text'>('device');
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragInitialOffsets = useRef<{ phoneX: number; phoneY: number; textY: number }>({
    phoneX: 0,
    phoneY: 0,
    textY: 0,
  });

  // Check if slides are using default placeholders
  const areSlidesDefault = useCallback((currentSlides: Slide[]) => {
    return (
      currentSlides.length <= 3 &&
      currentSlides.every((s) => DEFAULT_KNOWN_HEADLINES.includes(s.headline))
    );
  }, []);

  // Adapt default placeholder slides when user's language changes
  useEffect(() => {
    setSlides((prev) => {
      if (areSlidesDefault(prev)) {
        return getDefaultLocalizedSlides(lang);
      }
      return prev;
    });
  }, [lang, areSlidesDefault]);

  // ─── Auto-Save to localStorage on Changes ───
  useEffect(() => {
    try {
      const dataToSave = JSON.stringify({
        slides,
        selectedSizeId: selectedSize.id,
        globalTemplateStyle,
        savedLang: lang,
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, dataToSave);
    } catch {
      // ignore storage quota errors
    }
  }, [slides, selectedSize, globalTemplateStyle, lang]);

  // Load from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          // If saved slides were just default and saved under a different language, localize to user's device lang
          if (areSlidesDefault(parsed.slides) && parsed.savedLang !== lang) {
            setSlides(getDefaultLocalizedSlides(lang));
          } else {
            setSlides(parsed.slides);
          }

          if (parsed.selectedSizeId) {
            const found = SIZE_PRESETS.find((p) => p.id === parsed.selectedSizeId);
            if (found) setSelectedSize(found);
          }
          if (parsed.globalTemplateStyle) {
            setGlobalTemplateStyle(parsed.globalTemplateStyle);
          }
        }
      }
    } catch {
      // ignore
    }
  }, [lang, areSlidesDefault]);

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
      headline:
        lang === 'ar'
          ? 'عنوان الميزة التسويقي'
          : lang === 'fr'
          ? 'Titre de la fonctionnalité'
          : 'New Feature Title',
      subtitle:
        lang === 'ar'
          ? 'أضف وصفاً جذاباً ومقنعاً للمستخدمين'
          : lang === 'fr'
          ? 'Ajoutez une description captivante pour cet écran'
          : 'Add an engaging description highlight for this screen',
      badge: lang === 'ar' ? 'ميزة حصرية' : lang === 'fr' ? 'EXCLUSIF' : 'EXCLUSIVE',
      showBadge: false,
      imageSrc: SAMPLE_SCREENSHOTS[0],
      templateStyle: globalTemplateStyle,
      bgGradientId: activeSlide.bgGradientId,
      customBgFrom: activeSlide.customBgFrom,
      customBgTo: activeSlide.customBgTo,
      textColor: '#ffffff',
      deviceFrame: activeSlide.deviceFrame,
      deviceAngle: activeSlide.deviceAngle,
      deviceTheme: activeSlide.deviceTheme,
      devicePosition: activeSlide.devicePosition,
      textPosition: 'top',
      showShadow: true,
      phoneScale: 1.0,
      phoneOffsetX: 0,
      phoneOffsetY: 0,
      phoneRotation: 0,
      textOffsetY: 0,
      headlineFontSize: 70,
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

  // Reset slide transforms
  const handleResetTransforms = () => {
    updateActiveSlide({
      phoneScale: 1.0,
      phoneOffsetX: 0,
      phoneOffsetY: 0,
      phoneRotation: 0,
      textOffsetY: 0,
      headlineFontSize: 70,
    });
  };

  // Apply current background / template to all slides
  const handleApplyBgToAll = () => {
    setSlides((prev) =>
      prev.map((s) => ({
        ...s,
        templateStyle: activeSlide.templateStyle,
        bgGradientId: activeSlide.bgGradientId,
        customBgFrom: activeSlide.customBgFrom,
        customBgTo: activeSlide.customBgTo,
      }))
    );
  };

  // Apply device frame & angle to all slides
  const handleApplyDeviceToAll = () => {
    setSlides((prev) =>
      prev.map((s) => ({
        ...s,
        deviceFrame: activeSlide.deviceFrame,
        deviceAngle: activeSlide.deviceAngle,
        deviceTheme: activeSlide.deviceTheme,
        devicePosition: activeSlide.devicePosition,
        phoneScale: activeSlide.phoneScale,
      }))
    );
  };

  // Apply global template style change
  const handleChangeTemplateStyle = (style: TemplateStyle) => {
    setGlobalTemplateStyle(style);
    setSlides((prev) =>
      prev.map((s) => ({
        ...s,
        templateStyle: style,
      }))
    );
  };

  // ─── Export / Import Project Blueprint (JSON) ───
  const handleExportProjectJson = () => {
    const projectData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: customKeyword || 'Mobile App',
      slides,
      selectedSize,
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    saveAs(blob, `app_screenshots_project_${Date.now()}.json`);
    setSaveNotice(lang === 'ar' ? 'تم تصدير ملف التصميم بنجاح!' : 'Project file exported!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleImportProjectJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          setSlides(parsed.slides);
          setActiveSlideIndex(0);
          setSaveNotice(lang === 'ar' ? 'تم استيراد التصميم بنجاح!' : 'Project imported successfully!');
          setTimeout(() => setSaveNotice(null), 3000);
        }
      } catch {
        alert(lang === 'ar' ? 'ملف التصميم غير صالح' : 'Invalid project JSON file');
      }
    };
    reader.readAsText(file);
  };

  // ─── Batch Raw Screenshots Upload ───
  const processBatchFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    const readers = validFiles.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((images) => {
      setSlides((prev) => {
        const newSlides = [...prev];
        images.forEach((imgSrc, i) => {
          if (i < newSlides.length) {
            newSlides[i] = { ...newSlides[i], imageSrc: imgSrc };
          } else if (newSlides.length < 8) {
            newSlides.push({
              id: `slide-${Date.now()}-${i}`,
              headline:
                lang === 'ar'
                  ? `ميزة رقم ${i + 1}`
                  : lang === 'fr'
                  ? `Fonctionnalité ${i + 1}`
                  : `Key Feature ${i + 1}`,
              subtitle:
                lang === 'ar'
                  ? 'اكتشف كيف يساعدك التطبيق في إنجاز ذلك'
                  : lang === 'fr'
                  ? 'Découvrez comment votre application simplifie votre quotidien'
                  : 'Experience seamless interactions designed for high conversion',
              badge: lang === 'ar' ? 'جديد' : lang === 'fr' ? 'NOUVEAU' : 'NEW',
              showBadge: false,
              imageSrc: imgSrc,
              templateStyle: globalTemplateStyle,
              bgGradientId: activeSlide.bgGradientId,
              customBgFrom: activeSlide.customBgFrom,
              customBgTo: activeSlide.customBgTo,
              textColor: '#ffffff',
              deviceFrame: activeSlide.deviceFrame,
              deviceAngle: activeSlide.deviceAngle,
              deviceTheme: activeSlide.deviceTheme,
              devicePosition: activeSlide.devicePosition,
              textPosition: 'top',
              showShadow: true,
              phoneScale: 1.0,
              phoneOffsetX: 0,
              phoneOffsetY: 0,
              phoneRotation: 0,
              textOffsetY: 0,
              headlineFontSize: 70,
            });
          }
        });
        return newSlides;
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    });
  };

  // Single file upload for active slide
  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      updateActiveSlide({ imageSrc: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  // ─── AI ASO Copy Application ───
  const handleApplyAiCopy = () => {
    const generated = generateSmartCopy(selectedCategory, customKeyword, lang === 'ar' ? 'ar' : 'en');
    setSlides((prev) => {
      return prev.map((slide, i) => {
        const copyItem = generated[i % generated.length];
        const isAr = lang === 'ar';
        return {
          ...slide,
          badge: isAr ? copyItem.badge.ar : copyItem.badge.en,
          showBadge: true,
          headline: isAr ? copyItem.headline.ar : copyItem.headline.en,
          subtitle: isAr ? copyItem.subtitle.ar : copyItem.subtitle.en,
        };
      });
    });
    setAiGeneratedSuccess(true);
    setTimeout(() => {
      setAiGeneratedSuccess(false);
      setIsAiModalOpen(false);
    }, 900);
  };

  // ─── Canvas Helper Functions ───
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

  // ─── Interactive Mouse/Touch Pointer Events on Canvas ───
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDraggingCanvas(true);

    const rect = canvas.getBoundingClientRect();
    const clickYRatio = (e.clientY - rect.top) / rect.height;

    // If clicked on top 35%, target is text, otherwise device
    const target = clickYRatio < 0.35 ? 'text' : 'device';
    setDragTarget(target);

    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragInitialOffsets.current = {
      phoneX: activeSlide.phoneOffsetX || 0,
      phoneY: activeSlide.phoneOffsetY || 0,
      textY: activeSlide.textOffsetY || 0,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingCanvas) return;

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;

    // Scale delta relative to canvas display size
    const sensitivity = 2.2;

    if (dragTarget === 'device') {
      updateActiveSlide({
        phoneOffsetX: Math.round(dragInitialOffsets.current.phoneX + deltaX * sensitivity),
        phoneOffsetY: Math.round(dragInitialOffsets.current.phoneY + deltaY * sensitivity),
      });
    } else {
      updateActiveSlide({
        textOffsetY: Math.round(dragInitialOffsets.current.textY + deltaY * sensitivity),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      try {
        canvasRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    setIsDraggingCanvas(false);
  };

  // ─── Master Render Canvas Pipeline ───
  const renderSlideToCanvas = useCallback(
    async (
      canvas: HTMLCanvasElement,
      slide: Slide,
      slideIdx: number,
      totalCount: number,
      targetWidth: number,
      targetHeight: number
    ): Promise<void> => {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scale = targetWidth / 1080;

      // ─── 1. Draw Background According to Template Style ───
      let fromColor = slide.customBgFrom;
      let toColor = slide.customBgTo;
      const preset = GRADIENT_PRESETS.find((p) => p.id === slide.bgGradientId);
      if (preset) {
        fromColor = preset.from;
        toColor = preset.to;
      }

      if (slide.templateStyle === 'panoramic') {
        const grad = ctx.createLinearGradient(
          -targetWidth * slideIdx,
          0,
          targetWidth * (totalCount - slideIdx),
          targetHeight
        );
        grad.addColorStop(0, fromColor);
        grad.addColorStop(0.5, toColor);
        grad.addColorStop(1, fromColor);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Connected visual glowing ribbon across slides
        ctx.save();
        ctx.beginPath();
        const waveStartX = -targetWidth * 0.2;
        const waveEndX = targetWidth * 1.2;
        const waveCenterY = targetHeight * 0.45 + Math.sin(slideIdx * 1.5) * 80 * scale;
        ctx.moveTo(waveStartX, waveCenterY);
        ctx.bezierCurveTo(
          targetWidth * 0.25,
          waveCenterY - 180 * scale,
          targetWidth * 0.75,
          waveCenterY + 180 * scale,
          waveEndX,
          waveCenterY - 60 * scale
        );
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 14 * scale;
        ctx.stroke();

        const auraX = targetWidth * (slideIdx % 2 === 0 ? 0.3 : 0.7);
        const auraY = targetHeight * 0.4;
        const auraGrad = ctx.createRadialGradient(auraX, auraY, 40 * scale, auraX, auraY, targetWidth * 0.6);
        auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.restore();
      } else if (slide.templateStyle === 'minimalist') {
        ctx.fillStyle = '#090a0f';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        ctx.save();
        const spotGrad = ctx.createRadialGradient(
          targetWidth * 0.5,
          0,
          10 * scale,
          targetWidth * 0.5,
          targetHeight * 0.5,
          targetWidth * 0.75
        );
        spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
        spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spotGrad;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1.5 * scale;
        for (let i = 80 * scale; i < targetWidth; i += 160 * scale) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, targetHeight);
          ctx.stroke();
        }
        ctx.restore();
      } else {
        const grad = ctx.createLinearGradient(0, 0, targetWidth * 0.8, targetHeight);
        grad.addColorStop(0, fromColor);
        grad.addColorStop(1, toColor);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        ctx.save();
        const glowGrad = ctx.createRadialGradient(
          targetWidth * 0.5,
          targetHeight * 0.5,
          targetWidth * 0.08,
          targetWidth * 0.5,
          targetHeight * 0.5,
          targetWidth * 0.65
        );
        glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.restore();
      }

      // ─── 2. Draw Marketing Typography (Badge, Headline, Subtitle) ───
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const userTextOffsetY = (slide.textOffsetY || 0) * scale;
      let textStartY = (slide.textPosition === 'top' ? 140 * scale : targetHeight - 480 * scale) + userTextOffsetY;

      // Marketing Badge
      if (slide.showBadge && slide.badge.trim()) {
        ctx.font = `bold ${26 * scale}px system-ui, -apple-system, sans-serif`;
        const badgeMetrics = ctx.measureText(slide.badge.toUpperCase());
        const badgePaddingX = 28 * scale;
        const badgeHeight = 54 * scale;
        const badgeWidth = badgeMetrics.width + badgePaddingX * 2;
        const badgeX = targetWidth / 2 - badgeWidth / 2;

        drawRoundedRect(ctx, badgeX, textStartY, badgeWidth, badgeHeight, badgeHeight / 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.8 * scale;
        ctx.stroke();

        ctx.fillStyle = slide.textColor;
        ctx.fillText(slide.badge.toUpperCase(), targetWidth / 2, textStartY + 13 * scale);
        textStartY += 82 * scale;
      }

      // Headline
      const headlineSize = (slide.headlineFontSize || 70) * scale;
      ctx.font = `900 ${headlineSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = slide.textColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 18 * scale;
      ctx.shadowOffsetY = 6 * scale;

      const afterHeadlineY = drawWrappedText(
        ctx,
        slide.headline,
        targetWidth / 2,
        textStartY,
        targetWidth - 160 * scale,
        headlineSize * 1.2
      );

      // Subtitle
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.font = `500 ${34 * scale}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      drawWrappedText(
        ctx,
        slide.subtitle,
        targetWidth / 2,
        afterHeadlineY + 10 * scale,
        targetWidth - 220 * scale,
        48 * scale
      );
      ctx.restore();

      // ─── 3. Draw Device Mockup & Screenshot ───
      const isTablet = slide.deviceFrame === 'tablet';
      const userScale = slide.phoneScale || 1.0;
      const phoneWidth = (isTablet ? 900 : 780) * scale * userScale;
      const phoneHeight = (isTablet ? 1350 : 1620) * scale * userScale;

      const userOffsetX = (slide.phoneOffsetX || 0) * scale;
      const userOffsetY = (slide.phoneOffsetY || 0) * scale;

      const phoneX = (targetWidth - phoneWidth) / 2 + userOffsetX;

      let phoneY = targetHeight - phoneHeight * 0.88 + userOffsetY;
      if (slide.devicePosition === 'bottom-fit') {
        phoneY = targetHeight - phoneHeight - 60 * scale + userOffsetY;
      } else if (slide.devicePosition === 'centered' || slide.deviceAngle === 'floating') {
        phoneY = (targetHeight - phoneHeight) / 2 + 100 * scale + userOffsetY;
      }

      ctx.save();

      // Handle 3D / Isometric Angle & Free Rotation Transforms
      const centerX = phoneX + phoneWidth / 2;
      const centerY = phoneY + phoneHeight / 2;

      let rotationDegrees = slide.phoneRotation || 0;
      if (slide.deviceAngle === 'tilted-right') rotationDegrees += 6.5;
      if (slide.deviceAngle === 'tilted-left') rotationDegrees -= 6.5;

      if (rotationDegrees !== 0) {
        ctx.translate(centerX, centerY);
        ctx.rotate((rotationDegrees * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
      }

      // Device Drop Shadow
      if (slide.showShadow) {
        ctx.save();
        if (slide.deviceAngle === 'floating') {
          ctx.beginPath();
          ctx.ellipse(centerX, phoneY + phoneHeight + 70 * scale, phoneWidth * 0.42, 28 * scale, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
          ctx.filter = `blur(${20 * scale}px)`;
          ctx.fill();
        } else {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 64 * scale;
          ctx.shadowOffsetY = 36 * scale;
          ctx.shadowOffsetX =
            slide.deviceAngle === 'tilted-left' ? 18 * scale : slide.deviceAngle === 'tilted-right' ? -18 * scale : 0;
          drawRoundedRect(ctx, phoneX, phoneY, phoneWidth, phoneHeight, (isTablet ? 40 : 64) * scale);
          ctx.fillStyle = '#090a0f';
          ctx.fill();
        }
        ctx.restore();
      }

      // Device Outer Frame
      ctx.save();
      const cornerRadius = (isTablet ? 40 : 64) * scale;
      drawRoundedRect(ctx, phoneX, phoneY, phoneWidth, phoneHeight, cornerRadius);

      let frameFill = '#111318';
      let frameStroke = '#27272a';
      if (slide.deviceTheme === 'silver') {
        frameFill = '#e2e8f0';
        frameStroke = '#94a3b8';
      } else if (slide.deviceTheme === 'gold') {
        frameFill = '#fef3c7';
        frameStroke = '#d97706';
      }

      ctx.fillStyle = frameFill;
      ctx.fill();
      ctx.lineWidth = (isTablet ? 10 : 8) * scale;
      ctx.strokeStyle = frameStroke;
      ctx.stroke();

      // Screen Inner Clipping
      const screenMargin = (isTablet ? 14 : 16) * scale;
      const screenX = phoneX + screenMargin;
      const screenY = phoneY + screenMargin;
      const screenW = phoneWidth - screenMargin * 2;
      const screenH = phoneHeight - screenMargin * 2;
      const screenRadius = (isTablet ? 32 : 52) * scale;

      ctx.save();
      drawRoundedRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
      ctx.clip();

      ctx.fillStyle = '#090d16';
      ctx.fillRect(screenX, screenY, screenW, screenH);

      // Draw screenshot inside phone
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
            renderY = screenY;
          }

          ctx.drawImage(img, renderX, renderY, renderW, renderH);
        } catch {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(screenX, screenY, screenW, screenH);
        }
      }

      // Draw Notch / Camera Hardware Accent
      if (slide.deviceFrame === 'iphone') {
        const pillW = 144 * scale;
        const pillH = 36 * scale;
        drawRoundedRect(ctx, phoneX + phoneWidth / 2 - pillW / 2, screenY + 18 * scale, pillW, pillH, pillH / 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
      } else if (slide.deviceFrame === 'pixel') {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(phoneX + phoneWidth / 2, screenY + 28 * scale, 15 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (slide.deviceFrame === 'tablet') {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(phoneX + phoneWidth / 2, screenY + 12 * scale, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // end screen clip
      ctx.restore(); // end device outer frame
      ctx.restore(); // end 3d transform context
    },
    []
  );

  // Trigger live preview canvas re-render
  useEffect(() => {
    if (canvasRef.current) {
      renderSlideToCanvas(
        canvasRef.current,
        activeSlide,
        activeSlideIndex,
        slides.length,
        selectedSize.width,
        selectedSize.height
      );
    }
  }, [activeSlide, activeSlideIndex, slides.length, selectedSize, renderSlideToCanvas]);

  // ─── Single Download (PNG) ───
  const handleDownloadSingle = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `screenshot_${selectedSize.width}x${selectedSize.height}_slide_${activeSlideIndex + 1}.png`);
      }
    }, 'image/png');
  };

  // ─── 1-Click Multi-Store Organized ZIP Export ───
  const handleDownloadAllStoresZip = async () => {
    setIsExportingZip(true);
    setExportProgress(0);
    setExportStatusText(lang === 'ar' ? 'جاري تجهيز حزم المتاجر...' : 'Preparing store packages...');

    try {
      const zip = new JSZip();

      const googleFolder = zip.folder('01_Google_Play_Phone_1080x2400')!;
      const appleFolder = zip.folder('02_Apple_App_Store_6.7_1290x2796')!;
      const tabletFolder = zip.folder('03_Optional_Tablets_1200x1920')!;

      const offCanvas = document.createElement('canvas');
      const totalSteps = slides.length * 3;
      let completedSteps = 0;

      // 1. Google Play Phone (1080 x 2400)
      for (let i = 0; i < slides.length; i++) {
        setExportStatusText(
          lang === 'ar'
            ? `توليد لقطات Google Play (1080×2400) - شريحة ${i + 1} من ${slides.length}`
            : `Rendering Google Play (1080x2400) - Slide ${i + 1} of ${slides.length}`
        );
        await renderSlideToCanvas(offCanvas, slides[i], i, slides.length, 1080, 2400);
        const blob = await new Promise<Blob | null>((resolve) => offCanvas.toBlob(resolve, 'image/png'));
        if (blob) googleFolder.file(`0${i + 1}_play_store_1080x2400.png`, blob);
        completedSteps++;
        setExportProgress(Math.round((completedSteps / totalSteps) * 100));
      }

      // 2. Apple App Store 6.7" iPhone (1290 x 2796)
      for (let i = 0; i < slides.length; i++) {
        setExportStatusText(
          lang === 'ar'
            ? `توليد لقطات App Store (1290×2796) - شريحة ${i + 1} من ${slides.length}`
            : `Rendering App Store (1290x2796) - Slide ${i + 1} of ${slides.length}`
        );
        await renderSlideToCanvas(offCanvas, slides[i], i, slides.length, 1290, 2796);
        const blob = await new Promise<Blob | null>((resolve) => offCanvas.toBlob(resolve, 'image/png'));
        if (blob) appleFolder.file(`0${i + 1}_app_store_6.7_1290x2796.png`, blob);
        completedSteps++;
        setExportProgress(Math.round((completedSteps / totalSteps) * 100));
      }

      // 3. Tablet Presets (1200 x 1920)
      for (let i = 0; i < slides.length; i++) {
        setExportStatusText(
          lang === 'ar'
            ? `توليد لقطات التابلت (1200×1920) - شريحة ${i + 1} من ${slides.length}`
            : `Rendering Tablets (1200x1920) - Slide ${i + 1} of ${slides.length}`
        );
        await renderSlideToCanvas(offCanvas, slides[i], i, slides.length, 1200, 1920);
        const blob = await new Promise<Blob | null>((resolve) => offCanvas.toBlob(resolve, 'image/png'));
        if (blob) tabletFolder.file(`0${i + 1}_tablet_1200x1920.png`, blob);
        completedSteps++;
        setExportProgress(Math.round((completedSteps / totalSteps) * 100));
      }

      const guideContent = `=======================================================
App Store & Google Play Screenshots Studio Bundle
Generated via Appifya Studio (https://www.appifya.app)
=======================================================

📁 /01_Google_Play_Phone_1080x2400/
   - Resolution: 1080 x 2400 px (9:20 Aspect Ratio)
   - Official specs: Minimum 1080px, max 3840px. 16:9 or 9:20.
   - Upload location: Google Play Console > Main Store Listing > Phone Screenshots.

📁 /02_Apple_App_Store_6.7_1290x2796/
   - Resolution: 1290 x 2796 px (19.5:9 Aspect Ratio)
   - Required for iPhone 16 Pro Max, iPhone 15 Pro Max, 14 Pro Max.
   - Upload location: App Store Connect > iOS App > 6.7" Display.

📁 /03_Optional_Tablets_1200x1920/
   - Resolution: 1200 x 1920 px (10:16 Aspect Ratio)
   - Ideal for Google Play 7-inch & 10-inch tablets.
`;
      zip.file('README_STORE_SPECS.txt', guideContent);

      setExportStatusText(lang === 'ar' ? 'جاري ضغط الملفات...' : 'Packaging ZIP archive...');
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `AppStore_and_GooglePlay_Screenshots_Bundle.zip`);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      alert(lang === 'ar' ? 'حدث خطأ أثناء تصدير حزمة المتاجر' : 'Failed to export store packages');
    } finally {
      setIsExportingZip(false);
      setExportProgress(0);
      setExportStatusText('');
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
          {lang === 'ar' ? 'استوديو لقطات شاشات المتاجر' : 'App Store & Play Store Screenshot Studio'}
        </span>
      </nav>

      {/* ─── Hero Header & Persistence Status Bar ─── */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3.5 py-1 text-xs font-bold text-violet-400 mb-2 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {lang === 'ar'
                ? 'محرر كانفاس تفاعلي · حفظ تلقائي مستمر · تصدير 100% بدون خادم'
                : 'Interactive Canvas · Auto-Saved Project · 100% Client-Side Render'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            App Store & Play Store{' '}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent">
              Screenshot Studio
            </span>
          </h1>
        </div>

        {/* Persistence Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {saveNotice && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {saveNotice}
            </span>
          )}

          <button
            type="button"
            onClick={handleExportProjectJson}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            title={lang === 'ar' ? 'تصدير نسخة احتياطية من المشروع' : 'Backup Project File'}
          >
            <FileDown className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'تصدير المشروع' : 'Backup JSON'}</span>
          </button>

          <input
            id={importFileId}
            type="file"
            accept=".json"
            onChange={handleImportProjectJson}
            className="hidden"
          />
          <label
            htmlFor={importFileId}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer transition-colors flex items-center gap-1.5"
            title={lang === 'ar' ? 'استيراد مشروع سابق' : 'Restore Project File'}
          >
            <FileUp className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'استيراد' : 'Restore'}</span>
          </label>

          {!user ? (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold flex items-center gap-1.5"
            >
              <Cloud className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'مزامنة السحابة' : 'Cloud Sync'}</span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span className="hidden sm:inline">{user.name || user.email}</span>
            </span>
          )}
        </div>
      </div>

      {/* ─── Fast Batch Upload Dropzone ─── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingBatch(true);
        }}
        onDragLeave={() => setIsDraggingBatch(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingBatch(false);
          if (e.dataTransfer.files) {
            processBatchFiles(e.dataTransfer.files);
          }
        }}
        className={`mb-6 rounded-2xl border-2 border-dashed p-4 sm:p-5 transition-all text-center ${
          isDraggingBatch
            ? 'border-violet-500 bg-violet-500/15 scale-[1.01]'
            : 'border-slate-700/80 bg-slate-900/60 hover:border-violet-500/50 hover:bg-slate-900/90'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right sm:text-left">
            <div className="h-10 w-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/30">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {lang === 'ar'
                  ? 'الرفع السريع للقطات الشاشة الخام (دفعة واحدة)'
                  : 'Batch Upload Raw Screenshots (1 to 8 images)'}
              </p>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'اسحب كل صور تطبيقك، وستقوم الأداة بتركيبها داخل الهواتف وتوزيعها على الشرائح تلقائياً!'
                  : 'Drag & drop all screens at once. The studio automatically places them inside device frames!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              id={batchUploadId}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && processBatchFiles(e.target.files)}
              className="hidden"
            />
            <label
              htmlFor={batchUploadId}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'اختيار عدة صور' : 'Select Multiple Images'}</span>
            </label>

            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-violet-500/30 text-violet-300 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Wand2 className="h-3.5 w-3.5 text-violet-400" />
              <span>{lang === 'ar' ? 'مساعد النصوص الذكي ✨' : 'AI ASO Copy ✨'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Slide Manager Tabs & Actions ─── */}
      <div className="mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSlideIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeSlideIndex === idx
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{lang === 'ar' ? `شريحة ${idx + 1}` : `Slide ${idx + 1}`}</span>
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
                  className="hover:text-rose-400 p-0.5 rounded cursor-pointer"
                  title={lang === 'ar' ? 'حذف الشريحة' : 'Delete slide'}
                >
                  <Trash2 className="h-3 w-3" />
                </span>
              )}
            </button>
          ))}

          {slides.length < 8 && (
            <button
              type="button"
              onClick={handleAddSlide}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-dashed border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'إضافة' : 'Add'}</span>
            </button>
          )}
        </div>

        {/* Global Slide Actions & Resolution Selector */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDuplicateSlide}
            disabled={slides.length >= 8}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'نسخ الشريحة' : 'Duplicate'}</span>
          </button>

          <select
            value={selectedSize.id}
            onChange={(e) => {
              const found = SIZE_PRESETS.find((p) => p.id === e.target.value);
              if (found) setSelectedSize(found);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            {SIZE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Main Studio Grid: Controls & Interactive Live Canvas ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Top Editor Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Segmented Controls Nav */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('template')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'template' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'القالب' : 'Template'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mockup')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'mockup' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'الجهاز' : 'Device'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'text' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'النصوص' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('adjust')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'adjust' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'التحريك' : 'Canvas'}</span>
            </button>
          </div>

          {/* ─── TAB 1: Template & Presets ─── */}
          {activeTab === 'template' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  {lang === 'ar' ? 'أسلوب القالب (Preset Style)' : 'Preset Style'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleChangeTemplateStyle('gradient')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      globalTemplateStyle === 'gradient'
                        ? 'border-violet-500 bg-violet-500/15 text-white font-bold'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="h-5 w-full rounded bg-gradient-to-r from-violet-500 to-indigo-500 mb-2"></div>
                    <span className="text-xs block">{lang === 'ar' ? 'تدرج زاهي' : 'Modern Gradient'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChangeTemplateStyle('panoramic')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      globalTemplateStyle === 'panoramic'
                        ? 'border-violet-500 bg-violet-500/15 text-white font-bold'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="h-5 w-full rounded bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 mb-2"></div>
                    <span className="text-xs block">{lang === 'ar' ? 'شاشات متصلة' : 'Panoramic Flow'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChangeTemplateStyle('minimalist')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      globalTemplateStyle === 'minimalist'
                        ? 'border-violet-500 bg-violet-500/15 text-white font-bold'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="h-5 w-full rounded bg-gradient-to-r from-slate-900 via-slate-800 to-black mb-2 border border-slate-700"></div>
                    <span className="text-xs block">{lang === 'ar' ? 'تجريدي فاخر' : 'Minimalist'}</span>
                  </button>
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {lang === 'ar' ? 'باليت الألوان' : 'Color Palette'}
                  </label>
                  <button
                    type="button"
                    onClick={handleApplyBgToAll}
                    className="text-xs text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                  >
                    {lang === 'ar' ? 'تعميم على الكل' : 'Apply to all slides'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
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
                      className={`h-11 rounded-xl p-1 border transition-all cursor-pointer relative overflow-hidden ${
                        activeSlide.bgGradientId === g.id
                          ? 'border-white scale-105 shadow-md shadow-white/20'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                      }}
                      title={g.name}
                    >
                      {activeSlide.bgGradientId === g.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">
                    {lang === 'ar' ? 'لون البداية' : 'Gradient Start'}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeSlide.customBgFrom}
                      onChange={(e) =>
                        updateActiveSlide({
                          customBgFrom: e.target.value,
                          bgGradientId: 'custom',
                        })
                      }
                      className="h-8 w-10 bg-transparent rounded cursor-pointer border border-slate-700"
                    />
                    <span className="text-xs font-mono text-slate-300">{activeSlide.customBgFrom}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">
                    {lang === 'ar' ? 'لون النهاية' : 'Gradient End'}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeSlide.customBgTo}
                      onChange={(e) =>
                        updateActiveSlide({
                          customBgTo: e.target.value,
                          bgGradientId: 'custom',
                        })
                      }
                      className="h-8 w-10 bg-transparent rounded cursor-pointer border border-slate-700"
                    />
                    <span className="text-xs font-mono text-slate-300">{activeSlide.customBgTo}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: Device Mockup & 3D Angles ─── */}
          {activeTab === 'mockup' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  {lang === 'ar' ? 'صورة الشريحة الحالية' : 'Active Slide Screenshot'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={fileUploadId}
                    type="file"
                    accept="image/*"
                    onChange={handleSingleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor={fileUploadId}
                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5 text-violet-400" />
                    <span>{lang === 'ar' ? 'رفع لقطة لهذه الشريحة' : 'Upload for this slide'}</span>
                  </label>
                </div>
              </div>

              {/* Device Frame Model */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  {lang === 'ar' ? 'نوع إطار الجهاز' : 'Device Model'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateActiveSlide({ deviceFrame: 'iphone' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeSlide.deviceFrame === 'iphone'
                        ? 'border-violet-500 bg-violet-500/15 text-white'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>iPhone 16 Pro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateActiveSlide({ deviceFrame: 'pixel' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeSlide.deviceFrame === 'pixel'
                        ? 'border-violet-500 bg-violet-500/15 text-white'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Pixel 9 Pro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateActiveSlide({ deviceFrame: 'tablet' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeSlide.deviceFrame === 'tablet'
                        ? 'border-violet-500 bg-violet-500/15 text-white'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Tablet className="h-4 w-4" />
                    <span>Tablet / iPad</span>
                  </button>
                </div>
              </div>

              {/* 3D Angle & Perspective */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  {lang === 'ar' ? 'زاوية العرض والتجسيم (3D Angle)' : 'Device Angle & 3D Tilt'}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateActiveSlide({ deviceAngle: 'straight' })}
                    className={`py-2 text-center rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      activeSlide.deviceAngle === 'straight'
                        ? 'border-violet-500 bg-violet-500/15 text-white'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {lang === 'ar' ? 'مستقيم' : 'Straight'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateActiveSlide({ deviceAngle: 'tilted-right' })}
                    className={`py-2 text-center rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      activeSlide.deviceAngle === 'tilted-right'
                        ? 'border-violet-500 bg-violet-500/15 text-white'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {lang === 'ar' ? 'مائل يميناً' : 'Tilt Right'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateActiveSlide({ deviceAngle: 'tilted-left' })}
                    className={`py-2 text-center rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      activeSlide.deviceAngle === 'tilted-left'
                        ? 'border-violet-500 bg-violet-500/15 text-white'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {lang === 'ar' ? 'مائل يساراً' : 'Tilt Left'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateActiveSlide({ deviceAngle: 'floating' })}
                    className={`py-2 text-center rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      activeSlide.deviceAngle === 'floating'
                        ? 'border-violet-500 bg-violet-500/15 text-white'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {lang === 'ar' ? 'طافي' : 'Floating'}
                  </button>
                </div>
              </div>

              {/* Theme & Position */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {lang === 'ar' ? 'لون إطار الهاتف' : 'Frame Finish'}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateActiveSlide({ deviceTheme: 'dark' })}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium ${
                        activeSlide.deviceTheme === 'dark'
                          ? 'border-violet-500 bg-slate-950 text-white'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => updateActiveSlide({ deviceTheme: 'silver' })}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium ${
                        activeSlide.deviceTheme === 'silver'
                          ? 'border-violet-500 bg-slate-200 text-slate-900 font-bold'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      Titanium
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {lang === 'ar' ? 'موضع الهاتف' : 'Frame Position'}
                  </label>
                  <select
                    value={activeSlide.devicePosition}
                    onChange={(e) => updateActiveSlide({ devicePosition: e.target.value as DevicePosition })}
                    className="w-full py-1.5 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
                  >
                    <option value="bottom-cut">{lang === 'ar' ? 'مقطوع من الأسفل' : 'Bottom Cutout'}</option>
                    <option value="bottom-fit">{lang === 'ar' ? 'كامل بالأسفل' : 'Bottom Fit'}</option>
                    <option value="centered">{lang === 'ar' ? 'في المنتصف' : 'Centered'}</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApplyDeviceToAll}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                >
                  {lang === 'ar' ? 'تطبيق إعدادات الجهاز على جميع الشرائح' : 'Apply device settings to all slides'}
                </button>
              </div>
            </div>
          )}

          {/* ─── TAB 3: Marketing Copy (Headline & Subtitle) ─── */}
          {activeTab === 'text' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {lang === 'ar' ? 'العنوان التسويقي الرئيسي' : 'Headline Title'}
                  </label>
                  <span className="text-[10px] text-slate-400">{activeSlide.headline.length}/40</span>
                </div>
                <input
                  type="text"
                  value={activeSlide.headline}
                  onChange={(e) => updateActiveSlide({ headline: e.target.value })}
                  placeholder={lang === 'ar' ? 'مثال: تتبع طلباتك بدقة فائقة' : 'e.g. Ultra Fast Doorstep Delivery'}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {lang === 'ar' ? 'العنوان الفرعي التوضيحي' : 'Subtitle Description'}
                  </label>
                  <span className="text-[10px] text-slate-400">{activeSlide.subtitle.length}/90</span>
                </div>
                <textarea
                  rows={2}
                  value={activeSlide.subtitle}
                  onChange={(e) => updateActiveSlide({ subtitle: e.target.value })}
                  placeholder={
                    lang === 'ar'
                      ? 'مثال: خريطة حية لإشعارك بمكان السائق لحظة بلحظة'
                      : 'e.g. Real-time GPS location with instant courier notifications'
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Badge Toggle & Input */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {lang === 'ar' ? 'شارة تسويقية علوية (Badge)' : 'Top Marketing Badge'}
                  </label>
                  <input
                    type="checkbox"
                    checked={activeSlide.showBadge}
                    onChange={(e) => updateActiveSlide({ showBadge: e.target.checked })}
                    className="h-4 w-4 rounded accent-violet-600"
                  />
                </div>
                {activeSlide.showBadge && (
                  <input
                    type="text"
                    value={activeSlide.badge}
                    onChange={(e) => updateActiveSlide({ badge: e.target.value })}
                    placeholder={lang === 'ar' ? 'مثال: ★ تقييم 4.9' : 'e.g. ★ 4.9 RATED'}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                )}
              </div>

              {/* Position and Color */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {lang === 'ar' ? 'موضع النص' : 'Text Placement'}
                  </label>
                  <select
                    value={activeSlide.textPosition}
                    onChange={(e) => updateActiveSlide({ textPosition: e.target.value as 'top' | 'bottom' })}
                    className="w-full py-1.5 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
                  >
                    <option value="top">{lang === 'ar' ? 'في الأعلى' : 'Top'}</option>
                    <option value="bottom">{lang === 'ar' ? 'في الأسفل' : 'Bottom'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {lang === 'ar' ? 'لون الخط' : 'Text Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeSlide.textColor}
                      onChange={(e) => updateActiveSlide({ textColor: e.target.value })}
                      className="h-8 w-10 bg-transparent rounded cursor-pointer border border-slate-700"
                    />
                    <span className="text-xs font-mono text-slate-300">{activeSlide.textColor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 4: Interactive Canvas Repositioning (Fabric/Konva Style) ─── */}
          {activeTab === 'adjust' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">
                  {lang === 'ar' ? 'التحكم الحر في الكانفاس (Direct Manipulation)' : 'Canvas Fine-Tuning'}
                </span>
                <button
                  type="button"
                  onClick={handleResetTransforms}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Undo2 className="h-3 w-3" />
                  <span>{lang === 'ar' ? 'إعادة ضبط' : 'Reset'}</span>
                </button>
              </div>

              {/* Drag on canvas instruction banner */}
              <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-xs text-violet-300 flex items-center gap-2">
                <Move className="h-4 w-4 shrink-0 text-violet-400" />
                <span>
                  {lang === 'ar'
                    ? 'يمكنك سحب الهاتف أو النص مباشرة بالفأرة/اللمس على شاشة المعاينة لتحريكهما!'
                    : 'Tip: You can drag the phone or text directly on the canvas preview to position them freely!'}
                </span>
              </div>

              {/* Sliders for precise pixel control */}
              <div className="space-y-3">
                {/* Scale */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{lang === 'ar' ? 'حجم الهاتف (Scale)' : 'Device Scale'}</span>
                    <span className="font-mono text-violet-400">
                      {Math.round((activeSlide.phoneScale || 1.0) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.4"
                    step="0.02"
                    value={activeSlide.phoneScale || 1.0}
                    onChange={(e) => updateActiveSlide({ phoneScale: parseFloat(e.target.value) })}
                    className="w-full accent-violet-600"
                  />
                </div>

                {/* Horizontal Offset */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{lang === 'ar' ? 'موضع الهاتف أفقياً (X)' : 'Horizontal Offset (X)'}</span>
                    <span className="font-mono text-violet-400">{activeSlide.phoneOffsetX || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-350"
                    max="350"
                    step="5"
                    value={activeSlide.phoneOffsetX || 0}
                    onChange={(e) => updateActiveSlide({ phoneOffsetX: parseInt(e.target.value) })}
                    className="w-full accent-violet-600"
                  />
                </div>

                {/* Vertical Offset */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{lang === 'ar' ? 'موضع الهاتف رأسياً (Y)' : 'Vertical Offset (Y)'}</span>
                    <span className="font-mono text-violet-400">{activeSlide.phoneOffsetY || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-450"
                    max="450"
                    step="5"
                    value={activeSlide.phoneOffsetY || 0}
                    onChange={(e) => updateActiveSlide({ phoneOffsetY: parseInt(e.target.value) })}
                    className="w-full accent-violet-600"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{lang === 'ar' ? 'زاوية الدوران الحرة' : 'Free Rotation'}</span>
                    <span className="font-mono text-violet-400">{activeSlide.phoneRotation || 0}°</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={activeSlide.phoneRotation || 0}
                    onChange={(e) => updateActiveSlide({ phoneRotation: parseInt(e.target.value) })}
                    className="w-full accent-violet-600"
                  />
                </div>

                {/* Text Y Offset */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{lang === 'ar' ? 'ارتفاع النص (Text Y)' : 'Text Vertical Position'}</span>
                    <span className="font-mono text-violet-400">{activeSlide.textOffsetY || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="5"
                    value={activeSlide.textOffsetY || 0}
                    onChange={(e) => updateActiveSlide({ textOffsetY: parseInt(e.target.value) })}
                    className="w-full accent-violet-600"
                  />
                </div>

                {/* Headline Font Size */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{lang === 'ar' ? 'حجم خط العنوان الرئيسي' : 'Headline Font Size'}</span>
                    <span className="font-mono text-violet-400">{activeSlide.headlineFontSize || 70}px</span>
                  </div>
                  <input
                    type="range"
                    min="44"
                    max="105"
                    step="2"
                    value={activeSlide.headlineFontSize || 70}
                    onChange={(e) => updateActiveSlide({ headlineFontSize: parseInt(e.target.value) })}
                    className="w-full accent-violet-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── 1-Click Export Master Box ─── */}
          <div className="bg-gradient-to-br from-violet-950/40 via-slate-900 to-indigo-950/40 border border-violet-500/30 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderArchive className="h-5 w-5 text-violet-400" />
                <h3 className="text-sm font-bold text-white">
                  {lang === 'ar' ? 'تصدير حزم المتاجر بضغطة زر' : '1-Click Multi-Store Export'}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                100% Free ZIP
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'ar'
                ? 'ينتج ملف ZIP منظم يحتوي على مجلد Google Play (1080×2400)، ومجلد App Store (1290×2796)، وملف إرشادات المقاسات الرسمية جاهزة للرفع مباشرة دون أي فوتوشوب.'
                : 'Outputs a structured ZIP archive containing ready-to-upload Google Play & App Store 6.7" folders, plus official submission guides.'}
            </p>

            {isExportingZip && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{exportStatusText}</span>
                  <span className="font-bold text-violet-400">{exportProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleDownloadAllStoresZip}
                disabled={isExportingZip}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-violet-600/30 disabled:opacity-50 cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <FolderArchive className="h-4 w-4" />
                <span>
                  {isExportingZip
                    ? lang === 'ar'
                      ? 'جاري التوليد والضغط...'
                      : 'Packaging Stores ZIP...'
                    : lang === 'ar'
                    ? 'تصدير حزمة المتجرين (Google Play + App Store) 📦'
                    : 'Export Dual-Store Bundle (ZIP) 📦'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSingle}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                title={lang === 'ar' ? 'تنزيل الشريحة النشطة فقط' : 'Download active slide only'}
              >
                <Download className="h-4 w-4 text-violet-400" />
                <span className="sm:hidden lg:inline">{lang === 'ar' ? 'PNG مفرد' : 'Single PNG'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Right / Bottom Live Interactive Canvas Preview ─── */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
            {/* Live Indicator Bar */}
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-slate-200">
                  {lang === 'ar' ? 'كانفاس تفاعلي مباشر (اسحب للتحريك)' : 'Interactive Canvas (Drag to Move)'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-violet-400">
                {selectedSize.width} × {selectedSize.height} px ({selectedSize.aspect})
              </span>
            </div>

            {/* Canvas Container with Direct Drag Event Handlers */}
            <div
              className={`relative max-w-full flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl border border-slate-800/80 bg-black/40 select-none ${
                isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                  maxHeight: '680px',
                  maxWidth: '100%',
                  height: 'auto',
                  width: 'auto',
                  aspectRatio: `${selectedSize.width} / ${selectedSize.height}`,
                  objectFit: 'contain',
                  touchAction: 'none',
                }}
                className="rounded-2xl transition-all duration-75"
              />

              {/* On-canvas Drag helper pill */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-full text-[10px] text-slate-300 pointer-events-none flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
                <Move className="h-3 w-3 text-violet-400" />
                <span>{lang === 'ar' ? 'اسحب الهاتف أو النص لتحريكهما' : 'Drag phone or text to reposition'}</span>
              </div>
            </div>

            {/* Slide Navigation Under Preview */}
            <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{lang === 'ar' ? 'السابق' : 'Previous'}</span>
              </button>

              <span className="font-bold text-slate-200">
                {lang === 'ar'
                  ? `شريحة ${activeSlideIndex + 1} من ${slides.length}`
                  : `Slide ${activeSlideIndex + 1} of ${slides.length}`}
              </span>

              <button
                type="button"
                onClick={() => setActiveSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0))}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{lang === 'ar' ? 'التالي' : 'Next'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── AI ASO Copy Assistant Modal ─── */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'ar' ? 'مساعد النصوص التسويقية الذكي (AI ASO Copy)' : 'AI Marketing Copy Assistant'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'ar'
                      ? 'اقترح عناوين وشارات تسويقية مقنعة مصممة خصيصاً لمجال تطبيقك'
                      : 'Generate high-converting headlines & badges tailored to your app category'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Category Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                {lang === 'ar' ? 'اختر مجال التطبيق' : 'Select App Category'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {APP_CATEGORIES_COPY.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'border-violet-500 bg-violet-500/20 text-white font-bold shadow-md'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-lg block mb-1">{cat.icon}</span>
                    <span className="text-xs block line-clamp-1">
                      {lang === 'ar' ? cat.name.ar : cat.name.en}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Custom Keyword / App Name */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                {lang === 'ar' ? 'اسم التطبيق أو ميزة رئيسية (اختياري)' : 'App Name or Focus Keyword (Optional)'}
              </label>
              <input
                type="text"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                placeholder={lang === 'ar' ? 'مثال: تطبيق توصيل كافيهات أو محفظة ذكية' : 'e.g. Crypto Vault or FastBite'}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleApplyAiCopy}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/30 flex items-center gap-1.5"
              >
                {aiGeneratedSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span>{lang === 'ar' ? 'تم التطبيق بنجاح!' : 'Applied to All!'}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    <span>{lang === 'ar' ? 'تطبيق النصوص على كل الشرائح' : 'Apply to All Slides'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Educational Guide & Architecture Section ─── */}
      <section className="mt-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
            {lang === 'ar'
              ? 'دليل متطلبات لقطات الشاشة الرسمية لـ Google Play و App Store'
              : 'Official App Store & Google Play Screenshot Guidelines'}
          </h2>
          <p className="text-sm text-slate-400">
            {lang === 'ar'
              ? 'تعتبر لقطات الشاشة العامل الأول المسؤول عن زيادة معدل التحويل (Conversion Rate) في المتاجر بنسبة تصل إلى 40%.'
              : 'Promotional screenshots are the #1 factor impacting store conversion rates, often boosting downloads by up to 40%.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
              <Smartphone className="h-4 w-4" />
              <span>Google Play Store</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'يتطلب المتجر ما بين صورتين إلى 8 صور بنسبة أبعاد 16:9 أو 9:20. الأبعاد القياسية الموصى بها لهواتف أندرويد الحديثة هي 1080×2400 بكسل أو 1080×1920 بكسل بدقة 72 DPI أو أعلى وبصيغة PNG.'
                : 'Requires 2 to 8 screenshots in 16:9 or 9:20 aspect ratio. Recommended standard resolution is 1080 x 2400 px or 1080 x 1920 px (PNG format).'}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-sm">
              <Smartphone className="h-4 w-4" />
              <span>Apple App Store</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'المقاس الأساسي الإلزامي لأجهزة الآيفون الحديثة هو 6.7 بوصة (1290×2796 بكسل) أو 6.5 بوصة (1242×2688 بكسل). متوافق مع iPhone 16 Pro Max و 15 Pro Max.'
                : 'Mandatory standard for modern iOS devices is 6.7" Display (1290 x 2796 px) and 6.5" Display (1242 x 2688 px), supporting iPhone 16 Pro Max / 15 Pro Max.'}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Tablet className="h-4 w-4" />
              <span>Tablets & iPads</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'للحصول على شارة التوافق مع الأجهزة اللوحية والظهور في قسم الموصى بها في Google Play و App Store، يُنصح بإضافة لقطات بدقة 1200×1920 أو 2048×2732.'
                : 'To achieve tablet verification and feature placement in store collections, upload 10" tablet (1200 x 1920 px) and iPad Pro (2048 x 2732 px) graphics.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
