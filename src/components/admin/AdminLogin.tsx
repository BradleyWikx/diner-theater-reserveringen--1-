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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.15)'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          margin: '-30px -30px 20px -30px',
          padding: '20px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0 }}>🔐 Admin Toegang</h3>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer'
          }}>
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #fee 0%, #fef0f0 100%)',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '14px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              required
              placeholder="admin@dinnertheater.nl"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#ffffff',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>Wachtwoord</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#ffffff',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              padding: '12px 24px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              background: '#ffffff',
              cursor: 'pointer'
            }} disabled={loading}>
              Annuleren
            </button>
            <button type="submit" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }} disabled={loading}>
              {loading ? 'Bezig met inloggen...' : '🔑 Inloggen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
