// src/services/booking/reservations.ts
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Reservation } from '../../types/types';

/**
 * Fetches all confirmed reservations for a specific date.
 * @param date The date to fetch reservations for.
 * @returns A promise that resolves to an array of reservations.
 */
export const getConfirmedReservationsByDate = async (date: Date): Promise<Reservation[]> => {
    const reservationsCol = collection(db, 'reservations');
    
    // Firestore queries work well with ISO strings for dates.
    // We'll query for a range from the start of the day to the end of the day.
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const q = query(
        reservationsCol,
        where('status', '==', 'confirmed'),
        where('showDate', '>=', startOfDay),
        where('showDate', '<=', endOfDay)
    );

    const reservationSnapshot = await getDocs(q);
    const reservations: Reservation[] = [];
    reservationSnapshot.forEach((doc) => {
        reservations.push({ id: doc.id, ...doc.data() } as Reservation);
    });

    return reservations;
};
