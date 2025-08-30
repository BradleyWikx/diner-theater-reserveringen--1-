import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Icon } from '../UI/Icon';
import { formatDate, getShowTimes } from '../../utils/utilities';
import { ShowEvent, Reservation, WaitingListEntry } from '../../types/types';

// Definieer de props die het component nodig heeft
interface AdminDashboardViewProps {
  reservations: Reservation[];
  showEvents: ShowEvent[];
  waitingList: WaitingListEntry[];
  guestCountMap?: Map<string, number>;
  setActiveView: (view: any) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  reservations,
  showEvents,
  waitingList,
  guestCountMap,
  setActiveView
}) => {

  const todayStr = formatDate(new Date());
  const todaysShow = useMemo(() => showEvents.find(s => s.date === todayStr), [showEvents, todayStr]);
  const todaysReservations = useMemo(() => reservations.filter(r => r.date === todayStr), [reservations, todayStr]);

  const stats = useMemo(() => {
    const expectedGuests = todaysReservations.reduce((acc, r) => acc + r.guests, 0);
    const checkedInGuests = todaysReservations.filter(r => r.checkedIn).reduce((acc, r) => acc + r.guests, 0);
    const checkinProgress = expectedGuests > 0 ? (checkedInGuests / expectedGuests) * 100 : 0;

    return { expectedGuests, checkedInGuests, checkinProgress };
  }, [todaysReservations]);

  const showTimes = todaysShow ? getShowTimes(new Date(todaysShow.date + 'T12:00:00'), todaysShow.type) : null;

  // Data voor de prestatie grafiek (laatste 7 dagen)
  const performanceData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return formatDate(date);
    });

    return last7Days.map(date => {
      const dayReservations = reservations.filter(r => r.date === date);
      const dayShows = showEvents.filter(s => s.date === date);
      const guests = dayReservations.reduce((acc, r) => acc + r.guests, 0);
      const revenue = dayReservations.reduce((acc, r) => acc + (r.totalPrice || 0), 0);
      const capacity = dayShows.reduce((acc, s) => acc + s.capacity, 0);
      
      return {
        date: new Date(date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'numeric' }),
        gasten: guests,
        omzet: Math.round(revenue),
        bezetting: capacity > 0 ? Math.round((guests / capacity) * 100) : 0
      };
    });
  }, [reservations, showEvents]);

  // Recente activiteiten (laatste 10)
  const recentActivity = useMemo(() => {
    const activities: Array<{id: string, type: string, description: string, time: string, priority: 'low' | 'medium' | 'high'}> = [];
    
    // Nieuwe boekingen (laatste 5)
    const recentReservations = reservations
      .filter(r => r.createdAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    recentReservations.forEach(r => {
      const createdTime = new Date(r.createdAt);
      const timeAgo = Math.round((Date.now() - createdTime.getTime()) / (1000 * 60 * 60));
      activities.push({
        id: r.id,
        type: 'booking',
        description: `Nieuwe boeking: ${r.contactName} (${r.guests} personen)`,
        time: timeAgo < 1 ? 'Zojuist' : `${timeAgo}u geleden`,
        priority: r.status === 'provisional' ? 'high' : 'medium'
      });
    });

    // Wachtlijst aanmeldingen
    const recentWaitlist = waitingList
      .filter(w => w.addedAt && w.addedAt instanceof Date ? true : w.addedAt)
      .sort((a, b) => {
        const aTime = a.addedAt instanceof Date ? a.addedAt : new Date(a.addedAt!);
        const bTime = b.addedAt instanceof Date ? b.addedAt : new Date(b.addedAt!);
        return bTime.getTime() - aTime.getTime();
      })
      .slice(0, 3);
    
    recentWaitlist.forEach(w => {
      const addedTime = w.addedAt instanceof Date ? w.addedAt : new Date(w.addedAt!);
      const timeAgo = Math.round((Date.now() - addedTime.getTime()) / (1000 * 60 * 60));
      activities.push({
        id: w.id,
        type: 'waitlist',
        description: `Wachtlijst: ${w.name} (${w.guests} personen)`,
        time: timeAgo < 1 ? 'Zojuist' : `${timeAgo}u geleden`,
        priority: 'low'
      });
    });

    return activities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 8);
  }, [reservations, waitingList]);

  return (
    <div className="new-dashboard">
      <div className="dashboard-header">
        <h1>Goedemorgen!</h1>
        <p>Hier is je overzicht voor vandaag, {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}.</p>
      </div>

      <div className="dashboard-grid">
        {/* --- VANDAAG IN HET THEATER --- */}
        <div className="dashboard-card today-card">
          <div className="card-header">
            <Icon id="calendar-day" />
            <h3>Vandaag in het Theater</h3>
          </div>
          {todaysShow ? (
            <div className="today-content">
              <h4>{todaysShow.name}</h4>
              <p className="show-type-badge">{todaysShow.type}</p>
              <div className="today-stats">
                <div className="stat-item">
                  <span className="value">{stats.expectedGuests}</span>
                  <span className="label">Verwachte Gasten</span>
                </div>
                <div className="stat-item">
                  <span className="value">{showTimes?.start}</span>
                  <span className="label">Aanvang Show</span>
                </div>
              </div>
              <div className="checkin-progress">
                <span className="progress-label">Check-in: {stats.checkedInGuests} / {stats.expectedGuests}</span>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${stats.checkinProgress}%` }}></div>
                </div>
              </div>
              <button className="primary-action-btn" onClick={() => setActiveView('capacity')}>
                <Icon id="check" /> Start Check-in
              </button>
            </div>
          ) : (
            <div className="no-show-state">
              <Icon id="show" className="placeholder-icon" />
              <h4>Geen show vandaag</h4>
              <p>Een perfecte dag voor planning en voorbereiding.</p>
            </div>
          )}
        </div>

        {/* --- ACTIE VEREIST --- */}
        <div className="dashboard-card action-required-card">
          <div className="card-header">
            <Icon id="alert-triangle" />
            <h3>Actie Vereist</h3>
          </div>
          <div className="action-list">
            <div className="action-item" onClick={() => setActiveView('approvals')}>
              <span className="count">{reservations.filter(r => r.status === 'provisional').length}</span>
              <span className="label">Openstaande Goedkeuringen</span>
              <Icon id="chevron-right" />
            </div>
            <div className="action-item" onClick={() => setActiveView('waitlist')}>
              <span className="count">{waitingList.filter(w => w.status === 'active').length}</span>
              <span className="label">Actieve Wachtlijst</span>
              <Icon id="chevron-right" />
            </div>
            <div className="action-item" onClick={() => setActiveView('planning')}>
              <span className="count">{showEvents.filter(s => new Date(s.date) > new Date() && !s.isClosed).length}</span>
              <span className="label">Komende Shows</span>
              <Icon id="chevron-right" />
            </div>
          </div>
        </div>

        {/* --- PRESTATIE SNAPSHOT --- */}
        <div className="dashboard-card performance-card">
          <div className="card-header">
            <Icon id="chart" />
            <h3>Prestaties (Laatste 7 Dagen)</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'gasten' ? `${value} gasten` :
                    name === 'omzet' ? `€${value}` :
                    `${value}%`,
                    name === 'gasten' ? 'Gasten' :
                    name === 'omzet' ? 'Omzet' : 'Bezetting'
                  ]}
                />
                <Bar dataKey="gasten" fill="#8884d8" name="gasten" />
                <Bar dataKey="bezetting" fill="#82ca9d" name="bezetting" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- RECENTE ACTIVITEIT --- */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <Icon id="activity" />
            <h3>Recente Activiteit</h3>
          </div>
          <div className="activity-list">
            {recentActivity.length > 0 ? recentActivity.map(activity => (
              <div key={activity.id} className={`activity-item priority-${activity.priority}`}>
                <div className="activity-icon">
                  <Icon id={activity.type === 'booking' ? 'user-plus' : 'clock'} />
                </div>
                <div className="activity-content">
                  <span className="activity-description">{activity.description}</span>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            )) : (
              <div className="no-activity">
                <Icon id="inbox" />
                <p>Geen recente activiteit</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
