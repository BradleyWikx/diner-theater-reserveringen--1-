import React from 'react';
import { Reservation } from '../../types/types'; // Assuming a shared type definition

interface KitchenListProps {
    reservations: Reservation[];
    showDate: Date;
}

const KitchenList: React.FC<KitchenListProps> = ({ reservations, showDate }) => {
    const allergyReservations = reservations.filter(r => r.notes && (r.notes.toLowerCase().includes('allergie') || r.notes.toLowerCase().includes('gluten')));

    return (
        <div className="printable-list p-4">
            <h1 className="text-2xl font-bold mb-2">Keukenlijst</h1>
            <p className="text-lg mb-4">{showDate.toLocaleDateString()}</p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Dieetwensen & Allergieën</h2>
            {allergyReservations.length > 0 ? (
                <table className="min-w-full border-collapse border border-gray-400">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2 text-left">Groep/Naam</th>
                            <th className="border border-gray-300 p-2 text-left">Aantal</th>
                            <th className="border border-gray-300 p-2 text-left">Notities</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allergyReservations.map(res => (
                            <tr key={res.id}>
                                <td className="border border-gray-300 p-2">{res.name}</td>
                                <td className="border border-gray-300 p-2">{res.guests}p</td>
                                <td className="border border-gray-300 p-2 font-semibold">{res.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Geen speciale dieetwensen of allergieën voor deze datum.</p>
            )}

            <h2 className="text-xl font-semibold mt-8 mb-3">Overzicht Groepsgroottes</h2>
            <p className="mb-4">Totaal aantal gasten: {reservations.reduce((acc, r) => acc + r.guests, 0)}</p>
            <div className="grid grid-cols-4 gap-2">
                {reservations.map(res => (
                    <div key={res.id} className="p-2 border border-gray-300 rounded">
                        {res.name} - {res.guests}p
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KitchenList;
