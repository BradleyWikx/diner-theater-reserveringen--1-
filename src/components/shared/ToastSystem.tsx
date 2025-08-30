import React, { useState, useEffect } from 'react';
import { AdminButton } from '../layout';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);

    // Auto dismiss
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseClasses = "flex items-start gap-3 p-4 rounded-lg shadow-lg border transition-all duration-300 transform max-w-md";
    
    if (isLeaving) {
      return `${baseClasses} translate-x-full opacity-0`;
    }
    
    if (!isVisible) {
      return `${baseClasses} translate-x-full opacity-0`;
    }

    const typeStyles = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800"
    };

    return `${baseClasses} translate-x-0 opacity-100 ${typeStyles[toast.type]}`;
  };

  const getIcon = () => {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️"
    };
    return icons[toast.type];
  };

  return (
    <div className={getToastStyles()}>
      <div className="text-xl flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">
          {toast.title}
        </h4>
        
        {toast.message && (
          <p className="text-sm opacity-90 mt-1">
            {toast.message}
          </p>
        )}
        
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium underline mt-2 hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={handleDismiss}
        className="text-lg font-bold opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  onDismiss, 
  position = 'top-right' 
}) => {
  const getPositionStyles = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    return positions[position];
  };

  return (
    <div className={`fixed z-50 ${getPositionStyles()}`}>
      <div className="space-y-2">
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
};

// Toast Context
interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string, options?: Partial<Toast>) => void;
  error: (title: string, message?: string, options?: Partial<Toast>) => void;
  warning: (title: string, message?: string, options?: Partial<Toast>) => void;
  info: (title: string, message?: string, options?: Partial<Toast>) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      id: generateId(),
      ...toast
    };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = React.useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: 'success', title, message, ...options });
  }, [addToast]);

  const error = React.useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: 'error', title, message, duration: 8000, ...options });
  }, [addToast]);

  const warning = React.useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: 'warning', title, message, duration: 6000, ...options });
  }, [addToast]);

  const info = React.useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: 'info', title, message, ...options });
  }, [addToast]);

  const value = React.useMemo(() => ({
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }), [addToast, removeToast, success, error, warning, info]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Utility hooks for common toast patterns
export const useApiToast = () => {
  const toast = useToast();

  const apiSuccess = React.useCallback((action: string, item?: string) => {
    toast.success(
      `${action} Successful`,
      item ? `${item} has been ${action.toLowerCase()} successfully` : undefined
    );
  }, [toast]);

  const apiError = React.useCallback((action: string, error: Error, item?: string) => {
    toast.error(
      `${action} Failed`,
      item 
        ? `Failed to ${action.toLowerCase()} ${item}: ${error.message}`
        : error.message
    );
  }, [toast]);

  const apiLoading = React.useCallback((action: string, item?: string) => {
    toast.info(
      `${action} In Progress`,
      item ? `${action}ing ${item}...` : undefined,
      { duration: 0 } // Don't auto-dismiss loading toasts
    );
  }, [toast]);

  return { apiSuccess, apiError, apiLoading };
};

export default { ToastProvider, useToast, useApiToast };
