import React, { useMemo } from 'react';
import { Icon } from '../UI/Icon';
import type { ShowEvent, View, AppConfig, Reservation } from '../../types/types';
import { getDaysInMonth, formatDate, slugify, getShowColorClass, calculateAvailableCapacity } from '../../utils/utilities';
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
    reservations?: Reservation[]; // Add reservations for better capacity calculation
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
    config,
    reservations = []
}) => {
    const { isMobile } = useMobile();
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    const days = getDaysInMonth(year, monthIndex);
    const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
    const europeanFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const paddingDays = Array(europeanFirstDay).fill(null);

    const eventMap = useMemo(() => new Map(events.map(event => [event.date, event])), [events]);

    const handlePrevMonth = () => onMonthChange(new Date(year, monthIndex - 1, 1));
    const handleNextMonth = () => onMonthChange(new Date(year, monthIndex + 1, 1));
    
    const getMarkerText = (event: ShowEvent, availableCapacity: number, totalBooked: number) => {
        if (event.isClosed) return i18n.waitingList;
        if (availableCapacity <= 0) return i18n.fullyBooked;
        return event.name;
    };

    return (
        <div className={`card ${isMobile ? 'mobile-layout' : ''}`}>
            <div className="card-header">
                <div className="row" style={{alignItems: 'center'}}>
                    <div className="col">
                        <button onClick={handlePrevMonth} aria-label={i18n.prevMonth} className="btn btn-secondary">
                            <Icon id="chevron-left" />
                            {!isMobile && <span className="ml-2">Vorige</span>}
                        </button>
                    </div>
                    <div className="col" style={{textAlign: 'center'}}>
                        <h2 className="card-title" style={{marginBottom: 0}}>{month.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}</h2>
                    </div>
                    <div className="col" style={{textAlign: 'right'}}>
                        <button onClick={handleNextMonth} aria-label={i18n.nextMonth} className="btn btn-secondary">
                            {!isMobile && <span className="mr-2">Volgende</span>}
                            <Icon id="chevron-right" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body" style={{padding: 0}}>
                <div className="calendar-grid">
                    {i18n.dayNames.map(day => (
                        <div key={day} className="calendar-day-header">{day}</div>
                    ))}
                    {paddingDays.map((_, index) => (
                        <div key={`padding-${index}`} className="calendar-day empty"></div>
                    ))}
                    {days.map(day => {
                        const dateStr = formatDate(day);
                        const event = eventMap.get(dateStr);
                        const totalBooked = guestCountMap.get(dateStr) || 0;
                        const availableCapacity = event ? calculateAvailableCapacity(event, reservations) : 0;
                        const isSelected = selectedDate === dateStr || (isMultiSelectMode && multiSelectedDates?.includes(dateStr));
                        const isToday = formatDate(new Date()) === dateStr;

                        const dayClasses = [
                            'calendar-day',
                            event ? 'has-event' : '',
                            isSelected ? 'selected' : '',
                            isToday ? 'today' : '',
                            event ? getShowColorClass(event.type, config, totalBooked) : ''
                        ].filter(Boolean).join(' ');

                        return (
                            <div 
                                key={dateStr} 
                                className={dayClasses}
                                onClick={() => onDateClick(dateStr)}
                                onMouseEnter={(e) => onDayHover && event ? onDayHover({ event, guests: totalBooked, element: e.currentTarget as HTMLDivElement }) : null}
                                onMouseLeave={() => onDayHover && onDayHover(null)}
                            >
                                <div className="day-number">{day.getDate()}</div>
                                {event && (
                                    <div className="event-marker">
                                        {getMarkerText(event, availableCapacity, totalBooked)}
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
