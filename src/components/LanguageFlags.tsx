import React from 'react';
import type { Language } from '@/app/lib/i18n';

export interface LanguageOption {
  id: Language;
  code: string;
  label: string;
  nativeLabel: string;
  flagEmoji: string;
  dir: 'rtl' | 'ltr';
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { id: 'ar', code: 'ar', label: 'العربية', nativeLabel: 'العربية', flagEmoji: '🇸🇦', dir: 'rtl' },
  { id: 'en', code: 'en', label: 'English', nativeLabel: 'English', flagEmoji: '🇬🇧', dir: 'ltr' },
  { id: 'fr', code: 'fr', label: 'Français', nativeLabel: 'Français', flagEmoji: '🇫🇷', dir: 'ltr' },
  { id: 'es', code: 'es', label: 'Español', nativeLabel: 'Español', flagEmoji: '🇪🇸', dir: 'ltr' },
];

/**
 * 🇸🇦 Arabic Flag (Saudi Arabia / Arab League Green with stylized sword & calligraphy)
 */
export function FlagAr({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg
      className={`${className} shrink-0 rounded-[3px] shadow-xs ring-1 ring-white/10`}
      viewBox="0 0 24 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="علم العربية"
    >
      <rect width="24" height="16" fill="#007A3D" />
      {/* Arabic Calligraphy flourish */}
      <g fill="#FFFFFF" opacity="0.95">
        <path d="M5.5 5.5h1.2v2H5.5zm2.2-0.6h1.2v2.6H7.7zm2.2 0.8h1.2v1.8H9.9zm2.2-0.8h1.2v2.6h-1.2zm2.2 0.5h1.2v2.1h-1.2z" />
        <path d="M5.5 8.3h13v0.8h-13z" />
        {/* Sword of justice */}
        <path d="M5.5 10.6h11.5v0.8H5.5z" />
        <path d="M5.7 10.1l-1.5 0.9 1.5 0.9z" />
        <path d="M16 9.8v2.4h0.9V9.8z" />
        <circle cx="17.7" cy="11" r="0.6" />
      </g>
    </svg>
  );
}

/**
 * 🇬🇧 English Flag (United Kingdom Union Jack)
 */
export function FlagEn({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg
      className={`${className} shrink-0 rounded-[3px] shadow-xs ring-1 ring-white/10`}
      viewBox="0 0 24 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="English flag"
    >
      <defs>
        <clipPath id="uk-flag-clip">
          <rect width="24" height="16" />
        </clipPath>
      </defs>
      <g clipPath="url(#uk-flag-clip)">
        <rect width="24" height="16" fill="#012169" />
        {/* Diagonals White */}
        <path d="M0 0L24 16M24 0L0 16" stroke="#FFFFFF" strokeWidth="2.8" />
        {/* Diagonals Red */}
        <path d="M0 0L24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.4" />
        {/* Center Cross White */}
        <path d="M12 0v16M0 8h24" stroke="#FFFFFF" strokeWidth="4.8" />
        {/* Center Cross Red */}
        <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="2.8" />
      </g>
    </svg>
  );
}

/**
 * 🇫🇷 French Flag (Tricolore)
 */
export function FlagFr({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg
      className={`${className} shrink-0 rounded-[3px] shadow-xs ring-1 ring-white/10`}
      viewBox="0 0 24 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Drapeau Français"
    >
      <rect x="0" y="0" width="8" height="16" fill="#002654" />
      <rect x="8" y="0" width="8" height="16" fill="#FFFFFF" />
      <rect x="16" y="0" width="8" height="16" fill="#CE1126" />
    </svg>
  );
}

/**
 * 🇪🇸 Spanish Flag (Rojigualda with emblem)
 */
export function FlagEs({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg
      className={`${className} shrink-0 rounded-[3px] shadow-xs ring-1 ring-white/10`}
      viewBox="0 0 24 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Bandera de España"
    >
      <rect x="0" y="0" width="24" height="4" fill="#AA151B" />
      <rect x="0" y="4" width="24" height="8" fill="#F1BF00" />
      <rect x="0" y="12" width="24" height="4" fill="#AA151B" />
      {/* Spanish Coat of Arms emblem */}
      <g transform="translate(6.5, 5.5)">
        {/* Crown */}
        <path d="M0.5 0.5L1.5 1.5L2.5 0.5L3.5 1.5L4.5 0.5V2H0.5z" fill="#AA151B" />
        {/* Shield */}
        <path d="M0.8 2h3.4v2.5a1.7 1.7 0 0 1-3.4 0V2z" fill="#AA151B" />
        <circle cx="2.5" cy="3.2" r="0.8" fill="#F1BF00" />
        {/* Pillars of Hercules */}
        <rect x="-0.3" y="1.2" width="0.6" height="3.5" rx="0.3" fill="#881014" />
        <rect x="4.7" y="1.2" width="0.6" height="3.5" rx="0.3" fill="#881014" />
      </g>
    </svg>
  );
}

/**
 * Unified Language Flag renderer
 */
export function LanguageFlag({
  lang,
  className = 'w-5 h-3.5',
}: {
  lang: Language;
  className?: string;
}) {
  switch (lang) {
    case 'ar':
      return <FlagAr className={className} />;
    case 'en':
      return <FlagEn className={className} />;
    case 'fr':
      return <FlagFr className={className} />;
    case 'es':
      return <FlagEs className={className} />;
    default:
      return <FlagEn className={className} />;
  }
}
