// src/components/printable/PrintableDayList.tsx
import React from 'react';
import type { Reservation, ShowEvent } from '../../types/types';

interface PrintableDayListProps {
  reservations: Reservation[];
  show: ShowEvent;
}

export const PrintableDayList: React.FC<PrintableDayListProps> = ({ reservations, show }) => {
  const totalGuests = reservations.reduce((acc, res) => acc + res.guests, 0);
  const totalRevenue = reservations.reduce((acc, res) => acc + (res.totalPrice || 0), 0);

  return (
    <div id="printable-area">
      <div className="print-header">
        <h1 className="print-title">Daglijst: {show.name}</h1>
        <p className="print-subtitle">{new Date(show.date).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="print-summary">
        <p><strong>Totaal Reserveringen:</strong> {reservations.length}</p>
        <p><strong>Totaal Gasten:</strong> {totalGuests}</p>
        <p><strong>Verwachte Omzet:</strong> €{totalRevenue.toLocaleString('nl-NL')}</p>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th>Naam</th>
            <th>Aantal</th>
            <th>Pakket</th>
            <th>Allergieën/Notities</th>
            <th>Totaalprijs</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(res => (
            <tr key={res.id}>
              <td>{res.contactName}</td>
              <td>{res.guests}</td>
              <td>{res.isPremium ? 'Premium' : 'Standaard'}</td>
              <td>{res.allergies || '-'}</td>
              <td>€{res.totalPrice?.toLocaleString('nl-NL')}</td>
              <td>{res.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
