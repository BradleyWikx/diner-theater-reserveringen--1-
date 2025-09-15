import React from 'react';
import { AdminLayout } from '../layout/AdminLayout';

interface AdminPageProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  children,
  title,
  subtitle,
  actions,
  loading = false,
  className = ''
}) => {
  return (
    <AdminLayout
      title={title}
      subtitle={subtitle}
      actions={actions}
      loading={loading}
      className={className}
    >
      {children}
    </AdminLayout>
  );
};

export default AdminPage;
