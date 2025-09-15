// src/services/approvalService.ts
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Reservation } from '../types/types';

/**
 * Fetches all reservations with a 'pending' status.
 * @returns A promise that resolves to an array of pending reservations.
 */
export const getPendingReservations = async (): Promise<Reservation[]> => {
    const reservationsCol = collection(db, 'reservations');
    const q = query(reservationsCol, where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    const pendingReservations: Reservation[] = [];
    snapshot.forEach((doc) => {
        pendingReservations.push({ id: doc.id, ...doc.data() } as Reservation);
    });
    return pendingReservations;
};

/**
 * Updates the status of a reservation.
 * @param reservationId The ID of the reservation to update.
 * @param status The new status ('confirmed' or 'rejected').
 */
export const updateReservationStatus = async (reservationId: string, status: 'confirmed' | 'rejected'): Promise<void> => {
    const reservationDocRef = doc(db, 'reservations', reservationId);
    await updateDoc(reservationDocRef, { status });
};
