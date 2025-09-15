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
    const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0, transition: 'opacity 0.1s ease-in-out' });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (data) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                if (popoverRef.current) {
                    const rect = data.element.getBoundingClientRect();
                    const popoverRect = popoverRef.current.getBoundingClientRect();
                    
                    let top = rect.top - popoverRect.height - 12; // Extra space
                    let left = rect.left + (rect.width / 2) - (popoverRect.width / 2);

                    if (top < 10) { // Check against viewport top
                        top = rect.bottom + 12;
                    }
                    if (left < 10) {
                        left = 10;
                    }
                    if (left + popoverRect.width > window.innerWidth - 10) {
                        left = window.innerWidth - popoverRect.width - 10;
                    }

                    setStyle({
                        position: 'fixed',
                        top: `${top}px`,
                        left: `${left}px`,
                        opacity: 1,
                        transform: 'translateY(0)',
                        transition: 'opacity 0.1s ease-in-out, transform 0.1s ease-in-out',
                    });
                }
            }, 50); // Faster appearance
            return () => clearTimeout(timer);
        } else {
            setStyle(s => ({ ...s, opacity: 0, transform: 'translateY(5px)' }));
            const timer = setTimeout(() => setIsVisible(false), 100);
            return () => clearTimeout(timer);
        }
    }, [data]);

    if (!isVisible || !data) return null;

    const showConfig = config?.showNames.find(s => s.name === data.event.name);
    const showTypeConfig = config?.showTypes.find(type => type.name === data.event.type || type.id === data.event.type);
    const price = showTypeConfig?.priceStandard;
    const showTimes = getShowTimes(new Date(data.event.date + 'T12:00:00'), data.event.type, config);

    return (
        <div className="calendar-popover-premium" ref={popoverRef} style={style}>
            {showConfig?.imageUrl && <div className="popover-poster" style={{ backgroundImage: `url(${showConfig.imageUrl})` }}></div>}
            <div className="popover-content">
                <h3 className="popover-title-premium">{data.event.name}</h3>
                <p className="popover-details">{showTimes.start} - {showTimes.end}</p>
                {price && <p className="popover-price">Vanaf €{price}</p>}
            </div>
        </div>
    );
};
