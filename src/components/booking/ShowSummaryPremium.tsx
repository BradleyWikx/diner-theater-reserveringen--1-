// src/components/booking/ShowSummaryPremium.tsx
import React from 'react';
import type { ShowEvent, AppConfig } from '../../types/types';

interface ShowSummaryPremiumProps {
  show: ShowEvent;
  onStartBooking: () => void;
  isUnavailable: boolean;
  config: AppConfig;
}

export const ShowSummaryPremium: React.FC<ShowSummaryPremiumProps> = ({ show, onStartBooking, isUnavailable, config }) => {
  const showConfig = config.showNames.find(s => s.name === show.name);
  const showDate = new Date(show.date + 'T00:00:00').toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="show-summary-premium">
      <div className="summary-header" style={{ backgroundImage: `url(${showConfig?.imageUrl || ''})` }}>
        <div className="summary-overlay"></div>
        <div className="summary-content">
          <h2 className="summary-title">{show.name}</h2>
          <p className="summary-date">{showDate}</p>
        </div>
      </div>
      <div className="summary-body">
        <p className="summary-description">
          {showConfig?.description || 'Bereid je voor op een onvergetelijke avond vol spektakel, humor en culinaire verrassingen.'}
        </p>
        <button onClick={onStartBooking} className={isUnavailable ? "btn btn-secondary" : "btn btn-primary"}>
          {isUnavailable ? 'Plaats op Wachtlijst' : 'Reserveer Nu'}
        </button>
      </div>
    </div>
  );
};
