'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n';
import {
  FileCode,
  Download,
  Copy,
  Check,
  Sparkles,
  Palette,
  Layers,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

export default function ManifestGeneratorClient() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  // Form State
  const [name, setName] = useState('My Progressive Web App');
  const [shortName, setShortName] = useState('MyPWA');
  const [description, setDescription] = useState('A fast, reliable, and engaging Progressive Web App built with Appifya.');
  const [startUrl, setStartUrl] = useState('/');
  const [scope, setScope] = useState('/');
  const [display, setDisplay] = useState<'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'>('standalone');
  const [orientation, setOrientation] = useState<'any' | 'natural' | 'portrait' | 'landscape'>('any');
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [backgroundColor, setBackgroundColor] = useState('#0f172a');
  const [categories, setCategories] = useState('productivity, shopping, utilities');

  // Icons State
  const [icon192, setIcon192] = useState('/icon.svg');
  const [icon512, setIcon512] = useState('/icon.svg');
  const [maskableIcon, setMaskableIcon] = useState(true);

  // UI state
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'display' | 'icons' | 'advanced'>('basic');

  // Generate Manifest JSON object
  const generateManifestObject = () => {
    const icons: ManifestIcon[] = [
      {
        src: icon192 || '/icon.svg',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: icon512 || '/icon.svg',
        sizes: '512x512',
        type: 'image/png',
      },
    ];

    if (maskableIcon) {
      icons.push({
        src: icon512 || '/icon.svg',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      });
    }

    const cats = categories
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    return {
      name: name.trim() || 'My PWA',
      short_name: shortName.trim() || 'PWA',
      description: description.trim() || undefined,
      start_url: startUrl.trim() || '/',
      scope: scope.trim() || '/',
      display,
      orientation,
      theme_color: themeColor,
      background_color: backgroundColor,
      categories: cats.length > 0 ? cats : undefined,
      icons,
    };
  };

  const manifestJsonString = JSON.stringify(generateManifestObject(), null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(manifestJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([manifestJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setName('My Progressive Web App');
    setShortName('MyPWA');
    setDescription('A fast, reliable, and engaging Progressive Web App built with Appifya.');
    setStartUrl('/');
    setScope('/');
    setDisplay('standalone');
    setOrientation('any');
    setThemeColor('#6366f1');
    setBackgroundColor('#0f172a');
    setCategories('productivity, shopping, utilities');
  };

  return (
    <main className="site-main flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Breadcrumb & Header */}
      <div className="mb-8 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-300 mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{lang === 'ar' ? 'أداة احترافية مجانية' : lang === 'fr' ? 'Outil professionnel gratuit' : 'Free Professional Tool'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          {lang === 'ar' ? (
            <>مولد ملف <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Web App Manifest</span></>
          ) : lang === 'fr' ? (
            <>Générateur de <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Web App Manifest</span></>
          ) : (
            <>Free PWA <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Manifest Generator</span></>
          )}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          {lang === 'ar'
            ? 'أنشئ ملف manifest.json متوافقاً مع أحدث معايير الويب لتطبيقات PWA الخاصة بك. خصص الخيارات، شاهد المعاينة المباشرة، وحمل الملف بنقرة زر واحدة.'
            : lang === 'fr'
              ? 'Créez un fichier manifest.json conforme aux derniers standards Web pour votre PWA. Personnalisez, prévisualisez et téléchargez.'
              : 'Create a standard-compliant manifest.json file for your Progressive Web App. Customize settings, preview live, and download instantly.'}
        </p>
      </div>

      {/* Main Tool Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 pb-4 overflow-x-auto gap-2">
            {[
              { id: 'basic', label: lang === 'ar' ? 'الأساسيات' : lang === 'fr' ? 'Général' : 'Basic', icon: Sliders },
              { id: 'display', label: lang === 'ar' ? 'العرض والمظهر' : lang === 'fr' ? 'Affichage' : 'Display & UI', icon: Palette },
              { id: 'icons', label: lang === 'ar' ? 'الأيقونات' : lang === 'fr' ? 'Icônes' : 'Icons', icon: Layers },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id as 'basic' | 'display' | 'icons' | 'advanced')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Basic */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {lang === 'ar' ? 'اسم التطبيق الكامل (Name)' : lang === 'fr' ? 'Nom complet (Name)' : 'Full App Name'} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Progressive Web App"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  {lang === 'ar' ? 'الاسم الكامل الذي يظهر في شاشات التثبيت ومتجر التطبيقات.' : 'The full name of your app as shown during install prompts.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {lang === 'ar' ? 'الاسم المختصر (Short Name)' : lang === 'fr' ? 'Nom court (Short Name)' : 'Short Name'} *
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="MyPWA"
                  maxLength={15}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  {lang === 'ar' ? 'الاسم تحت الأيقونة في الشاشة الرئيسية (يفضل أقل من 12 حرفاً).' : 'Displayed under the app icon on the home screen (ideally under 12 chars).'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {lang === 'ar' ? 'وصف التطبيق (Description)' : lang === 'fr' ? 'Description' : 'Description'}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe what your web app does..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    {lang === 'ar' ? 'رابط البداية (Start URL)' : lang === 'fr' ? 'URL de démarrage' : 'Start URL'}
                  </label>
                  <input
                    type="text"
                    value={startUrl}
                    onChange={(e) => setStartUrl(e.target.value)}
                    placeholder="/"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    {lang === 'ar' ? 'نطاق العمل (Scope)' : lang === 'fr' ? 'Portée (Scope)' : 'Scope'}
                  </label>
                  <input
                    type="text"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    placeholder="/"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Display & UI */}
          {activeTab === 'display' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {lang === 'ar' ? 'وضع العرض (Display Mode)' : lang === 'fr' ? 'Mode d\'affichage' : 'Display Mode'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['standalone', 'fullscreen', 'minimal-ui', 'browser'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDisplay(mode)}
                      className={`py-3 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                        display === mode
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  {lang === 'ar' ? 'Standalone تجعل التطبيق يعمل وكأنه تطبيق native بدون أشرطة المتصفح.' : 'Standalone hides browser UI so it feels like a native app.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {lang === 'ar' ? 'اتجاه الشاشة (Orientation)' : lang === 'fr' ? 'Orientation' : 'Orientation'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['any', 'natural', 'portrait', 'landscape'] as const).map((or) => (
                    <button
                      key={or}
                      type="button"
                      onClick={() => setOrientation(or)}
                      className={`py-3 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                        orientation === or
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {or}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    {lang === 'ar' ? 'لون التيمة (Theme Color)' : lang === 'fr' ? 'Couleur de thème' : 'Theme Color'}
                  </label>
                  <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="h-8 w-10 bg-transparent cursor-pointer rounded-lg border-0"
                    />
                    <span className="text-xs font-mono text-slate-300 uppercase">{themeColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    {lang === 'ar' ? 'لون الخلفية (Background Color)' : lang === 'fr' ? 'Couleur de fond' : 'Background Color'}
                  </label>
                  <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-8 w-10 bg-transparent cursor-pointer rounded-lg border-0"
                    />
                    <span className="text-xs font-mono text-slate-300 uppercase">{backgroundColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {lang === 'ar' ? 'التصنيفات (Categories - مفصولة بفواصل)' : lang === 'fr' ? 'Catégories' : 'Categories (comma separated)'}
                </label>
                <input
                  type="text"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  placeholder="productivity, shopping, utilities"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Icons */}
          {activeTab === 'icons' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {lang === 'ar' ? 'رابط أيقونة 192x192' : lang === 'fr' ? 'Icône 192x192 (URL)' : '192x192 Icon URL'}
                </label>
                <input
                  type="text"
                  value={icon192}
                  onChange={(e) => setIcon192(e.target.value)}
                  placeholder="/icons/icon-192.png"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {lang === 'ar' ? 'رابط أيقونة 512x512' : lang === 'fr' ? 'Icône 512x512 (URL)' : '512x512 Icon URL'}
                </label>
                <input
                  type="text"
                  value={icon512}
                  onChange={(e) => setIcon512(e.target.value)}
                  placeholder="/icons/icon-512.png"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {lang === 'ar' ? 'تضمين أيقونة Maskable (Adaptive)' : lang === 'fr' ? 'Inclure l\'icône Maskable' : 'Include Maskable Icon'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {lang === 'ar' ? 'موصى بها لأجهزة Android لكي تتكيف مع الأشكال المختلفة (Circle, Squircle).' : 'Recommended for Android adaptive icons.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={maskableIcon}
                  onChange={(e) => setMaskableIcon(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>{lang === 'ar' ? 'تحميل manifest.json' : lang === 'fr' ? 'Télécharger manifest.json' : 'Download manifest.json'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="py-3 px-5 bg-slate-950 border border-slate-700 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
              <span>{copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ الكود' : 'Copy JSON')}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-colors cursor-pointer"
              title={lang === 'ar' ? 'إعادة ضبط' : 'Reset'}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">manifest.json (Live Preview)</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                <span>W3C Valid</span>
              </span>
            </div>

            <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono text-indigo-200 overflow-x-auto max-h-[420px] select-all" dir="ltr">
              {manifestJsonString}
            </pre>
          </div>

          {/* Upsell Banner to Appifya Builder */}
          <div className="rounded-3xl border border-indigo-500/35 bg-gradient-to-br from-indigo-950 via-slate-950 to-pink-950 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-500/15 blur-2xl" />
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-white/5 px-3 py-1 text-[11px] font-bold text-indigo-200">
              <Zap className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'هل تريد تطبيقاً متكاملاً؟' : lang === 'fr' ? 'Besoin d\'une app complète ?' : 'Want a full app package?'}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {lang === 'ar' ? 'حوّل متجرك إلى تطبيق PWA و APK بضغطة زر' : lang === 'fr' ? 'Transformez votre boutique en app PWA & APK' : 'Turn your store into a full PWA & APK'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              {lang === 'ar'
                ? 'لا تقم بإنشاء manifest.json يدوياً فقط. استخدم منصة Appifya لإنشاء تطبيقك، توليد الأيقونات، وربط إعلانات AdMob وتصدير APK بكل سهولة.'
                : lang === 'fr'
                  ? 'Utilisez la plateforme Appifya pour générer votre app, vos icônes et vos fichiers APK en un clic.'
                  : 'Use Appifya to generate your app, icons, AdMob integration, and Android APK effortlessly.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-950 shadow-lg transition hover:bg-indigo-50"
            >
              <span>{lang === 'ar' ? 'ابدأ مع Appifya الآن' : lang === 'fr' ? 'Essayer Appifya' : 'Start with Appifya'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* SEO Educational Section */}
      <section className="mt-24 max-w-4xl mx-auto space-y-12" aria-labelledby="faq-title">
        <div className="text-center">
          <HelpCircle className="mx-auto mb-3 h-7 w-7 text-indigo-400" />
          <h2 id="faq-title" className="text-2xl font-black text-white sm:text-3xl">
            {lang === 'ar' ? 'أسئلة شائعة حول Web App Manifest' : lang === 'fr' ? 'Questions fréquentes sur le Manifest' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-3">
          {[
            [
              lang === 'ar' ? 'ما هو ملف manifest.json وما أهميته؟' : 'What is manifest.json and why is it important?',
              lang === 'ar'
                ? 'هو ملف JSON يخبر المتصفح كيف يجب أن يظهر تطبيق الويب الخاص بك عندما يقوم المستخدم بتثبيته على شاشته الرئيسية (الاسم، الأيقونات، الألوان، وضع العرض).'
                : 'It is a JSON configuration file that tells the browser how your PWA should behave when installed on a user\'s device.'
            ],
            [
              lang === 'ar' ? 'ما هي الأيقونات المطلوبة لتطبيق PWA؟' : 'What icons are required for a PWA?',
              lang === 'ar'
                ? 'يطلب المتصفح عادة أيقحنة مقاس 192x192 للشاشة الرئيسية وأيقونة 512x512 لشاشة البداية، بالإضافة إلى أيقونة Maskable لتتكيف مع أشكال الأجهزة المختلفة.'
                : 'Browsers typically require a 192x192 PNG icon for the home screen and a 512x512 PNG icon for the splash screen.'
            ],
            [
              lang === 'ar' ? 'أين أضع ملف manifest.json في موقعي؟' : 'Where should I place manifest.json?',
              lang === 'ar'
                ? 'ضعه في المجلد الرئيسي لموقعك (root directory) ثم اربطه في قسم <head> عبر الوسم <link rel="manifest" href="/manifest.json">.'
                : 'Place it in your website\'s root directory and link it in your HTML <head> using <link rel="manifest" href="/manifest.json">.'
            ],
          ].map(([q, a]) => (
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
