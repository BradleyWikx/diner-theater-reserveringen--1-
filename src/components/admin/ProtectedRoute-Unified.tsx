import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminCard, AdminButton } from '../layout';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Icon } from '../UI/Icon';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAdmin, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="admin-layout-wrapper">
        <div className="flex items-center justify-center min-h-screen bg-admin-bg">
          <AdminCard 
            title="🔐 Authenticatie controleren..."
            subtitle="Even geduld, we controleren je toegangsrechten"
            variant="elevated"
            className="max-w-md text-center"
          >
            <div className="flex justify-center mb-lg">
              <LoadingSpinner size="lg" />
            </div>
            <p className="text-admin-text-secondary">
              Je wordt doorgestuurd zodra de verificatie is voltooid.
            </p>
          </AdminCard>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-layout-wrapper">
        <div className="flex items-center justify-center min-h-screen bg-admin-bg p-lg">
          <AdminCard 
            title="🚫 Geen Admin Toegang"
            subtitle={user ? `Ingelogd als: ${user.email || 'Onbekende gebruiker'}` : 'Je bent niet ingelogd als admin'}
            variant="elevated"
            className="max-w-md text-center"
          >
            <div className="mb-lg">
              <div className="dashboard-metric-icon bg-admin-danger-light text-admin-danger mx-auto mb-md">
                <Icon id="shield-x" />
              </div>
              <p className="text-admin-text-secondary mb-md">
                Deze pagina is alleen toegankelijk voor geautoriseerde admin gebruikers.
              </p>
              {!user && (
                <div className="admin-card bg-admin-info-light border-admin-info mb-md p-md rounded-md">
                  <p className="text-admin-info text-sm m-0">
                    💡 Probeer in te loggen als admin om toegang te krijgen.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-sm">
              <AdminButton 
                variant="primary"
                onClick={() => window.location.href = '/'}
                icon={<Icon id="home" />}
                className="w-full"
              >
                Terug naar Home
              </AdminButton>
              
              {!user && (
                <AdminButton 
                  variant="secondary"
                  onClick={() => window.location.href = '/?admin-login=true'}
                  icon={<Icon id="log-in" />}
                  className="w-full"
                >
                  Admin Login
                </AdminButton>
              )}
            </div>
          </AdminCard>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
