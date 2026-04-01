'use client';

import { useState, useEffect, ReactNode } from 'react';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

let toastId = 0;
let addToastFn: ((msg: string, type: 'success' | 'error') => void) | null = null;

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  if (addToastFn) {
    addToastFn(message, type);
  }
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastFn = (message: string, type: 'success' | 'error') => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  return (
    <>
      {children}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' ? '✓' : '✕'} {toast.message}
          </div>
        ))}
      </div>
    </>
  );
}
