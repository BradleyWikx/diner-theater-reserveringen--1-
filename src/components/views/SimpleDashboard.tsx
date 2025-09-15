import React from 'react';

interface SimpleDashboardProps {
  setActiveView: (view: any) => void;
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ setActiveView }) => {
  return (
    <div className="theater-dashboard">
      {/* Dashboard Header */}
      <div className="theater-dashboard-header">
        <h1 className="theater-dashboard-title">
          🎭 Theater Dashboard
        </h1>
        <p className="theater-dashboard-subtitle">
          Overzicht voor {new Date().toLocaleDateString('nl-NL', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </p>
        
        <div className="theater-dashboard-stats">
          <div className="theater-stat-card">
            <div className="theater-stat-value">€0</div>
            <div className="theater-stat-label">Omzet vandaag</div>
          </div>
          <div className="theater-stat-card">
            <div className="theater-stat-value">0</div>
            <div className="theater-stat-label">Verwachte gasten</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="theater-dashboard-grid">
        
        {/* Today's Show Card */}
        <div className="theater-card theater-card--main">
          <div className="theater-no-show-hero">
            <div className="theater-no-show-icon">🎭</div>
            <h2 className="theater-no-show-title">
              Geen voorstelling vandaag
            </h2>
            <p className="theater-no-show-description">
              Een perfecte dag voor planning en voorbereiding van komende shows.
            </p>
            <button 
              onClick={() => setActiveView('planning')}
              className="admin-btn admin-btn--primary admin-btn--lg"
            >
              📅 Bekijk Planning
            </button>
          </div>
        </div>

        {/* Action Center */}
        <div className="theater-card">
          <div className="theater-card-header">
            <div className="theater-card-icon">⚠️</div>
            <h3 className="theater-card-title">Actie Centrum</h3>
          </div>
          
          <div className="theater-action-list">
            <div 
              onClick={() => setActiveView('approvals')}
              className="theater-action-item"
            >
              <div className="theater-action-badge theater-action-badge--danger">
                0
              </div>
              <div className="theater-action-content">
                <div className="theater-action-title">Goedkeuringen</div>
                <div className="theater-action-desc">Wachten op bevestiging</div>
              </div>
              <div className="theater-action-arrow">→</div>
            </div>
            
            <div 
              onClick={() => setActiveView('waitlist')}
              className="theater-action-item"
            >
              <div className="theater-action-badge theater-action-badge--warning">
                0
              </div>
              <div className="theater-action-content">
                <div className="theater-action-title">Wachtlijst</div>
                <div className="theater-action-desc">Actieve aanvragen</div>
              </div>
              <div className="theater-action-arrow">→</div>
            </div>
            
            <div 
              onClick={() => setActiveView('planning')}
              className="theater-action-item"
            >
              <div className="theater-action-badge theater-action-badge--primary">
                0
              </div>
              <div className="theater-action-content">
                <div className="theater-action-title">Komende Shows</div>
                <div className="theater-action-desc">Geplande voorstellingen</div>
              </div>
              <div className="theater-action-arrow">→</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Analytics Grid */}
      <div className="theater-analytics-grid">
        
        {/* Performance Analytics */}
        <div className="theater-card">
          <div className="theater-card-header">
            <div className="theater-card-icon">📈</div>
            <h3 className="theater-card-title">Prestatie Analytics</h3>
            <div className="theater-card-badge">Laatste 7 dagen</div>
          </div>
          <div className="theater-analytics-content">
            📊 Analytics grafiek komt hier
          </div>
        </div>

        {/* Live Activity */}
        <div className="theater-card">
          <div className="theater-card-header">
            <div className="theater-card-icon">⚡</div>
            <h3 className="theater-card-title">Live Activiteit</h3>
          </div>
          <div className="theater-activity-content">
            <div className="theater-activity-empty">
              <div className="theater-activity-icon">📥</div>
              <p className="theater-activity-message">Geen recente activiteit</p>
              <div className="theater-activity-hint">Nieuwe boekingen verschijnen hier automatisch</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};