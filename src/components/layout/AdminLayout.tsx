import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  actions,
  className = ''
}) => {
  return (
    <div className={`admin-layout-wrapper ${className}`}>
      {(title || subtitle || actions) && (
        <header className="admin-content-header">
          <div className="header-info">
            {title && <h1 className="page-title">{title}</h1>}
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          {actions && (
            <div className="header-actions">
              {actions}
            </div>
          )}
        </header>
      )}
      <div className="admin-content-body">
        {children}
      </div>
    </div>
  );
};

interface AdminCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost';
}

export const AdminCard: React.FC<AdminCardProps> = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  variant = 'default'
}) => {
  return (
    <div className={`admin-card admin-card--${variant} ${className}`}>
      {(title || subtitle || actions) && (
        <div className="admin-card-header">
          <div className="card-info">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && (
            <div className="card-actions">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="admin-card-body">
        {children}
      </div>
    </div>
  );
};

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const AdminButton: React.FC<AdminButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`admin-btn admin-btn--${variant} admin-btn--${size} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className="admin-btn-spinner" />}
      {!loading && icon && <span className="admin-btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = ''
}) => {
  return (
    <span className={`admin-badge admin-badge--${variant} admin-badge--${size} ${className}`}>
      {children}
    </span>
  );
};

interface AdminGridProps {
  children: React.ReactNode;
  columns?: number | 'auto' | 'responsive';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AdminGrid: React.FC<AdminGridProps> = ({
  children,
  columns = 'responsive',
  gap = 'md',
  className = ''
}) => {
  const getGridClass = () => {
    if (typeof columns === 'number') {
      return `admin-grid-${columns}`;
    }
    return `admin-grid-${columns}`;
  };

  return (
    <div className={`admin-grid ${getGridClass()} admin-grid--gap-${gap} ${className}`}>
      {children}
    </div>
  );
};

interface AdminDataTableProps {
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
  }>;
  data: Array<Record<string, any>>;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  actions?: (row: any) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const AdminDataTable: React.FC<AdminDataTableProps> = ({
  columns,
  data,
  onSort,
  sortKey,
  sortDirection,
  actions,
  loading = false,
  emptyMessage = 'Geen gegevens beschikbaar',
  className = ''
}) => {
  const handleSort = (key: string) => {
    if (!onSort) return;
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  if (loading) {
    return (
      <div className="admin-table-loading">
        <div className="admin-spinner" />
        <p>Gegevens laden...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="admin-table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`admin-table-wrapper ${className}`}>
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`admin-table-header ${column.sortable ? 'sortable' : ''} ${column.align ? `text-${column.align}` : ''}`}
                style={{ width: column.width }}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                {column.label}
                {column.sortable && sortKey === column.key && (
                  <span className={`sort-icon ${sortDirection}`}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
            {actions && <th className="admin-table-header">Acties</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="admin-table-row">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`admin-table-cell ${column.align ? `text-${column.align}` : ''}`}
                >
                  {row[column.key]}
                </td>
              ))}
              {actions && (
                <td className="admin-table-cell admin-table-actions">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export type { AdminLayoutProps, AdminCardProps, AdminButtonProps, AdminBadgeProps, AdminGridProps, AdminDataTableProps };
