// Firebase Context Provider for Dinner Theater Reservation System
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useFirebaseData } from '../hooks/firebase/useFirebaseData';
import { migrationService } from '../utils/migration/dataMigration';
import { AppConfig } from '../types/types';

interface FirebaseContextType {
  // Firebase data hooks
  firebaseData: ReturnType<typeof useFirebaseData>;
  
  // Migration utilities
  migrateLocalData: (localData: any) => Promise<{ success: boolean; errors: string[] }>;
  validateMigration: () => Promise<any>;
  createBackup: () => Promise<any>;
  
  // App initialization
  isInitialized: boolean;
  initializeApp: (defaultConfig: AppConfig) => Promise<void>;
  
  // Connection status
  isConnected: boolean;
  connectionError: string | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
  defaultConfig?: AppConfig;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ 
  children, 
  defaultConfig 
}) => {
  const firebaseData = useFirebaseData();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize Firebase connection and check if config exists
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        setConnectionError(null);
        
        // Assume Firebase is healthy if we can load the hook without error
        setIsConnected(true);
        
        // Check if config exists, if not and we have defaultConfig, initialize it
        if (!firebaseData.config.config && !firebaseData.config.loading) {
          if (defaultConfig) {
            
            // await firebaseData.config.initializeConfig(defaultConfig);
          } else {
            
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        
        setConnectionError(`Firebase connection failed: ${error}`);
        setIsConnected(false);
        setIsInitialized(true); // Still set to true so app can render with offline fallback
      }
    };

    initializeFirebase();
  }, [firebaseData.config.config, firebaseData.config.loading, defaultConfig]);

  const migrateLocalData = async (localData: any): Promise<{ success: boolean; errors: string[] }> => {
    try {
      const result = await migrationService.migrateLocalDataToFirebase(localData);
      
      // Generate and log migration report
      const report = migrationService.generateMigrationReport(localData, result);
      
      
      return result;
    } catch (error) {
      
      return { success: false, errors: [`Migration failed: ${error}`] };
    }
  };

  const validateMigration = async () => {
    try {
      return await migrationService.validateMigration();
    } catch (error) {
      
      throw error;
    }
  };

  const createBackup = async () => {
    try {
      return await migrationService.createFirebaseBackup();
    } catch (error) {
      
      throw error;
    }
  };

  const initializeApp = async (config: AppConfig) => {
    try {
      // await firebaseData.config.initializeConfig(config);
      setIsInitialized(true);
    } catch (error) {
      
      throw error;
    }
  };

  const contextValue: FirebaseContextType = {
    firebaseData,
    migrateLocalData,
    validateMigration,
    createBackup,
    isInitialized,
    initializeApp,
    isConnected,
    connectionError
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

// Hook for checking if Firebase is ready to use
export const useFirebaseReady = (): boolean => {
  const { isInitialized, isConnected } = useFirebase();
  return isInitialized && isConnected;
};

// Hook for handling offline/online states
export const useFirebaseStatus = () => {
  const { isConnected, connectionError, isInitialized } = useFirebase();
  
  return {
    isOnline: isConnected,
    isOffline: !isConnected,
    error: connectionError,
    isInitialized,
    status: isInitialized 
      ? (isConnected ? 'online' : 'offline') 
      : 'initializing'
  };
};
