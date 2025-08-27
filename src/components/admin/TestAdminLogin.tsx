import React, { useState } from 'react';

interface TestAdminLoginProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const TestAdminLogin: React.FC<TestAdminLoginProps> = ({ onClose, onSuccess }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Test login - accepteert elke email/password combinatie voor demo
    setTimeout(() => {
      if (credentials.email && credentials.password) {
        // Simuleer succesvolle login
        localStorage.setItem('testAdmin', 'true');
        onClose();
        onSuccess?.();
        window.location.reload();
      } else {
        setError('Vul email en wachtwoord in');
      }
      setLoading(false);
    }, 1000);
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
          <h3 style={{ margin: 0 }}>🔐 Admin Toegang (TEST)</h3>
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
        
        <div style={{
          background: '#e3f2fd',
          border: '1px solid #2196f3',
          color: '#1976d2',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '13px'
        }}>
          💡 <strong>TEST MODUS:</strong> Vul willekeurige gegevens in om in te loggen
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: '#ffebee',
              border: '1px solid #f44336',
              color: '#c62828',
              padding: '10px',
              borderRadius: '6px',
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
            }}>Email (test)</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              required
              placeholder="test@admin.nl"
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
            }}>Wachtwoord (test)</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              required
              placeholder="test123"
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
              {loading ? '🔄 Inloggen...' : '🔑 Inloggen (TEST)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
