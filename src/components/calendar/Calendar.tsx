import React, { useMemo } from 'react';
import { Icon } from '../UI/Icon';
import type { ShowEvent, View, AppConfig } from '../../types/types';
import { getDaysInMonth, formatDate, slugify, getShowColorClass } from '../../utils/utilities';
import { useMobile } from '../../hooks/useMobile';

// I18N - Dutch translations
const i18n = {
    waitingList: 'Wachtlijst',
    fullyBooked: 'Vol',
    prevMonth: 'Vorige maand',
    nextMonth: 'Volgende maand',
    bookShow: 'Boek show',
    dayNames: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
};

interface CalendarProps {
    month: Date;
    onMonthChange: (newMonth: Date) => void;
    onDateClick: (date: string) => void;
    events: ShowEvent[];
    guestCountMap: Map<string, number>;
    selectedDate: string | null;
    view: View;
    isMultiSelectMode?: boolean;
    multiSelectedDates?: string[];
    onMultiDateToggle?: (date: string) => void;
    onDayHover?: (data: { event: ShowEvent; guests: number; element: HTMLDivElement } | null) => void;
    config: AppConfig;
}

export const Calendar: React.FC<CalendarProps> = React.memo(({ 
    month, 
    onMonthChange, 
    onDateClick, 
    events, 
    guestCountMap, 
    selectedDate, 
    view, 
    isMultiSelectMode, 
    multiSelectedDates, 
    onMultiDateToggle, 
    onDayHover, 
    config 
}) => {
    const { isMobile, isSmallMobile, isTouchDevice, orientation } = useMobile();
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    const days = getDaysInMonth(year, monthIndex);
    // Europese kalender: maandag = 0, zondag = 6
    const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
    const europeanFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Converteer naar Europese week
    const paddingDays = Array(europeanFirstDay).fill(null);

    const eventMap = useMemo(() => new Map(events.map(event => [event.date, event])), [events]);

    const handlePrevMonth = () => onMonthChange(new Date(year, monthIndex - 1, 1));
    const handleNextMonth = () => onMonthChange(new Date(year, monthIndex + 1, 1));
    
    const getMarkerText = (event: ShowEvent, isFull: boolean) => {
        if (event.isClosed) return i18n.waitingList;
        if (isFull) return i18n.fullyBooked;
        return event.name;
    };

    return (
        <div className={`calendar-container ${isMobile ? 'mobile-layout' : ''} ${isSmallMobile ? 'small-mobile-layout' : ''} ${orientation === 'landscape' && isMobile ? 'mobile-landscape' : ''}`}>
            <div className="calendar-header-enhanced">
                <div className="calendar-nav-section">
                    <button 
                        onClick={handlePrevMonth} 
                        aria-label={i18n.prevMonth}
                        className={`calendar-nav-btn-enhanced ${isTouchDevice ? 'touch-optimized' : ''}`}
                    >
                        <Icon id="chevron-left" />
                        <span className="nav-btn-text">Vorige</span>
                    </button>
                </div>
                
                <div className="calendar-title-section">
                    <h2 className="calendar-month-title">
                        {month.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="calendar-subtitle">
                        Overzicht voorstellingen en evenementen
                    </div>
                </div>
                
                <div className="calendar-nav-section">
                    <button 
                        onClick={handleNextMonth} 
                        aria-label={i18n.nextMonth}
                        className={`calendar-nav-btn-enhanced ${isTouchDevice ? 'touch-optimized' : ''}`}
                    >
                        <span className="nav-btn-text">Volgende</span>
                        <Icon id="chevron-right" />
                    </button>
                </div>
            </div>
            
            <div className={`calendar-grid-enhanced ${isMobile ? 'mobile-grid' : ''} ${isSmallMobile ? 'small-mobile-grid' : ''}`}>
                <div className="calendar-weekdays">
                    {i18n.dayNames.map(day => (
                        <div key={day} className="calendar-weekday">
                            <span className="weekday-short">{day}</span>
                            <span className="weekday-full">{day === 'Ma' ? 'Maandag' : day === 'Di' ? 'Dinsdag' : day === 'Wo' ? 'Woensdag' : day === 'Do' ? 'Donderdag' : day === 'Vr' ? 'Vrijdag' : day === 'Za' ? 'Zaterdag' : 'Zondag'}</span>
                        </div>
                    ))}
                </div>
                
                <div className="calendar-days-grid">
                    {paddingDays.map((_, index) => <div key={`pad-${index}`} className="calendar-day-enhanced other-month"></div>)}
                    {days.map(day => {
                        const dateStr = formatDate(day);
                        const event = eventMap.get(dateStr);
                        const guests = guestCountMap.get(dateStr) || 0;
                        const capacityPercent = event ? (guests / event.capacity) * 100 : 0;
                        const isFull = event && guests >= event.capacity;
                        const isClickable = view === 'admin' || (view === 'book' && event);
                        const isMultiSelected = view === 'admin' && multiSelectedDates?.includes(dateStr);
                        const typeClass = event ? `show-type-${slugify(event.type)}` : '';
                        
                        let capacityClass = '';
                        let colorClass = '';
                        if (event) {
                            if (event.isClosed || isFull) capacityClass = 'capacity-full';
                            else if (capacityPercent > 85) capacityClass = 'capacity-high';
                            else if (capacityPercent > 50) capacityClass = 'capacity-medium';
                            else capacityClass = 'capacity-low';
                            
                            // Nieuwe kleurklasse gebaseerd op show eigenschappen
                            colorClass = getShowColorClass(event, config, guests);
                        }

                        let dayClassName = `calendar-day-enhanced ${day.getMonth() !== monthIndex ? 'other-month' : ''} ${event ? 'has-event' : ''} ${event?.isClosed ? 'is-closed' : ''} ${isFull ? 'full-event' : ''} ${dateStr === selectedDate ? 'selected' : ''} ${isMultiSelected ? 'multi-selected' : ''} ${isClickable ? 'clickable' : ''} ${capacityClass} ${typeClass} ${colorClass} ${isTouchDevice ? 'touch-enabled' : ''} ${isMobile ? 'mobile-day' : ''} ${dateStr === formatDate(new Date()) ? 'is-today' : ''}`;
                        
                        const handleDayClick = () => {
                            if (view === 'admin' && isMultiSelectMode && onMultiDateToggle) {
                                onMultiDateToggle(dateStr);
                            } else if (isClickable) {
                                onDateClick(dateStr);
                            }
                        };

                        const handleKeyDown = (e: React.KeyboardEvent) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleDayClick();
                            }
                        };

                        const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
                            // Don't show hover on touch devices
                            if (event && onDayHover && !isTouchDevice) {
                                onDayHover({ event, guests, element: e.currentTarget });
                            }
                        };

                        const handleMouseLeave = () => {
                            if (onDayHover && !isTouchDevice) {
                                onDayHover(null);
                            }
                        };

                        // Touch-specific handlers for mobile
                        const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
                            if (event && onDayHover && isTouchDevice) {
                                onDayHover({ event, guests, element: e.currentTarget });
                            }
                        };

                        const handleTouchEnd = () => {
                            if (onDayHover && isTouchDevice) {
                                setTimeout(() => onDayHover(null), 1500); // Show info for 1.5 seconds on touch
                            }
                        };

                        return (
                            <div 
                                key={dateStr}
                                className={dayClassName}
                                onClick={handleDayClick}
                                onKeyDown={handleKeyDown}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onTouchStart={isTouchDevice ? handleTouchStart : undefined}
                                onTouchEnd={isTouchDevice ? handleTouchEnd : undefined}
                                tabIndex={isClickable ? 0 : -1}
                                role="button"
                                aria-label={event ? `${i18n.bookShow} ${event.name} op ${dateStr}` : `Datum ${dateStr}`}
                                aria-pressed={dateStr === selectedDate}
                            >
                                <div className="calendar-day-header-enhanced">
                                    <span className="day-number-enhanced">{day.getDate()}</span>
                                    {event && (
                                        <div className="event-status-indicator">
                                            {isFull ? '🔴' : event.isClosed ? '⏸️' : '🎭'}
                                        </div>
                                    )}
                                </div>
                                
                                {event && (
                                    <div className="calendar-day-event-preview">
                                        <div className="event-name-preview">
                                            {getMarkerText(event, isFull)}
                                        </div>
                                        <div className="event-capacity-preview">
                                            {guests}/{event.capacity}
                                        </div>
                                        <div className="event-progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

Calendar.displayName = 'Calendar';
