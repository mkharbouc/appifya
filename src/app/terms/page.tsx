'use client';

import React from 'react';
import { useLanguage } from '../lib/i18n';
import { Scale, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

export default function TermsPage() {
  const { lang } = useLanguage();

  return (
    <main className="flex-1 max-w-4xl mx-auto px-6 py-16 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold">
          <Scale className="h-3.5 w-3.5" />
          <span>{lang === 'ar' ? 'الاتفاقية القانونية' : lang === 'fr' ? 'Conditions d’Utilisation' : 'Legal Agreement'}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white">
          {lang === 'ar' ? 'شروط الخدمة والاستخدام' : lang === 'fr' ? 'Conditions Générales' : 'Terms of Service'}
        </h1>
        <p className="text-xs text-slate-500 font-mono">
          {lang === 'ar' ? 'آخر تحديث: 2026' : 'Last Updated: 2026'}
        </p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-8 text-sm leading-relaxed text-slate-300">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{lang === 'ar' ? '1. قبول الشروط' : lang === 'fr' ? '1. Acceptation' : '1. Acceptance of Terms'}</span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm">
            {lang === 'ar'
              ? 'باستخدامك لمنصة Appifya، فإنك توافق على الالتزام بهذه الشروط وبكافة القوانين واللوائح المعمول بها محلياً ودولياً.'
              : lang === 'fr'
              ? 'En utilisant Appifya, vous acceptez d’être lié par les présentes conditions et par les lois en vigueur.'
              : 'By accessing or using Appifya, you agree to comply with and be bound by these Terms of Service.'}
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-800/80 pt-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-rose-400" />
            <span>{lang === 'ar' ? '2. الاستخدام المسموح به والمحظور' : lang === 'fr' ? '2. Utilisation Autorisée' : '2. Permitted Use & Restrictions'}</span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm">
            {lang === 'ar'
              ? 'يُحظر استخدام المنصة لتحويل أي مواقع أو صفحات تحتوي على برمجيات ضارة، أو مواد تنتهك حقوق الملكية الفكرية، أو أنشطة احتيالية. يحق لنا حظر أي تطبيق مخالف فوراً.'
              : lang === 'fr'
              ? 'Il est interdit de convertir des sites malveillants ou frauduleux. Tout contenu illicite sera immédiatement supprimé.'
              : 'You agree not to use our service to package malicious, infringing, or fraudulent websites. Violations result in instant termination.'}
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-800/80 pt-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-indigo-400" />
            <span>{lang === 'ar' ? '3. باقات التصدير والمدفوعات' : lang === 'fr' ? '3. Paiements et Licences' : '3. Export Licenses & Payments'}</span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm">
            {lang === 'ar'
              ? 'رسوم تصدير الكود النظيف ($19) تمنحك ترخيصاً غير حصري للاستخدام التجاري للملفات المستخرجة. ونظراً للطبيعة الرقمية للملفات، فإن رسوم التصدير غير قابلة للاسترداد بعد تسليم الحزمة البرمجية.'
              : lang === 'fr'
              ? 'La licence d’exportation propre (19$) est définitive et non remboursable une fois le code source téléchargé.'
              : 'The $19 standalone export grants a commercial license for the generated code. Due to the digital delivery nature, exports are non-refundable once downloaded.'}
          </p>
        </section>
      </div>
    </main>
  );
}
