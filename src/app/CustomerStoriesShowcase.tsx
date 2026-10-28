'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useLanguage } from './lib/i18n';

export interface Story {
  id: string;
  brand: string;
  brandLogoText: string;
  category: { ar: string; en: string; fr: string };
  metric: { ar: string; en: string; fr: string };
  summary: { ar: string; en: string; fr: string };
  quote: { ar: string; en: string; fr: string };
  author: {
    name: { ar: string; en: string; fr: string };
    role: { ar: string; en: string; fr: string };
    avatar: string;
  };
  image: string;
  stats: {
    label: { ar: string; en: string; fr: string };
    value: string;
  }[];
  highlights: { ar: string; en: string; fr: string }[];
}

const STORIES: Story[] = [
  {
    id: 'nabtah',
    brand: 'Nabtah Store',
    brandLogoText: 'nabtah.',
    category: {
      ar: 'تجارة إلكترونية وتجزئة',
      en: 'E-Commerce & Retail',
      fr: 'E-Commerce & Retail',
    },
    metric: {
      ar: '+500,000 مستخدم نشط شهرياً',
      en: '500,000+ monthly active users',
      fr: '+500 000 utilisateurs actifs par mois',
    },
    summary: {
      ar: 'تعتمد منصة "نبتة" للتجارة الإلكترونية على تقنيات Appifya لتقديم تجربة تسوق فائقة السرعة على هواتف iOS وAndroid لأكثر من نصف مليون متسوق - مع نمو متواصل وتكرار شراء غير مسبوق.',
      en: 'Nabtah Store trusts Appifya to deliver a lightning-fast mobile shopping experience on iOS and Android for over half a million shoppers — with continuous month-over-month growth.',
      fr: 'Nabtah Store fait confiance à Appifya pour offrir une expérience d’achat mobile ultra-rapide sur iOS et Android à plus d’un demi-million de clients.',
    },
    quote: {
      ar: 'تفوقت Appifya بسهولة الإعداد، وتوفير التكاليف، وإشعارات الدفع الفورية المجانية، مما جعلها الخيار الأذكى والأسرع لتحويل متجرنا لتطبيق جوال متكامل كسب ثقة عملائنا.',
      en: 'Appifya stands out for its ease of setup, cost-effectiveness, and instant free push notifications, making it the most practical choice for our mobile app growth.',
      fr: 'Appifya se distingue par sa simplicité de configuration, sa rentabilité et ses notifications push gratuites, devenant le choix évident pour notre croissance mobile.',
    },
    author: {
      name: {
        ar: 'عمر السعيد',
        en: 'Omar Al-Saeed',
        fr: 'Omar Al-Saeed',
      },
      role: {
        ar: 'نائب الرئيس للتكنولوجيا - نبتة ستور',
        en: 'VP of Technology, Nabtah Store',
        fr: 'Vice-président Technologie, Nabtah Store',
      },
      avatar: '/stories/avatar-1.jpg',
    },
    image: '/stories/story-retail.jpg',
    stats: [
      { label: { ar: 'معدل الشراء المتكرر', en: 'Repeat purchase rate', fr: 'Taux de réachat' }, value: '+45%' },
      { label: { ar: 'سرعة التحميل', en: 'Average load time', fr: 'Temps de chargement' }, value: '0.8s' },
      { label: { ar: 'تفاعل إشعارات العروض', en: 'Push open rate', fr: 'Taux d’ouverture push' }, value: '38%' },
    ],
    highlights: [
      { ar: 'تحويل المتجر الإلكتروني إلى تطبيق قابل للتثبيت بضغطة واحدة دون الحاجة لمتاجر التطبيقات', en: '1-click installable PWA without requiring app store downloads', fr: 'PWA installable en 1 clic sans passer par les stores' },
      { ar: 'إرسال إشعارات فورية بالعروض والخصومات مباشرة إلى شاشات قفل هواتف الزبائن', en: 'Instant push alerts for new discounts straight to customer lockscreens', fr: 'Alertes push instantanées pour les promotions sur l’écran de verrouillage' },
      { ar: 'تصفح سريع مع حفظ تلقائي للمنتجات وسلة المشتريات حتى عند ضعف الشبكة', en: 'Offline-ready shopping cart and product browsing during spotty connectivity', fr: 'Panier et catalogue accessibles même avec une faible connexion' },
    ],
  },
  {
    id: 'dar-estate',
    brand: 'Dar Estate',
    brandLogoText: 'Dar Estate',
    category: {
      ar: 'عقارات واستثمار',
      en: 'Real Estate & Properties',
      fr: 'Immobilier & Investissement',
    },
    metric: {
      ar: '1 مليون+ عملية تصفح عقار',
      en: '1 million+ property views',
      fr: '+1 million de visites immobilières',
    },
    summary: {
      ar: 'تقدم دار إستيت تجربة استعراض خرائط وجولات عقارية ثلاثية الأبعاد فورية بدون أي تأخير، مما منح آلاف الباحثين عن منازل وصولاً سهلاً للعقارات على الهواتف الذكية.',
      en: 'Dar Estate relies on Appifya to power responsive 3D property tours, map searches, and instant booking with reliable performance for buyers nationwide.',
      fr: 'Dar Estate s’appuie sur Appifya pour offrir des visites 3D immersives et des recherches cartographiques rapides aux acheteurs sur mobile.',
    },
    quote: {
      ar: 'بدلاً من إنفاق 6 أشهر في تطوير تطبيق منفصل وتكاليف باهظة، حوّلنا موقعنا في ساعات إلى تطبيق سريع حصل على إشادة مستثمرينا ووكلائنا الميدانيين.',
      en: 'Instead of spending months developing separate native codebases, we launched an ultra-fast app in hours that our field agents and investors truly love.',
      fr: 'Au lieu de passer des mois à développer des applications natives séparées, nous avons lancé en quelques heures une application ultra-rapide adorée par nos agents.',
    },
    author: {
      name: {
        ar: 'م. زياد القحطاني',
        en: 'Eng. Ziad Al-Qahtani',
        fr: 'Ing. Ziad Al-Qahtani',
      },
      role: {
        ar: 'الرئيس التقني التنفيذي - دار إستيت',
        en: 'Chief Technology Officer, Dar Estate',
        fr: 'Directeur Technique, Dar Estate',
      },
      avatar: '/stories/avatar-2.jpg',
    },
    image: '/stories/story-corporate.jpg',
    stats: [
      { label: { ar: 'زيادة وقت الجلسة', en: 'Session duration', fr: 'Durée de session' }, value: '3.4x' },
      { label: { ar: 'طلبات المعاينة المباشرة', en: 'In-app inquiries', fr: 'Demandes de visite' }, value: '+62%' },
      { label: { ar: 'توفير تكلفة التطوير', en: 'Development savings', fr: 'Économie de dév.' }, value: '80%' },
    ],
    highlights: [
      { ar: 'تصفح الخرائط التفاعلية والجولات الافتراضية بسلاسة 60 إطاراً في الثانية', en: 'Fluid 60fps 3D virtual tours and property map search', fr: 'Visites 3D et navigation cartographique fluide à 60 fps' },
      { ar: 'تنبيه فوري عند توفر عقارات جديدة تطابق معايير وتفضيلات البحث المحفوظة', en: 'Automated push notifications when matching properties are listed', fr: 'Notifications automatiques lors de la publication de biens correspondants' },
      { ar: 'واجهة خاصة بالوسطاء تعمل في الميدان حتى دون اتصال بالإنترنت', en: 'Offline-ready portal for field agents during site visits', fr: 'Portail hors ligne pour les agents lors des visites sur site' },
    ],
  },
  {
    id: 'roast-brew',
    brand: 'Roast & Brew',
    brandLogoText: 'Roast & Brew',
    category: {
      ar: 'مقاهي ومطاعم',
      en: 'Specialty Coffee & Dining',
      fr: 'Cafés & Restauration',
    },
    metric: {
      ar: '+85,000 طلب شهري مباشر',
      en: '85,000+ direct orders / month',
      fr: '+85 000 commandes directes / mois',
    },
    summary: {
      ar: 'تجاوزت سلسلة مقاهي "روست آند برو" عمولات منصات التوصيل المرتفعة عبر إطلاق تطبيق طلبات واستلام شخصي خاص بفروعها خلال يوم واحد، مما ضاعف ولاء روادها.',
      en: 'Roast & Brew bypassed high delivery aggregator fees by converting their web menu into an in-house pickup and loyalty app across all coffeehouse locations.',
      fr: 'Roast & Brew a éliminé les commissions élevées des plateformes de livraison en lançant sa propre application de commande et fidélité en un jour.',
    },
    quote: {
      ar: 'إشعارات العروض الصباحية وتجربة الدفع وإعادة الطلب بلمسة واحدة ضاعفت معدل عودة الزبائن بنسبة 60% بدون أي وسيط يقتطع من أرباحنا.',
      en: 'Daily morning specials via push notifications and 1-tap reordering doubled customer return visits without any third party cutting into our margins.',
      fr: 'Les notifications du matin et la commande en 1 clic ont doublé les visites récurrentes sans intermédiaire prélevant nos marges.',
    },
    author: {
      name: {
        ar: 'سلمى الرميحي',
        en: 'Salma Al-Romaihi',
        fr: 'Salma Al-Romaihi',
      },
      role: {
        ar: 'مديرة العمليات وتجربة العملاء',
        en: 'Director of Operations & CX',
        fr: 'Directrice des Opérations & Expérience Client',
      },
      avatar: '/stories/avatar-3.jpg',
    },
    image: '/stories/story-cafe.jpg',
    stats: [
      { label: { ar: 'زيادة الطلبات المباشرة', en: 'Direct order growth', fr: 'Croissance commandes directes' }, value: '+118%' },
      { label: { ar: 'توفير عمولات المنصات', en: 'Commission saved', fr: 'Commissions économisées' }, value: '25%' },
      { label: { ar: 'سرعة إتمام الطلب', en: 'Reorder speed', fr: 'Vitesse de commande' }, value: '15s' },
    ],
    highlights: [
      { ar: 'حفظ المشروب المفضل وطلب الاستلام السريع بنقرة واحدة من شاشة الهاتف الرئيسية', en: 'One-tap favorite drink reorder directly from phone home screen icon', fr: 'Recommande de boisson préférée en 1 clic depuis l’écran d’accueil' },
      { ar: 'بطاقة ولاء رقمية مدمجة تتحدث تلقائياً مع كل عملية شراء', en: 'Built-in digital stamp card that updates automatically with each purchase', fr: 'Carte de fidélité numérique synchronisée automatiquement à chaque achat' },
      { ar: 'إشعار فوري عند جاهزية الطلب للاستلام على شريط الهاتف', en: 'Live order readiness notifications keeping wait times to zero', fr: 'Notifications en direct de commande prête pour éviter toute attente' },
    ],
  },
  {
    id: 'medcare-plus',
    brand: 'MedCare Plus',
    brandLogoText: 'medcare+',
    category: {
      ar: 'صحة ورعاية طبية',
      en: 'Healthcare & Telemedicine',
      fr: 'Santé & Télémédecine',
    },
    metric: {
      ar: '99.4% التزام بالمواعيد الطبية',
      en: '99.4% on-time appointments',
      fr: '99,4% de ponctualité aux rendez-vous',
    },
    summary: {
      ar: 'وفرت شبكة عيادات "ميد كير بلس" لمراجعيها منصة هاتفية سهلة ومباشرة لحجز المواعيد واستلام تقارير الفحوصات الطبية وتذكيرات الجرعات بلمسة واحدة.',
      en: 'MedCare Plus empowered patients with a seamless mobile portal for instant appointment booking, test results access, and automated medication reminders.',
      fr: 'MedCare Plus a fourni aux patients un portail mobile fluide pour réserver des consultations, consulter leurs analyses et recevoir des rappels médicaux.',
    },
    quote: {
      ar: 'تثبيت التطبيق بنقرة زر بدون الدخول في متاهات وتنزيلات متاجر التطبيقات ساعد مئات المرضى وكبار السن في التواصل مع أطبائهم وتفادي الغياب عن المواعيد.',
      en: 'Frictionless 1-click installation without app store downloads enabled patients of all demographics to effortlessly stay connected with their doctors.',
      fr: 'L’installation en 1 clic sans les contraintes des app stores a permis aux patients de tout âge de rester facilement en contact avec leurs médecins.',
    },
    author: {
      name: {
        ar: 'د. كريم عبد اللطيف',
        en: 'Dr. Karim Abdellatif',
        fr: 'Dr. Karim Abdellatif',
      },
      role: {
        ar: 'المؤسس ورئيس الفريق الطبي',
        en: 'Founder & Chief Medical Officer',
        fr: 'Fondateur & Directeur Médical',
      },
      avatar: '/stories/avatar-4.jpg',
    },
    image: '/stories/story-clinic.jpg',
    stats: [
      { label: { ar: 'انخفاض الغياب عن المواعيد', en: 'No-show reduction', fr: 'Réduction des absences' }, value: '-42%' },
      { label: { ar: 'تقييم رضا المرضى', en: 'Patient satisfaction', fr: 'Satisfaction patients' }, value: '4.9/5' },
      { label: { ar: 'معدل التثبيت الفوري', en: 'Instant install rate', fr: 'Taux d’installation' }, value: '84%' },
    ],
    highlights: [
      { ar: 'تذكير ذكي بالمواعيد عبر إشعارات الدفع قبل 24 ساعة وساعتين من الزيارة', en: 'Smart push reminders sent 24h and 2h before the scheduled appointment', fr: 'Rappels push intelligents envoyés 24h et 2h avant le rendez-vous' },
      { ar: 'تنزيل وعرض تقارير التحاليل الطبية والوصفات دون الحاجة للإنترنت', en: 'Offline access to lab reports and digital prescription downloads', fr: 'Accès hors ligne aux ordonnances et aux rapports d’analyses médicales' },
      { ar: 'حماية وتشفير متكامل لبيانات المرضى والمحادثات الطبية', en: 'End-to-end encrypted medical chat and patient data protection', fr: 'Chiffrement de bout en bout des dossiers et échanges médicaux' },
    ],
  },
];

export default function CustomerStoriesShowcase() {
  const { lang } = useLanguage();
  const lKey: 'ar' | 'en' | 'fr' = lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en';
  const isRtl = lang === 'ar';
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalStory, setModalStory] = useState<Story | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const activeStory = STORIES[activeIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % STORIES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + STORIES.length) % STORIES.length);
  }, []);

  // Auto-play timer (changes every 8s, pauses on user hover)
  useEffect(() => {
    if (isPaused || modalStory) return;
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 8000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isPaused, modalStory]);

  return (
    <section
      className="mt-28 relative"
      aria-labelledby="customer-stories-title"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="stories-header-badge mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3.5 py-1 text-[11px] font-bold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {lang === 'ar'
                ? 'قصص نجاح واقعية'
                : lang === 'fr'
                  ? 'Histoires de succès réelles'
                  : 'Real Customer Stories'}
            </span>
          </div>
          <h2
            id="customer-stories-title"
            className="stories-header-title text-2xl font-black tracking-tight text-white sm:text-4xl"
          >
            {lang === 'ar'
              ? 'تجارب ناجحة تُلهم وتدعم نمو علامتك'
              : lang === 'fr'
                ? 'Des entreprises leaders qui accélèrent avec Appifya'
                : 'Trusted by industry leaders to deliver mobile excellence'}
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            {lang === 'ar'
              ? 'شاهد كيف حوّلت كبرى المتاجر والشركات مواقعها الإلكترونية إلى تطبيقات هاتف احترافية زادت المبيعات وثقة الزوار.'
              : lang === 'fr'
                ? 'Découvrez comment des entreprises convertissent leurs sites en applications mobiles performantes.'
                : 'See how modern brands convert web platforms into premier mobile applications that drive revenue and loyalty.'}
          </p>
        </div>

        {/* Top-Right Arrows (Large screens) */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous story"
            className="stories-nav-btn group flex h-11 w-11 items-center justify-center rounded-full border shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next story"
            className="stories-nav-btn group flex h-11 w-11 items-center justify-center rounded-full border shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Main Cinematic Showcase Card */}
      <div className="customer-stories-card relative overflow-hidden rounded-3xl min-h-[560px] md:min-h-[620px] flex flex-col justify-between">
        {/* Dynamic Background Image */}
        {STORIES.map((story, idx) => (
          <div
            key={story.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out pointer-events-none ${
              idx === activeIndex ? 'opacity-95 z-0' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={story.image}
              alt={story.brand}
              className="h-full w-full object-cover object-center scale-105"
            />
          </div>
        ))}

        {/* Directional Overlays with Theme Harmony */}
        <div
          className={`absolute inset-0 z-10 pointer-events-none ${
            isRtl ? 'stories-gradient-rtl' : 'stories-gradient-ltr'
          }`}
        />
        <div className="stories-bottom-gradient absolute inset-x-0 bottom-0 h-64 z-10 pointer-events-none" />
        <div className="stories-top-glow absolute top-0 inset-x-0 h-32 z-10 pointer-events-none" />

        {/* Content Area */}
        <div className="relative z-20 p-6 sm:p-10 md:p-12 flex-1 flex flex-col justify-between">
          {/* Top Row: Metric & Mobile Arrows */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="stories-category-badge inline-block rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider mb-2 border">
                {activeStory.category[lKey]}
              </div>
              <div className="stories-metric-text text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-sm">
                {activeStory.metric[lKey]}
              </div>
            </div>

            {/* Mobile Nav Arrows */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous story"
                className="stories-nav-btn flex h-9 w-9 items-center justify-center rounded-full border cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next story"
                className="stories-nav-btn flex h-9 w-9 items-center justify-center rounded-full border cursor-pointer"
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* Center Story Content & Quote */}
          <div className="max-w-2xl my-6 sm:my-8 space-y-5">
            <p className="stories-summary-text text-xs sm:text-sm leading-relaxed">
              {activeStory.summary[lKey]}
            </p>

            <blockquote className="border-s-2 border-indigo-500 ps-4 sm:ps-5 my-4">
              <p className="stories-quote-text text-sm sm:text-lg font-medium italic leading-relaxed">
                “{activeStory.quote[lKey]}”
              </p>
            </blockquote>

            {/* Author Info */}
            <div className="flex items-center gap-3.5 pt-2">
              <img
                src={activeStory.author.avatar}
                alt={activeStory.author.name[lKey]}
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-indigo-500/40 border border-white/20 shadow-md"
              />
              <div>
                <div className="stories-author-name text-sm font-bold">
                  {activeStory.author.name[lKey]}
                </div>
                <div className="stories-author-role text-xs">
                  {activeStory.author.role[lKey]}
                </div>
              </div>
            </div>

            {/* Interactive CTA to open Case Study Details Modal */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setModalStory(activeStory)}
                className="stories-cta-btn inline-flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors group cursor-pointer"
              >
                <span>
                  {lang === 'ar'
                    ? 'اكتشف قصة النجاح بالأرقام'
                    : lang === 'fr'
                      ? 'Découvrir l’étude de cas complète'
                      : 'Read case study'}
                </span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </button>
            </div>
          </div>

          {/* Bottom Thumbnails Navigation Bar (Exact Median Style) */}
          <div className="stories-thumb-separator pt-6 border-t mt-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {STORIES.map((story, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative h-20 sm:h-24 rounded-2xl overflow-hidden transition-all duration-300 text-start group cursor-pointer border ${
                      isActive
                        ? 'stories-thumb-active ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-950 scale-[1.02]'
                        : 'stories-thumb-inactive hover:opacity-100'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <img
                      src={story.image}
                      alt={story.brand}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient for text readability over thumbnail photo */}
                    <div
                      className={`absolute inset-0 ${
                        isActive
                          ? 'bg-gradient-to-t from-black/90 via-black/50 to-transparent'
                          : 'bg-gradient-to-t from-black/85 via-black/60 to-black/30 group-hover:via-black/40'
                      }`}
                    />

                    {/* Active Glowing Top Bar */}
                    {isActive && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
                    )}

                    {/* Brand Name Typography */}
                    <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide drop-shadow-md">
                        {story.brandLogoText}
                      </span>
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Case Study Details Modal */}
      {modalStory && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
          onClick={() => setModalStory(null)}
        >
          <div
            className="stories-modal-content relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-zinc-900 shadow-2xl p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="stories-category-badge inline-block rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border">
                  {modalStory.category[lKey]}
                </span>
                <h3 className="text-2xl font-black text-white mt-2">
                  {modalStory.brand}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalStory(null)}
                aria-label="Close dialog"
                className="stories-modal-close-btn h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Key Metrics Banner */}
            <div className="stories-modal-stat-box grid grid-cols-3 gap-3 rounded-2xl bg-zinc-950/80 border border-white/5 p-4 text-center">
              {modalStory.stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-xl sm:text-2xl font-black text-indigo-500">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {stat.label[lKey]}
                  </div>
                </div>
              ))}
            </div>

            {/* Quote block */}
            <div className="stories-modal-quote-box rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-4">
              <p className="text-xs sm:text-sm italic leading-relaxed text-slate-200">
                “{modalStory.quote[lKey]}”
              </p>
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={modalStory.author.avatar}
                  alt={modalStory.author.name[lKey]}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-indigo-500/40"
                />
                <div>
                  <div className="text-xs font-bold text-white">
                    {modalStory.author.name[lKey]}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {modalStory.author.role[lKey]}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Accomplishments */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {lang === 'ar'
                  ? 'أبرز النتائج المحققة عبر Appifya'
                  : lang === 'fr'
                    ? 'Principaux résultats avec Appifya'
                    : 'Key Achievements with Appifya'}
              </h4>
              <ul className="space-y-2">
                {modalStory.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item[lKey]}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Footer CTA */}
            <div className="pt-2 flex justify-end gap-3 border-t border-white/10 stories-thumb-separator">
              <button
                type="button"
                onClick={() => setModalStory(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق' : lang === 'fr' ? 'Fermer' : 'Close'}
              </button>
              <a
                href="#builder"
                onClick={() => setModalStory(null)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  {lang === 'ar'
                    ? 'اصنع تطبيقك الآن مجاناً'
                    : lang === 'fr'
                      ? 'Créer votre application'
                      : 'Build your app now'}
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
