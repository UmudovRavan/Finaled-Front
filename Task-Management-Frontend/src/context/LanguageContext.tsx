import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LANGUAGES } from '../i18n/translations';
import type { Language, LanguageOption, TranslationSchema } from '../i18n/translations';

export { LANGUAGES };
export type { Language, LanguageOption, TranslationSchema };
export type LanguageCode = Language;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (keyPath: string, params?: Record<string, string | number>, fallback?: string) => string;
  languages: LanguageOption[];
  currentLanguageInfo: LanguageOption;
  rawTranslations: TranslationSchema;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('altensor_language') || localStorage.getItem('crmLanguage') || localStorage.getItem('tmsLanguage');
    if (saved && (saved === 'az' || saved === 'en' || saved === 'ru')) {
      return saved as LanguageCode;
    }
    return 'az';
  });

  const setLanguage = (newLang: LanguageCode) => {
    if (['az', 'en', 'ru'].includes(newLang)) {
      setLanguageState(newLang);
      localStorage.setItem('altensor_language', newLang);
      localStorage.setItem('crmLanguage', newLang);
      localStorage.setItem('tmsLanguage', newLang);
      document.documentElement.lang = newLang;
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (keyPath: string, params: Record<string, string | number> = {}, fallback: string = ''): string => {
    if (!keyPath) return fallback;
    const keys = keyPath.split('.');
    const dict = (translations as Record<string, any>)[language] || translations.az;
    let current: any = dict;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to AZ
        let fb: any = translations.az;
        for (const fbk of keys) {
          if (fb && typeof fb === 'object' && fbk in fb) {
            fb = fb[fbk];
          } else {
            fb = null;
            break;
          }
        }
        current = fb || fallback || keyPath;
        break;
      }
    }

    if (typeof current === 'string' && params && typeof params === 'object') {
      let interpolated = current;
      for (const [pKey, pVal] of Object.entries(params)) {
        interpolated = interpolated.replace(new RegExp(`{{${pKey}}}`, 'g'), String(pVal));
      }
      return interpolated;
    }

    return typeof current === 'string' ? current : fallback || keyPath;
  };

  const currentLanguageInfo = LANGUAGES.find((l: LanguageOption) => l.code === language) || LANGUAGES[0];
  const rawTranslations = (translations as Record<string, TranslationSchema>)[language] || translations.az;

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      languages: LANGUAGES,
      currentLanguageInfo,
      rawTranslations
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
