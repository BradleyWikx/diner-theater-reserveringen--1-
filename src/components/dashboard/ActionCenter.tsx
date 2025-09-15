import React from 'react';
import { Reservation, WaitingListEntry, ShowEvent } from '../../types/types';

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

interface ActionCenterProps {
  reservations: Reservation[];
  waitingList: WaitingListEntry[];
  showEvents: ShowEvent[];
  setActiveView: (view: string) => void;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({ reservations, waitingList, showEvents, setActiveView }) => {
  const provisionalReservations = reservations.filter(r => r.status === 'provisional').length;
  const activeWaitlist = waitingList.filter(w => w.status === 'active').length;
  const upcomingShows = showEvents.filter(s => new Date(s.date) > new Date() && !s.isClosed).length;

  return (
    <div className="action-center-card">
      <div className="card-header-premium">
        <SimpleIcon id="alert-triangle" />
        <h3>Actie Centrum</h3>
      </div>
      <div className="action-items">
        <div className="premium-action-item" onClick={() => setActiveView('approvals')}>
          <div className="action-count urgent">{provisionalReservations}</div>
          <div className="action-details">
            <span className="action-title">Goedkeuringen</span>
            <span className="action-subtitle">Wachten op bevestiging</span>
          </div>
          <SimpleIcon id="chevron-right" />
        </div>
        
        <div className="premium-action-item" onClick={() => setActiveView('waitlist')}>
          <div className="action-count info">{activeWaitlist}</div>
          <div className="action-details">
            <span className="action-title">Wachtlijst</span>
            <span className="action-subtitle">Actieve aanvragen</span>
          </div>
          <SimpleIcon id="chevron-right" />
        </div>
        
        <div className="premium-action-item" onClick={() => setActiveView('calendar')}>
          <div className="action-count success">{upcomingShows}</div>
          <div className="action-details">
            <span className="action-title">Komende Shows</span>
            <span className="action-subtitle">Geplande voorstellingen</span>
          </div>
          <SimpleIcon id="chevron-right" />
        </div>
      </div>
    </div>
  );
};
