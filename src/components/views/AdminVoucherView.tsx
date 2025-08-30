import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../layout/AdminLayout';
import { AdminCard } from '../layout/AdminLayout';
import { AdminButton } from '../layout/AdminLayout';
import { AdminBadge } from '../layout/AdminLayout';
import { AdminGrid } from '../layout/AdminLayout';
import { AdminDataTable } from '../layout/AdminLayout';
import { TheaterVoucher } from '../../types/types';

interface AdminVoucherViewProps {
  theaterVouchers: TheaterVoucher[];
  onCreateVoucher: (voucher: Omit<TheaterVoucher, 'id'>) => void;
  onExtendVoucher: (voucherId: string, months: number) => void;
  onUpdateVoucher: (voucher: TheaterVoucher) => void;
  onDeleteVoucher?: (voucherId: string) => void;
}

export const AdminVoucherView: React.FC<AdminVoucherViewProps> = ({
  theaterVouchers,
  onCreateVoucher,
  onExtendVoucher,
  onUpdateVoucher,
  onDeleteVoucher
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired' | 'expiring_soon' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<TheaterVoucher | null>(null);
  
  // State voor nieuwe bon aanmaken - uitgebreid met type support
  const [voucherType, setVoucherType] = useState<'value' | 'persons'>('value');
  const [newVoucher, setNewVoucher] = useState({
    code: '', // Optioneel eigen code
    value: 50,
    persons: 2,
    packageType: 'standard' as 'standard' | 'premium',
    notes: ''
  });

  // Helper function to determine voucher status
  const getVoucherStatus = (voucher: TheaterVoucher): string => {
    if (voucher.status === 'used' || voucher.status === 'archived') {
      return voucher.status;
    }
    
    const today = new Date();
    const expiryDate = new Date(voucher.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring_soon';
    return 'active';
  };

  // Generate voucher code
  const generateVoucherCode = (): string => {
    const prefix = 'TB';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  // Format date helper
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Calculate expiry date (default 12 months)
  const calculateExpiryDate = (issueDate: string): string => {
    const date = new Date(issueDate);
    date.setFullYear(date.getFullYear() + 1);
    return formatDate(date);
  };

  // Helper functions voor nieuwe vouchertypes
  const getVoucherDisplayValue = (voucher: TheaterVoucher) => {
    if (voucher.type === 'value') {
      return `€${voucher.value.toLocaleString()}`;
    } else {
      return `${voucher.persons}x ${voucher.packageType}`;
    }
  };

  const getVoucherTypeDisplayName = (voucher: TheaterVoucher) => {
    return voucher.type === 'value' ? 'Waardebon' : 'Personenbon';
  };

  // Statistics
  const stats = useMemo(() => {
    const total = theaterVouchers.length;
    const active = theaterVouchers.filter(v => getVoucherStatus(v) === 'active').length;
    const used = theaterVouchers.filter(v => v.status === 'used').length;
    const expired = theaterVouchers.filter(v => getVoucherStatus(v) === 'expired').length;
    const expiringSoon = theaterVouchers.filter(v => getVoucherStatus(v) === 'expiring_soon').length;
    const archived = theaterVouchers.filter(v => v.status === 'archived').length;
    const totalValue = theaterVouchers.filter(v => ['active', 'extended'].includes(v.status || 'active')).reduce((sum, v) => sum + v.value, 0);
    const usedValue = theaterVouchers.filter(v => v.status === 'used').reduce((sum, v) => sum + v.value, 0);

    return { total, active, used, expired, expiringSoon, archived, totalValue, usedValue };
  }, [theaterVouchers]);

  // Filter vouchers
  const filteredVouchers = useMemo(() => {
    return theaterVouchers.filter(voucher => {
      const matchesSearch = !searchTerm || 
        voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (voucher.notes && voucher.notes.toLowerCase().includes(searchTerm.toLowerCase()));
        
      if (!matchesSearch) return false;
      
      if (filter === 'all') return true;
      if (filter === 'archived') return voucher.status === 'archived';
      if (filter === 'expiring_soon') return getVoucherStatus(voucher) === 'expiring_soon';
      return getVoucherStatus(voucher) === filter;
    });
  }, [theaterVouchers, searchTerm, filter]);

  const getStatusBadge = (voucher: TheaterVoucher) => {
    if (voucher.status === 'archived') return <AdminBadge variant="neutral">Gearchiveerd</AdminBadge>;
    
    const status = getVoucherStatus(voucher);
    switch(status) {
      case 'active': return <AdminBadge variant="success">Actief</AdminBadge>;
      case 'used': return <AdminBadge variant="info">Gebruikt</AdminBadge>;
      case 'expired': return <AdminBadge variant="danger">Verlopen</AdminBadge>;
      case 'expiring_soon': return <AdminBadge variant="warning">Verloopt Binnenkort</AdminBadge>;
      default: return <AdminBadge variant="neutral">{status}</AdminBadge>;
    }
  };

  // Event handlers
  const handleCreateVoucher = () => {
    const baseVoucher = {
      code: newVoucher.code.trim() || generateVoucherCode(),
      type: voucherType,
      issueDate: formatDate(new Date()),
      expiryDate: calculateExpiryDate(formatDate(new Date())),
      status: 'active' as const,
      extendedCount: 0,
      notes: newVoucher.notes || undefined
    };

    const voucher: Omit<TheaterVoucher, 'id'> = voucherType === 'value' 
      ? {
          ...baseVoucher,
          value: newVoucher.value,
          persons: 0, // Default voor value type
          packageType: 'standard' // Default voor value type
        }
      : {
          ...baseVoucher,
          value: 0, // Default voor persons type
          persons: newVoucher.persons,
          packageType: newVoucher.packageType
        };
    
    onCreateVoucher(voucher);
    
    // Reset form
    setNewVoucher({ 
      code: '',
      value: 50, 
      persons: 2, 
      packageType: 'standard',
      notes: '' 
    });
    setVoucherType('value');
    setShowCreateModal(false);
  };

  const handleEditVoucher = (voucher: TheaterVoucher) => {
    setEditingVoucher({...voucher});
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editingVoucher) {
      onUpdateVoucher(editingVoucher);
      setShowEditModal(false);
      setEditingVoucher(null);
    }
  };

  const handleDeleteVoucher = (voucher: TheaterVoucher) => {
    if (confirm('Weet u zeker dat u deze voucher wilt verwijderen?')) {
      if (onDeleteVoucher) {
        onDeleteVoucher(voucher.id);
      }
    }
  };

  const handleArchiveVoucher = (voucher: TheaterVoucher) => {
    if (confirm('Weet u zeker dat u deze voucher wilt archiveren?')) {
      const archivedVoucher: TheaterVoucher = {
        ...voucher,
        status: 'archived',
        archivedDate: formatDate(new Date()),
        archivedReason: 'Gearchiveerd door admin'
      };
      onUpdateVoucher(archivedVoucher);
    }
  };

  const handleRestoreVoucher = (voucher: TheaterVoucher) => {
    if (confirm('Weet u zeker dat u deze voucher wilt herstellen?')) {
      const restoredVoucher: TheaterVoucher = {
        ...voucher,
        status: 'active',
        archivedDate: undefined,
        archivedReason: undefined
      };
      onUpdateVoucher(restoredVoucher);
    }
  };

  const handleExtend = (voucher: TheaterVoucher) => {
    onExtendVoucher(voucher.id, 12); // Default 12 months extension
  };

  // Table configuration
  const tableColumns = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'value', label: 'Waarde', sortable: true },
    { key: 'issueDate', label: 'Uitgegeven', sortable: true },
    { key: 'expiryDate', label: 'Verloopt', sortable: true },
    { key: 'status', label: 'Status' },
    { key: 'notes', label: 'Notities' },
    { key: 'actions', label: 'Acties' }
  ];

  const tableData = filteredVouchers.map(voucher => ({
    id: voucher.id,
    code: voucher.code,
    type: (
      <AdminBadge variant={voucher.type === 'value' ? 'success' : 'info'}>
        {getVoucherTypeDisplayName(voucher)}
      </AdminBadge>
    ),
    value: getVoucherDisplayValue(voucher),
    issueDate: new Date(voucher.issueDate).toLocaleDateString('nl-NL'),
    expiryDate: new Date(voucher.expiryDate).toLocaleDateString('nl-NL'),
    status: getStatusBadge(voucher),
    notes: voucher.notes || '-',
    actions: (
      <div className="flex gap-xs">
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => handleEditVoucher(voucher)}
          title="Bewerken"
        >
          ✏️
        </AdminButton>
        {getVoucherStatus(voucher) === 'active' && (
          <AdminButton
            variant="warning"
            size="sm"
            onClick={() => handleExtend(voucher)}
            title="Verlengen"
          >
            📅
          </AdminButton>
        )}
        {voucher.status !== 'archived' && (
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={() => handleArchiveVoucher(voucher)}
            title="Archiveren"
          >
            📦
          </AdminButton>
        )}
        {voucher.status === 'archived' && (
          <AdminButton
            variant="success"
            size="sm"
            onClick={() => handleRestoreVoucher(voucher)}
            title="Herstellen"
          >
            🔄
          </AdminButton>
        )}
        {onDeleteVoucher && (
          <AdminButton
            variant="danger"
            size="sm"
            onClick={() => handleDeleteVoucher(voucher)}
            title="Verwijderen"
          >
            🗑️
          </AdminButton>
        )}
      </div>
    )
  }));

  return (
    <AdminLayout
      title="🎟️ Theaterbonnen Beheer"
      subtitle="Beheer theaterbonnen met volledig waarde gebruik systeem"
      actions={
        <AdminButton
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Nieuwe Theaterbon
        </AdminButton>
      }
    >
      {/* Statistics Dashboard */}
      <AdminGrid columns={4} gap="md" className="mb-xl">
        <AdminCard variant="ghost" className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-xs">{stats.active}</div>
          <div className="text-sm text-admin-text-secondary">Actieve Bonnen</div>
          <div className="text-xs text-admin-text-tertiary">€{stats.totalValue.toLocaleString()} waarde</div>
        </AdminCard>
        <AdminCard variant="ghost" className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-xs">{stats.used}</div>
          <div className="text-sm text-admin-text-secondary">Gebruikte Bonnen</div>
          <div className="text-xs text-admin-text-tertiary">€{stats.usedValue.toLocaleString()} omzet</div>
        </AdminCard>
        <AdminCard variant="ghost" className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-xs">{stats.expiringSoon}</div>
          <div className="text-sm text-admin-text-secondary">Verloopt Binnenkort</div>
          <div className="text-xs text-admin-text-tertiary">≤ 30 dagen</div>
        </AdminCard>
        <AdminCard variant="ghost" className="text-center">
          <div className="text-3xl font-bold text-red-600 mb-xs">{stats.expired}</div>
          <div className="text-sm text-admin-text-secondary">Verlopen</div>
          <div className="text-xs text-admin-text-tertiary">{stats.archived} gearchiveerd</div>
        </AdminCard>
      </AdminGrid>

      {/* Filters */}
      <AdminCard className="mb-lg">
        <AdminGrid columns={2} gap="md">
          <div>
            <label className="block text-sm font-medium text-admin-text-primary mb-xs">
              Zoeken
            </label>
            <input
              type="text"
              placeholder="Zoek op code of notities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-admin-text-primary mb-xs">
              Status Filter
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
            >
              <option value="all">Alle statussen</option>
              <option value="active">Actief</option>
              <option value="expiring_soon">Verloopt Binnenkort</option>
              <option value="used">Gebruikt</option>
              <option value="expired">Verlopen</option>
              <option value="archived">Gearchiveerd</option>
            </select>
          </div>
        </AdminGrid>
      </AdminCard>

      {/* Vouchers Table */}
      <AdminCard
        title={`Theaterbonnen Overzicht (${filteredVouchers.length})`}
        content={
          filteredVouchers.length === 0 ? (
            <div className="text-center p-xl">
              <div className="text-6xl mb-md">🎟️</div>
              <h3 className="text-lg font-medium text-admin-text-secondary mb-sm">
                Geen theaterbonnen gevonden
              </h3>
              <p className="text-admin-text-tertiary mb-lg">
                {searchTerm || filter !== 'all' 
                  ? 'Geen bonnen gevonden die voldoen aan de filters.'
                  : 'Begin met het aanmaken van nieuwe theaterbonnen.'}
              </p>
              {(searchTerm || filter !== 'all') ? (
                <AdminButton
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                >
                  Reset Filters
                </AdminButton>
              ) : (
                <AdminButton
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Eerste Theaterbon Aanmaken
                </AdminButton>
              )}
            </div>
          ) : (
            <AdminDataTable
              columns={tableColumns}
              data={tableData}
              searchable={false}
              sortable={true}
            />
          )
        }
      />

      {/* Create Voucher Card - UITGEBREID MET TYPE SUPPORT */}
      {showCreateModal && (
        <AdminCard title="Nieuwe Theaterbon Aanmaken" className="mb-lg">
          <div className="space-y-md">
            <div>
              <label className="block text-sm font-medium text-admin-text-primary mb-xs">
                Bon Type
              </label>
              <select 
                value={voucherType} 
                onChange={e => setVoucherType(e.target.value as 'value' | 'persons')}
                className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              >
                <option value="value">Waardebon (Vast Bedrag)</option>
                <option value="persons">Personenbon (Aantal Tickets)</option>
              </select>
            </div>

            {voucherType === 'value' ? (
              <div>
                <label className="block text-sm font-medium text-admin-text-primary mb-xs">
                  Bedrag (€)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={newVoucher.value}
                  onChange={(e) => setNewVoucher(prev => ({ ...prev, value: Number(e.target.value) }))}
                  className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                  placeholder="Bedrag in euro's"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-admin-text-primary mb-xs">
                    Aantal Personen
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newVoucher.persons}
                    onChange={(e) => setNewVoucher(prev => ({ ...prev, persons: Number(e.target.value) }))}
                    className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    placeholder="Aantal personen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-text-primary mb-xs">
                    Arrangement
                  </label>
                  <select 
                    value={newVoucher.packageType}
                    onChange={(e) => setNewVoucher(prev => ({ ...prev, packageType: e.target.value as 'standard' | 'premium' }))}
                    className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                  >
                    <option value="standard">Standaard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-admin-text-primary mb-xs">
                Code (optioneel)
              </label>
              <input
                type="text"
                value={newVoucher.code}
                onChange={(e) => setNewVoucher(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                placeholder="Laat leeg om automatisch te genereren"
                maxLength={20}
              />
              <small className="text-admin-text-secondary">Laat leeg voor automatische generatie</small>
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text-primary mb-xs">
                Notities (optioneel)
              </label>
              <textarea
                value={newVoucher.notes}
                onChange={(e) => setNewVoucher(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                rows={3}
                placeholder="Bijv. geschenk voor speciale gelegenheid..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-md mt-lg">
            <AdminButton
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Annuleren
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={handleCreateVoucher}
            >
              Theaterbon Aanmaken
            </AdminButton>
          </div>
        </AdminCard>
      )}

      {/* Edit Voucher Card - UITGEBREID MET TYPE SUPPORT */}
      {showEditModal && editingVoucher && (
        <AdminCard title="Theaterbon Bewerken" className="mb-lg">
          <div className="space-y-md">
            <div>
              <label className="block text-sm font-medium text-admin-text-primary mb-xs">
                Code
              </label>
              <input
                type="text"
                value={editingVoucher.code}
                onChange={(e) => setEditingVoucher(prev => prev ? { ...prev, code: e.target.value.toUpperCase() } : null)}
                className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text-primary mb-xs">
                Type
              </label>
              <select 
                value={editingVoucher.type} 
                onChange={(e) => setEditingVoucher(prev => prev ? { ...prev, type: e.target.value as 'value' | 'persons' } : null)}
                className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              >
                <option value="value">Waardebon</option>
                <option value="persons">Personenbon</option>
              </select>
            </div>

            {editingVoucher.type === 'value' ? (
              <div>
                <label className="block text-sm font-medium text-admin-text-primary mb-xs">
                  Bedrag (€)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={editingVoucher.value}
                  onChange={(e) => setEditingVoucher(prev => prev ? { ...prev, value: Number(e.target.value) } : null)}
                  className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-admin-text-primary mb-xs">
                    Aantal Personen
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingVoucher.persons}
                    onChange={(e) => setEditingVoucher(prev => prev ? { ...prev, persons: Number(e.target.value) } : null)}
                    className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-text-primary mb-xs">
                    Arrangement
                  </label>
                  <select 
                    value={editingVoucher.packageType}
                    onChange={(e) => setEditingVoucher(prev => prev ? { ...prev, packageType: e.target.value as 'standard' | 'premium' } : null)}
                    className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                  >
                    <option value="standard">Standaard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-admin-text-primary mb-xs">
                Vervaldatum
              </label>
              <input
                type="date"
                value={editingVoucher.expiryDate}
                onChange={(e) => setEditingVoucher(prev => prev ? { ...prev, expiryDate: e.target.value } : null)}
                className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text-primary mb-xs">
                Notities
              </label>
              <textarea
                value={editingVoucher.notes || ''}
                onChange={(e) => setEditingVoucher(prev => prev ? { ...prev, notes: e.target.value } : null)}
                className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-md mt-lg">
            <AdminButton
              variant="secondary"
              onClick={() => setShowEditModal(false)}
            >
              Annuleren
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={handleSaveEdit}
            >
              Opslaan
            </AdminButton>
          </div>
        </AdminCard>
      )}
    </AdminLayout>
  );
};

export default AdminVoucherView;
