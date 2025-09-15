// Custom hooks for store integration with Firebase services
// Provides convenient hooks that combine Zustand stores with Firebase operations

import { useEffect } from 'react';
import { useReservationStore, useShowStore, useUserStore } from '../stores';
import { ShowEventsService, ReservationsService } from '../services';

// Hook to manage reservations with Firebase integration
export const useReservations = () => {
  const store = useReservationStore();
  
  // Load reservations from Firebase
  const loadReservations = async () => {
    try {
      store.setLoading(true);
      store.clearError();
      
      const reservationsService = new ReservationsService();
      const reservations = await reservationsService.getAllReservations();
      
      store.setReservations(reservations);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to load reservations');
    } finally {
      store.setLoading(false);
    }
  };
  
  // Create new reservation
  const createReservation = async (reservationData: any) => {
    try {
      store.setLoading(true);
      store.clearError();
      
      const reservationsService = new ReservationsService();
      const newReservation = await reservationsService.addReservation(reservationData);
      
      store.addReservation(newReservation);
      return newReservation;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to create reservation');
      throw error;
    } finally {
      store.setLoading(false);
    }
  };
  
  // Update existing reservation
  const updateReservation = async (id: string, updates: any) => {
    try {
      store.setLoading(true);
      store.clearError();
      
      const reservationsService = new ReservationsService();
      const updatedReservation = await reservationsService.updateReservation(id, updates);
      
      store.updateReservation(id, updatedReservation);
      return updatedReservation;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to update reservation');
      throw error;
    } finally {
      store.setLoading(false);
    }
  };
  
  // Delete reservation
  const deleteReservation = async (id: string) => {
    try {
      store.setLoading(true);
      store.clearError();
      
      const reservationsService = new ReservationsService();
      await reservationsService.deleteReservation(id);
      
      store.deleteReservation(id);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to delete reservation');
      throw error;
    } finally {
      store.setLoading(false);
    }
  };
  
  return {
    ...store,
    loadReservations,
    createReservation,
    updateReservation,
    deleteReservation,
  };
};

// Hook to manage shows with Firebase integration
export const useShows = () => {
  const store = useShowStore();
  
  // Load shows from Firebase
  const loadShows = async () => {
    try {
      store.setLoading(true);
      store.clearError();
      
      const showsService = new ShowEventsService();
      const shows = await showsService.getAllShows();
      
      store.setShows(shows);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to load shows');
    } finally {
      store.setLoading(false);
    }
  };
  
  // Create new show
  const createShow = async (showData: any) => {
    try {
      store.setLoading(true);
      store.clearError();
      
      const showsService = new ShowEventsService();
      const newShow = await showsService.addShow(showData);
      
      store.addShow(newShow);
      return newShow;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to create show');
      throw error;
    } finally {
      store.setLoading(false);
    }
  };
  
  return {
    ...store,
    loadShows,
    createShow,
  };
};

// Hook for user authentication and profile management
export const useAuth = () => {
  const store = useUserStore();
  
  return {
    ...store,
    // Auth methods would be implemented here
  };
};
