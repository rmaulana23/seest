import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { locales } from '../i18n/locales';

type Language = 'id' | 'en';
type TranslationKey = keyof (typeof locales)['id'];

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_STORAGE_KEY = 'seest_lang_v1';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return (localStorage.getItem(LANG_STORAGE_KEY) as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch (error) {
      console.error("Could not save language to localStorage", error);
    }
  }, [language]);

  const t = useCallback((key: TranslationKey, options?: Record<string, string | number>) => {
      let translation = locales[language][key] || key;
      if (options) {
        Object.keys(options).forEach(optionKey => {
            translation = translation.replace(`{${optionKey}}`, String(options[optionKey]));
        });
      }
      return translation;
  }, [language]);


  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};