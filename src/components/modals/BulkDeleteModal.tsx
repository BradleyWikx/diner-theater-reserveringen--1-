import React, { useState, useEffect } from 'react';
import { AdminModal, AdminFormGroup, AdminSelect } from '../shared/AdminModal';
import { AdminButton, AdminGrid, AdminBadge } from '../layout';
import { useConfirmation } from '../providers/ConfirmationProvider';
import { i18n } from '../../config/config';
import type { AppConfig } from '../../types/types';

interface BulkDeleteModalProps {
    onClose: () => void;
    onBulkDelete: (criteria: { type: 'name' | 'type', value: string }, month: Date) => void;
    config: AppConfig;
    month: Date;
}

export const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({ 
    onClose, 
    onBulkDelete, 
    config, 
    month 
}) => {
    const { confirm } = useConfirmation();
    const [deleteMode, setDeleteMode] = useState<'name' | 'type'>('name');
    const [selection, setSelection] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (deleteMode === 'name') {
            setSelection(config.showNames[0]?.name || '');
        } else {
            setSelection(config.showTypes[0]?.name || '');
        }
    }, [deleteMode, config]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!selection.trim()) {
            newErrors.selection = 'Selectie is verplicht';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }

        const monthName = month.toLocaleString('nl-NL', { month: 'long', year: 'numeric' });
        const message = `Weet je zeker dat je alle voorstellingen met ${deleteMode === 'name' ? 'naam' : 'type'} "${selection}" wilt verwijderen voor ${monthName}? Deze actie kan niet ongedaan worden gemaakt.`;
        
        confirm({
            title: 'Bulk verwijderen bevestigen',
            message: message,
            onConfirm: () => {
                onBulkDelete({ type: deleteMode, value: selection }, month);
                onClose();
            },
            confirmButtonClass: 'delete-btn'
        });
    };

    const options = deleteMode === 'name' ? config.showNames : config.showTypes;

    return (
        <AdminModal
            title="🗑️ Bulk Verwijderen"
            subtitle={`Verwijder voorstellingen voor ${month.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}`}
            onClose={onClose}
            actions={
                <AdminGrid columns={2} gap="sm">
                    <AdminButton 
                        variant="outline" 
                        onClick={onClose}
                    >
                        Annuleren
                    </AdminButton>
                    <AdminButton 
                        variant="danger" 
                        onClick={handleSubmit}
                        disabled={!selection}
                    >
                        🗑️ Verwijderen
                    </AdminButton>
                </AdminGrid>
            }
        >
            <div className="space-y-lg">
                {/* Warning Alert */}
                <div className="admin-alert admin-alert--warning">
                    <div className="admin-alert-icon">⚠️</div>
                    <div>
                        <div className="admin-alert-title">Let op</div>
                        <div className="admin-alert-message">
                            Dit zal alle voorstellingen met de geselecteerde criteria permanent verwijderen. 
                            Deze actie kan niet ongedaan worden gemaakt.
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-md">
                    <AdminFormGroup
                        label="Verwijder op basis van"
                        htmlFor="deleteMode"
                        required
                    >
                        <div className="admin-radio-group">
                            <label className="admin-radio-option">
                                <input 
                                    type="radio" 
                                    name="deleteMode" 
                                    value="name" 
                                    checked={deleteMode === 'name'} 
                                    onChange={() => setDeleteMode('name')} 
                                    className="admin-radio"
                                />
                                <div className="admin-radio-content">
                                    <div className="admin-radio-title">🎭 Show Naam</div>
                                    <div className="admin-radio-description">Verwijder alle voorstellingen met deze naam</div>
                                </div>
                            </label>
                            <label className="admin-radio-option">
                                <input 
                                    type="radio" 
                                    name="deleteMode" 
                                    value="type" 
                                    checked={deleteMode === 'type'} 
                                    onChange={() => setDeleteMode('type')} 
                                    className="admin-radio"
                                />
                                <div className="admin-radio-content">
                                    <div className="admin-radio-title">📋 Show Type</div>
                                    <div className="admin-radio-description">Verwijder alle voorstellingen van dit type</div>
                                </div>
                            </label>
                        </div>
                    </AdminFormGroup>

                    <AdminFormGroup
                        label={deleteMode === 'name' ? 'Selecteer show naam' : 'Selecteer show type'}
                        htmlFor="selection"
                        required
                        error={errors.selection}
                    >
                        <AdminSelect
                            id="selection"
                            value={selection}
                            onChange={e => setSelection(e.target.value)}
                            error={!!errors.selection}
                        >
                            {options.map(item => (
                                <option key={item.id} value={item.name}>
                                    {item.name}
                                    {deleteMode === 'type' && item.defaultCapacity && 
                                        ` (${item.defaultCapacity} plaatsen)`
                                    }
                                </option>
                            ))}
                        </AdminSelect>
                    </AdminFormGroup>

                    {/* Preview */}
                    {selection && (
                        <div className="admin-card bg-admin-danger-light border-admin-danger p-md rounded-md">
                            <h4 className="text-admin-danger font-semibold mb-xs flex items-center gap-xs">
                                🎯 Preview verwijdering
                            </h4>
                            <div className="text-admin-danger-dark">
                                Alle voorstellingen met {deleteMode === 'name' ? 'naam' : 'type'}{' '}
                                <AdminBadge variant="danger" size="sm">
                                    {selection}
                                </AdminBadge>{' '}
                                in <strong>{month.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}</strong> 
                                worden verwijderd.
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </AdminModal>
    );
};
