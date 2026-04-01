'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Locale, getTranslations, TranslationKeys } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  t: TranslationKeys;
  toggleLocale: () => void;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALES: Locale[] = ['vi', 'en', 'hi', 'ko', 'zh'];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi');
  const t = getTranslations(locale);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const currentIndex = LOCALES.indexOf(prev);
      const nextIndex = (currentIndex + 1) % LOCALES.length;
      return LOCALES[nextIndex];
    });
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, t, toggleLocale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
