import React, { useState, useMemo } from 'react';
import { AdminLayout, AdminCard, AdminGrid, AdminButton, AdminBadge, AdminDataTable } from '../layout';
import type { Reservation, ShowEvent } from '../../types/types';

interface AdminReservationsViewProps {
  reservations: Reservation[];
  showEvents: ShowEvent[];
  onEditReservation: (reservation: Reservation) => void;
  onDeleteReservation: (reservation: Reservation) => void;
  onCheckIn: (reservation: Reservation) => void;
  onBulkCheckIn?: (reservations: Reservation[]) => void;
  onBulkDelete?: (reservations: Reservation[]) => void;
  onExportReservations?: (reservations: Reservation[]) => void;
  onAddReservation?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  loading?: boolean;
}

export const AdminReservationsView: React.FC<AdminReservationsViewProps> = ({
  reservations,
  showEvents,
  onEditReservation,
  onDeleteReservation,
  onCheckIn,
  onBulkCheckIn,
  onBulkDelete,
  onExportReservations,
  onAddReservation,
  searchQuery = '',
  onSearchChange,
  loading = false
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShow, setSelectedShow] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortKey, setSortKey] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [quickFilters, setQuickFilters] = useState({
    today: false,
    checkedIn: false,
    notCheckedIn: false,
    thisWeek: false
  });

  // Enhanced filter and sort reservations
  const filteredReservations = useMemo(() => {
    let filtered = reservations.filter(reservation => {
      const matchesSearch = !searchQuery || 
        reservation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.phone.includes(searchQuery) ||
        reservation.bookingNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDate = !selectedDate || reservation.date === selectedDate;
      const matchesShow = !selectedShow || reservation.showName === selectedShow;
      
      // Status filtering
      let matchesStatus = true;
      if (statusFilter === 'checked-in') matchesStatus = reservation.checkedIn;
      if (statusFilter === 'not-checked-in') matchesStatus = !reservation.checkedIn;
      if (statusFilter === 'today') {
        const today = new Date().toDateString();
        matchesStatus = new Date(reservation.date).toDateString() === today;
      }
      if (statusFilter === 'upcoming') {
        const now = new Date();
        const reservationDate = new Date(reservation.date);
        matchesStatus = reservationDate > now && !reservation.checkedIn;
      }
      if (statusFilter === 'expired') {
        const now = new Date();
        const reservationDate = new Date(reservation.date);
        matchesStatus = reservationDate < now && !reservation.checkedIn;
      }
      
      // Quick filters
      if (quickFilters.today) {
        const today = new Date().toDateString();
        if (new Date(reservation.date).toDateString() !== today) return false;
      }
      if (quickFilters.checkedIn && !reservation.checkedIn) return false;
      if (quickFilters.notCheckedIn && reservation.checkedIn) return false;
      if (quickFilters.thisWeek) {
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const reservationDate = new Date(reservation.date);
        if (reservationDate < now || reservationDate > weekFromNow) return false;
      }
      
      return matchesSearch && matchesDate && matchesShow && matchesStatus;
    });

    // Enhanced sorting
    filtered.sort((a, b) => {
      let aValue = a[sortKey as keyof Reservation];
      let bValue = b[sortKey as keyof Reservation];
      
      if (sortKey === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [reservations, searchQuery, selectedDate, selectedShow, statusFilter, sortKey, sortDirection, quickFilters]);

  // Enhanced statistics with more insights
  const reservationStats = useMemo(() => {
    const total = filteredReservations.length;
    const totalAll = reservations.length;
    const checkedIn = filteredReservations.filter(r => r.checkedIn).length;
    const totalGuests = filteredReservations.reduce((sum, r) => sum + r.guests, 0);
    const totalRevenue = filteredReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    
    // Today's stats
    const today = new Date().toDateString();
    const todaysReservations = reservations.filter(r => 
      new Date(r.date).toDateString() === today
    );
    const todaysTotal = todaysReservations.length;
    const todaysCheckedIn = todaysReservations.filter(r => r.checkedIn).length;
    
    // Upcoming stats
    const now = new Date();
    const upcoming = reservations.filter(r => 
      new Date(r.date) > now && !r.checkedIn
    ).length;
    
    // Revenue stats
    const avgReservationValue = total > 0 ? totalRevenue / total : 0;
    
    return { 
      total, 
      totalAll,
      checkedIn, 
      totalGuests, 
      totalRevenue,
      todaysTotal,
      todaysCheckedIn,
      upcoming,
      avgReservationValue,
      checkedInPercentage: total > 0 ? Math.round((checkedIn / total) * 100) : 0
    };
  }, [filteredReservations, reservations]);

  // Enhanced status badge with more states
  const getStatusBadge = (reservation: Reservation) => {
    if (reservation.checkedIn) {
      return <AdminBadge variant="success">✅ Ingecheckt</AdminBadge>;
    }
    
    const showDate = new Date(reservation.date);
    const today = new Date();
    const isToday = showDate.toDateString() === today.toDateString();
    const isPast = showDate < today;
    const isUpcoming = showDate > today;
    
    if (isPast) {
      return <AdminBadge variant="neutral">❌ Verlopen</AdminBadge>;
    }
    if (isToday) {
      return <AdminBadge variant="warning">🕒 Vandaag</AdminBadge>;
    }
    if (isUpcoming) {
      const diffTime = showDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) {
        return <AdminBadge variant="info">📅 Binnenkort</AdminBadge>;
      }
    }
    return <AdminBadge variant="primary">📋 Bevestigd</AdminBadge>;
  };

  // Enhanced priority badge
  const getPriorityIndicator = (reservation: Reservation) => {
    const showDate = new Date(reservation.date);
    const today = new Date();
    const isToday = showDate.toDateString() === today.toDateString();
    const guestCount = reservation.guests;
    
    if (isToday && !reservation.checkedIn) {
      return <div className="w-2 h-2 bg-admin-warning rounded-full" title="Vandaag - Nog niet ingecheckt" />;
    }
    
    if (guestCount >= 8) {
      return <div className="w-2 h-2 bg-admin-info rounded-full" title="Grote groep" />;
    }
    
    return null;
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleSelectReservation = (reservationId: string) => {
    setSelectedReservations(prev => 
      prev.includes(reservationId) 
        ? prev.filter(id => id !== reservationId)
        : [...prev, reservationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReservations.length === filteredReservations.length) {
      setSelectedReservations([]);
    } else {
      setSelectedReservations(filteredReservations.map(r => r.id));
    }
  };

  const clearFilters = () => {
    setSelectedDate('');
    setSelectedShow('');
    setStatusFilter('');
    setQuickFilters({
      today: false,
      checkedIn: false,
      notCheckedIn: false,
      thisWeek: false
    });
    onSearchChange?.('');
  };

  const handleQuickFilter = (filterKey: keyof typeof quickFilters) => {
    setQuickFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  const handleBulkAction = (action: 'checkIn' | 'delete' | 'export') => {
    const selected = filteredReservations.filter(r => 
      selectedReservations.includes(r.id)
    );
    
    switch (action) {
      case 'checkIn':
        onBulkCheckIn?.(selected);
        break;
      case 'delete':
        onBulkDelete?.(selected);
        break;
      case 'export':
        onExportReservations?.(selected);
        break;
    }
    
    setSelectedReservations([]);
  };

  // Enhanced table columns with selection
  const columns = [
    { 
      key: 'select', 
      label: '', 
      width: '50px',
      render: (reservation: any) => (
        <input
          type="checkbox"
          checked={selectedReservations.includes(reservation.id)}
          onChange={() => handleSelectReservation(reservation.id)}
          className="admin-checkbox"
        />
      )
    },
    { 
      key: 'priority', 
      label: '', 
      width: '30px',
      render: (reservation: any) => getPriorityIndicator(reservation)
    },
    { 
      key: 'customerName', 
      label: 'Klant', 
      sortable: true,
      render: (reservation: any) => (
        <div className="flex items-center gap-sm">
          <div>
            <div className="font-medium text-admin-text-primary">
              {reservation.customerName}
            </div>
            <div className="text-xs text-admin-text-secondary">
              {reservation.email}
            </div>
            <div className="text-xs text-admin-text-tertiary">
              {reservation.phone}
            </div>
          </div>
        </div>
      )
    },
    { 
      key: 'bookingNumber', 
      label: 'Boekingsnr', 
      sortable: true, 
      width: '110px',
      render: (reservation: any) => (
        <div className="font-mono text-sm bg-admin-surface-secondary px-2 py-1 rounded">
          #{reservation.bookingNumber || 'N/A'}
        </div>
      )
    },
    { 
      key: 'date', 
      label: 'Datum & Tijd', 
      sortable: true, 
      width: '140px',
      render: (reservation: any) => (
        <div>
          <div className="font-medium">
            {new Date(reservation.date).toLocaleDateString('nl-NL')}
          </div>
          <div className="text-xs text-admin-text-secondary">
            {reservation.time || '20:00'}
          </div>
        </div>
      )
    },
    { 
      key: 'showName', 
      label: 'Show', 
      sortable: true,
      render: (reservation: any) => (
        <div className="max-w-[150px]">
          <div className="font-medium truncate" title={reservation.showName}>
            {reservation.showName}
          </div>
        </div>
      )
    },
    { 
      key: 'guests', 
      label: 'Gasten', 
      sortable: true, 
      width: '80px', 
      align: 'center' as const,
      render: (reservation: any) => (
        <div className="flex items-center justify-center">
          <span className="bg-admin-primary-light text-admin-primary px-2 py-1 rounded-full text-sm font-medium">
            {reservation.guests}
          </span>
        </div>
      )
    },
    { 
      key: 'totalPrice', 
      label: 'Prijs', 
      sortable: true, 
      width: '100px', 
      align: 'right' as const,
      render: (reservation: any) => (
        <div className="text-right">
          <div className="font-semibold text-admin-success">
            €{reservation.totalPrice || 0}
          </div>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      width: '130px', 
      align: 'center' as const,
      render: (reservation: any) => getStatusBadge(reservation)
    }
  ];

  // Enhanced actions with better UX
  const renderActions = (reservation: any) => (
    <div className="flex items-center gap-xs">
      {!reservation.checkedIn && (
        <AdminButton
          variant="success"
          size="sm"
          onClick={() => onCheckIn(reservation)}
          title="Check-in deze reservering"
        >
          ✅ Check In
        </AdminButton>
      )}
      <AdminButton
        variant="ghost"
        size="sm"
        onClick={() => onEditReservation(reservation)}
        title="Bewerk reservering"
      >
        ✏️ Bewerken
      </AdminButton>
      <AdminButton
        variant="danger-ghost"
        size="sm"
        onClick={() => onDeleteReservation(reservation)}
        title="Verwijder reservering"
      >
        🗑️
      </AdminButton>
    </div>
  );

  // Process table data for rendering
  const tableData = filteredReservations;

  const uniqueDates = [...new Set(reservations.map(r => r.date))].sort();
  const uniqueShows = [...new Set(reservations.map(r => r.showName))].sort();

  return (
    <AdminLayout
      title="Reserveringen Beheer"
      subtitle={`${reservationStats.total} van ${reservationStats.totalAll} reserveringen weergegeven`}
      actions={
        <div className="flex items-center gap-sm">
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={() => onExportReservations?.(filteredReservations)}
          >
            📥 Exporteren
          </AdminButton>
          <AdminButton 
            variant="primary"
            onClick={onAddReservation}
          >
            ➕ Nieuwe Reservering
          </AdminButton>
        </div>
      }
    >
      {/* Enhanced Statistics Dashboard */}
      <AdminGrid columns={6} gap="md" className="mb-xl">
        <AdminCard variant="ghost" className="hover:shadow-admin-md transition-shadow">
          <div className="text-center">
            <div className="flex items-center justify-center mb-xs">
              <span className="text-lg mr-xs">📅</span>
              <div className="text-2xl font-bold text-admin-primary">
                {reservationStats.total}
              </div>
            </div>
            <div className="text-sm text-admin-text-secondary">
              Totaal Getoond
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="ghost" className="hover:shadow-admin-md transition-shadow">
          <div className="text-center">
            <div className="flex items-center justify-center mb-xs">
              <span className="text-lg mr-xs">✅</span>
              <div className="text-2xl font-bold text-admin-success">
                {reservationStats.checkedIn}
              </div>
            </div>
            <div className="text-sm text-admin-text-secondary">
              Ingecheckt ({reservationStats.checkedInPercentage}%)
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="ghost" className="hover:shadow-admin-md transition-shadow">
          <div className="text-center">
            <div className="flex items-center justify-center mb-xs">
              <span className="text-lg mr-xs">👥</span>
              <div className="text-2xl font-bold text-admin-info">
                {reservationStats.totalGuests}
              </div>
            </div>
            <div className="text-sm text-admin-text-secondary">
              Totaal Gasten
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="ghost" className="hover:shadow-admin-md transition-shadow">
          <div className="text-center">
            <div className="flex items-center justify-center mb-xs">
              <span className="text-lg mr-xs">💰</span>
              <div className="text-2xl font-bold text-admin-success">
                €{Math.round(reservationStats.totalRevenue)}
              </div>
            </div>
            <div className="text-sm text-admin-text-secondary">
              Totale Omzet
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="ghost" className="hover:shadow-admin-md transition-shadow">
          <div className="text-center">
            <div className="flex items-center justify-center mb-xs">
              <span className="text-lg mr-xs">🕒</span>
              <div className="text-2xl font-bold text-admin-warning">
                {reservationStats.todaysTotal}
              </div>
            </div>
            <div className="text-sm text-admin-text-secondary">
              Vandaag ({reservationStats.todaysCheckedIn} check-ins)
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="ghost" className="hover:shadow-admin-md transition-shadow">
          <div className="text-center">
            <div className="flex items-center justify-center mb-xs">
              <span className="text-lg mr-xs">📊</span>
              <div className="text-2xl font-bold text-admin-neutral">
                €{Math.round(reservationStats.avgReservationValue)}
              </div>
            </div>
            <div className="text-sm text-admin-text-secondary">
              Gem. Reservering
            </div>
          </div>
        </AdminCard>
      </AdminGrid>

      {/* Advanced Filters Section */}
      <AdminCard className="mb-xl">
        {/* Quick Filters */}
        <div className="mb-lg">
          <div className="flex items-center gap-sm mb-sm">
            <span className="text-sm">🔍</span>
            <h3 className="text-sm font-semibold text-admin-text-primary">Quick Filters</h3>
          </div>
          <div className="flex flex-wrap gap-sm">
            <AdminButton
              variant={quickFilters.today ? "primary" : "ghost"}
              size="sm"
              onClick={() => handleQuickFilter('today')}
            >
              📅 Vandaag ({reservations.filter(r => new Date(r.date).toDateString() === new Date().toDateString()).length})
            </AdminButton>
            <AdminButton
              variant={quickFilters.thisWeek ? "primary" : "ghost"}
              size="sm"
              onClick={() => handleQuickFilter('thisWeek')}
            >
              📅 Deze Week
            </AdminButton>
            <AdminButton
              variant={quickFilters.checkedIn ? "success" : "ghost"}
              size="sm"
              onClick={() => handleQuickFilter('checkedIn')}
            >
              ✅ Ingecheckt
            </AdminButton>
            <AdminButton
              variant={quickFilters.notCheckedIn ? "warning" : "ghost"}
              size="sm"
              onClick={() => handleQuickFilter('notCheckedIn')}
            >
              ⏰ Nog Niet Ingecheckt
            </AdminButton>
            <AdminButton
              variant="neutral"
              size="sm"
              onClick={clearFilters}
            >
              ❌ Wis Filters
            </AdminButton>
          </div>
        </div>

        {/* Detailed Filters */}
        <AdminGrid columns={4} gap="md">
          <div>
            <label className="block text-sm font-medium text-admin-text-primary mb-sm">
              🔍 Zoeken
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Naam, email, telefoon, boekingsnummer..."
              className="admin-input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-admin-text-primary mb-sm">
              📅 Datum
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="admin-select"
            >
              <option value="">Alle datums ({uniqueDates.length})</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>
                  {new Date(date as string).toLocaleDateString('nl-NL')} 
                  ({reservations.filter(r => r.date === date).length})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-admin-text-primary mb-sm">
              ⭐ Show
            </label>
            <select
              value={selectedShow}
              onChange={(e) => setSelectedShow(e.target.value)}
              className="admin-select"
            >
              <option value="">Alle shows ({uniqueShows.length})</option>
              {uniqueShows.map(show => (
                <option key={show} value={show}>
                  {show} ({reservations.filter(r => r.showName === show).length})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-admin-text-primary mb-sm">
              🛡️ Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select"
            >
              <option value="">Alle statussen</option>
              <option value="checked-in">Ingecheckt</option>
              <option value="not-checked-in">Nog niet ingecheckt</option>
              <option value="today">Vandaag</option>
              <option value="upcoming">Aankomend</option>
              <option value="expired">Verlopen</option>
            </select>
          </div>
        </AdminGrid>
      </AdminCard>

      {/* Bulk Actions Bar */}
      {selectedReservations.length > 0 && (
        <AdminCard className="mb-md bg-admin-primary-light border-admin-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-md">
              <span className="text-lg">☑️</span>
              <span className="font-medium text-admin-primary">
                {selectedReservations.length} reserveringen geselecteerd
              </span>
            </div>
            <div className="flex items-center gap-sm">
              <AdminButton
                variant="success"
                size="sm"
                onClick={() => handleBulkAction('checkIn')}
              >
                ✅ Bulk Check-in
              </AdminButton>
              <AdminButton
                variant="primary"
                size="sm"
                onClick={() => handleBulkAction('export')}
              >
                📥 Exporteren
              </AdminButton>
              <AdminButton
                variant="danger"
                size="sm"
                onClick={() => handleBulkAction('delete')}
              >
                🗑️ Verwijderen
              </AdminButton>
              <AdminButton
                variant="ghost"
                size="sm"
                onClick={() => setSelectedReservations([])}
              >
                ❌ Deselecteren
              </AdminButton>
            </div>
          </div>
        </AdminCard>
      )}

      {/* Enhanced Reservations Table */}
      <AdminCard>
        <div className="flex items-center justify-between mb-lg">
          <div className="flex items-center gap-md">
            <h2 className="text-lg font-semibold text-admin-text-primary">
              Reserveringen Overzicht
            </h2>
            <AdminBadge variant="info">{filteredReservations.length} resultaten</AdminBadge>
          </div>
          
          <div className="flex items-center gap-sm">
            <AdminButton
              variant={viewMode === 'table' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              📋 Tabel
            </AdminButton>
            <AdminButton
              variant={viewMode === 'cards' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              🔲 Kaarten
            </AdminButton>
            
            {/* Select All Checkbox */}
            <div className="flex items-center gap-xs ml-md">
              <input
                type="checkbox"
                checked={selectedReservations.length === filteredReservations.length && filteredReservations.length > 0}
                onChange={handleSelectAll}
                className="admin-checkbox"
              />
              <label className="text-sm text-admin-text-secondary">
                Selecteer alle
              </label>
            </div>
          </div>
        </div>

        <AdminDataTable
          columns={columns}
          data={tableData}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          actions={renderActions}
          loading={loading}
          emptyMessage={
            <div className="text-center py-xl">
              <div className="text-6xl mb-md">🔍</div>
              <h3 className="text-lg font-medium text-admin-text-secondary mb-sm">
                Geen reserveringen gevonden
              </h3>
              <p className="text-admin-text-tertiary mb-lg">
                Probeer je zoekfilters aan te passen om meer resultaten te zien.
              </p>
              <AdminButton
                variant="ghost"
                onClick={clearFilters}
              >
                🔄 Filters wissen
              </AdminButton>
            </div>
          }
          className="rounded-lg overflow-hidden shadow-admin-sm"
        />
      </AdminCard>
    </AdminLayout>
  );
};
