'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n';
import {
  ImageIcon,
  Download,
  Upload,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Zap,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  FileCode,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Icon spec definitions
// ---------------------------------------------------------------------------
interface IconSpec {
  id: string;
  size: number;
  label: string;
  description: string;
  filename: string;
  purpose: 'any' | 'maskable' | 'favicon' | 'apple';
  manifestEntry?: { sizes: string; purpose?: string };
}

const ICON_SPECS: IconSpec[] = [
  {
    id: 'icon-72',
    size: 72,
    label: '72 × 72',
    description: 'Android legacy / low-dpi',
    filename: 'icon-72x72.png',
    purpose: 'any',
    manifestEntry: { sizes: '72x72' },
  },
  {
    id: 'icon-96',
    size: 96,
    label: '96 × 96',
    description: 'Android mdpi',
    filename: 'icon-96x96.png',
    purpose: 'any',
    manifestEntry: { sizes: '96x96' },
  },
  {
    id: 'icon-128',
    size: 128,
    label: '128 × 128',
    description: 'Chrome Web Store',
    filename: 'icon-128x128.png',
    purpose: 'any',
    manifestEntry: { sizes: '128x128' },
  },
  {
    id: 'icon-144',
    size: 144,
    label: '144 × 144',
    description: 'Windows tile / IE',
    filename: 'icon-144x144.png',
    purpose: 'any',
    manifestEntry: { sizes: '144x144' },
  },
  {
    id: 'icon-152',
    size: 152,
    label: '152 × 152',
    description: 'iPad non-Retina iOS 7+',
    filename: 'icon-152x152.png',
    purpose: 'any',
    manifestEntry: { sizes: '152x152' },
  },
  {
    id: 'icon-192',
    size: 192,
    label: '192 × 192',
    description: 'Android home screen — required',
    filename: 'icon-192x192.png',
    purpose: 'any',
    manifestEntry: { sizes: '192x192' },
  },
  {
    id: 'icon-512',
    size: 512,
    label: '512 × 512',
    description: 'Splash screen — required',
    filename: 'icon-512x512.png',
    purpose: 'any',
    manifestEntry: { sizes: '512x512' },
  },
  {
    id: 'maskable-512',
    size: 512,
    label: '512 × 512 Maskable',
    description: 'Android adaptive icon',
    filename: 'icon-512x512-maskable.png',
    purpose: 'maskable',
    manifestEntry: { sizes: '512x512', purpose: 'maskable' },
  },
  {
    id: 'apple-180',
    size: 180,
    label: '180 × 180',
    description: 'Apple touch icon (iOS)',
    filename: 'apple-touch-icon.png',
    purpose: 'apple',
  },
  {
    id: 'favicon-32',
    size: 32,
    label: '32 × 32',
    description: 'Browser tab favicon',
    filename: 'favicon-32x32.png',
    purpose: 'favicon',
  },
];

// Safe-zone padding ratio for maskable icons (80% inner safe area → 10% padding each side)
const MASKABLE_PADDING = 0.1;

// ---------------------------------------------------------------------------
// Canvas helpers
// ---------------------------------------------------------------------------
function renderIcon(
  sourceImage: HTMLImageElement,
  size: number,
  purpose: IconSpec['purpose'],
  bgColor: string,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  if (purpose === 'maskable') {
    // Draw image inside the safe zone (80% of canvas, centered)
    const pad = Math.round(size * MASKABLE_PADDING);
    const inner = size - pad * 2;
    ctx.drawImage(sourceImage, pad, pad, inner, inner);
  } else {
    ctx.drawImage(sourceImage, 0, 0, size, size);
  }

  return canvas.toDataURL('image/png');
}

// dataURL → Uint8Array (strips the header)
function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Minimal ZIP writer (no external dependency)
function buildZip(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const encoder = new TextEncoder();
  const localHeaders: Uint8Array[] = [];
  const centralHeaders: Uint8Array[] = [];
  let offset = 0;

  const crc32 = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    return (buf: Uint8Array) => {
      let crc = 0xffffffff;
      for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
      return (crc ^ 0xffffffff) >>> 0;
    };
  })();

  const u16 = (n: number) => [(n & 0xff), (n >> 8) & 0xff];
  const u32 = (n: number) => [(n & 0xff), (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.data);
    const size = file.data.length;

    const local = new Uint8Array([
      0x50, 0x4b, 0x03, 0x04, // local file header sig
      0x14, 0x00,             // version needed
      0x00, 0x00,             // flags
      0x00, 0x00,             // compression: stored
      0x00, 0x00,             // mod time
      0x00, 0x00,             // mod date
      ...u32(crc),
      ...u32(size),
      ...u32(size),
      ...u16(nameBytes.length),
      0x00, 0x00,             // extra length
      ...nameBytes,
    ]);

    const central = new Uint8Array([
      0x50, 0x4b, 0x01, 0x02, // central dir sig
      0x14, 0x00,             // version made by
      0x14, 0x00,             // version needed
      0x00, 0x00,             // flags
      0x00, 0x00,             // compression
      0x00, 0x00,             // mod time
      0x00, 0x00,             // mod date
      ...u32(crc),
      ...u32(size),
      ...u32(size),
      ...u16(nameBytes.length),
      0x00, 0x00,             // extra length
      0x00, 0x00,             // comment length
      0x00, 0x00,             // disk number start
      0x00, 0x00,             // internal attrs
      0x00, 0x00, 0x00, 0x00, // external attrs
      ...u32(offset),
      ...nameBytes,
    ]);

    localHeaders.push(local);
    localHeaders.push(file.data);
    centralHeaders.push(central);
    offset += local.length + file.data.length;
  }

  const centralStart = offset;
  const centralSize = centralHeaders.reduce((s, b) => s + b.length, 0);

  const eocd = new Uint8Array([
    0x50, 0x4b, 0x05, 0x06, // end of central dir sig
    0x00, 0x00,             // disk number
    0x00, 0x00,             // disk with central dir
    ...u16(files.length),
    ...u16(files.length),
    ...u32(centralSize),
    ...u32(centralStart),
    0x00, 0x00,             // comment length
  ]);

  const parts = [...localHeaders, ...centralHeaders, eocd];
  const total = parts.reduce((s, b) => s + b.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) { out.set(p, pos); pos += p.length; }
  return out;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface GeneratedIcon {
  spec: IconSpec;
  dataUrl: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function IconGeneratorClient() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [icons, setIcons] = useState<GeneratedIcon[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------------------
  // File handling
  // -------------------------------------------------------------------------
  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        lang === 'ar' ? 'يرجى رفع ملف صورة (PNG، JPG، SVG، WebP).' :
        lang === 'fr' ? 'Veuillez télécharger une image (PNG, JPG, SVG, WebP).' :
        'Please upload an image file (PNG, JPG, SVG, WebP).'
      );
      setStatus('error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(
        lang === 'ar' ? 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت.' :
        lang === 'fr' ? 'Fichier trop volumineux. Maximum 10 Mo.' :
        'File too large. Maximum size is 10 MB.'
      );
      setStatus('error');
      return;
    }
    setSourceFile(file);
    setStatus('idle');
    setIcons([]);
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (e) => setSourcePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [lang]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  // -------------------------------------------------------------------------
  // Generation
  // -------------------------------------------------------------------------
  const generate = useCallback(async () => {
    if (!sourcePreview) return;
    setStatus('generating');
    setErrorMsg('');

    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = sourcePreview;
      });

      // Yield to the browser so the "Generating…" state actually renders
      await new Promise((r) => setTimeout(r, 60));

      const results: GeneratedIcon[] = ICON_SPECS.map((spec) => ({
        spec,
        dataUrl: renderIcon(img, spec.size, spec.purpose, bgColor),
      }));

      setIcons(results);
      setStatus('done');
    } catch {
      setErrorMsg(
        lang === 'ar' ? 'تعذّر معالجة الصورة. يرجى المحاولة بصورة أخرى.' :
        lang === 'fr' ? 'Impossible de traiter l\'image. Essayez un autre fichier.' :
        'Could not process the image. Please try a different file.'
      );
      setStatus('error');
    }
  }, [sourcePreview, bgColor, lang]);

  // -------------------------------------------------------------------------
  // Download
  // -------------------------------------------------------------------------
  const downloadAll = useCallback(() => {
    if (!icons.length) return;

    const files = icons.map((icon) => ({
      name: `icons/${icon.spec.filename}`,
      data: dataUrlToBytes(icon.dataUrl),
    }));

    // Append a ready-to-paste manifest snippet
    const manifestIcons = ICON_SPECS
      .filter((s) => s.manifestEntry)
      .map((s) => ({
        src: `/icons/${s.filename}`,
        sizes: s.manifestEntry!.sizes,
        type: 'image/png',
        ...(s.manifestEntry!.purpose ? { purpose: s.manifestEntry!.purpose } : {}),
      }));

    const readmeLines = [
      '# PWA Icons — generated by Appifya Icon Generator',
      '# https://appifya.app/tools/icon-generator',
      '',
      'Place the icons/ folder in your public directory.',
      '',
      '## manifest.json snippet',
      '',
      JSON.stringify({ icons: manifestIcons }, null, 2),
      '',
      '## HTML (Apple touch icon + favicon)',
      '',
      '<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">',
      '<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">',
    ];

    const encoder = new TextEncoder();
    files.push({
      name: 'README.txt',
      data: encoder.encode(readmeLines.join('\n')),
    });

    const zip = buildZip(files);
    const blob = new Blob([zip as Uint8Array<ArrayBuffer>], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pwa-icons.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [icons]);

  const downloadSingle = (icon: GeneratedIcon) => {
    const a = document.createElement('a');
    a.href = icon.dataUrl;
    a.download = icon.spec.filename;
    a.click();
  };

  // -------------------------------------------------------------------------
  // Copy manifest snippet
  // -------------------------------------------------------------------------
  const [snippetCopied, setSnippetCopied] = useState(false);
  const copySnippet = () => {
    const manifestIcons = ICON_SPECS
      .filter((s) => s.manifestEntry)
      .map((s) => ({
        src: `/icons/${s.filename}`,
        sizes: s.manifestEntry!.sizes,
        type: 'image/png',
        ...(s.manifestEntry!.purpose ? { purpose: s.manifestEntry!.purpose } : {}),
      }));
    navigator.clipboard.writeText(JSON.stringify({ icons: manifestIcons }, null, 2));
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  // -------------------------------------------------------------------------
  // Labels
  // -------------------------------------------------------------------------
  const L = {
    headline: lang === 'ar' ? <>مولّد أيقونات <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">تطبيقات PWA</span></> :
               lang === 'fr' ? <>Générateur d&apos;<span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">icônes PWA</span></> :
               <>Free PWA <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Icon Generator</span></>,
    sub: lang === 'ar' ? 'ارفع صورة واحدة واحصل على جميع أحجام أيقونات PWA المطلوبة فوراً — 192، 512، maskable، Apple touch icon، وfavicon — جاهزة للتحميل كملف ZIP.'
       : lang === 'fr' ? 'Téléchargez une seule image et obtenez instantanément toutes les tailles d\'icônes PWA nécessaires — 192, 512, maskable, Apple touch icon, favicon — dans un ZIP prêt à l\'emploi.'
       : 'Upload one image and get every required PWA icon size instantly — 192, 512, maskable, Apple touch icon, and favicon — packaged in a ready-to-use ZIP.',
    badge: lang === 'ar' ? 'مجاني بالكامل • يعمل في المتصفح' : lang === 'fr' ? '100% gratuit • Traitement local' : '100% free • Runs in your browser',
    dropzone: lang === 'ar' ? 'اسحب صورتك هنا أو' : lang === 'fr' ? 'Glissez votre image ici ou' : 'Drag your image here or',
    browse: lang === 'ar' ? 'تصفح الملفات' : lang === 'fr' ? 'Parcourir' : 'browse files',
    dropzoneHint: lang === 'ar' ? 'PNG أو JPG أو SVG أو WebP • بُعد مربع 512px+ مُوصى به • الحد الأقصى 10 MB' :
                  lang === 'fr' ? 'PNG, JPG, SVG ou WebP • Format carré 512px+ recommandé • Max 10 Mo' :
                  'PNG, JPG, SVG or WebP • Square 512px+ recommended • Max 10 MB',
    bgLabel: lang === 'ar' ? 'لون الخلفية' : lang === 'fr' ? 'Couleur de fond' : 'Background color',
    bgHint: lang === 'ar' ? 'يُستخدم خلف الأيقونة في نوع maskable وعند اقتصاص الصور غير المربعة.' :
            lang === 'fr' ? 'Utilisé derrière l\'icône pour les icônes maskable et les images non carrées.' :
            'Used behind the icon for maskable icons and non-square source images.',
    generateBtn: lang === 'ar' ? 'توليد جميع الأيقونات' : lang === 'fr' ? 'Générer toutes les icônes' : 'Generate All Icons',
    generating: lang === 'ar' ? 'جارٍ التوليد…' : lang === 'fr' ? 'Génération en cours…' : 'Generating…',
    downloadAll: lang === 'ar' ? 'تحميل ZIP (جميع الأيقونات + README)' : lang === 'fr' ? 'Télécharger ZIP (toutes les icônes)' : 'Download ZIP (all icons + README)',
    copySnippet: snippetCopied
      ? (lang === 'ar' ? 'تم النسخ!' : lang === 'fr' ? 'Copié !' : 'Copied!')
      : (lang === 'ar' ? 'نسخ مقطع manifest.json' : lang === 'fr' ? 'Copier l\'extrait manifest.json' : 'Copy manifest.json snippet'),
    previewTitle: lang === 'ar' ? 'معاينة الأيقونات' : lang === 'fr' ? 'Aperçu des icônes' : 'Icon Previews',
    noPrivacy: lang === 'ar' ? 'لا تُرفع أي صورة إلى خادم — كل شيء يعمل في متصفحك.' :
               lang === 'fr' ? 'Aucune image n\'est envoyée à un serveur — tout se passe dans votre navigateur.' :
               'No image is ever uploaded to a server — everything runs in your browser.',
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <main className="site-main flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ── Header ── */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-300 mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{L.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">{L.headline}</h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">{L.sub}</p>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ── Left: upload + options ── */}
        <div className="lg:col-span-5 space-y-5">

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-10 cursor-pointer transition-all
              ${dragOver ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-900/80'}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onFileChange}
              aria-label={lang === 'ar' ? 'رفع صورة الأيقونة' : lang === 'fr' ? 'Télécharger une icône' : 'Upload icon image'}
            />

            {sourcePreview ? (
              <img
                src={sourcePreview}
                alt="Source preview"
                className="h-24 w-24 rounded-2xl object-cover border border-slate-700 shadow-lg"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/25">
                <Upload className="h-7 w-7 text-indigo-400" />
              </div>
            )}

            <div className="text-center">
              <p className="text-sm font-medium text-slate-300">
                {L.dropzone}{' '}
                <span className="text-indigo-400 underline underline-offset-2">{L.browse}</span>
              </p>
              {sourceFile && (
                <p className="mt-1 text-xs text-slate-500 truncate max-w-[220px]">{sourceFile.name}</p>
              )}
              {!sourceFile && (
                <p className="mt-1 text-[11px] text-slate-500">{L.dropzoneHint}</p>
              )}
            </div>
          </div>

          {/* Background color */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              {L.bgLabel}
            </label>
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-2.5">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-8 w-10 bg-transparent cursor-pointer rounded-lg border-0"
                aria-label={L.bgLabel}
              />
              <span className="text-xs font-mono text-slate-300 uppercase">{bgColor}</span>
              <span className="ms-auto text-[10px] text-slate-500 hidden sm:block">
                {lang === 'ar' ? 'مُوصى: #ffffff للأيقونات الشفافة' : 'Tip: #ffffff for transparent icons'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">{L.bgHint}</p>
          </div>

          {/* Error */}
          {status === 'error' && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{errorMsg}</p>
            </div>
          )}

          {/* Generate button */}
          <button
            type="button"
            onClick={generate}
            disabled={!sourcePreview || status === 'generating'}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {status === 'generating' ? (
              <><Loader2 className="h-4 w-4 animate-spin" /><span>{L.generating}</span></>
            ) : (
              <><ImageIcon className="h-4 w-4" /><span>{L.generateBtn}</span></>
            )}
          </button>

          {/* Privacy note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>{L.noPrivacy}</span>
          </div>

          {/* Upsell to manifest generator */}
          {status === 'done' && (
            <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/60 to-slate-950 p-5">
              <p className="text-xs font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5" />
                {lang === 'ar' ? 'الخطوة التالية' : lang === 'fr' ? 'Étape suivante' : 'Next step'}
              </p>
              <p className="text-xs text-slate-400 mb-3">
                {lang === 'ar' ? 'استخدم مولّد Manifest لإنشاء ملف manifest.json الخاص بتطبيقك ودمج هذه الأيقونات به.' :
                 lang === 'fr' ? 'Utilisez le Générateur Manifest pour créer votre manifest.json et y intégrer ces icônes.' :
                 'Use the Manifest Generator to build your manifest.json and wire in these icons.'}
              </p>
              <Link
                href="/tools/manifest-generator"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                <span>{lang === 'ar' ? 'فتح مولّد Manifest' : lang === 'fr' ? 'Ouvrir le Générateur Manifest' : 'Open Manifest Generator'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* ── Right: icon grid + download ── */}
        <div className="lg:col-span-7 space-y-5">
          {status === 'done' && icons.length > 0 ? (
            <>
              {/* Download bar */}
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  onClick={downloadAll}
                  className="flex-1 min-w-[180px] py-3 px-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{L.downloadAll}</span>
                </button>
                <button
                  type="button"
                  onClick={copySnippet}
                  className="py-3 px-4 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {snippetCopied
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    : <FileCode className="h-4 w-4 text-slate-400" />}
                  <span>{L.copySnippet}</span>
                </button>
              </div>

              {/* Icon grid */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">{L.previewTitle}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {icons.map((icon) => (
                    <div
                      key={icon.spec.id}
                      className="group relative flex flex-col items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition-colors"
                    >
                      {/* Checkered backdrop to show transparency */}
                      <div
                        className="relative h-14 w-14 rounded-xl overflow-hidden shadow-md"
                        style={{ backgroundImage: 'repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%)', backgroundSize: '12px 12px' }}
                      >
                        <img
                          src={icon.dataUrl}
                          alt={icon.spec.label}
                          className="absolute inset-0 h-full w-full object-contain"
                        />
                      </div>

                      <div className="text-center">
                        <p className="text-xs font-bold text-white leading-tight">{icon.spec.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{icon.spec.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => downloadSingle(icon)}
                        className="opacity-0 group-hover:opacity-100 absolute top-2.5 end-2.5 p-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white transition-all cursor-pointer"
                        title={lang === 'ar' ? 'تحميل' : 'Download'}
                        aria-label={`Download ${icon.spec.filename}`}
                      >
                        <Download className="h-3 w-3" />
                      </button>

                      {(icon.spec.purpose === 'any' && (icon.spec.size === 192 || icon.spec.size === 512)) && (
                        <span className="absolute top-2.5 start-2.5 px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/25 text-[9px] font-bold text-emerald-400">
                          {lang === 'ar' ? 'مطلوب' : 'Required'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Placeholder state */
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-16 text-center min-h-[360px]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/60 border border-slate-700 mb-4">
                <ImageIcon className="h-7 w-7 text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-500">
                {lang === 'ar' ? 'ارفع صورة وانقر "توليد الأيقونات" لترى النتيجة هنا' :
                 lang === 'fr' ? 'Téléchargez une image et cliquez sur "Générer" pour voir les icônes' :
                 'Upload an image and click "Generate" to see your icons here'}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                {lang === 'ar' ? `${ICON_SPECS.length} حجم يتم توليده تلقائياً` :
                 lang === 'fr' ? `${ICON_SPECS.length} tailles générées automatiquement` :
                 `${ICON_SPECS.length} sizes generated automatically`}
              </p>
            </div>
          )}

          {/* Upsell to main builder */}
          <div className="rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950 via-slate-950 to-pink-950 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -end-8 -bottom-8 h-28 w-28 rounded-full bg-pink-500/10 blur-2xl" />
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-white/5 px-3 py-1 text-[11px] font-bold text-indigo-200">
              <Zap className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'هل تريد تطبيقاً كاملاً؟' : lang === 'fr' ? 'Besoin d\'une app complète ?' : 'Ready for the full app?'}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {lang === 'ar' ? 'حوّل متجرك إلى تطبيق PWA و APK' :
               lang === 'fr' ? 'Transformez votre boutique en PWA & APK' :
               'Turn your store into a PWA & Android APK'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              {lang === 'ar' ? 'لا تتوقف عند الأيقونات. استخدم Appifya لبناء تطبيقك بالكامل، ربط إعلانات AdMob، وتصدير APK بكل سهولة.' :
               lang === 'fr' ? 'Ne vous arrêtez pas aux icônes. Utilisez Appifya pour construire votre app, intégrer AdMob et exporter l\'APK.' :
               'Don\'t stop at icons. Use Appifya to build the full app, add AdMob ads, and export your Android APK.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-950 shadow-lg transition hover:bg-indigo-50"
            >
              <span>{lang === 'ar' ? 'ابدأ مع Appifya مجاناً' : lang === 'fr' ? 'Démarrer avec Appifya' : 'Start with Appifya — free'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── FAQ / SEO section ── */}
      <section className="mt-24 max-w-4xl mx-auto space-y-12" aria-labelledby="faq-heading">
        <div className="text-center">
          <HelpCircle className="mx-auto mb-3 h-7 w-7 text-indigo-400" />
          <h2 id="faq-heading" className="text-2xl font-black text-white sm:text-3xl">
            {lang === 'ar' ? 'أسئلة شائعة حول أيقونات PWA' :
             lang === 'fr' ? 'Questions fréquentes sur les icônes PWA' :
             'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-3">
          {(lang === 'ar' ? [
            ['ما هي أحجام الأيقونات المطلوبة لتطبيق PWA؟', 'يحتاج تطبيق PWA بحد أدنى إلى أيقونة 192×192 للشاشة الرئيسية وأيقونة 512×512 لشاشة الإطلاق. يُنصح أيضاً بتضمين أيقونة maskable بحجم 512×512 لأجهزة Android، وApple touch icon بحجم 180×180 لنظام iOS، وfavicon بحجم 32×32 لتبويبات المتصفح.'],
            ['ما هي الأيقونة Maskable؟', 'الأيقونة Maskable تملأ الإطار الكامل بما فيه الزوايا. يستخدمها Android لإنشاء أيقونات تكيّفية تناسب الأشكال المختلفة (دائرة، مربع مستدير). المنطقة الآمنة تمثل 80% من منتصف الصورة.'],
            ['هل يتم رفع صورتي إلى خادم؟', 'لا. كل عملية المعالجة تتم داخل متصفحك باستخدام Canvas API. صورتك لا تغادر جهازك أبداً.'],
            ['ما هو أفضل تنسيق للصورة المصدر؟', 'PNG هو الأفضل لدعمه الشفافية. يمكن استخدام JPG وWebP وSVG أيضاً. للحصول على أفضل جودة، ارفع صورة مربعة بدقة 512×512 بكسل أو أكبر.'],
            ['كيف أستخدم الأيقونات في ملف manifest.json؟', 'ضع مجلد icons/ في المجلد العام (public) لمشروعك، ثم أضف مسارات الأيقونات في خاصية "icons" داخل manifest.json. يمكنك نسخ المقطع الجاهز بالنقر على زر "نسخ مقطع manifest.json" أعلاه.'],
          ] : lang === 'fr' ? [
            ['De quelles tailles d\'icônes a besoin une PWA ?', 'Une PWA nécessite au minimum une icône 192×192 pour l\'écran d\'accueil et une icône 512×512 pour l\'écran de démarrage. Il est également recommandé d\'inclure une icône maskable 512×512 pour Android, un Apple touch icon 180×180 pour iOS et un favicon 32×32 pour les onglets.'],
            ['Qu\'est-ce qu\'une icône maskable ?', 'Une icône maskable remplit tout le canevas, y compris les coins. Android l\'utilise pour créer des icônes adaptatives s\'adaptant aux formes (cercle, squircle). La zone sécurisée représente 80% du centre de l\'image.'],
            ['Mon image est-elle envoyée à un serveur ?', 'Non. Tout le traitement se fait dans votre navigateur via l\'API Canvas. Votre image ne quitte jamais votre appareil.'],
            ['Quel format d\'image source utiliser ?', 'PNG est idéal car il supporte la transparence. JPG, WebP et SVG sont également acceptés. Pour un résultat optimal, téléchargez une image carrée de 512×512 pixels ou plus.'],
            ['Comment utiliser les icônes dans manifest.json ?', 'Placez le dossier icons/ dans votre répertoire public, puis référencez les icônes dans la propriété "icons" de votre manifest.json. Vous pouvez copier l\'extrait prêt à l\'emploi via le bouton ci-dessus.'],
          ] : [
            ['What icon sizes does a PWA need?', 'A PWA requires at minimum a 192×192 PNG for the home screen and a 512×512 PNG for the splash screen. It\'s also recommended to include a maskable 512×512 for Android adaptive icons, an Apple touch icon (180×180) for iOS, and a 32×32 favicon for browser tabs.'],
            ['What is a maskable icon?', 'A maskable icon fills the full canvas including the corners. Android uses it to create adaptive icons that fit different shapes (circle, squircle, rounded square). The safe zone is the inner 80% of the image — keep important content there.'],
            ['Is my image uploaded to a server?', 'No. All processing happens in your browser using the Canvas API. Your image never leaves your device.'],
            ['What source image format works best?', 'PNG works best because it supports transparency. JPG, WebP, and SVG are also accepted. For the sharpest results, upload a square image at 512×512 pixels or larger.'],
            ['How do I use the icons in manifest.json?', 'Place the icons/ folder in your public directory, then reference the paths in the "icons" array of your manifest.json. You can copy a ready-to-paste snippet using the button above.'],
          ]).map(([q, a]) => (
            <details key={q} className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <summary className="cursor-pointer list-none font-bold text-white marker:hidden flex items-center justify-between">
                <span>{q}</span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-400">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
