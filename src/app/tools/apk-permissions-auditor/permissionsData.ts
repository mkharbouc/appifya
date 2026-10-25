export type RiskLevel = 'critical' | 'high' | 'medium' | 'safe';

export interface PermissionDefinition {
  name: string;
  simpleName: string;
  risk: RiskLevel;
  category: {
    ar: string;
    en: string;
    fr: string;
  };
  title: {
    ar: string;
    en: string;
    fr: string;
  };
  description: {
    ar: string;
    en: string;
    fr: string;
  };
  playPolicyNotice: {
    ar: string;
    en: string;
    fr: string;
  };
  commonSdkInjected?: string[];
  remediationAdvice: {
    ar: string;
    en: string;
    fr: string;
  };
  needsDeclarationForm?: boolean;
}

export interface SdkDefinition {
  id: string;
  name: string;
  category: 'ads' | 'analytics' | 'push' | 'crash' | 'attribution';
  categoryLabel: {
    ar: string;
    en: string;
    fr: string;
  };
  markers: string[];
  injectedPermissions: string[];
  complianceNotes: {
    ar: string;
    en: string;
    fr: string;
  };
  warningLevel: 'info' | 'warning' | 'critical';
}

export const PERMISSIONS_KNOWLEDGE_BASE: Record<string, PermissionDefinition> = {
  // CRITICAL PERMISSIONS (🚨 خطورة قصوى - رفض مباشر إذا لم يتم تبريرها بفيديو أو استثناء رسمي)
  'android.permission.QUERY_ALL_PACKAGES': {
    name: 'android.permission.QUERY_ALL_PACKAGES',
    simpleName: 'QUERY_ALL_PACKAGES',
    risk: 'critical',
    category: {
      ar: 'رؤية حزم التطبيقات (Package Visibility)',
      en: 'Package Visibility',
      fr: 'Visibilité des paquets',
    },
    title: {
      ar: 'استطلاع جميع التطبيقات المثبتة في هاتف المستخدم',
      en: 'Query All Installed Applications',
      fr: 'Interroger toutes les applications installées',
    },
    description: {
      ar: 'يمنح التطبيق صلاحية قراءة قائمة بجميع التطبيقات المثبتة في هاتف العميل دون أي قيود.',
      en: 'Allows the app to see all installed applications on the device without filtering.',
      fr: 'Permet à l’application de voir toutes les applications installées sur l’appareil.',
    },
    playPolicyNotice: {
      ar: 'سياسة Google Play 2026: ممنوع منعاً باتاً إلا لتطبيقات محددة للغاية (برامج مكافحة الفيروسات، مشغلات اللانشر، أو تطبيقات إدارة الملفات). وجوده يؤدي لرفض فوري مع طلب فيديو توضيحي يثبت أن التطبيق لا يعمل بدونه.',
      en: 'Google Play 2026 Policy: Strictly prohibited unless the core function is Antivirus, Launcher, or File Manager. Triggers instant rejection and requires video demonstration.',
      fr: 'Règle Google Play 2026 : Strictement interdit sauf pour les antivirus ou lanceurs. Entraîne un refus immédiat nécessitant une justification vidéo.',
    },
    remediationAdvice: {
      ar: 'احذفه فوراً واستبدله بعنصر <queries> داخل AndroidManifest.xml لتحديد حزم التطبيقات التي تريد فتحها فقط (مثل WhatsApp أو تطبيق المتصفح).',
      en: 'Remove it immediately and use the <queries> manifest element to target specific packages or intents.',
      fr: 'Supprimez-le immédiatement et utilisez l’élément <queries> pour cibler uniquement les applications nécessaires.',
    },
    needsDeclarationForm: true,
  },

  'android.permission.MANAGE_EXTERNAL_STORAGE': {
    name: 'android.permission.MANAGE_EXTERNAL_STORAGE',
    simpleName: 'MANAGE_EXTERNAL_STORAGE',
    risk: 'critical',
    category: {
      ar: 'الوصول لكافة ملفات الذاكرة (All Files Access)',
      en: 'All Files Access',
      fr: 'Accès complet au stockage',
    },
    title: {
      ar: 'إدارة وتعديل جميع الملفات بالذاكرة الخارجية',
      en: 'Full External Storage Management',
      fr: 'Gestion complète du stockage externe',
    },
    description: {
      ar: 'يطلب التحكم المطلق في جميع المجلدات والملفات بوحدة التخزين المشتركة للهاتف.',
      en: 'Grants broad access to external storage across directories and media.',
      fr: 'Donne un accès étendu à tous les fichiers et dossiers du stockage externe.',
    },
    playPolicyNotice: {
      ar: 'سياسة Google Play: تصريح محظور للغاية ومخصص فقط لبرامج النسخ الاحتياطي (Backup) ومستكشفات الملفات المعتمدة. لن يُقبل لتطبيقات المتاجر العادية أو تطبيقات الويب.',
      en: 'Google Play Policy: Highly restricted permission. Only approved for file managers or backup utilities.',
      fr: 'Politique Google Play : Permission très restreinte, réservée aux gestionnaires de fichiers ou utilitaires de sauvegarde.',
    },
    remediationAdvice: {
      ar: 'احذف الإذن واستخدم MediaStore API أو Storage Access Framework (SAF) لاختيار ملف محدد من المستخدم.',
      en: 'Remove and migrate to Storage Access Framework (SAF) or MediaStore API.',
      fr: 'Supprimez et utilisez le Storage Access Framework (SAF) ou MediaStore.',
    },
    needsDeclarationForm: true,
  },

  'android.permission.REQUEST_INSTALL_PACKAGES': {
    name: 'android.permission.REQUEST_INSTALL_PACKAGES',
    simpleName: 'REQUEST_INSTALL_PACKAGES',
    risk: 'critical',
    category: {
      ar: 'تثبيت تطبيقات خارجية (Unknown Sources)',
      en: 'Package Installation',
      fr: 'Installation de paquets',
    },
    title: {
      ar: 'طلب تثبيت ملفات APK جديدة من داخل التطبيق',
      en: 'Request Installation of App Packages',
      fr: 'Demande d’installation de packages',
    },
    description: {
      ar: 'يسمح للتطبيق بتنزيل وتثبيت تطبيقات خارجية دون المرور بمتجر Google Play.',
      en: 'Allows the application to trigger APK package installations.',
      fr: 'Permet à l’application de déclencher l’installation de fichiers APK.',
    },
    playPolicyNotice: {
      ar: 'سياسة متجر جوجل: ممنوع لتطبيقات PWA والويب والمتاجر، مقتصر على متاجر التطبيقات المعتمدة وتطبيقات المزامنة مؤسسياً.',
      en: 'Google Play Policy: Restricted to alternative app stores or enterprise device management tools.',
      fr: 'Politique Google Play : Réservé aux stores d’applications alternatifs ou outils d’entreprise.',
    },
    remediationAdvice: {
      ar: 'أزل هذا الإذن واعتمد على توجيه المستخدم لصفحة التطبيق في متجر Google Play.',
      en: 'Remove this permission and redirect users to Google Play Store URLs instead.',
      fr: 'Supprimez cette permission et redirigez les utilisateurs vers le Google Play Store.',
    },
    needsDeclarationForm: true,
  },

  'android.permission.READ_SMS': {
    name: 'android.permission.READ_SMS',
    simpleName: 'READ_SMS',
    risk: 'critical',
    category: { ar: 'الرسائل النصية SMS', en: 'SMS Privacy', fr: 'Confidentialité SMS' },
    title: { ar: 'قراءة الرسائل النصية القصيرة للمستخدم', en: 'Read SMS Messages', fr: 'Lire les SMS' },
    description: {
      ar: 'يقرأ جميع محتويات الرسائل النصية المحفوظة في هاتف العميل بما فيها رموز الأمان البنكية.',
      en: 'Accesses received or stored SMS text messages.',
      fr: 'Accède aux messages SMS stockés ou reçus.',
    },
    playPolicyNotice: {
      ar: 'سياسة Google Play: مسموح به فقط إذا كان تطبيقك هو التطبيق الافتراضي للرسائل (Default SMS Handler).',
      en: 'Strictly restricted to apps configured as the Default SMS Handler.',
      fr: 'Strictement réservé aux applications SMS par défaut.',
    },
    remediationAdvice: {
      ar: 'لقراءة رموز OTP والتحقق، استخدم Google SMS User Consent API أو SMS Retriever API بدون طلب إذن SMS!',
      en: 'Use Google SMS Retriever API or SMS User Consent API instead of requesting READ_SMS.',
      fr: 'Utilisez l’API Google SMS Retriever ou SMS User Consent au lieu de demander READ_SMS.',
    },
    needsDeclarationForm: true,
  },

  'android.permission.USE_EXACT_ALARM': {
    name: 'android.permission.USE_EXACT_ALARM',
    simpleName: 'USE_EXACT_ALARM',
    risk: 'critical',
    category: { ar: 'المنبهات الدقيقة (Android 14+)', en: 'Exact Alarms (Android 14+)', fr: 'Alarmes exactes' },
    title: { ar: 'جدولة منبهات في توقيتات فائقة الدقة', en: 'Schedule Exact Alarms', fr: 'Programmer des alarmes exactes' },
    description: {
      ar: 'يسمح بتشغيل إجراءات التطبيق في أجزاء من الثانية حتى في وضع السكون العميق للهاتف.',
      en: 'Allows scheduling alarms that execute at an exact time.',
      fr: 'Permet de déclencher des alarmes à une seconde précise.',
    },
    playPolicyNotice: {
      ar: 'سياسة Android 14+: تحظر Google Play استخدام USE_EXACT_ALARM إلا لتطبيقات المنبهات والتقاويم. يتم سحبه تلقائياً للتطبيقات غير المؤهلة.',
      en: 'Restricted in Android 14+ (API 34). Only granted to Clock, Alarm, or Calendar apps.',
      fr: 'Restreint sur Android 14+. Uniquement accordé aux réveils et agendas.',
    },
    remediationAdvice: {
      ar: 'استخدم WorkManager أو SCHEDULE_EXACT_ALARM بدلاً منه، أو احذفه إذا تم حقنه من مكتبة تقويم/إشعارات.',
      en: 'Migrate to WorkManager or inexact alarms.',
      fr: 'Migrez vers WorkManager ou des alarmes inexactes.',
    },
    needsDeclarationForm: true,
  },

  // HIGH RISK PERMISSIONS (⚠️ عالي الخطورة - يحتاج إفصاح مسبق Prominent Disclosure واستبيان Play Console)
  'android.permission.ACCESS_FINE_LOCATION': {
    name: 'android.permission.ACCESS_FINE_LOCATION',
    simpleName: 'ACCESS_FINE_LOCATION',
    risk: 'high',
    category: { ar: 'الموقع الجغرافي الدقيق (GPS)', en: 'Precise Location (GPS)', fr: 'Localisation précise' },
    title: { ar: 'تحديد الموقع الجغرافي الدقيق عبر الأقمار الصناعية (GPS)', en: 'Precise Device Location Access', fr: 'Accès à la position précise' },
    description: {
      ar: 'يحدد الإحداثيات الجغرافية لمكان وجود المستخدم بدقة أمتار قليلة.',
      en: 'Determines the exact GPS coordinates of the user device.',
      fr: 'Détermine les coordonnées GPS exactes de l’utilisateur.',
    },
    playPolicyNotice: {
      ar: 'سياسة متجر جوجل: تتطلب شاشة إفصاح بارزة (Prominent In-App Disclosure) قبل طلب الإذن، مع إقرار صريح في نموذج سلامة البيانات Data Safety.',
      en: 'Requires Prominent In-App Disclosure before the runtime prompt and accurate Data Safety questionnaire disclosure.',
      fr: 'Nécessite une divulgation visible dans l’application et une déclaration dans la fiche Sécurité des données.',
    },
    commonSdkInjected: ['Google AdMob (Geo Ads)', 'Analytics SDKs', 'Facebook SDK'],
    remediationAdvice: {
      ar: 'إذا كان تطبيقك متجراً إلكترونياً أو موقعاً لا يتطلب تتبع السائقين في الوقت الفعلي، احذفه أو اكتفِ بـ ACCESS_COARSE_LOCATION.',
      en: 'If real-time navigation is not core, downgrade to ACCESS_COARSE_LOCATION or remove if injected by AdMob.',
      fr: 'Si la navigation en temps réel n’est pas essentielle, supprimez-le ou utilisez ACCESS_COARSE_LOCATION.',
    },
    needsDeclarationForm: true,
  },

  'android.permission.ACCESS_COARSE_LOCATION': {
    name: 'android.permission.ACCESS_COARSE_LOCATION',
    simpleName: 'ACCESS_COARSE_LOCATION',
    risk: 'high',
    category: { ar: 'الموقع التقريبي (شبكة/واي فاي)', en: 'Approximate Location', fr: 'Localisation approximative' },
    title: { ar: 'تحديد الموقع التقريبي للمستخدم (على مستوى المدينة/الحي)', en: 'Approximate Location Access', fr: 'Accès à la position approximative' },
    description: {
      ar: 'يقدّر موقع المستخدم عبر أبراج الاتصال وشبكات الواي فاي دون دقة الـ GPS.',
      en: 'Estimates device location using network towers and Wi-Fi.',
      fr: 'Estime la position à l’aide des antennes relais et du Wi-Fi.',
    },
    playPolicyNotice: {
      ar: 'يجب توضيح سبب جمعه في قسم سلامة البيانات Data Safety وتحديد ما إذا كان يُشارك مع أطراف ثالثة للإعلانات.',
      en: 'Must be accurately declared in Google Play Data Safety form for ad targeting or analytics.',
      fr: 'Doit être déclaré dans la fiche Sécurité des données pour le ciblage publicitaire.',
    },
    commonSdkInjected: ['AdMob', 'Unity Ads', 'AppLovin'],
    remediationAdvice: {
      ar: 'يمكن إزالته إذا لم يكن تطبيقك يقدم محتوى حسب المدينة أو العملة تلقائياً.',
      en: 'Safe to remove if city-based localization is not strictly needed.',
      fr: 'Peut être retiré si la localisation par ville n’est pas nécessaire.',
    },
    needsDeclarationForm: true,
  },

  'android.permission.ACCESS_BACKGROUND_LOCATION': {
    name: 'android.permission.ACCESS_BACKGROUND_LOCATION',
    simpleName: 'ACCESS_BACKGROUND_LOCATION',
    risk: 'critical',
    category: { ar: 'الموقع في الخلفية (Background GPS)', en: 'Background Location', fr: 'Position en arrière-plan' },
    title: { ar: 'تتبع موقع المستخدم حتى عندما يكون التطبيق مغلقاً', en: 'Continuous Background Location Access', fr: 'Position continue en arrière-plan' },
    description: {
      ar: 'يراقب إحداثيات المستخدم بشكل متواصل في الخلفية أثناء قفل الشاشة أو استخدام تطبيقات أخرى.',
      en: 'Tracks location even when the app is closed or running in background.',
      fr: 'Suit la position même lorsque l’application est fermée.',
    },
    playPolicyNotice: {
      ar: 'سياسة صارمة للغاية: تتطلب موافقة يدوية مسبقة من مراجعي Google Play مع إرسال فيديو إثبات وموافقة خاصة.',
      en: 'Extremely strict policy. Requires manual Google approval with video review before release.',
      fr: 'Très haute restriction. Nécessite une approbation manuelle et une vidéo de démonstration.',
    },
    remediationAdvice: {
      ar: 'احذفه فوراً ما لم تكن تبني تطبيق توصيل أو تتبع أساطيل معتمد رسمياً!',
      en: 'Remove immediately unless your core business is delivery/fleet tracking.',
      fr: 'À supprimer immédiatement sauf s’il s’agit d’une app de livraison dédiée.',
    },
    needsDeclarationForm: true,
  },

  'android.permission.CAMERA': {
    name: 'android.permission.CAMERA',
    simpleName: 'CAMERA',
    risk: 'high',
    category: { ar: 'الكاميرا والصور', en: 'Camera Hardware', fr: 'Matériel photo' },
    title: { ar: 'التقاط الصور وتسجيل الفيديو بالكاميرا', en: 'Access Device Camera', fr: 'Accéder à l’appareil photo' },
    description: {
      ar: 'يفتح حساس الكاميرا لالتقاط الصور والماسحات الضوئية ومكالمات الفيديو.',
      en: 'Opens the camera sensor to capture photos or stream video.',
      fr: 'Ouvre le capteur de la caméra pour capturer des photos ou vidéos.',
    },
    playPolicyNotice: {
      ar: 'يتطلب إذناً وقت التشغيل (Runtime Permission) وتصريحاً في استبيان خصوصية المتجر.',
      en: 'Requires runtime permission and Google Play Console privacy declaration.',
      fr: 'Nécessite une autorisation d’exécution et une déclaration de confidentialité.',
    },
    commonSdkInjected: ['QR Scanners', 'AR SDKs', 'Document Verification'],
    remediationAdvice: {
      ar: 'إذا كان تطبيقك يحتاج فقط لرفع صورة من الاستوديو، فلا تطلب إذن CAMERA بل استخدم Photo Picker أو Intent.',
      en: 'If you only need image uploads, use Android Photo Picker or system gallery intent instead.',
      fr: 'Pour un simple téléversement d’image, utilisez le Photo Picker natif au lieu de CAMERA.',
    },
    needsDeclarationForm: true,
  },

  'android.permission.RECORD_AUDIO': {
    name: 'android.permission.RECORD_AUDIO',
    simpleName: 'RECORD_AUDIO',
    risk: 'high',
    category: { ar: 'الميكروفون والصوتيات', en: 'Microphone & Audio', fr: 'Microphone et audio' },
    title: { ar: 'تسجيل الصوت من الميكروفون', en: 'Record Audio via Microphone', fr: 'Enregistrer du son via le micro' },
    description: {
      ar: 'يسمح للتطبيق بالاستماع وتسجيل الصوت من ميكروفون الهاتف.',
      en: 'Allows capturing microphone audio streams.',
      fr: 'Permet d’enregistrer le son à partir du microphone.',
    },
    playPolicyNotice: {
      ar: 'حساسية مرتفعة: يتطلب مبرراً واضحاً وشاشة تنبيه للمستخدم وإقراراً في Data Safety.',
      en: 'High privacy sensitivity. Must be declared in Data Safety.',
      fr: 'Haute sensibilité. Doit figurer dans la fiche Sécurité des données.',
    },
    remediationAdvice: {
      ar: 'احذفه إذا تم إدراجه عن طريق الخطأ عبر حزم إعلانية أو مكتبات وسائط غير مطلوبة.',
      en: 'Remove if mistakenly pulled by media or advertising libraries.',
      fr: 'Supprimez-le s’il provient d’une bibliothèque tierce superflue.',
    },
    needsDeclarationForm: true,
  },

  'android.permission.READ_MEDIA_IMAGES': {
    name: 'android.permission.READ_MEDIA_IMAGES',
    simpleName: 'READ_MEDIA_IMAGES',
    risk: 'high',
    category: { ar: 'الصور والوسائط (Android 13+)', en: 'Media Images (Android 13+)', fr: 'Photos et médias' },
    title: { ar: 'قراءة جميع الصور المخزنة في هاتف المستخدم', en: 'Read User Photo Library', fr: 'Lire la galerie photo' },
    description: {
      ar: 'إذن أندرويد 13+ لقراءة وتصفح كافة صور ألبوم المستخدم.',
      en: 'Accesses all image files across the user storage.',
      fr: 'Accède à l’ensemble des images de la galerie de l’appareil.',
    },
    playPolicyNotice: {
      ar: 'سياسة Google Play 2026: ترفض جوجل التطبيقات التي تطلب هذا الإذن العام ما لم تقدم مبرراً قوياً يثبت عدم كفاية منتقي الصور المدمج (Android Photo Picker).',
      en: 'Google Play 2026 Policy: Mandates migration to the Android Photo Picker. Apps requesting broad READ_MEDIA_IMAGES without core photo editor functionality face rejection.',
      fr: 'Google Play 2026 : Exige l’utilisation du Photo Picker natif. Les demandes globales sont rejetées.',
    },
    remediationAdvice: {
      ar: 'استبدل الإذن بمحدد الصور الرسمي Android Photo Picker (ActivityResultContracts.PickVisualMedia) بدون طلب أي إذن في Manifest!',
      en: 'Migrate to Android Photo Picker (ActivityResultContracts.PickVisualMedia) which requires zero manifest permissions.',
      fr: 'Migrez vers le Photo Picker natif qui ne nécessite aucune permission dans le Manifest.',
    },
    needsDeclarationForm: true,
  },

  'android.permission.POST_NOTIFICATIONS': {
    name: 'android.permission.POST_NOTIFICATIONS',
    simpleName: 'POST_NOTIFICATIONS',
    risk: 'medium',
    category: { ar: 'الإشعارات (Android 13+)', en: 'Push Notifications', fr: 'Notifications Push' },
    title: { ar: 'إرسال إشعارات وتنبيهات فورية للمستخدم', en: 'Post Push Notifications', fr: 'Envoyer des notifications push' },
    description: {
      ar: 'مطلوب في أندرويد 13+ لإظهار الإشعارات في شريط التنبيهات.',
      en: 'Required on Android 13+ (API 33+) to display system notifications.',
      fr: 'Requis sur Android 13+ pour afficher des notifications système.',
    },
    playPolicyNotice: {
      ar: 'طبيعي ومقبول، لكن يتطلب طلب الإذن برمجياً في الوقت المناسب دون إزعاج المستخدم.',
      en: 'Standard for push notifications. Requires runtime permission prompt on Android 13+.',
      fr: 'Standard pour les notifications push. Nécessite une boîte de dialogue d’autorisation.',
    },
    commonSdkInjected: ['OneSignal', 'Firebase Cloud Messaging (FCM)', 'CleverTap'],
    remediationAdvice: {
      ar: 'إذن آمن وضروري إذا كان تطبيقك يرسل تحديثات أو عروض للمشتركين.',
      en: 'Safe to keep if your app provides order alerts, chat, or engagement notifications.',
      fr: 'À conserver si votre application délivre des notifications utiles.',
    },
  },

  'com.google.android.gms.permission.AD_ID': {
    name: 'com.google.android.gms.permission.AD_ID',
    simpleName: 'AD_ID',
    risk: 'medium',
    category: { ar: 'معرّف الإعلانات (Advertising ID)', en: 'Advertising ID (GAID)', fr: 'Identifiant publicitaire' },
    title: { ar: 'الوصول لمعرّف الإعلانات الإحصائي لـ Google Play', en: 'Google Advertising ID Access', fr: 'Accès à l’identifiant publicitaire Google' },
    description: {
      ar: 'يسمح لـ Google Play Services بجمع معرّف الإعلانات لتتبع التحويلات وتخصيص الإعلانات.',
      en: 'Accesses Google Play Advertising ID for attribution and personalized ads.',
      fr: 'Accède à l’identifiant publicitaire pour l’attribution et la personnalisation.',
    },
    playPolicyNotice: {
      ar: 'إلزامي لمستخدمي AdMob وحزم التتبع. يجب الإقرار الصريح بجمع Advertising ID في استبيان Data Safety في Console.',
      en: 'Mandatory declaration in Google Play Console Data Safety questionnaire under Device IDs.',
      fr: 'Déclaration obligatoire dans la section Sécurité des données de Google Play Console.',
    },
    commonSdkInjected: ['Google Mobile Ads (AdMob)', 'Firebase Analytics', 'AppsFlyer', 'Adjust'],
    remediationAdvice: {
      ar: 'إذا كان تطبيقك خالياً من الإعلانات تماماً وتريد إزالته، ضع: <uses-permission android:name="com.google.android.gms.permission.AD_ID" tools:node="remove" />.',
      en: 'If your app is 100% ad-free and without analytics, remove it via tools:node="remove".',
      fr: 'Si l’application est totalement sans publicité, supprimez-le avec tools:node="remove".',
    },
    needsDeclarationForm: true,
  },

  // MEDIUM RISK
  'android.permission.RECEIVE_BOOT_COMPLETED': {
    name: 'android.permission.RECEIVE_BOOT_COMPLETED',
    simpleName: 'RECEIVE_BOOT_COMPLETED',
    risk: 'medium',
    category: { ar: 'التشغيل التلقائي عند بدء التشغيل', en: 'Startup Execution', fr: 'Démarrage système' },
    title: { ar: 'إعادة جدولة المهام تلقائياً فور إعادة تشغيل الهاتف', en: 'Run at Device Startup', fr: 'Lancer au démarrage de l’appareil' },
    description: {
      ar: 'يُشعر التطبيق عند اكتمال إقلاع نظام أندرويد لجدولة المنبهات أو إعادة تشغيل خدمات الإشعارات.',
      en: 'Notifies the app when device reboot is complete to restore scheduled alarms or push sync.',
      fr: 'Avertit l’application de la fin du démarrage pour rétablir les alarmes ou notifications.',
    },
    playPolicyNotice: {
      ar: 'مقبول، ولكن الاستخدام المفرط قد يسبب استهلاك بطارية ويؤثر على تقييم Android Vitals.',
      en: 'Acceptable but heavy use may trigger Android Vitals battery drain warnings.',
      fr: 'Acceptable mais un usage abusif peut dégrader les métriques Android Vitals.',
    },
    commonSdkInjected: ['OneSignal', 'Firebase Cloud Messaging', 'WorkManager'],
    remediationAdvice: {
      ar: 'ضروري لضمان عدم توقف الإشعارات بعد إعادة تشغيل الهاتف.',
      en: 'Necessary for push delivery consistency across reboots.',
      fr: 'Nécessaire pour le maintien des notifications après redémarrage.',
    },
  },

  'android.permission.WAKE_LOCK': {
    name: 'android.permission.WAKE_LOCK',
    simpleName: 'WAKE_LOCK',
    risk: 'medium',
    category: { ar: 'إبقاء المعالج في وضع التشغيل', en: 'Power Management', fr: 'Gestion de l’énergie' },
    title: { ar: 'منع المعالج من الدخول في وضع السكون المؤقت', en: 'Prevent Phone from Sleeping', fr: 'Empêcher la mise en veille' },
    description: {
      ar: 'يبقي المعالج يعمل لإكمال عملية تنزيل أو معالجة تنبيه عاجل قبل إغلاق الشاشة.',
      en: 'Keeps CPU running to finish short background tasks or audio playback.',
      fr: 'Maintient le processeur actif pour terminer des tâches en arrière-plan.',
    },
    playPolicyNotice: {
      ar: 'يخضع لمراقبة مؤشرات أداء Android Vitals (Excessive Wake Locks).',
      en: 'Monitored under Android Vitals for excessive battery drain.',
      fr: 'Surveillé dans Android Vitals pour prévenir la surconsommation de batterie.',
    },
    commonSdkInjected: ['OneSignal', 'ExoPlayer', 'AdMob'],
    remediationAdvice: {
      ar: 'آمن عند إدارته بشكل سليم عبر مكاتب رسمية.',
      en: 'Standard for push receivers and background synchronization.',
      fr: 'Standard pour la réception des notifications push.',
    },
  },

  'android.permission.FOREGROUND_SERVICE': {
    name: 'android.permission.FOREGROUND_SERVICE',
    simpleName: 'FOREGROUND_SERVICE',
    risk: 'medium',
    category: { ar: 'خدمات الواجهة النشطة (Foreground)', en: 'Foreground Services', fr: 'Services de premier plan' },
    title: { ar: 'تشغيل خدمات مستمرة مع إشعار ثابت في شريط الحالة', en: 'Run Foreground Services', fr: 'Exécuter des services de premier plan' },
    description: {
      ar: 'يسمح بتشغيل مهام طويلة مع إشعار دائم لا يمكن مسحه إلا بانتهاء العملية.',
      en: 'Runs continuous background operations attached to a sticky notification.',
      fr: 'Exécute des tâches continues associées à une notification permanente.',
    },
    playPolicyNotice: {
      ar: 'في Android 14+ يلزم تحديد النوع الدقيق للخدمة (مثل dataSync أو mediaPlayback).',
      en: 'Android 14+ requires declaring a specific foregroundServiceType.',
      fr: 'Android 14+ exige la spécification d’un type de service exact.',
    },
    remediationAdvice: {
      ar: 'تأكد من تحديد foregroundServiceType المناسب في المانيفست.',
      en: 'Ensure proper foreground service types are declared for Android 14 targetSdk.',
      fr: 'Vérifiez la déclaration du foregroundServiceType approprié.',
    },
  },

  // SAFE / NORMAL PERMISSIONS
  'android.permission.INTERNET': {
    name: 'android.permission.INTERNET',
    simpleName: 'INTERNET',
    risk: 'safe',
    category: { ar: 'الاتصال بالإنترنت', en: 'Network Communication', fr: 'Connexion réseau' },
    title: { ar: 'الوصول لشبكة الإنترنت واستقبال البيانات', en: 'Full Network Access', fr: 'Accès réseau complet' },
    description: {
      ar: 'يسمح للتطبيق بفتح اتصالات الشبكة وتحميل صفحات الويب والـ API.',
      en: 'Allows app to open network sockets to connect with web servers.',
      fr: 'Permet à l’application d’établir des connexions réseau.',
    },
    playPolicyNotice: {
      ar: 'إذن عادي وتلقائي (Install-time permission)، لا يتطلب طلب إذن من المستخدم ولا يشكل أي خطورة.',
      en: 'Normal install-time permission, auto-granted, safe for all web and store apps.',
      fr: 'Permission normale accordée à l’installation, sûre pour toutes les applications.',
    },
    remediationAdvice: {
      ar: 'أساسي وحيوي لأي تطبيق ويب أو متجر.',
      en: 'Essential for all mobile and PWA applications.',
      fr: 'Essentiel pour toutes les applications connectées.',
    },
  },

  'android.permission.ACCESS_NETWORK_STATE': {
    name: 'android.permission.ACCESS_NETWORK_STATE',
    simpleName: 'ACCESS_NETWORK_STATE',
    risk: 'safe',
    category: { ar: 'فحص حالة الشبكة', en: 'Network Status', fr: 'État du réseau' },
    title: { ar: 'معرفة ما إذا كان الهاتف متصلاً بالإنترنت (Wi-Fi / 4G / 5G)', en: 'View Network Connections', fr: 'Afficher les connexions réseau' },
    description: {
      ar: 'يتحقق من وجود اتصال بالإنترنت قبل إرسال الطلبات لمنع انهيار التطبيق.',
      en: 'Checks whether device is online and which network adapter is active.',
      fr: 'Vérifie si l’appareil dispose d’un accès Internet actif.',
    },
    playPolicyNotice: {
      ar: 'إذن قياسي آمن تماماً يوصى به لجميع تطبيقات الويب.',
      en: 'Normal permission, 100% compliant and recommended.',
      fr: 'Permission normale entièrement conforme et recommandée.',
    },
    remediationAdvice: {
      ar: 'احتفظ به لتحسين تجربة المستخدم عند انقطاع الإنترنت (Offline mode).',
      en: 'Keep this permission to deliver smooth offline indicators.',
      fr: 'À conserver pour gérer le mode hors-ligne.',
    },
  },

  'android.permission.VIBRATE': {
    name: 'android.permission.VIBRATE',
    simpleName: 'VIBRATE',
    risk: 'safe',
    category: { ar: 'الاهتزاز والتفاعل اللمسي', en: 'Haptic Feedback', fr: 'Vibreur' },
    title: { ar: 'تشغيل محرك الاهتزاز عند النقر أو استقبال إشعار', en: 'Control Vibration', fr: 'Contrôler le vibreur' },
    description: {
      ar: 'يتحكم في اهتزاز الهاتف لتقديم استجابة لمسية (Haptic).',
      en: 'Triggers phone vibration for feedback or alert cues.',
      fr: 'Déclenche le vibreur pour les alertes ou retours haptiques.',
    },
    playPolicyNotice: {
      ar: 'آمن ولا يتطلب أي إفصاح أمني.',
      en: 'Safe normal permission with zero policy friction.',
      fr: 'Permission sûre sans impact sur la conformité.',
    },
    remediationAdvice: {
      ar: 'آمن ولا يحتاج لأي تعديل.',
      en: 'No action required.',
      fr: 'Aucune action requise.',
    },
  },
};

export const POPULAR_SDKS: SdkDefinition[] = [
  {
    id: 'admob',
    name: 'Google Mobile Ads (AdMob)',
    category: 'ads',
    categoryLabel: { ar: 'شبكات الإعلانات', en: 'Ad Networks', fr: 'Réseaux publicitaires' },
    markers: ['com/google/android/gms/ads', 'com.google.android.gms.ads', 'play-services-ads'],
    injectedPermissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'com.google.android.gms.permission.AD_ID',
    ],
    complianceNotes: {
      ar: 'متوافق تماماً مع Google Play 2026 بشرط تفعيل منصة موافقة المستخدمين (Google UMP) وإقرار جمع Advertising ID في استبيان سلامة البيانات Data Safety.',
      en: 'Fully compliant if Google UMP (User Messaging Platform) is implemented for GDPR/CPRA and Advertising ID is declared in Play Console Data Safety.',
      fr: 'Conforme si Google UMP est actif et que l’identifiant publicitaire est déclaré dans Sécurité des données.',
    },
    warningLevel: 'info',
  },
  {
    id: 'onesignal',
    name: 'OneSignal Push Notifications',
    category: 'push',
    categoryLabel: { ar: 'الإشعارات الفورية', en: 'Push Notifications', fr: 'Notifications Push' },
    markers: ['com/onesignal', 'com.onesignal'],
    injectedPermissions: [
      'android.permission.INTERNET',
      'android.permission.WAKE_LOCK',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.POST_NOTIFICATIONS',
    ],
    complianceNotes: {
      ar: 'يحقن أذونات WAKE_LOCK و POST_NOTIFICATIONS تلقائياً. تأكد من إفصاح استبيان Data Safety عن جمع Device or other IDs.',
      en: 'Auto-merges WAKE_LOCK and POST_NOTIFICATIONS. Ensure Device ID collection is declared in Play Console.',
      fr: 'Intègre WAKE_LOCK et POST_NOTIFICATIONS. Déclarez la collecte d’identifiants dans Sécurité des données.',
    },
    warningLevel: 'info',
  },
  {
    id: 'firebase_analytics',
    name: 'Firebase Analytics / Google Analytics',
    category: 'analytics',
    categoryLabel: { ar: 'التحليلات والإحصاء', en: 'Analytics', fr: 'Statistiques' },
    markers: ['com/google/firebase/analytics', 'com.google.firebase.analytics', 'play-services-measurement'],
    injectedPermissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.WAKE_LOCK',
      'com.google.android.gms.permission.AD_ID',
    ],
    complianceNotes: {
      ar: 'يجمع إحصائيات التفاعل ومعرّف الإعلانات. يجب الإفصاح عن البيانات التشخيصية Analytics في Data Safety.',
      en: 'Collects interaction metrics and GAID. Requires Analytics category disclosure in Data Safety.',
      fr: 'Collecte des métriques d’usage et le GAID. Déclaration obligatoire dans Sécurité des données.',
    },
    warningLevel: 'info',
  },
  {
    id: 'firebase_messaging',
    name: 'Firebase Cloud Messaging (FCM)',
    category: 'push',
    categoryLabel: { ar: 'خدمات الرسائل السحابية', en: 'Cloud Messaging', fr: 'Messagerie Cloud' },
    markers: ['com/google/firebase/messaging', 'com.google.firebase.messaging'],
    injectedPermissions: [
      'android.permission.INTERNET',
      'android.permission.WAKE_LOCK',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.POST_NOTIFICATIONS',
    ],
    complianceNotes: {
      ar: 'حزمة رسمية قياسية من جوجل لإرسال الإشعارات. آمنة ومتوافقة 100%.',
      en: 'Official Google push delivery service. Standard and compliant.',
      fr: 'Service de notification officiel Google. Conforme et standard.',
    },
    warningLevel: 'info',
  },
  {
    id: 'facebook_sdk',
    name: 'Meta / Facebook Audience & Graph SDK',
    category: 'ads',
    categoryLabel: { ar: 'إعلانات وتتبع ميتا', en: 'Meta / Facebook SDK', fr: 'SDK Meta / Facebook' },
    markers: ['com/facebook/FacebookSdk', 'com/facebook/ads', 'com.facebook.ads'],
    injectedPermissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'com.google.android.gms.permission.AD_ID',
    ],
    complianceNotes: {
      ar: 'تنبيه: مكاتب Meta قد تحقن أذونات تتبع إعلاني واسعة. تأكد من إقرار مشاركة البيانات مع أطراف ثالثة (Third-party sharing) في سياسة خصوصية متجرك.',
      en: 'Caution: Meta SDK involves third-party ad tracking. Must declare Third-Party Data Sharing in Google Play policy.',
      fr: 'Attention : Déclarez le partage de données avec des tiers dans votre politique de confidentialité.',
    },
    warningLevel: 'warning',
  },
  {
    id: 'unity_ads',
    name: 'Unity Ads / Unity Services',
    category: 'ads',
    categoryLabel: { ar: 'إعلانات الألعاب', en: 'Game Monetization', fr: 'Publicité Jeux' },
    markers: ['com/unity3d/ads', 'com/unity3d/services', 'com.unity3d.services'],
    injectedPermissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
    ],
    complianceNotes: {
      ar: 'متوافق مع ألعاب وتطبيقات الويب. تأكد من تحديد الفئة العمرية (Designed for Families) إذا كان التطبيق موجهاً للأطفال.',
      en: 'Compliant. Ensure COPPA / Families policy configuration if targeting younger audiences.',
      fr: 'Conforme. Vérifiez la conformité avec la politique Famille pour enfants.',
    },
    warningLevel: 'info',
  },
  {
    id: 'applovin',
    name: 'AppLovin MAX Mediation',
    category: 'ads',
    categoryLabel: { ar: 'وساطة الإعلانات', en: 'Ad Mediation', fr: 'Médiation publicitaire' },
    markers: ['com/applovin', 'com.applovin'],
    injectedPermissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'com.google.android.gms.permission.AD_ID',
    ],
    complianceNotes: {
      ar: 'شبكة وساطة إعلانية. تتطلب إفصاحاً عن مزارع الإعلانات المدمجة في Data Safety.',
      en: 'Mediation network. All integrated ad partners must be mirrored in Data Safety.',
      fr: 'Réseau de médiation. Les partenaires tiers doivent être déclarés dans Sécurité des données.',
    },
    warningLevel: 'info',
  },
  {
    id: 'adjust',
    name: 'Adjust Attribution SDK',
    category: 'attribution',
    categoryLabel: { ar: 'تتبع التحويلات والإسناد', en: 'Attribution & Analytics', fr: 'Attribution et conversions' },
    markers: ['com/adjust/sdk', 'com.adjust.sdk'],
    injectedPermissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'com.google.android.gms.permission.AD_ID',
    ],
    complianceNotes: {
      ar: 'حزمة تتبع وإسناد حملات إعلانية. تتطلب إفصاحاً صريحاً عن تتبع المستخدمين عبر تطبيقات أخرى.',
      en: 'Attribution tool. Must declare cross-app tracking in Play Console if used for marketing campaigns.',
      fr: 'Outil d’attribution. Déclarez le suivi multi-applications si utilisé pour le marketing.',
    },
    warningLevel: 'warning',
  },
  {
    id: 'appsflyer',
    name: 'AppsFlyer SDK',
    category: 'attribution',
    categoryLabel: { ar: 'تتبع التحويلات والإسناد', en: 'Attribution & Analytics', fr: 'Attribution et conversions' },
    markers: ['com/appsflyer', 'com.appsflyer'],
    injectedPermissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'com.google.android.gms.permission.AD_ID',
    ],
    complianceNotes: {
      ar: 'حزمة قياس حملات التسويق. متوافقة مع Google Play مع إقرار جمع Device ID.',
      en: 'Marketing analytics SDK. Compliant when Device ID collection is disclosed.',
      fr: 'SDK de mesure marketing. Conforme lorsque la collecte du Device ID est déclarée.',
    },
    warningLevel: 'info',
  },
  {
    id: 'sentry',
    name: 'Sentry Crash & Performance Monitoring',
    category: 'crash',
    categoryLabel: { ar: 'مراقبة الأعطال والأداء', en: 'Crash Diagnostics', fr: 'Diagnostic de pannes' },
    markers: ['io/sentry', 'io.sentry'],
    injectedPermissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
    ],
    complianceNotes: {
      ar: 'أداة تشخيص ممتازة. صرّح بجمع سجلات الأعطال (Crash Logs & Diagnostics) في استبيان الخصوصية.',
      en: 'Diagnostics tool. Declare Crash Logs and Performance Diagnostics in Data Safety.',
      fr: 'Outil de diagnostic. Déclarez les journaux de plantage dans Sécurité des données.',
    },
    warningLevel: 'info',
  },
];
