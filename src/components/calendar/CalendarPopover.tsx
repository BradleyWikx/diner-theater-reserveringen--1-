import React, { useRef, useState, useEffect } from 'react';
import type { ShowEvent, View, AppConfig } from '../../types/types';
import { getShowTimes } from '../../utils/utilities';

interface CalendarPopoverProps {
    data: { event: ShowEvent; guests: number; element: HTMLElement } | null;
    view?: View;
    config?: AppConfig;
}

export const CalendarPopover: React.FC<CalendarPopoverProps> = ({ data, view, config }) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

    useEffect(() => {
        if (data && popoverRef.current) {
            const rect = data.element.getBoundingClientRect();
            const popoverRect = popoverRef.current.getBoundingClientRect();
            
            let top = rect.top - popoverRect.height - 8;
            let left = rect.left + (rect.width / 2) - (popoverRect.width / 2);

            if (top < 0) {
                top = rect.bottom + 8;
            }
            if (left < 0) {
                left = 5;
            }
            if (left + popoverRect.width > window.innerWidth) {
                left = window.innerWidth - popoverRect.width - 5;
            }

            setStyle({
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                opacity: 1,
            });
        }
    }, [data]);

    if (!data) return null;

    // Find the show type configuration to get pricing
    const showTypeConfig = config?.showTypes.find(type => type.name === data.event.type || type.id === data.event.type);
    const standardPrice = showTypeConfig?.priceStandard;
    const premiumPrice = showTypeConfig?.pricePremium;

    // Get show times from event or show type defaults
    const eventDate = new Date(data.event.date + 'T12:00:00');
    
    // Gebruik custom tijden van event als beschikbaar, anders fallback naar showType defaults of getShowTimes
    let displayStartTime = data.event.startTime;
    let displayEndTime = data.event.endTime;
    
    if (!displayStartTime || !displayEndTime) {
        // Fallback naar showType defaults
        if (showTypeConfig?.defaultStartTime && showTypeConfig?.defaultEndTime) {
            displayStartTime = showTypeConfig.defaultStartTime;
            displayEndTime = showTypeConfig.defaultEndTime;
        } else {
            // Laatste fallback naar oude getShowTimes functie
            const showTimes = getShowTimes(eventDate, data.event.type);
            displayStartTime = showTimes.start;
            displayEndTime = showTimes.end;
        }
    }
    
    // Bepaal de status van de show - NIEUWE 240+ LOGICA  
    const isFullyBooked = data.guests >= 240; // Gewijzigd van data.event.capacity naar 240
    const isClosed = data.event.isClosed;
    
    let statusMessage = '';
    let statusClass = '';
    
    if (isClosed || isFullyBooked) {
        statusMessage = '📝 Vol - Wachtlijst beschikbaar!';
        statusClass = 'status-waitlist';
    } else {
        statusMessage = '✅ Beschikbaar';
        statusClass = 'status-available';
    }

    return (
        <div className="calendar-popover calendar-popover-simplified" ref={popoverRef} style={style}>
            <div className="popover-title">{data.event.name}</div>
            <div className="popover-content">
                <div className="popover-times">
                    <span>Deuren: {displayStartTime} | Show: {displayStartTime} - {displayEndTime}</span>
                </div>
                <div className="popover-prices">
                    {standardPrice && premiumPrice && (
                        <span>€{standardPrice} - €{premiumPrice}</span>
                    )}
                </div>
            </div>
        </div>
    );
};
