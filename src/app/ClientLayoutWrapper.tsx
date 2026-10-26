'use client';

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageProvider, useLanguage, type Language } from "./lib/i18n";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import {
  Globe, Sparkles, LayoutDashboard, LogOut, User, Moon, Sun,
  FileCode, ChevronDown, ImageIcon, Gauge, QrCode, Home, Info, BookOpen,
  DollarSign, Mail, ShieldCheck, FileText, PanelLeftClose, PanelLeftOpen, Wrench, X, Smartphone, KeyRound,
  ShieldAlert, BellRing, Cpu,
} from "lucide-react";

// ─── Logo ──────────────────────────────────────────────────────────────────────

function AppifyaLogoIcon({ small = false }: { small?: boolean }) {
  const size = small ? "h-8 w-8" : "h-10 w-10";
  const imgSize = small ? "h-6 w-6" : "h-8 w-8";
  return (
    <div className={`relative flex ${size} items-center justify-center rounded-xl border border-white/10 bg-zinc-900 shadow-md shadow-black/40 transition-all group-hover:border-indigo-500/40 shrink-0`}>
      <img src="/icon.svg" alt="Appifya" className={`${imgSize} rounded-lg`} />
    </div>
  );
}

// ─── Nav item definitions ──────────────────────────────────────────────────────

type NavItem =
  | { kind: 'link'; href: string; labelKey: string; labelAr: string; labelFr: string; labelEn: string; icon: React.ReactNode }
  | { kind: 'group'; labelKey: string; labelAr: string; labelFr: string; labelEn: string; icon: React.ReactNode; children: NavChild[] };

type NavChild = { href: string; labelAr: string; labelFr: string; labelEn: string; icon: React.ReactNode; descAr: string; descFr: string; descEn: string };

const NAV_ITEMS: NavItem[] = [
  { kind: 'link', href: '/', labelKey: 'home', labelAr: 'الرئيسية', labelFr: 'Accueil', labelEn: 'Home', icon: <Home className="h-4 w-4" /> },
  { kind: 'link', href: '/about', labelKey: 'navAbout', labelAr: 'من نحن', labelFr: 'À propos', labelEn: 'About', icon: <Info className="h-4 w-4" /> },
  { kind: 'link', href: '/guide', labelKey: 'guide', labelAr: 'دليل التثبيت', labelFr: 'Guide', labelEn: 'Install Guide', icon: <BookOpen className="h-4 w-4" /> },
  { kind: 'link', href: '/admob', labelKey: 'admob', labelAr: 'إعداد AdMob', labelFr: 'Config. AdMob', labelEn: 'AdMob Setup', icon: <DollarSign className="h-4 w-4" /> },
  {
    kind: 'group',
    labelKey: 'tools',
    labelAr: 'أدوات',
    labelFr: 'Outils',
    labelEn: 'Tools',
    icon: <Wrench className="h-4 w-4" />,
    children: [
      { href: '/tools/native-bridge-simulator', labelAr: 'محاكي واجهات الجهاز (Bridge)', labelFr: 'Simulateur Native Bridge', labelEn: 'Native Bridge Simulator', icon: <Cpu className="h-3.5 w-3.5 text-violet-400" />, descAr: 'مختبر ميزات أندرويد الحية وكود آمن', descFr: 'APIs matérielles & code sécurisé', descEn: 'Live hardware APIs & safe code' },
      { href: '/tools/push-notification-tester', labelAr: 'مختبر الإشعارات (Push Tester)', labelFr: 'Testeur Push Notifications', labelEn: 'Push Notification Tester', icon: <BellRing className="h-3.5 w-3.5 text-amber-400" />, descAr: 'صانع حمولة FCM & Web Push مع معاينة حية', descFr: 'Payloads FCM & Web Push avec prévisualisation', descEn: 'FCM & Web Push payload builder with live preview' },
      { href: '/tools/apk-permissions-auditor', labelAr: 'فاحص أذونات APK & SDKs', labelFr: 'Auditeur Permissions APK & SDK', labelEn: 'APK & SDK Auditor', icon: <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />, descAr: 'فحص أذونات ومكاتب APK/AAB لـ Google Play', descFr: 'Audit permissions et SDKs APK/AAB', descEn: 'Audit APK/AAB permissions & SDKs' },
      { href: '/tools/play-data-safety', labelAr: 'سلامة البيانات Google Play', labelFr: 'Sécurité des données Play', labelEn: 'Play Data Safety', icon: <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />, descAr: 'استبيان سلامة البيانات وسياسة الخصوصية', descFr: 'Sécurité des données & politique de confidentialité', descEn: 'Data Safety questionnaire & privacy policy' },
      { href: '/tools/app-mockup-framer', labelAr: 'مصمم سكرين شوت المتجر', labelFr: 'Mockup Framer (Screenshots)', labelEn: 'App Mockup Framer', icon: <Smartphone className="h-3.5 w-3.5 text-violet-400" />, descAr: 'سكرين شوت المتجر بإطارات الأجهزة', descFr: 'Captures d\'écran de store avec cadres', descEn: 'Store screenshots with device frames' },
      { href: '/tools/assetlinks-generator', labelAr: 'مولد Asset Links (TWA)', labelFr: 'Générateur Asset Links', labelEn: 'Asset Links Generator', icon: <KeyRound className="h-3.5 w-3.5 text-cyan-400" />, descAr: 'ملف assetlinks.json لروابط التطبيق', descFr: 'assetlinks.json pour App Links & TWA', descEn: 'assetlinks.json for App Links & TWA' },
      { href: '/tools/app-banner-generator', labelAr: 'شريط التطبيق الذكي (Smart Banner)', labelFr: 'Générateur Smart App Banner', labelEn: 'Smart App Banner Generator', icon: <Smartphone className="h-3.5 w-3.5 text-emerald-400" />, descAr: 'كود شريط Google Play لموقعك', descFr: 'Bannière Google Play pour votre site', descEn: 'Google Play banner code for your site' },
      { href: '/tools/manifest-generator', labelAr: 'مولد Manifest', labelFr: 'Générateur Manifest', labelEn: 'Manifest Generator', icon: <FileCode className="h-3.5 w-3.5 text-indigo-400" />, descAr: 'أنشئ manifest.json لتطبيقك', descFr: 'Créer un fichier manifest.json', descEn: 'Build your PWA manifest.json' },
      { href: '/tools/icon-generator', labelAr: 'مولد أيقونات التطبيق', labelFr: 'Générateur d\'icônes', labelEn: 'Icon Generator', icon: <ImageIcon className="h-3.5 w-3.5 text-purple-400" />, descAr: 'جميع أحجام PWA من صورة واحدة', descFr: 'Toutes les tailles PWA en un clic', descEn: 'All PWA sizes from one image' },
      { href: '/tools/qr-generator', labelAr: 'مولد رمز QR للتطبيق', labelFr: 'Générateur de QR Code', labelEn: 'App QR Code Generator', icon: <QrCode className="h-3.5 w-3.5 text-cyan-400" />, descAr: 'امسح لتثبيت التطبيق فوراً', descFr: 'Scannez pour installer l\'app', descEn: 'Scan to install & launch app' },
      { href: '/tools/pwa-checker', labelAr: 'فاحص جاهزية PWA', labelFr: 'Vérificateur PWA', labelEn: 'PWA Checker', icon: <Gauge className="h-3.5 w-3.5 text-emerald-400" />, descAr: 'اختبر موقعك في ثوانٍ', descFr: 'Testez votre site en quelques secondes', descEn: 'Test your site in seconds' },
      { href: '/tools', labelAr: 'جميع الأدوات', labelFr: 'Tous les outils', labelEn: 'All Tools', icon: <Wrench className="h-3.5 w-3.5 text-slate-400" />, descAr: 'تصفح كل الأدوات المتاحة', descFr: 'Parcourir tous les outils disponibles', descEn: 'Browse every available tool' },
    ],
  },
  { kind: 'link', href: '/contact', labelKey: 'navContact', labelAr: 'تواصل معنا', labelFr: 'Contact', labelEn: 'Contact', icon: <Mail className="h-4 w-4" /> },
];

const FOOTER_LINKS = [
  { href: '/privacy', labelAr: 'سياسة الخصوصية', labelFr: 'Confidentialité', labelEn: 'Privacy', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  { href: '/terms', labelAr: 'شروط الخدمة', labelFr: 'Conditions', labelEn: 'Terms', icon: <FileText className="h-3.5 w-3.5" /> },
];

// ─── Sidebar ───────────────────────────────────────────────────────────────────

const SIDEBAR_EXPANDED_W = 240;
const SIDEBAR_COLLAPSED_W = 64;

function SidebarNav({ onClose }: { onClose?: () => void }) {
  const { lang, setLang, t } = useLanguage();
  const { user, openAuthModal, logout } = useAuth();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [expanded, setExpanded] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const isMobileDrawer = !!onClose;

  // Restore sidebar state from localStorage and sync CSS variable
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar_expanded');
      const isExpanded = saved !== null ? saved === 'true' : true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpanded(isExpanded);
      document.documentElement.style.setProperty(
        '--sidebar-w',
        isExpanded ? `${SIDEBAR_EXPANDED_W}px` : `${SIDEBAR_COLLAPSED_W}px`
      );
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('app_theme');
      const initialTheme = savedTheme === 'light' || savedTheme === 'dark'
        ? savedTheme
        : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(initialTheme);
      document.documentElement.dataset.theme = initialTheme;
    } catch { /* ignore */ }
  }, []);

  const toggleSidebar = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_expanded', String(next));
        document.documentElement.style.setProperty(
          '--sidebar-w',
          next ? `${SIDEBAR_EXPANDED_W}px` : `${SIDEBAR_COLLAPSED_W}px`
        );
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('app_theme', nextTheme);
      document.documentElement.dataset.theme = nextTheme;
    } catch { /* ignore */ }
  }, [theme]);

  const labelOf = (item: { labelAr: string; labelFr: string; labelEn: string }) =>
    lang === 'ar' ? item.labelAr : lang === 'fr' ? item.labelFr : item.labelEn;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : href === '/tools' ? pathname === '/tools' : pathname.startsWith(href);

  // Auto-open Tools group when on a tools route or when user toggles it
  const isToolsRoute = pathname.startsWith('/tools');
  const isToolsDirect = pathname === '/tools';
  const isToolsExpanded = toolsOpen || isToolsRoute;

  const width = isMobileDrawer ? SIDEBAR_EXPANDED_W : (expanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W);

  return (
    <aside
      className="site-sidebar flex flex-col h-full select-none"
      style={{ width }}
      aria-label={lang === 'ar' ? 'القائمة الجانبية' : lang === 'fr' ? 'Navigation latérale' : 'Sidebar navigation'}
    >
      {/* ── Logo + toggle ── */}
      <div className="flex items-center justify-between px-3 py-4 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 group min-w-0"
          onClick={onClose}
          style={{ opacity: expanded || isMobileDrawer ? 1 : 0, pointerEvents: expanded || isMobileDrawer ? 'auto' : 'none', transition: 'opacity 150ms' }}
        >
          <AppifyaLogoIcon small />
          <span className="font-extrabold text-lg tracking-tight truncate bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 sidebar-brand-text">
            Appifya
          </span>
        </Link>

        {/* Logo icon when collapsed (no text) */}
        {!expanded && !isMobileDrawer && (
          <Link href="/" className="group mx-auto">
            <AppifyaLogoIcon small />
          </Link>
        )}

        {!isMobileDrawer ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className="sidebar-toggle-btn shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label={expanded
              ? (lang === 'ar' ? 'طي القائمة' : lang === 'fr' ? 'Réduire' : 'Collapse sidebar')
              : (lang === 'ar' ? 'توسيع القائمة' : lang === 'fr' ? 'Développer' : 'Expand sidebar')}
          >
            {expanded ? (
              <PanelLeftClose className="h-4 w-4 rtl:rotate-180" />
            ) : (
              <PanelLeftOpen className="h-4 w-4 rtl:rotate-180" />
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="sidebar-toggle-btn shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label={lang === 'ar' ? 'إغلاق القائمة' : lang === 'fr' ? 'Fermer' : 'Close menu'}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mx-3 border-t border-slate-800/60 mb-2 shrink-0" />

      {/* ── Nav links ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-0.5 min-h-0">
        {NAV_ITEMS.map((item) => {
          if (item.kind === 'link') {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`sidebar-nav-link flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors group
                  ${active ? 'sidebar-nav-active' : 'text-slate-400 hover:text-white'}`}
                title={!expanded && !isMobileDrawer ? labelOf(item) : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {(expanded || isMobileDrawer) && (
                  <span className="truncate">{item.kind === 'link' && item.labelKey === 'navAbout' ? t('navAbout') : item.kind === 'link' && item.labelKey === 'navContact' ? t('navContact') : labelOf(item)}</span>
                )}
              </Link>
            );
          }

          // Group (Tools)
          return (
            <div key={item.labelKey}>
              <button
                type="button"
                onClick={() => { if (expanded || isMobileDrawer) setToolsOpen((o) => !o); }}
                className={`sidebar-nav-link w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer
                  ${isToolsDirect ? 'sidebar-nav-active' : isToolsRoute ? 'text-indigo-400 dark:text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'}`}
                aria-expanded={isToolsExpanded}
                title={!expanded && !isMobileDrawer ? labelOf(item) : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {(expanded || isMobileDrawer) && (
                  <>
                    <span className="flex-1 text-start truncate">{labelOf(item)}</span>
                    <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isToolsExpanded ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {/* Sub-items */}
              {isToolsExpanded && (expanded || isMobileDrawer) && (
                <div className="mt-0.5 ms-3 ps-3 border-s border-slate-700/50 space-y-0.5">
                  {item.children.map((child) => {
                    const active = isActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className={`sidebar-nav-link flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors
                          ${active ? 'sidebar-nav-active' : 'text-slate-400 hover:text-white'}`}
                      >
                        <span className="shrink-0">{child.icon}</span>
                        <span className="truncate">{labelOf(child)}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Dashboard (auth-gated) */}
        {user && (
          <Link
            href="/dashboard"
            rel="nofollow"
            onClick={onClose}
            className={`sidebar-nav-link flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors
              ${isActive('/dashboard') ? 'sidebar-nav-active' : 'text-indigo-400 hover:text-indigo-300'}`}
            title={!expanded && !isMobileDrawer ? (lang === 'ar' ? 'تطبيقاتي' : 'Dashboard') : undefined}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {(expanded || isMobileDrawer) && (
              <span className="truncate">{lang === 'ar' ? 'تطبيقاتي' : 'Dashboard'}</span>
            )}
          </Link>
        )}
      </nav>

      <div className="mx-3 border-t border-slate-800/60 mt-2 shrink-0" />

      {/* ── Bottom controls ── */}
      <div className="px-2 py-3 space-y-1 shrink-0">

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`theme-toggle sidebar-nav-link w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors text-slate-400 hover:text-white`}
          aria-label={theme === 'dark'
            ? (lang === 'ar' ? 'تفعيل الوضع الفاتح' : lang === 'fr' ? 'Mode clair' : 'Light mode')
            : (lang === 'ar' ? 'تفعيل الوضع المظلم' : lang === 'fr' ? 'Mode sombre' : 'Dark mode')}
          title={!expanded && !isMobileDrawer ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
        >
          <span className="shrink-0">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </span>
          {(expanded || isMobileDrawer) && (
            <span>{theme === 'dark'
              ? (lang === 'ar' ? 'الوضع الفاتح' : lang === 'fr' ? 'Mode clair' : 'Light mode')
              : (lang === 'ar' ? 'الوضع المظلم' : lang === 'fr' ? 'Mode sombre' : 'Dark mode')}
            </span>
          )}
        </button>

        {/* Language selector */}
        {(expanded || isMobileDrawer) && (
          <div className="sidebar-nav-link flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-slate-400">
            <Globe className="h-4 w-4 shrink-0 text-indigo-400" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="sidebar-lang-select flex-1 bg-transparent border-0 text-sm text-slate-200 focus:outline-none cursor-pointer min-w-0"
            >
              <option value="ar" className="bg-slate-900 text-white">العربية</option>
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="fr" className="bg-slate-900 text-white">Français</option>
            </select>
          </div>
        )}
        {/* Language icon only when collapsed */}
        {!expanded && !isMobileDrawer && (
          <div className="sidebar-nav-link flex justify-center rounded-xl px-2.5 py-2 text-slate-400" title="Language">
            <Globe className="h-4 w-4 text-indigo-400" />
          </div>
        )}

        {/* Auth */}
        {user ? (
          <div className={`flex ${expanded || isMobileDrawer ? 'items-center gap-2' : 'flex-col items-center gap-1'}`}>
            <Link
              href="/dashboard"
              rel="nofollow"
              onClick={onClose}
              className="sidebar-nav-link flex-1 flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-slate-200 hover:text-white transition-colors min-w-0"
              title={!expanded && !isMobileDrawer ? (user.name || user.email.split('@')[0]) : undefined}
            >
              <div className="relative shrink-0">
                <User className="h-4 w-4 text-indigo-400" />
                {!user.emailVerification && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900"
                    title={lang === 'ar' ? 'البريد غير مفعّل' : 'Email not verified'}
                  />
                )}
              </div>
              {(expanded || isMobileDrawer) && (
                <div className="flex items-center gap-1.5 truncate">
                  <span className="truncate text-xs font-medium">{user.name || user.email.split('@')[0]}</span>
                  {!user.emailVerification && (
                    <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                      {lang === 'ar' ? 'غير مفعّل' : 'Unverified'}
                    </span>
                  )}
                </div>
              )}
            </Link>
            <button
              onClick={() => logout()}
              title={lang === 'ar' ? 'تسجيل الخروج' : lang === 'fr' ? 'Se déconnecter' : 'Sign out'}
              className="sidebar-nav-link rounded-lg p-1.5 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { openAuthModal(); onClose?.(); }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/25 transition-all cursor-pointer ${expanded || isMobileDrawer ? 'justify-start' : 'justify-center'}`}
            title={!expanded && !isMobileDrawer ? 'Sign In' : undefined}
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            {(expanded || isMobileDrawer) && (
              <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
            )}
          </button>
        )}

        {/* Footer links */}
        {(expanded || isMobileDrawer) && (
          <div className="flex gap-3 pt-1 ps-1">
            {FOOTER_LINKS.map((fl) => (
              <Link
                key={fl.href}
                href={fl.href}
                onClick={onClose}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                {lang === 'ar' ? fl.labelAr : lang === 'fr' ? fl.labelFr : fl.labelEn}
              </Link>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Mobile top bar ────────────────────────────────────────────────────────────

function MobileTopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const { lang } = useLanguage();
  return (
    <header className="site-mobile-topbar flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <Link href="/" className="flex items-center gap-2.5 group">
        <AppifyaLogoIcon small />
        <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 sidebar-brand-text">
          Appifya
        </span>
      </Link>
      <button
        type="button"
        onClick={onMenuOpen}
        aria-label={lang === 'ar' ? 'فتح القائمة' : lang === 'fr' ? 'Ouvrir le menu' : 'Open menu'}
        className="sidebar-toggle-btn rounded-lg p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <PanelLeftOpen className="h-5 w-5 rtl:rotate-180" />
      </button>
    </header>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function SiteFooter() {
  const { lang, t } = useLanguage();

  return (
    <footer className="site-footer border-t border-slate-800/80 bg-slate-950/60 py-8 px-6 text-center text-xs text-slate-500 space-y-4">
      <div className="flex flex-wrap justify-center gap-6 text-slate-400 font-medium">
        <Link href="/" className="hover:text-white">{lang === 'ar' ? 'الرئيسية' : lang === 'fr' ? 'Accueil' : 'Home'}</Link>
        <Link href="/about" className="hover:text-white">{t('navAbout')}</Link>
        <Link href="/guide" className="hover:text-white">{lang === 'ar' ? 'دليل التثبيت' : lang === 'fr' ? 'Guide' : 'Install Guide'}</Link>
        <Link href="/admob" className="hover:text-white">{lang === 'ar' ? 'إعداد AdMob' : lang === 'fr' ? 'Config. AdMob' : 'AdMob Setup'}</Link>
        <Link href="/tools/manifest-generator" className="hover:text-white">{lang === 'ar' ? 'مولد Manifest' : lang === 'fr' ? 'Générateur Manifest' : 'Manifest Generator'}</Link>
        <Link href="/tools/icon-generator" className="hover:text-white">{lang === 'ar' ? 'مولد الأيقونات' : lang === 'fr' ? 'Générateur d\'icônes' : 'Icon Generator'}</Link>
        <Link href="/tools/qr-generator" className="hover:text-white">{lang === 'ar' ? 'مولد رمز QR' : lang === 'fr' ? 'Générateur QR' : 'QR Generator'}</Link>
        <Link href="/tools/app-mockup-framer" className="hover:text-white">{lang === 'ar' ? 'مصمم سكرين شوت المتجر' : lang === 'fr' ? 'Mockup Framer' : 'Mockup Framer'}</Link>
        <Link href="/tools/push-notification-tester" className="hover:text-white">{lang === 'ar' ? 'مختبر الإشعارات' : lang === 'fr' ? 'Push Tester' : 'Push Notification Tester'}</Link>
        <Link href="/tools/apk-permissions-auditor" className="hover:text-white">{lang === 'ar' ? 'فاحص أذونات APK & SDKs' : lang === 'fr' ? 'Auditeur Permissions APK' : 'APK & SDK Auditor'}</Link>
        <Link href="/tools/play-data-safety" className="hover:text-white">{lang === 'ar' ? 'سلامة البيانات Google Play' : lang === 'fr' ? 'Sécurité des données' : 'Play Data Safety'}</Link>
        <Link href="/tools/assetlinks-generator" className="hover:text-white">{lang === 'ar' ? 'مولد Asset Links' : lang === 'fr' ? 'Générateur Asset Links' : 'Asset Links Generator'}</Link>
        <Link href="/tools/app-banner-generator" className="hover:text-white">{lang === 'ar' ? 'شريط التطبيق الذكي (Smart Banner)' : lang === 'fr' ? 'Smart App Banner' : 'Smart App Banner'}</Link>
        <Link href="/tools/pwa-checker" className="hover:text-white">{lang === 'ar' ? 'فاحص PWA' : lang === 'fr' ? 'Vérificateur PWA' : 'PWA Checker'}</Link>
        <Link href="/contact" className="hover:text-white">{t('navContact')}</Link>
        <Link href="/privacy" className="hover:text-white">{lang === 'ar' ? 'سياسة الخصوصية' : lang === 'fr' ? 'Confidentialité' : 'Privacy Policy'}</Link>
        <Link href="/terms" className="hover:text-white">{lang === 'ar' ? 'شروط الخدمة' : lang === 'fr' ? 'Conditions' : 'Terms of Service'}</Link>
      </div>
      <p>© 2026 Appifya. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : lang === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
    </footer>
  );
}

// ─── Root wrapper ──────────────────────────────────────────────────────────────

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
        console.error('Service worker registration failed:', error);
      });
    }
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        {/* Desktop: fixed sidebar */}
        <div className="site-sidebar-desktop">
          <Suspense fallback={null}>
            <SidebarNav />
          </Suspense>
        </div>

        {/* Mobile: top bar */}
        <MobileTopBar onMenuOpen={() => setMobileOpen(true)} />

        {/* Mobile drawer overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 flex"
            role="dialog"
            aria-modal="true"
          >
            {/* Scrim */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            {/* Drawer panel */}
            <div className="relative z-10 site-sidebar-drawer site-sidebar-wrapper h-full overflow-y-auto max-w-[85vw]">
              <Suspense fallback={null}>
                <SidebarNav onClose={() => setMobileOpen(false)} />
              </Suspense>
            </div>
          </div>
        )}

        {/* Main content — offset by sidebar width on desktop using logical padding */}
        <div className="site-content-wrapper flex flex-col min-h-screen">
          <div className="flex-1 flex flex-col">{children}</div>
          <SiteFooter />
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}
