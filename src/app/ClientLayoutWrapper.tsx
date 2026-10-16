'use client';

import React from "react";
import Link from "next/link";
import { LanguageProvider, useLanguage } from "./lib/i18n";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Globe, Sparkles, LayoutDashboard, LogOut, User } from "lucide-react";

function AppifyaLogoIcon() {
  return (
    <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-950 via-slate-900 to-pink-950 border border-indigo-500/30 shadow-lg shadow-indigo-500/20 group-hover:border-pink-500/50 transition-all">
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
      >
        <defs>
          <linearGradient id="appifyaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <rect
          x="10"
          y="6"
          width="20"
          height="28"
          rx="4.5"
          stroke="url(#appifyaGrad)"
          strokeWidth="2"
          className="opacity-70"
        />
        <line x1="17" y1="9" x2="23" y2="9" stroke="url(#appifyaGrad)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="20" cy="30" r="1.2" fill="url(#appifyaGrad)" />
        <path
          d="M21.5 12L15 21H20L18.5 28L25 19H20L21.5 12Z"
          fill="url(#appifyaGrad)"
          stroke="#0f172a"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function NavigationBar() {
  const { lang, setLang, t } = useLanguage();
  const { user, openAuthModal, logout } = useAuth();

  return (
    <header className="border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <AppifyaLogoIcon />
          <span className="font-extrabold text-2xl tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Appifya
          </span>
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
          {user && (
            <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5">
              <LayoutDashboard className="h-4 w-4" />
              <span>{lang === 'ar' ? 'تطبيقاتي' : 'Dashboard'}</span>
            </Link>
          )}
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

        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 rounded-xl"
            >
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline font-medium">{user.name || user.email.split('@')[0]}</span>
            </Link>
            <button
              onClick={() => logout()}
              title="تسجيل الخروج"
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
          </button>
        )}
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

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NavigationBar />
        <div className="flex-1 flex flex-col">{children}</div>
        <SiteFooter />
      </LanguageProvider>
    </AuthProvider>
  );
}
