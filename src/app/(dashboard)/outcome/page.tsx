'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { formatCurrency, formatDate, formatCompactNumber } from '@/lib/i18n';
import DeleteModal from '@/components/DeleteModal';
import { showToast } from '@/components/Toast';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';

interface Outcome {
  id: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const CATEGORIES = ['Ăn uống', 'Di chuyển', 'Giải trí', 'Mua sắm', 'Hóa đơn', 'Sức khỏe', 'Giáo dục', 'Thẻ tín dụng', 'Tặng/cho', 'Cho mượn', 'Trả nợ', 'Khác'];
const PIE_COLORS = ['#ff4d6a', '#ffb347', '#4fc3f7', '#e040fb', '#7c5cfc', '#00d4aa', '#69f0ae', '#ffd54f', '#a855f7', '#ec4899', '#f97316', '#10b981'];

export default function OutcomePage() {
  const { t, locale } = useLanguage();
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [budgetInfo, setBudgetInfo] = useState({ budgetLimit: 5000000, monthlyOutcome: 0 });

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchOutcomes();
    fetchBudget();
  }, [filterCategory, search]);

  const fetchOutcomes = async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.set('category', filterCategory);
      if (search) params.set('search', search);

      const res = await fetch(`/api/outcomes?${params}`);
      if (res.ok) {
        const data = await res.json();
        const sortedData = data.sort((a: Outcome, b: Outcome) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOutcomes(sortedData);
      }
    } catch (error) {
      console.error('Failed to fetch outcomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudget = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setBudgetInfo({ budgetLimit: data.budgetLimit, monthlyOutcome: data.monthlyOutcome });
      }
    } catch (error) {
      console.error('Failed to fetch budget:', error);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormAmount('');
    setFormCategory(CATEGORIES[0]);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDescription('');
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const body = {
        title: formTitle,
        amount: formAmount,
        category: formCategory,
        date: formDate,
        description: formDescription,
      };

      const url = editingId ? `/api/outcomes/${editingId}` : '/api/outcomes';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast(t.common.success, 'success');
        resetForm();
        fetchOutcomes();
        fetchBudget();
      } else {
        showToast(t.common.error, 'error');
      }
    } catch {
      showToast(t.common.error, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (outcome: Outcome) => {
    setEditingId(outcome.id);
    setFormTitle(outcome.title);
    setFormAmount(String(outcome.amount));
    setFormCategory(outcome.category);
    setFormDate(new Date(outcome.date).toISOString().split('T')[0]);
    setFormDescription(outcome.description);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/outcomes/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(t.common.success, 'success');
        fetchOutcomes();
        fetchBudget();
      } else {
        showToast(t.common.error, 'error');
      }
    } catch {
      showToast(t.common.error, 'error');
    } finally {
      setDeleteId(null);
    }
  };

  // Chart data
  const categoryData = CATEGORIES.map((cat) => ({
    name: (t.outcome.categories as Record<string, string>)[cat] || cat,
    value: outcomes.filter((o) => o.category === cat).reduce((sum, o) => sum + o.amount, 0),
  })).filter((d) => d.value > 0);

  // Monthly trend
  const monthlyMap: Record<string, number> = {};
  outcomes.forEach((out) => {
    const localeMap: Record<string, string> = {
      vi: 'vi-VN',
      en: 'en-US',
      hi: 'en-IN',
      ko: 'ko-KR',
      zh: 'zh-CN',
    };
    const m = new Date(out.date).toLocaleDateString(localeMap[locale] || 'vi-VN', { month: 'short', year: '2-digit' });
    monthlyMap[m] = (monthlyMap[m] || 0) + out.amount;
  });
  const monthlyTrend = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount })).reverse().slice(0, 6).reverse();

  const totalOutcome = outcomes.reduce((sum, o) => sum + o.amount, 0);
  const budgetPercent = Math.round((budgetInfo.monthlyOutcome / budgetInfo.budgetLimit) * 100);

  return (
    <div>
      <div className="page-header">
        <h1>{t.outcome.title}</h1>
      </div>

      <div className="three-panel">
        {/* Panel 1: Form */}
        <div className="panel-form">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <div className="card-title">
                {editingId ? t.outcome.edit : t.outcome.addNew}
              </div>
              {editingId && (
                <button className="btn btn-ghost btn-sm" onClick={resetForm}>
                  {t.outcome.form.cancel}
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t.outcome.form.titleLabel}</label>
                <input
                  className="form-input"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={`${t.outcome.form.titleLabel}...`}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.outcome.form.amount} ({t.common.currency})</label>
                <input
                  className="form-input"
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0"
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.outcome.form.category}</label>
                <select
                  className="form-select"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {(t.outcome.categories as Record<string, string>)[cat] || cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.outcome.form.date}</label>
                <input
                  className="form-input"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.outcome.form.description}</label>
                <textarea
                  className="form-textarea"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={`${t.outcome.form.description}...`}
                />
              </div>

              <button
                className={`btn ${editingId ? 'btn-primary' : 'btn-danger'} btn-full`}
                type="submit"
                disabled={formLoading}
              >
                {formLoading
                  ? t.common.loading
                  : editingId
                  ? t.outcome.form.update
                  : t.outcome.form.add}
              </button>
            </form>
          </div>
        </div>

        {/* Panel 2: List */}
        <div className="panel-list">
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div className="card-title">{t.outcome.list}</div>
              <div className="card-subtitle">{formatCurrency(totalOutcome, locale)}</div>
            </div>

            <div className="filter-bar">
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  className="search-input"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.common.search}
                />
              </div>
              <select
                className="filter-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">{t.common.all}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {(t.outcome.categories as Record<string, string>)[cat] || cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="table-container" style={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
              ) : outcomes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💸</div>
                  <div className="empty-text">{t.common.noData}</div>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t.outcome.form.titleLabel}</th>
                      <th>{t.outcome.form.amount}</th>
                      <th>{t.outcome.form.category}</th>
                      <th>{t.outcome.form.date}</th>
                      <th>{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outcomes.map((outcome) => (
                      <tr key={outcome.id}>
                        <td>{outcome.title}</td>
                        <td className="amount-outcome">{formatCurrency(outcome.amount, locale)}</td>
                        <td>
                          <span className="category-badge">
                            {(t.outcome.categories as Record<string, string>)[outcome.category] || outcome.category}
                          </span>
                        </td>
                        <td>{formatDate(outcome.date, locale)}</td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleEdit(outcome)}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setDeleteId(outcome.id)}
                              style={{ color: 'var(--accent-danger)' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Panel 3: Summary */}
        <div className="panel-summary">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <div className="card-title">{t.outcome.summary}</div>
            </div>

            {/* Budget Progress */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t.outcome.budgetProgress}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {formatCurrency(budgetInfo.monthlyOutcome, locale)} / {formatCurrency(budgetInfo.budgetLimit, locale)}
                </span>
                <span style={{ color: budgetPercent >= 100 ? 'var(--accent-danger)' : budgetPercent >= 80 ? 'var(--accent-warning)' : 'var(--income-color)', fontWeight: 600 }}>
                  {budgetPercent}%
                </span>
              </div>
              <div className="budget-progress-bar" style={{ width: '100%', height: 10 }}>
                <div
                  className={`budget-progress-fill ${budgetPercent >= 100 ? 'exceeded' : budgetPercent >= 80 ? 'warning' : 'safe'}`}
                  style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                ></div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t.outcome.byCategory}
              </h4>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1a1a3e',
                        border: '1px solid rgba(124,92,252,0.3)',
                        borderRadius: '8px',
                        color: '#e8e8f0',
                        fontSize: 12,
                      }}
                      formatter={(value: any) => formatCurrency(Number(value), locale)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ padding: 16 }}>
                  <div className="empty-text">{t.common.noData}</div>
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {categoryData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block' }}></span>
                    {d.name}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t.outcome.monthlyTrend}
              </h4>
              {monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,252,0.1)" />
                    <XAxis dataKey="month" stroke="#6b6b8a" fontSize={10} />
                    <YAxis stroke="#6b6b8a" fontSize={10} tickFormatter={(v) => formatCompactNumber(Number(v), locale)} />
                    <Tooltip
                      contentStyle={{
                        background: '#1a1a3e',
                        border: '1px solid rgba(124,92,252,0.3)',
                        borderRadius: '8px',
                        color: '#e8e8f0',
                        fontSize: 12,
                      }}
                      formatter={(value: any) => formatCurrency(Number(value), locale)}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#ff4d6a" fill="rgba(255,77,106,0.2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ padding: 16 }}>
                  <div className="empty-text">{t.common.noData}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
