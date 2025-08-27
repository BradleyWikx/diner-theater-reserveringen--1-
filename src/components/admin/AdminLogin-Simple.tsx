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
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginAdmin(credentials.email, credentials.password);
      
      // Onthoud gegevens in localStorage als gewenst
      if (rememberMe) {
        localStorage.setItem('adminEmail', credentials.email);
      } else {
        localStorage.removeItem('adminEmail');
      }
      
      onClose();
      
      // Trigger success callback direct - bypass auth check voor immediate admin access
      if (onSuccess) {
        // Zeer kleine vertraging zodat modal kan sluiten
        setTimeout(() => {
          onSuccess();
        }, 200);
      }
    } catch (error: any) {
      setError('Ongeldige inloggegevens. Controleer je email en wachtwoord.');
    } finally {
      setLoading(false);
    }
  };

  // Laad opgeslagen email bij component mount
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('adminEmail');
    if (savedEmail) {
      setCredentials(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div 
      style={{
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
      }}
      onClick={(e) => {
        // Alleen sluiten als je echt op de achtergrond klikt
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)',
          maxWidth: '400px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          margin: '-30px -30px 20px -30px',
          padding: '20px 30px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>🔐 Admin Toegang</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
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
            }}>
              Email
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              required
              placeholder="admin@dinnertheater.nl"
              autoComplete="username"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                color: '#000000',
                backgroundColor: '#ffffff'
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
            }}>
              Wachtwoord
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              required
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                color: '#000000',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#6b7280'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Email onthouden op dit apparaat
            </label>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end'
          }}>
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                border: '1px solid #d1d5db',
                background: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Annuleren
            </button>
            <button 
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Bezig...
                </>
              ) : (
                <>🔑 Inloggen</>
              )}
            </button>
          </div>
        </form>
        
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};
