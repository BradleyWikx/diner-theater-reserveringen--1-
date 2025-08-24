// Firebase Service Layer for Dinner Theater Reservation System
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  increment,
  Timestamp,
  CollectionReference,
  DocumentReference
} from 'firebase/firestore';
import { db } from '../config';
import { 
  ShowEvent, 
  Reservation, 
  WaitingListEntry, 
  InternalEvent, 
  AppConfig, 
  Customer,
  TheaterVoucher,
  BookingApproval,
  WaitlistEntry
} from '../../types/types';

// 🎭 SHOW EVENTS SERVICE
export class ShowEventsService {
  private collection = collection(db, 'showEvents');

  async getAllShows(): Promise<ShowEvent[]> {
    try {
      const snapshot = await getDocs(query(this.collection, orderBy('date', 'asc')));
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore timestamps back to strings if they exist
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        } as unknown as ShowEvent;
      });
    } catch (error) {
      console.error('Error fetching shows:', error);
      throw new Error('Failed to fetch shows');
    }
  }

  async getShowById(id: string): Promise<ShowEvent | null> {
    try {
      const docSnap = await getDoc(doc(this.collection, id));
      if (!docSnap.exists()) return null;
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as unknown as ShowEvent;
    } catch (error) {
      console.error('Error fetching show:', error);
      throw new Error('Failed to fetch show');
    }
  }

  async addShow(show: Omit<ShowEvent, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.collection, {
        ...show,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding show:', error);
      throw new Error('Failed to add show');
    }
  }

  async addMultipleShows(shows: Omit<ShowEvent, 'id'>[]): Promise<string[]> {
    try {
      const batch = writeBatch(db);
      const docRefs: string[] = [];
      
      shows.forEach(show => {
        const docRef = doc(this.collection);
        batch.set(docRef, {
          ...show,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        docRefs.push(docRef.id);
      });
      
      await batch.commit();
      return docRefs;
    } catch (error) {
      console.error('Error adding multiple shows:', error);
      throw new Error('Failed to add shows');
    }
  }

  async updateShow(id: string, updates: Partial<ShowEvent>): Promise<void> {
    try {
      await updateDoc(doc(this.collection, id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating show:', error);
      throw new Error('Failed to update show');
    }
  }

  async deleteShow(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.collection, id));
    } catch (error) {
      console.error('Error deleting show:', error);
      throw new Error('Failed to delete show');
    }
  }

  async bulkDeleteShows(criteria: { type: 'name' | 'type' | 'date', value: string }): Promise<void> {
    try {
      let q;
      
      if (criteria.type === 'date') {
        const dates = criteria.value.split(',');
        q = query(this.collection, where('date', 'in', dates));
      } else {
        q = query(this.collection, where(criteria.type, '==', criteria.value));
      }
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error bulk deleting shows:', error);
      throw new Error('Failed to bulk delete shows');
    }
  }

  // Real-time listener for shows
  onShowsChange(callback: (shows: ShowEvent[]) => void): () => void {
    return onSnapshot(
      query(this.collection, orderBy('date', 'asc')),
      (snapshot) => {
        const shows = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          } as unknown as ShowEvent;
        });
        callback(shows);
      },
      (error) => {
        console.error('Error listening to shows:', error);
      }
    );
  }
}

// 🎫 RESERVATIONS SERVICE
export class ReservationsService {
  private collection = collection(db, 'reservations');

  async getAllReservations(): Promise<Reservation[]> {
    try {
      const snapshot = await getDocs(query(this.collection, orderBy('createdAt', 'desc')));
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: parseInt(data.id) || Date.now(),
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
        } as unknown as Reservation;
      });
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw new Error('Failed to fetch reservations');
    }
  }

  async getReservationById(id: number): Promise<Reservation | null> {
    try {
      const q = query(this.collection, where('id', '==', id));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: parseInt(data.id),
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
      } as unknown as Reservation;
    } catch (error) {
      console.error('Error fetching reservation:', error);
      throw new Error('Failed to fetch reservation');
    }
  }

  async addReservation(reservation: Omit<Reservation, 'id'>): Promise<number> {
    try {
      console.log('🔥 Firebase: Adding reservation to Firestore:', reservation);
      const id = Date.now();
      const docData = {
        ...reservation,
        id,
        createdAt: serverTimestamp()
      };
      console.log('🔥 Firebase: Document data to save:', docData);
      
      const docRef = await addDoc(this.collection, docData);
      console.log('✅ Firebase: Reservation added successfully with document ID:', docRef.id, 'and ID:', id);
      return id;
    } catch (error) {
      console.error('❌ Firebase: Error adding reservation:', error);
      throw new Error('Failed to add reservation');
    }
  }

  async updateReservation(id: number, updates: Partial<Reservation>): Promise<void> {
    try {
      const reservationQuery = query(this.collection, where('id', '==', id));
      const snapshot = await getDocs(reservationQuery);
      
      if (!snapshot.empty) {
        await updateDoc(snapshot.docs[0].ref, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw new Error('Failed to update reservation');
    }
  }

  async deleteReservation(id: number): Promise<void> {
    try {
      const reservationQuery = query(this.collection, where('id', '==', id));
      const snapshot = await getDocs(reservationQuery);
      
      if (!snapshot.empty) {
        await deleteDoc(snapshot.docs[0].ref);
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
      throw new Error('Failed to delete reservation');
    }
  }

  async getReservationsByDate(date: string): Promise<Reservation[]> {
    try {
      const q = query(this.collection, where('date', '==', date));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: parseInt(doc.data().id) || Date.now(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
      })) as Reservation[];
    } catch (error) {
      console.error('Error fetching reservations by date:', error);
      throw new Error('Failed to fetch reservations by date');
    }
  }

  // Real-time listener for reservations
  onReservationsChange(callback: (reservations: Reservation[]) => void): () => void {
    console.log('🔥 Firebase: Setting up reservations real-time listener');
    return onSnapshot(
      query(this.collection, orderBy('createdAt', 'desc')),
      (snapshot) => {
        console.log('🔥 Firebase: Reservations snapshot received, doc count:', snapshot.docs.length);
        const reservations = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('🔥 Firebase: Processing reservation doc:', doc.id, data);
          return {
            ...data,
            id: parseInt(data.id) || Date.now(),
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
          };
        }) as Reservation[];
        console.log('✅ Firebase: Processed reservations:', reservations.length, reservations);
        callback(reservations);
      },
      (error) => {
        console.error('❌ Firebase: Error listening to reservations:', error);
      }
    );
  }
}

// 📋 WAITING LIST SERVICE (Legacy)
export class WaitingListService {
  private collection = collection(db, 'waitingListLegacy');

  async getAllWaitingList(): Promise<WaitingListEntry[]> {
    try {
      const snapshot = await getDocs(query(this.collection, orderBy('addedAt', 'asc')));
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: parseInt(doc.data().id) || Date.now(),
        addedAt: doc.data().addedAt?.toDate?.() || undefined
      })) as WaitingListEntry[];
    } catch (error) {
      console.error('Error fetching waiting list:', error);
      throw new Error('Failed to fetch waiting list');
    }
  }

  async addWaitingListEntry(entry: Omit<WaitingListEntry, 'id'>): Promise<number> {
    try {
      const id = Date.now();
      await addDoc(this.collection, {
        ...entry,
        id,
        addedAt: serverTimestamp()
      });
      return id;
    } catch (error) {
      console.error('Error adding waiting list entry:', error);
      throw new Error('Failed to add waiting list entry');
    }
  }

  async updateWaitingListEntry(id: number, updates: Partial<WaitingListEntry>): Promise<void> {
    try {
      const entryQuery = query(this.collection, where('id', '==', id));
      const snapshot = await getDocs(entryQuery);
      
      if (!snapshot.empty) {
        await updateDoc(snapshot.docs[0].ref, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating waiting list entry:', error);
      throw new Error('Failed to update waiting list entry');
    }
  }

  async deleteWaitingListEntry(id: number): Promise<void> {
    try {
      const entryQuery = query(this.collection, where('id', '==', id));
      const snapshot = await getDocs(entryQuery);
      
      if (!snapshot.empty) {
        await deleteDoc(snapshot.docs[0].ref);
      }
    } catch (error) {
      console.error('Error deleting waiting list entry:', error);
      throw new Error('Failed to delete waiting list entry');
    }
  }

  // Real-time listener for waiting list
  onWaitingListChange(callback: (waitingList: WaitingListEntry[]) => void): () => void {
    return onSnapshot(
      query(this.collection, orderBy('addedAt', 'asc')),
      (snapshot) => {
        const waitingList = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: parseInt(doc.data().id) || Date.now(),
          addedAt: doc.data().addedAt?.toDate?.() || undefined
        })) as WaitingListEntry[];
        callback(waitingList);
      },
      (error) => {
        console.error('Error listening to waiting list:', error);
      }
    );
  }
}

// 📋 ENHANCED WAITLIST SERVICE (New System)
export class WaitlistService {
  private collection = collection(db, 'waitlist');

  async getAllWaitlistEntries(): Promise<WaitlistEntry[]> {
    try {
      const snapshot = await getDocs(query(this.collection, orderBy('addedAt', 'asc')));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedAt: doc.data().addedAt?.toDate?.() || new Date(),
        lastNotificationAt: doc.data().lastNotificationAt?.toDate?.() || undefined,
        responseDeadline: doc.data().responseDeadline?.toDate?.() || undefined
      })) as WaitlistEntry[];
    } catch (error) {
      console.error('Error fetching waitlist entries:', error);
      throw new Error('Failed to fetch waitlist entries');
    }
  }

  async addWaitlistEntry(entry: Omit<WaitlistEntry, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.collection, {
        ...entry,
        addedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding waitlist entry:', error);
      throw new Error('Failed to add waitlist entry');
    }
  }

  async updateWaitlistEntry(id: string, updates: Partial<WaitlistEntry>): Promise<void> {
    try {
      await updateDoc(doc(this.collection, id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating waitlist entry:', error);
      throw new Error('Failed to update waitlist entry');
    }
  }

  async deleteWaitlistEntry(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.collection, id));
    } catch (error) {
      console.error('Error deleting waitlist entry:', error);
      throw new Error('Failed to delete waitlist entry');
    }
  }

  // Real-time listener for waitlist
  onWaitlistChange(callback: (waitlist: WaitlistEntry[]) => void): () => void {
    return onSnapshot(
      query(this.collection, orderBy('addedAt', 'asc')),
      (snapshot) => {
        const waitlist = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          addedAt: doc.data().addedAt?.toDate?.() || new Date(),
          lastNotificationAt: doc.data().lastNotificationAt?.toDate?.() || undefined,
          responseDeadline: doc.data().responseDeadline?.toDate?.() || undefined
        })) as WaitlistEntry[];
        callback(waitlist);
      },
      (error) => {
        console.error('Error listening to waitlist:', error);
      }
    );
  }
}

// 🎭 INTERNAL EVENTS SERVICE
export class InternalEventsService {
  private collection = collection(db, 'internalEvents');

  async getAllInternalEvents(): Promise<InternalEvent[]> {
    try {
      const snapshot = await getDocs(query(this.collection, orderBy('date', 'asc')));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InternalEvent[];
    } catch (error) {
      console.error('Error fetching internal events:', error);
      throw new Error('Failed to fetch internal events');
    }
  }

  async addInternalEvent(event: Omit<InternalEvent, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.collection, {
        ...event,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding internal event:', error);
      throw new Error('Failed to add internal event');
    }
  }

  async updateInternalEvent(id: string, updates: Partial<InternalEvent>): Promise<void> {
    try {
      await updateDoc(doc(this.collection, id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating internal event:', error);
      throw new Error('Failed to update internal event');
    }
  }

  async deleteInternalEvent(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.collection, id));
    } catch (error) {
      console.error('Error deleting internal event:', error);
      throw new Error('Failed to delete internal event');
    }
  }

  // Real-time listener for internal events
  onInternalEventsChange(callback: (events: InternalEvent[]) => void): () => void {
    return onSnapshot(
      query(this.collection, orderBy('date', 'asc')),
      (snapshot) => {
        const events = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as InternalEvent[];
        callback(events);
      },
      (error) => {
        console.error('Error listening to internal events:', error);
      }
    );
  }
}

// ⚙️ CONFIG SERVICE
export class ConfigService {
  private docRef = doc(db, 'config', 'appConfig');

  async getConfig(): Promise<AppConfig | null> {
    try {
      const docSnap = await getDoc(this.docRef);
      if (!docSnap.exists()) {
        // Return null if no config exists yet
        return null;
      }
      
      return docSnap.data() as AppConfig;
    } catch (error) {
      console.error('Error fetching config:', error);
      throw new Error('Failed to fetch configuration');
    }
  }

  async updateConfig(config: AppConfig): Promise<void> {
    try {
      await updateDoc(this.docRef, {
        ...config,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating config:', error);
      throw new Error('Failed to update configuration');
    }
  }

  async initializeConfig(config: AppConfig): Promise<void> {
    try {
      // Use setDoc instead of updateDoc to create the document if it doesn't exist
      await setDoc(this.docRef, {
        ...config,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error initializing config:', error);
      throw new Error('Failed to initialize configuration');
    }
  }

  // Real-time listener for config changes
  onConfigChange(callback: (config: AppConfig | null) => void): () => void {
    return onSnapshot(
      this.docRef,
      (doc) => {
        if (doc.exists()) {
          callback(doc.data() as AppConfig);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to config:', error);
      }
    );
  }
}

// 🎫 THEATER VOUCHERS SERVICE
export class TheaterVouchersService {
  private collection = collection(db, 'theaterVouchers');

  async getAllVouchers(): Promise<TheaterVoucher[]> {
    try {
      const snapshot = await getDocs(query(this.collection, orderBy('issueDate', 'desc')));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TheaterVoucher[];
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      throw new Error('Failed to fetch vouchers');
    }
  }

  async addVoucher(voucher: Omit<TheaterVoucher, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.collection, {
        ...voucher,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding voucher:', error);
      throw new Error('Failed to add voucher');
    }
  }

  async updateVoucher(id: string, updates: Partial<TheaterVoucher>): Promise<void> {
    try {
      await updateDoc(doc(this.collection, id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating voucher:', error);
      throw new Error('Failed to update voucher');
    }
  }

  async deleteVoucher(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.collection, id));
    } catch (error) {
      console.error('Error deleting voucher:', error);
      throw new Error('Failed to delete voucher');
    }
  }

  async getVoucherByCode(code: string): Promise<TheaterVoucher | null> {
    try {
      const q = query(this.collection, where('code', '==', code));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as TheaterVoucher;
    } catch (error) {
      console.error('Error fetching voucher by code:', error);
      throw new Error('Failed to fetch voucher');
    }
  }
}

// 👥 CUSTOMERS SERVICE
export class CustomersService {
  private collection = collection(db, 'customers');

  async getAllCustomers(): Promise<Customer[]> {
    try {
      const snapshot = await getDocs(query(this.collection, orderBy('lastVisit', 'desc')));
      return snapshot.docs.map(doc => ({
        email: doc.id, // Using email as document ID
        ...doc.data()
      })) as Customer[];
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      const docSnap = await getDoc(doc(this.collection, email));
      if (!docSnap.exists()) return null;
      
      return {
        email,
        ...docSnap.data()
      } as Customer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw new Error('Failed to fetch customer');
    }
  }

  async updateCustomer(email: string, updates: Partial<Customer>): Promise<void> {
    try {
      await updateDoc(doc(this.collection, email), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      throw new Error('Failed to update customer');
    }
  }
}

// 🔒 BOOKING APPROVALS SERVICE
export class BookingApprovalsService {
  private collection = collection(db, 'bookingApprovals');

  async getAllApprovals(): Promise<BookingApproval[]> {
    try {
      const snapshot = await getDocs(query(this.collection, orderBy('requestedAt', 'desc')));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate?.() || new Date(),
        processedAt: doc.data().processedAt?.toDate?.() || undefined
      })) as BookingApproval[];
    } catch (error) {
      console.error('Error fetching approvals:', error);
      throw new Error('Failed to fetch approvals');
    }
  }

  async addApproval(approval: Omit<BookingApproval, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.collection, {
        ...approval,
        requestedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding approval:', error);
      throw new Error('Failed to add approval');
    }
  }

  async updateApproval(id: string, updates: Partial<BookingApproval>): Promise<void> {
    try {
      await updateDoc(doc(this.collection, id), {
        ...updates,
        processedAt: updates.status !== 'pending' ? serverTimestamp() : undefined,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating approval:', error);
      throw new Error('Failed to update approval');
    }
  }
}

// 🎫 PROMO CODES SERVICE
export class PromoCodesService {
  private collection = collection(db, 'promoCodes');

  // Get all promo codes
  onPromoCodesChange(callback: (promoCodes: any[]) => void): () => void {
    const unsubscribe = onSnapshot(
      query(this.collection, orderBy('code', 'asc')),
      (snapshot) => {
        const promoCodes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(promoCodes);
      },
      (error) => {
        console.error('Error listening to promo codes:', error);
        callback([]);
      }
    );
    return unsubscribe;
  }

  // Add new promo code
  async addPromoCode(promoCode: any): Promise<void> {
    try {
      const docData = {
        ...promoCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await addDoc(this.collection, docData);
    } catch (error) {
      console.error('Error adding promo code:', error);
      throw new Error('Failed to add promo code');
    }
  }

  // Update promo code
  async updatePromoCode(id: string, updates: Partial<any>): Promise<void> {
    try {
      const docRef = doc(this.collection, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating promo code:', error);
      throw new Error('Failed to update promo code');
    }
  }

  // Delete promo code
  async deletePromoCode(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.collection, id));
    } catch (error) {
      console.error('Error deleting promo code:', error);
      throw new Error('Failed to delete promo code');
    }
  }

  // Validate promo code
  async validatePromoCode(code: string): Promise<any | null> {
    try {
      const q = query(this.collection, where('code', '==', code), where('active', '==', true));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const promoDoc = snapshot.docs[0];
      const promo: any = { id: promoDoc.id, ...promoDoc.data() };
      
      // Check if promo is still valid (not expired, usage limit not reached, etc.)
      const now = new Date();
      if (promo.expiryDate && new Date(promo.expiryDate) < now) {
        return null;
      }
      
      if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
        return null;
      }

      return promo;
    } catch (error) {
      console.error('Error validating promo code:', error);
      return null;
    }
  }

  // Use promo code (increment usage count)
  async usePromoCode(id: string): Promise<void> {
    try {
      const docRef = doc(this.collection, id);
      await updateDoc(docRef, {
        usageCount: increment(1),
        lastUsed: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error using promo code:', error);
      throw new Error('Failed to use promo code');
    }
  }
}

// 🔔 NOTIFICATIONS SERVICE  
export class NotificationsService {
  private collection = collection(db, 'notifications');

  // Listen to notifications for a user or admin
  onNotificationsChange(callback: (notifications: any[]) => void): () => void {
    const unsubscribe = onSnapshot(
      query(this.collection, orderBy('createdAt', 'desc'), limit(50)),
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
        }));
        callback(notifications);
      },
      (error) => {
        console.error('Error listening to notifications:', error);
        callback([]);
      }
    );
    return unsubscribe;
  }

  // Add notification
  async addNotification(notification: {
    type: 'booking' | 'cancellation' | 'waitlist' | 'system';
    title: string;
    message: string;
    userId?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      const docData = {
        ...notification,
        read: false,
        createdAt: serverTimestamp()
      };
      await addDoc(this.collection, docData);
    } catch (error) {
      console.error('Error adding notification:', error);
      throw new Error('Failed to add notification');
    }
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<void> {
    try {
      await updateDoc(doc(this.collection, id), {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.collection, id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }
}

// 📊 ADMIN LOGS SERVICE
export class AdminLogsService {
  private collection = collection(db, 'adminLogs');

  // Listen to admin logs
  onAdminLogsChange(callback: (logs: any[]) => void): () => void {
    const unsubscribe = onSnapshot(
      query(this.collection, orderBy('timestamp', 'desc'), limit(100)),
      (snapshot) => {
        const logs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp
        }));
        callback(logs);
      },
      (error) => {
        console.error('Error listening to admin logs:', error);
        callback([]);
      }
    );
    return unsubscribe;
  }

  // Add admin log entry
  async addLog(log: {
    action: string;
    details: string;
    userId?: string;
    ipAddress?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      const docData = {
        ...log,
        timestamp: serverTimestamp()
      };
      await addDoc(this.collection, docData);
    } catch (error) {
      console.error('Error adding admin log:', error);
      // Don't throw error for logging failures
    }
  }

  // Clear old logs (keep last 1000)
  async clearOldLogs(): Promise<void> {
    try {
      const q = query(this.collection, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      
      if (snapshot.docs.length > 1000) {
        const docsToDelete = snapshot.docs.slice(1000);
        const batch = writeBatch(db);
        
        docsToDelete.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        
        await batch.commit();
      }
    } catch (error) {
      console.error('Error clearing old logs:', error);
    }
  }
}

// 🚀 FIREBASE SERVICE FACTORY
export class FirebaseService {
  public shows: ShowEventsService;
  public reservations: ReservationsService;
  public waitingList: WaitingListService; // Legacy
  public waitlist: WaitlistService; // New system
  public internalEvents: InternalEventsService;
  public config: ConfigService;
  public vouchers: TheaterVouchersService;
  public customers: CustomersService;
  public approvals: BookingApprovalsService;
  public promoCodes: PromoCodesService;
  public notifications: NotificationsService;
  public adminLogs: AdminLogsService;

  constructor() {
    this.shows = new ShowEventsService();
    this.reservations = new ReservationsService();
    this.waitingList = new WaitingListService();
    this.waitlist = new WaitlistService();
    this.internalEvents = new InternalEventsService();
    this.config = new ConfigService();
    this.vouchers = new TheaterVouchersService();
    this.customers = new CustomersService();
    this.approvals = new BookingApprovalsService();
    this.promoCodes = new PromoCodesService();
    this.notifications = new NotificationsService();
    this.adminLogs = new AdminLogsService();
  }

  // Helper method for batch operations
  async batchOperation(operations: (() => Promise<void>)[]): Promise<void> {
    try {
      await Promise.all(operations.map(op => op()));
    } catch (error) {
      console.error('Batch operation failed:', error);
      throw new Error('Batch operation failed');
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await getDoc(doc(db, 'health', 'check'));
      return true;
    } catch (error) {
      console.error('Firebase health check failed:', error);
      return false;
    }
  }

  // Initialize app with default data
  async initializeApp(defaultConfig: AppConfig): Promise<void> {
    try {
      const existingConfig = await this.config.getConfig();
      if (!existingConfig) {
        await this.config.initializeConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      throw new Error('Failed to initialize app');
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
