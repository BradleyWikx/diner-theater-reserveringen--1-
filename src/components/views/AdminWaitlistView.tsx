import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../layout/AdminLayout';
import { AdminCard } from '../layout/AdminLayout';
import { AdminButton } from '../layout/AdminLayout';
import { AdminBadge } from '../layout/AdminLayout';
import { AdminGrid } from '../layout/AdminLayout';
import { AdminDataTable } from '../layout/AdminLayout';
import { WaitlistEntry } from '../../types/types';

interface AdminWaitlistViewProps {
  waitlist: WaitlistEntry[];
  onNotifyWaitlist: (entry: WaitlistEntry) => void;
  onConvertToBooking: (entry: WaitlistEntry) => void;
  onRemoveFromWaitlist: (entryId: string) => void;
}

export const AdminWaitlistView: React.FC<AdminWaitlistViewProps> = ({
  waitlist,
  onNotifyWaitlist,
  onConvertToBooking,
  onRemoveFromWaitlist
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'notified' | 'converted' | 'expired'>('all');

  // Statistics
  const stats = useMemo(() => {
    const total = waitlist.length;
    const active = waitlist.filter(e => !e.status || e.status === 'active').length;
    const notified = waitlist.filter(e => e.status === 'notified').length;
    const converted = waitlist.filter(e => e.status === 'converted').length;
    const expired = waitlist.filter(e => e.status === 'expired').length;

    return { total, active, notified, converted, expired };
  }, [waitlist]);

  // Filter waitlist entries
  const filteredEntries = useMemo(() => {
    return waitlist.filter(entry => {
      const matchesSearch = !searchTerm || 
        entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.showName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && (!entry.status || entry.status === 'active')) ||
        entry.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [waitlist, searchTerm, statusFilter]);

  // Group entries by show
  const entriesByShow = useMemo(() => {
    const groups: { [key: string]: WaitlistEntry[] } = {};
    filteredEntries.forEach(entry => {
      const key = `${entry.showName} - ${entry.showDate}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });
    return groups;
  }, [filteredEntries]);

  const getStatusBadge = (entry: WaitlistEntry) => {
    const status = entry.status || 'active';
    switch (status) {
      case 'active': return <AdminBadge variant="success">Actief</AdminBadge>;
      case 'notified': return <AdminBadge variant="warning">Geïnformeerd</AdminBadge>;
      case 'converted': return <AdminBadge variant="info">Omgezet</AdminBadge>;
      case 'expired': return <AdminBadge variant="neutral">Verlopen</AdminBadge>;
      default: return <AdminBadge variant="neutral">{status}</AdminBadge>;
    }
  };

  const tableColumns = [
    { key: 'name', label: 'Naam', sortable: true },
    { key: 'email', label: 'E-mail' },
    { key: 'phone', label: 'Telefoon' },
    { key: 'guests', label: 'Gasten' },
    { key: 'addedDate', label: 'Toegevoegd', sortable: true },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Acties' }
  ];

  const tableData = filteredEntries.map(entry => ({
    id: entry.id,
    name: entry.customerName,
    email: entry.customerEmail,
    phone: entry.customerPhone || '-',
    guests: entry.requestedGuests.toString(),
    addedDate: new Date(entry.addedAt).toLocaleDateString('nl-NL'),
    status: getStatusBadge(entry),
    actions: (
      <div className="flex gap-xs">
        {(!entry.status || entry.status === 'active') && (
          <>
            <AdminButton
              variant="primary"
              size="sm"
              onClick={() => onNotifyWaitlist(entry)}
              title="Informeer klant"
            >
              📧
            </AdminButton>
            <AdminButton
              variant="success"
              size="sm"
              onClick={() => onConvertToBooking(entry)}
              title="Omzetten naar boeking"
            >
              ✅
            </AdminButton>
          </>
        )}
        <AdminButton
          variant="danger"
          size="sm"
          onClick={() => onRemoveFromWaitlist(entry.id)}
          title="Verwijderen van wachtlijst"
        >
          🗑️
        </AdminButton>
      </div>
    )
  }));

  return (
    <AdminLayout
      title="🕰️ Wachtlijst Beheer"
      subtitle="Beheer wachtende klanten voor uitverkochte voorstellingen"
      actions={
        <AdminButton
          variant="primary"
          onClick={() => window.location.reload()}
        >
          🔄 Vernieuwen
        </AdminButton>
      }
    >
      {/* Statistics Dashboard */}
      <AdminGrid columns={5} gap="md" className="mb-xl">
        <AdminCard variant="ghost" className="text-center">
          <div className="text-3xl font-bold text-admin-primary mb-xs">{stats.total}</div>
          <div className="text-sm text-admin-text-secondary">Totaal Wachtlijst</div>
        </AdminCard>
        <AdminCard variant="ghost" className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-xs">{stats.active}</div>
          <div className="text-sm text-admin-text-secondary">Actieve Aanvragen</div>
        </AdminCard>
        <AdminCard variant="ghost" className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-xs">{stats.notified}</div>
          <div className="text-sm text-admin-text-secondary">Geïnformeerd</div>
        </AdminCard>
        <AdminCard variant="ghost" className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-xs">{stats.converted}</div>
          <div className="text-sm text-admin-text-secondary">Omgezet</div>
        </AdminCard>
        <AdminCard variant="ghost" className="text-center">
          <div className="text-3xl font-bold text-gray-500 mb-xs">{stats.expired}</div>
          <div className="text-sm text-admin-text-secondary">Verlopen</div>
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
              placeholder="Zoek op naam, email of show..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full px-sm py-xs border border-admin-border rounded-md focus:ring-2 focus:ring-admin-primary focus:border-transparent"
            >
              <option value="all">Alle statussen</option>
              <option value="active">Actief</option>
              <option value="notified">Geïnformeerd</option>
              <option value="converted">Omgezet</option>
              <option value="expired">Verlopen</option>
            </select>
          </div>
        </AdminGrid>
      </AdminCard>

      {/* Waitlist Table */}
      <AdminCard
        title={`Wachtlijst Overzicht (${filteredEntries.length})`}
        content={
          filteredEntries.length === 0 ? (
            <div className="text-center p-xl">
              <div className="text-6xl mb-md">📋</div>
              <h3 className="text-lg font-medium text-admin-text-secondary mb-sm">
                Geen wachtlijst entries
              </h3>
              <p className="text-admin-text-tertiary mb-lg">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Geen entries gevonden die voldoen aan de filters.'
                  : 'Er zijn momenteel geen klanten op de wachtlijst.'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <AdminButton
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  Reset Filters
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

      {/* Show Groups Overview */}
      {Object.keys(entriesByShow).length > 0 && (
        <AdminCard title="Overzicht per Voorstelling" className="mt-lg">
          <AdminGrid columns={1} gap="md">
            {Object.entries(entriesByShow).map(([showKey, entries]) => {
              const entriesArray = entries as WaitlistEntry[];
              return (
                <div key={showKey} className="p-md border border-admin-border rounded-md">
                  <div className="flex justify-between items-center mb-sm">
                    <h4 className="font-medium text-admin-text-primary">{showKey}</h4>
                    <AdminBadge variant="info">{entriesArray.length} wachtend</AdminBadge>
                  </div>
                  <div className="text-sm text-admin-text-secondary">
                    <strong>Actief:</strong> {entriesArray.filter(e => !e.status || e.status === 'active').length} |
                    <strong> Geïnformeerd:</strong> {entriesArray.filter(e => e.status === 'notified').length} |
                    <strong> Omgezet:</strong> {entriesArray.filter(e => e.status === 'converted').length}
                  </div>
                  <div className="text-xs text-admin-text-tertiary mt-xs">
                    Totaal gasten wachtend: {entriesArray.reduce((sum, e) => sum + e.requestedGuests, 0)}
                  </div>
                </div>
              );
            })}
          </AdminGrid>
        </AdminCard>
      )}
    </AdminLayout>
  );
};

export default AdminWaitlistView;
