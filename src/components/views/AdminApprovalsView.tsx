import React, { useState, useMemo } from 'react';
import { Reservation, ShowEvent } from '../../types/types';
import { AdminLayout, AdminCard, AdminButton, AdminBadge, AdminGrid, AdminDataTable } from '../layout/AdminLayout';
import { resendConfirmationEmail, sendBookingConfirmedEmail, sendBookingRejectedEmail, type BookingEmailData } from '../../services/emailService';
import { calculateAvailableCapacity, getBookingMessage } from '../../utils/utilities';

interface AdminApprovalsViewProps {
  reservations: Reservation[];
  showEvents: ShowEvent[];
  onUpdateReservation: (reservation: Reservation) => void;
  guestCountMap: Map<string, number>;
  loading?: boolean;
}

const AdminApprovalsView: React.FC<AdminApprovalsViewProps> = ({
  reservations,
  showEvents,
  onUpdateReservation,
  guestCountMap,
  loading = false
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [sortKey, setSortKey] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [rejectingReservation, setRejectingReservation] = useState<Reservation | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Calculate approval statistics
  const approvalStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayReservations = reservations.filter(r => 
      new Date(r.date).toDateString() === today || 
      (r.createdAt && new Date(r.createdAt).toDateString() === today)
    );

    return {
      pending: reservations.filter(r => r.status === 'provisional').length,
      approvedToday: todayReservations.filter(r => r.status === 'confirmed').length,
      rejectedToday: todayReservations.filter(r => r.status === 'cancelled').length,
      totalToday: todayReservations.length,
      urgentCount: reservations.filter(r => {
        if (r.status !== 'provisional') return false;
        const showDate = new Date(r.date);
        const today = new Date();
        const diffDays = Math.ceil((showDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7; // Urgent if within 7 days
      }).length
    };
  }, [reservations]);

  // Filter reservations based on status
  const filteredReservations = useMemo(() => {
    let filtered: Reservation[] = [];
    
    switch (filter) {
      case 'pending':
        filtered = reservations.filter(r => r.status === 'provisional');
        break;
      case 'approved':
        filtered = reservations.filter(r => r.status === 'confirmed');
        break;
      case 'rejected':
        filtered = reservations.filter(r => r.status === 'cancelled');
        break;
      default:
        filtered = reservations;
    }

    // Sort reservations
    return filtered.sort((a, b) => {
      const aValue = a[sortKey as keyof Reservation];
      const bValue = b[sortKey as keyof Reservation];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [reservations, filter, sortKey, sortDirection]);

  // Handle sorting
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Get show name from showEvents
  const getShowName = (date: string) => {
    const show = showEvents.find(s => s.date === date);
    return show?.name || `Show ${date}`;
  };

  // Get show type from showEvents
  const getShowType = (date: string) => {
    const show = showEvents.find(s => s.date === date);
    return show?.type || 'Theater';
  };

  // Get capacity info for a reservation
  const getCapacityInfo = (reservation: Reservation) => {
    const show = showEvents.find(s => s.date === reservation.date);
    const baseCapacity = show?.capacity || 50;
    const capacity = show?.manualCapacityOverride || baseCapacity;
    
    const currentBookings = guestCountMap.get(reservation.date) || 0;
    const total = currentBookings + reservation.guests;
    const remaining = capacity - total;
    const wouldExceed = total > capacity;
    const exceedsBy = wouldExceed ? total - capacity : 0;

    return {
      capacity,
      total,
      remaining: Math.max(0, remaining),
      wouldExceed,
      exceedsBy
    };
  };

  // Handle email sending
  const handleResendEmail = async (reservation: Reservation, emailType: 'confirmed' | 'provisional') => {
    try {
      const emailData: BookingEmailData = {
        customerName: reservation.contactName,
        customerEmail: reservation.email,
        customerPhone: reservation.phone,
        customerAddress: reservation.address,
        customerCity: reservation.city,
        customerPostalCode: reservation.postalCode,
        customerCountry: reservation.country,
        companyName: reservation.companyName,
        showTitle: getShowName(reservation.date),
        showDate: reservation.date,
        packageType: reservation.drinkPackage,
        numberOfGuests: reservation.guests,
        totalPrice: reservation.totalPrice,
        reservationId: reservation.id,
        allergies: reservation.allergies,
        preShowDrinks: reservation.preShowDrinks,
        afterParty: reservation.afterParty ? reservation.guests : 0,
        remarks: reservation.remarks,
        promoCode: reservation.promoCode,
        discountAmount: reservation.discountAmount
      };

      await resendConfirmationEmail(emailData, emailType);
      console.log(`Email ${emailType} verzonden naar ${reservation.email}`);
    } catch (error) {
      console.error('Fout bij versturen email:', error);
    }
  };

  // Handle approval with proper email and capacity management
  const handleApprove = async (reservation: Reservation) => {
    try {
      const show = showEvents.find(s => s.date === reservation.date);
      if (!show) {
        console.error('Show not found for reservation');
        return;
      }

      // Get current capacity info
      const availableCapacity = calculateAvailableCapacity(show, filteredReservations);
      const isOverbooking = reservation.guests > availableCapacity;

      const updatedReservation: Reservation = {
        ...reservation,
        status: 'confirmed',
        approvedBy: 'Admin', // In real app, get current user
        isOverbooking: isOverbooking,
        capacityOverride: isOverbooking ? show.capacity : undefined,
        originalAvailableSpots: availableCapacity
      };

      // Send confirmation email
      const emailData: BookingEmailData = {
        customerName: reservation.contactName,
        customerEmail: reservation.email,
        customerPhone: reservation.phone,
        customerAddress: reservation.address,
        customerCity: reservation.city,
        customerPostalCode: reservation.postalCode,
        customerCountry: reservation.country,
        companyName: reservation.companyName,
        showTitle: getShowName(reservation.date),
        showDate: reservation.date,
        packageType: reservation.drinkPackage,
        numberOfGuests: reservation.guests,
        totalPrice: reservation.totalPrice,
        reservationId: reservation.id,
        allergies: reservation.allergies,
        preShowDrinks: reservation.preShowDrinks,
        afterParty: reservation.afterParty ? reservation.guests : 0,
        remarks: reservation.remarks,
        promoCode: reservation.promoCode,
        discountAmount: reservation.discountAmount
      };

      await sendBookingConfirmedEmail(emailData);
      onUpdateReservation(updatedReservation);
      
      console.log(`Booking ${reservation.id} approved successfully`);
    } catch (error) {
      console.error('Error approving reservation:', error);
    }
  };

  // Handle rejection with proper email
  const handleReject = async (reservation: Reservation, rejectionReason: string = '') => {
    try {
      const updatedReservation: Reservation = {
        ...reservation,
        status: 'rejected',
        rejectedBy: 'Admin', // In real app, get current user
        rejectionReason: rejectionReason || 'Capaciteit overschreden - kan niet worden geaccommodeerd'
      };

      // Send rejection email
      const emailData: BookingEmailData = {
        customerName: reservation.contactName,
        customerEmail: reservation.email,
        customerPhone: reservation.phone,
        customerAddress: reservation.address,
        customerCity: reservation.city,
        customerPostalCode: reservation.postalCode,
        customerCountry: reservation.country,
        companyName: reservation.companyName,
        showTitle: getShowName(reservation.date),
        showDate: reservation.date,
        packageType: reservation.drinkPackage,
        numberOfGuests: reservation.guests,
        totalPrice: reservation.totalPrice,
        reservationId: reservation.id,
        allergies: reservation.allergies,
        preShowDrinks: reservation.preShowDrinks,
        afterParty: reservation.afterParty ? reservation.guests : 0,
        remarks: reservation.remarks,
        promoCode: reservation.promoCode,
        discountAmount: reservation.discountAmount
      };

      await sendBookingRejectedEmail(emailData, rejectionReason);
      onUpdateReservation(updatedReservation);
      
      console.log(`Booking ${reservation.id} rejected successfully`);
    } catch (error) {
      console.error('Error rejecting reservation:', error);
    }
  };

  // Get urgency indicator
  const getUrgencyIndicator = (reservation: Reservation) => {
    const showDate = new Date(reservation.date);
    const today = new Date();
    const diffDays = Math.ceil((showDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return <div className="w-2 h-2 bg-red-500 rounded-full" title="Vandaag/Morgen - Urgent!" />;
    }
    if (diffDays <= 3) {
      return <div className="w-2 h-2 bg-orange-500 rounded-full" title="Deze week - Prioriteit" />;
    }
    if (diffDays <= 7) {
      return <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Volgende week" />;
    }
    return null;
  };

  // Status badge helper
  const getStatusBadge = (reservation: Reservation) => {
    switch (reservation.status) {
      case 'provisional':
        return <AdminBadge variant="warning">🕒 Wachtend</AdminBadge>;
      case 'confirmed':
        return <AdminBadge variant="success">✅ Goedgekeurd</AdminBadge>;
      case 'cancelled':
        return <AdminBadge variant="danger">❌ Afgewezen</AdminBadge>;
      case 'rejected':
        return <AdminBadge variant="danger">🚫 Geweigerd</AdminBadge>;
      default:
        return <AdminBadge variant="neutral">{reservation.status}</AdminBadge>;
    }
  };

  // Table columns definition - Simple and focused
  const columns = [
    {
      key: 'urgency',
      label: '',
      width: '30px',
      render: (reservation: Reservation) => (
        <div className="flex items-center justify-center">
          {getUrgencyIndicator(reservation)}
        </div>
      )
    },
    {
      key: 'customerName',
      label: 'Klantgegevens',
      sortable: true,
      width: '220px',
      render: (reservation: Reservation) => (
        <div className="flex items-start gap-sm">
          <div className="w-10 h-10 bg-admin-primary-light text-admin-primary rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {(reservation.contactName || 'N/A').split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-admin-text-primary">
              {reservation.salutation ? `${reservation.salutation} ${reservation.contactName}` : reservation.contactName || 'Geen naam'}
            </div>
            <div className="text-xs text-admin-text-secondary">
              📧 {reservation.email || 'Geen email'}
            </div>
            <div className="text-xs text-admin-text-tertiary">
              📞 {reservation.phoneCode ? `${reservation.phoneCode} ` : ''}{reservation.phone || 'Geen telefoon'}
            </div>
            {(reservation.address && reservation.city) && (
              <div className="text-xs text-admin-text-tertiary">
                📍 {reservation.address} {reservation.houseNumber}, {reservation.postalCode} {reservation.city}
              </div>
            )}
            {reservation.companyName && (
              <div className="text-xs text-admin-text-tertiary">
                🏢 {reservation.companyName}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'showInfo',
      label: 'Show & Datum',
      sortable: true,
      width: '150px',
      render: (reservation: Reservation) => {
        const showDate = new Date(reservation.date);
        const today = new Date();
        const daysUntilShow = Math.ceil((showDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isToday = showDate.toDateString() === today.toDateString();
        const isPast = showDate < today;
        
        return (
          <div>
            <div className="font-medium text-admin-text-primary">
              {getShowName(reservation.date)}
            </div>
            <div className="text-xs text-admin-text-secondary">
              {getShowType(reservation.date)}
            </div>
            <div className={`text-xs font-medium ${
              isPast ? 'text-admin-danger' : 
              isToday ? 'text-admin-warning' : 
              daysUntilShow <= 3 ? 'text-admin-warning' : 
              'text-admin-text-tertiary'
            }`}>
              {showDate.toLocaleDateString('nl-NL', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </div>
            {!isPast && (
              <div className={`text-xs ${
                isToday ? 'text-admin-danger font-semibold' : 
                daysUntilShow <= 3 ? 'text-admin-warning' : 
                'text-admin-text-tertiary'
              }`}>
                {isToday ? '🚨 VANDAAG!' : 
                 daysUntilShow === 1 ? '⚠️ Morgen' : 
                 daysUntilShow <= 7 ? `📅 ${daysUntilShow}d` : 
                 `📅 ${daysUntilShow}d`}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'guests',
      label: 'Gasten',
      sortable: true,
      width: '80px',
      align: 'center' as const,
      render: (reservation: Reservation) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-admin-info-light text-admin-info rounded-full text-sm font-semibold">
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
      render: (reservation: Reservation) => {
        const totalPrice = reservation.totalPrice || 0;
        const discountAmount = reservation.discountAmount || 0;
        
        return (
          <div className="text-right">
            <div className="font-semibold text-admin-success">
              €{totalPrice.toFixed(2)}
            </div>
            {discountAmount > 0 && (
              <div className="text-xs text-admin-warning">
                -€{discountAmount.toFixed(2)}
              </div>
            )}
            <div className="text-xs text-admin-text-tertiary">
              €{(totalPrice / reservation.guests).toFixed(2)} p.p.
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      align: 'center' as const,
      render: (reservation: Reservation) => getStatusBadge(reservation)
    }
  ];

  // Actions renderer
  const renderActions = (reservation: Reservation) => {
    if (reservation.status !== 'provisional') {
      return (
        <div className="flex items-center gap-xs">
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={() => handleResendEmail(reservation, reservation.status === 'confirmed' ? 'confirmed' : 'provisional')}
            title="Email opnieuw versturen"
          >
            📧
          </AdminButton>
          <span className="text-xs text-admin-text-tertiary">
            {reservation.status === 'confirmed' ? 'Goedgekeurd' : 'Afgewezen'}
          </span>
        </div>
      );
    }

    const capacityInfo = getCapacityInfo(reservation);

    return (
      <div className="flex items-center gap-xs">
        <AdminButton
          variant="success"
          size="sm"
          onClick={() => handleApprove(reservation)}
          title={`Goedkeuren ${capacityInfo.wouldExceed ? '(Overschrijdt capaciteit!)' : ''}`}
        >
          ✅
        </AdminButton>
        <AdminButton
          variant="danger"
          size="sm"
          onClick={() => {
            setRejectingReservation(reservation);
            setRejectionReason('');
          }}
          title="Afwijzen"
        >
          ❌
        </AdminButton>
        <AdminButton
          variant="ghost"
          size="sm"
          onClick={() => handleResendEmail(reservation, 'provisional')}
          title="Voorlopige email opnieuw versturen"
        >
          📧
        </AdminButton>
      </div>
    );
  };

  return (
    <AdminLayout
      title="Goedkeuringen Beheer"
      subtitle="Beheer boekingsgoedkeuringen en capaciteitsoverschrijdingen"
      actions={
        <div className="flex items-center gap-sm">
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
          >
            🔄 Vernieuwen
          </AdminButton>
        </div>
      }
    >
      {/* Statistics Dashboard */}
      <AdminGrid columns={4} gap="md" className="mb-xl">
        <AdminCard variant="ghost" className="hover:shadow-admin-md transition-shadow">
          <div className="text-center">
            <div className="flex items-center justify-center mb-xs">
              <span className="text-lg mr-xs">⏳</span>
              <div className="text-2xl font-bold text-admin-warning">
                {approvalStats.pending}
              </div>
            </div>
            <div className="text-sm text-admin-text-secondary">
              Wachtende Goedkeuringen
            </div>
            {approvalStats.urgentCount > 0 && (
              <div className="text-xs text-admin-danger mt-xs">
                {approvalStats.urgentCount} urgent
              </div>
            )}
          </div>
        </AdminCard>

        <AdminCard variant="ghost" className="hover:shadow-admin-md transition-shadow">
          <div className="text-center">
            <div className="flex items-center justify-center mb-xs">
              <span className="text-lg mr-xs">✅</span>
              <div className="text-2xl font-bold text-admin-success">
                {approvalStats.approvedToday}
              </div>
            </div>
            <div className="text-sm text-admin-text-secondary">
              Vandaag Goedgekeurd
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="ghost" className="hover:shadow-admin-md transition-shadow">
          <div className="text-center">
            <div className="flex items-center justify-center mb-xs">
              <span className="text-lg mr-xs">❌</span>
              <div className="text-2xl font-bold text-admin-danger">
                {approvalStats.rejectedToday}
              </div>
            </div>
            <div className="text-sm text-admin-text-secondary">
              Vandaag Afgewezen
            </div>
          </div>
        </AdminCard>

        <AdminCard variant="ghost" className="hover:shadow-admin-md transition-shadow">
          <div className="text-center">
            <div className="flex items-center justify-center mb-xs">
              <span className="text-lg mr-xs">📊</span>
              <div className="text-2xl font-bold text-admin-primary">
                {approvalStats.totalToday}
              </div>
            </div>
            <div className="text-sm text-admin-text-secondary">
              Totaal Vandaag
            </div>
          </div>
        </AdminCard>
      </AdminGrid>

      {/* Filter Controls */}
      <AdminCard className="mb-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <span className="text-sm font-medium text-admin-text-primary">🔍 Filter:</span>
            <AdminButton
              variant={filter === 'pending' ? 'warning' : 'ghost'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              ⏳ Wachtend ({approvalStats.pending})
            </AdminButton>
            <AdminButton
              variant={filter === 'approved' ? 'success' : 'ghost'}
              size="sm"
              onClick={() => setFilter('approved')}
            >
              ✅ Goedgekeurd
            </AdminButton>
            <AdminButton
              variant={filter === 'rejected' ? 'danger' : 'ghost'}
              size="sm"
              onClick={() => setFilter('rejected')}
            >
              ❌ Afgewezen
            </AdminButton>
            <AdminButton
              variant={filter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              📋 Alle
            </AdminButton>
          </div>
        </div>
      </AdminCard>

      {/* Approvals Table */}
      <AdminCard>
        <div className="flex items-center justify-between mb-lg">
          <div className="flex items-center gap-md">
            <h2 className="text-lg font-semibold text-admin-text-primary">
              Goedkeuringen Overzicht
            </h2>
            <AdminBadge variant="info">{filteredReservations.length} resultaten</AdminBadge>
          </div>
        </div>

        <AdminDataTable
          columns={columns}
          data={filteredReservations}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          actions={renderActions}
          loading={loading}
          emptyMessage={
            <div className="text-center py-xl">
              <div className="text-6xl mb-md">✅</div>
              <h3 className="text-lg font-medium text-admin-text-secondary mb-sm">
                Geen wachtende goedkeuringen
              </h3>
              <p className="text-admin-text-tertiary mb-lg">
                Alle boekingen zijn verwerkt of er zijn geen nieuwe aanvragen.
              </p>
              <AdminButton
                variant="primary"
                onClick={() => setFilter('all')}
              >
                Bekijk alle boekingen
              </AdminButton>
            </div>
          }
        />
      </AdminCard>

      {/* Rejection Modal */}
      {rejectingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-lg max-w-md w-full mx-md">
            <h3 className="text-lg font-semibold text-admin-text-primary mb-md">
              Boeking Afwijzen
            </h3>
            <p className="text-admin-text-secondary mb-lg">
              Klant: <strong>{rejectingReservation.contactName}</strong><br/>
              Show: <strong>{getShowName(rejectingReservation.date)}</strong><br/>
              Datum: <strong>{new Date(rejectingReservation.date).toLocaleDateString('nl-NL')}</strong><br/>
              Gasten: <strong>{rejectingReservation.guests}</strong>
            </p>
            
            <div className="mb-lg">
              <label className="block text-sm font-medium text-admin-text-primary mb-sm">
                Reden voor afwijzing (optioneel)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Bijvoorbeeld: Capaciteit overschreden, geen extra accommodatie mogelijk..."
                className="w-full p-sm border border-admin-border rounded-md resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-sm">
              <AdminButton
                variant="ghost"
                onClick={() => {
                  setRejectingReservation(null);
                  setRejectionReason('');
                }}
              >
                Annuleren
              </AdminButton>
              <AdminButton
                variant="danger"
                onClick={() => {
                  handleReject(rejectingReservation, rejectionReason);
                  setRejectingReservation(null);
                  setRejectionReason('');
                }}
              >
                ❌ Afwijzen
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminApprovalsView;
