'use client';

import React, { useState } from 'react';
import { useLanguage } from '../lib/i18n';
import { Mail, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';

export default function ContactPage() {
  const { lang } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="flex-1 max-w-4xl mx-auto px-6 py-16 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          {lang === 'ar' ? 'تواصل معنا' : lang === 'fr' ? 'Contactez-nous' : 'Get in Touch'}
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          {lang === 'ar'
            ? 'هل لديك استفسار حول تحويل متجرك، الربط مع Appwrite، أو باقات التصدير؟ فريقنا جاهز لمساعدتك.'
            : lang === 'fr'
            ? 'Une question sur la conversion, le backend Appwrite ou l’exportation ? Nous sommes là pour vous.'
            : 'Have questions about app conversion, Appwrite integration, or package exports? We are here to help.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Info Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
              <p className="text-sm font-semibold text-white">support@appifya.app</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">{lang === 'ar' ? 'أوقات الدعم' : 'Support Hours'}</p>
              <p className="text-sm font-semibold text-white">24/7 {lang === 'ar' ? 'دعم مستمر' : 'Always Active'}</p>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-7 bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl">
          {submitted ? (
            <div className="py-10 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">
                {lang === 'ar' ? 'تم استلام رسالتك بنجاح!' : lang === 'fr' ? 'Message envoyé avec succès !' : 'Message Sent Successfully!'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? 'سنرد على بريدك الإلكتروني في أقرب وقت.' : 'We will get back to you shortly.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {lang === 'ar' ? 'نص الرسالة' : 'Your Message'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 font-bold text-sm text-white rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>{lang === 'ar' ? 'إرسال الرسالة' : lang === 'fr' ? 'Envoyer le message' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}