'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { formatCurrency, formatDate } from '@/lib/i18n';
import { showToast } from '@/components/Toast';
import DeleteModal from '@/components/DeleteModal';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  budgetLimit: number;
  createdAt: string;
  _count: { incomes: number; outcomes: number };
}

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  user: { name: string; email: string };
}

interface AdminStats {
  totalIncome: number;
  totalOutcome: number;
  balance: number;
  userCount: number;
  incomeCount: number;
  outcomeCount: number;
  monthlyData: { month: string; income: number; outcome: number }[];
  userStats: { id: string; name: string; email: string; totalIncome: number; totalOutcome: number; balance: number }[];
}

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'users' | 'incomes' | 'outcomes'>('users');
  const [users, setUsers] = useState<UserData[]>([]);
  const [allIncomes, setAllIncomes] = useState<Transaction[]>([]);
  const [allOutcomes, setAllOutcomes] = useState<Transaction[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchAll();
  }, [session]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, incomesRes, outcomesRes, statsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/admin/incomes'),
        fetch('/api/admin/outcomes'),
        fetch('/api/admin/stats'),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (incomesRes.ok) setAllIncomes(await incomesRes.json());
      if (outcomesRes.ok) setAllOutcomes(await outcomesRes.json());
      if (statsRes.ok) setAdminStats(await statsRes.json());
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      const res = await fetch(`/api/users/${deleteUserId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(t.common.success, 'success');
        fetchAll();
      } else {
        const data = await res.json();
        showToast(data.error || t.common.error, 'error');
      }
    } catch {
      showToast(t.common.error, 'error');
    } finally {
      setDeleteUserId(null);
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>{t.admin.title}</h1>
      </div>

      {/* Admin Stats */}
      {adminStats && (
        <>
          <div className="stats-grid">
            <div className="stat-card income">
              <div className="stat-icon">💰</div>
              <div className="stat-value">{formatCurrency(adminStats.totalIncome)}</div>
              <div className="stat-label">{t.dashboard.totalIncome} ({locale === 'vi' ? 'Toàn hệ thống' : 'System-wide'})</div>
            </div>
            <div className="stat-card outcome">
              <div className="stat-icon">💸</div>
              <div className="stat-value">{formatCurrency(adminStats.totalOutcome)}</div>
              <div className="stat-label">{t.dashboard.totalOutcome}</div>
            </div>
            <div className="stat-card balance">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{adminStats.userCount}</div>
              <div className="stat-label">{t.admin.allUsers}</div>
            </div>
            <div className="stat-card transactions">
              <div className="stat-icon">📋</div>
              <div className="stat-value">{adminStats.incomeCount + adminStats.outcomeCount}</div>
              <div className="stat-label">{t.dashboard.transactions}</div>
            </div>
          </div>

          <div className="chart-container" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div className="card-title">{t.dashboard.monthlyOverview} ({locale === 'vi' ? 'Toàn hệ thống' : 'System-wide'})</div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={adminStats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,252,0.1)" />
                <XAxis dataKey="month" stroke="#6b6b8a" fontSize={12} />
                <YAxis stroke="#6b6b8a" fontSize={12} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip
                  contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(124,92,252,0.3)', borderRadius: '8px', color: '#e8e8f0' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="income" name={t.dashboard.totalIncome} fill="#00d4aa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outcome" name={t.dashboard.totalOutcome} fill="#ff4d6a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('users')}
        >
          👥 {t.admin.allUsers}
        </button>
        <button
          className={`btn ${activeTab === 'incomes' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('incomes')}
        >
          💰 {t.admin.allIncomes}
        </button>
        <button
          className={`btn ${activeTab === 'outcomes' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('outcomes')}
        >
          💸 {t.admin.allOutcomes}
        </button>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'users' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.auth.name}</th>
                  <th>{t.auth.email}</th>
                  <th>{t.admin.role}</th>
                  <th>{t.dashboard.totalIncome}</th>
                  <th>{t.dashboard.totalOutcome}</th>
                  <th>{t.dashboard.transactions}</th>
                  <th>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="category-badge" style={{
                        background: user.role === 'ADMIN' ? 'rgba(124,92,252,0.2)' : 'rgba(0,212,170,0.1)',
                        color: user.role === 'ADMIN' ? 'var(--accent-primary-light)' : 'var(--income-color)',
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td className="amount-income">{user._count.incomes}</td>
                    <td className="amount-outcome">{user._count.outcomes}</td>
                    <td>{user._count.incomes + user._count.outcomes}</td>
                    <td>
                      {user.id !== session?.user?.id && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteUserId(user.id)}
                          style={{ color: 'var(--accent-danger)' }}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'incomes' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.admin.user}</th>
                  <th>{t.income.form.titleLabel}</th>
                  <th>{t.income.form.amount}</th>
                  <th>{t.income.form.category}</th>
                  <th>{t.income.form.date}</th>
                </tr>
              </thead>
              <tbody>
                {allIncomes.map((inc) => (
                  <tr key={inc.id}>
                    <td>
                      <div style={{ fontSize: 13 }}>{inc.user.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inc.user.email}</div>
                    </td>
                    <td>{inc.title}</td>
                    <td className="amount-income">{formatCurrency(inc.amount)}</td>
                    <td><span className="category-badge">{inc.category}</span></td>
                    <td>{formatDate(inc.date, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allIncomes.length === 0 && (
              <div className="empty-state"><div className="empty-icon">💰</div><div className="empty-text">{t.common.noData}</div></div>
            )}
          </div>
        )}

        {activeTab === 'outcomes' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.admin.user}</th>
                  <th>{t.outcome.form.titleLabel}</th>
                  <th>{t.outcome.form.amount}</th>
                  <th>{t.outcome.form.category}</th>
                  <th>{t.outcome.form.date}</th>
                </tr>
              </thead>
              <tbody>
                {allOutcomes.map((out) => (
                  <tr key={out.id}>
                    <td>
                      <div style={{ fontSize: 13 }}>{out.user.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{out.user.email}</div>
                    </td>
                    <td>{out.title}</td>
                    <td className="amount-outcome">{formatCurrency(out.amount)}</td>
                    <td><span className="category-badge">{out.category}</span></td>
                    <td>{formatDate(out.date, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allOutcomes.length === 0 && (
              <div className="empty-state"><div className="empty-icon">💸</div><div className="empty-text">{t.common.noData}</div></div>
            )}
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}
