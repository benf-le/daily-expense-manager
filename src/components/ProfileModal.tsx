'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import { showToast } from './Toast';
import { useRef } from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [currency, setCurrency] = useState('VND');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      setPassword(''); // clear password on open
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/users/profile');
      if (res.ok) {
        const data = await res.json();
        setName(data.name || '');
        setEmail(data.email || '');
        setBudgetLimit(data.budgetLimit?.toString() || '0');
        setCurrency(data.currency || 'VND');
        setAvatarUrl(data.avatar || null);
        setPreviewUrl(data.avatar || null);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = { name, email, budgetLimit: parseFloat(budgetLimit), currency };
      if (password) {
        payload.password = password;
      }
      if (avatarUrl) {
        payload.avatar = avatarUrl;
      }

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(t.common?.success || 'Success', 'success');
        onClose();
        // Option to fully reload or refresh session
        window.location.reload(); // Quick way to apply name changes everywhere
      } else {
        const data = await res.json();
        showToast(data.error || t.common?.error || 'Error', 'error');
      }
    } catch (error) {
      showToast(t.common?.error || 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">User Profile</h3>
        
        {fetching ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div 
                  className="user-avatar" 
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to change avatar"
                  style={{ 
                    width: '90px', 
                    height: '90px', 
                    fontSize: '36px', 
                    cursor: 'pointer',
                    overflow: 'hidden', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '2px solid var(--accent-primary)',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    const overlay = e.currentTarget.querySelector('.avatar-overlay') as HTMLElement;
                    if (overlay) overlay.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const overlay = e.currentTarget.querySelector('.avatar-overlay') as HTMLElement;
                    if (overlay) overlay.style.opacity = '0';
                  }}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    name ? name.charAt(0).toUpperCase() : 'U'
                  )}
                  <div className="avatar-overlay" style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    color: 'white'
                  }}>
                    📷
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                  style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  {((t.common as any).uploadImage || 'Tải ảnh đại diện') + ' (Max 5MB)'}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        showToast('Ảnh không được vượt quá 5MB', 'error');
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setAvatarUrl(reader.result as string);
                        setPreviewUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Currency</label>
              <select className="form-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="VND">₫ VND</option>
                <option value="USD">$ USD</option>
                <option value="INR">₹ INR</option>
                <option value="KRW">₩ KRW</option>
                <option value="CNY">¥ CNY</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Budget Limit ({currency})</label>
              <input
                className="form-input"
                type="number"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password (leave blank to keep current)</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={loading}
              >
                {(t.common as any).cancel || 'Cancel'}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (t.common.loading || 'Loading...') : ((t.common as any).save || 'Save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
