'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'ar' | 'en' | 'fr' | 'es';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

export const translations: Translations = {
  ar: {
    heroTitle: "حوّل متجرك أو صفحة هبوطك إلى",
    heroTitleHighlight: "تطبيق جوال فوري (PWA)",
    heroSub: "أنشئ تطبيق ويب تقدمي سريع لمتجرك مع دعم دمج الإعلانات والربح الفوري واختيار النظام المناسب.",
    storeUrlLabel: "رابط المتجر أو صفحة الهبوط",
    appNameLabel: "اسم التطبيق",
    themeColorLabel: "اللون الرئيسي",
    iconLabel: "أيقونة التطبيق",
    platformLabel: "النظام المستهدف للتطبيق",
    platformBoth: "كلاهما (مستحسن)",
    platformAndroid: "Android فقط",
    platformIos: "iOS فقط",
    monetizationTitle: "إعدادات تحقيق الدخل والإعلانات",
    noAds: "بدون إعلانات",
    customCode: "شفرة مخصصة",
    generateBtn: "توليد ونشر التطبيق الآن",
    navAbout: "من نحن",
    navContact: "اتصل بنا",
    navPricing: "الأسعار",
    installBtn: "تثبيت التطبيق على جهازك",
    exportBtn: "تصدير التطبيق",
  },
  en: {
    heroTitle: "Convert Your Store or Landing Page into a",
    heroTitleHighlight: "Fast Mobile PWA",
    heroSub: "Build a blazing-fast Progressive Web App with ad monetization, platform customization, and instant Appwrite sync.",
    storeUrlLabel: "Store or Landing Page URL",
    appNameLabel: "App Name",
    themeColorLabel: "Theme Color",
    iconLabel: "App Icon",
    platformLabel: "Target Mobile Platform",
    platformBoth: "Both (Recommended)",
    platformAndroid: "Android Only",
    platformIos: "iOS Only",
    monetizationTitle: "Monetization & Ad Settings",
    noAds: "No Ads",
    customCode: "Custom Code",
    generateBtn: "Generate & Launch PWA Now",
    navAbout: "About Us",
    navContact: "Contact",
    navPricing: "Pricing",
    installBtn: "Install App on Device",
    exportBtn: "Export App",
  },
  fr: {
    heroTitle: "Convertissez votre boutique ou page en",
    heroTitleHighlight: "Application Mobile PWA",
    heroSub: "Créez une Progressive Web App ultra-rapide avec monétisation, choix du système et backend Appwrite sécurisé.",
    storeUrlLabel: "URL de la boutique ou page",
    appNameLabel: "Nom de l'application",
    themeColorLabel: "Couleur principale",
    iconLabel: "Icône de l'application",
    platformLabel: "Plateforme Cible",
    platformBoth: "Les deux (Recommandé)",
    platformAndroid: "Android Uniquement",
    platformIos: "iOS Uniquement",
    monetizationTitle: "Paramètres de Monétisation & Publicité",
    noAds: "Sans Publicité",
    customCode: "Code Personnalisé",
    generateBtn: "Générer la PWA Maintenant",
    navAbout: "À propos",
    navContact: "Contact",
    navPricing: "Tarifs",
    installBtn: "Installer l'application",
    exportBtn: "Exporter l’application",
  },
  es: {
    heroTitle: "Convierte tu tienda o landing page en una",
    heroTitleHighlight: "App Móvil PWA Rápida",
    heroSub: "Crea una Progressive Web App de alto rendimiento con monetización de anuncios, personalización nativa y sincronización segura en Appwrite.",
    storeUrlLabel: "URL de la tienda o landing page",
    appNameLabel: "Nombre de la aplicación",
    themeColorLabel: "Color principal",
    iconLabel: "Icono de la aplicación",
    platformLabel: "Plataforma móvil objetivo",
    platformBoth: "Ambas (Recomendado)",
    platformAndroid: "Solo Android",
    platformIos: "Solo iOS",
    monetizationTitle: "Configuración de Monetización y Anuncios",
    noAds: "Sin anuncios",
    customCode: "Código personalizado",
    generateBtn: "Generar y Publicar PWA Ahora",
    navAbout: "Sobre nosotros",
    navContact: "Contacto",
    navPricing: "Precios",
    installBtn: "Instalar app en tu dispositivo",
    exportBtn: "Exportar aplicación",
  }
};

const LanguageContext = createContext<{
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}>({
  lang: 'ar',
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved && ['ar', 'en', 'fr', 'es'].includes(saved)) {
      // Hydrate the language preference after the browser becomes available.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(saved);
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = saved;
      return;
    }

    const browserLang = navigator.language.toLowerCase();
    let detected: Language = 'en';

    if (browserLang.startsWith('ar')) detected = 'ar';
    else if (browserLang.startsWith('fr')) detected = 'fr';
    else if (browserLang.startsWith('es')) detected = 'es';
    else detected = 'en';

    setLangState(detected);
    document.documentElement.dir = detected === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = detected;
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('app_lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const t = (key: string) => translations[lang]?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
