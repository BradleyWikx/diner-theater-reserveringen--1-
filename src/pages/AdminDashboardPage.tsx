// Admin Dashboard Page
// Main dashboard view for administrators

import React from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { useI18n } from '../hooks/useI18n';
import PremiumDashboard from '../../PremiumDashboard';
import { useReservationStore } from '../stores/reservationStore';
import { useShowStore } from '../stores/showStore';
import { useConfigStore } from '../stores/configStore';

export const AdminDashboardPage: React.FC = () => {
  const { t, i18n } = useI18n();
  const { reservations, waitingList } = useReservationStore();
  const { showEvents } = useShowStore();
  const { config } = useConfigStore();

  // Dummy onNavigate function for now
  const handleNavigate = (view: string, date?: string) => {
    console.log(`Navigating to ${view}`, date);
    // In a real app, you would implement navigation logic here
    // e.g., using react-router-dom
    alert(`Navigating to: ${view}`);
  };

  return (
    <AdminLayout>
      <PremiumDashboard
        reservations={reservations}
        showEvents={showEvents}
        waitingList={waitingList}
        config={config}
        i18n={i18n}
        onNavigate={handleNavigate}
      />
    </AdminLayout>
  );
};
