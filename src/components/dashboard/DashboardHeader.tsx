import React from 'react';

interface DashboardHeaderProps {
  totalRevenue: number;
  expectedGuests: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ totalRevenue, expectedGuests }) => {
  return (
    <div className="dashboard-welcome">
      <div className="welcome-text">
        <h1>🎭 Theater Dashboard</h1>
        <p>Overzicht voor {new Date().toLocaleDateString('nl-NL', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })}.</p>
      </div>
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="stat-value">€{totalRevenue.toLocaleString()}</span>
          <span className="stat-label">Omzet vandaag</span>
        </div>
        <div className="quick-stat">
          <span className="stat-value">{expectedGuests}</span>
          <span className="stat-label">Verwachte gasten</span>
        </div>
      </div>
    </div>
  );
};
