// Reservations Management Page
// Page for viewing and managing all reservations

import React from 'react';
import { AdminReservationsView } from '../components/views/AdminReservationsView';
import { AdminLayout } from '../components/layout/AdminLayout';
import { useI18n } from '../hooks/useI18n';

export const ReservationsPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <AdminLayout>
      <div className="reservations-page">
        <h1 className="page-title">{t('reservations.title')}</h1>
        <AdminReservationsView />
      </div>
    </AdminLayout>
  );
};
