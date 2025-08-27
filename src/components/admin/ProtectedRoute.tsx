import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../UI/Icon';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAdmin, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner"></div>
          <h3>🔐 Authenticatie controleren...</h3>
          <p>Even geduld, we controleren je toegangsrechten.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <div className="access-denied-icon">
            <Icon id="shield-x" />
          </div>
          <h2>🚫 Toegang Geweigerd</h2>
          <p>Je hebt geen beheerderrechten om deze pagina te bekijken.</p>
          {user ? (
            <div className="user-info">
              <p>Ingelogd als: <strong>{user.email}</strong></p>
              <p>Deze pagina is alleen toegankelijk voor geautoriseerde beheerders.</p>
            </div>
          ) : (
            <p>Log in met een beheerdersaccount om toegang te krijgen.</p>
          )}
          <button onClick={() => window.location.href = '/'} className="btn-primary">
            <Icon id="home" />
            Terug naar Home
          </button>
        </div>

        <style jsx>{`
          .access-denied {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }

          .access-denied-content {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 500px;
            width: 100%;
          }

          .access-denied-icon {
            font-size: 64px;
            margin-bottom: 20px;
            color: #e74c3c;
          }

          .access-denied h2 {
            color: #2c3e50;
            margin-bottom: 16px;
            font-size: 24px;
          }

          .access-denied p {
            color: #7f8c8d;
            margin-bottom: 16px;
            line-height: 1.6;
          }

          .user-info {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3498db;
          }

          .user-info strong {
            color: #2c3e50;
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
};

// Loading screen styles
const LoadingScreenStyles = () => (
  <style jsx global>{`
    .loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .loading-content {
      text-align: center;
      color: white;
    }

    .loading-content h3 {
      margin: 20px 0 10px;
      font-size: 20px;
    }

    .loading-content p {
      opacity: 0.8;
      font-size: 14px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `}</style>
);
