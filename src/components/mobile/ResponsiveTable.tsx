import React, { useState, useEffect, useRef } from 'react';
import { useMobile } from '../../hooks/useMobile';

interface ResponsiveTableColumn {
  key: string;
  label: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  hiddenOnMobile?: boolean;
  mobileLabel?: string;
  render?: (value: any, row: any, index: number) => React.ReactNode;
}

interface ResponsiveTableProps {
  data: any[];
  columns: ResponsiveTableColumn[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  stackOnMobile?: boolean;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  onSort,
  loading = false,
  emptyMessage = 'Geen gegevens beschikbaar',
  className = '',
  stackOnMobile = true
}) => {
  const { isMobile, isSmallMobile } = useMobile();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const tableRef = useRef<HTMLDivElement>(null);

  const visibleColumns = columns.filter(col => 
    !isMobile || !col.hiddenOnMobile
  );

  const handleSort = (key: string) => {
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  // Stack table on very small screens if enabled
  const shouldStack = isSmallMobile && stackOnMobile;

  if (loading) {
    return (
      <div className="responsive-table-loading">
        <div className="loading-spinner" />
        <p>Gegevens laden...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="responsive-table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  if (shouldStack) {
    return (
      <div className={`responsive-table-stack ${className}`}>
        {data.map((row, index) => (
          <div key={index} className="table-stack-row">
            {visibleColumns.map((column) => {
              const value = row[column.key];
              const displayValue = column.render ? 
                column.render(value, row, index) : 
                value;
              
              return (
                <div key={column.key} className="table-stack-field">
                  <span className="table-stack-label">
                    {column.mobileLabel || column.label}:
                  </span>
                  <span className="table-stack-value">
                    {displayValue}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`} ref={tableRef}>
      <div className="table-scroll">
        <table className="responsive-table">
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className={`table-header ${column.align ? `text-${column.align}` : ''} ${column.sortable ? 'sortable' : ''}`}
                  style={{ width: column.width }}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="table-header-content">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="sort-indicator">
                        <span className={`sort-arrow sort-up ${sortKey === column.key && sortDirection === 'asc' ? 'active' : ''}`}>↑</span>
                        <span className={`sort-arrow sort-down ${sortKey === column.key && sortDirection === 'desc' ? 'active' : ''}`}>↓</span>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="table-row">
                {visibleColumns.map((column) => {
                  const value = row[column.key];
                  const displayValue = column.render ? 
                    column.render(value, row, index) : 
                    value;
                  
                  return (
                    <td
                      key={column.key}
                      className={`table-cell ${column.align ? `text-${column.align}` : ''}`}
                      data-label={column.mobileLabel || column.label}
                    >
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Mobile-optimized card view for table data
interface TableCardViewProps {
  data: any[];
  columns: ResponsiveTableColumn[];
  onItemClick?: (item: any, index: number) => void;
  className?: string;
}

export const TableCardView: React.FC<TableCardViewProps> = ({
  data,
  columns,
  onItemClick,
  className = ''
}) => {
  const { isMobile } = useMobile();

  if (!isMobile) {
    return (
      <ResponsiveTable
        data={data}
        columns={columns}
        className={className}
      />
    );
  }

  return (
    <div className={`table-card-view ${className}`}>
      {data.map((item, index) => (
        <div
          key={index}
          className="table-card"
          onClick={() => onItemClick?.(item, index)}
          style={{ cursor: onItemClick ? 'pointer' : 'default' }}
        >
          {columns
            .filter(col => !col.hiddenOnMobile)
            .map((column) => {
              const value = item[column.key];
              const displayValue = column.render ? 
                column.render(value, item, index) : 
                value;

              return (
                <div key={column.key} className="table-card-field">
                  <span className="table-card-label">
                    {column.mobileLabel || column.label}
                  </span>
                  <span className={`table-card-value ${column.align ? `text-${column.align}` : ''}`}>
                    {displayValue}
                  </span>
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
};
