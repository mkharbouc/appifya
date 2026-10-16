'use client';

import "./globals.css";
import React from "react";
import Link from "next/link";
import { LanguageProvider, useLanguage } from "./lib/i18n";
import { Globe, Sparkles } from "lucide-react";

function NavigationBar() {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20 text-white">
            P
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">Appifya</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">
            {lang === 'ar' ? 'الرئيسية' : lang === 'fr' ? 'Accueil' : 'Home'}
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            {t('navAbout')}
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            {t('navContact')}
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs text-slate-300">
          <Globe className="h-3.5 w-3.5 text-indigo-400" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="bg-transparent border-0 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ar" className="bg-slate-900 text-white">العربية</option>
            <option value="en" className="bg-slate-900 text-white">English</option>
            <option value="fr" className="bg-slate-900 text-white">Français</option>
          </select>
        </div>

        <Link
          href="/"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{lang === 'ar' ? 'أنشئ تطبيقك' : lang === 'fr' ? 'Créer une App' : 'Build App'}</span>
        </Link>
      </div>
    </header>
  );
}

function SiteFooter() {
  const { lang, t } = useLanguage();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 py-8 px-6 text-center text-xs text-slate-500 space-y-4">
      <div className="flex flex-wrap justify-center gap-6 text-slate-400 font-medium">
        <Link href="/" className="hover:text-white">{lang === 'ar' ? 'الرئيسية' : lang === 'fr' ? 'Accueil' : 'Home'}</Link>
        <Link href="/about" className="hover:text-white">{t('navAbout')}</Link>
        <Link href="/contact" className="hover:text-white">{t('navContact')}</Link>
        <Link href="/privacy" className="hover:text-white">{lang === 'ar' ? 'سياسة الخصوصية' : lang === 'fr' ? 'Confidentialité' : 'Privacy Policy'}</Link>
        <Link href="/terms" className="hover:text-white">{lang === 'ar' ? 'شروط الخدمة' : lang === 'fr' ? 'Conditions' : 'Terms of Service'}</Link>
      </div>
      <p>© 2026 Appifya. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : lang === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <body className="antialiased bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        <LanguageProvider>
          <NavigationBar />
          <div className="flex-1 flex flex-col">{children}</div>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
