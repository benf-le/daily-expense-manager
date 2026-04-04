'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t, locale, toggleLocale } = useLanguage();

  const langDisplay: Record<string, { flag: string; label: string }> = {
    vi: { flag: '🇻🇳', label: 'VI' },
    en: { flag: '🇬🇧', label: 'EN' },
    hi: { flag: '🇮🇳', label: 'HI' },
    ko: { flag: '🇰🇷', label: 'KO' },
    zh: { flag: '🇨🇳', label: 'ZH' },
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError(t.auth.emailExists);
        } else {
          setError(data.error || t.common.error);
        }
        return;
      }

      setSuccess(t.auth.registerSuccess);

      // Auto login after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // If auto-login fails for some reason, redirect to login page
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      }
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <button className="lang-toggle" onClick={toggleLocale}>
            <span className="lang-flag">{langDisplay[locale]?.flag || '🇻🇳'}</span>
            <span>{langDisplay[locale]?.label || 'VI'}</span>
          </button>
        </div>
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-icon">₫</div>
            <h1>Expense Manager</h1>
            <p>{t.auth.register}</p>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">{t.auth.name}</label>
              <input
                className="form-input"
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.auth.namePlaceholder}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">{t.auth.email}</label>
              <input
                className="form-input"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">{t.auth.password}</label>
              <input
                className="form-input"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">{t.auth.confirmPassword}</label>
              <input
                className="form-input"
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              className="btn btn-primary btn-full"
              type="submit"
              disabled={loading}
              id="btn-register"
              style={{ marginTop: 8 }}
            >
              {loading ? t.common.loading : t.auth.register}
            </button>
          </form>

          <div className="auth-footer">
            {t.auth.hasAccount}{' '}
            <Link href="/login">{t.auth.loginHere}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
