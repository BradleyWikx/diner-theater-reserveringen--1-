// Central export point for all Zustand stores
// Provides easy access to all application stores

import { useReservationStore } from './reservationStore';
import { useShowStore } from './showStore';
import { useUserStore } from './userStore';

export { useReservationStore, useShowStore, useUserStore };

// Store hooks for easier testing and mocking
export const useStores = () => {
  const reservations = useReservationStore();
  const shows = useShowStore();
  const user = useUserStore();
  
  return {
    reservations,
    shows,
    user,
  };
};

// Reset all stores (useful for testing or logout)
export const resetAllStores = () => {
  const { setReservations, clearError: clearReservationError } = useReservationStore.getState();
  const { setShows, clearError: clearShowError } = useShowStore.getState();
  const { logout } = useUserStore.getState();
  
  setReservations([]);
  clearReservationError();
  setShows([]);
  clearShowError();
  logout();
};
