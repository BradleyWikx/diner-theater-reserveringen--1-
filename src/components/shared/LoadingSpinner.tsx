import React, { ReactNode } from 'react';

interface LoadingSpinnerProps {
    size?: string;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = '24', className = '' }) => (
    <div className={`loading-spinner ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
        <div className="spinner-ring"></div>
    </div>
);

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading: boolean;
    children: ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({ loading, children, ...props }) => (
    <button {...props} disabled={loading || props.disabled}>
        {loading ? <LoadingSpinner size="16" /> : children}
    </button>
);
