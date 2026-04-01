'use client';

import { useLanguage } from './LanguageProvider';

export default function Navbar({ title }: { title: string }) {
  const { locale, t, setLocale } = useLanguage();

  const langData = {
    vi: { flag: '🇻🇳', label: 'Tiếng Việt' },
    en: { flag: '🇬🇧', label: 'English' },
    hi: { flag: '🇮🇳', label: 'Hindi' },
    ko: { flag: '🇰🇷', label: 'Korean' },
    zh: { flag: '🇨🇳', label: 'Chinese' },
  } as const;

  return (
    <nav className="navbar">
      <h1 className="navbar-title">{title}</h1>
      <div className="navbar-actions">
        <div className="lang-select-wrapper">
          <select
            className="lang-select"
            value={locale}
            onChange={(e) => setLocale(e.target.value as any)}
            aria-label="Select Language"
          >
            {Object.entries(langData).map(([key, { flag, label }]) => (
              <option key={key} value={key}>
                {flag} {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}
