import React from 'react';
import { Reservation } from '../../types/types';

interface CheckInListProps {
    reservations: Reservation[];
    showDate: Date;
}

const CheckInList: React.FC<CheckInListProps> = ({ reservations, showDate }) => {
    return (
        <div className="printable-list p-4">
            <h1 className="text-2xl font-bold mb-2">Ontvangstlijst (Check-in)</h1>
            <p className="text-lg mb-6">{showDate.toLocaleDateString()}</p>

            <table className="min-w-full border-collapse border border-gray-400">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2 text-left w-1/12">Check</th>
                        <th className="border border-gray-300 p-2 text-left">Naam / Groep</th>
                        <th className="border border-gray-300 p-2 text-left">Aantal Gasten</th>
                        <th className="border border-gray-300 p-2 text-left">Arrangement</th>
                    </tr>
                </thead>
                <tbody>
                    {reservations.map(res => (
                        <tr key={res.id}>
                            <td className="border border-gray-300 p-2 text-center">
                                <div className="w-6 h-6 border-2 border-gray-400 inline-block"></div>
                            </td>
                            <td className="border border-gray-300 p-2">{res.name}</td>
                            <td className="border border-gray-300 p-2">{res.guests}p</td>
                            <td className="border border-gray-300 p-2">{res.package}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CheckInList;
