import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
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
  config?: any;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  reservations,
  showEvents,
  waitingList,
  guestCountMap,
  setActiveView,
  config
}) => {

  const todayStr = formatDate(new Date());
  const todaysShow = useMemo(() => showEvents.find(s => s.date === todayStr), [showEvents, todayStr]);
  const todaysReservations = useMemo(() => reservations.filter(r => r.date === todayStr), [reservations, todayStr]);

  const stats = useMemo(() => {
    const expectedGuests = todaysReservations.reduce((acc, r) => acc + r.guests, 0);
    const checkedInGuests = todaysReservations.filter(r => r.checkedIn).reduce((acc, r) => acc + r.guests, 0);
    const checkinProgress = expectedGuests > 0 ? (checkedInGuests / expectedGuests) * 100 : 0;
    const totalRevenue = todaysReservations.reduce((acc, r) => acc + (r.totalPrice || 0), 0);

    return { expectedGuests, checkedInGuests, checkinProgress, totalRevenue };
  }, [todaysReservations]);

  const showTimes = todaysShow ? getShowTimes(new Date(todaysShow.date + 'T12:00:00'), todaysShow.type) : null;
  
  // Vind show afbeelding
  const showImage = useMemo(() => {
    if (!todaysShow || !config?.showNames) return null;
    const showConfig = config.showNames.find((sn: any) => sn.name === todaysShow.name);
    return showConfig?.imageUrl || null;
  }, [todaysShow, config]);

  // AI Briefing - simulatie van een dagelijkse briefing
  const aiDailyBriefing = useMemo(() => {
    if (!todaysShow || !todaysReservations.length) return null;
    
    const bigGroups = todaysReservations.filter(r => r.guests >= 8).length;
    const allergies = todaysReservations.filter(r => r.allergies && r.allergies.trim()).length;
    const premiumPackages = todaysReservations.filter(r => r.drinkPackage === 'premium').length;
    
    let briefing = `Vandaag verwachten we ${stats.expectedGuests} gasten voor ${todaysShow.name}.`;
    
    if (bigGroups > 0) briefing += ` Er zijn ${bigGroups} grote groepen (8+ personen).`;
    if (allergies > 0) briefing += ` Let op: ${allergies} gasten hebben dieetwensen/allergieën gemeld.`;
    if (premiumPackages > 0) briefing += ` ${premiumPackages} gasten kozen voor het premium drankpakket.`;
    
    return briefing;
  }, [todaysShow, todaysReservations, stats.expectedGuests]);

  // Data voor de prestatie grafiek (laatste 7 dagen) - nu met meer elegante styling
  const weeklyPerformanceData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return formatDate(date);
    });

    return last7Days.map(date => {
      const dayReservations = reservations.filter(r => r.date === date);
      const revenue = dayReservations.reduce((acc, r) => acc + (r.totalPrice || 0), 0);
      const guests = dayReservations.reduce((acc, r) => acc + r.guests, 0);
      
      return {
        name: new Date(date).toLocaleDateString('nl-NL', { weekday: 'short' }),
        fullDate: date,
        Omzet: Math.round(revenue),
        Gasten: guests,
        gemiddeld: guests > 0 ? Math.round(revenue / guests) : 0
      };
    });
  }, [reservations]);

  // Recente activiteiten (laatste 8) - nu met betere time tracking
  const recentActivity = useMemo(() => {
    const activities: Array<{id: string, type: string, description: string, time: string, priority: 'low' | 'medium' | 'high', icon: string}> = [];
    
    // Nieuwe boekingen (laatste 5)
    const recentReservations = reservations
      .filter(r => r.createdAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    recentReservations.forEach(r => {
      const createdTime = new Date(r.createdAt);
      const minutesAgo = Math.round((Date.now() - createdTime.getTime()) / (1000 * 60));
      const timeText = minutesAgo < 60 ? 
        (minutesAgo < 1 ? 'Zojuist' : `${minutesAgo}min geleden`) :
        `${Math.round(minutesAgo / 60)}u geleden`;
      
      activities.push({
        id: r.id,
        type: 'booking',
        description: `${r.contactName} boekte ${r.guests} ${r.guests === 1 ? 'ticket' : 'tickets'} voor ${new Date(r.date).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' })}`,
        time: timeText,
        priority: r.status === 'provisional' ? 'high' : 'medium',
        icon: '🎫'
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
      const minutesAgo = Math.round((Date.now() - addedTime.getTime()) / (1000 * 60));
      const timeText = minutesAgo < 60 ? 
        (minutesAgo < 1 ? 'Zojuist' : `${minutesAgo}min geleden`) :
        `${Math.round(minutesAgo / 60)}u geleden`;
      
      activities.push({
        id: w.id,
        type: 'waitlist',
        description: `${w.name} schreef zich in op de wachtlijst voor ${w.guests} ${w.guests === 1 ? 'persoon' : 'personen'}`,
        time: timeText,
        priority: 'low',
        icon: '⏰'
      });
    });

    return activities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 6);
  }, [reservations, waitingList]);

  return (
    <div className="modern-dashboard">
      <div className="dashboard-welcome">
        <div className="welcome-text">
          <h1>Theater Dashboard</h1>
          <p>Overzicht voor {new Date().toLocaleDateString('nl-NL', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}.</p>
        </div>
        <div className="quick-stats">
          <div className="quick-stat">
            <span className="stat-value">€{stats.totalRevenue.toLocaleString()}</span>
            <span className="stat-label">Omzet vandaag</span>
          </div>
          <div className="quick-stat">
            <span className="stat-value">{stats.expectedGuests}</span>
            <span className="stat-label">Verwachte gasten</span>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        
        {/* --- HERO: VANDAAG IN HET THEATER --- */}
        <div className="hero-today-card">
          {todaysShow ? (
            <div 
              className="hero-show-content"
              style={{
                backgroundImage: showImage ? `url(${showImage})` : 'none',
                backgroundColor: showImage ? 'transparent' : '#475569'
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
                      <div className="stat-number">{showTimes?.start}</div>
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
                      style={{ width: `${stats.checkinProgress}%` }}
                    ></div>
                  </div>
                </div>

                {aiDailyBriefing && (
                  <div className="ai-briefing-section">
                    <div className="briefing-header">
                      <Icon id="activity" />
                      <span>AI Dagelijkse Briefing</span>
                    </div>
                    <p className="briefing-text">{aiDailyBriefing}</p>
                  </div>
                )}

                <button 
                  className="hero-action-button" 
                  onClick={() => setActiveView('capacity')}
                >
                  <Icon id="check" />
                  Start Check-in Beheer
                </button>
              </div>
            </div>
          ) : (
            <div className="no-show-hero">
              <div className="no-show-icon">🎭</div>
              <h2>Geen voorstelling vandaag</h2>
              <p>Een perfecte dag voor planning en voorbereiding van komende shows.</p>
              <button 
                className="secondary-action-button"
                onClick={() => setActiveView('planning')}
              >
                <Icon id="calendar-day" />
                Bekijk Planning
              </button>
            </div>
          )}
        </div>

        {/* --- ACTIE CENTRUM --- */}
        <div className="action-center-card">
          <div className="card-header-premium">
            <Icon id="alert-triangle" />
            <h3>Actie Centrum</h3>
          </div>
          <div className="action-items">
            <div className="premium-action-item" onClick={() => setActiveView('approvals')}>
              <div className="action-count urgent">{reservations.filter(r => r.status === 'provisional').length}</div>
              <div className="action-details">
                <span className="action-title">Goedkeuringen</span>
                <span className="action-subtitle">Wachten op bevestiging</span>
              </div>
              <Icon id="chevron-right" />
            </div>
            
            <div className="premium-action-item" onClick={() => setActiveView('waitlist')}>
              <div className="action-count info">{waitingList.filter(w => w.status === 'active').length}</div>
              <div className="action-details">
                <span className="action-title">Wachtlijst</span>
                <span className="action-subtitle">Actieve aanvragen</span>
              </div>
              <Icon id="chevron-right" />
            </div>
            
            <div className="premium-action-item" onClick={() => setActiveView('planning')}>
              <div className="action-count success">{showEvents.filter(s => new Date(s.date) > new Date() && !s.isClosed).length}</div>
              <div className="action-details">
                <span className="action-title">Komende Shows</span>
                <span className="action-subtitle">Geplande voorstellingen</span>
              </div>
              <Icon id="chevron-right" />
            </div>
          </div>
        </div>

        {/* --- PRESTATIE ANALYTICS --- */}
        <div className="performance-analytics-card">
          <div className="card-header-premium">
            <Icon id="chart" />
            <h3>Prestatie Analytics</h3>
            <span className="analytics-period">Laatste 7 dagen</span>
          </div>
          <div className="premium-chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weeklyPerformanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#7f8c8d" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#7f8c8d" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(212, 175, 55, 0.1)' }}
                  contentStyle={{
                    backgroundColor: '#2c3e50',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    color: '#ecf0f1'
                  }}
                  labelStyle={{ color: '#d4af37' }}
                  formatter={(value: any, name: string) => [
                    name === 'Omzet' ? `€${value}` : `${value} gasten`,
                    name
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="Omzet" 
                  stroke="#d4af37" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- LIVE ACTIVITEIT FEED --- */}
        <div className="activity-feed-card">
          <div className="card-header-premium">
            <Icon id="activity" />
            <h3>Live Activiteit</h3>
          </div>
          <div className="premium-activity-list">
            {recentActivity.length > 0 ? recentActivity.map(activity => (
              <div key={activity.id} className={`premium-activity-item priority-${activity.priority}`}>
                <div className="activity-icon-container">
                  <span className="activity-emoji">{activity.icon}</span>
                </div>
                <div className="activity-content-premium">
                  <div className="activity-description">{activity.description}</div>
                  <div className="activity-timestamp">{activity.time}</div>
                </div>
              </div>
            )) : (
              <div className="no-activity-premium">
                <Icon id="inbox" />
                <p>Geen recente activiteit</p>
                <span>Nieuwe boekingen verschijnen hier automatisch</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
