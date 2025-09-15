// Header Component - Navigation header for the application
import React from 'react';

interface HeaderProps {
  currentView?: string;
  setCurrentView?: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  return (
    <header className="theater-header">
      <div className="theater-header-container">
        <div className="theater-header-content">
          <div className="theater-header-brand">
            <h1 className="theater-title">
              🎭 Diner Theater Reserveringen
            </h1>
            <span className="theater-subtitle">Inspiration Point Valkenswaard</span>
          </div>
          
          {setCurrentView && (
            <nav className="theater-nav">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`theater-nav-btn ${
                  currentView === 'dashboard' ? 'theater-nav-btn--active' : ''
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setCurrentView('calendar')}
                className={`theater-nav-btn ${
                  currentView === 'calendar' ? 'theater-nav-btn--active' : ''
                }`}
              >
                📅 Kalender
              </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};