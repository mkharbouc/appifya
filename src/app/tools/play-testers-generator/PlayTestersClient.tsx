'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Mail,
  Share2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Smartphone,
  ChevronDown,
  Info,
  Calendar,
} from 'lucide-react';

interface DiagnosticItem {
  id: string;
  question: { ar: string; en: string; fr: string };
  hint: { ar: string; en: string; fr: string };
  fixTitle: { ar: string; en: string; fr: string };
  fixDescription: { ar: string; en: string; fr: string };
}

const DIAGNOSTIC_QUESTIONS: DiagnosticItem[] = [
  {
    id: 'track_status',
    question: {
      ar: '1. هل حالة إصدار الاختبار المغلق (Closed Testing Track) أصبحت "Available" وليست "In review"؟',
      en: '1. Is your Closed Testing release status "Available" and not "In review"?',
      fr: '1. Le statut de votre version de test fermé est-il "Disponible" et non "En cours d\'examen" ?',
    },
    hint: {
      ar: 'تحقق من صفحة Releases overview في كونسول جوجل. التحديث الأول يستغرق عادة 2-5 أيام للمراجعة.',
      en: 'Check Releases overview in Play Console. First releases usually take 2-5 days for Google review.',
      fr: 'Vérifiez la vue d\'ensemble des versions dans la Play Console. Le premier examen prend 2 à 5 jours.',
    },
    fixTitle: {
      ar: 'الإصدار لم يُعتمد بعد من جوجل',
      en: 'Release Not Yet Approved by Google',
      fr: 'Version pas encore approuvée par Google',
    },
    fixDescription: {
      ar: 'حتى لو كان المسار Closed Testing، فإن جوجل تراجع الـ APK/AAB الأولية قبل إتاحتها للمختبرين. انتظر حتى تتغير الحالة في الكونسول إلى "Available".',
      en: 'Google manually reviews even closed testing tracks. Wait until the status changes from "In review" to "Available" before testers can access it.',
      fr: 'Google examine même les versions de test fermé. Attendez que le statut passe à "Disponible" dans la console.',
    },
  },
  {
    id: 'group_added',
    question: {
      ar: '2. هل قمت بإضافة مجموعة Google Group أو قائمة الإيميلات داخل تبويب "Testers"؟',
      en: '2. Have you added the Google Group or email list inside the "Testers" tab?',
      fr: '2. Avez-vous ajouté le groupe Google ou la liste d\'e-mails dans l\'onglet "Testeurs" ?',
    },
    hint: {
      ar: 'في Google Play Console > Closed testing > Manage track > Testers، تأكد من تحديد القائمة وحفظ التغييرات.',
      en: 'In Play Console > Closed testing > Manage track > Testers, ensure the list is checked and saved.',
      fr: 'Dans Play Console > Test fermé > Gérer le canal > Testeurs, cochez la liste et enregistrez.',
    },
    fixTitle: {
      ar: 'قائمة المختبرين غير مضافة أو غير محفوظة',
      en: 'Tester List Not Linked or Saved',
      fr: 'Liste de testeurs non liée ou non enregistrée',
    },
    fixDescription: {
      ar: 'يجب اختيار قائمة المختبرين ثم الضغط على "Save changes" في أسفل الصفحة. إذا أضفت Google Group تأكد من أن بريدك الشخصي منضم للمجموعة للتجربة.',
      en: 'Select the email list or Google Group, then click "Save changes" at the bottom of the page.',
      fr: 'Sélectionnez la liste ou le groupe Google, puis cliquez sur "Enregistrer les modifications" en bas de page.',
    },
  },
  {
    id: 'group_public_join',
    question: {
      ar: '3. هل صلاحيات Google Group تسمح بالانضمام للجميع (Anyone can join) دون موافقة يدوية؟',
      en: '3. Are Google Group permissions set so that anyone on the web can join directly?',
      fr: '3. Les permissions du groupe Google permettent-elles à quiconque de rejoindre sans validation ?',
    },
    hint: {
      ar: 'من إعدادات Google Groups > Permissions > Who can join the group > Anyone on the web can join.',
      en: 'In Google Groups settings > Group settings > Who can join the group > Anyone on the web can join.',
      fr: 'Dans Google Groups > Paramètres du groupe > Qui peut rejoindre le groupe > N\'importe qui sur le Web.',
    },
    fixTitle: {
      ar: 'المجموعة مغلقة ولا تسمح بانضمام المختبرين',
      en: 'Google Group Access Restricted',
      fr: 'Accès au groupe Google restreint',
    },
    fixDescription: {
      ar: 'إذا لم يستطع المختبر الانضمام لمجموعة Google، لن يتعرف عليه متجر Play كمختبر مصرح له وستظهر رسالة "App not available". اضبط المجموعة لتسمح بالانضمام التلقائي.',
      en: 'If testers cannot join your Google Group, Play Store will not recognize them as authorized testers. Set "Who can join" to "Anyone on the web".',
      fr: 'Si les testeurs ne peuvent pas rejoindre le groupe Google, le Play Store affichera "Application non disponible".',
    },
  },
  {
    id: 'opt_in_accepted',
    question: {
      ar: '4. هل قام المختبر بفتح رابط الويب (Web Opt-in) والضغط على "Become a Tester" بنفس إيميل متجر Play؟',
      en: '4. Did the tester open the Web Opt-in link and click "Become a tester" with their Play Store account?',
      fr: '4. Le testeur a-t-il ouvert le lien Web et cliqué sur "Devenir testeur" avec le bon compte Play Store ?',
    },
    hint: {
      ar: 'يجب على كل مختبر قبول الدعوة أولاً، والتأكد من تطابق الحساب المسجل في المتصفح مع حساب متجر Google Play في هاتفه.',
      en: 'Testers must accept the opt-in page first, and their browser account must match the Play Store account on their phone.',
      fr: 'Le testeur doit accepter sur le Web avec le même compte Google que celui configuré sur son téléphone Android.',
    },
    fixTitle: {
      ar: 'عدم تفعيل رابط الـ Opt-in أو اختلاف حساب Google',
      en: 'Opt-in Not Accepted or Account Mismatch',
      fr: 'Opt-in non accepté ou compte différent',
    },
    fixDescription: {
      ar: 'إرسال رابط التنزيل المباشر وحده يفشل دائماً! الخطوة الإلزامية هي فتح رابط: play.google.com/apps/testing/[package] والضغط على الزر الأزرق "Become a Tester" أولاً.',
      en: 'Sending only the direct download link always fails! Testers must visit play.google.com/apps/testing/[package] and click "Become a tester" first.',
      fr: 'Envoyer uniquement le lien de téléchargement direct échoue toujours ! Les testeurs doivent d\'abord cliquer sur "Devenir testeur".',
    },
  },
  {
    id: 'countries_targeted',
    question: {
      ar: '5. هل دولة المختبر محددة ضمن قائمة الدول المتاحة (Countries / Regions) في مسار الاختبار؟',
      en: '5. Is the tester\'s country included in the target Countries / Regions of the track?',
      fr: '5. Le pays du testeur est-il inclus dans la liste des pays/régions ciblés ?',
    },
    hint: {
      ar: 'في Closed testing > Countries / Regions، تأكد من إضافة دول المختبرين أو تحديد جميع الدول (All countries).',
      en: 'In Closed testing > Countries / regions, verify the tester country is selected, or add all countries.',
      fr: 'Dans Test fermé > Pays/régions, vérifiez que le pays du testeur est sélectionné ou cochez tous les pays.',
    },
    fixTitle: {
      ar: 'التطبيق غير متاح في دولة المختبر الجغرافية',
      en: 'App Not Available in Tester Region',
      fr: 'Application indisponible dans la région du testeur',
    },
    fixDescription: {
      ar: 'إذا كان المختبر في مصر أو فرنسا أو الولايات المتحدة ومسار الاختبار محدد لدول معينة فقط، فستظهر رسالة الخطأ فوراً. اضغط على "Add countries" وحدد جميع الدول للتجربة العالمية.',
      en: 'If your closed track only targets specific countries, testers in other regions will see "App not available". Select all countries to avoid regional blocks.',
      fr: 'Si votre test ne cible que certains pays, les testeurs d\'autres régions verront une erreur. Ajoutez tous les pays.',
    },
  },
];

export default function PlayTestersClient() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  const [packageName, setPackageName] = useState('com.appifya.store');
  const [appName, setAppName] = useState('My Awesome App');
  const [googleGroupUrl, setGoogleGroupUrl] = useState('https://groups.google.com/g/my-app-testers');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Diagnostic states: null = unselected, true = yes, false = no
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, boolean | null>>({
    track_status: null,
    group_added: null,
    group_public_join: null,
    opt_in_accepted: null,
    countries_targeted: null,
  });

  // 14-Day Tracker State
  const [trackingStart, setTrackingStart] = useState('');
  const [activeTestersCount, setActiveTestersCount] = useState<number>(20);

  const cleanPackage = packageName.trim().replace(/^https?:\/\/play\.google\.com\/.*id=/i, '');
  const isValidPackage = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(cleanPackage);

  const webOptInUrl = `https://play.google.com/apps/testing/${cleanPackage}`;
  const playStoreDirectUrl = `https://play.google.com/store/apps/details?id=${cleanPackage}`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDiagnosticAnswer = (id: string, answer: boolean) => {
    setDiagnosticAnswers((prev) => ({ ...prev, [id]: answer }));
  };

  const resetDiagnostic = () => {
    setDiagnosticAnswers({
      track_status: null,
      group_added: null,
      group_public_join: null,
      opt_in_accepted: null,
      countries_targeted: null,
    });
  };

  const detectedIssues = DIAGNOSTIC_QUESTIONS.filter(
    (q) => diagnosticAnswers[q.id] === false
  );

  const isAllAnswered = Object.values(diagnosticAnswers).every((v) => v !== null);
  const isAllPass = isAllAnswered && detectedIssues.length === 0;

  // Calculation for 14-day duration
  const getDaysElapsed = () => {
    if (!trackingStart) return 0;
    const start = new Date(trackingStart).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(14, diff));
  };
  const daysElapsed = getDaysElapsed();
  const daysRemaining = Math.max(0, 14 - daysElapsed);
  const progressPercent = Math.min(100, Math.round((daysElapsed / 14) * 100));

  // Invitation Templates
  const templateWhatsApp = lang === 'ar'
    ? `مرحباً! 👋 أحتاج مساعدتك في اختبار تطبيقي "${appName}" على Google Play لمدة 14 يوماً لتلبية شروط المتجر.

الخطوات البسيطة (دقيقة واحدة):
1️⃣ انضم للمجموعة أولاً:
${googleGroupUrl || '[رابط مجموعة Google Group]'}

2️⃣ افتح رابط القبول واضغط "Become a Tester":
${webOptInUrl}

3️⃣ حمّل التطبيق من متجر Play:
${playStoreDirectUrl}

يرجى إبقاء التطبيق مثبتاً على هاتفك لمدة 14 يوماً. شكراً جزيلاً لدعمك! 🙏✨`
    : `Hi! 👋 I need your quick help testing my Android app "${appName}" on Google Play to satisfy the 14-day 20 testers requirement.

3 Simple Steps (Takes 1 min):
1️⃣ Join the Testers Group first:
${googleGroupUrl || '[Your Google Group URL]'}

2️⃣ Accept Testing (Click "Become a tester"):
${webOptInUrl}

3️⃣ Download from Google Play Store:
${playStoreDirectUrl}

Please keep the app installed for 14 days. Thank you so much for your support! 🙏✨`;

  const templateEmail = lang === 'ar'
    ? `الموضوع: دعوة خاصة لاختبار تطبيق ${appName} على متجر Google Play

مرحباً،

أدعوك لتكون ضمن فريق المختبرين المعتمدين لتطبيقنا الجديد "${appName}" على Google Play.

للبدء وضمان صلاحية حسابك، يرجى اتباع الترتيب التالي:
1. انضم إلى مجموعة المختبرين: ${googleGroupUrl || '[رابط المجموعة]'}
2. افتح رابط قبول الاختبار (Web Opt-In): ${webOptInUrl} واضغط على "Become a Tester".
3. قم بتنزيل التطبيق وتجربته عبر Google Play: ${playStoreDirectUrl}

ملاحظة هامة: يجب أن يكون حساب Google المسجل في المتصفح هو نفس الحساب المستخدم في متجر Play على هاتفك لتفادي خطأ "App not available".

شكراً جزيلاً لتعاونك ووقتك!`
    : `Subject: Invitation to test ${appName} on Google Play

Hello,

You are invited to join the closed testing program for our new Android app "${appName}".

Please follow these 3 steps in order:
1. Join our Google Testing Group: ${googleGroupUrl || '[Google Group URL]'}
2. Accept the web opt-in invite: ${webOptInUrl} and click "Become a tester".
3. Download the app directly from Google Play: ${playStoreDirectUrl}

Important note: Make sure the Google account signed into your web browser matches the Play Store account on your Android phone to avoid the "App not available" error.

Thank you for your valuable support!`;

  return (
    <main className="site-main flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-16" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* ── Header ── */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3.5 py-1.5 text-xs font-bold text-violet-300 mb-4 shadow-inner">
          <Users className="h-3.5 w-3.5 text-violet-400" />
          <span>{lang === 'ar' ? 'شرط الـ 20 مختبراً الإلزامي لـ Google Play' : 'Google Play 20 Closed Testers Requirement'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Google Play 20 Testers{' '}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Link Generator & Inspector
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {lang === 'ar'
            ? 'توليد الروابط الرسمية الصالحة لاختبار Google Play، إنشاء رسائل دعوة احترافية، وتشخيص وحل مشكلة "App not available" الشهيرة خطوة بخطوة.'
            : 'Generate valid closed testing opt-in URLs, create formatted tester invite templates, and instantly diagnose the "App not available" error.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── Left Column: Generator & Templates (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Card 1: App & Package Input */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
              <div className="h-10 w-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {lang === 'ar' ? '1. بيانات التطبيق والمسار' : '1. App & Package Configuration'}
                </h2>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'أدخل Package Name واسم التطبيق لتوليد الروابط الرسمية' : 'Enter package name to generate valid Google Play URLs'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                  Package Name (Application ID) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="com.company.appname"
                    className={`w-full rounded-xl bg-slate-950 border px-4 py-3 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-2 ${
                      isValidPackage
                        ? 'border-slate-800 focus:border-violet-500 focus:ring-violet-500/20'
                        : 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20'
                    }`}
                    dir="ltr"
                  />
                  {isValidPackage ? (
                    <span className="absolute end-3 top-3.5 text-emerald-400 text-xs flex items-center gap-1 font-sans">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'صحيح' : 'Valid'}</span>
                    </span>
                  ) : (
                    <span className="absolute end-3 top-3.5 text-rose-400 text-xs flex items-center gap-1 font-sans">
                      <AlertCircle className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'صيغة غير صالحة' : 'Invalid syntax'}</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {lang === 'ar'
                    ? 'مثال: com.mystore.app (تجدها في ملف build.gradle أو صفحة App Details في الكونسول)'
                    : 'Example: com.mystore.app (Found in build.gradle or Play Console App Details)'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                    {lang === 'ar' ? 'اسم التطبيق (App Name)' : 'App Name'}
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="My Store Mobile"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                    Google Group URL ({lang === 'ar' ? 'اختياري' : 'Optional'})
                  </label>
                  <input
                    type="url"
                    value={googleGroupUrl}
                    onChange={(e) => setGoogleGroupUrl(e.target.value)}
                    placeholder="https://groups.google.com/g/..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-violet-500"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Generated Official Links */}
            <div className="pt-4 space-y-3.5 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>{lang === 'ar' ? 'الروابط الرسمية الصالحة لاختبار Google Play' : 'Official Google Play Testing URLs'}</span>
              </h3>

              {/* Link 1: Web Opt-In */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-violet-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-violet-300 flex items-center gap-1.5">
                    <span>{lang === 'ar' ? '1. رابط قبول الاختبار عبر الويب (Web Opt-In)' : '1. Web Opt-In URL (Required First)'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-violet-500/20 text-violet-300 font-bold uppercase">Must Click First</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webOptInUrl, 'webOptIn')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedKey === 'webOptIn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'webOptIn' ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 font-mono text-xs text-slate-200 break-all select-all flex items-center justify-between gap-2" dir="ltr">
                  <span>{webOptInUrl}</span>
                  <a
                    href={webOptInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-violet-400 shrink-0"
                    title="Open URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? '💡 هذا هو الرابط الذي يجب أن يفتحه المختبر أولاً ليضغط على زر "Become a Tester". بدونه لن يستطيع تنزيل التطبيق.'
                    : '💡 Testers must open this link first to click "Become a tester". Direct download links will fail without this step.'}
                </p>
              </div>

              {/* Link 2: Play Store Direct */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">
                    {lang === 'ar' ? '2. رابط التنزيل المباشر من تطبيق Google Play' : '2. Direct Play Store App Download URL'}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(playStoreDirectUrl, 'playDirect')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedKey === 'playDirect' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'playDirect' ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 font-mono text-xs text-slate-200 break-all select-all flex items-center justify-between gap-2" dir="ltr">
                  <span>{playStoreDirectUrl}</span>
                  <a
                    href={playStoreDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-violet-400 shrink-0"
                    title="Open URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500">
                  {lang === 'ar'
                    ? 'يفتح تطبيق Google Play على هاتف أندرويد لتثبيت التطبيق بعد إتمام الخطوة الأولى بنجاح.'
                    : 'Opens Google Play app on Android to install after opt-in is completed.'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Ready-to-Send Invitation Templates */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {lang === 'ar' ? '2. نماذج دعوة المختبرين المنسقة' : '2. Ready-to-Send Tester Invitations'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {lang === 'ar' ? 'انسخ رسالة منسقة خطوة بخطوة بالروابط الصحيحة لتفادي أخطاء المختبرين' : 'Clear step-by-step instructions preventing user confusion'}
                  </p>
                </div>
              </div>
            </div>

            {/* Template Tabs: WhatsApp vs Email */}
            <div className="space-y-4">
              {/* WhatsApp Template */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'رسالة واتساب / تلغرام (WhatsApp & Telegram)' : 'WhatsApp & Messaging Apps'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(templateWhatsApp, 'waTemplate')}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    {copiedKey === 'waTemplate' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'waTemplate' ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ الرسالة' : 'Copy Message')}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900/90 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed border border-slate-800/80">
                  {templateWhatsApp}
                </pre>
              </div>

              {/* Email Template */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'رسالة بريد إلكتروني رسمية (Official Email Template)' : 'Official Email Template'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(templateEmail, 'mailTemplate')}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-all cursor-pointer"
                  >
                    {copiedKey === 'mailTemplate' ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'mailTemplate' ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ الإيميل' : 'Copy Email')}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900/90 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed border border-slate-800/80">
                  {templateEmail}
                </pre>
              </div>
            </div>
          </div>

          {/* Card 3: 14-Day Countdown Tracker */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {lang === 'ar' ? '3. عداد الـ 14 يوماً التفاعلي (14-Day Tracker)' : '3. 14-Day Progress Tracker'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {lang === 'ar' ? 'تتبع المدة الإلزامية حتى فتح زر النشر للإنتاج (Production)' : 'Track continuous testing duration before Production release'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                  {lang === 'ar' ? 'تاريخ انضمام المختبر رقم 20' : 'Start Date (When 20th Tester Joined)'}
                </label>
                <input
                  type="date"
                  value={trackingStart}
                  onChange={(e) => setTrackingStart(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                  {lang === 'ar' ? 'عدد المختبرين النشطين حالياً' : 'Active Testers Count'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={activeTestersCount}
                  onChange={(e) => setActiveTestersCount(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Progress Bar & Status */}
            {trackingStart ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">
                    {daysElapsed} / 14 {lang === 'ar' ? 'يوماً مضت' : 'days completed'}
                  </span>
                  <span className={daysRemaining === 0 ? 'text-emerald-400' : 'text-cyan-400'}>
                    {daysRemaining === 0
                      ? (lang === 'ar' ? '🎉 اكتملت المدة! يمكنك طلب النشر للإنتاج الآن' : '🎉 Complete! You can apply for Production')
                      : (lang === 'ar' ? `متبقي ${daysRemaining} يوماً` : `${daysRemaining} days remaining`)}
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{lang === 'ar' ? 'الحد الأدنى: 20 مختبراً نشطاً يومياً' : 'Requirement: 20 active testers daily'}</span>
                  <span className={activeTestersCount >= 20 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                    {activeTestersCount >= 20 ? '✅ متوافق مع الشرط' : '⚠️ أقل من 20 مختبراً'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                {lang === 'ar' ? 'اختر تاريخ بدء الاختبار لمشاهدة العداد وحساب النسبة المتبقية' : 'Pick a start date to calculate the 14-day timeline'}
              </div>
            )}
          </div>

        </div>

        {/* ── Right Column: Diagnostic Checklist for "App Not Available" (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-rose-500/25 bg-gradient-to-b from-rose-950/20 via-slate-900/80 to-slate-950 p-6 sm:p-7 backdrop-blur-md shadow-2xl space-y-6 sticky top-24">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {lang === 'ar' ? 'تشخيص خطأ App Not Available' : '"App Not Available" Inspector'}
                  </h2>
                  <p className="text-xs text-rose-300/80">
                    {lang === 'ar' ? 'استبيان ذكي يحدد سبب حجب التطبيق عن المختبرين' : 'Pinpoint the exact reason testers cannot access your app'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetDiagnostic}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title={lang === 'ar' ? 'إعادة ضبط الاستبيان' : 'Reset checklist'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Diagnostic Questionnaire */}
            <div className="space-y-4">
              {DIAGNOSTIC_QUESTIONS.map((q) => {
                const currentAnswer = diagnosticAnswers[q.id];
                return (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                    <p className="text-xs font-semibold text-slate-200 leading-snug">
                      {q.question[lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en']}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {q.hint[lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en']}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDiagnosticAnswer(q.id, true)}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          currentAnswer === true
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'نعم (Yes)' : 'Yes'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDiagnosticAnswer(q.id, false)}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          currentAnswer === false
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'لا (No)' : 'No'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Diagnostic Results Summary */}
            {detectedIssues.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    {lang === 'ar'
                      ? `تم اكتشاف ${detectedIssues.length} مشكلة تمنع المختبرين من الوصول!`
                      : `Found ${detectedIssues.length} root cause(s) blocking your testers!`}
                  </span>
                </div>
                <div className="space-y-3">
                  {detectedIssues.map((issue) => (
                    <div key={issue.id} className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/20 space-y-1">
                      <h4 className="text-xs font-bold text-white">
                        🚨 {issue.fixTitle[lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en']}
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {issue.fixDescription[lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en']}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isAllPass && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">
                  {lang === 'ar' ? 'جميع إعدادات المسار سليمة 100%!' : 'All Settings Look 100% Compliant!'}
                </h4>
                <p className="text-xs text-slate-300">
                  {lang === 'ar'
                    ? 'إذا استمر الخطأ لدى شخص معين، اطلب منه مسح ذاكرة التخزين المؤقت لتطبيق Google Play وتسجيل الدخول بنفس الإيميل المسجل في المجموعة.'
                    : 'If an individual tester still sees the error, ask them to clear the Google Play app cache and re-sign in.'}
                </p>
              </div>
            )}

            {/* Google Policy Reminder Card */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Info className="w-4 h-4 text-violet-400" />
                <span>{lang === 'ar' ? 'قواعد جوجل لاختبار الـ 14 يوماً:' : 'Google Play 14-Day Rules:'}</span>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                <li>{lang === 'ar' ? '20 مختبراً على الأقل مثبتين للتطبيق طوال الـ 14 يوماً.' : 'At least 20 testers opted-in for 14 continuous days.'}</li>
                <li>{lang === 'ar' ? 'تفاعل المختبرين وفتح التطبيق يساعد في قبول المراجعة.' : 'Testers actually opening the app improves review approval.'}</li>
                <li>{lang === 'ar' ? 'لا تقم بتعديل المسار أو حذفه أثناء سريان العداد.' : 'Do not pause or delete the closed track during the test.'}</li>
              </ul>
            </div>

          </div>
        </div>

      </div>

      {/* ── Bottom Banner: Convert PWA to APK ── */}
      <div className="mt-16 rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-slate-900/60 to-indigo-950/40 p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Appifya Android & PWA Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {lang === 'ar'
              ? 'هل تحتاج إلى بناء حزمة AAB أو APK جديدة لاختبارك؟'
              : 'Need to build a fresh AAB or APK package for your test?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'ar'
              ? 'حوّل أي موقع أو متجر إلى تطبيق أندرويد موقع رقمياً وجاهز لرفعه على مسارات Google Play Console في دقيقتين.'
              : 'Convert any website or eCommerce store into a release-ready, signed AAB/APK bundle in minutes.'}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-violet-600/25 transition-all"
            >
              <span>{lang === 'ar' ? 'بناء تطبيق أندرويد الآن' : 'Build Android App Now'}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>

    </main>
  );
}
