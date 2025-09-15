// Zustand store for User Authentication and Information
// Handles user state, authentication, and app configuration

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AppConfig, Customer } from '../types/types';

interface UserState {
  // Authentication state
  isAuthenticated: boolean;
  user: {
    uid: string;
    email: string;
    role: 'admin' | 'staff' | 'customer';
    displayName?: string;
  } | null;
  
  // App configuration
  config: AppConfig | null;
  
  // Customer data (when logged in as customer)
  customerProfile: Customer | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: UserState['user']) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setConfig: (config: AppConfig) => void;
  setCustomerProfile: (customer: Customer | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Computed getters
  isAdmin: () => boolean;
  isStaff: () => boolean;
  isCustomer: () => boolean;
  hasRole: (role: string) => boolean;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isAuthenticated: false,
        user: null,
        config: null,
        customerProfile: null,
        isLoading: false,
        error: null,
        
        // Actions
        setUser: (user) =>
          set({ user, isAuthenticated: !!user }, false, 'setUser'),
        
        setAuthenticated: (isAuthenticated) =>
          set({ isAuthenticated }, false, 'setAuthenticated'),
        
        setConfig: (config) =>
          set({ config }, false, 'setConfig'),
        
        setCustomerProfile: (customerProfile) =>
          set({ customerProfile }, false, 'setCustomerProfile'),
        
        logout: () =>
          set({
            isAuthenticated: false,
            user: null,
            customerProfile: null,
            error: null
          }, false, 'logout'),
        
        setLoading: (isLoading) =>
          set({ isLoading }, false, 'setLoading'),
        
        setError: (error) =>
          set({ error }, false, 'setError'),
        
        clearError: () =>
          set({ error: null }, false, 'clearError'),
        
        // Computed getters
        isAdmin: () => get().user?.role === 'admin',
        isStaff: () => get().user?.role === 'staff',
        isCustomer: () => get().user?.role === 'customer',
        hasRole: (role) => get().user?.role === role,
      }),
      {
        name: 'user-store',
        // Only persist authentication state, not sensitive data
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          user: state.user ? {
            uid: state.user.uid,
            email: state.user.email,
            role: state.user.role,
            displayName: state.user.displayName
          } : null,
        }),
      }
    ),
    {
      name: 'user-store',
    }
  )
);
