import React from 'react';
import { Reservation } from '../../types/types';

interface TablePlanWorksheetProps {
    reservations: Reservation[];
    showDate: Date;
}

const TablePlanWorksheet: React.FC<TablePlanWorksheetProps> = ({ reservations, showDate }) => {
    const groupedBySized = reservations.reduce((acc, res) => {
        const size = res.guests;
        if (!acc[size]) {
            acc[size] = [];
        }
        acc[size].push(res);
        return acc;
    }, {} as Record<number, Reservation[]>);

    const sortedGroups = Object.entries(groupedBySized).sort(([a], [b]) => Number(b) - Number(a));

    return (
        <div className="printable-list p-4">
            <h1 className="text-2xl font-bold mb-2">Tafelplan Werkblad</h1>
            <p className="text-lg mb-6">{showDate.toLocaleDateString()}</p>

            <div className="space-y-6">
                {sortedGroups.map(([size, groupReservations]) => (
                    <div key={size}>
                        <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-1 mb-3">
                            Groepen van {size} personen
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {groupReservations.map(res => (
                                <div key={res.id} className="p-3 border border-gray-400 rounded-lg bg-gray-50">
                                    <p className="font-bold">{res.name} - {res.guests}p ({res.package})</p>
                                    {res.notes && <p className="text-sm text-red-600 italic mt-1">{res.notes}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TablePlanWorksheet;
