'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from './LanguageProvider';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t, locale, setLocale } = useLanguage();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!session) return null;

  const userName = session.user?.name || 'User';
  const userEmail = session.user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = session.user?.role || 'USER';

  const langData = {
    vi: { flag: '🇻🇳', label: 'Tiếng Việt' },
    en: { flag: '🇬🇧', label: 'English' },
    hi: { flag: '🇮🇳', label: 'Hindi' },
    ko: { flag: '🇰🇷', label: 'Korean' },
    zh: { flag: '🇨🇳', label: 'Chinese' },
  } as const;

  const navLinks = [
    { href: '/', label: t.nav.dashboard, icon: '📊' },
    { href: '/income', label: t.nav.income, icon: '💰' },
    { href: '/outcome', label: t.nav.outcome, icon: '💸' },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        className={`mobile-menu-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        id="mobile-menu-toggle"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`mobile-sidebar ${isOpen ? 'open' : ''}`} id="mobile-sidebar">
        {/* Logo */}
        <div className="mobile-sidebar-header">
          <div className="mobile-logo">
            <div className="mobile-logo-icon">₫</div>
            <span className="mobile-logo-text">Expense Manager</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mobile-nav">
          <div className="mobile-nav-label">MENU</div>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-nav-link ${pathname === link.href ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="mobile-nav-icon">{link.icon}</span>
              <span className="mobile-nav-text">{link.label}</span>
              {pathname === link.href && <span className="mobile-nav-active-dot" />}
            </Link>
          ))}
        </nav>

        {/* Language Selector */}
        {/* <div className="mobile-lang-section">
          <div className="mobile-nav-label">LANGUAGE</div>
          <div className="mobile-lang-grid">
            {Object.entries(langData).map(([key, { flag, label }]) => (
              <button
                key={key}
                className={`mobile-lang-btn ${locale === key ? 'active' : ''}`}
                onClick={() => setLocale(key as any)}
              >
                <span className="mobile-lang-flag">{flag}</span>
                <span className="mobile-lang-name">{label}</span>
              </button>
            ))}
          </div>
        </div> */}

        {/* User Section */}
        <div className="mobile-user-section">
          <div className="mobile-nav-label">USER</div>
          <div className="mobile-user-card">
            <div className="mobile-user-avatar">{userInitial}</div>
            <div className="mobile-user-info">
              <div className="mobile-user-name">{userName}</div>
              <div className="mobile-user-email">{userEmail}</div>
              <div className="mobile-user-role-badge">{userRole}</div>
            </div>
          </div>
          <button
            className="mobile-logout-btn"
            onClick={() => signOut({ callbackUrl: '/login' })}
            id="mobile-btn-logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>{t.nav.logout}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
