import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

export const LANGUAGES = [
  { code: 'az', name: 'Azərbaycan dili', flag: '🇦🇿', label: 'Azərbaycan' },
  { code: 'en', name: 'English', flag: '🇬🇧', label: 'English' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', label: 'Русский' }
];

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('altensor_language') || localStorage.getItem('crmLanguage');
    if (saved && ['az', 'en', 'ru'].includes(saved)) {
      return saved;
    }
    return 'az'; // Default Azerbaijani
  });

  const setLanguage = (newLang) => {
    if (['az', 'en', 'ru'].includes(newLang)) {
      setLanguageState(newLang);
      localStorage.setItem('altensor_language', newLang);
      localStorage.setItem('crmLanguage', newLang);
      document.documentElement.lang = newLang;
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Helper function to translate keys with fallback & param interpolation
   * Example: t('tasks.bulkChangeStatus') or t('common.save')
   */
  const t = (keyPath, params = {}, fallback = '') => {
    if (!keyPath) return fallback;
    const keys = keyPath.split('.');
    let current = translations[language];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Try fallback to AZ or EN
        let fb = translations['az'];
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

  const currentLanguageInfo = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      languages: LANGUAGES,
      currentLanguageInfo
    }}>
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
