'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomerStoriesShowcase from './CustomerStoriesShowcase';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from './lib/i18n';
import { databases, storage } from '@/lib/appwrite';
import { BUCKET_ID, DB_ID, TABLE_ID, getErrorMessage, normalizePublicUrl } from '@/lib/app-config';
import { ID, Permission, Role } from 'appwrite';
import {
  Smartphone,
  Globe,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Check,
  HelpCircle,
  ShieldCheck,
  Zap,
  Bell,
  Play,
  ArrowRight,
  DollarSign,
  Terminal,
  Cpu,
  Gauge,
  Sliders,
  Apple,
  WifiOff,
  Fingerprint,
  Wifi,
  Battery,
  Package,
  Headphones,
  Home,
  Search,
  ShoppingBag,
  User,
  Rocket,
  Award,
  Shield,
  HardDrive,
  X,
  Lock,
  ExternalLink,
} from 'lucide-react';

const faqSchema = (lang: 'ar' | 'en' | 'fr') => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: lang === 'ar' ? 'هل التحويل الأساسي مجاني؟' : lang === 'fr' ? 'L\'export de base est-il gratuit ?' : 'Is the basic export free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: lang === 'ar' ? 'نعم، التحويل الأساسي بدون إعلانات مجاني حالياً. أي خدمة مدفوعة مستقبلية ستظهر بوضوح قبل الدفع.' : lang === 'fr' ? 'Oui, l\'export de base sans publicité est actuellement gratuit. Tout futur service payant sera affiché avant le paiement.' : 'Yes. The basic export without ads is currently free. Any future paid service will be shown before payment.',
      },
    },
    {
      '@type': 'Question',
      name: lang === 'ar' ? 'هل أحتاج إلى Android Studio أو Xcode؟' : lang === 'fr' ? 'Ai-je besoin d\'Android Studio ou Xcode ?' : 'Do I need Android Studio or Xcode?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: lang === 'ar' ? 'لا، محرك Appifya السحابي يتولى تجميع ملفات AAB و APK و IPA تلقائياً دون الحاجة لكتابة كود أصلي أو تنزيل برامج برمجية ضخمة.' : lang === 'fr' ? 'Non, le moteur cloud Appifya compile vos binaires AAB, APK et IPA automatiquement sans configuration native.' : 'No. Appifya cloud engine automates AAB, APK, and IPA packaging with zero native SDK installations required.',
      },
    },
    {
      '@type': 'Question',
      name: lang === 'ar' ? 'هل أملك أرباح AdMob والتطبيق بنسبة 100%؟' : lang === 'fr' ? 'Qui possède les revenus AdMob ?' : 'Who owns AdMob revenue?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: lang === 'ar' ? 'نعم 100%. عند استخدام إعدادات AdMob الخاصة بك، يبقى الحساب والأرباح ملكاً لك بالكامل وتبقى مسؤولاً عن سياسات Google.' : lang === 'fr' ? 'Les paramètres et 100% des revenus restent les vôtres sous votre responsabilité vis-à-vis de Google.' : '100% yes. Your AdMob identifiers and revenue flow directly to your account with zero revenue share.',
      },
    },
    {
      '@type': 'Question',
      name: lang === 'ar' ? 'لماذا لا تظهر بعض المواقع داخل المعاينة الحية؟' : lang === 'fr' ? 'Pourquoi certains sites ne s\'affichent-ils pas dans l\'aperçu ?' : 'Why do some sites not appear in preview?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: lang === 'ar' ? 'بعض المواقع تمنع التضمين داخل iframe لأسباب أمنية (X-Frame-Options). يمكنك استخدام محاكي التطبيق الأصلي أو زر الفتح خارجياً، ولا يؤثر ذلك إطلاقاً على إنشاء التطبيق.' : lang === 'fr' ? 'Certains sites bloquent les iframes pour des raisons de sécurité. Utilisez le mode simulateur ou ouvrez dans un nouvel onglet.' : 'Some websites restrict iframe embedding for security headers. Use our native simulation mode or external preview link; this never prevents APK generation.',
      },
    },
  ],
});

const howToSchema = (lang: 'ar' | 'en' | 'fr') => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: lang === 'ar' ? 'كيف تحول موقعك أو متجرك إلى تطبيق PWA أصلي' : lang === 'fr' ? 'Comment transformer votre site en application mobile native' : 'How to convert any website into a native mobile app',
  description: lang === 'ar' ? 'دليل خطوة بخطوة لتحويل أي متجر أو موقع إلى تطبيق ويب تقدمي قابل للتثبيت' : lang === 'fr' ? 'Guide étape par étape pour convertir n\'importe quel magasin ou site en application mobile' : 'Step-by-step guide to package any store or web application into an installable mobile app',
  step: [
    {
      '@type': 'HowToStep',
      name: lang === 'ar' ? 'أدخل رابط موقعك' : lang === 'fr' ? 'Entrez l\'URL' : 'Enter your URL',
      text: lang === 'ar' ? 'أدخل رابط متجرك أو موقعك الذي يعمل عبر HTTPS.' : lang === 'fr' ? 'Entrez l\'URL de votre boutique ou site HTTPS.' : 'Enter your store or site URL served over HTTPS.',
      url: 'https://appifya.app/#pipeline',
    },
    {
      '@type': 'HowToStep',
      name: lang === 'ar' ? 'خصص التطبيق وميزات العتاد' : lang === 'fr' ? 'Personnalisez' : 'Customize options',
      text: lang === 'ar' ? 'اختر اسم التطبيق، لون الهوية، الأيقونة، وفعّل الإشعارات الفورية أو إعلانات AdMob.' : lang === 'fr' ? 'Choisissez le nom, l\'icône, la couleur et activez les notifications ou AdMob.' : 'Pick app name, branding colors, icon, and configure push notifications or AdMob.',
      url: 'https://appifya.app/#builder',
    },
    {
      '@type': 'HowToStep',
      name: lang === 'ar' ? 'صدّر وحمّل حزم المتجر' : lang === 'fr' ? 'Exportez' : 'Export and download',
      text: lang === 'ar' ? 'اضغط على زر الحفظ والتصدير للحصول على ملف APK/AAB أو تشغيل البناء السحابي.' : lang === 'fr' ? 'Téléchargez vos fichiers APK/AAB prêts pour le Play Store.' : 'Export and download release-ready binaries for Google Play and App Store.',
      url: 'https://appifya.app/dashboard',
    },
  ],
  totalTime: 'PT3M',
});

export default function HomePage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  // ─── App Builder Form State ───
  const [storeUrl, setStoreUrl] = useState('');
  const [appName, setAppName] = useState('');
  const [platform, setPlatform] = useState<'both' | 'android' | 'ios'>('both');
  const [themeColor, setThemeColor] = useState('#4f46e5');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

  // ─── Interactive Phone & Pipeline Showcase State ───
  const [deviceTarget, setDeviceTarget] = useState<'ios' | 'android'>('android');
  const [previewMode, setPreviewMode] = useState<'native' | 'iframe'>('native');
  const [iframeLoading, setIframeLoading] = useState(false);
  const [phoneClock, setPhoneClock] = useState('09:41');

  // Hardware Toggles
  const [featurePush, setFeaturePush] = useState(true);
  const [featureOffline, setFeatureOffline] = useState(true);
  const [featureBio, setFeatureBio] = useState(false);

  // Pipeline simulation state
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'compiling' | 'ready'>('idle');
  const [terminalLogs, setTerminalLogs] = useState<Array<{ text: string; type: 'info' | 'success' | 'warn' }>>([
    { text: '# Ready for automated conversion. Enter your URL and press "Compile App".', type: 'info' },
    { text: '> Targeting engines: Android AAB/APK & iOS IPA workspace.', type: 'info' },
    { text: '> Pre-caching WebKit & Chromium isolated runtime bridges...', type: 'info' },
    { text: '> Pipeline ready for execution.', type: 'success' },
  ]);

  const terminalRef = useRef<HTMLDivElement>(null);

  // General App Submission State
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Clock safe sync (avoids prerender mismatch)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setPhoneClock(`${hrs}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Scroll terminal on logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Handle URL changes & auto app name with instant live phone preview
  const handleUrlChange = (val: string) => {
    setStoreUrl(val);
    if (!appName && val) {
      try {
        const clean = val.replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[/?#]/)[0];
        const namePart = clean.split('.')[0];
        if (namePart) {
          setAppName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
        }
      } catch {}
    }
    // Switch phone mockup to instant live iframe as soon as a URL is typed or pasted
    if (val.trim().length > 3) {
      setPreviewMode('iframe');
      setIframeLoading(true);
    }
  };

  const getCleanPreviewUrl = () => {
    if (!storeUrl) return '';
    if (storeUrl.startsWith('http://') || storeUrl.startsWith('https://')) {
      return storeUrl;
    }
    return `https://${storeUrl}`;
  };

  // Add terminal log helper
  const addLog = (text: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setTerminalLogs((prev) => [...prev, { text, type }]);
  };

  // Hardware toggle handlers
  const handleTogglePush = (checked: boolean) => {
    setFeaturePush(checked);
    addLog(
      checked
        ? '✓ Native Push Notification plugin attached (APNS / FCM credentials synced).'
        : 'ℹ Push Notification module detached.',
      checked ? 'success' : 'info'
    );
  };

  const handleToggleOffline = (checked: boolean) => {
    setFeatureOffline(checked);
    addLog(
      checked
        ? '✓ Offline Cache ServiceWorker enabled with IndexedDB persistent bridge.'
        : 'ℹ Offline ServiceWorker disabled.',
      checked ? 'success' : 'info'
    );
  };

  const handleToggleBio = (checked: boolean) => {
    setFeatureBio(checked);
    addLog(
      checked
        ? '✓ Biometric Hardware Keys (FaceID/Fingerprint) enabled in manifest.'
        : 'ℹ Biometric authentication removed.',
      checked ? 'success' : 'info'
    );
  };

  // Trigger simulated cloud build pipeline
  const runSimulation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isBuilding) return;

    const targetUrl = storeUrl.trim() || 'https://shopnova.store';
    if (!storeUrl) {
      setStoreUrl(targetUrl);
      setAppName('ShopNova');
    }

    setPreviewMode('iframe');
    setIframeLoading(true);

    setIsBuilding(true);
    setBuildStatus('compiling');
    setBuildProgress(10);
    setTerminalLogs([]);

    const steps: Array<{ progress: number; delay: number; text: string; type: 'info' | 'success' | 'warn' }> = [
      { progress: 15, delay: 350, text: `> Connecting to destination host: ${targetUrl}...`, type: 'info' },
      { progress: 35, delay: 850, text: `✓ Web Manifest & Favicon assets parsed (Theme color detected: ${themeColor}).`, type: 'success' },
      { progress: 55, delay: 1400, text: `> Generating adaptive icons (mdpi, hdpi, xxhdpi, AppStore 1024x1024)...`, type: 'info' },
      { progress: 75, delay: 2000, text: `> Injecting Hardware JS Bridge & SSL pinning configuration...`, type: 'info' },
      { progress: 90, delay: 2600, text: `> Running Gradle AAB bundling & code signing sequence...`, type: 'info' },
      { progress: 100, delay: 3200, text: `✓ BUILD COMPLETE: Output files 'app-release.aab' & 'Runner.ipa' are ready!`, type: 'success' },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setBuildProgress(step.progress);
        addLog(step.text, step.type);

        if (index === steps.length - 1) {
          setBuildStatus('ready');
          setIsBuilding(false);
        }
      }, step.delay);
    });
  };

  // ─── Real App Creation in Appwrite Backend ───
  const executeSaveApp = async (userId: string) => {
    if (!storeUrl) {
      setStatusMsg({
        type: 'error',
        text: lang === 'ar' ? 'يرجى إدخال رابط المتجر أو الموقع أولاً.' : lang === 'fr' ? 'Veuillez saisir l\'URL du site.' : 'Please enter your website URL first.',
      });
      return;
    }

    try {
      setLoading(true);
      setStatusMsg(null);

      let formattedUrl: string;
      try {
        formattedUrl = normalizePublicUrl(storeUrl.trim());
      } catch {
        setStatusMsg({
          type: 'error',
          text: lang === 'ar' ? 'يرجى إدخال رابط HTTPS صالح.' : lang === 'fr' ? 'Veuillez saisir une URL HTTPS valide.' : 'Please enter a valid HTTPS URL.',
        });
        return;
      }
      const finalAppName = appName.trim() || 'My PWA Store';

      let iconId: string | undefined;
      if (iconFile) {
        if (!BUCKET_ID) {
          throw new Error('Appwrite Storage is not configured.');
        }

        const uploadedIcon = await storage.createFile({
          bucketId: BUCKET_ID,
          fileId: ID.unique(),
          file: iconFile,
          permissions: [Permission.read(Role.any())],
        });
        iconId = uploadedIcon.$id;
      }

      await databases.createDocument(DB_ID, TABLE_ID, ID.unique(), {
        user_id: userId,
        store_url: formattedUrl,
        app_name: finalAppName,
        theme_color: themeColor,
        icon_id: iconId,
      });

      setStatusMsg({
        type: 'success',
        text: lang === 'ar' ? 'تم حفظ التطبيق وتصديره بنجاح! جاري تحويلك إلى لوحة التحكم...' : lang === 'fr' ? 'Application enregistrée avec succès ! Redirection...' : 'Application saved successfully! Redirecting to your dashboard...',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: unknown) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: getErrorMessage(err, lang === 'ar' ? 'فشل حفظ التطبيق، يرجى المحاولة ثانية.' : lang === 'fr' ? 'Échec de l’enregistrement de l’application.' : 'Failed to save the application.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIconChange = (file: File | undefined) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setStatusMsg({
        type: 'error',
        text: lang === 'ar' ? 'اختر صورة PNG أو JPG أو WebP بحجم أقصى 2MB.' : lang === 'fr' ? 'Choisissez une image PNG, JPG ou WebP de 2 Mo maximum.' : 'Choose a PNG, JPG, or WebP image up to 2MB.',
      });
      return;
    }
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const handleCreateOrExport = () => {
    if (!storeUrl) {
      setStatusMsg({
        type: 'error',
        text: lang === 'ar' ? 'يرجى إدخال رابط المتجر أولاً.' : lang === 'fr' ? 'Veuillez saisir l\'URL de la boutique.' : 'Please enter your store URL first.',
      });
      return;
    }

    if (!user) {
      openAuthModal(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      });
      return;
    }

    executeSaveApp(user.$id);
  };

  return (
    <main className="site-main flex-1 w-full relative overflow-x-hidden selection:bg-indigo-500 selection:text-white" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* ── Ambient Glow Lighting Effects ── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] glow-indigo -z-10 pointer-events-none opacity-40 animate-pulse"></div>
      <div className="fixed top-1/3 -left-48 w-[650px] h-[650px] glow-cyan -z-10 pointer-events-none opacity-30"></div>

      {/* ── Hero Section ── */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Announcement & GitHub Marketplace Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <a
              href="https://github.com/marketplace/actions/appifya-pwa-mobile-app-builder"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/30 text-violet-300 hover:bg-violet-500/20 hover:border-violet-400 transition-all shadow-sm group cursor-pointer"
              title="Appifya on GitHub Marketplace"
            >
              <svg className="w-3.5 h-3.5 fill-current text-white group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>{lang === 'ar' ? 'متوفر على GitHub Marketplace' : lang === 'fr' ? 'Disponible sur GitHub Marketplace' : 'Now on GitHub Marketplace'}</span>
              <span className="text-slate-500">•</span>
              <span className="text-[11px] text-violet-400 font-bold">{lang === 'ar' ? 'أتمتة CI/CD' : lang === 'fr' ? 'Action CI/CD' : 'CI/CD Action'}</span>
            </a>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 shadow-inner shadow-indigo-500/10">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-400 font-bold">
                {lang === 'ar' ? 'المحرك السحابي v3.4 نشط' : lang === 'fr' ? 'Moteur Cloud v3.4 Actif' : 'Engine v3.4 Active'}
              </span>
              <span className="text-slate-500">•</span>
              <span>
                {lang === 'ar' ? 'تحويل فوري بدون كود إلى حزم Android و iOS' : lang === 'fr' ? 'Conversion Web vers APK & iOS sans code' : 'Zero-Code Web-to-APK & IPA Conversion'}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
            {lang === 'ar' ? (
              <>
                حوّل أي موقع أو متجر إلى{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                  تطبيق موبايل أصلي
                </span>
              </>
            ) : lang === 'fr' ? (
              <>
                Transformez tout site Web en{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                  Application Mobile Native
                </span>
              </>
            ) : (
              <>
                Turn Any Web App into a{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                  Native Mobile App
                </span>
              </>
            )}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {lang === 'ar'
              ? 'أدخل رابط موقعك، واستخرج ملف الـ Manifest، وحمّل حزم أندرويد وiOS فائقة السرعة المجهزة بالإشعارات الفورية، المصادقة البيومترية، والعمل بدون إنترنت.'
              : lang === 'fr'
                ? 'Saisissez votre URL, extrayez les manifestes et générez des binaires Android & iOS rapides avec notifications push, biométrie et cache hors-ligne.'
                : 'Input your URL, extract web manifests, and package lightning-fast Android & iOS binaries equipped with push notifications, biometric auth, and offline caching.'}
          </p>

          {/* Interactive URL Input Tool */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form onSubmit={runSimulation} className="relative p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-2xl transition-all flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 flex items-center px-4">
                <Globe className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder={lang === 'ar' ? 'https://yourstore.com' : 'https://yourwebapp.com'}
                  value={storeUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full bg-transparent border-0 px-3 py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={isBuilding}
                className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.99] shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {isBuilding ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Zap className="w-4 h-4 fill-white" />
                )}
                <span>
                  {isBuilding
                    ? (lang === 'ar' ? 'جاري التجميع...' : lang === 'fr' ? 'Compilation...' : 'Compiling...')
                    : (lang === 'ar' ? 'تجربة المحاكي' : lang === 'fr' ? 'Compiler en direct' : 'Compile App')}
                </span>
              </button>
            </form>

            {/* Under-Input Trust Indicators */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'ar' ? 'جاهز لـ Google Play و App Store' : 'Google Play & App Store Ready'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'ar' ? 'شهادات SSL وتوقيع Keystore آلي' : 'Automated Keystore & Signing'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'ar' ? 'بناء سحابي في أقل من 45 ثانية' : 'Under 45s Cloud Builds'}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Status Message Alert ── */}
      {statusMsg && (
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {statusMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        </div>
      )}

      {/* ── Interactive Conversion Showcase (Terminal Simulator + 3D Phone Mockup) ── */}
      <section id="pipeline" className="relative py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Interactive Build Console & Hardware Toggles (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Terminal Simulator */}
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                  <span className="ml-2 font-mono text-xs text-slate-400 flex items-center gap-1.5" dir="ltr">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    appifya-cloud-runner@v3.4:~$
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold ${
                      buildStatus === 'compiling'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                        : buildStatus === 'ready'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {buildStatus === 'compiling'
                      ? (lang === 'ar' ? 'جاري البناء السحابي' : 'COMPILING LIVE')
                      : buildStatus === 'ready'
                        ? (lang === 'ar' ? 'الحزمة جاهزة' : 'PACKAGE READY')
                        : (lang === 'ar' ? 'جاهز للتنفيذ' : 'SYSTEM IDLE')}
                  </span>
                </div>
              </div>

              {/* Terminal Logs Body */}
              <div
                ref={terminalRef}
                className="p-4 font-mono text-xs text-slate-300 space-y-2 h-56 overflow-y-auto terminal-scroll bg-[#080b12]"
                dir="ltr"
              >
                {terminalLogs.map((log, i) => (
                  <p
                    key={i}
                    className={
                      log.type === 'success'
                        ? 'text-emerald-400 font-semibold'
                        : log.type === 'warn'
                          ? 'text-amber-400'
                          : 'text-slate-300'
                    }
                  >
                    {log.text}
                  </p>
                ))}
              </div>

              {/* Progress & Target Footer */}
              <div className="px-4 py-2.5 bg-slate-900/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400" dir="ltr">
                <div className="flex items-center gap-2 truncate max-w-[260px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                  <span className="truncate font-mono">{storeUrl || 'https://shopnova.store'}</span>
                </div>
                <div className="w-36 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${buildProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Hardware Bridge Toggles */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>{lang === 'ar' ? 'مفاتيح ربط عتاد الهاتف (Hardware Bridges)' : 'Hardware Bridge Toggles'}</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {lang === 'ar' ? 'تفعيل إضافات الهاتف الأصلية' : 'Toggle native mobile plugins'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Push Toggle */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      {lang === 'ar' ? 'الإشعارات الفورية' : 'Push Alerts'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={featurePush}
                    onChange={(e) => handleTogglePush(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Offline Cache Toggle */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <WifiOff className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      {lang === 'ar' ? 'العمل بدون إنترنت' : 'Offline PWA'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureOffline}
                    onChange={(e) => handleToggleOffline(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Biometrics Toggle */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Fingerprint className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      {lang === 'ar' ? 'بصمة الوجه / الإصبع' : 'FaceID / Bio'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={featureBio}
                    onChange={(e) => handleToggleBio(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Quick Action Button to Jump to Customizer */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {lang === 'ar' ? 'هل تريد تخصيص اسم وأيقونة تطبيقك؟' : 'Ready to customize app icons and build APK?'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'ar' ? 'انتقل إلى معالج التخصيص الكامل في الأسفل وتنزيل التطبيق' : 'Jump down to full builder to configure AdMob, icons & export'}
                  </p>
                </div>
              </div>
              <a
                href="#builder"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
              >
                <span>{lang === 'ar' ? 'تخصيص الآن' : 'Customize'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </a>
            </div>

          </div>

          {/* Right: Realistic Mobile Phone Mockup (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            
            {/* Platform & View Controller */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setDeviceTarget('android');
                    addLog('> Platform target changed: Android (Chromium & Gradle engine) configured.');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    deviceTarget === 'android'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Android</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeviceTarget('ios');
                    addLog('> Platform target changed: Apple iOS (Swift/WebKit wrapper) configured.');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    deviceTarget === 'ios'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Apple className="w-3.5 h-3.5" />
                  <span>iOS</span>
                </button>
              </div>

              {/* View Mode Toggle: Live Web vs Native App */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewMode('iframe');
                    setIframeLoading(true);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    previewMode === 'iframe'
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={lang === 'ar' ? 'معاينة حية للموقع داخل الهاتف' : 'Live site webview'}
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{lang === 'ar' ? 'معاينة حية' : lang === 'fr' ? 'Site en direct' : 'Live Web'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('native')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    previewMode === 'native'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={lang === 'ar' ? 'محاكي واجهة وتطبيق الهاتف' : 'Native App UI simulator'}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'محاكي التطبيق' : lang === 'fr' ? 'Simulateur' : 'Native UI'}</span>
                </button>
              </div>

              {previewMode === 'iframe' && (
                <button
                  type="button"
                  onClick={() => {
                    setIframeKey((k) => k + 1);
                    setIframeLoading(true);
                  }}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={lang === 'ar' ? 'تحديث المعاينة' : 'Refresh preview'}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${iframeLoading ? 'animate-spin text-cyan-400' : ''}`} />
                </button>
              )}
            </div>

            {/* Phone Hardware Frame */}
            <div className="relative w-[300px] h-[610px] bg-slate-900 rounded-[50px] p-3 shadow-2xl shadow-indigo-500/20 border-4 border-slate-700">
              
              {/* Outer Physical Phone Buttons */}
              <div className="absolute -left-[7px] top-28 w-[3px] h-9 bg-slate-600 rounded-l-sm"></div>
              <div className="absolute -left-[7px] top-40 w-[3px] h-12 bg-slate-600 rounded-l-sm"></div>
              <div className="absolute -right-[7px] top-32 w-[3px] h-16 bg-slate-600 rounded-r-sm"></div>

              {/* Inner Screen */}
              <div className="w-full h-full bg-[#080b12] rounded-[40px] overflow-hidden flex flex-col relative border border-slate-800">
                
                {/* Dynamic Island / Notch */}
                <div className="w-full pt-3 pb-2 px-6 flex justify-between items-center z-20 bg-[#080b12]">
                  <span className="text-[11px] font-semibold text-slate-300 font-mono" dir="ltr">{phoneClock}</span>
                  <div className="w-20 h-4 bg-black rounded-full flex items-center justify-end pr-2 border border-slate-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/90"></div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300" dir="ltr">
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Content View: Native Simulation or Real Iframe */}
                {previewMode === 'iframe' && getCleanPreviewUrl() ? (
                  <div className="flex-1 w-full h-full bg-slate-950 relative flex flex-col overflow-hidden">
                    {/* Mini Browser Bar */}
                    <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-300 shrink-0 select-none">
                      <div className="flex items-center gap-1.5 truncate max-w-[190px]">
                        <Lock className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        <span className="truncate font-mono text-slate-300">
                          {getCleanPreviewUrl().replace(/^https?:\/\//, '')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIframeKey((k) => k + 1);
                            setIframeLoading(true);
                          }}
                          className="text-slate-400 hover:text-white transition-colors"
                          title={lang === 'ar' ? 'تحديث' : 'Refresh'}
                        >
                          <RefreshCw className={`w-2.5 h-2.5 ${iframeLoading ? 'animate-spin text-cyan-400' : ''}`} />
                        </button>
                        <a
                          href={getCleanPreviewUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-white transition-colors"
                          title={lang === 'ar' ? 'فتح في تبويب جديد' : 'Open in new tab'}
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    {/* Loading Overlay */}
                    {iframeLoading && (
                      <div className="absolute inset-0 top-7 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2 text-slate-300">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                        <span className="text-[10px] font-medium text-slate-400">
                          {lang === 'ar' ? 'جاري تحميل الموقع...' : 'Loading site...'}
                        </span>
                      </div>
                    )}

                    {/* Real Iframe */}
                    <iframe
                      key={iframeKey}
                      src={getCleanPreviewUrl()}
                      onLoad={() => setIframeLoading(false)}
                      className="w-full flex-1 border-0 bg-white"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      loading="eager"
                    />

                    {/* Bottom Helper Bar */}
                    <div className="bg-slate-950 border-t border-slate-800 px-3 py-1 flex items-center justify-between text-[9px] text-slate-400 shrink-0 select-none">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {lang === 'ar' ? 'معاينة حية للموقع' : 'Live Web Preview'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('native')}
                        className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                      >
                        {lang === 'ar' ? 'محاكي التطبيق' : 'Native UI'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 font-sans relative terminal-scroll">
                    
                    {/* App Bar */}
                    <div
                      className="flex items-center justify-between pb-2 border-b border-slate-800 transition-colors"
                      style={{ borderBottomColor: themeColor ? `${themeColor}40` : undefined }}
                    >
                      <div className="flex items-center gap-2">
                        {iconPreview ? (
                          <img src={iconPreview} alt="App" className="w-7 h-7 rounded-lg object-cover shadow" />
                        ) : (
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md"
                            style={{ backgroundColor: themeColor || '#4f46e5' }}
                          >
                            {(appName || 'A').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-white tracking-tight truncate max-w-[140px]">
                            {appName || 'ShopNova Mobile'}
                          </h4>
                          <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                            <span>{deviceTarget === 'ios' ? 'iOS Native PWA' : 'Android AAB Build'}</span>
                          </span>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <Bell className="w-3 h-3 text-indigo-400" />
                      </div>
                    </div>

                    {/* Simulated Push Toast (Conditional on toggle) */}
                    {featurePush && (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 shadow-lg text-[10px] space-y-1 transition-all">
                        <div className="flex items-center justify-between text-indigo-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>{lang === 'ar' ? 'إشعار فوري نشط' : 'Push Delivery Active'}</span>
                          </span>
                          <span className="text-slate-500 text-[8px] font-mono">{phoneClock}</span>
                        </div>
                        <p className="text-slate-300 leading-tight">
                          {lang === 'ar'
                            ? 'تم إرسال إشعار تفاعلي للمستخدم عبر قنوات FCM و APNS.'
                            : 'Push channel synced with FCM & APNS cloud delivery.'}
                        </p>
                      </div>
                    )}

                    {/* Biometric Badge Toast if enabled */}
                    {featureBio && (
                      <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[10px] flex items-center gap-2 text-emerald-300">
                        <Fingerprint className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{lang === 'ar' ? 'تمت المصادقة ببصمة الوجه بنجاح' : 'Biometric FaceID authenticated'}</span>
                      </div>
                    )}

                    {/* Sample Store Banner */}
                    <div
                      className="rounded-xl p-3 text-white space-y-1.5 shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${themeColor}bb, #0f172a)`,
                        border: `1px solid ${themeColor}40`,
                      }}
                    >
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-white/20 text-white">
                        {lang === 'ar' ? 'تطبيق متزامن' : 'Live Sync'}
                      </span>
                      <h5 className="text-xs font-bold leading-tight">
                        {appName ? `${appName} Official App` : 'Summer Sneaker Drop 2026'}
                      </h5>
                      <p className="text-[10px] text-slate-300">
                        {lang === 'ar'
                          ? 'متزامن مباشرة مع خوادم متجرك بدون تأخير.'
                          : 'Synchronized smoothly with web store backend in real-time.'}
                      </p>
                    </div>

                    {/* Product Cards */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="h-14 rounded-lg bg-slate-800 flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="text-[10px] font-semibold text-white">Cyber Runner X</div>
                        <div className="text-[9px] text-indigo-400 font-bold">$189.00</div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="h-14 rounded-lg bg-slate-800 flex items-center justify-center">
                          <Headphones className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="text-[10px] font-semibold text-white">Aero Pods Pro</div>
                        <div className="text-[9px] text-emerald-400 font-bold">$120.00</div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Bottom Navigation */}
                <div className="px-6 py-2.5 bg-[#080b12] border-t border-slate-800 flex items-center justify-between text-slate-400">
                  <Home className="w-4 h-4 text-indigo-400" />
                  <Search className="w-4 h-4 hover:text-slate-200" />
                  <ShoppingBag className="w-4 h-4 hover:text-slate-200" />
                  <User className="w-4 h-4 hover:text-slate-200" />
                </div>

                {/* Phone Home Bar */}
                <div className="pb-1.5 pt-1 flex justify-center bg-[#080b12]">
                  <div className="w-24 h-1 bg-slate-700 rounded-full"></div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── Real App Builder & Customizer Section ── */}
      <section id="builder" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            {lang === 'ar' ? 'معالج البناء والتصدير' : 'Production Build Suite'}
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'ar' ? 'خصص تطبيقك واحفظه في لوحة التحكم' : 'Customize Your App & Export to Dashboard'}
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            {lang === 'ar'
              ? 'اربط هويتك البصرية، واضبط الأيقونة وإعلانات Google AdMob ليتم تجميع ملف الـ APK الخاص بك فوراً.'
              : 'Set your branding, configure app icon and AdMob monetization to build your production APK.'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-6">
          
          {/* Store URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {lang === 'ar' ? 'رابط المتجر أو صفحة الهبوط' : 'Store or landing page URL'} *
            </label>
            <div className="relative">
              <Globe className="absolute right-4 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={storeUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://siin.shop/ar"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-11 pl-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                dir="ltr"
              />
            </div>
          </div>

          {/* App Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {lang === 'ar' ? 'اسم التطبيق' : 'App name'}
            </label>
            <div className="relative">
              <Smartphone className="absolute right-4 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="ShopNova"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-11 pl-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Platform & Theme Color Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {lang === 'ar' ? 'المنصة المستهدفة' : 'Target platform'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['both', 'android', 'ios'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      platform === p
                        ? 'bg-indigo-500/20 border-indigo-500/60 text-white shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p === 'both' ? (lang === 'ar' ? 'الكل (موصى)' : 'Both') : p === 'android' ? 'Android' : 'iOS'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {lang === 'ar' ? 'لون الهوية (Theme Color)' : 'Theme color'}
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
          </div>

          {/* Icon Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              {lang === 'ar' ? 'أيقونة التطبيق (اختياري)' : 'App icon (optional)'}
            </label>
            <label className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3 cursor-pointer hover:border-indigo-500 transition-colors">
              {iconPreview ? (
                <img src={iconPreview} alt="App icon" className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <Smartphone className="h-8 w-8 text-slate-600" />
              )}
              <span className="text-xs text-slate-400 truncate flex-1">
                {iconFile?.name || (lang === 'ar' ? 'اختر صورة PNG أو JPG أو WebP (حتى 2MB)' : 'Choose PNG, JPG, or WebP image (up to 2MB)')}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => handleIconChange(e.target.files?.[0])}
              />
            </label>
          </div>

          {/* AdMob Guidance Card */}
          <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/20 p-5 transition-all hover:border-indigo-500/40">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 shadow-inner">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">
                    {lang === 'ar' ? 'تريد تحقيق أرباح عبر Google AdMob؟' : 'Monetize with Google AdMob'}
                  </span>
                  <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                    Android APK
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-300 mb-3">
                  {lang === 'ar'
                    ? 'يمكنك ربط إعلانات البنر والشاشات الكاملة وتوليد ملف APK المخصص للأرباح بضغطة زر عبر صفحة إعداد AdMob.'
                    : 'Configure your banner and interstitial ad units to build a monetized APK directly through our AdMob wizard.'}
                </p>
                <Link
                  href="/admob"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                >
                  <span>{lang === 'ar' ? 'انتقل إلى إعدادات AdMob' : 'Go to AdMob Setup'}</span>
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCreateOrExport}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-500/25 ring-1 ring-white/10 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>
                    {user
                      ? (lang === 'ar' ? 'حفظ وتصدير التطبيق إلى لوحة التحكم' : 'Save and export to dashboard')
                      : (lang === 'ar' ? 'تسجيل الدخول وبدء التصدير' : 'Sign in and export app')}
                  </span>
                </>
              )}
            </button>
          </div>

        </div>
      </section>

      {/* ── Bento Grid: Modern Architectural Features ── */}
      <section id="bento" className="py-20 relative border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              {lang === 'ar' ? 'الميزات الهندسية المتقدمة' : 'Architectural Advantage'}
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {lang === 'ar' ? 'كل ما تحتاجه لتصدر متجر التطبيقات' : 'Everything You Need to Dominate the App Stores'}
            </p>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              {lang === 'ar'
                ? 'محرك Appifya يغلف تقنيات الويب داخل أغلفة Chromium و WebKit فائقة السرعة مع وصول كامل لأهم واجهات برمجة الهاتف.'
                : 'Appifya wraps web technologies inside high-performance Chromium & WebKit native wrappers with direct OS-level API bridge access.'}
            </p>
          </div>

          {/* Bento Cards Structure */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            {/* Bento Card 1: Fast Build (2 cols) */}
            <div className="md:col-span-2 glass-card glass-card-hover rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {lang === 'ar' ? 'بناء سحابي آلي فوري (Instant Cloud Bundling)' : 'Instant Automated Cloud Bundling'}
                </h3>
                <p className="text-sm text-slate-400 max-w-md">
                  {lang === 'ar'
                    ? 'وداعاً لتعقيدات Android Studio و Xcode. خوادمنا تتكفل بتنزيل الحزم البرمجية، تشغيل فحص الأمان، وتوقيع ملفات AAB و APK و IPA في دقائق معدودة.'
                    : 'No Xcode or Android Studio required. Our distributed build fleet compiles native source, runs security scans, and produces signed release artifacts in minutes.'}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center gap-6">
                <div>
                  <span className="text-2xl font-extrabold text-white">99.8%</span>
                  <p className="text-xs text-slate-400">{lang === 'ar' ? 'نسبة نجاح التجميع' : 'Build Success Rate'}</p>
                </div>
                <div className="w-px h-8 bg-slate-800"></div>
                <div>
                  <span className="text-2xl font-extrabold text-emerald-400">&lt; 45s</span>
                  <p className="text-xs text-slate-400">{lang === 'ar' ? 'متوسط وقت البناء' : 'Average Turnaround'}</p>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Biometric Auth (1 col) */}
            <div className="glass-card glass-card-hover rounded-3xl p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {lang === 'ar' ? 'المصادقة البيومترية' : 'Biometric Login'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'دعم مدمج لبصمة الوجه FaceID وبصمة الإصبع TouchID لتأمين جلسات المستخدم دون تعقيد.'
                    : 'Plug-and-play FaceID & TouchID support. Authenticate web sessions without complex native Swift or Kotlin code.'}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-cyan-400 font-medium">
                <span>{lang === 'ar' ? 'سلسلة مفاتيح مشفرة' : 'Encrypted Keyring'}</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bento Card 3: Push Notifications (1 col) */}
            <div className="glass-card glass-card-hover rounded-3xl p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {lang === 'ar' ? 'محرك الإشعارات' : 'Push Engine'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'ربط مباشر مع Firebase و OneSignal لإرسال إشعارات تسويقية تضاعف تفاعل العملاء حتى 3 أضعاف.'
                    : 'Direct Firebase & OneSignal hooks. Send marketing notifications that re-engage users with 3x higher click-through.'}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <span>{lang === 'ar' ? 'جاهز لـ FCM و APNS' : 'FCM + APNS Ready'}</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bento Card 4: Store Compliance (1 col) */}
            <div className="glass-card glass-card-hover rounded-3xl p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {lang === 'ar' ? 'أمان القبول بالمتجر' : 'Store Approval Safe'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'مطابقة تامة لسياسات Google Play ومتطلبات مراجعة متجر Apple App Store (إرشادات 4.2.6).'
                    : 'Full compliance with Google Play Store guidelines and Apple App Store Review Guideline 4.2.6.'}
                </p>
              </div>
              <span className="mt-6 text-xs text-amber-300 font-medium flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> {lang === 'ar' ? 'متوافق مع السياسات 100%' : '100% Policy Compliant'}
              </span>
            </div>

            {/* Bento Card 5: Offline Mode & Asset Caching (2 cols) */}
            <div className="md:col-span-2 glass-card glass-card-hover rounded-3xl p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <HardDrive className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {lang === 'ar' ? 'التخزين المؤقت المتقدم للأصول (Edge Pre-caching)' : 'Edge Asset Pre-caching'}
                </h3>
                <p className="text-sm text-slate-400">
                  {lang === 'ar'
                    ? 'يتم تخزين ملفات CSS و JavaScript والأيقونات الرئيسية محلياً داخل حزمة التطبيق. هذا يلغي شاشات التحميل الفارغة ويضمن تشغيل التطبيق في ثانية واحدة حتى مع الاتصالات الضعيفة.'
                    : 'CSS, JavaScript, and key images are cached locally inside the binary to eliminate blank splash screens and ensure instant boot times.'}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                  PWA Manifest Auto-sync
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                  Service Worker Bridge
                </span>
              </div>
            </div>

            {/* Bento Card 6: Live Code Updates (1 col) */}
            <div className="glass-card glass-card-hover rounded-3xl p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {lang === 'ar' ? 'تحديثات هوائية (OTA)' : 'Over-The-Air (OTA)'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'انشر تعديلات موقعك مباشرة. يتلقى مستخدمو تطبيقك التحديثات فورياً دون انتظار مراجعات المتجر الطويلة.'
                    : 'Deploy web updates immediately. Your mobile users receive frontend updates without waiting for store reviews.'}
                </p>
              </div>
              <span className="mt-6 text-xs text-rose-400 font-medium">
                {lang === 'ar' ? 'تحديثات حية وفورية' : 'Real-time Live Sync'}
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* ── Wall of Trust & Comparison Section: Appifya vs. Manual Android Studio ── */}
      <section id="comparison" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-300 mb-4">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <span>{lang === 'ar' ? 'مقارنة الحلول الذكية' : lang === 'fr' ? 'Comparatif Intelligent' : 'Smart Comparison'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {lang === 'ar' ? (
              <>
                لماذا <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">Appifya</span> بدلاً من Android Studio اليدوي؟
              </>
            ) : lang === 'fr' ? (
              <>
                Pourquoi <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">Appifya</span> plutôt qu'Android Studio manuel ?
              </>
            ) : (
              <>
                Why <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">Appifya</span> over Manual Android Studio?
              </>
            )}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {lang === 'ar'
              ? 'وفّر ساعات من الإعداد التقني المعقد ومشاكل Gradle وSDK. إليك الفارق الحقيقي بين البناء السحابي الذكي والطريقة التقليدية.'
              : lang === 'fr'
              ? 'Économisez des heures de configuration complexe, d’erreurs Gradle et de SDK. Découvrez la vraie différence.'
              : 'Save hours of complex tooling, Gradle dependency errors, and heavy installs. Here is the real difference between cloud automation and manual development.'}
          </p>
        </div>

        {/* Wall of Trust Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 mb-1">~2 min</div>
            <div className="text-xs font-semibold text-slate-200 mb-0.5">{lang === 'ar' ? 'وقت البناء السحابي' : lang === 'fr' ? 'Temps de build' : 'Cloud Build Time'}</div>
            <div className="text-[11px] text-slate-500">{lang === 'ar' ? 'بدلاً من أيام من التطوير' : lang === 'fr' ? 'Au lieu de plusieurs jours' : 'Instead of days of setup'}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mb-1">0 GB</div>
            <div className="text-xs font-semibold text-slate-200 mb-0.5">{lang === 'ar' ? 'مساحة تخزين مطلوبة' : lang === 'fr' ? 'Espace disque local' : 'Local Disk Space'}</div>
            <div className="text-[11px] text-slate-500">{lang === 'ar' ? 'يعمل سحابياً 100%' : lang === 'fr' ? '100% dans le cloud' : '100% in the cloud'}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mb-1">100%</div>
            <div className="text-xs font-semibold text-slate-200 mb-0.5">{lang === 'ar' ? 'جاهزية Google Play' : lang === 'fr' ? 'Conforme Google Play' : 'Play Store Compliant'}</div>
            <div className="text-[11px] text-slate-500">{lang === 'ar' ? 'حزم AAB و APK موثقة' : lang === 'fr' ? 'Packages signés AAB/APK' : 'Signed AAB & APK bundles'}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-violet-400 mb-1">12+</div>
            <div className="text-xs font-semibold text-slate-200 mb-0.5">{lang === 'ar' ? 'أداة تدقيق مدمجة' : lang === 'fr' ? 'Outils de diagnostic' : 'Integrated Audit Tools'}</div>
            <div className="text-[11px] text-slate-500">{lang === 'ar' ? 'فحص الأذونات والسلامة' : lang === 'fr' ? 'Audit des permissions' : 'Permission & safety audits'}</div>
          </div>
        </div>

        {/* Side-by-Side Comparison Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-800/80">
            
            {/* Column 1: Manual Android Studio */}
            <div className="p-6 sm:p-8 space-y-6 bg-slate-950/40">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                    {lang === 'ar' ? 'الطريقة التقليدية' : lang === 'fr' ? 'Méthode Traditionnelle' : 'Traditional Approach'}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {lang === 'ar' ? 'تطوير يدوي عبر Android Studio' : lang === 'fr' ? 'Android Studio Manuel' : 'Manual Android Studio'}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <X className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-5 text-xs sm:text-sm text-slate-400">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-slate-200 block text-xs sm:text-sm">
                      {lang === 'ar' ? 'تثبيت ضخم يستهلك مساحة جهازك' : lang === 'fr' ? 'Installation lourde (3 Go+)' : 'Heavy 3GB+ Installation'}
                    </strong>
                    <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                      {lang === 'ar'
                        ? 'تثبيت Android Studio بحجم 3GB+، بالإضافة لحزم SDK، وأدوات Build Tools، ومحاكيات تستهلك أكثر من 15GB من مساحة التخزين.'
                        : 'Requires 3GB+ IDE download, plus Android SDKs, Java JDK, and emulators eating up over 15GB of disk space.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-slate-200 block text-xs sm:text-sm">
                      {lang === 'ar' ? 'أخطاء Gradle وتعارض إصدارات SDK' : lang === 'fr' ? 'Erreurs Gradle & conflits SDK' : 'Gradle Errors & SDK Conflicts'}
                    </strong>
                    <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                      {lang === 'ar'
                        ? 'ساعات من البحث لحل تعارض إصدارات Gradle، وتناقضات Java JDK Mismatch، وتحديثات واجهات برمجة التطبيقات المتعطلة.'
                        : 'Endless debugging of Gradle dependency conflicts, JDK version mismatches, and broken compile options.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-slate-200 block text-xs sm:text-sm">
                      {lang === 'ar' ? 'إعداد TWA والروابط يدوياً' : lang === 'fr' ? 'Configuration TWA manuelle' : 'Manual TWA & Intent Filters'}
                    </strong>
                    <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                      {lang === 'ar'
                        ? 'كتابة ملف AndroidManifest.xml، وبرمجة Trusted Web Activity يدوياً، والتحقق الشاق من ملفات assetlinks.json.'
                        : 'Writing AndroidManifest.xml, wiring Android intent-filters, and tedious manual assetlinks.json configuration.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-slate-200 block text-xs sm:text-sm">
                      {lang === 'ar' ? 'صداع التوقيع الرقمي والـ Keystore' : lang === 'fr' ? 'Gestion complexe des Keystores' : 'Complex Keystore Signing'}
                    </strong>
                    <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                      {lang === 'ar'
                        ? 'إنشاء ملفات Keytool عبر التيرمينال، وحساب SHA-256 Fingerprints، ومخاطر فقدان مفتاح التطبيق للأبد.'
                        : 'Generating keystores via command line, SHA-256 fingerprint calculations, and the risk of losing signing keys.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="h-3 w-3" />
                  </div>
                  <div>
                    <strong className="text-slate-200 block text-xs sm:text-sm">
                      {lang === 'ar' ? 'مخاطر الرفض في Google Play' : lang === 'fr' ? 'Risques de rejet Play Store' : 'High Risk of Play Store Rejection'}
                    </strong>
                    <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                      {lang === 'ar'
                        ? 'عدم معرفة الأذونات الحساسة المخفية، ورفض التطبيق بسبب استبيان سلامة البيانات (Data Safety) غير الدقيق.'
                        : 'Hidden sensitive permissions, missing privacy policy clauses, and common rejections on the Data Safety form.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: With Appifya Cloud */}
            <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-indigo-950/30 to-violet-950/20 relative">
              <div className="absolute top-4 end-4">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  {lang === 'ar' ? 'الخيار الأسرع والذكي' : lang === 'fr' ? 'Solution Recommandée' : 'Smart & Recommended'}
                </span>
              </div>

              <div className="pb-4 border-b border-indigo-500/20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  {lang === 'ar' ? 'محرك Appifya السحابي' : lang === 'fr' ? 'Moteur Cloud Appifya' : 'Appifya Cloud Engine'}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {lang === 'ar' ? 'أتمتة سحابية كاملة في دقائق' : lang === 'fr' ? 'Automatisation Cloud Complète' : 'Fully Automated Cloud Pipeline'}
                </h3>
              </div>

              <div className="space-y-5 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block text-xs sm:text-sm">
                      {lang === 'ar' ? '0GB على جهازك — يعمل سحابياً بالكامل' : lang === 'fr' ? '0 Go sur votre machine (Cloud 100%)' : '0GB on Your Machine (100% Cloud)'}
                    </strong>
                    <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">
                      {lang === 'ar'
                        ? 'لا حاجة لتنزيل أي برامج أو حزم SDK. يعمل مباشرة من متصفحك أو من خلال GitHub Actions في خط الـ CI/CD.'
                        : 'No downloads or SDK installations needed. Runs seamlessly in your browser or automatically via GitHub Actions.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block text-xs sm:text-sm">
                      {lang === 'ar' ? 'بناء مؤتمت خالٍ من أخطاء Gradle' : lang === 'fr' ? 'Build automatisé sans erreurs Gradle' : 'Automated Build With Zero Gradle Hell'}
                    </strong>
                    <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">
                      {lang === 'ar'
                        ? 'محركات سحابية مُهيأة بأحدث أدوات البناء الرسمية تضمن إنتاج حزم نظيفة بدون أي تعارض في الإصدارات.'
                        : 'Pre-configured cloud runners with tested, verified Android toolchains guarantee clean, reproducible builds.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block text-xs sm:text-sm">
                      {lang === 'ar' ? 'إعداد TWA وتوليد AssetLinks تلقائياً' : lang === 'fr' ? 'TWA & AssetLinks générés automatiquement' : 'Instant TWA & AssetLinks Setup'}
                    </strong>
                    <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">
                      {lang === 'ar'
                        ? 'توليد ملفات manifest.json و assetlinks.json وربط النطاق بالكامل مع فتح الروابط داخل التطبيق بدون شريط المتصفح.'
                        : 'Instant manifest and assetlinks generation with full Trusted Web Activity integration and no URL bar.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block text-xs sm:text-sm">
                      {lang === 'ar' ? 'توقيع وتشفير معتمد لـ Google Play' : lang === 'fr' ? 'Signature conforme Google Play' : 'Play Store Ready Code Signing'}
                    </strong>
                    <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">
                      {lang === 'ar'
                        ? 'توقيع رقمي موثوق مع شهادات تشفير جاهزة للاختبار أو الرفع الفوري لحساب مطوري Google Play Console.'
                        : 'Automated release-ready signing and keystore management meeting Google Play App Signing requirements.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block text-xs sm:text-sm">
                      {lang === 'ar' ? 'فحص تلقائي للأخطاء وسلامة البيانات' : lang === 'fr' ? 'Audit automatique et sécurité Play' : 'Automated Error & Data Safety Audit'}
                    </strong>
                    <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">
                      {lang === 'ar'
                        ? 'فاحص أذونات مدمج، مولد إجابات سلامة البيانات (Play Data Safety)، ومصمم سكرين شوت المتجر لتجاوز مراجعات Google Play بسلاسة.'
                        : 'Built-in permissions scanner, Google Play Data Safety answer generator, and screenshot framer for fast approvals.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Action Strip */}
          <div className="border-t border-slate-800 bg-slate-950/80 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 text-center sm:text-start">
              <span className="font-semibold text-white">
                {lang === 'ar' ? 'جاهز لتحويل متجرك أو موقعك؟' : lang === 'fr' ? 'Prêt à convertir votre site ?' : 'Ready to turn your site into an app?'}
              </span>{' '}
              {lang === 'ar' ? 'احصل على أول ملف APK مجاناً في دقيقتين.' : lang === 'fr' ? 'Obtenez votre premier APK gratuit en 2 min.' : 'Get your first APK free in under 2 minutes.'}
            </div>
            <a
              href="#builder"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all shrink-0"
            >
              <span>{lang === 'ar' ? 'ابدأ البناء الآن مجاناً' : lang === 'fr' ? 'Commencer Gratuitement' : 'Start Building For Free'}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </a>
          </div>
        </div>

      </section>

      {/* ── Transparent SaaS Pricing Table (2 Plans: Free & Pro Studio) ── */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            {lang === 'ar' ? 'أسعار واضحة وبسيطة' : 'Transparent Pricing'}
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-white">
            {lang === 'ar' ? 'خطتان واضحتان تناسبان احتياجك' : 'Two Simple Plans for Your Needs'}
          </p>
          <p className="mt-3 text-slate-400 text-sm">
            {lang === 'ar'
              ? 'ابدأ مجاناً 100% لبناء وتجربة تطبيقك، أو فعّل إعلانات AdMob لتحقيق الأرباح باشتراك شهري ثابت.'
              : 'Start 100% free to build your app, or unlock AdMob monetization with an affordable monthly plan.'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Plan 1: Starter / Free */}
          <div className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                {lang === 'ar' ? 'مجاناً للجميع' : 'Free Forever'}
              </div>
              <h3 className="text-xl font-bold text-white">{lang === 'ar' ? 'خطة البداية (Starter)' : 'Starter Plan'}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'ar'
                  ? 'مثالية لتجربة تحويل موقعك أو متجرك إلى تطبيق أندرويد و PWA بدون أي تكلفة وبدون إعلانات.'
                  : 'Perfect for converting your store or landing page into a PWA & Android app with zero cost and no ads.'}
              </p>
              <div className="pt-2">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-slate-400 text-sm">{lang === 'ar' ? ' / مجاناً مدى الحياة' : ' / free forever'}</span>
              </div>
              <ul className="space-y-3 pt-4 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{lang === 'ar' ? 'تحويل أي موقع متوافق مع HTTPS إلى PWA' : 'Convert any HTTPS store to PWA'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{lang === 'ar' ? 'توليد ملف APK جاهز للتثبيت والتجربة' : 'Build & download installable APK'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{lang === 'ar' ? 'دعم العمل بدون إنترنت (PWA Offline Caching)' : 'PWA offline caching & service worker'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{lang === 'ar' ? 'تخصيص الأيقونة والاسم ولون الهوية' : 'Custom app name, icon & branding color'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{lang === 'ar' ? 'كود شريط التحميل الذكي (Smart Banner)' : 'Smart App Banner code for your site'}</span>
                </li>
                <li className="flex items-center gap-2.5 text-slate-500">
                  <X className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>{lang === 'ar' ? 'بدون إعلانات AdMob (تطبيق بدون إعلانات)' : 'No AdMob monetization (Clean App)'}</span>
                </li>
              </ul>
            </div>
            <a
              href="#builder"
              className="mt-8 w-full py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-white transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{lang === 'ar' ? 'ابدأ مجاناً الآن' : 'Start for Free'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </a>
          </div>

          {/* Plan 2: Pro Studio ($19/mo - Most Popular) */}
          <div className="glass-card rounded-3xl p-8 border-2 border-indigo-500 relative flex flex-col justify-between shadow-2xl shadow-indigo-500/25 bg-gradient-to-b from-indigo-950/40 via-slate-900/80 to-slate-900/90">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-[10px] font-extrabold text-white tracking-widest uppercase shadow-md shadow-indigo-500/30">
              {lang === 'ar' ? 'الأكثر طلباً (الربح من التطبيق)' : 'Most Popular (Monetized)'}
            </div>
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                {lang === 'ar' ? 'تفعيل إعلانات AdMob' : 'AdMob Integration'}
              </div>
              <h3 className="text-xl font-bold text-white">{lang === 'ar' ? 'استوديو برو (Pro Studio)' : 'Pro Studio Plan'}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'ar'
                  ? 'للمطورين وأصحاب المتاجر لتحقيق أرباح حقيقية وإطلاق تطبيقاتهم رسمياً على Google Play مع إعلاناتك الخاصة.'
                  : 'Integrate AdMob ads, own 100% of your earnings, and get store-ready Google Play AAB binaries.'}
              </p>
              <div className="pt-2">
                <span className="text-4xl font-extrabold text-white">$19</span>
                <span className="text-indigo-300 text-sm font-semibold">{lang === 'ar' ? ' / شهرياً عبر PayPal' : ' / month via PayPal'}</span>
              </div>
              <ul className="space-y-3 pt-4 text-xs text-slate-200">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-semibold text-white">{lang === 'ar' ? 'جميع ميزات الخطة المجانية بالكامل' : 'All Free Plan features included'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-semibold text-white">
                    {lang === 'ar' ? 'تفعيل إعلانات Google AdMob (البنر والشاشات البينية)' : 'Google AdMob Banner & Interstitial ad units'}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300 font-bold">
                    {lang === 'ar' ? '100% من أرباح الإعلانات لك في حسابك' : '100% ad revenue stays directly yours'}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{lang === 'ar' ? 'توليد ملفات متجر Play الرسمية (AAB + APK)' : 'Google Play release bundle (AAB + APK)'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{lang === 'ar' ? 'توقيع Keystore خاص بتطبيقك (Release Keystore)' : 'Custom release keystore signing'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{lang === 'ar' ? 'دعم الإشعارات الفورية غير المحدودة (FCM)' : 'Unlimited Push Notifications (FCM)'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{lang === 'ar' ? 'بناء وتصدير غير محدود لجميع تطبيقاتك' : 'Unlimited builds for all your apps'}</span>
                </li>
              </ul>
            </div>
            <Link
              href="/admob"
              className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] text-center flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>{lang === 'ar' ? 'ترقية وتفعيل AdMob بـ 19$' : 'Upgrade to Pro Studio ($19/mo)'}</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ── Customer Stories Showcase (Median-style) ── */}
      <CustomerStoriesShowcase />

      {/* ── Frequently Asked Questions ── */}
      <section className="mt-20 mb-20 mx-auto max-w-4xl px-4" aria-labelledby="faq">
        <div className="mb-8 text-center">
          <HelpCircle className="mx-auto mb-3 h-7 w-7 text-indigo-400" />
          <h2 id="faq" className="text-2xl font-black text-white sm:text-3xl">
            {lang === 'ar' ? 'الأسئلة الشائعة' : lang === 'fr' ? 'Questions fréquentes' : 'Frequently asked questions'}
          </h2>
        </div>
        <div className="space-y-3">
          {[
            [
              lang === 'ar' ? 'هل التحويل الأساسي مجاني؟' : lang === 'fr' ? 'L’export de base est-il gratuit ?' : 'Is the basic export free?',
              lang === 'ar' ? 'نعم، التحويل الأساسي بدون إعلانات مجاني حالياً. أي ميزة إضافية أو خدمة مستقبلية ستظهر بوضوح تام.' : 'Yes. The basic export without ads is currently free. Any future paid features are clearly displayed.',
            ],
            [
              lang === 'ar' ? 'هل أحتاج إلى Android Studio أو حاسوب Mac؟' : 'Do I need Android Studio or a Mac?',
              lang === 'ar' ? 'لا، المنصة السحابية تتولى تجميع ملفات AAB و APK و IPA بنقرة زر واحدة عبر خوادمنا السحابية.' : 'No. Appifya cloud runner handles complete building and signing without requiring Mac hardware or Android Studio.',
            ],
            [
              lang === 'ar' ? 'هل أملك أرباح إعلانات AdMob؟' : 'Who owns AdMob revenue?',
              lang === 'ar' ? 'نعم 100%. عند استخدام إعدادات AdMob الخاصة بك، يبقى الحساب والأرباح ملكاً لك مباشرة دون أي نسبة اقتطاع.' : 'Your settings and revenue remain 100% yours with direct deposit from Google.',
            ],
            [
              lang === 'ar' ? 'لماذا لا تظهر بعض المواقع داخل المعاينة الحية؟' : 'Why do some sites not appear in live iframe preview?',
              lang === 'ar' ? 'بعض المواقع تمنع التضمين داخل iframe لأسباب أمنية (X-Frame-Options). يمكنك استخدام محاكي التطبيق الأصلي المدمج أو زر الفتح خارجياً، ولا يمنع ذلك إنشاء التطبيق.' : 'Some sites restrict iframe embedding for security headers. You can always use our native simulated view or test externally; this does not prevent app creation.',
            ],
          ].map(([question, answer]) => (
            <details key={question} className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 glass-card">
              <summary className="cursor-pointer list-none font-bold text-white marker:hidden flex items-center justify-between">
                <span>{question}</span>
                <span className="text-indigo-400 font-mono text-sm group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-400">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Final Call to Action ── */}
      <section className="mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/60 p-10 text-center shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {lang === 'ar' ? 'ابدأ بتحويل موقعك إلى تطبيق متجر اليوم' : 'Ready to Launch Your Mobile App Today?'}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">
            {lang === 'ar'
              ? 'انضم إلى آلاف المطورين وأصحاب المتاجر الذين وسعوا حضورهم على الهواتف الذكية مع Appifya.'
              : 'Join developers and merchants who turned their websites into store-ready apps with Appifya.'}
          </p>
          <a
            href="#builder"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>{lang === 'ar' ? 'ابدأ مجاناً الآن' : 'Get Started for Free'}</span>
          </a>
        </div>
      </section>

      {/* ── Schema.org Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(lang)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema(lang)) }}
      />
    </main>
  );
}
