import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../layout/AdminLayout';

interface AdminScheduleViewProps {
  showEvents: any[];
  internalEvents: any[];
  reservations: any[];
}

const AdminScheduleView: React.FC<AdminScheduleViewProps> = ({
  showEvents = [],
  internalEvents = [],
  reservations = []
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

  return (
    <AdminLayout>
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>📅 Planning</h1>
            <p>Overzicht van voorstellingen en evenementen</p>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="calendar-navigation">
          <button 
            className="nav-button" 
            onClick={() => navigateMonth(-1)}
          >
            ← Vorige
          </button>
          
          <h2 className="month-title">
            {formatMonthYear()}
          </h2>
          
          <button 
            className="nav-button" 
            onClick={() => navigateMonth(1)}
          >
            Volgende →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-container">
          {/* Week headers */}
          <div className="calendar-header">
            {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(day => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="calendar-grid">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              
              return (
                <div 
                  key={index}
                  className={`
                    calendar-day 
                    ${!day.isCurrentMonth ? 'other-month' : ''}
                    ${day.isToday ? 'today' : ''}
                  `}
                >
                  <div className="day-number">
                    {day.date.getDate()}
                  </div>
                  
                  <div className="day-events">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <div 
                        key={idx}
                        className={`event-item ${event.name ? 'show-event' : 'internal-event'}`}
                        title={event.name || event.title || 'Evenement'}
                      >
                        {event.name ? (
                          <>
                            🎭 {event.name.substring(0, 12)}...
                          </>
                        ) : (
                          <>
                            📋 {(event.title || 'Evenement').substring(0, 12)}...
                          </>
                        )}
                      </div>
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <div className="more-events">
                        +{dayEvents.length - 3} meer
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="stats-container">
          <div className="stat-item">
            <h3>📊 Statistieken</h3>
          </div>
          <div className="stat-item">
            <div className="stat-number">{showEvents.length}</div>
            <div className="stat-label">Voorstellingen</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{internalEvents.length}</div>
            <div className="stat-label">Interne Events</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{reservations.length}</div>
            <div className="stat-label">Reserveringen</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }

        .admin-header h1 {
          margin: 0;
          color: #1f2937;
          font-size: 2rem;
        }

        .admin-header p {
          margin: 5px 0 0 0;
          color: #6b7280;
        }

        .calendar-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .nav-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .nav-button:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .month-title {
          margin: 0;
          color: #1f2937;
          font-size: 1.5rem;
          text-transform: capitalize;
        }

        .calendar-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 30px;
        }

        .calendar-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
        }

        .calendar-weekday {
          padding: 15px 10px;
          text-align: center;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }

        .calendar-day {
          min-height: 120px;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          padding: 8px;
          position: relative;
          background: white;
          transition: background-color 0.2s;
        }

        .calendar-day:hover {
          background: #f8fafc;
        }

        .calendar-day.other-month {
          background: #f9fafb;
          color: #9ca3af;
        }

        .calendar-day.today {
          background: #eff6ff;
          border: 2px solid #3b82f6;
        }

        .day-number {
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: 4px;
          color: #374151;
        }

        .other-month .day-number {
          color: #9ca3af;
        }

        .today .day-number {
          color: #1d4ed8;
          font-weight: 700;
        }

        .day-events {
          space-y: 2px;
        }

        .event-item {
          font-size: 0.75rem;
          padding: 2px 4px;
          border-radius: 4px;
          margin-bottom: 2px;
          line-height: 1.2;
          cursor: pointer;
          transition: all 0.2s;
        }

        .show-event {
          background: #dbeafe;
          color: #1e40af;
          border-left: 3px solid #3b82f6;
        }

        .internal-event {
          background: #f0fdf4;
          color: #166534;
          border-left: 3px solid #22c55e;
        }

        .event-item:hover {
          transform: translateX(2px);
          opacity: 0.8;
        }

        .more-events {
          font-size: 0.7rem;
          color: #6b7280;
          font-style: italic;
          margin-top: 2px;
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .stat-item {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .stat-item h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.2rem;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #3b82f6;
          margin: 10px 0 5px 0;
        }

        .stat-label {
          color: #6b7280;
          font-weight: 500;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .calendar-day {
            min-height: 80px;
            padding: 4px;
          }
          
          .event-item {
            font-size: 0.6rem;
            padding: 1px 2px;
          }
          
          .calendar-navigation {
            flex-direction: column;
            gap: 15px;
          }
          
          .month-title {
            order: -1;
          }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminScheduleView;
