'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Locale, getTranslations, TranslationKeys } from '@/lib/i18n';
import { useSession } from 'next-auth/react';

interface LanguageContextType {
  locale: Locale;
  t: TranslationKeys;
  toggleLocale: () => void;
  setLocale: (locale: Locale) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
  formatCompactNumber: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALES: Locale[] = ['vi', 'en', 'hi', 'ko', 'zh'];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi');
  const t = getTranslations(locale);
  const [currency, setCurrencyState] = useState<string>('VND');
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      fetch('/api/users/profile')
        .then(res => res.json())
        .then(data => {
          if (data.currency) setCurrencyState(data.currency);
        })
        .catch(console.error);
    }
  }, [session]);

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

  const setCurrency = useCallback((newCurrency: string) => {
    setCurrencyState(newCurrency);
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    const numberFormatLocale: Record<string, string> = {
      'VND': 'vi-VN',
      'USD': 'en-US',
      'INR': 'en-IN',
      'KRW': 'ko-KR',
      'CNY': 'zh-CN',
    };
    const currencySymbol: Record<string, string> = {
      'VND': '₫',
      'USD': '$',
      'INR': '₹',
      'KRW': '₩',
      'CNY': '¥',
    };
    const formattedAmount = new Intl.NumberFormat(numberFormatLocale[currency] || 'vi-VN', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(amount);
    return `${currencySymbol[currency] || '₫'}${formattedAmount}`;
  }, [currency]);

  const formatCompactNumber = useCallback((amount: number) => {
    const numberFormatLocale: Record<string, string> = {
      'VND': 'vi-VN',
      'USD': 'en-US',
      'INR': 'en-IN',
      'KRW': 'ko-KR',
      'CNY': 'zh-CN',
    };
    const currencySymbol: Record<string, string> = {
      'VND': '₫',
      'USD': '$',
      'INR': '₹',
      'KRW': '₩',
      'CNY': '¥',
    };
    const formattedAmount = new Intl.NumberFormat(numberFormatLocale[currency] || 'vi-VN', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(amount);
    return `${currencySymbol[currency] || '₫'}${formattedAmount}`;
  }, [currency]);

  return (
    <LanguageContext.Provider value={{ locale, t, toggleLocale, setLocale, currency, setCurrency, formatCurrency, formatCompactNumber }}>
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
