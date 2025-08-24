import React, { useState, useMemo } from 'react';
import type { ShowEvent, Reservation, WaitingListEntry, AppConfig } from '../../types/types';
import { i18n } from '../../config/config';
import { Icon } from '../UI/Icon';
import { getShowTimes } from '../../utils/utilities';

interface BookingViewProps {
    showEvents: ShowEvent[];
    reservations: Reservation[];
    onAddReservation: (res: Omit<Reservation, 'id'>) => void;
    config: AppConfig;
    guestCountMap: Map<string, number>;
    onAddWaitingList: (entry: Omit<WaitingListEntry, 'id'>) => void;
    // Pass these components as props temporarily
    Calendar: React.FC<any>;
    CalendarLegend: React.FC<any>;
    CalendarPopover: React.FC<any>;
    ShowSummary: React.FC<any>;
    ReservationWizard: React.FC<any>;
    WaitingListForm: React.FC<any>;
}

export const BookingView: React.FC<BookingViewProps> = ({ 
    showEvents, 
    reservations, 
    onAddReservation, 
    config, 
    guestCountMap, 
    onAddWaitingList,
    Calendar,
    CalendarLegend,
    CalendarPopover,
    ShowSummary,
    ReservationWizard,
    WaitingListForm
}) => {
    const [month, setMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [bookingMode, setBookingMode] = useState(false);
    const [popoverData, setPopoverData] = useState<{ event: ShowEvent, guests: number, element: HTMLDivElement } | null>(null);
    
    const activeShowEvents = useMemo(() => {
        const now = new Date();
        const archivedShowNames = new Set(config.showNames.filter(s => s.archived).map(s => s.name));
        const archivedShowTypes = new Set(config.showTypes.filter(t => t.archived).map(t => t.name));
        
        return showEvents.filter(e => {
            // Filter gearchiveerde shows
            if (archivedShowNames.has(e.name) || archivedShowTypes.has(e.type)) {
                return false;
            }
            
            // Voor booking view: verberg verstreken shows
            const showDateTime = new Date(e.date + 'T19:30:00'); // Standaard showtijd 19:30
            const showTimes = getShowTimes(new Date(e.date + 'T12:00:00'), e.type);
            
            // Gebruik echte showtijd als beschikbaar
            if (showTimes.start) {
                const [hours, minutes] = showTimes.start.split(':');
                showDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            }
            
            // Show is verlopen als huidige tijd voorbij showtijd is
            const isExpired = now > showDateTime;
            
            // Verberg verstreken shows van booking kalender
            return !isExpired;
        });
    }, [showEvents, config]);
    
    const monthEvents = useMemo(() => {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        return activeShowEvents.filter(event => {
            const eventDate = new Date(event.date + 'T12:00:00');
            return eventDate.getFullYear() === year && eventDate.getMonth() === monthIndex;
        });
    }, [activeShowEvents, month]);

    const handleDateClick = (date: string) => {
        const show = activeShowEvents.find(e => e.date === date);
        if (show) {
            setSelectedDate(date);
            setBookingMode(false);
        } else {
            // If user clicks a day with no show, deselect.
            setSelectedDate(null);
            setBookingMode(false);
        }
    };
    
    const handleStartBooking = () => {
        setBookingMode(true);
    };

    const handleCloseWizard = () => {
        setSelectedDate(null);
        setBookingMode(false);
    };

    const selectedShow = useMemo(() => activeShowEvents.find(e => e.date === selectedDate), [activeShowEvents, selectedDate]);
    const guestsForSelectedDate = guestCountMap.get(selectedDate || '') || 0;
    const remainingCapacity = selectedShow ? selectedShow.capacity - guestsForSelectedDate : 0;
    
    // NIEUWE LOGICA: Shows zijn "vol" bij 240+ gasten, ongeacht capaciteit
    const isFull = selectedShow ? guestsForSelectedDate >= 240 : false;
    const isUnavailable = !!selectedShow?.isClosed || isFull; // Gesloten shows OF shows met 240+ gasten gaan naar wachtlijst

    const renderBookingPanelContent = () => {
        if (!selectedDate || !selectedShow) {
            return (
                <div className="placeholder-card">
                    <Icon id="calendar" className="placeholder-icon" />
                    <p>{i18n.selectDatePromptBooking}</p>
                </div>
            );
        }

        if (bookingMode) {
             const wrapperClass = isUnavailable ? 'waiting-list-container-wrapper' : 'wizard-container-wrapper';
            return (
                <div className={wrapperClass}>
                    {isUnavailable ? (
                        <WaitingListForm 
                            show={selectedShow} 
                            date={selectedDate} 
                            onAddToWaitingList={onAddWaitingList}
                            onClose={handleCloseWizard} 
                        />
                    ) : (
                        <ReservationWizard 
                            show={selectedShow} 
                            date={selectedDate} 
                            onAddReservation={onAddReservation} 
                            config={config} 
                            remainingCapacity={remainingCapacity}
                            onClose={handleCloseWizard}
                        />
                    )}
                </div>
            );
        }

        return (
            <ShowSummary 
                show={selectedShow}
                onStartBooking={handleStartBooking}
                isUnavailable={isUnavailable}
                config={config}
                remainingCapacity={remainingCapacity}
            />
        );
    };

    return (
        <div className={`booking-view ${bookingMode ? 'booking-mode-active' : ''}`}>
            <div className="calendar-wrapper">
                <p className="instructions">{i18n.instructions}</p>
                 <Calendar
                    month={month}
                    onMonthChange={setMonth}
                    onDateClick={handleDateClick}
                    events={activeShowEvents}
                    guestCountMap={guestCountMap}
                    selectedDate={selectedDate}
                    view="book"
                    onDayHover={setPopoverData}
                    config={config}
                />
                <CalendarLegend events={monthEvents} config={config} />
            </div>
            <div className="booking-panel-wrapper">
                <div className="booking-panel">
                    {renderBookingPanelContent()}
                </div>
            </div>
            
            <CalendarPopover data={popoverData} view="book" config={config} />
        </div>
    );
};
