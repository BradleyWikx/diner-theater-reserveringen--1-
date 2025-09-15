import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Icon } from '../ui/Icon';
import { formatDate, getShowTimes } from '../../utils/utilities';
import { ShowEvent, Reservation, WaitingListEntry } from '../../types/types';
import { DashboardHeader } from '../dashboard/DashboardHeader';
import { HeroCard } from '../dashboard/HeroCard';
import { ActionCenter } from '../dashboard/ActionCenter';
import { ActivityFeed } from '../dashboard/ActivityFeed';

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
        <DashboardHeader totalRevenue={0} expectedGuests={0} />
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
    <div className="modern-dashboard">
      <DashboardHeader totalRevenue={stats.totalRevenue} expectedGuests={stats.expectedGuests} />

      <div className="dashboard-main-grid">
        <HeroCard 
          todaysShow={todaysShow}
          stats={stats}
          showImage={showImage}
          aiDailyBriefing={aiDailyBriefing}
          setActiveView={setActiveView}
        />

        <ActionCenter 
          reservations={mockReservations}
          waitingList={mockWaitingList}
          showEvents={mockShowEvents}
          setActiveView={setActiveView}
        />

        <ActivityFeed recentActivity={recentActivity} />
      </div>
    </div>
  );
};