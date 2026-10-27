'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  Briefcase,
  Layers,
  ArrowRight,
  Loader2,
  DollarSign,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/app/lib/i18n';
import {
  PAYPAL_EMAIL,
  PLAN_PRICES,
  ADDON_PRICES,
  activateUserSubscription,
  addAppBuildCredits,
  getPayPalCheckoutUrl,
  type PlanType,
} from '@/lib/subscription';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (plan: PlanType) => void;
  defaultPlan?: 'standard' | 'agency';
  appId?: string;
}

export default function PlanUpgradeModal({
  isOpen,
  onClose,
  onSuccess,
  defaultPlan = 'standard',
  appId,
}: PlanUpgradeModalProps) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  const t = (ar: string, fr: string, en: string) => {
    if (lang === 'ar') return ar;
    if (lang === 'fr') return fr;
    return en;
  };

  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'agency'>(defaultPlan);
  const [includeAdmobSetup, setIncludeAdmobSetup] = useState(false);
  const [includeAssetLinks, setIncludeAssetLinks] = useState(false);
  const [includeExtraBuilds, setIncludeExtraBuilds] = useState(false);
  const [txnInput, setTxnInput] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate dynamic total price
  const basePrice = PLAN_PRICES[selectedPlan];
  const addonsTotal =
    (includeAdmobSetup ? ADDON_PRICES.admob_setup : 0) +
    (includeAssetLinks ? ADDON_PRICES.assetlinks : 0) +
    (includeExtraBuilds ? ADDON_PRICES.build_reset : 0);
  const totalPrice = basePrice + addonsTotal;

  // Dynamic Item Title for PayPal Checkout
  const planLabel = selectedPlan === 'agency' ? 'Appifya Agency Pack (5 Apps)' : 'Appifya Standard Pro (1 App)';
  const addonsList: string[] = [];
  if (includeAdmobSetup) addonsList.push('+AdMob Setup');
  if (includeAssetLinks) addonsList.push('+AssetLinks');
  if (includeExtraBuilds) addonsList.push('+Extra Builds');
  const itemName = `${planLabel} ${addonsList.join(' ')}`.trim();

  const checkoutUrl = getPayPalCheckoutUrl(totalPrice, itemName);

  const copyEmail = () => {
    navigator.clipboard.writeText(PAYPAL_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#38bdf8'],
      });
    } catch {
      // safe fallback
    }
  };

  const handleConfirmActivation = () => {
    if (!user) {
      setErrorMsg(
        t('يرجى تسجيل الدخول أولاً لإتمام التفعيل.', 'Veuillez vous connecter.', 'Please sign in first.')
      );
      return;
    }

    if (!txnInput.trim()) {
      setErrorMsg(
        t(
          'يرجى إدخال رقم المعاملة (Transaction ID) أو بريد PayPal المُرسل منه.',
          'Veuillez saisir l’identifiant de transaction ou votre email PayPal.',
          'Please enter your Transaction ID or sender PayPal email.'
        )
      );
      return;
    }

    setErrorMsg(null);
    setIsActivating(true);

    setTimeout(() => {
      const selectedAddonsKeys: string[] = [];
      if (includeAdmobSetup) selectedAddonsKeys.push('admob_setup');
      if (includeAssetLinks) selectedAddonsKeys.push('assetlinks');
      if (includeExtraBuilds) selectedAddonsKeys.push('build_reset');

      activateUserSubscription(user.$id, txnInput.trim(), selectedPlan, selectedAddonsKeys);

      if (includeExtraBuilds && appId) {
        addAppBuildCredits(appId, 3);
      }

      setIsActivating(false);
      triggerCelebration();
      if (onSuccess) onSuccess(selectedPlan);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 mb-1">
            <Sparkles className="h-6 w-6 text-amber-300" />
          </div>
          <h3 className="text-2xl font-black text-white">
            {t('اختر باقتك وامتلك تطبيقك مدى الحياة', 'Choisissez votre forfait', 'Choose Your Lifetime Plan')}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {t(
              'دفع لمرة واحدة فقط وبدون اشتراكات شهرية، مع دمج إعلانات AdMob وحزم Google Play الرسمية (AAB + APK).',
              'Paiement unique sans abonnement récurrent. AdMob et bundle Google Play AAB inclus.',
              'One-time payment with zero recurring fees. AdMob integration and Google Play AAB bundles included.'
            )}
          </p>
        </div>

        {/* Plan Selector (Standard Pro $29 vs Agency Pack $99) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Plan 1: Standard Pro ($29) */}
          <div
            onClick={() => setSelectedPlan('standard')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              selectedPlan === 'standard'
                ? 'border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {t('الأكثر طلباً', 'Le plus populaire', 'Most Popular')}
                </span>
                <div
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'standard'
                      ? 'border-indigo-400 bg-indigo-600 text-white'
                      : 'border-slate-700'
                  }`}
                >
                  {selectedPlan === 'standard' && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </div>
              <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-indigo-400" />
                <span>{t('الاحترافية (Standard Pro)', 'Standard Pro', 'Standard Pro')}</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                {t('لتطبيق واحد متكامل مدى الحياة', 'Pour 1 application à vie', 'For 1 application lifetime')}
              </p>
              <div className="mt-3">
                <span className="text-3xl font-black text-white">$29</span>
                <span className="text-[11px] text-indigo-300 ms-1 font-semibold">
                  / {t('تدفع مرة واحدة للأبد', 'paiement unique', 'pay once forever')}
                </span>
              </div>
              <ul className="mt-4 space-y-2 text-[11px] text-slate-300 border-t border-slate-800/80 pt-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{t('حزمة متجر Play الرسمية (AAB + APK)', 'Bundle Google Play (AAB + APK)', 'Google Play AAB + APK')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{t('إعلانات AdMob مدمجة وأرباح 100% لك', 'AdMob intégré · 100% revenus', 'AdMob embedded · 100% revenue')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{t('شاشة Splash مخصصة بدون علامة مائية', 'Splash screen personnalisée', 'Custom splash (No watermark)')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{t('3 محاولات بناء مجانية للتعديل والتحديث', '3 compilations incluses', '3 Rebuilds for updates')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{t('ملف Keystore مخصص ودائم للتحميل', 'Keystore dédié téléchargeable', 'Dedicated Keystore download')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Plan 2: Agency Pack ($99) */}
          <div
            onClick={() => setSelectedPlan('agency')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              selectedPlan === 'agency'
                ? 'border-emerald-500 bg-emerald-950/30 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {t('توفير 30% · للمطورين والوكالات', 'Économisez 30% · Agence', 'Save 30% · Agencies')}
                </span>
                <div
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'agency'
                      ? 'border-emerald-400 bg-emerald-600 text-white'
                      : 'border-slate-700'
                  }`}
                >
                  {selectedPlan === 'agency' && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </div>
              <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-emerald-400" />
                <span>{t('حزمة الوكالات (Agency Pack)', 'Pack Agence (5 Apps)', 'Agency Pack (5 Apps)')}</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                {t('5 تطبيقات كاملة (~$20 للتطبيق)', '5 applications (~20$/app)', '5 Full Apps (~$20/app)')}
              </p>
              <div className="mt-3">
                <span className="text-3xl font-black text-white">$99</span>
                <span className="text-[11px] text-emerald-300 ms-1 font-semibold">
                  / {t('رصيد دائم بدون انتهاء', 'crédit à vie', 'lifetime credits')}
                </span>
              </div>
              <ul className="mt-4 space-y-2 text-[11px] text-slate-300 border-t border-slate-800/80 pt-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="font-bold text-white">{t('ترخيص كامل لـ 5 تطبيقات مستقلة', '5 applications indépendantes', '5 independent app licenses')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{t('حزم AAB + APK مع AdMob لكل تطبيق', 'AAB + APK + AdMob par app', 'AAB + APK + AdMob per app')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{t('تخصيص كامل بدون أي علامة (White-label)', '100% White-label complet', '100% White-label branding')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{t('3 محاولات بناء لكل تطبيق (15 بناء إجمالاً)', '3 builds/app (15 au total)', '3 builds/app (15 total)')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{t('مفاتيح Keystore منفصلة لكل عميل', 'Keystores séparés par client', 'Independent Keystores per client')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Order Bumps / Quick Add-ons */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4 text-amber-400" />
              <span>{t('خدمات إضافية مساعدة (اختيارية):', 'Options recommandées :', 'Optional Recommended Add-ons:')}</span>
            </span>
            <span className="text-[10px] text-slate-500">{t('نقرة واحدة للإضافة', 'En 1 clic', '1-Click add')}</span>
          </div>

          <div className="space-y-2">
            {/* Addon 1: AdMob Setup */}
            <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-800/80 hover:border-slate-700 bg-slate-900/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={includeAdmobSetup}
                onChange={(e) => setIncludeAdmobSetup(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">
                    {t('تجهيز شفرات AdMob بالكامل نيابة عنك', 'Configuration AdMob complète', 'Complete AdMob Setup Assistance')}
                  </span>
                  <span className="font-mono text-amber-300 font-bold">+$15</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t(
                    'يتولى خبراؤنا استخراج وتوليد وربط الـ App ID والـ Unit IDs دون أي تعقيد.',
                    'Nos experts configurent vos identifiants AdMob.',
                    'Our engineers extract and link your App ID and ad unit IDs for you.'
                  )}
                </p>
              </div>
            </label>

            {/* Addon 2: Digital Asset Links */}
            <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-800/80 hover:border-slate-700 bg-slate-900/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={includeAssetLinks}
                onChange={(e) => setIncludeAssetLinks(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">
                    {t('إعداد ملف assetlinks.json لشاشة كاملة بدون شريط', 'Fichier assetlinks.json (Plein écran)', 'AssetLinks Fullscreen Verification Setup')}
                  </span>
                  <span className="font-mono text-amber-300 font-bold">+$9</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t(
                    'إخفاء شريط عنوان المتصفح تماماً ليظهر تطبيقك بصورة أصلية 100%.',
                    'Supprime la barre d’adresse pour un rendu 100% natif.',
                    'Hides the browser URL bar for a 100% native immersive fullscreen feel.'
                  )}
                </p>
              </div>
            </label>

            {/* Addon 3: Extra Rebuilds */}
            <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-800/80 hover:border-slate-700 bg-slate-900/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={includeExtraBuilds}
                onChange={(e) => setIncludeExtraBuilds(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">
                    {t('باقة +3 محاولات إعادة بناء إضافية (Build Reset)', '+3 Rebuilds supplémentaires', '+3 Extra Rebuilds Pack')}
                  </span>
                  <span className="font-mono text-amber-300 font-bold">+$9</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t(
                    'تأمين إضافي لتحديث الأيقونات أو الروابط مستقبلاً دون قلق.',
                    'Crédits supplémentaires pour rééditer plus tard.',
                    'Extra buffer for future icon, name, or URL changes.'
                  )}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Total Price Banner & Direct Checkout */}
        <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-950/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">
                {t('الإجمالي المطلوب للدفع لمرة واحدة:', 'Total à payer (Paiement unique) :', 'Total One-Time Investment:')}
              </span>
              <p className="text-xs text-indigo-300 font-semibold mt-0.5">
                {itemName}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-white">${totalPrice}</span>
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">USD</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1 flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" dir="ltr">
              <span className="font-mono text-xs text-indigo-300 font-bold select-all truncate">{PAYPAL_EMAIL}</span>
              <button
                type="button"
                onClick={copyEmail}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
                title="Copy PayPal Email"
              >
                {copiedEmail ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{t(`دفع $${totalPrice} عبر PayPal`, `Payer ${totalPrice}$ via PayPal`, `Pay $${totalPrice} via PayPal`)}</span>
            </a>
          </div>
        </div>

        {/* Enter Transaction ID or Sender Email for Activation */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            {t(
              'أدخل رقم المعاملة (Transaction ID) أو بريد PayPal المُرسل منه لتفعيل باقتك فوراً:',
              'Entrez l’ID de transaction ou l’e-mail PayPal pour activer :',
              'Enter Transaction ID or sender PayPal email to activate instantly:'
            )}
          </label>
          <input
            type="text"
            value={txnInput}
            onChange={(e) => setTxnInput(e.target.value)}
            placeholder="PP-123456789 or sender@gmail.com"
            dir="ltr"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
          {errorMsg && (
            <p className="text-xs text-red-400 font-semibold">{errorMsg}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            {t('إلغاء', 'Annuler', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirmActivation}
            disabled={isActivating}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            {isActivating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>
              {isActivating
                ? t('جاري التحقق والتفعيل...', 'Activation...', 'Activating...')
                : t('تأكيد وتفعيل الباقة فوراً', 'Confirmer et Activer', 'Confirm & Activate Now')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
