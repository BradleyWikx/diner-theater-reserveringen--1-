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
      setMultiSelectedDates([selectedDate]);
      setShowAddShowModal(true);
    } else {
      alert('Selecteer eerst een datum om een show toe te voegen');
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

  const formatSelectedDate = (dateStr: string | null) => {
    if (!dateStr) return 'Geen datum geselecteerd';
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('nl-NL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <div className="calendar-tab-content">
            <div className="calendar-main-section">
              {/* Multi-select Info */}
              {isMultiSelectMode && (
                <div className="multi-select-info">
                  <div className="multi-select-header">
                    <h4>📅 Multi-selectie modus</h4>
                    <p>Klik op datums om meerdere te selecteren. Geselecteerd: {multiSelectedDates.length} datum(s)</p>
                  </div>
                  {multiSelectedDates.length > 0 && (
                    <div className="selected-dates">
                      {multiSelectedDates.map(date => (
                        <span key={date} className="selected-date-chip">
                          {formatSelectedDate(date)}
                          <button onClick={() => handleMultiDateToggle(date)}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Calendar Controls */}
              <div className="calendar-header-controls">
                <div className="view-toggle-group">
                  {['month', 'week', 'day'].map((mode) => (
                    <button
                      key={mode}
                      className={`view-toggle-btn ${viewMode === mode ? 'active' : ''}`}
                      onClick={() => setViewMode(mode as any)}
                    >
                      {mode === 'month' ? '📅 Maand' : mode === 'week' ? '📋 Week' : '📄 Dag'}
                    </button>
                  ))}
                </div>
                
                <div className="filter-controls">
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="admin-select"
                  >
                    <option value="all">🎭 Alle Types</option>
                    {config.showTypes.map(type => (
                      <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Calendar and Details Grid */}
              <div className="calendar-content-grid">
                {/* Main Calendar */}
                <div className="calendar-card">
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

                {/* Date Details Panel */}
                <div className="date-details-card">
                  <div className="date-details-header">
                    <h3>{formatSelectedDate(selectedDate)}</h3>
                    <div className="date-actions">
                      <button
                        className="add-show-btn"
                        onClick={handleAddShow}
                      >
                        ➕ Show Toevoegen
                      </button>
                    </div>
                  </div>

                  <div className="date-details-content">
                    {selectedShow ? (
                      <div className="show-details">
                        <div className="show-badge">
                          🎭 {selectedShow.name}
                        </div>
                        
                        <div className="show-info-grid">
                          <div className="info-item">
                            <span className="label">Tijd:</span>
                            <span className="value">{selectedShow.time}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">Type:</span>
                            <span className="value">{selectedShow.type}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">Capaciteit:</span>
                            <span className="value">{selectedShow.capacity} personen</span>
                          </div>
                          <div className="info-item">
                            <span className="label">Geboekt:</span>
                            <span className="value">{guestCountMap.get(selectedShow.id) || 0} gasten</span>
                          </div>
                        </div>

                        {dayReservations.length > 0 && (
                          <div className="reservations-section">
                            <h4>Reserveringen ({dayReservations.length})</h4>
                            <div className="reservations-list">
                              {dayReservations.slice(0, 5).map(res => (
                                <div key={res.id} className="reservation-item">
                                  <span className="guest-name">{res.name}</span>
                                  <span className="guest-count">{res.guests} gasten</span>
                                </div>
                              ))}
                              {dayReservations.length > 5 && (
                                <div className="more-reservations">
                                  +{dayReservations.length - 5} meer...
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {dayWaitingList.length > 0 && (
                          <div className="waitlist-section">
                            <h4>Wachtlijst ({dayWaitingList.length})</h4>
                            <div className="waitlist-badge">
                              {dayWaitingList.length} wachtende gasten
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-date">
                        <div className="empty-icon">🎭</div>
                        <h4>Geen voorstelling</h4>
                        <p>Voeg een show toe om reserveringen te kunnen ontvangen</p>
                        <button className="add-show-primary-btn" onClick={handleAddShow}>
                          ➕ Show Toevoegen
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="schedule-view">
            <h3>📋 Schema Overzicht</h3>
            <p>Weekoverzicht en planning details komen hier...</p>
          </div>
        );

      case 'analytics':
        return (
          <div className="analytics-view">
            <h3>📊 Kalender Analytics</h3>
            <p>Bezettingsgraad en trends analyse komt hier...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="enhanced-calendar-view">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>🗓️ Kalender & Planning</h1>
          <p>Beheer shows, bekijk reserveringen en plan uw theater programma</p>
        </div>
        <div className="page-actions">
          <button className="primary-btn" onClick={handleAddShow}>
            ➕ Show Toevoegen
          </button>
          <button 
            className={`secondary-btn ${isMultiSelectMode ? 'active' : ''}`} 
            onClick={handleBulkActions}
          >
            {isMultiSelectMode ? `🗑️ Bulk Acties (${multiSelectedDates.length})` : '🗑️ Bulk Acties'}
          </button>
          {isMultiSelectMode && (
            <button className="btn-outline" onClick={exitMultiSelectMode}>
              ❌ Annuleren
            </button>
          )}
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="stats-overview">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{monthStats.totalShows}</div>
            <div className="stat-label">Shows deze maand</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{monthStats.totalBookings}</div>
            <div className="stat-label">Totale boekingen</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{monthStats.occupancyRate}%</div>
            <div className="stat-label">Bezettingsgraad</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">€{monthStats.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Maand omzet</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {[
          { id: 'calendar', label: '📅 Kalender', description: 'Maand- en dagweergave' },
          { id: 'schedule', label: '📋 Schema', description: 'Week planning' },
          { id: 'analytics', label: '📊 Analytics', description: 'Bezetting & trends' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <span className="tab-label">{tab.label}</span>
            <span className="tab-description">{tab.description}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>

      {/* Modals */}
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