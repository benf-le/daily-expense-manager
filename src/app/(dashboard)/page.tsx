'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { formatCurrency, formatDate } from '@/lib/i18n';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

interface StatsData {
  totalIncome: number;
  totalOutcome: number;
  balance: number;
  monthlyIncome: number;
  monthlyOutcome: number;
  transactionCount: number;
  budgetLimit: number;
  budgetPercent: number;
  budgetStatus: 'safe' | 'warning' | 'exceeded';
  budgetRemaining: number;
  monthlyData: { month: string; income: number; outcome: number }[];
  recentTransactions: { id: string; title: string; amount: number; category: string; date: string; type: 'income' | 'outcome' }[];
}

const PIE_COLORS = ['#7c5cfc', '#00d4aa', '#ff4d6a', '#ffb347', '#4fc3f7', '#e040fb', '#69f0ae', '#ffd54f'];

export default function DashboardPage() {
  const { t, locale } = useLanguage();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-text">{t.common.noData}</div></div>;
  }

  // Pie chart data for this month
  const pieData = [
    { name: t.dashboard.totalIncome, value: stats.monthlyIncome },
    { name: t.dashboard.totalOutcome, value: stats.monthlyOutcome },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="page-header">
        <h1>{t.dashboard.title}</h1>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{formatCurrency(stats.totalIncome, locale)}</div>
          <div className="stat-label">{t.dashboard.totalIncome}</div>
        </div>
        <div className="stat-card outcome">
          <div className="stat-icon">💸</div>
          <div className="stat-value">{formatCurrency(stats.totalOutcome, locale)}</div>
          <div className="stat-label">{t.dashboard.totalOutcome}</div>
        </div>
        <div className="stat-card balance">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{formatCurrency(stats.balance, locale)}</div>
          <div className="stat-label">{t.dashboard.balance}</div>
        </div>
        <div className="stat-card transactions">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.transactionCount}</div>
          <div className="stat-label">{t.dashboard.transactions}</div>
        </div>
      </div>

      {/* Budget Alert */}
      {/* <div className={`budget-alert ${stats.budgetStatus}`}>
        <div className="alert-icon">
          {stats.budgetStatus === 'exceeded' ? '🚨' : stats.budgetStatus === 'warning' ? '⚠️' : '✅'}
        </div>
        <div className="alert-content">
          <div className="alert-title">
            {t.dashboard.budgetAlert}
          </div>
          <div className="alert-text">
            {stats.budgetStatus === 'exceeded'
              ? t.dashboard.budgetExceeded
              : stats.budgetStatus === 'warning'
                ? t.dashboard.budgetWarning.replace('{percent}', String(stats.budgetPercent))
                : t.dashboard.budgetSafe}
            {' • '}
            {t.dashboard.budget}: {formatCurrency(stats.budgetLimit, locale)} | {t.dashboard.spent}: {formatCurrency(stats.monthlyOutcome, locale)} | {t.dashboard.remaining}: {formatCurrency(stats.budgetRemaining, locale)}
          </div>
        </div>
        <div className="budget-progress-bar">
          <div
            className={`budget-progress-fill ${stats.budgetStatus}`}
            style={{ width: `${Math.min(stats.budgetPercent, 100)}%` }}
          ></div>
        </div>
      </div> */}

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container">
          <div className="card-header">
            <div className="card-title">{t.dashboard.monthlyOverview}</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,252,0.1)" />
              <XAxis dataKey="month" stroke="#6b6b8a" fontSize={12} />
              <YAxis stroke="#6b6b8a" fontSize={12} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip
                contentStyle={{
                  background: '#1a1a3e',
                  border: '1px solid rgba(124,92,252,0.3)',
                  borderRadius: '8px',
                  color: '#e8e8f0',
                }}
                formatter={(value: any) => formatCurrency(Number(value), locale)}
              />
              <Legend />
              <Bar dataKey="income" name={t.dashboard.totalIncome} fill="#00d4aa" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outcome" name={t.dashboard.totalOutcome} fill="#ff4d6a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="card-header">
            <div className="card-title">{t.dashboard.thisMonth}</div>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1a1a3e',
                    border: '1px solid rgba(124,92,252,0.3)',
                    borderRadius: '8px',
                    color: '#e8e8f0',
                  }}
                  formatter={(value: any) => formatCurrency(Number(value), locale)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div className="empty-text">{t.common.noData}</div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">{t.dashboard.recentTransactions}</div>
        </div>
        {stats.recentTransactions.length > 0 ? (
          <div className="transaction-list">
            {stats.recentTransactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className={`tx-icon ${tx.type}`}>
                  {tx.type === 'income' ? '💰' : '💸'}
                </div>
                <div className="tx-info">
                  <div className="tx-title">{tx.title}</div>
                  <div className="tx-category">{tx.category}</div>
                </div>
                <div>
                  <div className={`tx-amount ${tx.type}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, locale)}
                  </div>
                  <div className="tx-date">{formatDate(tx.date, locale)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <div className="empty-text">{t.common.noData}</div>
          </div>
        )}
      </div>
    </div>
  );
}
