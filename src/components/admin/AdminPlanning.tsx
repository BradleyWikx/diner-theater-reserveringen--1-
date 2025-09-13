import React, { useState, useMemo } from 'react';
import { AdminLayout, AdminCard, AdminGrid, AdminButton, AdminBadge } from '../layout';
import { Calendar } from '../calendar/Calendar';
import type { ShowEvent, AppConfig } from '../../types/types';

interface AdminPlanningProps {
  showEvents: ShowEvent[];
  onDateClick: (date: string) => void;
  onMonthChange: (month: Date) => void;
  currentMonth: Date;
  selectedDate: string | null;
  guestCountMap: Map<string, number>;
  config: AppConfig;
  onAddShow?: (date: string) => void;
  onEditShow?: (showId: string) => void;
  onDeleteShow?: (showId: string) => void;
}

const AdminPlanning: React.FC<AdminPlanningProps> = ({
  showEvents = [],
  onDateClick,
  onMonthChange,
  currentMonth,
  selectedDate,
  guestCountMap,
  config,
  onAddShow,
  onEditShow,
  onDeleteShow
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Calculate statistics
  const stats = useMemo(() => {
    const totalShows = showEvents.length;
    const totalCapacity = showEvents.reduce((sum, show) => sum + (show.capacity || 50), 0);
    const totalGuests = Array.from(guestCountMap.values()).reduce((sum: number, count: number) => sum + count, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((Number(totalGuests) / totalCapacity) * 100) : 0;
    
    const upcomingShows = showEvents.filter(show => new Date(show.date) >= new Date()).length;
    const fullyBookedShows = showEvents.filter(show => {
      const guests = guestCountMap.get(show.date) || 0;
      return guests >= show.capacity;
    }).length;

    return {
      totalShows,
      upcomingShows,
      fullyBookedShows,
      totalCapacity,
      totalGuests,
      occupancyRate
    };
  }, [showEvents, guestCountMap]);

  // Get shows for current month
  const currentMonthShows = useMemo(() => {
    const monthStr = currentMonth.toISOString().slice(0, 7); // YYYY-MM format
    return showEvents.filter(show => show.date.startsWith(monthStr));
  }, [showEvents, currentMonth]);

  // Navigate months
  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + direction);
    onMonthChange(newDate);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const handleDayHover = (data: { event: ShowEvent; guests: number; element: HTMLDivElement } | null) => {
    // Handle day hover for tooltip/popover
    // This can be enhanced with a proper tooltip system
  };

  return (
    <AdminLayout
      title="📅 Planning & Kalender"
      subtitle="Overzicht van alle voorstellingen en evenementen"
      actions={
        <AdminGrid columns={4} gap="sm">
          <AdminButton
            variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            📅 Kalender
          </AdminButton>
          <AdminButton
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            📋 Lijst
          </AdminButton>
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => navigateMonth(-1)}
          >
            ← Vorige
          </AdminButton>
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => navigateMonth(1)}
          >
            Volgende →
          </AdminButton>
        </AdminGrid>
      }
    >
      {/* Statistics Grid */}
      <AdminGrid columns={6} gap="lg" className="mb-xl">
        <AdminCard variant="elevated" title="🎭 Totaal Shows">
          <div className="dashboard-metric-value text-admin-primary">
            {stats.totalShows}
          </div>
          <div className="dashboard-metric-label">
            Shows gepland
          </div>
        </AdminCard>
        
        <AdminCard variant="elevated" title="🔜 Komende Shows">
          <div className="dashboard-metric-value text-admin-info">
            {stats.upcomingShows}
          </div>
          <div className="dashboard-metric-label">
            Nog te komen
          </div>
        </AdminCard>
        
        <AdminCard variant="elevated" title="🔴 Volboekt">
          <div className="dashboard-metric-value text-admin-danger">
            {stats.fullyBookedShows}
          </div>
          <div className="dashboard-metric-label">
            Volledige bezetting
          </div>
        </AdminCard>
        
        <AdminCard variant="elevated" title="🎫 Capaciteit">
          <div className="dashboard-metric-value text-admin-warning">
            {stats.totalCapacity}
          </div>
          <div className="dashboard-metric-label">
            Totale plaatsen
          </div>
        </AdminCard>
        
        <AdminCard variant="elevated" title="👥 Gasten">
          <div className="dashboard-metric-value text-admin-success">
            {stats.totalGuests}
          </div>
          <div className="dashboard-metric-label">
            Gereserveerd
          </div>
        </AdminCard>
        
        <AdminCard variant="elevated" title="📊 Bezetting">
          <div className="dashboard-metric-value text-admin-primary">
            {stats.occupancyRate}%
          </div>
          <div className="dashboard-metric-label">
            Gemiddeld bezet
          </div>
          <div className="dashboard-metric-progress">
            <div 
              className="dashboard-progress-fill"
              style={{ 
                width: `${stats.occupancyRate}%`,
                backgroundColor: stats.occupancyRate > 80 ? 'var(--admin-success)' : 
                                stats.occupancyRate > 50 ? 'var(--admin-warning)' : 'var(--admin-info)'
              }}
            ></div>
          </div>
        </AdminCard>
      </AdminGrid>

      {viewMode === 'calendar' ? (
        /* Calendar View */
        <AdminCard variant="elevated" className="planning-calendar-card">
          <Calendar
            month={currentMonth}
            onMonthChange={onMonthChange}
            onDateClick={onDateClick}
            events={showEvents}
            guestCountMap={guestCountMap}
            selectedDate={selectedDate}
            view="admin"
            onDayHover={handleDayHover}
            config={config}
          />
        </AdminCard>
      ) : (
        /* List View */
        <AdminCard 
          variant="elevated" 
          title={`Shows in ${currentMonth.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`}
          subtitle={`${currentMonthShows.length} voorstellingen gepland`}
        >
          {currentMonthShows.length === 0 ? (
            <div className="planning-empty-state">
              <div style={{ fontSize: '3rem', marginBottom: 'var(--admin-space-lg)' }}>📅</div>
              <h3 style={{ marginBottom: 'var(--admin-space-md)', color: 'var(--admin-text-primary)' }}>
                Geen voorstellingen gepland
              </h3>
              <p style={{ color: 'var(--admin-text-secondary)', marginBottom: 'var(--admin-space-lg)' }}>
                Er zijn nog geen voorstellingen gepland voor {currentMonth.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}.
              </p>
              {onAddShow && (
                <AdminButton
                  variant="primary"
                  onClick={() => onAddShow(currentMonth.toISOString().split('T')[0])}
                >
                  ➕ Voeg Show Toe
                </AdminButton>
              )}
            </div>
          ) : (
            <div className="planning-shows-list">
              {currentMonthShows
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(show => {
                  const guests = guestCountMap.get(show.date) || 0;
                  const capacityPercent = (guests / show.capacity) * 100;
                  const isFull = guests >= show.capacity;
                  
                  return (
                    <div key={show.id} className="planning-show-item">
                      <div className="show-item-header">
                        <div className="show-date-info">
                          <div className="show-date">
                            {formatDate(show.date)}
                          </div>
                          <div className="show-time">
                            {show.time || '20:00'}
                          </div>
                        </div>
                        
                        <div className="show-main-info">
                          <h4 className="show-title">{show.name}</h4>
                          <div className="show-type-location">
                            <AdminBadge variant="info" size="sm">
                              {show.type}
                            </AdminBadge>
                            {show.location && (
                              <span className="show-location">📍 {show.location}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="show-capacity-info">
                          <div className="capacity-numbers">
                            <span className="guests-count">{guests}</span>
                            <span className="capacity-separator">/</span>
                            <span className="total-capacity">{show.capacity}</span>
                          </div>
                          <div className="capacity-progress">
                            <div 
                              className="capacity-bar"
                              style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                            ></div>
                          </div>
                          <div className="capacity-status">
                            {isFull ? (
                              <AdminBadge variant="danger" size="sm">Volboekt</AdminBadge>
                            ) : capacityPercent > 80 ? (
                              <AdminBadge variant="warning" size="sm">Bijna vol</AdminBadge>
                            ) : (
                              <AdminBadge variant="success" size="sm">Beschikbaar</AdminBadge>
                            )}
                          </div>
                        </div>
                        
                        <div className="show-actions">
                          {onEditShow && (
                            <AdminButton
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditShow(show.id)}
                            >
                              ✏️ Bewerk
                            </AdminButton>
                          )}
                          {onDeleteShow && (
                            <AdminButton
                              variant="danger"
                              size="sm"
                              onClick={() => onDeleteShow(show.id)}
                            >
                              🗑️ Verwijder
                            </AdminButton>
                          )}
                        </div>
                      </div>
                      
                      {show.description && (
                        <div className="show-description">
                          {show.description}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </AdminCard>
      )}
    </AdminLayout>
  );
};

export default AdminPlanning;
