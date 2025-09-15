// Zustand store for Shows Management
// Handles all show-related state and operations

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ShowEvent } from '../types/types';

interface ShowState {
  // State
  showEvents: ShowEvent[];
  isLoading: boolean;
  error: string | null;
  selectedShow: ShowEvent | null;
  
  // Actions
  setShowEvents: (shows: ShowEvent[]) => void;
  addShow: (show: ShowEvent) => void;
  updateShow: (id: string, updates: Partial<ShowEvent>) => void;
  deleteShow: (id: string) => void;
  selectShow: (show: ShowEvent | null) => void;
  toggleShowStatus: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Computed getters
  getShowById: (id: string) => ShowEvent | undefined;
  getShowsByDate: (date: string) => ShowEvent[];
  getShowsByType: (type: string) => ShowEvent[];
  getAvailableShows: () => ShowEvent[];
  getClosedShows: () => ShowEvent[];
  getUpcomingShows: (days?: number) => ShowEvent[];
}

export const useShowStore = create<ShowState>()(
  devtools(
    (set, get) => ({
      // Initial state
      showEvents: [],
      isLoading: false,
      error: null,
      selectedShow: null,
      
      // Actions
      setShowEvents: (shows) => 
        set({ showEvents: shows }, false, 'setShows'),
      
      addShow: (show) =>
        set(
          (state) => ({
            showEvents: [...state.showEvents, show]
          }),
          false,
          'addShow'
        ),
      
      updateShow: (id, updates) =>
        set(
          (state) => ({
            showEvents: state.showEvents.map((show) =>
              show.id === id ? { ...show, ...updates } : show
            )
          }),
          false,
          'updateShow'
        ),
      
      deleteShow: (id) =>
        set(
          (state) => ({
            showEvents: state.showEvents.filter((show) => show.id !== id),
            selectedShow: 
              state.selectedShow?.id === id ? null : state.selectedShow
          }),
          false,
          'deleteShow'
        ),
      
      selectShow: (show) =>
        set({ selectedShow: show }, false, 'selectShow'),
      
      toggleShowStatus: (id) =>
        set(
          (state) => ({
            showEvents: state.showEvents.map((show) =>
              show.id === id ? { ...show, isClosed: !show.isClosed } : show
            )
          }),
          false,
          'toggleShowStatus'
        ),
      
      setLoading: (isLoading) =>
        set({ isLoading }, false, 'setLoading'),
      
      setError: (error) =>
        set({ error }, false, 'setError'),
      
      clearError: () =>
        set({ error: null }, false, 'clearError'),
      
      // Computed getters
      getShowById: (id) =>
        get().showEvents.find((show) => show.id === id),
      
      getShowsByDate: (date) =>
        get().showEvents.filter((show) => show.date === date),
      
      getShowsByType: (type) =>
        get().showEvents.filter((show) => show.type === type),
      
      getAvailableShows: () =>
        get().showEvents.filter((show) => !show.isClosed),
      
      getClosedShows: () =>
        get().showEvents.filter((show) => show.isClosed),
      
      getUpcomingShows: (days = 30) => {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        
        return get().showEvents.filter((show) => {
          const showDate = new Date(show.date);
          return showDate >= today && showDate <= futureDate;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },
    }),
    {
      name: 'show-store',
    }
  )
);
