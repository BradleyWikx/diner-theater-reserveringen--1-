import React, { useState, useEffect, useMemo } from 'react';
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

  return (
    <AdminDashboardView
      reservations={reservations}
      showEvents={showEvents}
      waitingList={waitingList}
      setActiveView={handleQuickAction}
      config={config}
    />
  );
};

export default PremiumDashboard;
