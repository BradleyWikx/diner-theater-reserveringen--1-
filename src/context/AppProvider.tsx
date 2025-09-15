// Main Application Provider
// Combines all context providers and application setup

import React from 'react';
import '../i18n'; // Initialize i18n
import { ToastProvider } from './ToastProvider';
import { FirebaseProvider } from './FirebaseProvider';
import { AuthProvider } from './AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseProvider>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </FirebaseProvider>
    </QueryClientProvider>
  );
};
