// Firebase React Hooks for Dinner Theater Reservation System
import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '../../firebase/services/firebaseService';
import { 
  ShowEvent, 
  Reservation, 
  WaitingListEntry, 
  InternalEvent, 
  AppConfig,
  TheaterVoucher,
  WaitlistEntry,
  Customer,
  BookingApproval
} from '../../types/types';

// 🎭 SHOWS HOOK
export const useShows = () => {
  const [shows, setShows] = useState<ShowEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.shows.onShowsChange((newShows) => {
      setShows(newShows);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const addShow = useCallback(async (show: Omit<ShowEvent, 'id'>, dates: string[]) => {
    try {
      setLoading(true);
      const showsToAdd = dates.map(date => ({ ...show, date }));
      await firebaseService.shows.addMultipleShows(showsToAdd);
      console.log(`✅ ${dates.length === 1 ? 'Show' : dates.length + ' shows'} toegevoegd!`);
    } catch (error) {
      console.error('Error adding shows:', error);
      setError('Failed to add shows');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateShow = useCallback(async (id: string, updates: Partial<ShowEvent>) => {
    try {
      await firebaseService.shows.updateShow(id, updates);
      console.log('✅ Show bijgewerkt!');
    } catch (error) {
      console.error('Error updating show:', error);
      setError('Failed to update show');
    }
  }, []);

  const deleteShow = useCallback(async (id: string) => {
    try {
      await firebaseService.shows.deleteShow(id);
      console.log('✅ Show verwijderd!');
    } catch (error) {
      console.error('Error deleting show:', error);
      setError('Failed to delete show');
    }
  }, []);

  const bulkDeleteShows = useCallback(async (criteria: { type: 'name' | 'type' | 'date', value: string }) => {
    try {
      setLoading(true);
      await firebaseService.shows.bulkDeleteShows(criteria);
      console.log('✅ Shows verwijderd!');
    } catch (error) {
      console.error('Error bulk deleting shows:', error);
      setError('Failed to bulk delete shows');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    shows,
    loading,
    error,
    addShow,
    updateShow,
    deleteShow,
    bulkDeleteShows
  };
};

// 🎫 RESERVATIONS HOOK
export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔥 React Hook: Setting up reservations listener');
    const unsubscribe = firebaseService.reservations.onReservationsChange((newReservations) => {
      console.log('🔥 React Hook: Received reservations update:', newReservations.length, newReservations);
      setReservations(newReservations);
      setLoading(false);
      setError(null);
    });

    return () => {
      console.log('🔥 React Hook: Cleaning up reservations listener');
      unsubscribe();
    };
  }, []);

  const addReservation = useCallback(async (reservation: Omit<Reservation, 'id'>) => {
    try {
      console.log('🔥 React Hook: Adding reservation:', reservation);
      const id = await firebaseService.reservations.addReservation(reservation);
      console.log('✅ React Hook: Reservation added successfully with ID:', id);
      console.log('✅ Reservering toegevoegd!');
      return id;
    } catch (error) {
      console.error('❌ React Hook: Error adding reservation:', error);
      setError('Failed to add reservation');
      throw error;
    }
  }, []);

  const updateReservation = useCallback(async (id: number, updates: Partial<Reservation>) => {
    try {
      await firebaseService.reservations.updateReservation(id, updates);
      console.log('✅ Reservering bijgewerkt!');
    } catch (error) {
      console.error('Error updating reservation:', error);
      setError('Failed to update reservation');
    }
  }, []);

  const deleteReservation = useCallback(async (id: number) => {
    try {
      await firebaseService.reservations.deleteReservation(id);
      console.log('✅ Reservering verwijderd!');
    } catch (error) {
      console.error('Error deleting reservation:', error);
      setError('Failed to delete reservation');
    }
  }, []);

  return {
    reservations,
    loading,
    error,
    addReservation,
    updateReservation,
    deleteReservation
  };
};

// 📋 WAITING LIST HOOK  
export const useWaitingList = () => {
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔥 React Hook: Setting up waiting list listener');
    const unsubscribe = firebaseService.waitingList.onWaitingListChange((newWaitingList) => {
      console.log('🔥 React Hook: Received waiting list update:', newWaitingList.length, newWaitingList);
      setWaitingList(newWaitingList);
      setLoading(false);
      setError(null);
    });

    return () => {
      console.log('🔥 React Hook: Cleaning up waiting list listener');
      unsubscribe();
    };
  }, []);

  const addToWaitingList = useCallback(async (entry: Omit<WaitingListEntry, 'id'>) => {
    try {
      console.log('🔥 React Hook: Adding to waiting list:', entry);
      const id = await firebaseService.waitingList.addWaitingListEntry(entry);
      console.log('✅ React Hook: Waiting list entry added successfully with ID:', id);
      console.log('✅ Toegevoegd aan wachtlijst!');
      return id;
    } catch (error) {
      console.error('❌ React Hook: Error adding to waiting list:', error);
      setError('Failed to add to waiting list');
      throw error;
    }
  }, []);

  const updateWaitingListEntry = useCallback(async (id: number, updates: Partial<WaitingListEntry>) => {
    try {
      await firebaseService.waitingList.updateWaitingListEntry(id, updates);
      console.log('✅ Wachtlijst item bijgewerkt!');
    } catch (error) {
      console.error('Error updating waiting list entry:', error);
      setError('Failed to update waiting list entry');
    }
  }, []);

  const deleteWaitingListEntry = useCallback(async (id: number) => {
    try {
      await firebaseService.waitingList.deleteWaitingListEntry(id);
      console.log('✅ Wachtlijst item verwijderd!');
    } catch (error) {
      console.error('Error deleting waiting list entry:', error);
      setError('Failed to delete waiting list entry');
    }
  }, []);

  return {
    waitingList,
    loading,
    error,
    addToWaitingList,
    updateWaitingListEntry,
    deleteWaitingListEntry
  };
};

// 📅 INTERNAL EVENTS HOOK
export const useInternalEvents = () => {
  const [internalEvents, setInternalEvents] = useState<InternalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.internalEvents.onInternalEventsChange((newEvents) => {
      setInternalEvents(newEvents);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const addInternalEvent = useCallback(async (event: Omit<InternalEvent, 'id'>) => {
    try {
      const id = await firebaseService.internalEvents.addInternalEvent(event);
      console.log('✅ Intern evenement toegevoegd!');
      return id;
    } catch (error) {
      console.error('Error adding internal event:', error);
      setError('Failed to add internal event');
      throw error;
    }
  }, []);

  const updateInternalEvent = useCallback(async (id: string, updates: Partial<InternalEvent>) => {
    try {
      await firebaseService.internalEvents.updateInternalEvent(id, updates);
      console.log('✅ Intern evenement bijgewerkt!');
    } catch (error) {
      console.error('Error updating internal event:', error);
      setError('Failed to update internal event');
    }
  }, []);

  const deleteInternalEvent = useCallback(async (id: string) => {
    try {
      await firebaseService.internalEvents.deleteInternalEvent(id);
      console.log('✅ Intern evenement verwijderd!');
    } catch (error) {
      console.error('Error deleting internal event:', error);
      setError('Failed to delete internal event');
    }
  }, []);

  return {
    internalEvents,
    loading,
    error,
    addInternalEvent,
    updateInternalEvent,
    deleteInternalEvent
  };
};

// ⚙️ APP CONFIG HOOK
export const useAppConfig = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.config.onConfigChange((newConfig) => {
      setConfig(newConfig);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const updateConfig = useCallback(async (updates: Partial<AppConfig>) => {
    try {
      await firebaseService.config.updateConfig(updates as AppConfig);
      console.log('✅ Configuratie bijgewerkt!');
    } catch (error) {
      console.error('Error updating config:', error);
      setError('Failed to update config');
    }
  }, []);

  const initializeConfig = useCallback(async (initialConfig: AppConfig) => {
    try {
      await firebaseService.config.initializeConfig(initialConfig);
      console.log('✅ Configuratie geïnitialiseerd!');
    } catch (error) {
      console.error('Error initializing config:', error);
      setError('Failed to initialize config');
    }
  }, []);

  return {
    config,
    loading,
    error,
    updateConfig,
    initializeConfig
  };
};

// 🎟️ THEATER VOUCHERS HOOK
export const useTheaterVouchers = () => {
  const [vouchers, setVouchers] = useState<TheaterVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.vouchers.onTheaterVouchersChange((newVouchers) => {
      setVouchers(newVouchers);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const addTheaterVoucher = useCallback(async (voucher: Omit<TheaterVoucher, 'id'>) => {
    try {
      const id = await firebaseService.vouchers.addTheaterVoucher(voucher);
      console.log('✅ Theater voucher toegevoegd!');
      return id;
    } catch (error) {
      console.error('Error adding theater voucher:', error);
      setError('Failed to add theater voucher');
      throw error;
    }
  }, []);

  const updateTheaterVoucher = useCallback(async (id: string, updates: Partial<TheaterVoucher>) => {
    try {
      await firebaseService.vouchers.updateTheaterVoucher(id, updates);
      console.log('✅ Theater voucher bijgewerkt!');
    } catch (error) {
      console.error('Error updating theater voucher:', error);
      setError('Failed to update theater voucher');
    }
  }, []);

  const deleteTheaterVoucher = useCallback(async (id: string) => {
    try {
      await firebaseService.vouchers.deleteTheaterVoucher(id);
      console.log('✅ Theater voucher verwijderd!');
    } catch (error) {
      console.error('Error deleting theater voucher:', error);
      setError('Failed to delete theater voucher');
    }
  }, []);

  return {
    vouchers,
    loading,
    error,
    addTheaterVoucher,
    updateTheaterVoucher,
    deleteTheaterVoucher
  };
};

// 👥 WAITLIST HOOK (NEW SYSTEM)
export const useWaitlist = () => {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.waitlist.onWaitlistChange((newWaitlist) => {
      setWaitlist(newWaitlist);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const addToWaitlist = useCallback(async (entry: Omit<WaitlistEntry, 'id'>) => {
    try {
      const id = await firebaseService.waitlist.addWaitlistEntry(entry);
      console.log('✅ Toegevoegd aan wachtlijst!');
      return id;
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      setError('Failed to add to waitlist');
      throw error;
    }
  }, []);

  const updateWaitlistEntry = useCallback(async (id: string, updates: Partial<WaitlistEntry>) => {
    try {
      await firebaseService.waitlist.updateWaitlistEntry(id, updates);
      console.log('✅ Wachtlijst item bijgewerkt!');
    } catch (error) {
      console.error('Error updating waitlist entry:', error);
      setError('Failed to update waitlist entry');
    }
  }, []);

  const deleteWaitlistEntry = useCallback(async (id: string) => {
    try {
      await firebaseService.waitlist.deleteWaitlistEntry(id);
      console.log('✅ Wachtlijst item verwijderd!');
    } catch (error) {
      console.error('Error deleting waitlist entry:', error);
      setError('Failed to delete waitlist entry');
    }
  }, []);

  return {
    waitlist,
    loading,
    error,
    addToWaitlist,
    updateWaitlistEntry,
    deleteWaitlistEntry
  };
};

// 👤 CUSTOMERS HOOK
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.customers.onCustomersChange((newCustomers) => {
      setCustomers(newCustomers);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const addCustomer = useCallback(async (customer: Omit<Customer, 'id'>) => {
    try {
      const id = await firebaseService.customers.addCustomer(customer);
      console.log('✅ Klant toegevoegd!');
      return id;
    } catch (error) {
      console.error('Error adding customer:', error);
      setError('Failed to add customer');
      throw error;
    }
  }, []);

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>) => {
    try {
      await firebaseService.customers.updateCustomer(id, updates);
      console.log('✅ Klant bijgewerkt!');
    } catch (error) {
      console.error('Error updating customer:', error);
      setError('Failed to update customer');
    }
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      await firebaseService.customers.deleteCustomer(id);
      console.log('✅ Klant verwijderd!');
    } catch (error) {
      console.error('Error deleting customer:', error);
      setError('Failed to delete customer');
    }
  }, []);

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer
  };
};

// 🔐 BOOKING APPROVALS HOOK
export const useBookingApprovals = () => {
  const [approvals, setApprovals] = useState<BookingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.approvals.onBookingApprovalsChange((newApprovals) => {
      setApprovals(newApprovals);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const addBookingApproval = useCallback(async (approval: Omit<BookingApproval, 'id'>) => {
    try {
      const id = await firebaseService.approvals.addBookingApproval(approval);
      console.log('✅ Booking approval toegevoegd!');
      return id;
    } catch (error) {
      console.error('Error adding booking approval:', error);
      setError('Failed to add booking approval');
      throw error;
    }
  }, []);

  const updateBookingApproval = useCallback(async (id: string, updates: Partial<BookingApproval>) => {
    try {
      await firebaseService.approvals.updateBookingApproval(id, updates);
      console.log('✅ Booking approval bijgewerkt!');
    } catch (error) {
      console.error('Error updating booking approval:', error);
      setError('Failed to update booking approval');
    }
  }, []);

  const deleteBookingApproval = useCallback(async (id: string) => {
    try {
      await firebaseService.approvals.deleteBookingApproval(id);
      console.log('✅ Booking approval verwijderd!');
    } catch (error) {
      console.error('Error deleting booking approval:', error);
      setError('Failed to delete booking approval');
    }
  }, []);

  return {
    approvals,
    loading,
    error,
    addBookingApproval,
    updateBookingApproval,
    deleteBookingApproval
  };
};

// 🎫 PROMO CODES HOOK
export const usePromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.promoCodes.onPromoCodesChange((newPromoCodes) => {
      setPromoCodes(newPromoCodes);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const addPromoCode = useCallback(async (promoCode: any) => {
    try {
      await firebaseService.promoCodes.addPromoCode(promoCode);
      console.log('✅ Promo code toegevoegd!');
    } catch (error) {
      console.error('Error adding promo code:', error);
      setError('Failed to add promo code');
      throw error;
    }
  }, []);

  const updatePromoCode = useCallback(async (id: string, updates: Partial<any>) => {
    try {
      await firebaseService.promoCodes.updatePromoCode(id, updates);
      console.log('✅ Promo code bijgewerkt!');
    } catch (error) {
      console.error('Error updating promo code:', error);
      setError('Failed to update promo code');
    }
  }, []);

  const deletePromoCode = useCallback(async (id: string) => {
    try {
      await firebaseService.promoCodes.deletePromoCode(id);
      console.log('✅ Promo code verwijderd!');
    } catch (error) {
      console.error('Error deleting promo code:', error);
      setError('Failed to delete promo code');
    }
  }, []);

  const validatePromoCode = useCallback(async (code: string) => {
    try {
      const result = await firebaseService.promoCodes.validatePromoCode(code);
      return result;
    } catch (error) {
      console.error('Error validating promo code:', error);
      setError('Failed to validate promo code');
      return null;
    }
  }, []);

  return {
    promoCodes,
    loading,
    error,
    addPromoCode,
    updatePromoCode,
    deletePromoCode,
    validatePromoCode
  };
};

// 🔥 MAIN FIREBASE DATA HOOK - COMBINES ALL HOOKS
export const useFirebaseData = () => {
  const shows = useShows();
  const reservations = useReservations();
  const waitingList = useWaitingList();
  const internalEvents = useInternalEvents();
  const config = useAppConfig();
  const theaterVouchers = useTheaterVouchers();
  const waitlist = useWaitlist();
  const customers = useCustomers();
  const bookingApprovals = useBookingApprovals();
  const promoCodes = usePromoCodes();

  return {
    shows,
    reservations,
    waitingList,
    internalEvents,
    config,
    theaterVouchers,
    waitlist,
    customers,
    bookingApprovals,
    promoCodes
  };
};
export const useShows = () => {
  const [shows, setShows] = useState<ShowEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.shows.onShowsChange((newShows) => {
      setShows(newShows);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const addShow = useCallback(async (show: Omit<ShowEvent, 'id'>, dates: string[]) => {
    try {
      setLoading(true);
      const showsToAdd = dates.map(date => ({ ...show, date }));
      await firebaseService.shows.addMultipleShows(showsToAdd);
      console.log(`✅ ${dates.length === 1 ? 'Show' : dates.length + ' shows'} toegevoegd!`);
    } catch (error) {
      console.error('Error adding shows:', error);
      setError('Failed to add shows');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateShow = useCallback(async (id: string, updates: Partial<ShowEvent>) => {
    try {
      await firebaseService.shows.updateShow(id, updates);
      console.log('✅ Show bijgewerkt!');
    } catch (error) {
      console.error('Error updating show:', error);
      setError('Failed to update show');
    }
  }, []);

  const deleteShow = useCallback(async (id: string) => {
    try {
      await firebaseService.shows.deleteShow(id);
      console.log('✅ Show verwijderd!');
    } catch (error) {
      console.error('Error deleting show:', error);
      setError('Failed to delete show');
    }
  }, []);

  const bulkDeleteShows = useCallback(async (criteria: { type: 'name' | 'type' | 'date', value: string }) => {
    try {
      setLoading(true);
      await firebaseService.shows.bulkDeleteShows(criteria);
      console.log('✅ Shows verwijderd!');
    } catch (error) {
      console.error('Error bulk deleting shows:', error);
      setError('Failed to bulk delete shows');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    shows,
    loading,
    error,
    addShow,
    updateShow,
    deleteShow,
    bulkDeleteShows
  };
};

// 🎫 RESERVATIONS HOOK
export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔥 React Hook: Setting up reservations listener');
    const unsubscribe = firebaseService.reservations.onReservationsChange((newReservations) => {
      console.log('🔥 React Hook: Received reservations update:', newReservations.length, newReservations);
      setReservations(newReservations);
      setLoading(false);
      setError(null);
    });

    return () => {
      console.log('🔥 React Hook: Cleaning up reservations listener');
      unsubscribe();
    };
  }, []);

  const addReservation = useCallback(async (reservation: Omit<Reservation, 'id'>) => {
    try {
      console.log('🔥 React Hook: Adding reservation:', reservation);
      const id = await firebaseService.reservations.addReservation(reservation);
      console.log('✅ React Hook: Reservation added successfully with ID:', id);
      console.log('✅ Reservering toegevoegd!');
      return id;
    } catch (error) {
      console.error('❌ React Hook: Error adding reservation:', error);
      setError('Failed to add reservation');
      throw error;
    }
  }, []);

  const updateReservation = useCallback(async (id: number, updates: Partial<Reservation>) => {
    try {
      await firebaseService.reservations.updateReservation(id, updates);
      console.log('✅ Reservering bijgewerkt!');
    } catch (error) {
      console.error('Error updating reservation:', error);
      setError('Failed to update reservation');
    }
  }, []);

  const deleteReservation = useCallback(async (id: number) => {
    try {
      await firebaseService.reservations.deleteReservation(id);
      console.log('✅ Reservering verwijderd!');
    } catch (error) {
      console.error('Error deleting reservation:', error);
      setError('Failed to delete reservation');
    }
  }, []);

  return {
    reservations,
    loading,
    error,
    addReservation,
    updateReservation,
    deleteReservation
  };
};

// 📋 WAITING LIST HOOK  
export const useWaitingList = () => {
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔥 React Hook: Setting up waiting list listener');
    const unsubscribe = firebaseService.waitingList.onWaitingListChange((newWaitingList) => {
      console.log('🔥 React Hook: Received waiting list update:', newWaitingList.length, newWaitingList);
      setWaitingList(newWaitingList);
      setLoading(false);
      setError(null);
    });

    return () => {
      console.log('🔥 React Hook: Cleaning up waiting list listener');
      unsubscribe();
    };
  }, []);

  const addToWaitingList = useCallback(async (entry: Omit<WaitingListEntry, 'id'>) => {
    try {
      console.log('🔥 React Hook: Adding to waiting list:', entry);
      const id = await firebaseService.waitingList.addWaitingListEntry(entry);
      console.log('✅ React Hook: Waiting list entry added successfully with ID:', id);
      console.log('✅ Toegevoegd aan wachtlijst!');
      return id;
    } catch (error) {
      console.error('❌ React Hook: Error adding to waiting list:', error);
      setError('Failed to add to waiting list');
      throw error;
    }
  }, []);

  const updateWaitingListEntry = useCallback(async (id: number, updates: Partial<WaitingListEntry>) => {
    try {
      await firebaseService.waitingList.updateWaitingListEntry(id, updates);
      console.log('✅ Wachtlijst item bijgewerkt!');
    } catch (error) {
      console.error('Error updating waiting list entry:', error);
      setError('Failed to update waiting list entry');
    }
  }, []);

  const deleteWaitingListEntry = useCallback(async (id: number) => {
    try {
      await firebaseService.waitingList.deleteWaitingListEntry(id);
      console.log('✅ Wachtlijst item verwijderd!');
    } catch (error) {
      console.error('Error deleting waiting list entry:', error);
      setError('Failed to delete waiting list entry');
    }
  }, []);

  return {
    waitingList,
    loading,
    error,
    addToWaitingList,
    updateWaitingListEntry,
    deleteWaitingListEntry
  };
};

// 📅 INTERNAL EVENTS HOOK
export const useInternalEvents = () => {
  const [internalEvents, setInternalEvents] = useState<InternalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.internalEvents.onInternalEventsChange((newEvents) => {
      setInternalEvents(newEvents);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const addInternalEvent = useCallback(async (event: Omit<InternalEvent, 'id'>) => {
    try {
      const id = await firebaseService.internalEvents.addInternalEvent(event);
      console.log('✅ Intern evenement toegevoegd!');
      return id;
    } catch (error) {
      console.error('Error adding internal event:', error);
      setError('Failed to add internal event');
      throw error;
    }
  }, []);

  const updateInternalEvent = useCallback(async (id: string, updates: Partial<InternalEvent>) => {
    try {
      await firebaseService.internalEvents.updateInternalEvent(id, updates);
      console.log('✅ Intern evenement bijgewerkt!');
    } catch (error) {
      console.error('Error updating internal event:', error);
      setError('Failed to update internal event');
    }
  }, []);

  const deleteInternalEvent = useCallback(async (id: string) => {
    try {
      await firebaseService.internalEvents.deleteInternalEvent(id);
      console.log('✅ Intern evenement verwijderd!');
    } catch (error) {
      console.error('Error deleting internal event:', error);
      setError('Failed to delete internal event');
    }
  }, []);

  return {
    internalEvents,
    loading,
    error,
    addInternalEvent,
    updateInternalEvent,
    deleteInternalEvent
  };
};

// ⚙️ APP CONFIG HOOK
export const useAppConfig = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.config.onConfigChange((newConfig) => {
      setConfig(newConfig);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const updateConfig = useCallback(async (updates: Partial<AppConfig>) => {
    try {
      await firebaseService.config.updateConfig(updates as AppConfig);
      console.log('✅ Configuratie bijgewerkt!');
    } catch (error) {
      console.error('Error updating config:', error);
      setError('Failed to update config');
    }
  }, []);

  const initializeConfig = useCallback(async (initialConfig: AppConfig) => {
    try {
      await firebaseService.config.initializeConfig(initialConfig);
      console.log('✅ Configuratie geïnitialiseerd!');
    } catch (error) {
      console.error('Error initializing config:', error);
      setError('Failed to initialize config');
    }
  }, []);

  return {
    config,
    loading,
    error,
    updateConfig,
    initializeConfig
  };
};

//  MAIN FIREBASE DATA HOOK - COMBINES ALL HOOKS
export const useFirebaseData = () => {
  const shows = useShows();
  const reservations = useReservations();
  const waitingList = useWaitingList();
  const internalEvents = useInternalEvents();
  const config = useAppConfig();

  return {
    shows,
    reservations,
    waitingList,
    internalEvents,
    config
  };
};
