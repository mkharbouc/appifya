'use client';

import React, { useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n';
import { auditAndroidFile, getDemoAuditResult, type AuditResult, type ParsedPermissionItem } from './apkParser';
import type { RiskLevel } from './permissionsData';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  FileCode,
  FileCheck2,
  Search,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  Info,
  ChevronDown,
  Layers,
  Code2,
  RefreshCw,
  Box,
  Cpu,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

export default function ApkAuditorClient() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | RiskLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [expandedPerm, setExpandedPerm] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (ar: string, en: string, fr: string) => {
    if (lang === 'ar') return ar;
    if (lang === 'fr') return fr;
    return en;
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const result = await auditAndroidFile(file);
      setAuditResult(result);
      setSelectedRiskFilter('all');
      setSearchQuery('');
    } catch (err) {
      console.error('Audit failed:', err);
      setError(
        t(
          'تعذر تحليل الملف. يرجى التأكد من اختيار ملف APK أو AAB أو AndroidManifest.xml صالح.',
          'Failed to analyze file. Please ensure it is a valid APK, AAB, or AndroidManifest.xml.',
          'Échec de l’analyse. Veuillez vous assurer qu’il s’agit d’un fichier APK, AAB ou AndroidManifest.xml valide.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFileUpload(file);
  };

  const loadDemo = (type: 'ecommerce_admob' | 'clean_pwa') => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const demo = getDemoAuditResult(type);
      setAuditResult(demo);
      setSelectedRiskFilter('all');
      setSearchQuery('');
      setLoading(false);
    }, 400);
  };

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadReport = (format: 'md' | 'json') => {
    if (!auditResult) return;

    let content = '';
    let mimeType = 'text/markdown';
    let extension = 'md';

    if (format === 'json') {
      content = JSON.stringify(auditResult, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      content = `# تقرير تدقيق أذونات أندرويد و SDKs (Android Permissions & SDK Audit)
**التطبيق**: ${auditResult.packageName}
**الملف**: ${auditResult.fileName} (${(auditResult.fileSize / (1024 * 1024)).toFixed(2)} MB)
**الحالة**: ${auditResult.status.toUpperCase()} (درجة الامتثال: ${auditResult.complianceScore}/100)
**Target SDK**: ${auditResult.targetSdkVersion} | **Version**: ${auditResult.versionName} (${auditResult.versionCode})

---

## 1. ملخص الأذونات
- الأذونات الحرجة (Critical): ${auditResult.criticalCount}
- عالية الخطورة (High Risk): ${auditResult.highCount}
- متوسطة الخطورة (Medium): ${auditResult.mediumCount}
- آمنة (Normal/Safe): ${auditResult.safeCount}

## 2. قائمة الأذونات المكتشفة:
${auditResult.permissions
  .map(
    (p) => `### ${p.name} [${p.risk.toUpperCase()}]
- **الاسم**: ${p.info.title.ar}
- **التصنيف**: ${p.info.category.ar}
- **سياسة Google Play 2026**: ${p.info.playPolicyNotice.ar}
- **نصيحة المعالجة**: ${p.info.remediationAdvice.ar}
`,
  )
  .join('\n')}

---

## 3. حزم الـ SDK المكتشفة
${
  auditResult.detectedSdks.length === 0
    ? 'لم يتم اكتشاف مكاتب خارجية محقونة.'
    : auditResult.detectedSdks
        .map(
          (d) => `- **${d.sdk.name}** (${d.sdk.category})
  - طريقة الكشف: ${d.detectedVia}
  - تنبيه الامتثال: ${d.sdk.complianceNotes.ar}
`,
        )
        .join('\n')
}

---

## 4. كود إزالة الأذونات الحساسة (AndroidManifest.xml)
\`\`\`xml
${auditResult.remediationSnippet}
\`\`\`

*تم إنشاء التقرير بواسطة أداة Appifya Permissions & SDK Auditor.*
`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permissions-audit-${auditResult.packageName || 'report'}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredPermissions = (auditResult?.permissions || []).filter((p) => {
    const matchesFilter = selectedRiskFilter === 'all' || p.risk === selectedRiskFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.simpleName.toLowerCase().includes(q) ||
      p.info.title.ar.toLowerCase().includes(q) ||
      p.info.title.en.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-10" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── TOP HERO BANNER ── */}
      <section className="text-center space-y-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
          <ShieldAlert className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span>
            {t(
              'أداة فحص أمان أندرويد لـ Google Play 2026',
              'Google Play 2026 Android Permissions & SDK Auditor',
              'Auditeur de permissions Android & SDK pour Google Play 2026',
            )}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          {t(
            'فاحص أذونات التطبيقات والـ SDKs الخفية',
            'AAB / APK Android Permissions & SDK Auditor',
            'Auditeur de Permissions APK / AAB & Détecteur de SDKs',
          )}
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
          {t(
            'اكشف الأذونات الحساسة والمكاتب البرمجية المحقونة بالخفاء (مثل استطلاع التطبيقات أو تحديد الموقع) التي قد تسبب رفض تطبيقك في Google Play. تدقيق فوري 100% داخل المتصفح دون رفع الملف إلى أي خادم!',
            'Identify hidden sensitive permissions and third-party SDKs that trigger Google Play rejections (like QUERY_ALL_PACKAGES or FINE_LOCATION). 100% local in-browser inspection with zero cloud upload.',
            'Détectez les permissions sensibles et SDKs tiers injectés en arrière-plan qui provoquent le rejet sur Google Play. Analyse 100% locale dans votre navigateur.',
          )}
        </p>

        {/* Client-side privacy pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>{t('خصوصية 100% · معالجة عبر JS/WebAssembly محلياً في جهازك', '100% Client-Side Privacy · Processed locally in memory', '100% Privé · Traitement local en mémoire')}</span>
        </div>
      </section>

      {/* ── FILE UPLOAD / DRAG & DROP ZONE ── */}
      <section className="max-w-3xl mx-auto">
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
          }}
          className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
            dragOver
              ? 'border-indigo-400 bg-indigo-500/10 shadow-2xl shadow-indigo-500/20'
              : 'border-slate-800 bg-slate-900/60 hover:border-indigo-500/50 hover:bg-slate-900'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".apk,.aab,.xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFileUpload(file);
            }}
          />

          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white shadow-xl shadow-indigo-500/25">
            {loading ? (
              <RefreshCw className="h-9 w-9 animate-spin text-white" />
            ) : (
              <Upload className="h-9 w-9 text-white" />
            )}
          </div>

          <h3 className="text-lg font-bold text-white mb-1.5">
            {loading
              ? t('جاري فك وقراءة الحزمة محلياً...', 'Parsing manifest & scanning DEX...', 'Décompression et analyse...')
              : t('اسحب وأفلت ملف APK أو AAB هنا', 'Drag and drop your APK or AAB file here', 'Glissez-déposez votre APK ou AAB ici')}
          </h3>

          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
            {t(
              'يدعم ملفات .apk و .aab وكذلك ملفات AndroidManifest.xml المباشرة حتى 200 ميجابايت.',
              'Supports .apk, .aab, and raw AndroidManifest.xml files up to 200MB.',
              'Prend en charge les fichiers .apk, .aab et AndroidManifest.xml bruts jusqu’à 200 Mo.',
            )}
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all">
            <FileCode className="h-4 w-4" />
            <span>{t('تصفح الملفات من جهازك', 'Browse File from Device', 'Parcourir les fichiers')}</span>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}
        </div>

        {/* Quick Demo Pre-sets */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-400">
          <span className="font-semibold text-slate-500">{t('أو جرب عينة بنقرة واحدة:', 'Or test with a sample:', 'Ou testez avec un échantillon :')}</span>
          <button
            type="button"
            onClick={() => loadDemo('ecommerce_admob')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>{t('عينة تطبيق متجر مع إعلانات وحزم تتبع (Risky APK)', 'Sample E-Commerce with AdMob & Tracking', 'Exemple E-Commerce + AdMob')}</span>
          </button>
          <button
            type="button"
            onClick={() => loadDemo('clean_pwa')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t('عينة تطبيق PWA نظيف ومتوافق (Clean AAB)', 'Clean PWA Starter (Compliant)', 'Exemple PWA conforme')}</span>
          </button>
        </div>
      </section>

      {/* ── AUDIT RESULTS DASHBOARD ── */}
      {auditResult && (
        <section className="space-y-8 animate-fade-in max-w-5xl mx-auto">
          {/* Status & Compliance Score Header */}
          <div
            className={`rounded-3xl border p-6 sm:p-8 shadow-2xl ${
              auditResult.status === 'critical'
                ? 'border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950'
                : auditResult.status === 'warning'
                ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950'
                : 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950'
            }`}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-start">
                <div
                  className={`flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl shadow-xl ${
                    auditResult.status === 'critical'
                      ? 'bg-rose-500 text-white shadow-rose-500/30'
                      : auditResult.status === 'warning'
                      ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                      : 'bg-emerald-500 text-white shadow-emerald-500/30'
                  }`}
                >
                  {auditResult.status === 'critical' ? (
                    <ShieldAlert className="h-10 w-10" />
                  ) : auditResult.status === 'warning' ? (
                    <AlertTriangle className="h-10 w-10" />
                  ) : (
                    <ShieldCheck className="h-10 w-10" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        auditResult.status === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : auditResult.status === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {auditResult.status === 'critical'
                        ? t('🚨 خطورة قصوى - يتطلب إجراء فوري', 'Critical Risk - Action Required', 'Risque Critique - Action Requise')
                        : auditResult.status === 'warning'
                        ? t('⚠️ تنبيهات خصوصية ومطابقة', 'Warning - Privacy Review', 'Avertissement - Revue requise')
                        : t('🟢 متوافق 100% مع Google Play', '100% Compliant with Google Play', '100% Conforme Google Play')}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {auditResult.status === 'critical'
                      ? t(
                          'تطبيقك معرض للرفض الفوري في Google Play Console!',
                          'App faces instant Google Play rejection!',
                          'L’application risque un rejet immédiat sur Google Play !',
                        )
                      : auditResult.status === 'warning'
                      ? t(
                          'يحتوي التطبيق على أذونات حساسة تتطلب إفصاحاً في استبيان الخصوصية',
                          'App contains sensitive permissions requiring store disclosure',
                          'L’application contient des permissions sensibles à déclarer',
                        )
                      : t(
                          'تهانينا! حزمتك نظيفة تماماً ولا تحتوي على أذونات خطرة',
                          'Clean app bundle with zero high-risk policy violations',
                          'Félicitations ! Votre package est propre et conforme',
                        )}
                  </h2>

                  <p className="text-xs text-slate-300 max-w-xl">
                    {auditResult.status === 'critical'
                      ? t(
                          'تم اكتشاف أذونات مقيدة (مثل استطلاع كافة التطبيقات QUERY_ALL_PACKAGES). يجب حذفها أو تقديم استئناف معتمد.',
                          'Restricted permissions detected. Must be stripped or formally approved by Google.',
                          'Permissions restreintes détectées. À supprimer ou justifier formellement auprès de Google.',
                        )
                      : auditResult.status === 'warning'
                      ? t(
                          'تأكد من مطابقة أذونات الموقع والإشعارات المكتشفة مع استبيان سلامة البيانات Data Safety.',
                          'Ensure all location or push permissions match your Google Play Data Safety declaration.',
                          'Assurez-vous que les permissions correspondent à votre formulaire Sécurité des données.',
                        )
                      : t(
                          'لا توجد أذونات زائدة أو مكاتب تتبع خفية. تطبيقك جاهز للنشر والموافقة الفورية.',
                          'No excessive permissions or hidden tracking SDKs. Ready for smooth review.',
                          'Aucune permission superflue. Prêt pour une publication sereine.',
                        )}
                  </p>
                </div>
              </div>

              {/* Compliance Gauge Circular Pill */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-950/80 border border-slate-800 p-4 shrink-0 min-w-[130px] text-center">
                <span className="text-3xl font-black text-white font-mono">
                  {auditResult.complianceScore}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                  {t('درجة الامتثال', 'Compliance Score', 'Score de conformité')}
                </span>
              </div>
            </div>

            {/* Warnings list if any */}
            {auditResult.warnings.length > 0 && (
              <div className="mt-5 space-y-2 border-t border-slate-800/80 pt-4 text-xs">
                {auditResult.warnings.map((w) => (
                  <div key={w} className="flex items-start gap-2 text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* App Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase block">{t('نوع الملف', 'File Type', 'Type de fichier')}</span>
              <span className="text-sm font-extrabold text-white font-mono uppercase flex items-center gap-1.5">
                <Box className="h-3.5 w-3.5 text-indigo-400" />
                <span>{auditResult.fileType}</span>
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase block">{t('الحجم', 'File Size', 'Taille')}</span>
              <span className="text-sm font-extrabold text-white font-mono">
                {(auditResult.fileSize / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase block">{t('Package Name', 'Package Name', 'Nom du paquet')}</span>
              <span className="text-xs font-bold text-indigo-300 font-mono truncate block" title={auditResult.packageName}>
                {auditResult.packageName}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase block">{t('الإصدار', 'Version', 'Version')}</span>
              <span className="text-sm font-extrabold text-white font-mono">
                v{auditResult.versionName} ({auditResult.versionCode})
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase block">{t('Target SDK (2026)', 'Target SDK', 'SDK Cible')}</span>
              <span className={`text-sm font-extrabold font-mono flex items-center gap-1 ${
                auditResult.isTargetSdkCompliant ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {auditResult.isTargetSdkCompliant ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                <span>API {auditResult.targetSdkVersion}</span>
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase block">{t('إجمالي الأذونات', 'Total Permissions', 'Total Permissions')}</span>
              <span className="text-sm font-extrabold text-cyan-400 font-mono">
                {auditResult.permissions.length} {t('إذن', 'perms', 'perms')}
              </span>
            </div>
          </div>

          {/* ── DETECTED SDKs SECTION ── */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-indigo-400" />
                  <span>{t('حزم ومكتبات الطرف الثالث المكتشفة (Third-Party SDKs)', 'Detected Third-Party SDKs', 'SDKs Tiers Détectés')}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t(
                    'المكاتب المدمجة في كود الـ Bytecode التي قد تحقن أذونات وتجمع بيانات للمعلنين.',
                    'Libraries embedded in bytecode that may auto-merge permissions and collect analytics.',
                    'Bibliothèques incluses qui peuvent injecter des permissions et collecter des données.',
                  )}
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                {auditResult.detectedSdks.length} {t('حزم مكتشفة', 'SDKs found', 'SDKs détectés')}
              </span>
            </div>

            {auditResult.detectedSdks.length === 0 ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-3">
                <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>
                  {t(
                    'ممتاز! لم يتم رصد أي حزم تتبع ثقيلة أو مكاتب خارجية محقونة بالخفاء داخل ملفات الحزمة.',
                    'Clean! No third-party ad networks or hidden tracking SDKs were found in the archive.',
                    'Parfait ! Aucun réseau publicitaire ou SDK tiers lourd n’a été détecté dans l’archive.',
                  )}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auditResult.detectedSdks.map(({ sdk, detectedVia }) => (
                  <div
                    key={sdk.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{sdk.name}</h4>
                        <span className="text-[10px] text-indigo-400 font-mono block mt-0.5">
                          {sdk.categoryLabel[lang] || sdk.categoryLabel.en} · {detectedVia}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          sdk.warningLevel === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {sdk.category}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {sdk.complianceNotes[lang] || sdk.complianceNotes.en}
                      </p>

                      <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-1 text-[10px]">
                        <span className="text-slate-500 font-semibold">{t('الأذونات المحقونة عادة:', 'Injected perms:', 'Permissions injectées :')}</span>
                        {sdk.injectedPermissions.map((perm) => (
                          <span key={perm} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                            {perm.split('.').pop()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Direct Link to Data Safety Generator */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-indigo-300">
                <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>
                  {t(
                    'هل ترغب بتوليد إجابات دقيقة لاستبيان Google Play Data Safety لجميع هذه المكاتب؟',
                    'Want to generate exact Google Play Data Safety answers for these SDKs?',
                    'Voulez-vous générer les réponses Sécurité des données pour ces SDKs ?',
                  )}
                </span>
              </div>
              <Link
                href="/tools/play-data-safety"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition-colors flex items-center gap-1.5"
              >
                <span>{t('توليد استبيان الخصوصية', 'Open Data Safety Tool', 'Ouvrir Sécurité Données')}</span>
                <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>

          {/* ── PERMISSIONS AUDIT & FILTERING SECTION ── */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-7 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-400" />
                  <span>{t('تفاصيل الأذونات ومستوى الخطورة (Permissions Audit)', 'Permissions Breakdown & Policy Risks', 'Détail des Permissions & Risques')}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t(
                    'راجع كل إذن مصرح به وتعرف على متطلبات جوجل لتفادي تعليق التطبيق.',
                    'Inspect declared permissions and Google Play 2026 enforcement rules.',
                    'Inspectez chaque permission et les exigences Google Play 2026.',
                  )}
                </p>
              </div>

              {/* Search input */}
              <div className="relative min-w-[240px]">
                <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-slate-500`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('ابحث عن إذن...', 'Search permission...', 'Rechercher une permission...')}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl py-2 ${
                    isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                  } text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500`}
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedRiskFilter('all')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                  selectedRiskFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t('الكل', 'All', 'Tous')} ({auditResult.permissions.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedRiskFilter('critical')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                  selectedRiskFilter === 'critical'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-rose-400 hover:border-rose-500/50'
                }`}
              >
                <span>🚨 {t('حرج', 'Critical', 'Critique')}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-[10px]">{auditResult.criticalCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRiskFilter('high')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                  selectedRiskFilter === 'high'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-amber-400 hover:border-amber-500/50'
                }`}
              >
                <span>⚠️ {t('عالي الخطورة', 'High', 'Élevé')}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[10px]">{auditResult.highCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRiskFilter('medium')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                  selectedRiskFilter === 'medium'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-indigo-400 hover:border-indigo-500/50'
                }`}
              >
                <span>⚡ {t('متوسط', 'Medium', 'Moyen')}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-[10px]">{auditResult.mediumCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRiskFilter('safe')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                  selectedRiskFilter === 'safe'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-emerald-400 hover:border-emerald-500/50'
                }`}
              >
                <span>🟢 {t('آمن / عادي', 'Safe / Normal', 'Sûr')}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[10px]">{auditResult.safeCount}</span>
              </button>
            </div>

            {/* Permissions List */}
            <div className="space-y-3">
              {filteredPermissions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  {t('لا توجد أذونات تطابق خيارات التصفية الحالية.', 'No permissions match current filter.', 'Aucune permission ne correspond au filtre.')}
                </div>
              ) : (
                filteredPermissions.map((p) => {
                  const isExpanded = expandedPerm === p.name;
                  return (
                    <div
                      key={p.name}
                      className={`rounded-2xl border transition-all ${
                        p.risk === 'critical'
                          ? 'border-rose-500/40 bg-rose-950/15'
                          : p.risk === 'high'
                          ? 'border-amber-500/30 bg-amber-950/15'
                          : p.risk === 'medium'
                          ? 'border-slate-800 bg-slate-950 hover:border-slate-700'
                          : 'border-slate-800/80 bg-slate-950/60'
                      }`}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedPerm(isExpanded ? null : p.name)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setExpandedPerm(isExpanded ? null : p.name);
                        }}
                        className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                p.risk === 'critical'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : p.risk === 'high'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : p.risk === 'medium'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {p.risk === 'critical'
                                ? t('🚨 حرج (رفض فوري)', 'Critical Rejection Risk', 'Risque Critique')
                                : p.risk === 'high'
                                ? t('⚠️ عالي الخطورة', 'High Risk', 'Haut Risque')
                                : p.risk === 'medium'
                                ? t('⚡ متوسط', 'Medium Risk', 'Risque Moyen')
                                : t('🟢 آمن', 'Normal Permission', 'Permission Normale')}
                            </span>

                            <span className="text-[11px] text-slate-400 font-semibold">
                              {p.info.category[lang] || p.info.category.en}
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-white font-mono break-all">{p.name}</h4>
                          <p className="text-xs text-slate-300">{p.info.title[lang] || p.info.title.en}</p>
                        </div>

                        <ChevronDown
                          className={`h-5 w-5 text-slate-400 shrink-0 transition-transform ${
                            isExpanded ? 'rotate-180 text-white' : ''
                          }`}
                        />
                      </div>

                      {/* Expanded Details Accordion */}
                      {isExpanded && (
                        <div className="px-4 pb-5 sm:px-5 space-y-4 border-t border-slate-800/80 pt-4 text-xs">
                          <div>
                            <span className="text-slate-400 font-semibold block mb-1">{t('ماذا يفعل هذا الإذن؟', 'Permission Purpose:', 'Rôle de la permission :')}</span>
                            <p className="text-slate-300 leading-relaxed">{p.info.description[lang] || p.info.description.en}</p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                            <span className="text-amber-400 font-bold flex items-center gap-1.5">
                              <Info className="h-4 w-4" />
                              <span>{t('سياسة متجر Google Play 2026:', 'Google Play 2026 Enforcement:', 'Règlementation Google Play 2026 :')}</span>
                            </span>
                            <p className="text-slate-300 leading-relaxed text-[11px]">
                              {p.info.playPolicyNotice[lang] || p.info.playPolicyNotice.en}
                            </p>
                          </div>

                          {p.info.commonSdkInjected && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-slate-400 font-semibold">{t('يتم حقنه غالباً عبر:', 'Commonly injected by:', 'Souvent injecté par :')}</span>
                              {p.info.commonSdkInjected.map((sdk) => (
                                <span key={sdk} className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono">
                                  {sdk}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                              <Check className="h-4 w-4" />
                              <span>{t('نصيحة المعالجة والحل:', 'Remediation Advice:', 'Conseil de remédiation :')}</span>
                            </span>
                            <p className="text-slate-200 leading-relaxed text-[11px]">
                              {p.info.remediationAdvice[lang] || p.info.remediationAdvice.en}
                            </p>
                          </div>

                          {/* Quick Removal Line */}
                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2" dir="ltr">
                            <code className="text-[11px] font-mono text-cyan-300 select-all truncate">
                              {`<uses-permission android:name="${p.name}" tools:node="remove" />`}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(`<uses-permission android:name="${p.name}" tools:node="remove" />`)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold cursor-pointer shrink-0 transition-colors"
                            >
                              {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── ACTIONABLE REMOVAL SNIPPET & EXPORT ── */}
          <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/80 p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-cyan-400" />
                  <span>{t('كود حذف الأذونات الحساسة (AndroidManifest.xml)', 'Remediation XML Snippet', 'Extrait XML de Suppression')}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t(
                    'انسخ هذا الكود وضعه في ملف AndroidManifest.xml لإلغاء دمج الأذونات غير المرغوبة من مكاتب الطرف الثالث.',
                    'Paste this snippet in your AndroidManifest.xml to force-remove unwanted permissions injected by dependencies.',
                    'Collez cet extrait dans votre AndroidManifest.xml pour supprimer les permissions indésirables.',
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(auditResult.remediationSnippet)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? t('تم النسخ!', 'Copied!', 'Copié !') : t('نسخ الكود', 'Copy Snippet', 'Copier')}</span>
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 overflow-x-auto" dir="ltr">
              <pre className="text-xs font-mono text-indigo-300 leading-relaxed">
                <code>{auditResult.remediationSnippet}</code>
              </pre>
            </div>

            {/* Export Report Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-400">
                {t(
                  'احفظ نسخة من تقرير الفحص لأرشفة المتجر أو تسليمها لمطوري فريقك.',
                  'Export report for your compliance records or team review.',
                  'Exportez le rapport pour vos dossiers de conformité.',
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadReport('md')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{t('تنزيل تقرير Markdown (.md)', 'Export Markdown (.md)', 'Télécharger Markdown')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadReport('json')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-amber-400" />
                  <span>{t('تنزيل JSON (.json)', 'Export JSON (.json)', 'Télécharger JSON')}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── EDUCATIONAL FAQ / GOOGLE PLAY POLICY GUIDE ── */}
      <section className="max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2 mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {t('دليل سياسات متجر Google Play للأذونات 2026', 'Google Play 2026 Permissions Enforcement Guide', 'Guide des Permissions Google Play 2026')}
          </h3>
          <p className="text-xs text-slate-400">
            {t(
              'أهم أسباب رفض التطبيقات وكيف تضمن قبول حزمتك من المرة الأولى.',
              'Crucial reasons for app rejections and how to guarantee first-time store approval.',
              'Les motifs fréquents de refus et comment garantir l’approbation de votre application.',
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>{t('لماذا ترفض جوجل إذن QUERY_ALL_PACKAGES؟', 'Why is QUERY_ALL_PACKAGES banned?', 'Pourquoi QUERY_ALL_PACKAGES est-il rejeté ?')}</span>
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {t(
                'تعتبر جوجل استطلاع كافة التطبيقات انتهاكاً لخصوصية العميل. التطبيقات العادية لا يسمح لها باستخدامه ويجب استبداله بعنصر <queries> مع تحديد حزم التطبيقات المطلوبة فقط.',
                'Querying all installed apps is considered a severe privacy violation. Apps must specify target packages explicitly via the <queries> manifest block.',
                'L’interrogation de toutes les applications est jugée abusive. Utilisez l’élément <queries> pour cibler uniquement les paquets nécessaires.',
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-300 flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              <span>{t('كيف تحقن المكاتب أذونات دون علمك؟', 'How do SDKs inject permissions silently?', 'Comment les SDKs injectent-ils des permissions ?')}</span>
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {t(
                'يقوم مجمع أندرويد (Manifest Merger) بدمج ملفات الـ Manifest التابعة لكل مكتبة خارجية في ملف التطبيق النهائي تلقائياً. لذلك فإن حزمة إعلانات قد تضيف إذن الموقع GPS دون أن تطلبه أنت!',
                'The Android Manifest Merger combines all dependency manifests into the final APK. An ad or tracking SDK can easily inject GPS or storage permissions automatically.',
                'Le Manifest Merger d’Android fusionne automatiquement les manifestes des dépendances, ce qui peut ajouter des permissions inattendues.',
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-emerald-300 flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>{t('بديل إذن قراءة الصور READ_MEDIA_IMAGES', 'Android Photo Picker Alternative', 'Alternative au Photo Picker Android')}</span>
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {t(
                'بدءاً من أندرويد 13+ وسياسات 2026، ترفض جوجل طلب إذن قراءة الصور بالكامل. البديل هو منتقي الصور المدمج (Android Photo Picker) الذي يتيح للمستخدم اختيار الصور دون أي أذونات مانيفست.',
                'Google Play strongly favors the system Photo Picker contract, which requires zero manifest permissions and avoids user data safety flags.',
                'Google Play privilégie le Photo Picker officiel qui ne nécessite aucune permission dans le manifeste.',
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-indigo-300 flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>{t('كيف تزيل الإذن المحقون؟', 'How to force-strip an injected permission?', 'Comment supprimer une permission injectée ?')}</span>
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {t(
                'أضف السطر: <uses-permission android:name="..." tools:node="remove" /> في المانيفست الرئيسي لمشروعك، ليقوم المعالج بحذفه نهائياً من الـ APK النهائي.',
                'Simply declare the permission in your root AndroidManifest.xml with tools:node="remove" to override and strip dependency injections.',
                'Déclarez la permission avec l’attribut tools:node="remove" dans votre manifeste racine.',
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
