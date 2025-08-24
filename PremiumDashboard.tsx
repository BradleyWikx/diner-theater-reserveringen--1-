import React, { useState, useEffect } from 'react';

interface PremiumDashboardProps {
  config: any;
  i18n: any;
}

const PremiumDashboard: React.FC<PremiumDashboardProps> = ({ config, i18n }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data - in real app this would come from props/API
  const kpiData = {
    occupancy: 0,
    checkedIn: 0,
    expected: 0,
    totalRevenue: 0
  };

  const quickActions = [
    { 
      id: 'checkin', 
      icon: '📱', 
      title: 'Check-in Center', 
      subtitle: '0 wachtend',
      color: 'theater-primary',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'booking', 
      icon: '🎫', 
      title: 'Snelle Boeking', 
      subtitle: 'Walk-in gasten',
      color: 'theater-secondary',
      bgGradient: 'from-yellow-500 to-yellow-600'
    },
    { 
      id: 'broadcast', 
      icon: '📢', 
      title: 'Broadcast', 
      subtitle: 'Bericht naar gasten',
      color: 'success',
      bgGradient: 'from-green-500 to-green-600'
    },
    { 
      id: 'payments', 
      icon: '💳', 
      title: 'Betalingen', 
      subtitle: 'Refunds & aanpassingen',
      color: 'warning',
      bgGradient: 'from-orange-500 to-orange-600'
    },
    { 
      id: 'emergency', 
      icon: '🚨', 
      title: 'Noodsituatie', 
      subtitle: 'Show management',
      color: 'danger',
      bgGradient: 'from-red-500 to-red-600'
    },
    { 
      id: 'analytics', 
      icon: '📊', 
      title: 'Live Analytics', 
      subtitle: 'Real-time inzichten',
      color: 'info',
      bgGradient: 'from-purple-500 to-purple-600'
    }
  ];

  const upcomingShows = [
    {
      date: '22',
      month: 'AUG',
      title: 'The Phantom of the Opera',
      type: 'Doordeweeks',
      capacity: '0/220 gasten',
      status: 'active'
    },
    {
      date: '29',
      month: 'AUG', 
      title: 'The Phantom of the Opera',
      type: 'Doordeweeks',
      capacity: '0/220 gasten',
      status: 'active'
    }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="premium-dashboard">
      {/* Hero Header */}
      <div className="dashboard-hero-section">
        <div className="hero-content">
          <div className="hero-title-section">
            <h1 className="hero-title">
              🎭 Welkom bij het Theater Dashboard
            </h1>
            <p className="hero-subtitle">Geen show vandaag - Rustige dag</p>
          </div>
          <div className="hero-time-section">
            <div className="live-clock">
              <div className="time-display">{formatTime(currentTime)}</div>
              <div className="date-display">{formatDate(currentTime)}</div>
            </div>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="theater-mask mask-1">🎭</div>
          <div className="theater-mask mask-2">🎪</div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card occupancy">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <div className="kpi-value">{kpiData.occupancy}%</div>
            <div className="kpi-label">Bezetting Vandaag</div>
            <div className="kpi-progress">
              <div className="progress-bar" style={{ width: `${kpiData.occupancy}%` }}></div>
            </div>
          </div>
        </div>
        
        <div className="kpi-card checked-in">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <div className="kpi-value">{kpiData.checkedIn}</div>
            <div className="kpi-label">Ingecheckt</div>
            <div className="kpi-trend positive">+0%</div>
          </div>
        </div>
        
        <div className="kpi-card expected">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-content">
            <div className="kpi-value">{kpiData.expected}</div>
            <div className="kpi-label">Verwacht</div>
            <div className="kpi-trend neutral">0%</div>
          </div>
        </div>

        <div className="kpi-card revenue">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <div className="kpi-value">€{kpiData.totalRevenue}</div>
            <div className="kpi-label">Totale Omzet</div>
            <div className="kpi-trend positive">+0%</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Snelle Acties</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <div key={action.id} className={`action-card ${action.color}`}>
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h3 className="action-title">{action.title}</h3>
                <p className="action-subtitle">{action.subtitle}</p>
              </div>
              <div className="action-badge">
                {action.id === 'checkin' && '0'}
                {action.id === 'emergency' && '!'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="main-content-grid">
        {/* Left Column - Activity & Guests */}
        <div className="content-column-left">
          {/* Today's Guests */}
          <div className="content-card guests-card">
            <h3 className="card-title">🎭 Vandaag's Gasten</h3>
            <div className="empty-state">
              <div className="empty-icon">🏖️</div>
              <h4 className="empty-title">Geen gasten vandaag</h4>
              <p className="empty-text">Tijd voor onderhoud of planning!</p>
            </div>
          </div>

          {/* Live Activity */}
          <div className="content-card activity-card">
            <h3 className="card-title">📈 Live Activiteit</h3>
            <div className="activity-item">
              <div className="activity-indicator">●</div>
              <div className="activity-content">
                <div className="activity-icon">😴</div>
                <span className="activity-text">Rustige periode</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Performance & Shows */}
        <div className="content-column-right">
          {/* Performance Metrics */}
          <div className="content-card performance-card">
            <h3 className="card-title">⚡ Performance</h3>
            <div className="performance-grid">
              <div className="performance-item">
                <div className="performance-icon">📊</div>
                <div className="performance-value">0.0%</div>
                <div className="performance-label">Conversie Rate</div>
              </div>
              <div className="performance-item">
                <div className="performance-icon">💰</div>
                <div className="performance-value">€0</div>
                <div className="performance-label">Gem. Bestelling</div>
              </div>
              <div className="performance-item">
                <div className="performance-icon">👥</div>
                <div className="performance-value">0</div>
                <div className="performance-label">Wachtlijst</div>
              </div>
              <div className="performance-item">
                <div className="performance-icon">⭐</div>
                <div className="performance-value">0</div>
                <div className="performance-label">VIP Gasten</div>
              </div>
            </div>
          </div>

          {/* Upcoming Shows */}
          <div className="content-card shows-card">
            <h3 className="card-title">📅 Komende Shows</h3>
            <div className="shows-list">
              {upcomingShows.map((show, index) => (
                <div key={index} className="show-item">
                  <div className="show-date">
                    <div className="show-day">{show.date}</div>
                    <div className="show-month">{show.month}</div>
                  </div>
                  <div className="show-details">
                    <h4 className="show-title">{show.title}</h4>
                    <p className="show-info">{show.type} • {show.capacity}</p>
                  </div>
                  <div className="show-status">🎯</div>
                </div>
              ))}
            </div>
            <div className="shows-footer">
              <a href="#" className="view-calendar-link">Volledige Kalender →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumDashboard;
