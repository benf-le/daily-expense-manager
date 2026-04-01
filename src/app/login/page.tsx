'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t, locale, toggleLocale } = useLanguage();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t.auth.invalidCredentials);
      } else {
        router.push('/');
        router.refresh();
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
            <span className="lang-flag">{locale === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
            <span>{locale === 'vi' ? 'VI' : 'EN'}</span>
          </button>
        </div>
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-icon">₫</div>
            <h1>Expense Manager</h1>
            <p>{t.auth.login}</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
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
              />
            </div>

            <button
              className="btn btn-primary btn-full"
              type="submit"
              disabled={loading}
              id="btn-login"
              style={{ marginTop: 8 }}
            >
              {loading ? t.common.loading : t.auth.login}
            </button>
          </form>

          <div className="auth-footer">
            {t.auth.noAccount}{' '}
            <Link href="/register">{t.auth.registerHere}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
