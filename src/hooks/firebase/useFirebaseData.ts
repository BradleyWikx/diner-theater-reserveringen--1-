// Firebase React Hooks for Dinner Theater Reservation System
import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '../../services/firebaseService';
import { 
  ShowEvent, 
  Reservation, 
  WaitingListEntry, 
  InternalEvent, 
  AppConfig
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
    } catch (error) {
      setError('Failed to add shows');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateShow = useCallback(async (id: string, updates: Partial<ShowEvent>) => {
    try {
      await firebaseService.shows.updateShow(id, updates);
    } catch (error) {
      setError('Failed to update show');
    }
  }, []);

  const deleteShow = useCallback(async (id: string) => {
    try {
      await firebaseService.shows.deleteShow(id);
    } catch (error) {
      setError('Failed to delete show');
    }
  }, []);

  const bulkDeleteShows = useCallback(async (criteria: { type: 'name' | 'type' | 'date', value: string }) => {
    try {
      setLoading(true);
      await firebaseService.shows.bulkDeleteShows(criteria);
    } catch (error) {
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
    const unsubscribe = firebaseService.reservations.onReservationsChange((newReservations) => {
      setReservations(newReservations);
      setLoading(false);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addReservation = useCallback(async (reservation: Omit<Reservation, 'id'>) => {
    try {
      const id = await firebaseService.reservations.addReservation(reservation);
      return id;
    } catch (error) {
      setError('Failed to add reservation');
      throw error;
    }
  }, []);

  const updateReservation = useCallback(async (id: string, updates: Partial<Reservation>) => {
    try {
      await firebaseService.reservations.updateReservation(id, updates);
    } catch (error) {
      setError('Failed to update reservation');
    }
  }, []);

  const deleteReservation = useCallback(async (id: string) => {
    try {
      await firebaseService.reservations.deleteReservation(id);
    } catch (error) {
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

// 📝 WAITING LIST HOOK
export const useWaitingList = () => {
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.waitingList.onWaitingListChange((newEntries) => {
      setWaitingList(newEntries);
      setLoading(false);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addToWaitingList = useCallback(async (entry: Omit<WaitingListEntry, 'id'>) => {
    try {
      const id = await firebaseService.waitingList.addWaitingListEntry(entry);
      return id;
    } catch (error) {
      setError('Failed to add to waiting list');
      throw error;
    }
  }, []);

  const updateWaitingListEntry = useCallback(async (id: string, updates: Partial<WaitingListEntry>) => {
    try {
      await firebaseService.waitingList.updateWaitingListEntry(id, updates);
    } catch (error) {
      setError('Failed to update waiting list entry');
    }
  }, []);

  const deleteWaitingListEntry = useCallback(async (id: string) => {
    try {
      await firebaseService.waitingList.deleteWaitingListEntry(id);
    } catch (error) {
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
      return id;
    } catch (error) {
      setError('Failed to add internal event');
      throw error;
    }
  }, []);

  const updateInternalEvent = useCallback(async (id: string, updates: Partial<InternalEvent>) => {
    try {
      await firebaseService.internalEvents.updateInternalEvent(id, updates);
    } catch (error) {
      setError('Failed to update internal event');
    }
  }, []);

  const deleteInternalEvent = useCallback(async (id: string) => {
    try {
      await firebaseService.internalEvents.deleteInternalEvent(id);
    } catch (error) {
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
      // Get current config and merge with updates
      if (config) {
        const fullConfig = { ...config, ...updates };
        await firebaseService.config.updateConfig(fullConfig);
      }
    } catch (error) {
      setError('Failed to update config');
    }
  }, [config]);

  return {
    config,
    loading,
    error,
    updateConfig
  };
};

// 🔥 MAIN FIREBASE DATA HOOK - COMBINES ALL HOOKS
export const useFirebaseData = () => {
  const shows = useShows();
  const reservations = useReservations();
  const waitingList = useWaitingList();
  const internalEvents = useInternalEvents();
  const config = useAppConfig();

  // Simple mock promoCodes service to resolve runtime error
  const promoCodes = {
    promoCodes: [],
    loading: false,
    error: null,
    addPromoCode: async () => {},
    updatePromoCode: async () => {},
    deletePromoCode: async () => {},
    validatePromoCode: async (code: string) => {
      // Mock promo code validation
      return null; // No valid promo codes for now
    }
  };

  return {
    shows,
    reservations,
    waitingList,
    internalEvents,
    config,
    promoCodes
  };
};
