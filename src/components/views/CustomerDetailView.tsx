import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomerById, getCustomerReservationHistory, updateCustomerNotes } from '../../services/customerService';
import { Customer, Reservation } from '../../types/types';

const CustomerDetailView = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const queryClient = useQueryClient();
    const [notes, setNotes] = useState('');

    const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer | null>({
        queryKey: ['customer', customerId],
        queryFn: () => getCustomerById(customerId!),
        enabled: !!customerId,
    });

    useEffect(() => {
        if (customer?.notes) {
            setNotes(customer.notes);
        }
    }, [customer]);

    const { data: reservations, isLoading: isLoadingReservations } = useQuery<Reservation[]>({
        queryKey: ['customerReservations', customerId],
        queryFn: () => getCustomerReservationHistory(customerId!),
        enabled: !!customerId,
    });

    const updateNotesMutation = useMutation({
        mutationFn: (newNotes: string) => updateCustomerNotes(customerId!, newNotes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
            alert('Notities opgeslagen!');
        },
        onError: () => {
            alert('Fout bij opslaan van notities.');
        }
    });

    const handleSaveNotes = () => {
        updateNotesMutation.mutate(notes);
    };

    if (isLoadingCustomer) {
        return <div className="p-8">Klantgegevens laden...</div>;
    }

    if (!customer) {
        return <div className="p-8 text-red-500">Klant niet gevonden.</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                    <p className="text-gray-600 mt-1">{customer.email}</p>
                    {/* Tags can be derived or stored */}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Notes */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Notities</h2>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={8}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Voeg permanente notities over deze klant toe..."
                        />
                        <button
                            onClick={handleSaveNotes}
                            disabled={updateNotesMutation.isPending}
                            className="mt-4 w-full btn btn-primary"
                        >
                            {updateNotesMutation.isPending ? 'Opslaan...' : 'Notities Opslaan'}
                        </button>
                    </div>

                    {/* Right Column: Reservation History */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Reserveringshistorie</h2>
                        {isLoadingReservations ? (
                            <p>Historie wordt geladen...</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gasten</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Arrangement</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Totaal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reservations?.map(res => (
                                            <tr key={res.id}>
                                                <td className="px-4 py-3 whitespace-nowrap">{res.date}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{res.guests}p</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{res.package}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">€{res.totalPrice.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailView;
