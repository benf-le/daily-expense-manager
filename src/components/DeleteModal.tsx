'use client';

import { useLanguage } from './LanguageProvider';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, title }: DeleteModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">⚠️</div>
        <h3>{t.common.deleteConfirm}</h3>
        {title && <p>{title}</p>}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            {t.common.cancel}
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {t.common.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
