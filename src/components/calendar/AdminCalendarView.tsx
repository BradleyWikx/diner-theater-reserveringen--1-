import React, { useState, useMemo } from 'react';
import { Calendar } from './Calendar';
import { AddShowModal } from '../modals/AddShowModal';
import { BulkDeleteModal } from '../modals/BulkDeleteModal';
import { MultiSelectActions } from '../modals/MultiSelectActions';
import { formatDate } from '../../utils/utilities';
import type { ShowEvent, Reservation, WaitingListEntry, AppConfig } from '../../types/types';

interface AdminCalendarViewProps {
  showEvents: ShowEvent[];
  reservations: Reservation[];
  waitingList: WaitingListEntry[];
  onAddShow: (event: Omit<ShowEvent, 'id'>, dates: string[]) => void;
  onAddReservation: (reservation: Omit<Reservation, 'id'>) => void;
  onDeleteReservation: (id: string) => void;
  onDeleteWaitingList: (id: string) => void;
  config: AppConfig;
  guestCountMap: Map<string, number>;
  onBulkDelete: (criteria: { type: 'name' | 'type' | 'date', value: string }, month?: Date) => void;
  onDeleteShow: (showId: string) => void;
  onToggleShowStatus: (showId: string) => void;
  onToggleCheckIn: (id: string) => void;
  onEditReservation: (reservation: Reservation) => void;
  onUpdateReservation: (reservation: Reservation) => void;
}

const AdminCalendarView: React.FC<AdminCalendarViewProps> = ({
  showEvents,
  reservations,
  waitingList,
  onAddShow,
  onAddReservation,
  onDeleteReservation,
  onDeleteWaitingList,
  config,
  guestCountMap,
  onBulkDelete,
  onDeleteShow,
  onToggleShowStatus,
  onToggleCheckIn,
  onEditReservation,
  onUpdateReservation
}) => {
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDate(new Date()));
  const [activeTab, setActiveTab] = useState<'calendar' | 'schedule' | 'analytics'>('calendar');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Modal states
  const [showAddShowModal, setShowAddShowModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  
  // Multi-select states
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [multiSelectedDates, setMultiSelectedDates] = useState<string[]>([]);

  // Calculate month statistics
  const monthStats = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    const monthShows = showEvents.filter(show => {
      const showDate = new Date(show.date);
      return showDate.getFullYear() === year && showDate.getMonth() === monthIndex;
    });
    
    const monthReservations = reservations.filter(res => {
      const resDate = new Date(res.date);
      return resDate.getFullYear() === year && resDate.getMonth() === monthIndex && res.status === 'confirmed';
    });
    
    const totalCapacity = monthShows.reduce((sum, show) => sum + show.capacity, 0);
    const totalBookings = monthReservations.reduce((sum, res) => sum + res.guests, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0;
    const totalRevenue = monthReservations.reduce((sum, res) => sum + (res.guests * (res.price || 0)), 0);
    
    return {
      totalShows: monthShows.length,
      totalBookings,
      occupancyRate,
      totalRevenue
    };
  }, [month, showEvents, reservations]);

  const selectedShow = useMemo(() => showEvents.find(e => e.date === selectedDate), [showEvents, selectedDate]);
  const dayReservations = useMemo(() => reservations.filter(r => r.date === selectedDate && r.status === 'confirmed'), [reservations, selectedDate]);
  const dayWaitingList = useMemo(() => waitingList.filter(wl => wl.date === selectedDate), [waitingList, selectedDate]);

  const handleDateClick = (date: string) => {
    if (isMultiSelectMode) {
      setMultiSelectedDates(prev => 
        prev.includes(date) 
          ? prev.filter(d => d !== date)
          : [...prev, date]
      );
    } else {
      setSelectedDate(date);
    }
  };

  const handleMultiDateToggle = (date: string) => {
    setMultiSelectedDates(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const handleAddShow = () => {
    if (isMultiSelectMode && multiSelectedDates.length > 0) {
      setShowAddShowModal(true);
    } else if (selectedDate) {
      // Als we niet in multi-select mode zijn, maar wel een datum hebben,
      // voegen we die ene datum toe en openen de modal.
      setMultiSelectedDates([selectedDate]);
      setShowAddShowModal(true);
    } else {
      // Vraag de gebruiker om eerst een datum te selecteren.
      alert('Selecteer eerst een of meerdere datums om een show toe te voegen.');
    }
  };

  const handleBulkActions = () => {
    if (multiSelectedDates.length > 0) {
      setShowBulkDeleteModal(true);
    } else {
      setIsMultiSelectMode(true);
    }
  };

  const handleAddShowSubmit = (event: Omit<ShowEvent, 'id'>, dates: string[]) => {
    onAddShow(event, dates);
    setShowAddShowModal(false);
    setMultiSelectedDates([]);
    setIsMultiSelectMode(false);
  };

  const handleBulkDelete = (criteria: { type: 'name' | 'type' | 'date', value: string }) => {
    onBulkDelete(criteria, month);
    setShowBulkDeleteModal(false);
    setMultiSelectedDates([]);
    setIsMultiSelectMode(false);
  };

  const exitMultiSelectMode = () => {
    setIsMultiSelectMode(false);
    setMultiSelectedDates([]);
  };

  const formatSelectedDate = (dateStr: string | null, options?: Intl.DateTimeFormatOptions) => {
    if (!dateStr) return 'Geen datum geselecteerd';
    const date = new Date(dateStr + 'T12:00:00');
    const defaultOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('nl-NL', options || defaultOptions);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <>
            <div className="calendar-content-grid">
              <div className="card">
                <div className="card-header calendar-header-controls">
                  <div className="view-toggle-group">
                    <button className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('month')}>Maand</button>
                    <button className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('week')}>Week</button>
                    <button className={`btn ${viewMode === 'day' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('day')}>Dag</button>
                  </div>
                  <div className="filter-controls">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="form-control">
                      <option value="all">Alle Types</option>
                      {config.showTypes.map(type => (
                        <option key={type.id} value={type.name}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="card-body">
                  <Calendar
                    month={month}
                    onMonthChange={setMonth}
                    onDateClick={handleDateClick}
                    events={showEvents.filter(e => filterType === 'all' || e.type === filterType)}
                    guestCountMap={guestCountMap}
                    selectedDate={selectedDate}
                    view="admin"
                    config={config}
                    isMultiSelectMode={isMultiSelectMode}
                    multiSelectedDates={multiSelectedDates}
                    onMultiDateToggle={handleMultiDateToggle}
                  />
                </div>
              </div>

              <div className="card date-details-card">
                <div className="card-header date-details-header">
                  <h3 className="m-0">{formatSelectedDate(selectedDate)}</h3>
                  {!isMultiSelectMode && (
                    <button className="btn btn-primary btn-sm" onClick={handleAddShow}>
                      ➕ Show
                    </button>
                  )}
                </div>
                <div className="card-body">
                  {selectedShow ? (
                    <div>
                      <div className="badge bg-primary text-white mb-3">
                        🎭 {selectedShow.name}
                      </div>
                      <div className="row">
                        <div className="col-6"><strong className="text-muted">Tijd:</strong></div>
                        <div className="col-6">{selectedShow.time}</div>
                        <div className="col-6"><strong className="text-muted">Type:</strong></div>
                        <div className="col-6">{selectedShow.type}</div>
                        <div className="col-6"><strong className="text-muted">Capaciteit:</strong></div>
                        <div className="col-6">{selectedShow.capacity}</div>
                        <div className="col-6"><strong className="text-muted">Geboekt:</strong></div>
                        <div className="col-6">{guestCountMap.get(selectedShow.id) || 0}</div>
                      </div>
                      {dayReservations.length > 0 && (
                        <div className="mt-4">
                          <h5>Reserveringen ({dayReservations.length})</h5>
                          <ul className="list-group">
                            {dayReservations.slice(0, 5).map(res => (
                              <li key={res.id} className="list-group-item d-flex justify-content-between align-items-center">
                                {res.name}
                                <span className="badge bg-secondary">{res.guests}p</span>
                              </li>
                            ))}
                          </ul>
                          {dayReservations.length > 5 && <p className="text-muted text-sm mt-2">+{dayReservations.length - 5} meer...</p>}
                        </div>
                      )}
                      {dayWaitingList.length > 0 && (
                         <div className="mt-4">
                           <h5>Wachtlijst ({dayWaitingList.length})</h5>
                           <p>{dayWaitingList.length} wachtende(n)</p>
                         </div>
                      )}
                    </div>
                  ) : (
                    <div className="empty-date">
                      <div className="empty-icon">🗓️</div>
                      <h4>Geen voorstelling</h4>
                      <p>Selecteer een datum of voeg een nieuwe show toe.</p>
                      {!isMultiSelectMode && (
                        <button className="btn btn-primary" onClick={handleAddShow}>
                          ➕ Show Toevoegen
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        );

      case 'schedule':
        return <div className="card"><div className="card-body">Schema overzicht komt hier...</div></div>;

      case 'analytics':
        return <div className="card"><div className="card-body">Analytics dashboard komt hier...</div></div>;

      default:
        return null;
    }
  };

  return (
    <div className="admin-view-container">
      {isMultiSelectMode ? (
        <div className="multi-select-action-bar">
          <div className="multi-select-info">
            <strong>{multiSelectedDates.length} datum(s) geselecteerd</strong>
            <div className="selected-dates-chips">
              {multiSelectedDates.slice(0, 5).map(date => (
                <span key={date} className="chip">
                  {formatSelectedDate(date, { day: '2-digit', month: 'short' })}
                  <button onClick={() => handleMultiDateToggle(date)} className="chip-delete">&times;</button>
                </span>
              ))}
              {multiSelectedDates.length > 5 && (
                <span className="chip">... en {multiSelectedDates.length - 5} meer</span>
              )}
            </div>
          </div>
          <div className="multi-select-actions">
            <button className="btn btn-primary" onClick={handleAddShow} disabled={multiSelectedDates.length === 0}>
              ➕ Show Toevoegen
            </button>
            <button className="btn btn-danger" onClick={() => setShowBulkDeleteModal(true)} disabled={multiSelectedDates.length === 0}>
              🗑️ Verwijderen
            </button>
            <button className="btn btn-secondary" onClick={exitMultiSelectMode}>
              Annuleren
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-page-header">
          <div className="admin-page-title">
            <h1>🗓️ Kalender & Planning</h1>
            <p>Beheer shows, bekijk reserveringen en plan uw theater programma</p>
          </div>
          <div className="admin-page-actions">
            <button className="btn btn-secondary" onClick={() => setIsMultiSelectMode(true)}>
              Selecteer Meerdere
            </button>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-item card">
          <div className="stat-value">{monthStats.totalShows}</div>
          <div className="stat-label">Shows deze maand</div>
        </div>
        <div className="stat-item card">
          <div className="stat-value">{monthStats.totalBookings}</div>
          <div className="stat-label">Totale boekingen</div>
        </div>
        <div className="stat-item card">
          <div className="stat-value">{monthStats.occupancyRate}%</div>
          <div className="stat-label">Bezettingsgraad</div>
        </div>
        <div className="stat-item card">
          <div className="stat-value">€{monthStats.totalRevenue.toLocaleString()}</div>
          <div className="stat-label">Maand omzet</div>
        </div>
      </div>

      <div className="tab-navigation">
        <button className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>📅 Kalender</button>
        <button className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>📋 Schema</button>
        <button className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>📊 Analytics</button>
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>

      {showAddShowModal && (
        <AddShowModal
          onClose={() => setShowAddShowModal(false)}
          onAdd={handleAddShowSubmit}
          config={config}
          dates={multiSelectedDates}
        />
      )}

      {showBulkDeleteModal && (
        <BulkDeleteModal
          onClose={() => setShowBulkDeleteModal(false)}
          onDelete={handleBulkDelete}
          selectedDates={multiSelectedDates}
        />
      )}
    </div>
  );
};

export default AdminCalendarView;
