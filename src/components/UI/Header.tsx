// Header Component - Navigation header for the application
import React from 'react';

interface HeaderProps {
  currentView?: string;
  setCurrentView?: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  return (
    <header className="main-header">
      <div className="header-container">
        <div className="flex items-center">
          <h1 className="logo">
            Inspiration Point Theater
          </h1>
        </div>
        
        {setCurrentView && (
          <nav className="main-nav">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`nav-button ${currentView === 'calendar' ? 'active' : ''}`}
            >
              Kalender
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};