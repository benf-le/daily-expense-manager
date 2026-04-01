'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Locale, getTranslations, TranslationKeys } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  t: TranslationKeys;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('vi');
  const t = getTranslations(locale);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'vi' ? 'en' : 'vi'));
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, t, toggleLocale }}>
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
