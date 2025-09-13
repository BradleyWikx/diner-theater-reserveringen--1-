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

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  reservations,
  showEvents,
  waitingList,
  guestCountMap,
  setActiveView,
  config
}) => {

  console.log('AdminDashboardView props:', {
    reservations: reservations?.length || 0,
    showEvents: showEvents?.length || 0,
    waitingList: waitingList?.length || 0,
    config: !!config
  });

  // FALLBACK TEST - Als data ontbreekt, toon het alsnog maar met mock data
  const mockReservations = reservations || [];
  const mockShowEvents = showEvents || [];
  const mockWaitingList = waitingList || [];

  const todayStr = formatDate(new Date());
  const todaysShow = useMemo(() => mockShowEvents?.find(s => s.date === todayStr), [mockShowEvents, todayStr]);
  const todaysReservations = useMemo(() => mockReservations?.filter(r => r.date === todayStr) || [], [mockReservations, todayStr]);

  const stats = useMemo(() => {
    const expectedGuests = todaysReservations?.reduce((acc, r) => acc + r.guests, 0) || 0;
    const checkedInGuests = todaysReservations?.filter(r => r.checkedIn).reduce((acc, r) => acc + r.guests, 0) || 0;
    const checkinProgress = expectedGuests > 0 ? (checkedInGuests / expectedGuests) * 100 : 0;
    const totalRevenue = todaysReservations?.reduce((acc, r) => acc + (r.totalPrice || 0), 0) || 0;

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
    if (!todaysShow || !todaysReservations?.length) return null;
    
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
      const dayReservations = (mockReservations || []).filter(r => r.date === date);
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
  }, [mockReservations]);

  // Recente activiteiten (laatste 8) - nu met betere time tracking
  const recentActivity = useMemo(() => {
    const activities: Array<{id: string, type: string, description: string, time: string, priority: 'low' | 'medium' | 'high', icon: string}> = [];
    
    // Nieuwe boekingen (laatste 5)
    const recentReservations = (mockReservations || [])
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
    const recentWaitlist = (mockWaitingList || [])
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
  }, [mockReservations, mockWaitingList]);

  // Debug info en loading state
  if (!mockReservations && !mockShowEvents) {
    return (
      <div className="modern-dashboard">
        <div className="dashboard-welcome">
          <div className="welcome-text">
            <h1>🎭 Theater Dashboard</h1>
            <p>Data wordt geladen...</p>
          </div>
        </div>
        <div className="text-center p-xl">
          <div className="admin-btn-spinner" style={{ width: '3rem', height: '3rem', margin: 'auto' }}></div>
          <p className="mt-lg text-admin-secondary">Dashboard wordt geladen...</p>
        </div>
      </div>
    );
  }

  // FORCE RENDER VOOR DEBUGGING - Toon altijd het dashboard, ook zonder data
  console.log('🎭 Forcing dashboard render for debugging purposes');

  return (
    <div className="modern-dashboard" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#334155', padding: '2rem' }}>
      <div className="dashboard-welcome" style={{ 
        background: '#A00000', 
        borderRadius: '16px', 
        padding: '2rem', 
        marginBottom: '2rem', 
        color: '#ffffff'
      }}>
        <div className="welcome-text">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>🎭 Theater Dashboard</h1>
          <p style={{ fontSize: '1.1rem', margin: '0', opacity: '0.9' }}>Overzicht voor {new Date().toLocaleDateString('nl-NL', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}.</p>
        </div>
        <div className="quick-stats" style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          <div className="quick-stat" style={{ textAlign: 'center' }}>
            <span className="stat-value" style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>€{stats.totalRevenue.toLocaleString()}</span>
            <span className="stat-label" style={{ fontSize: '0.9rem', opacity: '0.8' }}>Omzet vandaag</span>
          </div>
          <div className="quick-stat" style={{ textAlign: 'center' }}>
            <span className="stat-value" style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{stats.expectedGuests}</span>
            <span className="stat-label" style={{ fontSize: '0.9rem', opacity: '0.8' }}>Verwachte gasten</span>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '2rem', 
        marginBottom: '2rem' 
      }}>
        {/* --- HERO: VANDAAG IN HET THEATER --- */}
        <div className="hero-today-card" style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '16px', 
          padding: '2rem', 
          marginBottom: '1rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {todaysShow ? (
            <div 
              className="hero-show-content"
              style={{
                backgroundImage: showImage ? `url(${showImage})` : 'none',
                backgroundColor: showImage ? 'transparent' : '#f1f5f9',
                borderRadius: '12px',
                padding: '2rem',
                position: 'relative',
                color: showImage ? '#ffffff' : '#334155'
              }}
            >
              <div className="hero-overlay" style={{ 
                position: 'absolute', 
                top: '0', 
                left: '0', 
                right: '0', 
                bottom: '0', 
                backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                borderRadius: '12px' 
              }}></div>
              <div className="hero-content" style={{ position: 'relative', zIndex: '1', color: '#ffffff' }}>
                <div className="show-badge" style={{ 
                  display: 'inline-block', 
                  backgroundColor: '#A00000', 
                  color: '#ffffff', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem', 
                  marginBottom: '1rem' 
                }}>{todaysShow.type}</div>
                <h2 className="show-title" style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  margin: '0 0 1.5rem 0' 
                }}>{todaysShow.name}</h2>
                
                <div className="show-stats-row" style={{ 
                  display: 'flex', 
                  gap: '2rem', 
                  marginBottom: '2rem' 
                }}>
                  <div className="show-stat" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="stat-icon" style={{ fontSize: '1.5rem' }}>🎭</div>
                    <div>
                      <div className="stat-number" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{showTimes?.start || '--:--'}</div>
                      <div className="stat-text" style={{ fontSize: '0.9rem', opacity: '0.8' }}>Aanvang</div>
                    </div>
                  </div>
                  <div className="show-stat" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="stat-icon" style={{ fontSize: '1.5rem' }}>👥</div>
                    <div>
                      <div className="stat-number" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.expectedGuests}</div>
                      <div className="stat-text" style={{ fontSize: '0.9rem', opacity: '0.8' }}>Gasten</div>
                    </div>
                  </div>
                  <div className="show-stat" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="stat-icon" style={{ fontSize: '1.5rem' }}>💰</div>
                    <div>
                      <div className="stat-number" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>€{stats.totalRevenue}</div>
                      <div className="stat-text" style={{ fontSize: '0.9rem', opacity: '0.8' }}>Omzet</div>
                    </div>
                  </div>
                </div>

                <div className="checkin-section" style={{ marginBottom: '1.5rem' }}>
                  <div className="checkin-header" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '0.5rem' 
                  }}>
                    <span style={{ fontWeight: '500' }}>Check-in Voortgang</span>
                    <span className="checkin-numbers" style={{ fontSize: '0.9rem' }}>{stats.checkedInGuests} / {stats.expectedGuests}</span>
                  </div>
                  <div className="premium-progress-bar" style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    borderRadius: '4px', 
                    overflow: 'hidden' 
                  }}>
                    <div 
                      className="premium-progress-fill" 
                      style={{ 
                        width: `${stats.checkinProgress}%`, 
                        height: '100%', 
                        backgroundColor: '#27ae60', 
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }}
                    ></div>
                  </div>
                </div>

                {aiDailyBriefing && (
                  <div className="ai-briefing-section" style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '8px', 
                    padding: '1rem', 
                    marginBottom: '1.5rem' 
                  }}>
                    <div className="briefing-header" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      marginBottom: '0.5rem' 
                    }}>
                      <SimpleIcon id="activity" />
                      <span style={{ fontWeight: '500' }}>AI Dagelijkse Briefing</span>
                    </div>
                    <p className="briefing-text" style={{ margin: '0', lineHeight: '1.4' }}>{aiDailyBriefing}</p>
                  </div>
                )}

                <button 
                  className="hero-action-button" 
                  onClick={() => setActiveView('capacity')}
                  style={{
                    backgroundColor: '#FFD700',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <SimpleIcon id="check" />
                  Start Check-in Beheer
                </button>
              </div>
            </div>
          ) : (
            <div className="no-show-hero" style={{ 
              textAlign: 'center', 
              padding: '3rem 2rem',
              backgroundColor: '#f1f5f9',
              borderRadius: '12px',
              color: '#64748b'
            }}>
              <div className="no-show-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#334155' }}>Geen voorstelling vandaag</h2>
              <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>Een perfecte dag voor planning en voorbereiding van komende shows.</p>
              <button 
                className="secondary-action-button"
                onClick={() => setActiveView('planning')}
                style={{
                  backgroundColor: '#A00000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                <SimpleIcon id="calendar-day" />
                Bekijk Planning
              </button>
            </div>
          )}
        </div>

        {/* --- ACTIE CENTRUM --- */}
        <div className="action-center-card" style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '16px', 
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="card-header-premium" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1rem' 
          }}>
            <SimpleIcon id="alert-triangle" />
            <h3 style={{ margin: '0', color: '#334155' }}>Actie Centrum</h3>
          </div>
          <div className="action-items" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="premium-action-item" onClick={() => setActiveView('approvals')} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              cursor: 'pointer',
              border: '1px solid #e2e8f0'
            }}>
              <div className="action-count urgent" style={{
                backgroundColor: '#ff4444',
                color: '#ffffff',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>{(mockReservations || []).filter(r => r.status === 'provisional').length}</div>
              <div className="action-details" style={{ flex: '1' }}>
                <span className="action-title" style={{ display: 'block', color: '#ffffff', fontWeight: '500' }}>Goedkeuringen</span>
                <span className="action-subtitle" style={{ display: 'block', color: '#b0b0b0', fontSize: '0.85rem' }}>Wachten op bevestiging</span>
              </div>
              <SimpleIcon id="chevron-right" />
            </div>
            
            <div className="premium-action-item" onClick={() => setActiveView('waitlist')} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#3a3a3a',
              borderRadius: '8px',
              cursor: 'pointer',
              border: '1px solid #555555'
            }}>
              <div className="action-count info" style={{
                backgroundColor: '#3498db',
                color: '#ffffff',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>{(mockWaitingList || []).filter(w => w.status === 'active').length}</div>
              <div className="action-details" style={{ flex: '1' }}>
                <span className="action-title" style={{ display: 'block', color: '#ffffff', fontWeight: '500' }}>Wachtlijst</span>
                <span className="action-subtitle" style={{ display: 'block', color: '#b0b0b0', fontSize: '0.85rem' }}>Actieve aanvragen</span>
              </div>
              <SimpleIcon id="chevron-right" />
            </div>
            
            <div className="premium-action-item" onClick={() => setActiveView('planning')} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#3a3a3a',
              borderRadius: '8px',
              cursor: 'pointer',
              border: '1px solid #555555'
            }}>
              <div className="action-count success" style={{
                backgroundColor: '#27ae60',
                color: '#ffffff',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>{(mockShowEvents || []).filter(s => new Date(s.date) > new Date() && !s.isClosed).length}</div>
              <div className="action-details" style={{ flex: '1' }}>
                <span className="action-title" style={{ display: 'block', color: '#ffffff', fontWeight: '500' }}>Komende Shows</span>
                <span className="action-subtitle" style={{ display: 'block', color: '#b0b0b0', fontSize: '0.85rem' }}>Geplande voorstellingen</span>
              </div>
              <SimpleIcon id="chevron-right" />
            </div>
          </div>
        </div>

        {/* --- PRESTATIE ANALYTICS --- */}
        <div className="performance-analytics-card" style={{ 
          backgroundColor: '#2a2a2a', 
          borderRadius: '16px', 
          padding: '1.5rem',
          border: '1px solid #444444',
          gridColumn: 'span 2'
        }}>
          <div className="card-header-premium" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1rem',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SimpleIcon id="chart" />
              <h3 style={{ margin: '0', color: '#ffffff' }}>Prestatie Analytics</h3>
            </div>
            <span className="analytics-period" style={{ color: '#b0b0b0', fontSize: '0.85rem' }}>Laatste 7 dagen</span>
          </div>
          <div className="premium-chart-container" style={{ height: '280px' }}>
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
        <div className="activity-feed-card" style={{ 
          backgroundColor: '#2a2a2a', 
          borderRadius: '16px', 
          padding: '1.5rem',
          border: '1px solid #444444',
          gridColumn: 'span 2'
        }}>
          <div className="card-header-premium" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1rem' 
          }}>
            <SimpleIcon id="activity" />
            <h3 style={{ margin: '0', color: '#ffffff' }}>Live Activiteit</h3>
          </div>
          <div className="premium-activity-list">
            {recentActivity.length > 0 ? recentActivity.map(activity => (
              <div key={activity.id} className={`premium-activity-item priority-${activity.priority}`} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                marginBottom: '0.5rem',
                backgroundColor: '#3a3a3a',
                borderRadius: '8px',
                border: '1px solid #555555'
              }}>
                <div className="activity-icon-container" style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  backgroundColor: '#A00000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="activity-emoji" style={{ fontSize: '1.2rem' }}>{activity.icon}</span>
                </div>
                <div className="activity-content-premium" style={{ flex: '1' }}>
                  <div className="activity-description" style={{ color: '#ffffff', marginBottom: '0.25rem' }}>{activity.description}</div>
                  <div className="activity-timestamp" style={{ color: '#b0b0b0', fontSize: '0.85rem' }}>{activity.time}</div>
                </div>
              </div>
            )) : (
              <div className="no-activity-premium" style={{ 
                textAlign: 'center', 
                padding: '2rem',
                color: '#b0b0b0'
              }}>
                <SimpleIcon id="inbox" />
                <p style={{ margin: '0.5rem 0', color: '#ffffff' }}>Geen recente activiteit</p>
                <span style={{ fontSize: '0.9rem' }}>Nieuwe boekingen verschijnen hier automatisch</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
