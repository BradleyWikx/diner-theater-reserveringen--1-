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
            <div className="calendar-header">
                <button 
                    onClick={handlePrevMonth} 
                    aria-label={i18n.prevMonth}
                    className={`calendar-nav-btn ${isTouchDevice ? 'touch-optimized' : ''}`}
                >
                    <Icon id="chevron-left" />
                </button>
                <h2>{month.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}</h2>
                <button 
                    onClick={handleNextMonth} 
                    aria-label={i18n.nextMonth}
                    className={`calendar-nav-btn ${isTouchDevice ? 'touch-optimized' : ''}`}
                >
                    <Icon id="chevron-right" />
                </button>
            </div>
            <div className={`calendar-grid ${isMobile ? 'mobile-grid' : ''} ${isSmallMobile ? 'small-mobile-grid' : ''}`}>
                {i18n.dayNames.map(day => <div key={day} className="day-name">{day}</div>)}
                {paddingDays.map((_, index) => <div key={`pad-${index}`} className="calendar-day other-month"></div>)}
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

                    let dayClassName = `calendar-day ${day.getMonth() !== monthIndex ? 'other-month' : ''} ${event ? 'has-event' : ''} ${event?.isClosed ? 'is-closed' : ''} ${isFull ? 'full-event' : ''} ${dateStr === selectedDate ? 'selected' : ''} ${isMultiSelected ? 'multi-selected' : ''} ${isClickable ? 'clickable' : ''} ${capacityClass} ${typeClass} ${colorClass}`;
                    
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

                    // Determine indicator type and color
                    const getShowIndicator = () => {
                        // Geen puntje meer nodig - kleuren worden nu via CSS classes getoond
                        return null;
                    };

                    let dayClassName = `calendar-day ${day.getMonth() !== monthIndex ? 'other-month' : ''} ${event ? 'has-event' : ''} ${event?.isClosed ? 'is-closed' : ''} ${isFull ? 'full-event' : ''} ${dateStr === selectedDate ? 'selected' : ''} ${isMultiSelected ? 'multi-selected' : ''} ${isClickable ? 'clickable' : ''} ${capacityClass} ${typeClass} ${colorClass} ${isTouchDevice ? 'touch-enabled' : ''} ${isMobile ? 'mobile-day' : ''}`;

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
                            <span className="day-number">{day.getDate()}</span>
                            {getShowIndicator()}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

Calendar.displayName = 'Calendar';
