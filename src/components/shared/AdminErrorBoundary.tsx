import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AdminCard, AdminButton } from '../layout';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    
    
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to monitoring service (in production)
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Store in sessionStorage for demo (production: send to error tracking service)
    const existingErrors = JSON.parse(sessionStorage.getItem('errorLogs') || '[]');
    existingErrors.push(errorLog);
    
    // Keep only last 50 errors
    if (existingErrors.length > 50) {
      existingErrors.splice(0, existingErrors.length - 50);
    }
    
    sessionStorage.setItem('errorLogs', JSON.stringify(existingErrors));
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReport = () => {
    const errorData = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    };
    
    // Copy to clipboard for easy reporting
    navigator.clipboard.writeText(JSON.stringify(errorData, null, 2)).then(() => {
      alert('Error details copied to clipboard');
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4">
          <AdminCard title="⚠️ Something went wrong" variant="default" className="max-w-2xl">
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Application Error
                </h3>
                <p className="text-red-700 mb-2">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                <p className="text-sm text-red-600">
                  The admin panel encountered an error and couldn't recover automatically.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <summary className="cursor-pointer font-medium text-gray-800 mb-2">
                    Technical Details (Development Only)
                  </summary>
                  <pre className="text-xs text-gray-600 overflow-auto max-h-64 whitespace-pre-wrap">
                    {this.state.error?.stack}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-wrap gap-2">
                <AdminButton
                  variant="primary"
                  onClick={this.handleRetry}
                >
                  Try Again
                </AdminButton>
                
                <AdminButton
                  variant="secondary"
                  onClick={this.handleReload}
                >
                  Reload Page
                </AdminButton>
                
                <AdminButton
                  variant="ghost"
                  onClick={this.handleReport}
                >
                  Copy Error Details
                </AdminButton>
              </div>

              <div className="text-xs text-gray-500 pt-4 border-t">
                <p>• Error logged at: {new Date().toLocaleString()}</p>
                <p>• Session ID: {sessionStorage.getItem('adminSession') ? JSON.parse(sessionStorage.getItem('adminSession')!).sessionId : 'N/A'}</p>
                <p>• If this problem persists, please contact support</p>
              </div>
            </div>
          </AdminCard>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for error reporting
export const useErrorHandler = () => {
  const reportError = (error: Error, context?: string) => {
    
    
    const errorLog = {
      message: error.message,
      stack: error.stack,
      context: context || 'Unknown',
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    const existingErrors = JSON.parse(sessionStorage.getItem('errorLogs') || '[]');
    existingErrors.push(errorLog);
    sessionStorage.setItem('errorLogs', JSON.stringify(existingErrors));
  };
  
  const handleAsyncError = async <T,>(
    asyncOperation: () => Promise<T>,
    context: string
  ): Promise<T | null> => {
    try {
      return await asyncOperation();
    } catch (error) {
      reportError(error as Error, context);
      throw error; // Re-throw to allow component-level handling
    }
  };
  
  return { reportError, handleAsyncError };
};

export default AdminErrorBoundary;
