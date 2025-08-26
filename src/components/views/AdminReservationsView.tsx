import React, { useState, useMemo } from 'react';
import { AdminLayout, AdminCard, AdminGrid, AdminButton, AdminBadge, AdminDataTable } from '../layout';
import type { Reservation, ShowEvent } from '../../types/types';

interface AdminReservationsViewProps {
  reservations: Reservation[];
  showEvents: ShowEvent[];
  onEditReservation: (reservation: Reservation) => void;
  onDeleteReservation: (reservation: Reservation) => void;
  onCheckIn: (reservation: Reservation) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const AdminReservationsView: React.FC<AdminReservationsViewProps> = ({
  reservations,
  showEvents,
  onEditReservation,
  onDeleteReservation,
  onCheckIn,
  searchQuery = '',
  onSearchChange
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShow, setSelectedShow] = useState<string>('');
  const [sortKey, setSortKey] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort reservations
  const filteredReservations = useMemo(() => {
    let filtered = reservations.filter(reservation => {
      const matchesSearch = !searchQuery || 
        reservation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.phone.includes(searchQuery);
      
      const matchesDate = !selectedDate || reservation.date === selectedDate;
      const matchesShow = !selectedShow || reservation.showName === selectedShow;
      
      return matchesSearch && matchesDate && matchesShow;
    });

    // Sort reservations
    filtered.sort((a, b) => {
      let aValue = a[sortKey as keyof Reservation];
      let bValue = b[sortKey as keyof Reservation];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [reservations, searchQuery, selectedDate, selectedShow, sortKey, sortDirection]);

  const reservationStats = useMemo(() => {
    const total = filteredReservations.length;
    const checkedIn = filteredReservations.filter(r => r.checkedIn).length;
    const totalGuests = filteredReservations.reduce((sum, r) => sum + r.guests, 0);
    const totalRevenue = filteredReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    
    return { total, checkedIn, totalGuests, totalRevenue };
  }, [filteredReservations]);

  const getStatusBadge = (reservation: Reservation) => {
    if (reservation.checkedIn) {
      return <AdminBadge variant="success">Ingecheckt</AdminBadge>;
    }
    
    const showDate = new Date(reservation.date);
    const today = new Date();
    const isToday = showDate.toDateString() === today.toDateString();
    const isPast = showDate < today;
    
    if (isPast) {
      return <AdminBadge variant="neutral">Verlopen</AdminBadge>;
    }
    if (isToday) {
      return <AdminBadge variant="warning">Vandaag</AdminBadge>;
    }
    return <AdminBadge variant="info">Bevestigd</AdminBadge>;
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const columns = [
    { key: 'customerName', label: 'Klant', sortable: true },
    { key: 'date', label: 'Datum', sortable: true, width: '120px' },
    { key: 'showName', label: 'Show', sortable: true },
    { key: 'guests', label: 'Gasten', sortable: true, width: '80px', align: 'center' as const },
    { key: 'totalPrice', label: 'Prijs', sortable: true, width: '100px', align: 'right' as const },
    { key: 'status', label: 'Status', width: '120px', align: 'center' as const }
  ];

  const tableData = filteredReservations.map(reservation => ({
    ...reservation,
    customerName: (
      <div>
        <div className="font-medium">{reservation.customerName}</div>
        <div className="text-xs text-admin-text-secondary">{reservation.email}</div>
      </div>
    ),
    date: new Date(reservation.date).toLocaleDateString('nl-NL'),
    totalPrice: `€${reservation.totalPrice || 0}`,
    status: getStatusBadge(reservation)
  }));

  const renderActions = (reservation: any) => (
    <div className="flex items-center gap-sm">
      {!reservation.checkedIn && (
        <AdminButton
          variant="success"
          size="sm"
          onClick={() => onCheckIn(reservation)}
        >
          Check In
        </AdminButton>
      )}
      <AdminButton
        variant="ghost"
        size="sm"
        onClick={() => onEditReservation(reservation)}
      >
        Bewerken
      </AdminButton>
      <AdminButton
        variant="danger"
        size="sm"
        onClick={() => onDeleteReservation(reservation)}
      >
        Verwijderen
      </AdminButton>
    </div>
  );

  const uniqueDates = [...new Set(reservations.map(r => r.date))].sort();
  const uniqueShows = [...new Set(reservations.map(r => r.showName))].sort();

  return (
    <AdminLayout
      title="Reserveringen Beheer"
      subtitle={`${reservationStats.total} reserveringen voor ${reservationStats.totalGuests} gasten`}
      actions={
        <AdminButton variant="primary">
          Nieuwe Reservering
        </AdminButton>
      }
    >
      {/* Statistics Cards */}
      <AdminGrid columns={4} gap="md" className="mb-xl">
        <AdminCard variant="ghost">
          <div className="text-center">
            <div className="text-2xl font-bold text-admin-primary mb-xs">
              {reservationStats.total}
            </div>
            <div className="text-sm text-admin-text-secondary">
              Totaal Reserveringen
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="ghost">
          <div className="text-center">
            <div className="text-2xl font-bold text-admin-success mb-xs">
              {reservationStats.checkedIn}
            </div>
            <div className="text-sm text-admin-text-secondary">
              Ingecheckt
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="ghost">
          <div className="text-center">
            <div className="text-2xl font-bold text-admin-info mb-xs">
              {reservationStats.totalGuests}
            </div>
            <div className="text-sm text-admin-text-secondary">
              Totaal Gasten
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="ghost">
          <div className="text-center">
            <div className="text-2xl font-bold text-admin-warning mb-xs">
              €{reservationStats.totalRevenue}
            </div>
            <div className="text-sm text-admin-text-secondary">
              Totale Omzet
            </div>
          </div>
        </AdminCard>
      </AdminGrid>

      {/* Filters */}
      <AdminCard className="mb-xl">
        <AdminGrid columns={3} gap="md">
          <div>
            <label className="block text-sm font-medium text-admin-text-primary mb-sm">
              Zoeken
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Zoek op naam, email of telefoon..."
              className="admin-input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-admin-text-primary mb-sm">
              Datum
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="admin-select"
            >
              <option value="">Alle datums</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>
                  {new Date(date as string).toLocaleDateString('nl-NL')}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-admin-text-primary mb-sm">
              Show
            </label>
            <select
              value={selectedShow}
              onChange={(e) => setSelectedShow(e.target.value)}
              className="admin-select"
            >
              <option value="">Alle shows</option>
              {uniqueShows.map(show => (
                <option key={show} value={show}>
                  {show}
                </option>
              ))}
            </select>
          </div>
        </AdminGrid>
      </AdminCard>

      {/* Reservations Table */}
      <AdminCard title="Reserveringen">
        <AdminDataTable
          columns={columns}
          data={tableData}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          actions={renderActions}
          loading={false}
          emptyMessage="Geen reserveringen gevonden"
        />
      </AdminCard>
    </AdminLayout>
  );
};
