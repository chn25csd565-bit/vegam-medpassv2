import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import enTranslations from '../locales/en/common.json';
import mlTranslations from '../locales/ml/common.json';

const translations = {
  en: enTranslations,
  ml: mlTranslations
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key) => key
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('medipass_lang');
      return saved === 'ml' ? 'ml' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback((lang) => {
    const valid = lang === 'ml' ? 'ml' : 'en';
    setLanguageState(valid);
    try {
      localStorage.setItem('medipass_lang', valid);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'ml' : 'en');
  }, [language, setLanguage]);

  // Translation helper with dot notation and parameter interpolation
  const t = useCallback((keyPath, params = {}) => {
    if (!keyPath) return '';
    const parts = keyPath.split('.');
    
    // Resolve in active language
    let current = translations[language];
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        current = undefined;
        break;
      }
    }

    // Fallback to English if missing
    if (current === undefined && language !== 'en') {
      let fallback = translations.en;
      for (const part of parts) {
        if (fallback && typeof fallback === 'object' && part in fallback) {
          fallback = fallback[part];
        } else {
          fallback = undefined;
          break;
        }
      }
      current = fallback;
    }

    if (typeof current !== 'string') {
      return keyPath;
    }

    // Interpolate {key} tokens
    let result = current;
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
    return result;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
