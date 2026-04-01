'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from './LanguageProvider';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLanguage();

  if (!session) return null;

  const isAdmin = session.user?.role === 'ADMIN';
  const userName = session.user?.name || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  const links = [
    { href: '/', label: t.nav.dashboard, icon: '📊' },
    { href: '/income', label: t.nav.income, icon: '💰' },
    { href: '/outcome', label: t.nav.outcome, icon: '💸' },
    ...(isAdmin ? [{ href: '/admin', label: t.nav.admin, icon: '⚙️' }] : []),
  ];

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">₫</div>
        <span className="logo-text">Expense Manager</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
          >
            <span className="link-icon">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{userInitial}</div>
          <div className="user-info">
            <div className="user-name">{userName}</div>
            <div className="user-role">{session.user?.role || 'USER'}</div>
          </div>
          <button 
            className="sidebar-logout-btn" 
            onClick={() => signOut({ callbackUrl: '/login' })}
            title={t.nav.logout}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
