'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n';
import type { CheckResponse, CheckResult } from '../../api/pwa-checker/route';
import {
  Gauge,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileCode,
  ImageIcon,
  Loader2,
  RotateCcw,
  Zap,
  ExternalLink,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Score ring (SVG)
// ---------------------------------------------------------------------------
function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const progress = circ - (score / 100) * circ;

  const color =
    score >= 80 ? '#10b981' :
    score >= 50 ? '#f59e0b' :
    '#ef4444';

  const label =
    score >= 80 ? 'Great' :
    score >= 50 ? 'Needs work' :
    'Poor';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ marginTop: '-4px' }}>
        <span className="text-3xl font-black text-white">{score}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status icon
// ---------------------------------------------------------------------------
function StatusIcon({ status }: { status: CheckResult['status'] }) {
  if (status === 'pass')    return <CheckCircle2  className="h-4 w-4 text-emerald-400 shrink-0" />;
  if (status === 'fail')    return <XCircle       className="h-4 w-4 text-red-400    shrink-0" />;
  if (status === 'warn')    return <AlertTriangle className="h-4 w-4 text-amber-400  shrink-0" />;
  return                           <MinusCircle   className="h-4 w-4 text-slate-500  shrink-0" />;
}

const STATUS_COLORS: Record<CheckResult['status'], string> = {
  pass:    'border-emerald-500/20 bg-emerald-500/5',
  fail:    'border-red-500/20    bg-red-500/5',
  warn:    'border-amber-500/20  bg-amber-500/5',
  blocked: 'border-slate-700    bg-slate-900/40',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function PwaCheckerClient() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  const [inputUrl, setInputUrl] = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult]     = useState<CheckResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------------------
  // Run check
  // -------------------------------------------------------------------------
  const runCheck = async (urlOverride?: string) => {
    const raw = (urlOverride ?? inputUrl).trim();
    if (!raw) { inputRef.current?.focus(); return; }

    setStatus('loading');
    setResult(null);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/pwa-checker?url=${encodeURIComponent(raw)}`);
      const data: CheckResponse = await res.json();

      if (!data.fetchedOk && data.error) {
        setErrorMsg(data.error);
        setStatus('error');
        return;
      }

      setResult(data);
      setStatus('done');
    } catch {
      setErrorMsg(
        lang === 'ar' ? 'حدث خطأ غير متوقع. يرجى المحاولة مجدداً.' :
        lang === 'fr' ? 'Une erreur inattendue est survenue. Veuillez réessayer.' :
        'An unexpected error occurred. Please try again.'
      );
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
    setInputUrl('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // -------------------------------------------------------------------------
  // Labels
  // -------------------------------------------------------------------------
  const L = {
    badge:       lang === 'ar' ? 'مجاني • نتائج فورية' : lang === 'fr' ? 'Gratuit • Résultats instantanés' : 'Free • Instant results',
    headline:    lang === 'ar'
      ? <><span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">فاحص جاهزية</span> تطبيق PWA</>
      : lang === 'fr'
      ? <>Vérificateur de <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Compatibilité PWA</span></>
      : <>PWA <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Readiness Checker</span></>,
    sub:         lang === 'ar'
      ? 'الصق رابط موقعك واكتشف فوراً مدى جاهزيته ليصبح تطبيق PWA. نفحص HTTPS، manifest، service worker، viewport، وأكثر — مع اقتراحات إصلاح لكل فحص.'
      : lang === 'fr'
      ? 'Collez l\'URL de votre site et découvrez instantanément s\'il est prêt pour une PWA : HTTPS, manifest, service worker, viewport et plus — avec des suggestions de correction.'
      : 'Paste your site URL and instantly see how PWA-ready it is. We check HTTPS, manifest, service worker, viewport, theme color, and more — with a fix suggestion for every failure.',
    placeholder: lang === 'ar' ? 'https://متجرك.com' : lang === 'fr' ? 'https://votre-site.com' : 'https://your-site.com',
    checkBtn:    lang === 'ar' ? 'فحص الآن' : lang === 'fr' ? 'Vérifier' : 'Check Now',
    checking:    lang === 'ar' ? 'جارٍ الفحص…' : lang === 'fr' ? 'Vérification…' : 'Checking…',
    checkAnother: lang === 'ar' ? 'فحص موقع آخر' : lang === 'fr' ? 'Vérifier un autre site' : 'Check another site',
    scoreTitle:  lang === 'ar' ? 'نتيجة الجاهزية' : lang === 'fr' ? 'Score de compatibilité' : 'Readiness Score',
    passCount:   (n: number) => lang === 'ar' ? `${n} اجتاز` : lang === 'fr' ? `${n} réussi` : `${n} passed`,
    failCount:   (n: number) => lang === 'ar' ? `${n} فشل` : lang === 'fr' ? `${n} échoué` : `${n} failed`,
    warnCount:   (n: number) => lang === 'ar' ? `${n} تحذير` : lang === 'fr' ? `${n} avertissement` : `${n} warning`,
    fixSuggestion: lang === 'ar' ? 'الإصلاح المقترح:' : lang === 'fr' ? 'Suggestion :' : 'Fix:',
    upsellTitle: lang === 'ar' ? 'جاهز لتحويل موقعك إلى تطبيق كامل؟' : lang === 'fr' ? 'Prêt à transformer votre site en app ?' : 'Ready to turn your site into a full app?',
    upsellBody:  lang === 'ar'
      ? 'Appifya يعتني بكل شيء — manifest، service worker، أيقونات، AdMob، وتصدير APK — في خطوات بسيطة.'
      : lang === 'fr'
      ? 'Appifya s\'occupe de tout — manifest, service worker, icônes, AdMob et export APK — en quelques étapes.'
      : 'Appifya handles everything — manifest, service worker, icons, AdMob, and APK export — in a few guided steps.',
    upsellCta:   lang === 'ar' ? 'ابدأ مع Appifya مجاناً' : lang === 'fr' ? 'Démarrer avec Appifya' : 'Start with Appifya — free',
    tryExample:  lang === 'ar' ? 'جرّب مثالاً:' : lang === 'fr' ? 'Essayer un exemple :' : 'Try an example:',
    faqTitle:    lang === 'ar' ? 'أسئلة شائعة' : lang === 'fr' ? 'Questions fréquentes' : 'Frequently Asked Questions',
    checksTitle: lang === 'ar' ? 'نتائج الفحص' : lang === 'fr' ? 'Résultats des vérifications' : 'Check Results',
  };

  // -------------------------------------------------------------------------
  // Summary counts
  // -------------------------------------------------------------------------
  const passes  = result?.checks.filter(c => c.status === 'pass').length  ?? 0;
  const fails   = result?.checks.filter(c => c.status === 'fail').length  ?? 0;
  const warns   = result?.checks.filter(c => c.status === 'warn').length  ?? 0;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <main className="site-main flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ── Header ── */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-300 mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{L.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">{L.headline}</h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">{L.sub}</p>
      </div>

      {/* ── URL input card ── */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
          <form
            onSubmit={(e) => { e.preventDefault(); runCheck(); }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                ref={inputRef}
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder={L.placeholder}
                dir="ltr"
                disabled={status === 'loading'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-10 pe-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                aria-label={L.placeholder}
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || !inputUrl.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
            >
              {status === 'loading'
                ? <><Loader2 className="h-4 w-4 animate-spin" /><span>{L.checking}</span></>
                : <><Gauge className="h-4 w-4" /><span>{L.checkBtn}</span></>
              }
            </button>
          </form>

          {/* Example links */}
          {status === 'idle' && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{L.tryExample}</span>
              {['web.dev', 'appifya.app'].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => { setInputUrl(`https://${ex}`); runCheck(`https://${ex}`); }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer font-mono"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Error state ── */}
      {status === 'error' && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
            <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-300 mb-1">
                {lang === 'ar' ? 'تعذّر الفحص' : lang === 'fr' ? 'Vérification impossible' : 'Check failed'}
              </p>
              <p className="text-xs text-red-400/80">{errorMsg}</p>
            </div>
            <button type="button" onClick={reset} className="shrink-0 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 cursor-pointer">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {status === 'done' && result && (
        <div className="space-y-6">

          {/* Score + summary row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">

            {/* Score ring */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center gap-1 bg-slate-900/80 border border-slate-800 rounded-3xl p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{L.scoreTitle}</p>
              <div className="relative flex items-center justify-center">
                <ScoreRing score={result.score} />
              </div>
              <div className="mt-4 flex gap-4 text-xs font-bold">
                <span className="text-emerald-400">{L.passCount(passes)}</span>
                {warns > 0 && <span className="text-amber-400">{L.warnCount(warns)}</span>}
                {fails > 0 && <span className="text-red-400">{L.failCount(fails)}</span>}
              </div>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors truncate max-w-[180px]"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate">{result.url.replace(/^https?:\/\//, '')}</span>
              </a>
            </div>

            {/* Check list */}
            <div className="sm:col-span-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">{L.checksTitle}</p>
              {result.checks.map((check) => (
                <details
                  key={check.id}
                  className={`group rounded-2xl border p-4 transition-colors ${STATUS_COLORS[check.status]}`}
                  open={check.status === 'fail'}
                >
                  <summary className="flex items-center gap-3 cursor-pointer list-none marker:hidden">
                    <StatusIcon status={check.status} />
                    <span className="flex-1 text-sm font-semibold text-white">{check.label}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                      ${check.status === 'pass'    ? 'bg-emerald-500/20 text-emerald-400' :
                        check.status === 'fail'    ? 'bg-red-500/20 text-red-400' :
                        check.status === 'warn'    ? 'bg-amber-500/20 text-amber-400' :
                                                     'bg-slate-700 text-slate-400'}`}>
                      {check.status}
                    </span>
                  </summary>
                  <div className="mt-3 ps-7 space-y-2">
                    <p className="text-xs text-slate-400 leading-relaxed">{check.detail}</p>
                    {check.fix && (
                      <div className="rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2">
                        <p className="text-[11px] text-slate-300">
                          <span className="font-bold text-indigo-400">{L.fixSuggestion} </span>
                          {check.fix}
                        </p>
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Cross-links to tools */}
          {(fails > 0 || warns > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.checks.some(c => c.id === 'manifest' && c.status !== 'pass') && (
                <Link
                  href="/tools/manifest-generator"
                  className="flex items-center gap-4 rounded-2xl border border-indigo-500/25 bg-indigo-500/5 hover:bg-indigo-500/10 p-4 transition-colors group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/20">
                    <FileCode className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">
                      {lang === 'ar' ? 'إنشاء manifest.json' : lang === 'fr' ? 'Créer un manifest.json' : 'Create a manifest.json'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'ar' ? 'استخدم مولّد Manifest المجاني' : lang === 'fr' ? 'Utilisez le Générateur Manifest' : 'Use the free Manifest Generator'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-indigo-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
              {result.checks.some(c => (c.id === 'apple-touch-icon' || c.id === 'favicon') && c.status !== 'pass') && (
                <Link
                  href="/tools/icon-generator"
                  className="flex items-center gap-4 rounded-2xl border border-purple-500/25 bg-purple-500/5 hover:bg-purple-500/10 p-4 transition-colors group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/20">
                    <ImageIcon className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">
                      {lang === 'ar' ? 'توليد أيقونات التطبيق' : lang === 'fr' ? 'Générer les icônes' : 'Generate app icons'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'ar' ? 'استخدم مولّد الأيقونات المجاني' : lang === 'fr' ? 'Utilisez le Générateur d\'icônes' : 'Use the free Icon Generator'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-purple-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>
          )}

          {/* Upsell */}
          <div className="rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950 via-slate-950 to-pink-950 p-8 relative overflow-hidden">
            <div className="absolute -end-10 -bottom-10 h-36 w-36 rounded-full bg-pink-500/10 blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-white/5 px-3 py-1 text-xs font-bold text-indigo-200">
                <Zap className="h-3.5 w-3.5" />
                <span>{L.upsellTitle}</span>
              </div>
              <p className="text-sm text-slate-300 max-w-lg mb-5 leading-relaxed">{L.upsellBody}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-indigo-950 shadow-lg hover:bg-indigo-50 transition"
              >
                <span>{L.upsellCta}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Check another */}
          <div className="text-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{L.checkAnother}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── FAQ ── */}
      <section className="mt-24 max-w-3xl mx-auto space-y-10" aria-labelledby="faq-heading">
        <div className="text-center">
          <HelpCircle className="mx-auto mb-3 h-7 w-7 text-indigo-400" />
          <h2 id="faq-heading" className="text-2xl font-black text-white sm:text-3xl">{L.faqTitle}</h2>
        </div>

        <div className="space-y-3">
          {(lang === 'ar' ? [
            ['ماذا يفحص هذا الأداة؟', 'نفحص المتطلبات الأساسية لتطبيق PWA: HTTPS، وجود manifest.json، تسجيل service worker، وسم viewport، لون التيمة (theme-color)، Apple touch icon، وfavicon. لكل فحص حالة (نجاح / تحذير / فشل) مع اقتراح إصلاح محدد.'],
            ['لماذا فشل فحص service worker؟', 'يبحث الفاحص عن استدعاء serviceWorker.register() في مصدر HTML للصفحة. إذا كان موقعك يسجّل الـ service worker في ملف JS منفصل أو بعد التحميل، قد لا يُكتشف. يمكنك إضافته يدوياً أو استخدام Appifya الذي يولّده تلقائياً.'],
            ['موقعي يستخدم HTTPS لكن الفحص فشل — لماذا؟', 'بعض المواقع تحجب الطلبات الخارجية (CORS، جدران الحماية، Cloudflare). إذا تعذّر الوصول إلى موقعك، يظهر الفحص كـ "محجوب" لا "فاشل"، وحالة HTTPS الفعلية لموقعك لا تزال صحيحة.'],
            ['ما هو web app manifest ولماذا هو مهم؟', 'هو ملف JSON (manifest.json) يخبر المتصفح باسم التطبيق وأيقوناته ولون تيمته وطريقة عرضه. بدونه لا يمكن للمتصفح عرض نافذة "أضف إلى الشاشة الرئيسية" ولا يمكن تثبيت الموقع كـ PWA.'],
            ['كيف أصلح المشاكل التي يجدها الفاحص؟', 'كل فحص فاشل يتضمن اقتراح إصلاح محدداً. للـ manifest المفقود استخدم مولّد Manifest. للأيقونات المفقودة استخدم مولّد الأيقونات. لإعداد PWA متكامل مع service worker وتصدير APK استخدم منصة Appifya.'],
          ] : lang === 'fr' ? [
            ['Que vérifie cet outil ?', 'Nous vérifions les exigences fondamentales d\'une PWA : HTTPS, présence du manifest.json, enregistrement du service worker, balise viewport, couleur de thème, apple-touch-icon et favicon. Chaque vérification indique succès, avertissement ou échec, avec une suggestion de correction.'],
            ['Pourquoi le service worker est-il en échec ?', 'L\'outil recherche un appel serviceWorker.register() dans le HTML de la page. Si votre site l\'enregistre dans un fichier JS séparé ou après chargement, il peut ne pas être détecté. Vous pouvez l\'ajouter manuellement ou utiliser Appifya qui le génère automatiquement.'],
            ['Mon site utilise HTTPS mais le test échoue — pourquoi ?', 'Certains sites bloquent les requêtes externes (CORS, pare-feu, protection Cloudflare). Si notre vérificateur ne peut pas accéder à votre page, il indique "bloqué" et non "échec". Le statut HTTPS réel de votre site reste valide.'],
            ['Qu\'est-ce qu\'un web app manifest ?', 'C\'est un fichier JSON (manifest.json) qui indique au navigateur le nom, les icônes, la couleur de thème et le mode d\'affichage de votre app. Sans lui, le navigateur ne peut pas proposer "Ajouter à l\'écran d\'accueil" et le site ne peut pas être installé comme PWA.'],
            ['Comment corriger les problèmes détectés ?', 'Chaque vérification en échec inclut une suggestion de correction. Pour un manifest manquant, utilisez le Générateur Manifest. Pour des icônes manquantes, utilisez le Générateur d\'icônes. Pour une configuration PWA complète avec service worker et export APK, utilisez Appifya.'],
          ] : [
            ['What does the checker test?', 'We check the core PWA requirements: HTTPS, a linked manifest.json, service worker registration, a viewport meta tag, theme-color, Apple touch icon, and favicon. Each check returns pass, warn, or fail with a specific fix suggestion.'],
            ['Why does the service worker check fail?', 'The checker looks for a serviceWorker.register() call in the page\'s HTML source. If your site registers it in a separate JS bundle or after runtime execution, it may not be detected. Add it inline or use Appifya, which generates one automatically.'],
            ['My site uses HTTPS but the check failed — why?', 'Some sites block external requests via CORS policies, firewalls, or Cloudflare bot protection. When the checker can\'t reach your page it reports "blocked" rather than "fail," and your actual HTTPS status is still valid.'],
            ['What is a web app manifest?', 'It\'s a JSON file (manifest.json) that tells the browser your app\'s name, icons, theme color, and display mode. Without it, browsers can\'t offer an "Add to Home Screen" prompt and your site can\'t be installed as a PWA.'],
            ['How do I fix the issues found?', 'Each failed check includes a specific fix suggestion. For a missing manifest, use the Manifest Generator. For missing icons, use the Icon Generator. For a full PWA setup with service worker and APK export, use the Appifya builder.'],
          ]).map(([q, a]) => (
            <details key={q} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <summary className="cursor-pointer list-none font-bold text-white marker:hidden">
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
