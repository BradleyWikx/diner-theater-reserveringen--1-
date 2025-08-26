import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout, AdminCard, AdminGrid, AdminButton, AdminBadge } from './src/components/layout';
import type { ShowEvent, Reservation, AppConfig } from './src/types/types';

interface PremiumDashboardProps {
  config: AppConfig;
  i18n: any;
  showEvents?: ShowEvent[];
  reservations?: Reservation[];
  onNavigate?: (view: string, date?: string) => void;
}

const PremiumDashboard: React.FC<PremiumDashboardProps> = ({ 
  config, 
  i18n, 
  showEvents = [], 
  reservations = [], 
  onNavigate 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every minute (more efficient)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate real dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysShows = showEvents.filter(show => show.date === today);
    const todaysReservations = reservations.filter(res => res.date === today);
    
    const totalCapacity = todaysShows.reduce((sum, show) => sum + show.capacity, 0);
    const totalBooked = todaysReservations.reduce((sum, res) => sum + res.guests, 0);
    const checkedIn = todaysReservations.filter(res => res.checkedIn).length;
    const totalRevenue = todaysReservations.reduce((sum, res) => sum + (res.totalPrice || 0), 0);
    
    return {
      todaysShows: todaysShows.length,
      totalCapacity,
      totalBooked,
      occupancy: totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0,
      checkedIn,
      pendingCheckIn: todaysReservations.length - checkedIn,
      totalRevenue,
      avgReservation: todaysReservations.length > 0 ? Math.round(totalRevenue / todaysReservations.length) : 0
    };
  }, [showEvents, reservations]);

  // Next 5 upcoming shows
  const upcomingShows = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return showEvents
      .filter(show => show.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5)
      .map(show => {
        const showReservations = reservations.filter(res => res.date === show.date && res.showName === show.name);
        const bookedGuests = showReservations.reduce((sum, res) => sum + res.guests, 0);
        
        return {
          ...show,
          booked: bookedGuests,
          available: show.capacity - bookedGuests,
          percentage: Math.round((bookedGuests / show.capacity) * 100)
        };
      });
  }, [showEvents, reservations]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const handleQuickAction = (action: string, data?: any) => {
    if (onNavigate) {
      switch (action) {
        case 'newBooking':
          onNavigate('book');
          break;
        case 'todayReservations':
          onNavigate('reservations', new Date().toISOString().split('T')[0]);
          break;
        case 'calendar':
          onNavigate('calendar');
          break;
        case 'waitlist':
          onNavigate('waitlist');
          break;
        default:
          onNavigate(action);
      }
    }
  };

  return (
    <div className="reservation-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h1>🎭 Reserveringen Dashboard</h1>
            <p className="header-subtitle">
              {dashboardMetrics.todaysShows > 0 
                ? `${dashboardMetrics.todaysShows} show${dashboardMetrics.todaysShows !== 1 ? 's' : ''} vandaag`
                : 'Geen shows vandaag'
              }
            </p>
          </div>
          <div className="header-time">
            <div className="current-time">{formatTime(currentTime)}</div>
            <div className="current-date">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">�</div>
          <div className="metric-content">
            <div className="metric-value">{dashboardMetrics.totalBooked}</div>
            <div className="metric-label">Geboekt Vandaag</div>
            <div className="metric-extra">{dashboardMetrics.totalCapacity} plaatsen totaal</div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-value">{dashboardMetrics.occupancy}%</div>
            <div className="metric-label">Bezetting</div>
            <div className="metric-progress">
              <div className="progress-fill" style={{ width: `${dashboardMetrics.occupancy}%` }}></div>
            </div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{dashboardMetrics.checkedIn}</div>
            <div className="metric-label">Ingecheckt</div>
            <div className="metric-extra">{dashboardMetrics.pendingCheckIn} nog te gaan</div>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-value">€{dashboardMetrics.totalRevenue}</div>
            <div className="metric-label">Omzet Vandaag</div>
            <div className="metric-extra">Ø €{dashboardMetrics.avgReservation}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Snelle Acties</h2>
        <div className="actions-grid">
          <button 
            className="action-btn primary" 
            onClick={() => handleQuickAction('newBooking')}
          >
            <span className="action-icon">➕</span>
            <div className="action-content">
              <div className="action-title">Nieuwe Reservering</div>
              <div className="action-subtitle">Walk-in of telefonisch</div>
            </div>
          </button>

          <button 
            className="action-btn success" 
            onClick={() => handleQuickAction('todayReservations')}
          >
            <span className="action-icon">📅</span>
            <div className="action-content">
              <div className="action-title">Vandaag's Reserveringen</div>
              <div className="action-subtitle">{dashboardMetrics.totalBooked} reserveringen</div>
            </div>
          </button>

          <button 
            className="action-btn warning" 
            onClick={() => handleQuickAction('calendar')}
          >
            <span className="action-icon">📆</span>
            <div className="action-content">
              <div className="action-title">Kalender</div>
              <div className="action-subtitle">Planning overzicht</div>
            </div>
          </button>

          <button 
            className="action-btn info" 
            onClick={() => handleQuickAction('waitlist')}
          >
            <span className="action-icon">⏳</span>
            <div className="action-content">
              <div className="action-title">Wachtlijst</div>
              <div className="action-subtitle">Wachtende gasten</div>
            </div>
          </button>
        </div>
      </div>

      {/* Upcoming Shows */}
      <div className="upcoming-shows">
        <h2>Komende Shows</h2>
        {upcomingShows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>Geen shows gepland</h3>
            <p>Begin met het toevoegen van shows aan de kalender</p>
            <button 
              className="btn btn-primary" 
              onClick={() => handleQuickAction('calendar')}
            >
              Ga naar Kalender
            </button>
          </div>
        ) : (
          <div className="shows-list">
            {upcomingShows.map((show, index) => (
              <div key={`${show.date}-${show.name}`} className="show-card">
                <div className="show-date">
                  <div className="show-day">{new Date(show.date).getDate()}</div>
                  <div className="show-month">
                    {new Date(show.date).toLocaleDateString('nl-NL', { month: 'short' }).toUpperCase()}
                  </div>
                </div>
                
                <div className="show-info">
                  <h3 className="show-name">{show.name}</h3>
                  <div className="show-details">
                    <span className="show-type">{show.type}</span>
                    <span className="show-time">{show.showTime || '19:30'}</span>
                  </div>
                </div>
                
                <div className="show-capacity">
                  <div className="capacity-info">
                    <div className="capacity-numbers">
                      <span className="booked">{show.booked}</span>
                      <span className="separator">/</span>
                      <span className="total">{show.capacity}</span>
                    </div>
                    <div className="capacity-label">gasten</div>
                  </div>
                  <div className="capacity-bar">
                    <div 
                      className="capacity-fill" 
                      style={{ 
                        width: `${show.percentage}%`,
                        backgroundColor: show.percentage >= 90 ? '#ef4444' : 
                                       show.percentage >= 70 ? '#f59e0b' : '#10b981'
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="show-actions">
                  <button 
                    className="show-action-btn"
                    onClick={() => handleQuickAction('reservations', show.date)}
                    title="Bekijk reserveringen"
                  >
                    👥
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumDashboard;
