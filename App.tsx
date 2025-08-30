import React, { Suspense } from 'react';
import { ToastProvider } from './src/components/shared/ToastSystem';
import PremiumDashboard from './PremiumDashboard';
import './src/styles/admin-design-system.css';
import './index.css';

// Enhanced Main App with error boundaries and toast notifications
const App: React.FC = () => {
  return (
    <ToastProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-admin-primary mx-auto"></div>
            <p className="mt-4 text-admin-text-secondary">Loading Admin Panel...</p>
          </div>
        </div>
      }>
        <PremiumDashboard />
      </Suspense>
    </ToastProvider>
  );
};

export default App;
