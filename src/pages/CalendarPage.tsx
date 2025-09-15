// Calendar Management Page
// Page for viewing and managing shows calendar

import React from 'react';
import AdminCalendarView from '../components/calendar/AdminCalendarView';
import { AdminLayout } from '../components/layout/AdminLayout';
import { useI18n } from '../hooks/useI18n';

export const CalendarPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <AdminLayout>
      <div className="calendar-page">
        <h1 className="page-title">{t('navigation.calendar')}</h1>
        <AdminCalendarView />
      </div>
    </AdminLayout>
  );
};
