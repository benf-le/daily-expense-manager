'use client';

import { signOut } from 'next-auth/react';
import { useLanguage } from './LanguageProvider';

export default function Navbar({ title }: { title: string }) {
  const { locale, t, toggleLocale } = useLanguage();

  const langData = {
    vi: { flag: '🇻🇳', label: 'VI' },
    en: { flag: '🇬🇧', label: 'EN' },
    hi: { flag: '🇮🇳', label: 'HI' },
    ko: { flag: '🇰🇷', label: 'KO' },
    zh: { flag: '🇨🇳', label: 'ZH' },
  } as const;

  return (
    <nav className="navbar">
      <h1 className="navbar-title">{title}</h1>
      <div className="navbar-actions">
        <button className="lang-toggle" onClick={toggleLocale} id="lang-toggle" title="Switch Language">
          <span className="lang-flag">{langData[locale].flag}</span>
          <span>{langData[locale].label}</span>
        </button>
        <button
          className="btn-logout"
          onClick={() => signOut({ callbackUrl: '/login' })}
          id="btn-logout"
        >
          {t.nav.logout}
        </button>
      </div>
    </nav>
  );
}
