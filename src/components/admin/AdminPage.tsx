import React from 'react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: string;
  loading?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  actions,
  icon = '🎭',
  loading = false
}) => {
  return (
    <header className="admin-content-header">
      <div className="header-info">
        <h1 className="page-title">
          <span className="mr-3">{icon}</span>
          {title}
          {loading && (
            <div className="inline-flex items-center ml-3">
              <div className="admin-btn-spinner" style={{ width: '1.5rem', height: '1.5rem' }}></div>
            </div>
          )}
        </h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && (
        <div className="header-actions">
          {actions}
        </div>
      )}
    </header>
  );
};

interface AdminPageProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: string;
  loading?: boolean;
  className?: string;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  children,
  title,
  subtitle,
  actions,
  icon,
  loading = false,
  className = ''
}) => {
  return (
    <div className={`admin-layout-wrapper ${className}`}>
      <AdminHeader
        title={title}
        subtitle={subtitle}
        actions={actions}
        icon={icon}
        loading={loading}
      />
      <div className="admin-content-body">
        {children}
      </div>
    </div>
  );
};

export default AdminPage;
