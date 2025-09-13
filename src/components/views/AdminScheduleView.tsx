import React, { useState, useMemo } from 'react';
import { AdminLayout, AdminCard, AdminGrid, AdminButton, AdminBadge } from '../layout';

interface AdminScheduleViewProps {
  showEvents: any[];
  internalEvents: any[];
  reservations: any[];
  onAddInternalEvent?: (event: any) => void;
  onUpdateInternalEvent?: (event: any) => void; 
  onDeleteInternalEvent?: (eventId: string) => void;
  config?: any;
  onPrintSchedule?: () => void; // Nieuwe prop voor print functionaliteit
}

const AdminScheduleView: React.FC<AdminScheduleViewProps> = ({
  showEvents = [],
  internalEvents = [],
  reservations = [],
  onAddInternalEvent,
  onUpdateInternalEvent,
  onDeleteInternalEvent,
  config,
  onPrintSchedule
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Start from Monday
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === new Date().toDateString()
      });
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    const dayShows = showEvents.filter(show => show.date === dateString);
    const dayInternals = internalEvents.filter(internal => internal.date === dateString);
    
    return [...dayShows, ...dayInternals];
  };

  // Navigate months
  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Format month/year for display
  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('nl-NL', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCapacity = showEvents.reduce((sum, show) => sum + (show.capacity || 50), 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((reservations.length / totalCapacity) * 100) : 0;
    
    return {
      shows: showEvents.length,
      internals: internalEvents.length,
      reservations: reservations.length,
      occupancy: occupancyRate
    };
  }, [showEvents, internalEvents, reservations]);

  return (
    <AdminLayout
      title="📅 Planning"
      subtitle="Overzicht van voorstellingen en evenementen"
      actions={
        <AdminGrid columns={onPrintSchedule ? 3 : 2} gap="sm">
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
          {onPrintSchedule && (
            <AdminButton
              variant="primary"
              size="sm"
              onClick={onPrintSchedule}
            >
              🖨️ Print Schema
            </AdminButton>
          )}
        </AdminGrid>
      }
    >
      {/* Monthly Overview */}
      <AdminCard 
        title={formatMonthYear()}
        subtitle="Maandelijkse planning"
        className="mb-xl"
        variant="elevated"
      >
        {/* Calendar Grid */}
        <div className="admin-calendar-grid">
          {/* Week headers */}
          <div className="admin-calendar-header">
            {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(day => (
              <div key={day} className="admin-calendar-day-header">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="admin-calendar-body">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              
              return (
                <div 
                  key={index}
                  className={`
                    admin-calendar-day 
                    ${!day.isCurrentMonth ? 'admin-calendar-day--other-month' : ''}
                    ${day.isToday ? 'admin-calendar-day--today' : ''}
                    ${dayEvents.length > 0 ? 'has-events' : ''}
                  `}
                >
                  <div className="admin-calendar-day-number">
                    {day.date.getDate()}
                  </div>
                  
                  <div className="admin-calendar-day-events">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <AdminBadge 
                        key={idx}
                        variant={event.name ? 'success' : 'info'}
                        size="sm"
                        className="admin-calendar-event"
                      >
                        {event.name ? `🎭 ${event.name.substring(0, 8)}` : `📋 ${(event.title || 'Event').substring(0, 8)}`}
                      </AdminBadge>
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <AdminBadge variant="neutral" size="sm" className="admin-calendar-event more-events">
                        +{dayEvents.length - 3}
                      </AdminBadge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AdminCard>

      {/* Statistics Grid */}
      <AdminGrid columns={4} gap="lg">
        <AdminCard variant="elevated" title="📊 Voorstellingen">
          <div className="dashboard-metric-value text-admin-success">
            {stats.shows}
          </div>
          <div className="dashboard-metric-label">
            Shows gepland
          </div>
        </AdminCard>
        
        <AdminCard variant="elevated" title="📋 Interne Events">
          <div className="dashboard-metric-value text-admin-info">
            {stats.internals}
          </div>
          <div className="dashboard-metric-label">
            Interne evenementen
          </div>
        </AdminCard>
        
        <AdminCard variant="elevated" title="🎫 Reserveringen">
          <div className="dashboard-metric-value text-admin-warning">
            {stats.reservations}
          </div>
          <div className="dashboard-metric-label">
            Totaal reserveringen
          </div>
        </AdminCard>
        
        <AdminCard variant="elevated" title="💰 Bezetting">
          <div className="dashboard-metric-value text-admin-primary">
            {stats.occupancy}%
          </div>
          <div className="dashboard-metric-label">
            Gemiddelde bezetting
          </div>
        </AdminCard>
      </AdminGrid>
    </AdminLayout>
  );
};

export default AdminScheduleView;
