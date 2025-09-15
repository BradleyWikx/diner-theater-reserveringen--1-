import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout, AdminCard, AdminButton, AdminBadge, AdminGrid, AdminDataTable } from '../layout/AdminLayout';
import { getAllCustomers } from '../../services/customerService';
import { Customer } from '../../types/types';
import { Icon } from '../ui/Icon';
import { formatDate } from '../../utils/utilities';

interface ModernAdminCustomersViewProps {
  onSelectCustomer: (customer: Customer) => void;
}

const ModernAdminCustomersView: React.FC<ModernAdminCustomersViewProps> = ({ 
  onSelectCustomer 
}) => {
  // Debug logging
  console.log('🧑‍🤝‍🧑 ModernAdminCustomersView Props:', {
    onSelectCustomer: !!onSelectCustomer
  });

  // Data fetching
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: getAllCustomers,
  });

  // Early return if no customers
  if (!customers || customers.length === 0) {
    return (
      <AdminLayout
        title="👥 Klanten Database"
        subtitle="Geen klanten gevonden"
      >
        <AdminCard className="text-center py-xl">
          <div className="text-6xl mb-md">👥</div>
          <h3 className="text-lg font-medium text-admin-text-secondary mb-sm">
            Nog geen klanten
          </h3>
          <p className="text-admin-text-tertiary mb-lg">
            Zodra er reserveringen worden gemaakt, verschijnen de klanten hier automatisch.
          </p>
          <div className="bg-admin-info-light p-lg rounded-lg border border-admin-info">
            <p className="text-sm text-admin-info">
              💡 <strong>Tip:</strong> Klanten worden automatisch aangemaakt op basis van reserveringen. 
              Maak eerst een paar reserveringen aan via de boekingspagina.
            </p>
          </div>
        </AdminCard>
      </AdminLayout>
    );
  }

  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'vip' | 'recent' | 'frequent'>('all');
  const [sortKey, setSortKey] = useState<keyof Customer>('lastVisit');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  // Enhanced Analytics
  const customerStats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;
    const vipCustomers = customers.filter(c => c.totalSpent > 500).length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCustomers = customers.filter(c => {
      const lastVisit = new Date(c.lastVisit);
      return lastVisit >= thirtyDaysAgo;
    }).length;

    const frequentCustomers = customers.filter(c => c.totalBookings >= 5).length;
    
    return {
      totalCustomers,
      totalSpent,
      avgSpent,
      vipCustomers,
      recentCustomers,
      frequentCustomers
    };
  }, [customers]);

  // Filtering and Sorting
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesFilter = true;
      switch (filterType) {
        case 'vip':
          matchesFilter = customer.totalSpent > 500;
          break;
        case 'recent':
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          matchesFilter = new Date(customer.lastVisit) >= thirtyDaysAgo;
          break;
        case 'frequent':
          matchesFilter = customer.totalBookings >= 5;
          break;
        default:
          matchesFilter = true;
      }
      
      return matchesSearch && matchesFilter;
    });
  }, [customers, searchTerm, filterType]);

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCustomers, sortKey, sortDirection]);

  // Customer Tier Logic
  const getCustomerTier = (customer: Customer) => {
    if (customer.totalSpent > 1000) return { tier: 'Platinum', color: 'var(--admin-gold)', variant: 'success' as const };
    if (customer.totalSpent > 500) return { tier: 'Gold', color: 'var(--admin-crimson)', variant: 'warning' as const };
    if (customer.totalSpent > 200) return { tier: 'Silver', color: 'var(--admin-secondary)', variant: 'info' as const };
    return { tier: 'Bronze', color: 'var(--admin-text-tertiary)', variant: 'neutral' as const };
  };

  // Export Functionality
  const exportCustomers = () => {
    const csv = [
      'Naam,Email,Totaal Boekingen,Totaal Besteed,Laatste Bezoek,Tier',
      ...sortedCustomers.map(customer => {
        const tier = getCustomerTier(customer);
        return `"${customer.name}","${customer.email}",${customer.totalBookings},${customer.totalSpent.toFixed(2)},"${customer.lastVisit}","${tier.tier}"`;
      })
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `klanten_export_${formatDate(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Customer Tags Logic
  const getCustomerTags = (customer: Customer) => {
    const tags = [];
    if (customer.totalSpent > 1000) tags.push('VIP');
    if (customer.totalBookings > 3) tags.push('Terugkerende Gast');
    if (customer.totalBookings <= 1) tags.push('Nieuwe Klant');
    return tags;
  };

  // Table Columns
  const tableColumns = [
    {
      key: 'customer',
      label: 'Klant',
      sortable: true,
      render: (customer: Customer) => (
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 bg-admin-primary-light text-admin-primary rounded-full flex items-center justify-center font-bold text-sm">
            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-admin-text-primary">{customer.name}</div>
            <div className="text-sm text-admin-text-secondary">{customer.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'totalBookings',
      label: 'Boekingen',
      sortable: true,
      render: (customer: Customer) => (
        <div className="text-center">
          <div className="text-lg font-bold text-admin-primary">{customer.totalBookings}</div>
          <div className="text-xs text-admin-text-secondary">totaal</div>
        </div>
      )
    },
    {
      key: 'totalSpent',
      label: 'Totaal Besteed',
      sortable: true,
      render: (customer: Customer) => (
        <div className="text-right">
          <div className="text-lg font-bold text-admin-success">€{customer.totalSpent.toFixed(2)}</div>
          <div className="text-xs text-admin-text-secondary">lifetime value</div>
        </div>
      )
    },
    {
      key: 'lastVisit',
      label: 'Laatste Bezoek',
      sortable: true,
      render: (customer: Customer) => {
        const lastVisitDate = new Date(customer.lastVisit);
        const daysSinceVisit = Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <div>
            <div className="font-medium text-admin-text-primary">
              {lastVisitDate.toLocaleDateString('nl-NL')}
            </div>
            <div className="text-xs text-admin-text-secondary">
              {daysSinceVisit === 0 ? 'Vandaag' : 
               daysSinceVisit === 1 ? 'Gisteren' : 
               `${daysSinceVisit} dagen geleden`}
            </div>
          </div>
        );
      }
    },
    {
      key: 'tier',
      label: 'Status',
      render: (customer: Customer) => {
        const tier = getCustomerTier(customer);
        return (
          <AdminBadge variant={tier.variant}>
            {tier.tier}
          </AdminBadge>
        );
      }
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (customer: Customer) => {
        const tags = getCustomerTags(customer);
        return (
          <div className="flex gap-xs">
            {tags.map(tag => {
              const color = tag === 'VIP' ? 'purple' : tag === 'Terugkerende Gast' ? 'blue' : 'green';
              return <AdminBadge key={tag} variant="info" style={{ backgroundColor: color }}>
                {tag}
              </AdminBadge>
            })}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Acties',
      render: (customer: Customer) => (
        <div className="flex gap-xs">
          <AdminButton
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelectCustomer(customer);
            }}
          >
            👁️ Bekijken
          </AdminButton>
        </div>
      )
    }
  ];

  return (
    <AdminLayout
      title="👥 Klanten Database"
      subtitle={`${customerStats.totalCustomers} klanten • €${customerStats.totalSpent.toFixed(2)} totale omzet`}
      actions={
        <div className="flex gap-sm">
          <AdminButton
            variant="secondary"
            onClick={exportCustomers}
          >
            📊 Export CSV
          </AdminButton>
        </div>
      }
    >
      {/* Statistics Dashboard */}
      <AdminGrid columns={5} gap="md" className="mb-xl">
        <AdminCard variant="elevated" className="text-center">
          <div className="text-3xl font-bold text-admin-primary mb-xs">
            {customerStats.totalCustomers}
          </div>
          <div className="text-sm text-admin-text-secondary">Totaal Klanten</div>
        </AdminCard>
        
        <AdminCard variant="elevated" className="text-center">
          <div className="text-3xl font-bold text-admin-success mb-xs">
            €{customerStats.totalSpent.toFixed(0)}
          </div>
          <div className="text-sm text-admin-text-secondary">Totale Omzet</div>
        </AdminCard>
        
        <AdminCard variant="elevated" className="text-center">
          <div className="text-3xl font-bold text-admin-info mb-xs">
            €{customerStats.avgSpent.toFixed(0)}
          </div>
          <div className="text-sm text-admin-text-secondary">Gem. per Klant</div>
        </AdminCard>
        
        <AdminCard variant="elevated" className="text-center">
          <div className="text-3xl font-bold text-admin-warning mb-xs">
            {customerStats.vipCustomers}
          </div>
          <div className="text-sm text-admin-text-secondary">VIP Klanten</div>
        </AdminCard>
        
        <AdminCard variant="elevated" className="text-center">
          <div className="text-3xl font-bold text-admin-secondary mb-xs">
            {customerStats.recentCustomers}
          </div>
          <div className="text-sm text-admin-text-secondary">Recent Actief</div>
        </AdminCard>
      </AdminGrid>

      {/* Filters */}
      <AdminCard className="mb-lg">
        <AdminGrid columns="responsive" gap="md">
          <div>
            <label className="block text-sm font-medium text-admin-text-primary mb-xs">
              Zoeken
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-admin-text-tertiary">🔍</div>
              <input
                type="text"
                placeholder="Zoek op naam of email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-admin-text-primary mb-xs">
              Filter
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="w-full px-3 py-2 border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
            >
              <option value="all">👥 Alle Klanten</option>
              <option value="vip">⭐ VIP Klanten (€500+)</option>
              <option value="recent">🕒 Recent Actief (30 dagen)</option>
              <option value="frequent">🔄 Frequent (5+ boekingen)</option>
            </select>
          </div>
        </AdminGrid>
      </AdminCard>

      {/* Customer Analytics Section */}
      <AdminCard title="📊 Klant Segmentatie" className="mb-lg">
        <AdminGrid columns={3} gap="lg">
          <div className="text-center p-lg border border-admin-border rounded-lg">
            <div className="text-2xl mb-sm">💎</div>
            <div className="font-bold text-lg text-admin-primary">
              {customers.filter(c => c.totalSpent > 1000).length}
            </div>
            <div className="text-sm text-admin-text-secondary">Platinum (€1000+)</div>
          </div>
          
          <div className="text-center p-lg border border-admin-border rounded-lg">
            <div className="text-2xl mb-sm">🥇</div>
            <div className="font-bold text-lg text-admin-warning">
              {customers.filter(c => c.totalSpent > 500 && c.totalSpent <= 1000).length}
            </div>
            <div className="text-sm text-admin-text-secondary">Gold (€500-1000)</div>
          </div>
          
          <div className="text-center p-lg border border-admin-border rounded-lg">
            <div className="text-2xl mb-sm">🥈</div>
            <div className="font-bold text-lg text-admin-info">
              {customers.filter(c => c.totalSpent > 200 && c.totalSpent <= 500).length}
            </div>
            <div className="text-sm text-admin-text-secondary">Silver (€200-500)</div>
          </div>
        </AdminGrid>
      </AdminCard>

      {/* Customer Table */}
      <AdminCard>
        <div className="flex items-center justify-between mb-lg">
          <div className="flex items-center gap-md">
            <h3 className="text-lg font-semibold text-admin-text-primary">
              Klanten Overzicht
            </h3>
            <AdminBadge variant="info">
              {filteredCustomers.length} resultaten
            </AdminBadge>
          </div>
        </div>

        <AdminDataTable
          data={sortedCustomers}
          columns={tableColumns}
          onRowClick={onSelectCustomer}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={(key, direction) => {
            setSortKey(key as keyof Customer);
            setSortDirection(direction);
          }}
          selectedRows={selectedCustomers}
          onSelectionChange={setSelectedCustomers}
          emptyMessage={
            <div className="text-center py-xl">
              <div className="text-6xl mb-md">👥</div>
              <h3 className="text-lg font-medium text-admin-text-secondary mb-sm">
                Geen klanten gevonden
              </h3>
              <p className="text-admin-text-tertiary mb-lg">
                Probeer uw zoekterm aan te passen of wijzig de filters.
              </p>
            </div>
          }
          emptyIcon="👥"
        />
      </AdminCard>
    </AdminLayout>
  );
};

export default ModernAdminCustomersView;
