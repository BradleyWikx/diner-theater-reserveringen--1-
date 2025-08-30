import React, { useState, useMemo } from 'react';
import { AdminLayout, AdminCard, AdminGrid, AdminButton, AdminBadge, AdminDataTable } from '../layout';
import { ConfirmationDialog, BulkConfirmationDialog, useDeleteConfirmation } from '../shared/ConfirmationDialog';
import { useToast, useApiToast } from '../shared/ToastSystem';
import { useErrorHandler } from '../shared/AdminErrorBoundary';
import { logAuditEvent, createAuditLog } from '../../utils/security';
import type { Reservation, ShowEvent } from '../../types/types';

interface EnhancedAdminReservationsViewProps {
  reservations: Reservation[];
  showEvents: ShowEvent[];
  onEditReservation: (reservation: Reservation) => void;
  onDeleteReservation: (reservation: Reservation) => Promise<void>;
  onCheckIn: (reservation: Reservation) => Promise<void>;
  onBulkCheckIn?: (reservations: Reservation[]) => Promise<void>;
  onBulkDelete?: (reservations: Reservation[]) => Promise<void>;
  onExportReservations?: (reservations: Reservation[]) => Promise<void>;
  onAddReservation?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  loading?: boolean;
  currentUser?: { id: string; email: string };
}

export const EnhancedAdminReservationsView: React.FC<EnhancedAdminReservationsViewProps> = ({
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
  loading = false,
  currentUser
}) => {
  // Enhanced state management
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShow, setSelectedShow] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortKey, setSortKey] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Enhanced hooks
  const toast = useToast();
  const apiToast = useApiToast();
  const { reportError, handleAsyncError } = useErrorHandler();
  const { confirmDelete, DeleteConfirmationComponent } = useDeleteConfirmation();

  // Bulk confirmation dialog state
  const [bulkConfirmation, setBulkConfirmation] = useState<{
    isOpen: boolean;
    action: string;
    count: number;
    type: string;
    onConfirm: () => void;
  } | null>(null);

  // Enhanced filtering with performance optimization
  const filteredReservations = useMemo(() => {
    let filtered = reservations.filter(reservation => {
      const matchesSearch = !searchQuery || 
        reservation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.phone.includes(searchQuery) ||
        reservation.bookingNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDate = !selectedDate || reservation.date === selectedDate;
      const matchesShow = !selectedShow || reservation.showName === selectedShow;
      
      // Enhanced status filtering
      let matchesStatus = true;
      if (statusFilter) {
        switch (statusFilter) {
          case 'checked-in':
            matchesStatus = reservation.checkedIn;
            break;
          case 'not-checked-in':
            matchesStatus = !reservation.checkedIn;
            break;
          case 'today':
            const today = new Date().toDateString();
            matchesStatus = new Date(reservation.date).toDateString() === today;
            break;
          case 'upcoming':
            const now = new Date();
            const reservationDate = new Date(reservation.date);
            matchesStatus = reservationDate > now && !reservation.checkedIn;
            break;
          case 'expired':
            const currentTime = new Date();
            const resDate = new Date(reservation.date);
            matchesStatus = resDate < currentTime && !reservation.checkedIn;
            break;
          case 'this-week':
            const weekStart = new Date();
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() + 7);
            const checkDate = new Date(reservation.date);
            matchesStatus = checkDate >= weekStart && checkDate <= weekEnd;
            break;
        }
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
  }, [reservations, searchQuery, selectedDate, selectedShow, statusFilter, sortKey, sortDirection]);

  // Enhanced statistics
  const reservationStats = useMemo(() => {
    const total = filteredReservations.length;
    const checkedIn = filteredReservations.filter(r => r.checkedIn).length;
    const totalGuests = filteredReservations.reduce((sum, r) => sum + r.guests, 0);
    const totalRevenue = filteredReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    
    const today = new Date().toDateString();
    const todaysReservations = reservations.filter(r => 
      new Date(r.date).toDateString() === today
    );
    const todaysTotal = todaysReservations.length;
    const todaysCheckedIn = todaysReservations.filter(r => r.checkedIn).length;
    
    const now = new Date();
    const upcoming = reservations.filter(r => 
      new Date(r.date) > now && !r.checkedIn
    ).length;
    
    const avgReservationValue = total > 0 ? totalRevenue / total : 0;
    const checkedInPercentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    
    return { 
      total, 
      checkedIn, 
      totalGuests, 
      totalRevenue,
      todaysTotal,
      todaysCheckedIn,
      upcoming,
      avgReservationValue,
      checkedInPercentage,
      pendingCheckIn: total - checkedIn,
      selectedCount: selectedReservations.length
    };
  }, [filteredReservations, reservations, selectedReservations.length]);

  // Enhanced bulk operations
  const handleBulkAction = async (action: string) => {
    if (selectedReservations.length === 0) {
      toast.warning('No Selection', 'Please select reservations first');
      return;
    }

    const selectedItems = filteredReservations.filter(r => 
      selectedReservations.includes(r.id)
    );

    switch (action) {
      case 'check-in':
        if (onBulkCheckIn) {
          setBulkConfirmation({
            isOpen: true,
            action: 'check in',
            count: selectedReservations.length,
            type: 'reservation',
            onConfirm: () => performBulkCheckIn(selectedItems)
          });
        }
        break;
      case 'delete':
        if (onBulkDelete) {
          setBulkConfirmation({
            isOpen: true,
            action: 'delete',
            count: selectedReservations.length,
            type: 'reservation',
            onConfirm: () => performBulkDelete(selectedItems)
          });
        }
        break;
      case 'export':
        if (onExportReservations) {
          await performBulkExport(selectedItems);
        }
        break;
    }
  };

  const performBulkCheckIn = async (items: Reservation[]) => {
    setIsProcessing(true);
    setBulkConfirmation(null);
    
    try {
      await handleAsyncError(async () => {
        if (onBulkCheckIn) {
          await onBulkCheckIn(items);
          
          // Log audit event
          if (currentUser) {
            logAuditEvent(createAuditLog(
              currentUser.id,
              currentUser.email,
              'BULK_CHECK_IN',
              'reservations',
              undefined,
              { count: items.length, reservationIds: items.map(i => i.id) }
            ));
          }
          
          apiToast.apiSuccess('Bulk Check-in', `${items.length} reservations`);
          setSelectedReservations([]);
        }
      }, 'bulk check-in');
    } catch (error) {
      apiToast.apiError('Bulk Check-in', error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const performBulkDelete = async (items: Reservation[]) => {
    setIsProcessing(true);
    setBulkConfirmation(null);
    
    try {
      await handleAsyncError(async () => {
        if (onBulkDelete) {
          await onBulkDelete(items);
          
          // Log audit event
          if (currentUser) {
            logAuditEvent(createAuditLog(
              currentUser.id,
              currentUser.email,
              'BULK_DELETE',
              'reservations',
              undefined,
              { count: items.length, reservationIds: items.map(i => i.id) }
            ));
          }
          
          apiToast.apiSuccess('Bulk Delete', `${items.length} reservations`);
          setSelectedReservations([]);
        }
      }, 'bulk delete');
    } catch (error) {
      apiToast.apiError('Bulk Delete', error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const performBulkExport = async (items: Reservation[]) => {
    setIsProcessing(true);
    
    try {
      await handleAsyncError(async () => {
        if (onExportReservations) {
          await onExportReservations(items);
          
          // Log audit event
          if (currentUser) {
            logAuditEvent(createAuditLog(
              currentUser.id,
              currentUser.email,
              'BULK_EXPORT',
              'reservations',
              undefined,
              { count: items.length, reservationIds: items.map(i => i.id) }
            ));
          }
          
          apiToast.apiSuccess('Export', `${items.length} reservations exported`);
        }
      }, 'bulk export');
    } catch (error) {
      apiToast.apiError('Export', error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced individual actions with error handling
  const handleCheckIn = async (reservation: Reservation) => {
    try {
      await handleAsyncError(async () => {
        await onCheckIn(reservation);
        
        if (currentUser) {
          logAuditEvent(createAuditLog(
            currentUser.id,
            currentUser.email,
            'CHECK_IN',
            'reservation',
            reservation.id,
            { customerName: reservation.customerName }
          ));
        }
        
        apiToast.apiSuccess('Check-in', reservation.customerName);
      }, 'check-in');
    } catch (error) {
      apiToast.apiError('Check-in', error as Error, reservation.customerName);
    }
  };

  const handleDelete = (reservation: Reservation) => {
    confirmDelete({
      itemName: reservation.customerName,
      itemType: 'reservation',
      additionalInfo: `This will also delete all associated data for booking #${reservation.bookingNumber}`,
      onConfirm: async () => {
        try {
          await handleAsyncError(async () => {
            await onDeleteReservation(reservation);
            
            if (currentUser) {
              logAuditEvent(createAuditLog(
                currentUser.id,
                currentUser.email,
                'DELETE',
                'reservation',
                reservation.id,
                { customerName: reservation.customerName, bookingNumber: reservation.bookingNumber }
              ));
            }
            
            apiToast.apiSuccess('Delete', reservation.customerName);
          }, 'delete reservation');
        } catch (error) {
          apiToast.apiError('Delete', error as Error, reservation.customerName);
        }
      }
    });
  };

  // Enhanced status badge
  const getStatusBadge = (reservation: Reservation) => {
    if (reservation.checkedIn) {
      return <AdminBadge variant="success">✅ Checked In</AdminBadge>;
    }
    
    const showDate = new Date(reservation.date);
    const today = new Date();
    const isToday = showDate.toDateString() === today.toDateString();
    const isPast = showDate < today;
    const isUpcoming = showDate > today;
    
    if (isPast) {
      return <AdminBadge variant="danger">❌ Expired</AdminBadge>;
    }
    if (isToday) {
      return <AdminBadge variant="warning">🕒 Today</AdminBadge>;
    }
    if (isUpcoming) {
      const diffTime = showDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) {
        return <AdminBadge variant="info">📅 Soon</AdminBadge>;
      }
    }
    return <AdminBadge variant="primary">📋 Confirmed</AdminBadge>;
  };

  // Table columns configuration
  const tableColumns = [
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (reservation: Reservation) => (
        <div>
          <div className="font-medium">{reservation.customerName}</div>
          <div className="text-sm text-gray-500">{reservation.email}</div>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date & Show',
      sortable: true,
      render: (reservation: Reservation) => (
        <div>
          <div className="font-medium">{new Date(reservation.date).toLocaleDateString()}</div>
          <div className="text-sm text-gray-500">{reservation.showName}</div>
        </div>
      )
    },
    {
      key: 'guests',
      label: 'Guests',
      sortable: true
    },
    {
      key: 'totalPrice',
      label: 'Price',
      sortable: true,
      render: (reservation: Reservation) => 
        reservation.totalPrice ? `€${reservation.totalPrice}` : '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (reservation: Reservation) => getStatusBadge(reservation)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (reservation: Reservation) => (
        <div className="flex gap-1">
          {!reservation.checkedIn && (
            <AdminButton
              variant="success"
              size="sm"
              onClick={() => handleCheckIn(reservation)}
            >
              Check In
            </AdminButton>
          )}
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => onEditReservation(reservation)}
          >
            Edit
          </AdminButton>
          <AdminButton
            variant="danger"
            size="sm"
            onClick={() => handleDelete(reservation)}
          >
            Delete
          </AdminButton>
        </div>
      )
    }
  ];

  return (
    <AdminLayout
      title="Reservations Management"
      subtitle={`${reservationStats.total} reservations found`}
      loading={loading || isProcessing}
      actions={
        <div className="flex gap-2">
          {onAddReservation && (
            <AdminButton variant="primary" onClick={onAddReservation}>
              + Add Reservation
            </AdminButton>
          )}
        </div>
      }
    >
      {/* Enhanced Statistics */}
      <AdminGrid columns="responsive" gap="md" className="mb-lg">
        <AdminCard variant="elevated">
          <div className="text-center">
            <div className="text-2xl font-bold text-admin-primary mb-xs">
              {reservationStats.total}
            </div>
            <div className="text-sm text-admin-text-secondary">
              Total Reservations
            </div>
            {reservationStats.selectedCount > 0 && (
              <div className="text-xs text-admin-info mt-1">
                {reservationStats.selectedCount} selected
              </div>
            )}
          </div>
        </AdminCard>

        <AdminCard variant="elevated">
          <div className="text-center">
            <div className="text-2xl font-bold text-admin-success mb-xs">
              {reservationStats.checkedIn}
            </div>
            <div className="text-sm text-admin-text-secondary">
              Checked In ({reservationStats.checkedInPercentage}%)
            </div>
            <div className="w-full bg-admin-border rounded-full h-2 mt-2">
              <div 
                className="bg-admin-success h-2 rounded-full transition-all"
                style={{ width: `${reservationStats.checkedInPercentage}%` }}
              ></div>
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="elevated">
          <div className="text-center">
            <div className="text-2xl font-bold text-admin-warning mb-xs">
              €{reservationStats.totalRevenue}
            </div>
            <div className="text-sm text-admin-text-secondary">
              Total Revenue
            </div>
            <div className="text-xs text-admin-text-tertiary mt-1">
              Ø €{Math.round(reservationStats.avgReservationValue)}
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="elevated">
          <div className="text-center">
            <div className="text-2xl font-bold text-admin-info mb-xs">
              {reservationStats.totalGuests}
            </div>
            <div className="text-sm text-admin-text-secondary">
              Total Guests
            </div>
          </div>
        </AdminCard>
      </AdminGrid>

      {/* Enhanced Filters */}
      <AdminCard className="mb-lg">
        <AdminGrid columns="responsive" gap="md">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Name, email, phone, booking number..."
              className="w-full px-3 py-2 border border-admin-border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-admin-border rounded-md"
            >
              <option value="">All Dates</option>
              {Array.from(new Set(reservations.map(r => r.date)))
                .sort()
                .map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString()}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Show</label>
            <select
              value={selectedShow}
              onChange={(e) => setSelectedShow(e.target.value)}
              className="w-full px-3 py-2 border border-admin-border rounded-md"
            >
              <option value="">All Shows</option>
              {Array.from(new Set(reservations.map(r => r.showName)))
                .sort()
                .map(show => (
                  <option key={show} value={show}>{show}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-admin-border rounded-md"
            >
              <option value="">All Status</option>
              <option value="checked-in">Checked In</option>
              <option value="not-checked-in">Not Checked In</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="this-week">This Week</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </AdminGrid>
      </AdminCard>

      {/* Bulk Actions */}
      {selectedReservations.length > 0 && (
        <AdminCard className="mb-lg bg-admin-info-light border-admin-info">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold">
                {selectedReservations.length} reservation{selectedReservations.length !== 1 ? 's' : ''} selected
              </span>
              <AdminButton
                variant="ghost"
                size="sm"
                onClick={() => setSelectedReservations([])}
              >
                Clear Selection
              </AdminButton>
            </div>

            <div className="flex gap-2">
              {onBulkCheckIn && (
                <AdminButton
                  variant="success"
                  size="sm"
                  onClick={() => handleBulkAction('check-in')}
                  disabled={isProcessing}
                >
                  Bulk Check-in
                </AdminButton>
              )}
              {onExportReservations && (
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                  disabled={isProcessing}
                >
                  Export Selected
                </AdminButton>
              )}
              {onBulkDelete && (
                <AdminButton
                  variant="danger"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  disabled={isProcessing}
                >
                  Delete Selected
                </AdminButton>
              )}
            </div>
          </div>
        </AdminCard>
      )}

      {/* Enhanced Data Table */}
      <AdminCard>
        <AdminDataTable
          data={filteredReservations}
          columns={tableColumns}
          selectedRows={selectedReservations}
          onSelectionChange={setSelectedReservations}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={(key, direction) => {
            setSortKey(key);
            setSortDirection(direction);
          }}
          loading={loading}
          emptyMessage="No reservations found"
          emptyIcon="📋"
        />
      </AdminCard>

      {/* Confirmation Dialogs */}
      {bulkConfirmation && (
        <BulkConfirmationDialog
          isOpen={bulkConfirmation.isOpen}
          title={`Bulk ${bulkConfirmation.action}`}
          itemCount={bulkConfirmation.count}
          itemType={bulkConfirmation.type}
          action={bulkConfirmation.action}
          onConfirm={bulkConfirmation.onConfirm}
          onCancel={() => setBulkConfirmation(null)}
          loading={isProcessing}
        />
      )}

      <DeleteConfirmationComponent />
    </AdminLayout>
  );
};

export default EnhancedAdminReservationsView;
