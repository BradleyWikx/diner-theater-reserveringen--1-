import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout, AdminCard, AdminGrid, AdminButton, AdminBadge } from './src/components/layout';
import { AdminDashboardView } from './src/components/views/AdminDashboardView';
import type { ShowEvent, Reservation, AppConfig, WaitingListEntry } from './src/types/types';

interface PremiumDashboardProps {
  config: AppConfig;
  i18n: any;
  showEvents?: ShowEvent[];
  reservations?: Reservation[];
  waitingList?: WaitingListEntry[];
  onNavigate?: (view: string, date?: string) => void;
}

const PremiumDashboard: React.FC<PremiumDashboardProps> = ({ 
  config, 
  i18n, 
  showEvents = [], 
  reservations = [], 
  waitingList = [],
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

  // Get upcoming shows (next 5)
  const upcomingShows = useMemo(() => {
    const today = new Date();
    return showEvents
      .filter(show => new Date(show.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
      .map(show => {
        const showReservations = reservations.filter(res => 
          res.date === show.date && res.showName === show.name
        );
        const bookedCount = showReservations.reduce((sum, res) => sum + res.guests, 0);
        
        return {
          ...show,
          bookedCount,
          availableSpots: show.capacity - bookedCount,
          occupancyPercent: Math.round((bookedCount / show.capacity) * 100)
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
        case 'approvals':
          onNavigate('approvals');
          break;
        case 'capacity':
          onNavigate('capacity');
          break;
        case 'planning':
          onNavigate('planning');
          break;
        default:
          onNavigate(action);
      }
    }
  };

  const getOccupancyBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    if (percentage >= 50) return 'info';
    return 'success';
  };

  return (
    <AdminLayout
      title="🎭 Reserveringen Dashboard"
      subtitle={dashboardMetrics.todaysShows > 0 
        ? `${dashboardMetrics.todaysShows} show${dashboardMetrics.todaysShows !== 1 ? 's' : ''} vandaag`
        : 'Geen shows vandaag'
      }
      actions={
        <div className="dashboard-time text-right">
          <div className="text-lg font-semibold text-admin-text-primary">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-admin-text-secondary">
            {formatDate(currentTime)}
          </div>
        </div>
      }
    >
      {/* Key Metrics */}
      <AdminGrid columns="responsive" gap="lg" className="mb-xl">
        <AdminCard variant="elevated">
          <div className="flex items-center gap-md">
            <div className="dashboard-metric-icon bg-admin-primary-light text-admin-primary-dark">
              📊
            </div>
            <div className="flex-1">
              <div className="dashboard-metric-value text-admin-primary">
                {dashboardMetrics.totalBooked}
              </div>
              <div className="dashboard-metric-label">Geboekt Vandaag</div>
              <div className="dashboard-metric-extra">
                {dashboardMetrics.totalCapacity} plaatsen totaal
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="elevated">
          <div className="flex items-center gap-md">
            <div className="dashboard-metric-icon bg-admin-success-light text-admin-success-dark">
              📈
            </div>
            <div className="flex-1">
              <div className="dashboard-metric-value text-admin-success">
                {dashboardMetrics.occupancy}%
              </div>
              <div className="dashboard-metric-label">Bezetting</div>
              <div className="dashboard-metric-progress">
                <div 
                  className="dashboard-progress-fill" 
                  style={{ 
                    width: `${dashboardMetrics.occupancy}%`,
                    backgroundColor: 'var(--admin-success)'
                  }}
                />
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="elevated">
          <div className="flex items-center gap-md">
            <div className="dashboard-metric-icon bg-admin-warning-light text-admin-warning-dark">
              💰
            </div>
            <div className="flex-1">
              <div className="dashboard-metric-value text-admin-warning">
                €{dashboardMetrics.totalRevenue}
              </div>
              <div className="dashboard-metric-label">Omzet Vandaag</div>
              <div className="dashboard-metric-extra">
                Ø €{dashboardMetrics.avgReservation}/reservering
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="elevated">
          <div className="flex items-center gap-md">
            <div className="dashboard-metric-icon bg-admin-info-light text-admin-info-dark">
              ✅
            </div>
            <div className="flex-1">
              <div className="dashboard-metric-value text-admin-info">
                {dashboardMetrics.checkedIn}
              </div>
              <div className="dashboard-metric-label">Ingecheckt</div>
              <div className="dashboard-metric-extra">
                {dashboardMetrics.pendingCheckIn} wachten nog
              </div>
            </div>
          </div>
        </AdminCard>
      </AdminGrid>

      {/* Quick Actions */}
      <AdminCard title="Snelle Acties" className="mb-xl">
        <AdminGrid columns={2} gap="md">
          <AdminButton
            variant="primary"
            size="lg"
            onClick={() => handleQuickAction('newBooking')}
            className="dashboard-action-btn"
          >
            <div className="flex items-center gap-md">
              <span className="dashboard-action-icon">➕</span>
              <div className="text-left">
                <div className="dashboard-action-title">Nieuwe Reservering</div>
                <div className="dashboard-action-subtitle">Walk-in of telefonisch</div>
              </div>
            </div>
          </AdminButton>

          <AdminButton
            variant="success"
            size="lg"
            onClick={() => handleQuickAction('todayReservations')}
            className="dashboard-action-btn"
          >
            <div className="flex items-center gap-md">
              <span className="dashboard-action-icon">📅</span>
              <div className="text-left">
                <div className="dashboard-action-title">Vandaag's Reserveringen</div>
                <div className="dashboard-action-subtitle">
                  {dashboardMetrics.totalBooked} reserveringen
                </div>
              </div>
            </div>
          </AdminButton>

          <AdminButton
            variant="warning"
            size="lg"
            onClick={() => handleQuickAction('calendar')}
            className="dashboard-action-btn"
          >
            <div className="flex items-center gap-md">
              <span className="dashboard-action-icon">📆</span>
              <div className="text-left">
                <div className="dashboard-action-title">Kalender</div>
                <div className="dashboard-action-subtitle">Planning overzicht</div>
              </div>
            </div>
          </AdminButton>

          <AdminButton
            variant="secondary"
            size="lg"
            onClick={() => handleQuickAction('waitlist')}
            className="dashboard-action-btn"
          >
            <div className="flex items-center gap-md">
              <span className="dashboard-action-icon">⏳</span>
              <div className="text-left">
                <div className="dashboard-action-title">Wachtlijst</div>
                <div className="dashboard-action-subtitle">Wachtende gasten</div>
              </div>
            </div>
          </AdminButton>
        </AdminGrid>
      </AdminCard>

      {/* Upcoming Shows */}
      <AdminCard title="Komende Shows" className="mb-xl">
        {upcomingShows.length === 0 ? (
          <div className="text-center p-xl">
            <div className="text-4xl mb-md">📅</div>
            <h3 className="text-xl font-semibold text-admin-text-primary mb-sm">
              Geen shows gepland
            </h3>
            <p className="text-admin-text-secondary mb-lg">
              Begin met het toevoegen van shows aan de kalender
            </p>
            <AdminButton 
              variant="primary"
              onClick={() => handleQuickAction('calendar')}
            >
              Ga naar Kalender
            </AdminButton>
          </div>
        ) : (
          <AdminGrid columns={1} gap="md">
            {upcomingShows.map((show, index) => (
              <div key={`${show.date}-${show.name}`} className="dashboard-show-card">
                <div className="flex items-center justify-between gap-md p-md border rounded-lg border-admin-border hover:border-admin-border-hover transition-all">
                  <div className="flex items-center gap-md">
                    <div className="dashboard-show-date">
                      <div className="text-2xl font-bold text-admin-primary">
                        {new Date(show.date).getDate()}
                      </div>
                      <div className="text-xs text-admin-text-secondary uppercase">
                        {new Date(show.date).toLocaleDateString('nl-NL', { month: 'short' })}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-admin-text-primary mb-xs">
                        {show.name}
                      </h4>
                      <div className="flex items-center gap-md text-sm text-admin-text-secondary">
                        <span>🕒 {show.time}</span>
                        <span>👥 {show.bookedCount}/{show.capacity}</span>
                        <AdminBadge 
                          variant={getOccupancyBadgeVariant(show.occupancyPercent)}
                          size="sm"
                        >
                          {show.occupancyPercent}%
                        </AdminBadge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-sm">
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickAction('reservations', show.date)}
                    >
                      Details
                    </AdminButton>
                  </div>
                </div>
              </div>
            ))}
          </AdminGrid>
        )}
      </AdminCard>

      {/* Quick Stats */}
      <AdminGrid columns={3} gap="md">
        <AdminCard variant="ghost">
          <div className="text-center">
            <div className="text-2xl font-bold text-admin-primary mb-xs">
              {reservations.length}
            </div>
            <div className="text-sm text-admin-text-secondary">
              Totaal Reserveringen
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="ghost">
          <div className="text-center">
            <div className="text-2xl font-bold text-admin-success mb-xs">
              {showEvents.length}
            </div>
            <div className="text-sm text-admin-text-secondary">
              Geplande Shows
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="ghost">
          <div className="text-center">
            <div className="text-2xl font-bold text-admin-warning mb-xs">
              €{reservations.reduce((sum, res) => sum + (res.totalPrice || 0), 0)}
            </div>
            <div className="text-sm text-admin-text-secondary">
              Totale Omzet
            </div>
          </div>
        </AdminCard>
      </AdminGrid>
    </AdminLayout>
  );
};

export default PremiumDashboard;
