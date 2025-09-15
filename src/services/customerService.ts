// src/services/customerService.ts
import { collection, getDocs, doc, getDoc, updateDoc, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Customer, Reservation } from '../types/types'; // Assuming Customer type exists

/**
 * Fetches all customers from Firestore.
 * @returns A promise that resolves to an array of customers.
 */
export const getAllCustomers = async (): Promise<Customer[]> => {
    const customersCol = collection(db, 'customers');
    const q = query(customersCol, orderBy('lastVisit', 'desc'));
    const customerSnapshot = await getDocs(q);
    const customers: Customer[] = [];
    customerSnapshot.forEach((doc) => {
        customers.push({ id: doc.id, ...doc.data() } as unknown as Customer);
    });
    return customers;
};

/**
 * Fetches a single customer by their ID.
 * @param customerId The ID of the customer to fetch.
 * @returns A promise that resolves to the customer object.
 */
export const getCustomerById = async (customerId: string): Promise<Customer | null> => {
    const customerDocRef = doc(db, 'customers', customerId);
    const docSnap = await getDoc(customerDocRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as Customer;
    }
    return null;
};

/**
 * Fetches the reservation history for a specific customer.
 * @param customerId The ID of the customer.
 * @returns A promise that resolves to an array of reservations.
 */
export const getCustomerReservationHistory = async (customerId: string): Promise<Reservation[]> => {
    // This assumes reservations have a 'customerId' field.
    // If not, you might need to query based on email or another unique identifier.
    const reservationsCol = collection(db, 'reservations');
    const q = query(reservationsCol, where('customerId', '==', customerId), orderBy('date', 'desc'));
    const reservationSnapshot = await getDocs(q);
    const reservations: Reservation[] = [];
    reservationSnapshot.forEach((doc) => {
        reservations.push({ id: doc.id, ...doc.data() } as Reservation);
    });
    return reservations;
};


/**
 * Updates the notes for a specific customer.
 * @param customerId The ID of the customer to update.
 * @param notes The new notes to save.
 */
export const updateCustomerNotes = async (customerId: string, notes: string): Promise<void> => {
    const customerDocRef = doc(db, 'customers', customerId);
    await updateDoc(customerDocRef, { notes });
};
