'use client';

import React, { useState } from 'react';
import { useLanguage } from '../lib/i18n';
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export default function ContactPage() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fallbackMailto, setFallbackMailto] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const t = (ar: string, fr: string, en: string) => {
    if (lang === 'ar') return ar;
    if (lang === 'fr') return fr;
    return en;
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('support@appifya.app');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setFallbackMailto(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lang,
          clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
      } else if (data.notConfigured) {
        setFallbackMailto(data.fallbackMailto);
        setErrorMsg(
          t(
            'لم يتم ضبط بيانات خادم البريد (SMTP) على الخادم بعد. يمكنك إرسال رسالتك مباشرة بنقرة واحدة عبر تطبيق البريد أدناه:',
            'Le serveur SMTP n’est pas encore configuré. Vous pouvez envoyer directement via votre client de messagerie ci-dessous :',
            'Server SMTP is not configured yet. You can dispatch your message directly via your email client below:'
          )
        );
      } else {
        setErrorMsg(
          data.error ||
            t(
              'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مجدداً أو مراسلتنا مباشرة.',
              'Une erreur est survenue lors de l’envoi. Veuillez réessayer.',
              'An error occurred while sending your message. Please try again.'
            )
        );
      }
    } catch {
      // Network or offline fallback
      const mailtoSubject = encodeURIComponent(`استفسار من: ${formData.name || 'عميل'} - Appifya`);
      const mailtoBody = encodeURIComponent(
        `مرحباً فريق Appifya،\n\n${formData.message}\n\n---\nالمرسل: ${formData.name}\nالبريد: ${formData.email}`
      );
      setFallbackMailto(`mailto:support@appifya.app?subject=${mailtoSubject}&body=${mailtoBody}`);
      setErrorMsg(
        t(
          'تعذر الاتصال بالخادم. يرجى استخدام زر الإرسال المباشر عبر تطبيق بريدك الإلكتروني أدناه.',
          'Connexion au serveur impossible. Veuillez utiliser le bouton de messagerie directe ci-dessous.',
          'Could not reach server. Please use the direct mail button below.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="theme-page flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-10"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{t('الدعم الفني وخدمة العملاء', 'Support Technique', 'Customer Support')}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          {t('تواصل معنا', 'Contactez-nous', 'Get in Touch')}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          {t(
            'هل لديك استفسار حول تحويل متجرك، إعلانات AdMob، الربط مع Appwrite، أو باقات التصدير؟ فريقنا جاهز للإجابة عليك فوراً.',
            'Une question sur la conversion PWA, la monétisation AdMob ou l’exportation ? Notre équipe est là pour vous aider.',
            'Have questions about PWA conversion, AdMob monetization, Appwrite integration, or package exports? We are here to help.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Info Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-3.5 shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-11 w-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-medium">{t('البريد الإلكتروني المباشر', 'E-mail de contact', 'Direct Email')}</p>
                <a
                  href="mailto:support@appifya.app"
                  className="text-sm font-bold text-white hover:text-indigo-400 transition-colors truncate block"
                  dir="ltr"
                >
                  support@appifya.app
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/70 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
              title={t('نسخ البريد الإلكتروني', 'Copier l’adresse', 'Copy email address')}
            >
              {copiedEmail ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-3.5 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{t('أوقات الرد والمتابعة', 'Disponibilité', 'Response Time')}</p>
              <p className="text-sm font-bold text-white">
                24/7 {t('دعم مستمر وسريع', 'Support continu', 'Continuous 24/7 Support')}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-3.5 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{t('ضمان الخدمة', 'Garantie de service', 'Service Guarantee')}</p>
              <p className="text-xs font-semibold text-slate-300">
                {t(
                  'يتم فحص وتدقيق كل طلب ومتابعة حل المشكلات التقنية بدقة.',
                  'Assistance personnalisée et suivi rigoureux de chaque demande.',
                  'Dedicated assistance and attentive technical follow-up for every inquiry.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-7 bg-slate-900/60 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-white">
                {t('تم إرسال رسالتك بنجاح!', 'Message envoyé avec succès !', 'Message Sent Successfully!')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                {t(
                  'شكراً لتواصلك معنا. تم تسليم رسالتك إلى فريق الدعم (support@appifya.app) وسيقوم أحد ممثلينا بالرد عليك على بريدك الإلكتروني في أقرب وقت.',
                  'Merci de nous avoir contactés. Votre message a été transmis à notre équipe (support@appifya.app). Nous vous répondrons très prochainement.',
                  'Thank you for reaching out. Your message has been routed to support@appifya.app. A team member will reply to your email shortly.'
                )}
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', message: '' });
                    setErrorMsg(null);
                    setFallbackMailto(null);
                  }}
                  className="px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  {t('إرسال رسالة أخرى', 'Envoyer un autre message', 'Send another message')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('الاسم الكامل', 'Nom complet', 'Full name')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('مثال: محمد علي', 'Ex: Mohammed Ali', 'e.g. John Doe')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('البريد الإلكتروني', 'Adresse e-mail', 'Email address')} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('نص الرسالة والاستفسار', 'Votre message', 'Your message')} *
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t(
                    'اكتب استفسارك بالتفصيل وسيسعدنا الرد عليك ومساعدتك...',
                    'Détaillez votre question ou besoin...',
                    'Write your inquiry in detail, we will be glad to assist you...'
                  )}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                    <span className="leading-relaxed">{errorMsg}</span>
                  </div>

                  {fallbackMailto && (
                    <div className="pt-1">
                      <a
                        href={fallbackMailto}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>{t('إرسال عبر تطبيق البريد مباشرة الآن', 'Ouvrir mon client e-mail', 'Open Email Client Now')}</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-bold text-sm text-white rounded-xl shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('جاري الإرسال...', 'Envoi en cours...', 'Sending message...')}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{t('إرسال الرسالة الآن', 'Envoyer le message', 'Send Message Now')}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
