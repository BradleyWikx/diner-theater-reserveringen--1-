import React from 'react';
import { ToastProvider } from './src/components/shared/ToastSystem';
import './src/styles/admin-design-system.css';
import './index.css';

// Simple test component to verify the dashboard is visible
const App: React.FC = () => {
  return (
    <ToastProvider>
      <div style={{ 
        padding: '2rem', 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div className="modern-dashboard">
          <div className="dashboard-welcome">
            <div className="welcome-text">
              <h1>Theater Dashboard - TEST</h1>
              <p>Als je dit ziet, werkt de CSS wel!</p>
            </div>
            <div className="quick-stats">
              <div className="quick-stat">
                <span className="stat-value">TEST</span>
                <span className="stat-label">CSS Werkt</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Test zonder CSS classes */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          margin: '2rem 0',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ color: '#1e293b', margin: 0 }}>Basis HTML Test</h2>
          <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>
            Dit zou ALTIJD zichtbaar moeten zijn, ongeacht CSS.
          </p>
        </div>
      </div>
    </ToastProvider>
  );
};

export default App;
