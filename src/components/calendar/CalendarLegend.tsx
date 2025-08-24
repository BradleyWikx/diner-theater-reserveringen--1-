import React from 'react';
import type { ShowEvent, AppConfig } from '../../types/types';
import { getShowLegend } from '../../utils/utilities';

interface CalendarLegendProps {
    events: ShowEvent[];
    config: AppConfig;
}

export const CalendarLegend: React.FC<CalendarLegendProps> = ({ events, config }) => {
    const legendItems = getShowLegend(config);
    
    return (
        <div className="calendar-legend">
            <h4>🎭 Show Kleuren Legenda</h4>
            <div className="legend-grid">
                {legendItems.map(item => (
                    <div key={item.class} className="legend-item">
                        <div 
                            className={`legend-color-box ${item.class}`}
                            style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="legend-label">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
