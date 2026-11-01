import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

export type Language = 'az' | 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('altensor_language') || localStorage.getItem('language');
      if (saved === 'az' || saved === 'en' || saved === 'ru') return saved;
      return 'az';
    } catch {
      return 'az';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('altensor_language', language);
      localStorage.setItem('language', language);
    } catch (e) {
      console.warn('Language storage notice:', e);
    }
  }, [language]);

  const t = (keyPath: string, fallback?: string): string => {
    const keys = keyPath.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return fallback || keyPath;
      }
    }

    return typeof current === 'string' ? current : fallback || keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageState, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

