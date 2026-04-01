'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { formatCurrency, formatDate } from '@/lib/i18n';
import DeleteModal from '@/components/DeleteModal';
import { showToast } from '@/components/Toast';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';

interface Income {
  id: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const CATEGORIES = ['Lương', 'Thưởng', 'Đầu tư', 'Freelance', 'Kinh doanh', 'Khác'];
const PIE_COLORS = ['#7c5cfc', '#00d4aa', '#ff4d6a', '#ffb347', '#4fc3f7', '#e040fb'];

export default function IncomePage() {
  const { t, locale } = useLanguage();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchIncomes();
  }, [filterCategory, search]);

  const fetchIncomes = async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.set('category', filterCategory);
      if (search) params.set('search', search);

      const res = await fetch(`/api/incomes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setIncomes(data);
      }
    } catch (error) {
      console.error('Failed to fetch incomes:', error);
    } finally {
      setLoading(false);
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

      const url = editingId ? `/api/incomes/${editingId}` : '/api/incomes';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast(t.common.success, 'success');
        resetForm();
        fetchIncomes();
      } else {
        showToast(t.common.error, 'error');
      }
    } catch {
      showToast(t.common.error, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (income: Income) => {
    setEditingId(income.id);
    setFormTitle(income.title);
    setFormAmount(String(income.amount));
    setFormCategory(income.category);
    setFormDate(new Date(income.date).toISOString().split('T')[0]);
    setFormDescription(income.description);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/incomes/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(t.common.success, 'success');
        fetchIncomes();
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
    name: (t.income.categories as Record<string, string>)[cat] || cat,
    value: incomes.filter((i) => i.category === cat).reduce((sum, i) => sum + i.amount, 0),
  })).filter((d) => d.value > 0);

  // Monthly trend
  const monthlyMap: Record<string, number> = {};
  incomes.forEach((inc) => {
    const m = new Date(inc.date).toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
    monthlyMap[m] = (monthlyMap[m] || 0) + inc.amount;
  });
  const monthlyTrend = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount })).reverse().slice(0, 6).reverse();

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div>
      <div className="page-header">
        <h1>{t.income.title}</h1>
      </div>

      <div className="three-panel">
        {/* Panel 1: Form */}
        <div className="panel-form">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <div className="card-title">
                {editingId ? t.income.edit : t.income.addNew}
              </div>
              {editingId && (
                <button className="btn btn-ghost btn-sm" onClick={resetForm}>
                  {t.income.form.cancel}
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t.income.form.titleLabel}</label>
                <input
                  className="form-input"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={locale === 'vi' ? 'Nhập tiêu đề...' : 'Enter title...'}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.income.form.amount} (VND)</label>
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
                <label className="form-label">{t.income.form.category}</label>
                <select
                  className="form-select"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {(t.income.categories as Record<string, string>)[cat] || cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.income.form.date}</label>
                <input
                  className="form-input"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.income.form.description}</label>
                <textarea
                  className="form-textarea"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={locale === 'vi' ? 'Mô tả chi tiết...' : 'Description...'}
                />
              </div>

              <button
                className={`btn ${editingId ? 'btn-primary' : 'btn-success'} btn-full`}
                type="submit"
                disabled={formLoading}
              >
                {formLoading
                  ? t.common.loading
                  : editingId
                  ? t.income.form.update
                  : t.income.form.add}
              </button>
            </form>
          </div>
        </div>

        {/* Panel 2: List */}
        <div className="panel-list">
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div className="card-title">{t.income.list}</div>
              <div className="card-subtitle">{formatCurrency(totalIncome)}</div>
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
                    {(t.income.categories as Record<string, string>)[cat] || cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="table-container" style={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
              ) : incomes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💰</div>
                  <div className="empty-text">{t.common.noData}</div>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t.income.form.titleLabel}</th>
                      <th>{t.income.form.amount}</th>
                      <th>{t.income.form.category}</th>
                      <th>{t.income.form.date}</th>
                      <th>{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomes.map((income) => (
                      <tr key={income.id}>
                        <td>{income.title}</td>
                        <td className="amount-income">{formatCurrency(income.amount)}</td>
                        <td>
                          <span className="category-badge">
                            {(t.income.categories as Record<string, string>)[income.category] || income.category}
                          </span>
                        </td>
                        <td>{formatDate(income.date, locale)}</td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleEdit(income)}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setDeleteId(income.id)}
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
              <div className="card-title">{t.income.summary}</div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t.income.byCategory}
              </h4>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
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
                      formatter={(value: any) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ padding: 24 }}>
                  <div className="empty-text">{t.common.noData}</div>
                </div>
              )}
              {/* Category legend */}
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
                {t.income.monthlyTrend}
              </h4>
              {monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,252,0.1)" />
                    <XAxis dataKey="month" stroke="#6b6b8a" fontSize={10} />
                    <YAxis stroke="#6b6b8a" fontSize={10} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                    <Tooltip
                      contentStyle={{
                        background: '#1a1a3e',
                        border: '1px solid rgba(124,92,252,0.3)',
                        borderRadius: '8px',
                        color: '#e8e8f0',
                        fontSize: 12,
                      }}
                      formatter={(value: any) => formatCurrency(Number(value))}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#00d4aa" fill="rgba(0,212,170,0.2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ padding: 24 }}>
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
