import React from 'react';
import { ShowEvent } from '../../types/types';
import { getShowTimes } from '../../utils/utilities';

// Simple Icon fallback component
const SimpleIcon: React.FC<{ id: string }> = ({ id }) => {
    const iconMap: { [key: string]: string } = {
      'dashboard': '📊',
      'alert-triangle': '⚠️',
      'chevron-right': '→',
      'chart': '📈',
      'activity': '⚡',
      'inbox': '📥',
      'calendar-day': '📅',
      'check': '✓'
    };
    
    return <span style={{ marginRight: '0.5rem' }}>{iconMap[id] || '•'}</span>;
  };

interface HeroCardProps {
  todaysShow: ShowEvent | undefined;
  stats: {
    expectedGuests: number;
    checkedInGuests: number;
    checkinProgress: number;
    totalRevenue: number;
  };
  showImage: string | null;
  aiDailyBriefing: string | null;
  setActiveView: (view: string) => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({ todaysShow, stats, showImage, aiDailyBriefing, setActiveView }) => {
  const showTimes = todaysShow ? getShowTimes(new Date(todaysShow.date + 'T12:00:00'), todaysShow.type) : null;

  return (
    <div className="hero-today-card">
      {todaysShow ? (
        <div 
          className="hero-show-content"
          style={{
            backgroundImage: showImage ? `url(${showImage})` : 'none',
          }}
        >
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="show-badge">{todaysShow.type}</div>
            <h2 className="show-title">{todaysShow.name}</h2>
            
            <div className="show-stats-row">
              <div className="show-stat">
                <div className="stat-icon">🎭</div>
                <div>
                  <div className="stat-number">{showTimes?.start || '--:--'}</div>
                  <div className="stat-text">Aanvang</div>
                </div>
              </div>
              <div className="show-stat">
                <div className="stat-icon">👥</div>
                <div>
                  <div className="stat-number">{stats.expectedGuests}</div>
                  <div className="stat-text">Gasten</div>
                </div>
              </div>
              <div className="show-stat">
                <div className="stat-icon">💰</div>
                <div>
                  <div className="stat-number">€{stats.totalRevenue}</div>
                  <div className="stat-text">Omzet</div>
                </div>
              </div>
            </div>

            <div className="checkin-section">
              <div className="checkin-header">
                <span>Check-in Voortgang</span>
                <span className="checkin-numbers">{stats.checkedInGuests} / {stats.expectedGuests}</span>
              </div>
              <div className="premium-progress-bar">
                <div 
                  className="premium-progress-fill" 
                  style={{ width: `${stats.checkinProgress}%`}}
                ></div>
              </div>
            </div>

            {aiDailyBriefing && (
              <div className="ai-briefing-section">
                <div className="briefing-header">
                  <SimpleIcon id="activity" />
                  <span>AI Dagelijkse Briefing</span>
                </div>
                <p className="briefing-text">{aiDailyBriefing}</p>
              </div>
            )}

            <button 
              className="hero-action-button" 
              onClick={() => setActiveView('capacity')}
            >
              <SimpleIcon id="check" />
              Start Check-in Beheer
            </button>
          </div>
        </div>
      ) : (
        <div className="no-show-hero">
          <div className="no-show-icon">🎭</div>
          <h2>Geen voorstelling vandaag</h2>
          <p>Een perfecte dag voor beheer en voorbereiding van komende shows.</p>
          <button 
            className="secondary-action-button"
            onClick={() => setActiveView('calendar')}
          >
            <SimpleIcon id="calendar-day" />
            Bekijk Kalender
          </button>
        </div>
      )}
    </div>
  );
};
