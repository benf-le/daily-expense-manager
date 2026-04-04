'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { formatDate } from '@/lib/i18n';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface UserDetail {
  user: {
    id: string;
    name: string;
    email: string;
    budgetLimit: number;
    currency: string;
    createdAt: string;
  };
  monthlyData: { month: string; income: number; outcome: number }[];
  transactions: {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    description: string;
    type: 'income' | 'outcome';
  }[];
}

export default function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const unwrappedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    if (!data) return amount.toString();
    const currency = data.user.currency || 'VND';
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
  };

  const formatCompactNumber = (amount: number) => {
    if (!data) return amount.toString();
    const currency = data.user.currency || 'VND';
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
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (session?.user && session.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    if (status === 'authenticated') {
      fetchUserDetail();
    }
  }, [status, session]);

  const fetchUserDetail = async () => {
    try {
      const res = await fetch(`/api/admin/users/${unwrappedParams.userId}`);
      if (res.ok) {
        setData(await res.json());
      } else {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  if (!data) return null;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link href="/admin" className="btn btn-ghost btn-sm" style={{ padding: '0 8px' }}>
          ←
        </Link>
        <h1>{data.user.name}</h1>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Email</div>
          <div className="stat-value" style={{ fontSize: 16 }}>{data.user.email}</div>
        </div>
        <div className="stat-card income">
          <div className="stat-label">{t.dashboard.budget}</div>
          <div className="stat-value" style={{ fontSize: 20, marginTop: 4 }}>
            {formatCurrency(data.monthlyData.length > 0 ? data.monthlyData[data.monthlyData.length - 1].outcome : 0)} <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/ {formatCurrency(data.user.budgetLimit)}</span>
          </div>
          <div className="stat-label">
            {locale === 'vi' ? 'Đã chi / Giới hạn' : 'Spent / Limit'}
          </div>
        </div>
        <div className="stat-card balance">
          <div className="stat-label">{t.dashboard.transactions}</div>
          <div className="stat-value">{data.transactions.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{locale === 'vi' ? 'Ngày tham gia' : 'Member Since'}</div>
          <div className="stat-value" style={{ fontSize: 16 }}>{formatDate(data.user.createdAt, locale)}</div>
        </div>
      </div>

      <div className="chart-container" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">{t.dashboard.monthlyOverview}</div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,252,0.1)" />
            <XAxis dataKey="month" stroke="#6b6b8a" fontSize={12} />
            <YAxis stroke="#6b6b8a" fontSize={12} tickFormatter={(v) => formatCompactNumber(Number(v))} />
            <Tooltip
              contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(124,92,252,0.3)', borderRadius: '8px', color: '#e8e8f0' }}
              formatter={(value: any) => formatCurrency(Number(value))}
            />
            <Legend />
            <Bar dataKey="income" name={t.dashboard.totalIncome} fill="#00d4aa" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outcome" name={t.dashboard.totalOutcome} fill="#ff4d6a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">{t.dashboard.recentTransactions}</div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{locale === 'vi' ? 'Loại' : 'Type'}</th>
                <th>{t.income.form.titleLabel}</th>
                <th>{t.income.form.amount}</th>
                <th>{t.income.form.category}</th>
                <th>{t.income.form.date}</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.length > 0 ? data.transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <span className="category-badge" style={{
                      background: tx.type === 'income' ? 'rgba(0,212,170,0.1)' : 'rgba(255,77,106,0.1)',
                      color: tx.type === 'income' ? 'var(--income-color)' : 'var(--outcome-color)',
                    }}>
                      {tx.type === 'income' ? (locale === 'vi' ? 'Thu' : 'Inc') : (locale === 'vi' ? 'Chi' : 'Exp')}
                    </span>
                  </td>
                  <td>{tx.title}</td>
                  <td className={tx.type === 'income' ? 'amount-income' : 'amount-outcome'}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td><span className="category-badge">{tx.category}</span></td>
                  <td>{formatDate(tx.date, locale)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    {t.common.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
