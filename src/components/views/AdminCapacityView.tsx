import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../layout/AdminLayout';
import { AdminCard } from '../layout/AdminLayout';
import { AdminButton } from '../layout/AdminLayout';
import { AdminBadge } from '../layout/AdminLayout';
import { AdminGrid } from '../layout/AdminLayout';
import { AdminDataTable } from '../layout/AdminLayout';
import { ShowEvent } from '../../types/types';

interface AdminCapacityViewProps {
  showEvents: ShowEvent[];
  guestCountMap: Map<string, number>;
  onUpdateShowCapacity: (showId: string, newCapacity: number) => void;
  onAddExternalBooking?: (showId: string, guests: number) => void;
}

export const AdminCapacityView: React.FC<AdminCapacityViewProps> = ({
  showEvents,
  guestCountMap,
  onUpdateShowCapacity,
  onAddExternalBooking
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bulk-input'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkCapacityMode, setBulkCapacityMode] = useState(false);
  const [bulkCapacityValue, setBulkCapacityValue] = useState(50);
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [externalBookingGuests, setExternalBookingGuests] = useState(1);
  const [bulkGuestCounts, setBulkGuestCounts] = useState<Map<string, number>>(new Map());

  // Get period shows
  const periodShows = useMemo(() => {
    const startOfPeriod = selectedPeriod === 'week' 
      ? new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay())
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const endOfPeriod = selectedPeriod === 'week'
      ? new Date(startOfPeriod.getTime() + 6 * 24 * 60 * 60 * 1000)
      : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    return showEvents.filter(show => {
      const showDate = new Date(show.date);
      return showDate >= startOfPeriod && showDate <= endOfPeriod;
    }).filter(show => 
      !searchTerm || 
      show.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [showEvents, selectedPeriod, currentDate, searchTerm]);

  // Get all shows chronological
  const allShowsChronological = useMemo(() => {
    return [...showEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [showEvents]);

  // Statistics
  const stats = useMemo(() => {
    const totalCapacity = periodShows.reduce((sum, show) => sum + (show.capacity || 50), 0);
    const totalBooked = periodShows.reduce((sum, show) => sum + (guestCountMap.get(show.date) || 0), 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;
    const overbooked = periodShows.filter(show => 
      (guestCountMap.get(show.date) || 0) > (show.capacity || 50)
    ).length;

    return {
      totalShows: periodShows.length,
      totalCapacity,
      totalBooked,
      occupancyRate,
      overbooked
    };
  }, [periodShows, guestCountMap]);

  // Navigation helpers
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (selectedPeriod === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const formatPeriodTitle = () => {
    if (selectedPeriod === 'week') {
      const startOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
      return `${startOfWeek.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}`;
    } else {
      return currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
    }
  };

  // Event handlers
  const handleCapacityUpdate = (showId: string, newCapacity: number) => {
    const show = showEvents.find(s => s.id === showId);
    if (!show) return;
    
    const currentBooked = guestCountMap.get(show.date) || 0;
    
    if (newCapacity < currentBooked) {
      if (confirm(`Huidige bezetting (${currentBooked}) is hoger dan nieuwe capaciteit (${newCapacity}). Wilt u toch doorgaan?`)) {
        onUpdateShowCapacity(showId, newCapacity);
      }
    } else {
      onUpdateShowCapacity(showId, newCapacity);
    }
  };

  const handleBulkCapacityUpdate = () => {
    if (confirm(`Capaciteit instellen op ${bulkCapacityValue} voor ${periodShows.length} shows?`)) {
      periodShows.forEach(show => {
        onUpdateShowCapacity(show.id, bulkCapacityValue);
      });
      setBulkCapacityMode(false);
    }
  };

  const handleAddExternalBooking = (showId: string) => {
    if (onAddExternalBooking && externalBookingGuests > 0) {
      onAddExternalBooking(showId, externalBookingGuests);
      setExternalBookingGuests(1);
      setSelectedShow(null);
    }
  };

  const resetBulkCounts = () => {
    if (confirm('Alle aantallen resetten naar 0?')) {
      const newBulkCounts = new Map();
      allShowsChronological.forEach(show => {
        newBulkCounts.set(show.id, 0);
      });
      setBulkGuestCounts(newBulkCounts);
    }
  };

  const autoCalculateFromReservations = () => {
    if (confirm('Gastenaantallen automatisch berekenen uit bestaande reserveringen?')) {
      const newBulkCounts = new Map();
      allShowsChronological.forEach(show => {
        const currentCount = guestCountMap.get(show.date) || 0;
        newBulkCounts.set(show.id, currentCount);
      });
      setBulkGuestCounts(newBulkCounts);
    }
  };

  const getOccupancyBadge = (show: ShowEvent) => {
    const booked = guestCountMap.get(show.date) || 0;
    const capacity = show.capacity || 50;
    const percentage = Math.round((booked / capacity) * 100);

    if (percentage >= 100) return <AdminBadge variant="danger">{percentage}% Uitverkocht</AdminBadge>;
    if (percentage >= 80) return <AdminBadge variant="warning">{percentage}% Bijna vol</AdminBadge>;
    if (percentage >= 50) return <AdminBadge variant="info">{percentage}% Halvol</AdminBadge>;
    return <AdminBadge variant="success">{percentage}% Beschikbaar</AdminBadge>;
  };

  // Table configuration
  const tableColumns = [
    { key: 'date', label: 'Datum', sortable: true },
    { key: 'title', label: 'Voorstelling', sortable: true },
    { key: 'type', label: 'Type' },
    { key: 'capacity', label: 'Capaciteit' },
    { key: 'booked', label: 'Geboekt' },
    { key: 'occupancy', label: 'Bezetting' },
    { key: 'actions', label: 'Acties' }
  ];

  const tableData = periodShows.map(show => {
    const booked = guestCountMap.get(show.date) || 0;
    const capacity = show.capacity || 50;

    return {
      id: show.id,
      date: new Date(show.date).toLocaleDateString('nl-NL', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      }),
      title: show.title,
      type: show.type,
      capacity: (
        <input
          type="number"
          min="1"
          max="250"
          value={capacity}
          onChange={(e) => handleCapacityUpdate(show.id, Number(e.target.value))}
          className="w-20 px-xs py-xs border border-admin-border rounded text-center focus:ring-2 focus:ring-admin-primary focus:border-transparent"
        />
      ),
      booked: `${booked} gasten`,
      occupancy: getOccupancyBadge(show),
      actions: (
        <div className="flex gap-xs">
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => setSelectedShow(show.id)}
            title="Externe boeking toevoegen"
          >
            + Extern
          </AdminButton>
        </div>
      )
    };
  });

  return (
    <AdminLayout
      title="⚖️ Capaciteitsbeheer"
      subtitle="Beheer capaciteit en bezetting voor alle voorstellingen"
      actions={
        <AdminButton
          variant="primary"
          onClick={() => window.location.reload()}
        >
          🔄 Vernieuwen
        </AdminButton>
      }
    >
      {/* Statistics Dashboard */}
      <AdminGrid columns={5} gap="md" className="mb-xl">
        <AdminCard variant="ghost" className="text-center">
          <div className="text-3xl font-bold text-admin-primary mb-xs">{stats.totalShows}</div>
          <div className="text-sm text-admin-text-secondary">Shows {selectedPeriod === 'week' ? 'Deze Week' : 'Deze Maand'}</div>
        </AdminCard>
        <AdminCard variant="ghost" className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-xs">{stats.totalCapacity}</div>
          <div className="text-sm text-admin-text-secondary">Totale Capaciteit</div>
        </AdminCard>
        <AdminCard variant="ghost" className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-xs">{stats.totalBooked}</div>
          <div className="text-sm text-admin-text-secondary">Totaal Geboekt</div>
        </AdminCard>
        <AdminCard variant="ghost" className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-xs">{stats.occupancyRate}%</div>
          <div className="text-sm text-admin-text-secondary">Bezettingsgraad</div>
        </AdminCard>
        <AdminCard variant="ghost" className="text-center">
          <div className="text-3xl font-bold text-red-600 mb-xs">{stats.overbooked}</div>
          <div className="text-sm text-admin-text-secondary">Overboekt</div>
        </AdminCard>
      </AdminGrid>

      {/* Tab Navigation */}
      <AdminCard className="mb-lg">
        <div className="flex gap-md border-b border-admin-border">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-md py-sm border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-admin-primary text-admin-primary'
                : 'border-transparent text-admin-text-secondary hover:text-admin-text-primary'
            }`}
          >
            📊 Overzicht & Beheer
          </button>
          <button
            onClick={() => setActiveTab('bulk-input')}
            className={`px-md py-sm border-b-2 font-medium transition-colors ${
              activeTab === 'bulk-input'
                ? 'border-admin-primary text-admin-primary'
                : 'border-transparent text-admin-text-secondary hover:text-admin-text-primary'
            }`}
          >
            ⚡ Bulk Invoer Gasten
          </button>
        </div>
      </AdminCard>

      {activeTab === 'overview' ? (
        <>
          {/* Controls */}
          <AdminCard className="mb-lg">
            <AdminGrid columns={2} gap="lg">
              <div>
                <h4 className="font-medium text-admin-text-primary mb-md">Periode Navigatie</h4>
                <div className="flex items-center gap-md">
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() => navigatePeriod('prev')}
                  >
                    ←
                  </AdminButton>
                  <div className="flex-1 text-center">
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month')}
                      className="mb-xs w-full px-sm py-xs border border-admin-border rounded-md"
                    >
                      <option value="week">Deze Week</option>
                      <option value="month">Deze Maand</option>
                    </select>
                    <h3 className="font-semibold">{formatPeriodTitle()}</h3>
                  </div>
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() => navigatePeriod('next')}
                  >
                    →
                  </AdminButton>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-admin-text-primary mb-md">Hulpmiddelen</h4>
                <div className="space-y-sm">
                  <input
                    type="text"
                    placeholder="Zoek shows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                  />
                  <AdminButton
                    variant={bulkCapacityMode ? 'warning' : 'secondary'}
                    size="sm"
                    onClick={() => setBulkCapacityMode(!bulkCapacityMode)}
                    className="w-full"
                  >
                    🔧 Bulk Capaciteitsbeheer
                  </AdminButton>
                </div>
              </div>
            </AdminGrid>
          </AdminCard>

          {/* Bulk Capacity Controls */}
          {bulkCapacityMode && (
            <AdminCard title="Bulk Capaciteitsbeheer" className="mb-lg">
              <div className="flex items-center gap-md">
                <input
                  type="number"
                  value={bulkCapacityValue}
                  onChange={(e) => setBulkCapacityValue(Number(e.target.value))}
                  min="1"
                  max="250"
                  className="w-24 px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                />
                <AdminButton
                  variant="primary"
                  onClick={handleBulkCapacityUpdate}
                >
                  Toepassen op {periodShows.length} shows
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  onClick={() => setBulkCapacityMode(false)}
                >
                  Annuleren
                </AdminButton>
              </div>
            </AdminCard>
          )}

          {/* Shows Table */}
          <AdminCard
            title={`Shows Overzicht (${periodShows.length})`}
            content={
              periodShows.length === 0 ? (
                <div className="text-center p-xl">
                  <div className="text-6xl mb-md">📅</div>
                  <h3 className="text-lg font-medium text-admin-text-secondary mb-sm">
                    Geen shows gevonden
                  </h3>
                  <p className="text-admin-text-tertiary">
                    {searchTerm 
                      ? 'Geen shows gevonden die voldoen aan de zoekterm.'
                      : `Geen shows gepland voor ${selectedPeriod === 'week' ? 'deze week' : 'deze maand'}.`}
                  </p>
                </div>
              ) : (
                <AdminDataTable
                  columns={tableColumns}
                  data={tableData}
                  searchable={false}
                  sortable={true}
                />
              )
            }
          />

          {/* External Booking Modal */}
          {selectedShow && (
            <AdminCard title="Externe Boeking Toevoegen" className="mt-lg">
              <div className="space-y-md">
                <p className="text-admin-text-secondary">
                  Voeg externe gasten toe voor: {showEvents.find(s => s.id === selectedShow)?.title}
                </p>
                <div>
                  <label className="block text-sm font-medium text-admin-text-primary mb-xs">
                    Aantal gasten
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={externalBookingGuests}
                    onChange={(e) => setExternalBookingGuests(Number(e.target.value))}
                    className="w-24 px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-md mt-lg">
                <AdminButton
                  variant="secondary"
                  onClick={() => setSelectedShow(null)}
                >
                  Annuleren
                </AdminButton>
                <AdminButton
                  variant="primary"
                  onClick={() => handleAddExternalBooking(selectedShow)}
                >
                  Toevoegen
                </AdminButton>
              </div>
            </AdminCard>
          )}
        </>
      ) : (
        // Bulk Input Tab
        <AdminCard title="Bulk Invoer Gasten">
          <div className="space-y-lg">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium">Gastenaantallen voor alle shows</h4>
              <div className="flex gap-md">
                <AdminButton
                  variant="secondary"
                  onClick={autoCalculateFromReservations}
                >
                  📊 Auto-bereken
                </AdminButton>
                <AdminButton
                  variant="warning"
                  onClick={resetBulkCounts}
                >
                  🔄 Reset Alles
                </AdminButton>
              </div>
            </div>
            
            <div className="grid gap-md max-h-96 overflow-y-auto">
              {allShowsChronological.map(show => (
                <div key={show.id} className="flex items-center justify-between p-md border border-admin-border rounded-md">
                  <div>
                    <div className="font-medium">{show.title}</div>
                    <div className="text-sm text-admin-text-secondary">
                      {new Date(show.date).toLocaleDateString('nl-NL', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })} • {show.type}
                    </div>
                  </div>
                  <div className="flex items-center gap-md">
                    <span className="text-sm text-admin-text-tertiary">Gasten:</span>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={bulkGuestCounts.get(show.id) || 0}
                      onChange={(e) => {
                        const newCounts = new Map(bulkGuestCounts);
                        newCounts.set(show.id, Number(e.target.value));
                        setBulkGuestCounts(newCounts);
                      }}
                      className="w-20 px-xs py-xs border border-admin-border rounded text-center focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-md pt-lg border-t border-admin-border">
              <AdminButton
                variant="secondary"
                onClick={() => setBulkGuestCounts(new Map())}
              >
                Wissen
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={() => {
                  // Implement bulk save logic here
                  alert('Bulk opslaan functionaliteit nog niet geïmplementeerd');
                }}
              >
                Alles Opslaan ({Array.from(bulkGuestCounts.values()).reduce((sum: number, count: number) => sum + count, 0)} gasten)
              </AdminButton>
            </div>
          </div>
        </AdminCard>
      )}
    </AdminLayout>
  );
};

export default AdminCapacityView;
