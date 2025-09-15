import React from 'react';
import { AdminButton } from '../layout';
import { Icon } from '../ui/Icon';

interface AdminModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen = true,
  onClose,
  title,
  subtitle,
  size = 'md',
  className = '',
  children,
  footer,
  actions
}) => {
  if (isOpen === false) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div 
        className={`admin-modal-content ${sizeClasses[size]} ${className}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div className="flex-1">
            <h3 className="admin-modal-title">{title}</h3>
            {subtitle && (
              <p className="admin-modal-subtitle">{subtitle}</p>
            )}
          </div>
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="admin-modal-close"
            icon={<Icon id="close" />}
            aria-label="Sluiten"
          />
        </div>

        <div className="admin-modal-body">
          {children}
        </div>

        {(footer || actions) && (
          <div className="admin-modal-footer">
            {actions || footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Form components for use in modals
interface AdminFormGroupProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
}

export const AdminFormGroup: React.FC<AdminFormGroupProps> = ({
  label,
  htmlFor,
  required,
  error,
  helpText,
  children,
  className = ''
}) => {
  return (
    <div className={`admin-form-group ${className}`}>
      <label 
        htmlFor={htmlFor}
        className={`admin-label ${required ? 'required' : ''}`}
      >
        {label}
        {required && <span className="text-admin-danger ml-1">*</span>}
      </label>
      {helpText && (
        <p className="admin-form-help text-admin-text-secondary text-sm mb-xs">
          {helpText}
        </p>
      )}
      {children}
      {error && (
        <p className="admin-form-error text-admin-danger text-sm mt-xs">
          {error}
        </p>
      )}
    </div>
  );
};

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const AdminInput: React.FC<AdminInputProps> = ({
  className = '',
  error,
  ...props
}) => {
  return (
    <input
      className={`admin-input ${error ? 'border-admin-danger' : ''} ${className}`}
      {...props}
    />
  );
};

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const AdminSelect: React.FC<AdminSelectProps> = ({
  className = '',
  error,
  children,
  ...props
}) => {
  return (
    <select
      className={`admin-select ${error ? 'border-admin-danger' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const AdminTextarea: React.FC<AdminTextareaProps> = ({
  className = '',
  error,
  ...props
}) => {
  return (
    <textarea
      className={`admin-textarea ${error ? 'border-admin-danger' : ''} ${className}`}
      {...props}
    />
  );
};
