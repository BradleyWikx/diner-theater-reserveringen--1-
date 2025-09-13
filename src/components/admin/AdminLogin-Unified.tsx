import React, { useState } from 'react';
import { loginAdmin } from '../../firebase/config';

interface AdminLoginProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onClose, onSuccess }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginAdmin(credentials.email, credentials.password);
      onClose();
      onSuccess?.();
      
      // Kleine vertraging om een soepele overgang te geven
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error: any) {
      setError('Ongeldige inloggegevens. Controleer je email en wachtwoord.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="admin-card admin-card--elevated max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-card-header">
          <div className="card-info">
            <h3 className="card-title">🎭 Admin Login</h3>
            <p className="card-subtitle">Toegang tot het theater beheersysteem</p>
          </div>
          <button 
            onClick={onClose}
            className="admin-btn admin-btn--ghost admin-btn--sm"
          >
            ✕
          </button>
        </div>

        <div className="admin-card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-admin-text-primary mb-2">
                Email adres
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full px-3 py-2 border border-admin-border rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary transition"
                required
                disabled={loading}
                placeholder="admin@theater.nl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text-primary mb-2">
                Wachtwoord
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-3 py-2 border border-admin-border rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary transition"
                required
                disabled={loading}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-admin-danger-light border border-admin-danger text-admin-danger-dark px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="admin-btn admin-btn--secondary flex-1"
                disabled={loading}
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn--primary flex-1"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="admin-btn-spinner"></div>
                    Inloggen...
                  </div>
                ) : (
                  'Inloggen'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
