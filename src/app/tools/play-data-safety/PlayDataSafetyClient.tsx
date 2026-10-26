'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n';
import {
  ShieldCheck,
  Download,
  Copy,
  Check,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Bell,
  DollarSign,
  Bug,
  LineChart,
  User,
  MapPin,
  Camera,
  Layers,
  Smartphone,
} from 'lucide-react';

// ─── SDK Definition Interface ───
interface SdkItem {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  description: string;
  privacyUrl: string;
  collectedTypes: {
    type: string;
    category: string;
    purpose: string[];
    shared: boolean;
    ephemeral: boolean;
    required: boolean;
  }[];
}

const SUPPORTED_SDKS: SdkItem[] = [
  {
    id: 'admob',
    name: 'Google AdMob / Google Mobile Ads',
    category: 'Advertising & Monetization',
    icon: DollarSign,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15 border-amber-500/25',
    description: 'Displays banner, interstitial, and rewarded ads. Collects Advertising ID and diagnostic crash logs.',
    privacyUrl: 'https://policies.google.com/privacy',
    collectedTypes: [
      {
        type: 'Device or other IDs (Advertising ID / GAID)',
        category: 'Device or other IDs',
        purpose: ['Advertising or marketing', 'Analytics'],
        shared: true,
        ephemeral: false,
        required: true,
      },
      {
        type: 'Crash logs & Diagnostics',
        category: 'App info and performance',
        purpose: ['Analytics', 'App functionality'],
        shared: true,
        ephemeral: false,
        required: true,
      },
    ],
  },
  {
    id: 'firebase-analytics',
    name: 'Google Analytics for Firebase',
    category: 'Analytics',
    icon: LineChart,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/15 border-indigo-500/25',
    description: 'Tracks user engagement, screen views, and conversion events.',
    privacyUrl: 'https://firebase.google.com/support/privacy',
    collectedTypes: [
      {
        type: 'App interactions & events',
        category: 'App activity',
        purpose: ['Analytics'],
        shared: false,
        ephemeral: false,
        required: true,
      },
      {
        type: 'Device or other IDs (App Instance ID)',
        category: 'Device or other IDs',
        purpose: ['Analytics'],
        shared: false,
        ephemeral: false,
        required: true,
      },
    ],
  },
  {
    id: 'firebase-crashlytics',
    name: 'Firebase Crashlytics',
    category: 'Crash Reporting',
    icon: Bug,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/15 border-rose-500/25',
    description: 'Captures stack traces and diagnostic crash logs when the app fails or ANRs occur.',
    privacyUrl: 'https://firebase.google.com/support/privacy',
    collectedTypes: [
      {
        type: 'Crash logs & Stack traces',
        category: 'App info and performance',
        purpose: ['App functionality', 'Analytics'],
        shared: false,
        ephemeral: false,
        required: true,
      },
      {
        type: 'Device or other IDs (Installation UUID)',
        category: 'Device or other IDs',
        purpose: ['App functionality', 'Analytics'],
        shared: false,
        ephemeral: false,
        required: true,
      },
    ],
  },
  {
    id: 'onesignal',
    name: 'OneSignal Push Notifications',
    category: 'Communications',
    icon: Bell,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/15 border-rose-500/25',
    description: 'Delivers web and mobile push notifications. Collects push tokens and device identifiers.',
    privacyUrl: 'https://onesignal.com/privacy_policy',
    collectedTypes: [
      {
        type: 'Device or other IDs (Player ID / Device Token)',
        category: 'Device or other IDs',
        purpose: ['App functionality', 'Developer communications'],
        shared: true,
        ephemeral: false,
        required: true,
      },
      {
        type: 'Notification interactions',
        category: 'App activity',
        purpose: ['Analytics', 'App functionality'],
        shared: true,
        ephemeral: false,
        required: false,
      },
    ],
  },
  {
    id: 'appwrite-auth',
    name: 'User Accounts / Auth (Appwrite or Firebase)',
    category: 'User Accounts',
    icon: User,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15 border-cyan-500/25',
    description: 'Manages user registration, email login, profile data, and session authentication.',
    privacyUrl: 'https://appwrite.io/privacy',
    collectedTypes: [
      {
        type: 'Name & Email address',
        category: 'Personal info',
        purpose: ['Account management', 'App functionality'],
        shared: false,
        ephemeral: false,
        required: true,
      },
      {
        type: 'User IDs (Account identifier)',
        category: 'Personal info',
        purpose: ['Account management', 'App functionality'],
        shared: false,
        ephemeral: false,
        required: true,
      },
    ],
  },
  {
    id: 'billing',
    name: 'In-App Purchases / Google Play Billing',
    category: 'Monetization',
    icon: DollarSign,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-500/25',
    description: 'Processes digital goods, subscriptions, and purchase receipts.',
    privacyUrl: 'https://policies.google.com/privacy',
    collectedTypes: [
      {
        type: 'Purchase history & order IDs',
        category: 'Financial info',
        purpose: ['App functionality', 'Account management', 'Fraud prevention'],
        shared: true,
        ephemeral: false,
        required: true,
      },
    ],
  },
  {
    id: 'location',
    name: 'Location Services (GPS / Maps)',
    category: 'Device Features',
    icon: MapPin,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/15 border-blue-500/25',
    description: 'Requests device GPS or network location for delivery, stores nearby, or mapping.',
    privacyUrl: 'https://policies.google.com/privacy',
    collectedTypes: [
      {
        type: 'Approximate & Precise Location',
        category: 'Location',
        purpose: ['App functionality', 'Personalization'],
        shared: false,
        ephemeral: true,
        required: false,
      },
    ],
  },
  {
    id: 'camera',
    name: 'Camera & Photo Library Uploads',
    category: 'Device Features',
    icon: Camera,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/15 border-purple-500/25',
    description: 'Allows users to take or upload photos (profile pictures, review attachments, scanning).',
    privacyUrl: 'https://policies.google.com/privacy',
    collectedTypes: [
      {
        type: 'Photos & Videos',
        category: 'Photos and videos',
        purpose: ['App functionality'],
        shared: false,
        ephemeral: false,
        required: false,
      },
    ],
  },
];

export default function PlayDataSafetyClient() {
  const { lang } = useLanguage();

  // ─── App Info State ───
  const [appName, setAppName] = useState('My Progressive Web App');
  const [developerName, setDeveloperName] = useState('My Company LLC');
  const [contactEmail, setContactEmail] = useState('privacy@example.com');
  const [hasAccounts, setHasAccounts] = useState(false);
  const [accountDeletionUrl, setAccountDeletionUrl] = useState('https://example.com/delete-account');

  // ─── Selected SDKs State ───
  const [selectedSdks, setSelectedSdks] = useState<string[]>(['admob', 'firebase-crashlytics']);
  const [currentDate, setCurrentDate] = useState('2026-10-24');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentDate(new Date().toISOString().split('T')[0]);
  }, []);

  // ─── UI State ───
  const [activeTab, setActiveTab] = useState<'cheat-sheet' | 'privacy-policy' | 'audit'>('cheat-sheet');
  const [policyFormat, setPolicyFormat] = useState<'formatted' | 'markdown' | 'html'>('formatted');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Toggle SDK selection
  const handleToggleSdk = (id: string) => {
    setSelectedSdks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Quick preset profiles
  const handleApplyPreset = (preset: 'admob-pwa' | 'ecommerce' | 'zero-data') => {
    if (preset === 'admob-pwa') {
      setSelectedSdks(['admob', 'firebase-crashlytics']);
      setHasAccounts(false);
    } else if (preset === 'ecommerce') {
      setSelectedSdks(['appwrite-auth', 'billing', 'onesignal', 'location', 'admob']);
      setHasAccounts(true);
    } else if (preset === 'zero-data') {
      setSelectedSdks([]);
      setHasAccounts(false);
    }
  };

  // ─── Aggregated Collected Data Types ───
  const aggregatedData = useMemo(() => {
    const list: {
      category: string;
      type: string;
      purposes: Set<string>;
      shared: boolean;
      ephemeral: boolean;
      required: boolean;
      sources: string[];
    }[] = [];

    selectedSdks.forEach((sdkId) => {
      const sdk = SUPPORTED_SDKS.find((s) => s.id === sdkId);
      if (!sdk) return;

      sdk.collectedTypes.forEach((item) => {
        const existing = list.find((d) => d.type === item.type);
        if (existing) {
          item.purpose.forEach((p) => existing.purposes.add(p));
          existing.shared = existing.shared || item.shared;
          existing.sources.push(sdk.name);
        } else {
          list.push({
            category: item.category,
            type: item.type,
            purposes: new Set(item.purpose),
            shared: item.shared,
            ephemeral: item.ephemeral,
            required: item.required,
            sources: [sdk.name],
          });
        }
      });
    });

    return list;
  }, [selectedSdks]);

  const hasAnyData = aggregatedData.length > 0;

  // ─── Generate Markdown Privacy Policy ───
  const generateMarkdownPolicy = useMemo(() => {
    const dateStr = currentDate;

    let content = `# Privacy Policy for ${appName}

**Last updated:** ${dateStr}

${developerName} ("we", "our", or "us") operates the **${appName}** application. This Privacy Policy informs you of our policies regarding the collection, use, and disclosure of personal data when you use our mobile application and the choices you have associated with that data.

## 1. Information Collection and Use
`;

    if (!hasAnyData) {
      content += `
We do not collect, store, or share any personally identifiable information or device identifiers through this application. All browsing and features function locally on your device without transmitting personal data to our servers.
`;
    } else {
      content += `
While using our application, we may collect certain information to provide and improve our service to you. This includes:

`;
      aggregatedData.forEach((item) => {
        content += `- **${item.category} (${item.type})**: Collected for ${Array.from(item.purposes).join(', ')}.
`;
      });
    }

    // Third-party SDKs
    const activeSdkObjects = SUPPORTED_SDKS.filter((s) => selectedSdks.includes(s.id));
    if (activeSdkObjects.length > 0) {
      content += `
## 2. Third-Party Service Providers

We employ third-party companies and individuals to facilitate our application, provide services on our behalf, or assist us in analyzing how our application is used. These third parties have access to specific data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose:

`;
      activeSdkObjects.forEach((s) => {
        content += `- **${s.name}**: ${s.description}  
  Privacy Policy: [${s.privacyUrl}](${s.privacyUrl})

`;
      });
    }

    content += `## 3. Data Security and Encryption
All data collected by ${appName} and its associated services is encrypted in transit using industry-standard protocols (HTTPS / SSL/TLS).

## 4. User Rights and Data Deletion
`;

    if (hasAccounts) {
      content += `Users who registered an account within the application can request full deletion of their account and all associated personal data at any time by visiting: [${accountDeletionUrl}](${accountDeletionUrl}) or by contacting us at ${contactEmail}.
`;
    } else {
      content += `You can request the deletion of any data associated with your interaction with ${appName} by contacting us directly at ${contactEmail}.
`;
    }

    content += `
## 5. Children's Privacy
Our application does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.

## 6. Contact Us
If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at:
- **Email:** ${contactEmail}
- **Developer/Company:** ${developerName}
`;

    return content;
  }, [appName, developerName, contactEmail, hasAccounts, accountDeletionUrl, hasAnyData, aggregatedData, selectedSdks]);

  // Convert markdown to clean HTML string
  const generateHtmlPolicy = useMemo(() => {
    const raw = generateMarkdownPolicy;
    // Simple fast html generator
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Privacy Policy - ${appName}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; }
    a { color: #4f46e5; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  ${raw
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n\n/gim, '<br><br>')}
</body>
</html>`;
  }, [generateMarkdownPolicy, appName]);

  // Copy helper
  const handleCopyText = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2500);
    } catch {
      // Fallback
    }
  };

  // Download HTML policy file
  const handleDownloadHtml = () => {
    const blob = new Blob([generateHtmlPolicy], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-policy-${appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
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
        <span className="text-amber-400 font-semibold">
          {lang === 'ar' ? 'مولّد سلامة البيانات Google Play والخصوصية' : 'Google Play Data Safety Form'}
        </span>
      </nav>

      {/* ─── Header ─── */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-400 mb-4 shadow-sm shadow-amber-500/10">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>
            {lang === 'ar'
              ? 'تجنب رفض التطبيق في Google Play Console · استبيان دقيق خطوة بخطوة'
              : 'Prevent Google Play Rejections · 100% Matching SDK Questionnaire'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Google Play Data Safety{' '}
          <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400 bg-clip-text text-transparent">
            {lang === 'ar' ? '& سياسة الخصوصية' : '& Privacy Generator'}
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {lang === 'ar'
            ? 'حل أزمة استبيان "سلامة البيانات" داخل Google Play Console! حدد حزم الـ SDKs المستخدمة في تطبيقك، وستقوم الأداة بمطابقتها وتوليد الإجابات الدقيقة خطوة بخطوة لما يجب اختياره حرفياً، مع توليد سياسة خصوصية مطابقة تماماً للمدخلات.'
            : 'Eliminate Google Play Data Safety rejection anxiety. Select your embedded SDKs to auto-generate exact question-by-question responses for Play Console and a perfectly matched Privacy Policy.'}
        </p>

        {/* Quick Presets */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-medium me-1">
            {lang === 'ar' ? 'قوالب سريعة بنقرة واحدة:' : 'Quick Profiles:'}
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset('admob-pwa')}
            className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-amber-500 hover:text-amber-400 text-slate-300 font-medium transition-all text-xs"
          >
            {lang === 'ar' ? 'تطبيق إعلانات AdMob + كراشليتكس' : 'AdMob PWA + Crashlytics'}
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('ecommerce')}
            className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-amber-500 hover:text-amber-400 text-slate-300 font-medium transition-all text-xs"
          >
            {lang === 'ar' ? 'تطبيق متجر وحسابات ودفع' : 'E-Commerce / Store App'}
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('zero-data')}
            className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-amber-500 hover:text-amber-400 text-slate-300 font-medium transition-all text-xs"
          >
            {lang === 'ar' ? 'تطبيق بدون جمع بيانات (أوفلاين)' : 'Offline / Zero Tracking'}
          </button>
        </div>
      </div>

      {/* ─── Main Two-Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── Left Column: App Info & SDK Selector (5 cols) ─── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: App Metadata */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-amber-400" />
              <span>{lang === 'ar' ? '1. بيانات التطبيق الأساسية' : '1. App Details'}</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {lang === 'ar' ? 'اسم التطبيق (App Name)' : 'App Name'}
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="My Store App"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {lang === 'ar' ? 'اسم المطور / الشركة' : 'Company / Developer'}
                </label>
                <input
                  type="text"
                  value={developerName}
                  onChange={(e) => setDeveloperName(e.target.value)}
                  placeholder="Acme Inc."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {lang === 'ar' ? 'بريد الخصوصية للتواصل' : 'Privacy Contact Email'}
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="privacy@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Account Creation Toggle (Google Play requirement) */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAccounts}
                  onChange={(e) => setHasAccounts(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    {lang === 'ar' ? 'يتيح التطبيق إنشاء حساب للمستخدم' : 'App allows users to create an account'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {lang === 'ar'
                      ? 'يشترط Google Play توفير رابط رسمي لحذف الحساب إذا كان التطبيق يدعم التسجيل.'
                      : 'Google Play strictly requires an account deletion URL if user accounts are supported.'}
                  </span>
                </div>
              </label>

              {hasAccounts && (
                <div className="pt-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {lang === 'ar' ? 'رابط طلب حذف الحساب (Account Deletion URL)' : 'Account Deletion URL'}
                  </label>
                  <input
                    type="url"
                    value={accountDeletionUrl}
                    onChange={(e) => setAccountDeletionUrl(e.target.value)}
                    placeholder="https://example.com/delete-account"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Interactive SDK Selector */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-400" />
                <span>{lang === 'ar' ? '2. حدد حزم الـ SDKs في تطبيقك' : '2. Select App SDKs & APIs'}</span>
              </h3>
              <span className="text-[10px] font-mono text-amber-400">
                {selectedSdks.length} {lang === 'ar' ? 'محدد' : 'selected'}
              </span>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
              {SUPPORTED_SDKS.map((sdk) => {
                const isSelected = selectedSdks.includes(sdk.id);
                const SdkIcon = sdk.icon;

                return (
                  <button
                    key={sdk.id}
                    type="button"
                    onClick={() => handleToggleSdk(sdk.id)}
                    className={`w-full p-3 rounded-xl border text-start transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className={`p-2 rounded-lg border shrink-0 ${sdk.iconBg}`}>
                      <SdkIcon className={`h-4 w-4 ${sdk.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{sdk.name}</span>
                        {isSelected ? (
                          <span className="text-amber-400 text-xs font-bold">✓</span>
                        ) : null}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">
                        {sdk.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Right Column: Generated Answers & Privacy Policy (7 cols) ─── */}
        <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-6">
          {/* Main Tabs Navigation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex items-center gap-1 shadow-md">
            <button
              type="button"
              onClick={() => setActiveTab('cheat-sheet')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                activeTab === 'cheat-sheet'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'إجابات Play Console خطوة بخطوة' : 'Play Console Answers'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('privacy-policy')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                activeTab === 'privacy-policy'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'سياسة الخصوصية المطابقة' : 'Generated Privacy Policy'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'فحص الرفض والأمان' : 'Compliance Audit'}
            </button>
          </div>

          {/* TAB 1: Google Play Console Step-by-Step Cheat Sheet */}
          {activeTab === 'cheat-sheet' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {lang === 'ar'
                      ? 'ما يجب اختياره حرفياً داخل Google Play Console'
                      : 'Exact Google Play Console Data Safety Answers'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Play Console &gt; App Content &gt; Data safety
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Ready to copy
                </span>
              </div>

              {/* Step 1: Data Collection & Security Overview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Step 1: Data collection and security
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        `Does your app collect or share data?: ${hasAnyData ? 'Yes' : 'No'}\nIs data encrypted in transit?: Yes\nDo you provide a way for users to request data deletion?: ${hasAccounts ? 'Yes' : 'No'}`,
                        'step1'
                      )
                    }
                    className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'step1' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSection === 'step1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-300">
                      Does your app collect or share any of the required user data types?
                    </span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                        hasAnyData ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {hasAnyData ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-300">
                      Is all of the user data collected by your app encrypted in transit?
                    </span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                      Yes
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-300">
                      Do you provide a way for users to request that their data be deleted?
                    </span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                      {hasAccounts ? 'Yes (via URL)' : 'Yes (via Email)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2: Data Types to check */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Step 2: Data types to check
                </h4>

                {!hasAnyData ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs">
                    ✓ You have selected no data-collecting SDKs. Check <strong>None</strong> on all categories.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {aggregatedData.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{item.type}</span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 border-t border-slate-800/60">
                          <div>
                            <span className="text-slate-500">Collected: </span>
                            <span className="font-semibold text-amber-300">Yes</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Shared with 3rd parties: </span>
                            <span className="font-semibold text-slate-200">
                              {item.shared ? 'Yes (Ad/Analytics SDKs)' : 'No'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Processed ephemerally: </span>
                            <span className="font-semibold text-slate-200">
                              {item.ephemeral ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Purposes: </span>
                            <span className="font-semibold text-slate-200">
                              {Array.from(item.purposes).join(', ')}
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 pt-0.5">
                          Sources: {item.sources.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Generated Privacy Policy */}
          {activeTab === 'privacy-policy' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex gap-2">
                  {[
                    { id: 'formatted' as const, label: 'Preview' },
                    { id: 'markdown' as const, label: 'Markdown (.md)' },
                    { id: 'html' as const, label: 'HTML (.html)' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setPolicyFormat(fmt.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        policyFormat === fmt.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        policyFormat === 'html' ? generateHtmlPolicy : generateMarkdownPolicy,
                        'policy'
                      )
                    }
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'policy' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-amber-400" />}
                    <span>{copiedSection === 'policy' ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadHtml}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Download .html</span>
                  </button>
                </div>
              </div>

              {/* View Output */}
              {policyFormat === 'formatted' && (
                <div className="max-h-[500px] overflow-y-auto p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-4 scrollbar-thin leading-relaxed">
                  <h2 className="text-base font-bold text-white">Privacy Policy for {appName}</h2>
                  <p className="text-slate-400 text-[11px]">
                    Last updated: {currentDate}
                  </p>
                  <p>
                    {developerName} operates the <strong>{appName}</strong> application. This policy
                    explains our data handling practices and your privacy rights.
                  </p>
                  <h3 className="text-sm font-bold text-amber-400">1. Information Collection and Use</h3>
                  {hasAnyData ? (
                    <ul className="list-disc list-inside space-y-1">
                      {aggregatedData.map((d, i) => (
                        <li key={i}>
                          <strong>{d.category} ({d.type})</strong>: Used for {Array.from(d.purposes).join(', ')}.
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No user data or device identifiers are collected or stored by this application.</p>
                  )}

                  <h3 className="text-sm font-bold text-amber-400">2. Third-Party Service Providers</h3>
                  {selectedSdks.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      {SUPPORTED_SDKS.filter((s) => selectedSdks.includes(s.id)).map((s) => (
                        <li key={s.id}>
                          <strong>{s.name}</strong> - {s.description}{' '}
                          <a href={s.privacyUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">
                            [Privacy Policy]
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No third-party SDKs are embedded in this application.</p>
                  )}

                  <h3 className="text-sm font-bold text-amber-400">3. Data Security</h3>
                  <p>All data is transmitted securely over encrypted SSL/TLS (HTTPS) protocols.</p>

                  <h3 className="text-sm font-bold text-amber-400">4. Contact</h3>
                  <p>Questions? Contact us at: <strong>{contactEmail}</strong> ({developerName})</p>
                </div>
              )}

              {policyFormat === 'markdown' && (
                <pre className="max-h-[500px] overflow-y-auto p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-amber-300/90 leading-relaxed scrollbar-thin">
                  <code>{generateMarkdownPolicy}</code>
                </pre>
              )}

              {policyFormat === 'html' && (
                <pre className="max-h-[500px] overflow-y-auto p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300/90 leading-relaxed scrollbar-thin">
                  <code>{generateHtmlPolicy}</code>
                </pre>
              )}
            </div>
          )}

          {/* TAB 3: Compliance & Rejection Audit */}
          {activeTab === 'audit' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
                Google Play Policy Rejection Prevention Audit
              </h3>

              <div className="space-y-3">
                {/* Check 1: AdMob Advertising ID */}
                <div className="p-3.5 rounded-xl border flex items-start gap-3 bg-slate-950 border-slate-800">
                  {selectedSdks.includes('admob') ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-white block">
                      Advertising ID (GAID) Declaration
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      {selectedSdks.includes('admob')
                        ? '✓ AdMob selected. The tool has declared "Device or other IDs" under Advertising. In Play Console App Content > Advertising ID, answer "Yes" to using advertising ID.'
                        : 'No AdMob SDK detected. No advertising ID declaration required.'}
                    </p>
                  </div>
                </div>

                {/* Check 2: Account Deletion */}
                <div className="p-3.5 rounded-xl border flex items-start gap-3 bg-slate-950 border-slate-800">
                  {hasAccounts ? (
                    accountDeletionUrl.startsWith('http') ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    )
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-white block">
                      Account Deletion Policy Compliance
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      {hasAccounts
                        ? 'Google Play requires developers with account creation to provide a publicly accessible web link where users can request account and data deletion.'
                        : '✓ App does not allow user account creation, exempt from mandatory account deletion web form.'}
                    </p>
                  </div>
                </div>

                {/* Check 3: Encryption in Transit */}
                <div className="p-3.5 rounded-xl border flex items-start gap-3 bg-slate-950 border-slate-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-white block">
                      Encryption in Transit (HTTPS)
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      ✓ All network requests in Appifya PWAs and modern SDKs are transmitted through encrypted HTTPS channels. Answer &quot;Yes&quot; in Play Console.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Informational FAQ Section ─── */}
      <section className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-10">
        <h2 className="text-xl sm:text-2xl font-black text-white mb-6 text-center">
          {lang === 'ar' ? 'الأسئلة الشائعة حول قسم سلامة البيانات' : 'Google Play Data Safety FAQ'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-start">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-amber-400">
              {lang === 'ar' ? 'لماذا ترفض جوجل التطبيقات بسبب سلامة البيانات؟' : 'Why does Google reject apps for Data Safety?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'تقوم جوجل بفحص كود الـ APK آلياً. إذا وجد الروبوت حزمة مثل AdMob أو Firebase تجمع معرّف الإعلانات (Advertising ID) بينما ذكرت في الاستبيان أنك لا تجمع أي بيانات، يُرفض التطبيق فوراً بسبب تضارب البيانات.'
                : 'Google scans APK/AAB binaries automatically. If an SDK transmits advertising identifiers while your questionnaire states "No data collected", your app is flagged for policy violation.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-amber-400">
              {lang === 'ar' ? 'أين أضع سياسة الخصوصية المولدة؟' : 'Where should I host the privacy policy?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'قم بتحميل ملف HTML أو نسخ النص وضعه في صفحة على موقعك (مثلاً https://yourdomain.com/privacy) ثم ضع هذا الرابط في خانة سياسة الخصوصية في Google Play Console.'
                : 'Download the generated HTML file and host it at a public HTTPS URL (e.g. https://yourdomain.com/privacy), then paste that URL into Google Play Console > App Content > Privacy Policy.'}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <div className="mt-16 rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 via-zinc-900/50 to-zinc-950/90 p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            {lang === 'ar' ? 'جاهز لتحويل موقعك لتطبيق متوافق مع المتاجر؟' : 'Ready to turn your site into a store-compliant app?'}
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6 leading-relaxed">
            {lang === 'ar'
              ? 'مع Appifya، تحصل على تطبيق PWA و APK متوافق 100% مع شروط وسياسات Google Play ومتجر التطبيقات مع دعم إعلانات AdMob.'
              : 'Appifya handles manifest files, assetlinks verification, and app store compliance so you can publish with confidence.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-xl shadow-amber-500/25 transition-all"
          >
            <span>{lang === 'ar' ? 'ابدأ بناء تطبيقك مجاناً' : 'Start building for free'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
