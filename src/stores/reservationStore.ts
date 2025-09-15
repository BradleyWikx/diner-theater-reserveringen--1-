// Zustand store for Reservations Management
// Handles all reservation-related state and operations

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Reservation, WaitingListEntry } from '../types/types';

interface ReservationState {
  // State
  reservations: Reservation[];
  waitingList: WaitingListEntry[];
  isLoading: boolean;
  error: string | null;
  selectedReservation: Reservation | null;
  
  // Actions
  setReservations: (reservations: Reservation[]) => void;
  setWaitingList: (waitingList: WaitingListEntry[]) => void;
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  selectReservation: (reservation: Reservation | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Computed getters
  getReservationById: (id: string) => Reservation | undefined;
  getReservationsByDate: (date: string) => Reservation[];
  getReservationsByStatus: (status: string) => Reservation[];
  getTotalGuestsForDate: (date: string) => number;
}

export const useReservationStore = create<ReservationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      reservations: [],
      waitingList: [],
      isLoading: false,
      error: null,
      selectedReservation: null,
      
      // Actions
      setReservations: (reservations) => 
        set({ reservations }, false, 'setReservations'),
      
      setWaitingList: (waitingList) =>
        set({ waitingList }, false, 'setWaitingList'),

      addReservation: (reservation) =>
        set(
          (state) => ({
            reservations: [...state.reservations, reservation]
          }),
          false,
          'addReservation'
        ),
      
      updateReservation: (id, updates) =>
        set(
          (state) => ({
            reservations: state.reservations.map((res) =>
              res.id === id ? { ...res, ...updates } : res
            )
          }),
          false,
          'updateReservation'
        ),
      
      deleteReservation: (id) =>
        set(
          (state) => ({
            reservations: state.reservations.filter((res) => res.id !== id),
            selectedReservation: 
              state.selectedReservation?.id === id ? null : state.selectedReservation
          }),
          false,
          'deleteReservation'
        ),
      
      selectReservation: (reservation) =>
        set({ selectedReservation: reservation }, false, 'selectReservation'),
      
      setLoading: (isLoading) =>
        set({ isLoading }, false, 'setLoading'),
      
      setError: (error) =>
        set({ error }, false, 'setError'),
      
      clearError: () =>
        set({ error: null }, false, 'clearError'),
      
      // Computed getters
      getReservationById: (id) =>
        get().reservations.find((res) => res.id === id),
      
      getReservationsByDate: (date) =>
        get().reservations.filter((res) => res.date === date),
      
      getReservationsByStatus: (status) =>
        get().reservations.filter((res) => res.status === status),
      
      getTotalGuestsForDate: (date) =>
        get().reservations
          .filter((res) => res.date === date && res.status !== 'cancelled')
          .reduce((total, res) => total + res.guests, 0),
    }),
    {
      name: 'reservation-store',
    }
  )
);
