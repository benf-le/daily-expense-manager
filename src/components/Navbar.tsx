'use client';

import { signOut } from 'next-auth/react';
import { useLanguage } from './LanguageProvider';

export default function Navbar({ title }: { title: string }) {
  const { locale, t, toggleLocale } = useLanguage();

  return (
    <nav className="navbar">
      <h1 className="navbar-title">{title}</h1>
      <div className="navbar-actions">
        <button className="lang-toggle" onClick={toggleLocale} id="lang-toggle">
          <span className="lang-flag">{locale === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
          <span>{locale === 'vi' ? 'VI' : 'EN'}</span>
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
