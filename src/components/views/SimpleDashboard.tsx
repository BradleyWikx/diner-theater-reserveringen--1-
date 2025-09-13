import React from 'react';

interface SimpleDashboardProps {
  setActiveView: (view: any) => void;
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ setActiveView }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      color: '#334155', 
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        background: '#A00000', 
        borderRadius: '16px', 
        padding: '2rem', 
        marginBottom: '2rem', 
        color: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
          🎭 Theater Dashboard
        </h1>
        <p style={{ fontSize: '1.1rem', margin: '0', opacity: '0.9' }}>
          Overzicht voor {new Date().toLocaleDateString('nl-NL', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </p>
        
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              €0
            </div>
            <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>Omzet vandaag</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              0
            </div>
            <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>Verwachte gasten</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '2rem', 
        marginBottom: '2rem' 
      }}>
        
        {/* Today's Show */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '16px', 
          padding: '2rem', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '12px',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#334155' }}>
              Geen voorstelling vandaag
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
              Een perfecte dag voor planning en voorbereiding van komende shows.
            </p>
            <button 
              onClick={() => setActiveView('planning')}
              style={{
                backgroundColor: '#A00000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              📅 Bekijk Planning
            </button>
          </div>
        </div>

        {/* Action Center */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '16px', 
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1rem' 
          }}>
            <span>⚠️</span>
            <h3 style={{ margin: '0', color: '#334155' }}>Actie Centrum</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div 
              onClick={() => setActiveView('approvals')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{
                backgroundColor: '#ff4444',
                color: '#ffffff',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>0</div>
              <div style={{ flex: '1' }}>
                <div style={{ display: 'block', color: '#334155', fontWeight: '500' }}>
                  Goedkeuringen
                </div>
                <div style={{ display: 'block', color: '#64748b', fontSize: '0.85rem' }}>
                  Wachten op bevestiging
                </div>
              </div>
              <span>→</span>
            </div>
            
            <div 
              onClick={() => setActiveView('waitlist')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{
                backgroundColor: '#3498db',
                color: '#ffffff',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>0</div>
              <div style={{ flex: '1' }}>
                <div style={{ display: 'block', color: '#334155', fontWeight: '500' }}>
                  Wachtlijst
                </div>
                <div style={{ display: 'block', color: '#64748b', fontSize: '0.85rem' }}>
                  Actieve aanvragen
                </div>
              </div>
              <span>→</span>
            </div>
            
            <div 
              onClick={() => setActiveView('planning')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{
                backgroundColor: '#27ae60',
                color: '#ffffff',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>0</div>
              <div style={{ flex: '1' }}>
                <div style={{ display: 'block', color: '#334155', fontWeight: '500' }}>
                  Komende Shows
                </div>
                <div style={{ display: 'block', color: '#64748b', fontSize: '0.85rem' }}>
                  Geplande voorstellingen
                </div>
              </div>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem' 
      }}>
        
        {/* Analytics Card */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '16px', 
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1rem' 
          }}>
            <span>📈</span>
            <h3 style={{ margin: '0', color: '#334155' }}>Prestatie Analytics</h3>
            <span style={{ color: '#64748b', fontSize: '0.85rem', marginLeft: 'auto' }}>
              Laatste 7 dagen
            </span>
          </div>
          <div style={{ 
            height: '200px', 
            backgroundColor: '#f1f5f9', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}>
            📊 Analytics grafiek komt hier
          </div>
        </div>

        {/* Activity Feed */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '16px', 
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1rem' 
          }}>
            <span>⚡</span>
            <h3 style={{ margin: '0', color: '#334155' }}>Live Activiteit</h3>
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📥</div>
            <p style={{ margin: '0.5rem 0', color: '#334155' }}>Geen recente activiteit</p>
            <span style={{ fontSize: '0.9rem' }}>
              Nieuwe boekingen verschijnen hier automatisch
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
