import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaBirthdayCake, FaAllergies, FaPrint } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import KitchenList from '../printable/KitchenList';
import CheckInList from '../printable/CheckInList';
import TablePlanWorksheet from '../printable/TablePlanWorksheet';
import { getConfirmedReservationsByDate } from '../../services/booking/reservations';
import { Reservation } from '../../types/types';

const DailyPlannerView = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [printableContent, setPrintableContent] = useState<React.ReactNode>(null);
    const componentToPrintRef = useRef<HTMLDivElement>(null);

    const { data: reservations, isLoading } = useQuery<Reservation[]>({
        queryKey: ['reservationsForDay', selectedDate],
        queryFn: () => getConfirmedReservationsByDate(selectedDate),
        enabled: !!selectedDate,
    });

    const sortedReservations = reservations ? [...reservations].sort((a, b) => b.guests - a.guests) : [];

    const handlePrint = useReactToPrint({
        content: () => componentToPrintRef.current,
    });

    const generatePrintable = (type: 'kitchen' | 'checkin' | 'table') => {
        if (!sortedReservations) return;

        let content;
        switch (type) {
            case 'kitchen':
                content = <KitchenList reservations={sortedReservations} showDate={selectedDate} />;
                break;
            case 'checkin':
                content = <CheckInList reservations={sortedReservations} showDate={selectedDate} />;
                break;
            case 'table':
                content = <TablePlanWorksheet reservations={sortedReservations} showDate={selectedDate} />;
                break;
            default:
                content = null;
        }
        
        setPrintableContent(content);

        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    const renderSpecialRequestIcon = (reservation: Reservation) => {
        const notes = reservation.remarks?.toLowerCase() || reservation.allergies?.toLowerCase() || '';
        if (notes.includes('allergie') || notes.includes('gluten')) {
            return <span className="text-red-500 text-lg ml-2" title={notes}><FaAllergies /></span>;
        }
        if (notes.includes('viering') || notes.includes('verjaardag')) {
            return <span className="text-yellow-500 text-lg ml-2" title={notes}><FaBirthdayCake /></span>;
        }
        return null;
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dagplan Generator</h1>
                    <p className="text-gray-600 mt-1">Selecteer een datum om het plan voor die dag te genereren en te printen.</p>
                </header>

                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <label htmlFor="date-selector" className="block text-sm font-medium text-gray-700 mb-2">
                                Selecteer Show Datum
                            </label>
                            <input
                                type="date"
                                id="date-selector"
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="mt-4 sm:mt-0 flex space-x-2">
                            <button onClick={() => generatePrintable('kitchen')} className="btn btn-secondary flex items-center"><FaPrint className="mr-2" /> Keuken</button>
                            <button onClick={() => generatePrintable('checkin')} className="btn btn-secondary flex items-center"><FaPrint className="mr-2" /> Check-in</button>
                            <button onClick={() => generatePrintable('table')} className="btn btn-primary flex items-center"><FaPrint className="mr-2" /> Tafelplan</button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center text-gray-500">Reserveringen laden...</div>
                ) : !reservations || reservations.length === 0 ? (
                    <div className="text-center text-gray-500 bg-white shadow-lg rounded-lg p-12">Geen bevestigde reserveringen voor deze datum.</div>
                ) : (
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-gray-800">Overzicht Reserveringen - {selectedDate.toLocaleDateString()}</h2>
                            <p className="text-gray-600">Totaal: {sortedReservations.length} reserveringen, {sortedReservations.reduce((acc, r) => acc + r.guests, 0)} gasten.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naam / Groep</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aantal Gasten</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrangement</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speciale Wensen</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedReservations.map((res) => (
                                        <tr key={res.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                                {res.contactName}
                                                {renderSpecialRequestIcon(res)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{res.guests}p</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{res.package || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">{res.remarks || res.allergies || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            
            <div style={{ display: 'none' }}>
                <div ref={componentToPrintRef}>
                    {printableContent}
                </div>
            </div>
        </div>
    );
};

export default DailyPlannerView;
