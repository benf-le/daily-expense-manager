'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { getCurrencySymbol } from "@/lib/i18n"

interface BudgetSetupModalProps {
  isOpen: boolean;
  onSaved: (budgetLimit: number) => void;
}

export default function BudgetSetupModal({
  isOpen,
  onSaved,
}: BudgetSetupModalProps) {
  const { t } = useLanguage();
  const [budgetLimit, setBudgetLimit] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBudgetLimit('');
      setError('');
      setSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedBudget = Number(budgetLimit);
    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      setError(t.common.invalidBudget);
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await fetch('/api/users/me/budget', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ budgetLimit: parsedBudget }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || t.common.error);
        return;
      }

      onSaved(parsedBudget);
    } catch {
      setError(t.common.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content budget-setup-modal">
        <div className="modal-icon">💵</div>
        <h3>{t.common.budgetSetupTitle}</h3>
        <p>{t.common.budgetSetupDescription}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" htmlFor="budget-limit-input">
              {t.dashboard.budget}
            </label>
            <div className="budget-input-group">
              <input
                id="budget-limit-input"
                className="form-input"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={budgetLimit}
                onChange={(event) => setBudgetLimit(event.target.value)}
                placeholder={t.common.budgetSetupPlaceholder}
                autoFocus
              />
              <span className="budget-currency-tag">
                {t.common.currencySymbol} {t.common.currency}
              </span>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="modal-actions">
            <button className="btn btn-primary btn-full" type="submit">
              {saving ? t.common.loading : t.common.saveBudget}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
