import React, { useState, memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminLogin } from './AdminLogin-Simple';
import { logoutAdmin } from '../../firebase/config';

interface DiscreteAdminButtonProps {
  onAdminLogin?: () => void;
  onAdminLogout?: () => void;
}

export const DiscreteAdminButton: React.FC<DiscreteAdminButtonProps> = memo(({ onAdminLogin, onAdminLogout }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const { isAdmin, user, loading } = useAuth();

  // Niet renderen tijdens loading om knippereffect te voorkomen
  if (loading) {
    return null;
  }

  const handleClick = () => {
    if (isAdmin) {
      // Als admin ingelogd is, toon admin opties
      const userChoice = window.confirm('Admin opties:\n\n✅ Dashboard openen\n❌ Uitloggen\n\nKlik OK voor Dashboard, Annuleren voor Uitloggen');
      
      if (userChoice) {
        // Navigeer naar admin dashboard
        onAdminLogin?.();
      } else {
        handleLogout();
      }
      return;
    }

    // Voor niet-ingelogde gebruikers: discrete toegang via meerdere clicks
    setClickCount(prev => prev + 1);
    
    // Reset click count na 3 seconden
    setTimeout(() => setClickCount(0), 3000);
    
    // Na 3 clicks binnen 3 seconden, toon login
    if (clickCount >= 2) {
      setShowLogin(true);
      setClickCount(0);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      onAdminLogout?.(); // Call the logout callback first
      window.location.reload();
    } catch (error) {
      // Silent error handling
    }
  };

  return (
    <>
      <div 
        onClick={handleClick}
        title={isAdmin ? `Ingelogd als admin: ${user?.email?.split('@')[0]} - Klik voor opties` : ""}
        style={{
          position: 'fixed',
          bottom: '15px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          border: isAdmin ? '2px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          cursor: 'pointer',
          color: isAdmin ? '#22c55e' : 'white',
          zIndex: 1000,
          userSelect: 'none',
          transition: 'all 0.3s ease',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: 'normal',
          boxShadow: isAdmin ? '0 2px 8px rgba(34, 197, 94, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)'
        }}
        onMouseEnter={(e) => {
          const target = e.target as HTMLElement;
          target.style.background = isAdmin ? 'rgba(34, 197, 94, 0.2)' : 'rgba(0, 0, 0, 0.9)';
          target.style.boxShadow = isAdmin ? '0 4px 16px rgba(34, 197, 94, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.4)';
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLElement;
          target.style.background = 'rgba(0, 0, 0, 0.8)';
          target.style.boxShadow = isAdmin ? '0 2px 8px rgba(34, 197, 94, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.3)';
        }}
      >
        <span style={{ fontSize: '16px' }}>{isAdmin ? '⚙️' : '©'}</span>
        <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
          Alle rechten voorbehouden | Inspiration Point Valkenswaard
        </span>
      </div>
      
      {showLogin && (
        <AdminLogin 
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            setShowLogin(false);
            onAdminLogin?.();
          }}
        />
      )}
    </>
  );
});
