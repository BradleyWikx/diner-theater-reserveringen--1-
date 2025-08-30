import React, { useState, useMemo } from 'react';
import { Reservation, ShowEvent } from '../../types/types';
import { AdminLayout, AdminCard, AdminButton, AdminBadge, AdminGrid, AdminDataTable } from '../layout/AdminLayout';
import { resendConfirmationEmail, type BookingEmailData } from '../../services/emailService';

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
      case 'all':
      default:
        filtered = reservations.filter(r => r.status !== 'waitlisted');
        break;
    }

    // Sort the filtered results
    return filtered.sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (sortKey) {
        case 'date':
          valueA = new Date(a.date);
          valueB = new Date(b.date);
          break;
        case 'customerName':
          valueA = a.contactName.toLowerCase();
          valueB = b.contactName.toLowerCase();
          break;
        case 'guests':
          valueA = a.guests;
          valueB = b.guests;
          break;
        case 'totalPrice':
          valueA = a.totalPrice || 0;
          valueB = b.totalPrice || 0;
          break;
        default:
          valueA = a[sortKey as keyof Reservation];
          valueB = b[sortKey as keyof Reservation];
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [reservations, filter, sortKey, sortDirection]);

  // Get show name helper
  const getShowName = (date: string) => {
    const show = showEvents.find(s => s.date === date);
    return show ? `${show.name}` : 'Onbekende Show';
  };

  // Get show type helper
  const getShowType = (date: string) => {
    const show = showEvents.find(s => s.date === date);
    return show ? show.type : 'Onbekend';
  };

  // Calculate capacity impact
  const getCapacityInfo = (reservation: Reservation) => {
    const currentGuests = guestCountMap.get(reservation.date) || 0;
    const show = showEvents.find(s => s.date === reservation.date);
    const showCapacity = show?.capacity || 240;
    
    const totalWithReservation = currentGuests + reservation.guests;
    const wouldExceed = totalWithReservation > showCapacity;
    const remaining = Math.max(0, showCapacity - currentGuests);
    const exceedsBy = Math.max(0, totalWithReservation - showCapacity);
    
    return {
      current: currentGuests,
      capacity: showCapacity,
      total: totalWithReservation,
      wouldExceed,
      remaining,
      exceedsBy
    };
  };

  // Handle approval actions
  const handleApprove = (reservation: Reservation) => {
    const updated = { ...reservation, status: 'confirmed' as const };
    onUpdateReservation(updated);
  };

  const handleReject = (reservation: Reservation) => {
    const updated = { ...reservation, status: 'cancelled' as const };
    onUpdateReservation(updated);
  };

  // Handle email resend
  const handleResendEmail = async (reservation: Reservation, emailType: 'provisional' | 'confirmed' = 'confirmed') => {
    try {
      const show = showEvents.find(e => e.date === reservation.date);
      const emailData: BookingEmailData = {
        customerName: reservation.contactName || 'Onbekend',
        customerEmail: reservation.email || 'Niet opgegeven',
        customerPhone: reservation.phone || 'Niet opgegeven',
        customerAddress: `${reservation.address || ''} ${reservation.houseNumber || ''}`.trim() || undefined,
        customerCity: reservation.city || undefined,
        customerPostalCode: reservation.postalCode || undefined,
        customerCountry: reservation.country || 'Nederland',
        companyName: reservation.companyName,
        showTitle: show?.name || 'Onbekende show',
        showDate: reservation.date,
        showTime: show?.time || undefined,
        packageType: reservation.drinkPackage || 'standard',
        numberOfGuests: reservation.guests,
        totalPrice: reservation.totalPrice || 0,
        reservationId: reservation.id,
        allergies: reservation.allergies,
        preShowDrinks: reservation.preShowDrinks,
        afterParty: reservation.afterParty ? reservation.guests : undefined,
        remarks: reservation.remarks,
        promoCode: reservation.promoCode,
        discountAmount: reservation.discountAmount
      };

      const success = await resendConfirmationEmail(emailData, emailType);
      if (success) {
        alert(`Email ${emailType === 'provisional' ? 'voorlopige boeking' : 'bevestiging'} succesvol verstuurd naar ${reservation.email}`);
      } else {
        alert('Er is een fout opgetreden bij het versturen van de email');
      }
    } catch (error) {
      console.error('Email resend failed:', error);
      alert('Er is een fout opgetreden bij het versturen van de email');
    }
  };

  // Handle sorting
  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
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
      default:
        return <AdminBadge variant="neutral">{reservation.status}</AdminBadge>;
    }
  };

  // Table columns definition
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
      render: (reservation: Reservation) => (
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 bg-admin-primary-light text-admin-primary rounded-full flex items-center justify-center text-xs font-semibold">
            {reservation.contactName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="font-medium text-admin-text-primary">
              {reservation.contactName}
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
      key: 'showInfo',
      label: 'Show Details',
      sortable: true,
      render: (reservation: Reservation) => (
        <div>
          <div className="font-medium text-admin-text-primary">
            {getShowName(reservation.date)}
          </div>
          <div className="text-xs text-admin-text-secondary">
            {getShowType(reservation.date)}
          </div>
          <div className="text-xs text-admin-text-tertiary">
            {new Date(reservation.date).toLocaleDateString('nl-NL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </div>
        </div>
      )
    },
    {
      key: 'details',
      label: 'Borrels & Extra\'s',
      render: (reservation: Reservation) => {
        const details = [];
        
        // Drankenpakket
        details.push(`📦 ${reservation.drinkPackage === 'premium' ? 'Premium' : 'Standaard'} pakket`);
        
        // Borrels
        if (reservation.preShowDrinks) details.push(`🍹 Pre-show borrel (${reservation.guests}x)`);
        if (reservation.afterParty) details.push(`🎉 After party (${reservation.guests}x)`);
        
        // Allergieën
        if (reservation.allergies) details.push(`🥗 Allergieën: ${reservation.allergies.length > 50 ? reservation.allergies.substring(0, 50) + '...' : reservation.allergies}`);
        
        // Promocode
        if (reservation.promoCode) details.push(`🎟️ ${reservation.promoCode}`);
        
        return (
          <div className="text-xs space-y-1">
            {details.length > 0 ? details.map((detail, i) => (
              <div key={i} className="text-admin-text-tertiary">
                {detail}
              </div>
            )) : (
              <span className="text-admin-text-tertiary italic">Geen extra's</span>
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
      key: 'capacity',
      label: 'Capaciteit Impact',
      render: (reservation: Reservation) => {
        const capacityInfo = getCapacityInfo(reservation);
        return (
          <div>
            <div className={`text-sm font-medium ${capacityInfo.wouldExceed ? 'text-admin-danger' : 'text-admin-success'}`}>
              {capacityInfo.total} / {capacityInfo.capacity}
            </div>
            <div className="text-xs">
              {capacityInfo.wouldExceed ? (
                <span className="text-admin-danger">
                  ⚠️ +{capacityInfo.exceedsBy} over capaciteit
                </span>
              ) : (
                <span className="text-admin-success">
                  ✅ {capacityInfo.remaining} plaatsen vrij
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'totalPrice',
      label: 'Waarde',
      sortable: true,
      width: '100px',
      align: 'right' as const,
      render: (reservation: Reservation) => (
        <div className="text-right">
          <div className="font-semibold text-admin-success">
            €{reservation.totalPrice?.toFixed(2) || '0.00'}
          </div>
        </div>
      )
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
          onClick={() => handleReject(reservation)}
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
    </AdminLayout>
  );
};

export default AdminApprovalsView;
