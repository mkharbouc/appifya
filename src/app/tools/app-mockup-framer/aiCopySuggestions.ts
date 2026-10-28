export interface CopySlide {
  badge: { ar: string; en: string };
  headline: { ar: string; en: string };
  subtitle: { ar: string; en: string };
}

export interface AppCategoryCopy {
  id: string;
  name: { ar: string; en: string };
  icon: string;
  slides: CopySlide[];
}

export const APP_CATEGORIES_COPY: AppCategoryCopy[] = [
  {
    id: 'ecommerce',
    name: { ar: 'تجارة إلكترونية وتسوق', en: 'E-Commerce & Retail' },
    icon: '🛒',
    slides: [
      {
        badge: { ar: '★ تقييم 4.9 للمتجر', en: '★ 4.9 RATED STORE' },
        headline: { ar: 'تسوق آلاف المنتجات بلمسة واحدة', en: 'Shop Thousands of Top Brands' },
        subtitle: { ar: 'أقوى العروض الحصرية والخصومات اليومية تصلك أينما كنت', en: 'Exclusive daily flash sales and curated collections at your fingertips.' },
      },
      {
        badge: { ar: 'توصيل فوري', en: 'EXPRESS DELIVERY' },
        headline: { ar: 'توصيل فائق السرعة لباب بيتك', en: 'Lightning Fast Doorstep Delivery' },
        subtitle: { ar: 'تتبع طلبك حياً على الخريطة من التجهيز وحتى الاستلام', en: 'Live GPS tracking from dispatch straight to your door in real time.' },
      },
      {
        badge: { ar: 'دفع آمن 100%', en: 'SECURE CHECKOUT' },
        headline: { ar: 'طرق دفع متعددة وآمنة تماماً', en: 'Seamless & Flexible Payments' },
        subtitle: { ar: 'ادفع عبر Apple Pay، بطاقات الائتمان، أو خيار الدفع عند الاستلام', en: 'Support for Apple Pay, Google Pay, cards, and Buy Now Pay Later.' },
      },
      {
        badge: { ar: 'عروض حصرية', en: 'VIP REWARDS' },
        headline: { ar: 'نقاط مكافآت مع كل عملية شراء', en: 'Earn Rewards on Every Purchase' },
        subtitle: { ar: 'استبدل نقاطك بكوبونات خصم فورية وهدايا مجانية كل أسبوع', en: 'Collect loyalty coins and redeem instant discount vouchers effortlessly.' },
      },
      {
        badge: { ar: 'دعم على مدار الساعة', en: '24/7 SUPPORT' },
        headline: { ar: 'خدمة عملاء حية وسريعة دائماً', en: 'Always Here Whenever You Need Us' },
        subtitle: { ar: 'فريق دعم متخصص مستعد لمساعدتك في أي استفسار أو استرجاع', en: 'Instant chat assistance and hassle-free 14-day free returns policy.' },
      },
    ],
  },
  {
    id: 'fintech',
    name: { ar: 'المالية والمحافظ الرقمية', en: 'FinTech & Banking' },
    icon: '💳',
    slides: [
      {
        badge: { ar: 'أمان بنكي مشفر', en: 'BANK-GRADE SECURITY' },
        headline: { ar: 'محفظتك المالية الذكية في مكان واحد', en: 'Smart Financial Freedom in One App' },
        subtitle: { ar: 'تحكم في مصاريفك، بطاقاتك، واستثماراتك بأعلى معايير التشفير', en: 'Manage accounts, virtual cards, and investments with biometrics.' },
      },
      {
        badge: { ar: 'تحويل فوري مجاني', en: 'INSTANT TRANSFERS' },
        headline: { ar: 'حوّل أموالك لأي شخص في ثوانٍ', en: 'Send & Receive Cash in Seconds' },
        subtitle: { ar: 'تحويلات محلية ودولية بدون رسوم خفية وبأفضل سعر صرف', en: 'Zero-fee peer-to-peer transfers and unbeatable currency exchange rates.' },
      },
      {
        badge: { ar: 'تحليلات ذكية', en: 'SMART INSIGHTS' },
        headline: { ar: 'راقب ميزانيتك بنقرة زر', en: 'Automated Budget Tracking' },
        subtitle: { ar: 'تقارير بيانية تفصيلية توضح أين تذهب أموالك وكيف تدخر بذكاء', en: 'Visual analytics that categorize your spending and boost your savings.' },
      },
      {
        badge: { ar: 'بطاقات افتراضية', en: 'VIRTUAL CARDS' },
        headline: { ar: 'بطاقات مسبقة الدفع لحماية مدفوعاتك', en: 'Disposable Virtual Cards' },
        subtitle: { ar: 'أنشئ بطاقات تسوق آمنة للاستخدام لمرة واحدة وتفادى الاحتيال', en: 'Create single-use shopping cards to protect your online identity.' },
      },
      {
        badge: { ar: 'عوائد استثمارية', en: 'HIGH-YIELD SAVINGS' },
        headline: { ar: 'نمِّ مدخراتك بعوائد تنافسية', en: 'Watch Your Money Grow Faster' },
        subtitle: { ar: 'صناديق ادخار مرنة تمنحك أرباحاً يومية وإمكانية السحب متى شئت', en: 'Automated round-ups and daily compounded returns on savings vaults.' },
      },
    ],
  },
  {
    id: 'food',
    name: { ar: 'المطاعم وتوصيل الوجبات', en: 'Food & Groceries' },
    icon: '🍔',
    slides: [
      {
        badge: { ar: 'أشهى المأكولات', en: 'CRAVING SATISFACTION' },
        headline: { ar: 'كل مطاعمك المفضلة بين يديك', en: 'Your Favorite Eats, Delivered Fast' },
        subtitle: { ar: 'تصفح قوائم أفضل المطاعم والمقاهي مع خصومات حصرية للتطبيق', en: 'Explore hundreds of top-rated local eateries with exclusive deals.' },
      },
      {
        badge: { ar: 'تتبع مباشر', en: 'LIVE GPS TRACKING' },
        headline: { ar: 'تتبع وجبتك دقيقة بدقيقة', en: 'Watch Your Courier on the Map' },
        subtitle: { ar: 'إشعارات لحظية تبلغك بمراحل تجهيز الطلب وحتى وصول السائق', en: 'Real-time kitchen updates and live GPS tracking straight to your door.' },
      },
      {
        badge: { ar: 'عروض يومية', en: 'UP TO 50% OFF' },
        headline: { ar: 'وجبات كومبو وعروض توفير يومية', en: 'Crazy Daily Combos & Savings' },
        subtitle: { ar: 'استمتع بتوصيل مجاني وخصومات هائلة على طلبات الغداء والعشاء', en: 'Unlock free delivery coupons and bundle deals every single day.' },
      },
      {
        badge: { ar: 'جدولة الطلبات', en: 'PRE-ORDER AHEAD' },
        headline: { ar: 'اطلب مسبقاً واستلم بدون انتظار', en: 'Skip the Line with Pickup' },
        subtitle: { ar: 'حدد موعد وصولك واستلم طعامك ساخناً وجاهزاً فوراً', en: 'Schedule your order for party nights or grab-and-go morning coffee.' },
      },
      {
        badge: { ar: 'مقاضي وسوبرماركت', en: 'FRESH GROCERIES' },
        headline: { ar: 'مقاضي البيت الطازجة في 20 دقيقة', en: 'Fresh Groceries in Minutes' },
        subtitle: { ar: 'خضار، فواكه، ومنتجات يومية مختارة بعناية تصلك بأعلى جودة', en: 'Farm-fresh organic produce and pantry essentials picked with care.' },
      },
    ],
  },
  {
    id: 'fitness',
    name: { ar: 'اللياقة والصحة والرياضة', en: 'Fitness & Health' },
    icon: '🏋️',
    slides: [
      {
        badge: { ar: 'مدربك الشخصي الذكي', en: 'AI PERSONAL TRAINER' },
        headline: { ar: 'حوّل جسمك وحقق وزنك المثالي', en: 'Crush Your Fitness Goals Fast' },
        subtitle: { ar: 'خطط تمارين مخصصة تناسب مستواك، سواء في المنزل أو الصالة', en: 'Personalized home and gym workout routines designed for your body.' },
      },
      {
        badge: { ar: 'تغذية محسوبة', en: 'CALORIE COUNTER' },
        headline: { ar: 'تتبع السعرات والوجبات بالذكاء الاصطناعي', en: 'Smart Meal & Calorie Tracking' },
        subtitle: { ar: 'التقط صورة لطبقك لتقدير السعرات والماكروز بدقة مذهلة', en: 'Snap a photo of your meal for instant macro breakdown and insights.' },
      },
      {
        badge: { ar: 'سجل تقدمك', en: 'PROGRESS ANALYTICS' },
        headline: { ar: 'شاهد نتائجك وتطورك يوماً بيوم', en: 'Celebrate Every Milestone' },
        subtitle: { ar: 'رسوم بيانية توضح حرق الدهون، بناء العضلات، وتحسن لياقتك', en: 'Dynamic charts tracking body measurements, lifted weights, and streaks.' },
      },
      {
        badge: { ar: 'تحديات حماسية', en: 'JOIN THE COMMUNITY' },
        headline: { ar: 'تنافس مع الأصدقاء وشارك إنجازاتك', en: 'Stay Motivated with Friends' },
        subtitle: { ar: 'انضم لتحديات أسبوعية واجمع أوسمة لتظل محفزاً ومستمرًا دائماً', en: 'Climb the global leaderboards and earn prestigious fitness trophies.' },
      },
      {
        badge: { ar: 'نوم وراحة', en: 'SLEEP & RECOVERY' },
        headline: { ar: 'حسّن جودة نومك واستشفائك', en: 'Optimize Rest & Recovery' },
        subtitle: { ar: 'جلسات تأمل مهدئة وتحليل لمراحل النوم لبدء يومك بكامل طاقتك', en: 'Guided mindfulness sessions and restorative sleep cycle monitoring.' },
      },
    ],
  },
  {
    id: 'productivity',
    name: { ar: 'الإنتاجية وإدارة المهام', en: 'Productivity & Work' },
    icon: '⚡',
    slides: [
      {
        badge: { ar: 'تنظيم فائق الذكاء', en: 'WORK SMARTER' },
        headline: { ar: 'نظّم يومك وأنجز مهامك بدون تشتت', en: 'Conquer Your Daily To-Do List' },
        subtitle: { ar: 'لوحة عمل متكاملة لإدارة المشاريع والمهام الشخصية بكل سلاسة', en: 'A minimalist workflow hub to organize projects, notes, and habits.' },
      },
      {
        badge: { ar: 'مزامنة سحابية فورية', en: 'REAL-TIME CLOUD SYNC' },
        headline: { ar: 'بياناتك معك على جميع أجهزتك', en: 'Available on Phone, Tablet & Web' },
        subtitle: { ar: 'مزامنة لحظية تدعم العمل بدون إنترنت وتضمن عدم ضياع أي فكرة', en: 'Seamless cross-platform sync with full offline mode support.' },
      },
      {
        badge: { ar: 'مساعد ذكاء اصطناعي', en: 'AI WRITING & SUMMARY' },
        headline: { ar: 'اختصر ساعات العمل بضغطة زر', en: 'Automate Repetitive Work with AI' },
        subtitle: { ar: 'تلخيص المستندات، صياغة الرسائل، وجدولة المواعيد تلقائياً', en: 'Auto-summarize long documents and generate project outlines in seconds.' },
      },
      {
        badge: { ar: 'تركيز عميق', en: 'FOCUS MODE' },
        headline: { ar: 'تخلص من المشتتات وضاعف تركيزك', en: 'Pomodoro Timer & Focus Sounds' },
        subtitle: { ar: 'مؤقتات بومودورو مع أصوات طبيعية محفزة للإنجاز والإبداع', en: 'Built-in ambient soundscapes and timed deep work sessions.' },
      },
      {
        badge: { ar: 'تعاون جماعي', en: 'TEAM COLLABORATION' },
        headline: { ar: 'شارك مهامك مع فريقك وعائلتك', en: 'Collaborate Seamlessly' },
        subtitle: { ar: 'توزيع المسؤوليات ومتابعة الإنجاز الجماعي بكل وضوح وسهولة', en: 'Assign tasks, share checklists, and track group progress effortlessly.' },
      },
    ],
  },
  {
    id: 'social',
    name: { ar: 'التواصل الاجتماعي والمحادثات', en: 'Social & Chat' },
    icon: '💬',
    slides: [
      {
        badge: { ar: 'تواصل بلا حدود', en: 'CONNECT GLOBALLY' },
        headline: { ar: 'شارك لحظاتك مع من تحب بحرية', en: 'Share Your World in Real Time' },
        subtitle: { ar: 'منصة تواصل عصرية تمنحك التعبير الكامل بالصور والفيديوهات', en: 'Express yourself with stories, posts, and dynamic interactive filters.' },
      },
      {
        badge: { ar: 'مكالمات فائقة الوضوح', en: 'HD VOICE & VIDEO' },
        headline: { ar: 'مكالمات صوت وفيديو نقية جداً', en: 'Crystal Clear Audio & Video' },
        subtitle: { ar: 'مكالمات جماعية مشفرة بدقة عالية تعمل بكفاءة حتى مع ضعف الاتصال', en: 'End-to-end encrypted calls that work smoothly even on low-speed data.' },
      },
      {
        badge: { ar: 'مجتمعات واهتمامات', en: 'FIND YOUR TRIBE' },
        headline: { ar: 'اكتشف مجتمعات تشاركك نفس شغفك', en: 'Discover Communities You Love' },
        subtitle: { ar: 'انضم لغرف نقاشية ومجموعات متخصصة في التقنية، الفن، والسفر', en: 'Join vibrant channels and meet inspiring creators from around the world.' },
      },
      {
        badge: { ar: 'خصوصية قصوى', en: 'PRIVATE & ENCRYPTED' },
        headline: { ar: 'محادثاتك ملكك وحدك دائماً', en: 'Your Privacy Is Never Compromised' },
        subtitle: { ar: 'رسائل ذاتية الاختفاء وحماية تامة لبياناتك الشخصية دون أي إعلانات', en: 'Disappearing messages and zero data tracking for complete peace of mind.' },
      },
      {
        badge: { ar: 'ملصقات ومرح', en: 'CREATIVE EXPRESSION' },
        headline: { ar: 'عبّر عن نفسك بآلاف الرموز والملصقات', en: 'Make Every Chat Unforgettable' },
        subtitle: { ar: 'مكتبة ملصقات حصرية وتأثيرات ذكية تجعل محادثاتك أكثر حيوية', en: 'Custom animated stickers, emojis, and voice modulation features.' },
      },
    ],
  },
  {
    id: 'travel',
    name: { ar: 'السفر والرحلات والحجوزات', en: 'Travel & Booking' },
    icon: '✈️',
    slides: [
      {
        badge: { ar: 'استكشف العالم', en: 'WANDERLUST UNLEASHED' },
        headline: { ar: 'رحلة أحلامك تبدأ بنقرة واحدة', en: 'Book Your Next Adventure with Ease' },
        subtitle: { ar: 'قارن بين آلاف الفنادق ورحلات الطيران بأفضل الأسعار المضمونة', en: 'Compare flights, boutique stays, and car rentals at guaranteed low rates.' },
      },
      {
        badge: { ar: 'حجز فوري بدون تعقيد', en: 'INSTANT CONFIRMATION' },
        headline: { ar: 'تأكيد حجز لحظي بدون أي رسوم خفية', en: 'Hassle-Free Instant Reservations' },
        subtitle: { ar: 'إلغاء مجاني على معظم الحجوزات مع خيارات دفع مرنة ومريحة', en: 'Free cancellation on selected stays with pay-later options.' },
      },
      {
        badge: { ar: 'دليل سياحي تفاعلي', en: 'CURATED CITY GUIDES' },
        headline: { ar: 'اكتشف أفضل الأماكن والأنشطة السرية', en: 'Explore Hidden Gems like a Local' },
        subtitle: { ar: 'خرائط أوفلاين وتوصيات حصرية من مسافرين وخبراء محليين', en: 'Offline navigation maps and insider food & sightseeing recommendations.' },
      },
      {
        badge: { ar: 'محفظة التذاكر', en: 'ALL-IN-ONE ITINERARY' },
        headline: { ar: 'كل تذاكرك ومستنداتك في مكان واحد', en: 'Smart Trip Planner & Tickets' },
        subtitle: { ar: 'تنبيهات فورية بمواعيد بوابات الطيران وأرقام الرحلات دون قلق', en: 'Real-time flight gate changes and boarding passes right on your screen.' },
      },
      {
        badge: { ar: 'مكافآت السفر', en: 'MILES & CASHBACK' },
        headline: { ar: 'استرجع كاش باك مع كل فندق تحجزه', en: 'Earn Generous Travel Rewards' },
        subtitle: { ar: 'نقاط أميال قابلة للاستبدال بليالي فندقية مجانية وترقيات مقاعد', en: 'Redeem loyalty miles for room upgrades and free VIP airport lounge passes.' },
      },
    ],
  },
  {
    id: 'gaming',
    name: { ar: 'الألعاب والترفيه التفاعلي', en: 'Gaming & Fun' },
    icon: '🎮',
    slides: [
      {
        badge: { ar: 'مغامرة ملحمية', en: 'EPIC ADVENTURE' },
        headline: { ar: 'انغمس في عالم ألعاب لا ينتهي', en: 'Immerse Yourself in Pure Action' },
        subtitle: { ar: 'رسومات ثلاثية الأبعاد مذهلة وأسلوب لعب إدماني يخطف الأنفاس', en: 'Next-gen console quality visuals and smooth 120 FPS high-octane gameplay.' },
      },
      {
        badge: { ar: 'متعدد اللاعبين', en: 'GLOBAL MULTIPLAYER' },
        headline: { ar: 'تحدَّ ملايين اللاعبين حول العالم', en: 'Battle Players in Real-Time Arenas' },
        subtitle: { ar: 'كوّن فريقك، تنافس في بطولات أسبوعية، وتصدر قوائم الشرف العالمية', en: 'Join competitive alliances, conquer tournaments, and claim seasonal ranks.' },
      },
      {
        badge: { ar: 'تخصيص كامل', en: 'CUSTOMIZE HEROES' },
        headline: { ar: 'طور أبطالك وافتح أسلحة نادرة', en: 'Unlock Legendary Skins & Gear' },
        subtitle: { ar: 'مئات الأزياء والأسلحة المميزة لتظهر بأسلوبك الخاص في المعركة', en: 'Collect mythic weapons, unique avatars, and exclusive visual effects.' },
      },
      {
        badge: { ar: 'جوائز يومية', en: 'DAILY LOOT' },
        headline: { ar: 'صناديق مكافآت وجوائز تسجيل دخول يومية', en: 'Claim Huge Daily Rewards' },
        subtitle: { ar: 'افتح صناديق الكنز يومياً وضاعف عملاتك وترقياتك بدون توقف', en: 'Login daily to unlock mystery loot chests and power-up boosters.' },
      },
      {
        badge: { ar: 'لعب بدون إنترنت', en: 'OFFLINE MODE' },
        headline: { ar: 'العب في أي وقت وأي مكان حتى بدون شبكة', en: 'Play Anywhere, Even Offline' },
        subtitle: { ar: 'أطوار لعب فردية شيقة تضمن لك التسلية في السفر وبلا استهلاك للبيانات', en: 'Enjoy engaging campaign missions without consuming mobile data.' },
      },
    ],
  },
];

/**
 * Intelligent generator: Adapts copy based on optional custom keyword / app name
 */
export function generateSmartCopy(
  categoryId: string,
  customAppKeyword?: string,
  lang: 'ar' | 'en' = 'ar'
): CopySlide[] {
  const category = APP_CATEGORIES_COPY.find((c) => c.id === categoryId) || APP_CATEGORIES_COPY[0];
  const baseSlides = category.slides;

  if (!customAppKeyword || !customAppKeyword.trim()) {
    return baseSlides;
  }

  const cleanKeyword = customAppKeyword.trim();

  // Inject or adapt custom name to the first hero slide
  return baseSlides.map((slide, index) => {
    if (index === 0) {
      return {
        badge: slide.badge,
        headline: {
          ar: lang === 'ar' ? `اكتشف ${cleanKeyword} - أسهل وأسرع تجربة` : `Discover ${cleanKeyword} - Smarter & Faster`,
          en: `Discover ${cleanKeyword} - Smarter & Faster`,
        },
        subtitle: {
          ar: lang === 'ar' ? `كل ما تحتاجه في تطبيق ${cleanKeyword} مع تصميم عصري وسرعة فائقة` : `Everything you love with ${cleanKeyword}, designed for high speed and elegance.`,
          en: `Everything you love with ${cleanKeyword}, designed for high speed and elegance.`,
        },
      };
    }
    return slide;
  });
}
