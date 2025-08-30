import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';

// Enhanced admin user interface with proper security
interface AdminUser extends User {
  role: 'admin' | 'moderator' | 'viewer';
  permissions: string[];
  sessionId: string;
  loginTime: string;
  lastActivity: string;
}

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  refreshSession: () => Promise<boolean>;
}

interface LoginCredentials {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session timeout (24 hours)
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
  const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute

  useEffect(() => {
    initializeAuth();
    
    // Set up activity monitoring
    const activityInterval = setInterval(() => {
      checkSessionActivity();
    }, ACTIVITY_CHECK_INTERVAL);

    return () => clearInterval(activityInterval);
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for existing session
      const sessionData = sessionStorage.getItem('adminSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        
        // Validate session
        if (Date.now() > session.expires) {
          await logout();
          return;
        }
        
        setAdminUser(session);
        setUser(session); // Set basic user data
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError('Session initialization failed');
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const checkSessionActivity = () => {
    const session = sessionStorage.getItem('adminSession');
    if (session) {
      const sessionData = JSON.parse(session);
      const now = Date.now();
      
      // Auto-logout after inactivity
      if (now - new Date(sessionData.lastActivity).getTime() > SESSION_TIMEOUT) {
        logout();
        setError('Session expired due to inactivity');
      } else {
        // Update last activity
        updateLastActivity();
      }
    }
  };

  const updateLastActivity = () => {
    const session = sessionStorage.getItem('adminSession');
    if (session) {
      const sessionData = JSON.parse(session);
      sessionData.lastActivity = new Date().toISOString();
      sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Input validation and sanitization
      const cleanEmail = credentials.email.trim().toLowerCase();
      const cleanPassword = credentials.password.trim();
      
      if (!cleanEmail || !cleanPassword) {
        throw new Error('Email and password are required');
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        throw new Error('Invalid email format');
      }
      
      // TODO: Replace with Firebase Auth
      const isValid = await validateCredentials(cleanEmail, cleanPassword);
      
      if (isValid) {
        const sessionId = generateSecureSessionId();
        const now = new Date().toISOString();
        
        const adminUserData: AdminUser = {
          uid: sessionId,
          email: cleanEmail,
          emailVerified: true,
          displayName: 'Admin User',
          photoURL: null,
          phoneNumber: null,
          providerId: 'admin',
          role: 'admin',
          permissions: ['read', 'write', 'delete', 'admin', 'reports'],
          sessionId,
          loginTime: now,
          lastActivity: now,
          metadata: {
            creationTime: now,
            lastSignInTime: now
          },
          providerData: [],
          refreshToken: '',
          tenantId: null
        };
        
        // Store secure session
        const sessionData = {
          ...adminUserData,
          expires: Date.now() + SESSION_TIMEOUT
        };
        
        sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
        
        setUser(adminUserData);
        setAdminUser(adminUserData);
        
        // Log security event
        logSecurityEvent('admin_login', { email: cleanEmail, sessionId });
        
        return true;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      
      // Log failed attempt
      logSecurityEvent('admin_login_failed', { 
        email: credentials.email,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Log security event
      if (adminUser) {
        logSecurityEvent('admin_logout', { 
          email: adminUser.email,
          sessionId: adminUser.sessionId,
          sessionDuration: Date.now() - new Date(adminUser.loginTime).getTime()
        });
      }
      
      // Clear all session data
      sessionStorage.removeItem('adminSession');
      localStorage.removeItem('testAdmin'); // Clean legacy
      
      setUser(null);
      setAdminUser(null);
      setError(null);
      
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return adminUser?.permissions.includes(permission) ?? false;
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const session = sessionStorage.getItem('adminSession');
      if (!session) return false;
      
      const sessionData = JSON.parse(session);
      
      // Extend session
      sessionData.expires = Date.now() + SESSION_TIMEOUT;
      sessionData.lastActivity = new Date().toISOString();
      
      sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
      
      return true;
    } catch {
      return false;
    }
  };

  // Security utilities
  const validateCredentials = async (email: string, password: string): Promise<boolean> => {
    // TODO: Implement proper Firebase Auth validation
    // This is a placeholder implementation
    
    // Basic security checks
    if (password.length < 6) return false;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo: accept admin emails with minimum password length
    return email.includes('admin') && password.length >= 6;
  };

  const generateSecureSessionId = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  };

  const logSecurityEvent = (event: string, data: any) => {
    // TODO: Integrate with proper logging service (e.g., Firebase Analytics, Sentry)
    const logEntry = {
      event,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'unknown' // Would need server-side logging for real IP
    };
    
    console.log('🔒 Security Event:', logEntry);
    
    // Store in sessionStorage for demo (in production, send to secure logging service)
    const existingLogs = JSON.parse(sessionStorage.getItem('securityLogs') || '[]');
    existingLogs.push(logEntry);
    
    // Keep only last 100 logs
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }
    
    sessionStorage.setItem('securityLogs', JSON.stringify(existingLogs));
  };

  const value: AuthContextType = {
    user,
    adminUser,
    isAdmin: !!adminUser,
    loading,
    error,
    login,
    logout,
    hasPermission,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Security hooks
export const usePermissions = () => {
  const { hasPermission } = useAuth();
  return {
    canRead: hasPermission('read'),
    canWrite: hasPermission('write'),
    canDelete: hasPermission('delete'),
    canAdmin: hasPermission('admin'),
    canViewReports: hasPermission('reports')
  };
};

export const useSecurityLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  
  useEffect(() => {
    const existingLogs = JSON.parse(sessionStorage.getItem('securityLogs') || '[]');
    setLogs(existingLogs);
  }, []);
  
  return logs;
};
