import React, { useMemo, useState, useEffect } from 'react';
import { AdminModal, AdminFormGroup, AdminInput, AdminSelect } from '../shared/AdminModal';
import { AdminButton, AdminGrid } from '../layout';
import type { ShowEvent, AppConfig } from '../../types/types';
import { i18n } from '../../config/config';
import { formatDate } from '../../utils/utilities';

interface AddShowModalProps {
    onClose: () => void;
    onAdd: (event: Omit<ShowEvent, 'id'>, dates: string[]) => void;
    config: AppConfig;
    dates: string[];
}

export const AddShowModal: React.FC<AddShowModalProps> = ({ onClose, onAdd, config, dates }) => {
    const activeShowNames = useMemo(() => config.showNames.filter(s => !s.archived), [config.showNames]);
    const activeShowTypes = useMemo(() => config.showTypes.filter(s => !s.archived), [config.showTypes]);

    const [name, setName] = useState(activeShowNames[0]?.name || '');
    const [type, setType] = useState(activeShowTypes[0]?.name || '');
    const [capacity, setCapacity] = useState(activeShowTypes[0]?.defaultCapacity || 240);
    const [singleDate, setSingleDate] = useState(dates[0] || formatDate(new Date()));
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const selectedType = activeShowTypes.find(t => t.name === type);
        if (selectedType) {
            setCapacity(selectedType.defaultCapacity);
        }
    }, [type, activeShowTypes]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'Show naam is verplicht';
        }

        if (!type.trim()) {
            newErrors.type = 'Show type is verplicht';
        }

        if (capacity < 1) {
            newErrors.capacity = 'Capaciteit moet minimaal 1 zijn';
        }

        if (!dates.length && !singleDate) {
            newErrors.singleDate = 'Datum is verplicht';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;

        const targetDates = dates.length > 0 ? dates : [singleDate];
        const newShow: Omit<ShowEvent, 'id'> = { 
            date: '', 
            name, 
            type, 
            capacity, 
            isClosed: false 
        };
        
        onAdd(newShow, targetDates);
        onClose();
    };
    
    const isMultiMode = dates.length > 0;

    return (
        <AdminModal
            isOpen={true}
            onClose={onClose}
            title={isMultiMode ? `🎭 Show Toevoegen (${dates.length} datums)` : '🎭 Nieuwe Show Toevoegen'}
            subtitle={isMultiMode 
                ? `Voeg een voorstelling toe aan ${dates.length} geselecteerde datums`
                : 'Voeg een nieuwe voorstelling toe aan de planning'
            }
            size="md"
            actions={
                <AdminGrid columns={2} gap="sm" className="w-full">
                    <AdminButton
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Annuleren
                    </AdminButton>
                    <AdminButton
                        type="submit"
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={Object.keys(errors).length > 0}
                    >
                        {isMultiMode ? `🎭 Toevoegen aan ${dates.length} datums` : '🎭 Show Toevoegen'}
                    </AdminButton>
                </AdminGrid>
            }
        >
            <div className="space-y-lg">
                {/* Multi-date info banner */}
                {isMultiMode && (
                    <div className="admin-alert admin-alert--info">
                        <div className="admin-alert-icon">📅</div>
                        <div>
                            <div className="admin-alert-title">Meerdere datums geselecteerd</div>
                            <div className="admin-alert-message">
                                Deze voorstelling wordt toegevoegd aan alle {dates.length} geselecteerde datums
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-md">
                    <AdminFormGroup
                        label="🎭 Show Naam"
                        htmlFor="showName"
                        required
                        error={errors.name}
                    >
                        <AdminSelect
                            id="showName"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            error={!!errors.name}
                        >
                            {activeShowNames.map(n => (
                                <option key={n.id} value={n.name}>
                                    {n.name}
                                </option>
                            ))}
                        </AdminSelect>
                    </AdminFormGroup>

                    <AdminFormGroup
                        label="📋 Show Type"
                        htmlFor="showType"
                        required
                        error={errors.type}
                    >
                        <AdminSelect
                            id="showType"
                            value={type}
                            onChange={e => setType(e.target.value)}
                            error={!!errors.type}
                        >
                            {activeShowTypes.map(t => (
                                <option key={t.id} value={t.name}>
                                    {t.name} (standaard: {t.defaultCapacity} plaatsen)
                                </option>
                            ))}
                        </AdminSelect>
                    </AdminFormGroup>

                    <AdminFormGroup
                        label="👥 Capaciteit"
                        htmlFor="capacity"
                        required
                        error={errors.capacity}
                        helpText="Het maximum aantal gasten voor deze voorstelling"
                    >
                        <AdminInput
                            id="capacity"
                            type="number"
                            value={capacity}
                            onChange={e => setCapacity(parseInt(e.target.value) || 0)}
                            min={1}
                            max={1000}
                            error={!!errors.capacity}
                            placeholder="bijv. 240"
                        />
                    </AdminFormGroup>

                    {!isMultiMode && (
                        <AdminFormGroup
                            label="📅 Datum"
                            htmlFor="singleDate"
                            required
                            error={errors.singleDate}
                        >
                            <AdminInput
                                id="singleDate"
                                type="date"
                                value={singleDate}
                                onChange={e => setSingleDate(e.target.value)}
                                error={!!errors.singleDate}
                            />
                        </AdminFormGroup>
                    )}

                    {isMultiMode && (
                        <div className="admin-card bg-admin-primary-light border-admin-primary p-md rounded-md">
                            <h4 className="text-admin-primary font-semibold mb-sm flex items-center gap-xs">
                                📅 Geselecteerde datums ({dates.length})
                            </h4>
                            <div className="flex flex-wrap gap-xs max-h-32 overflow-y-auto">
                                {dates.map((date, index) => (
                                    <span key={index} className="admin-badge admin-badge--primary admin-badge--sm">
                                        {new Date(date).toLocaleDateString('nl-NL', { 
                                            weekday: 'short', 
                                            day: 'numeric', 
                                            month: 'short' 
                                        })}
                                    </span>
                                ))}
                            </div>
                            {dates.length > 10 && (
                                <div className="text-admin-primary-dark text-sm mt-xs">
                                    Scroll om alle datums te bekijken
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preview Card */}
                    {name && type && capacity > 0 && (
                        <div className="admin-card bg-admin-success-light border-admin-success p-md rounded-md">
                            <h4 className="text-admin-success font-semibold mb-sm flex items-center gap-xs">
                                ✨ Preview
                            </h4>
                            <div className="space-y-xs text-admin-success-dark">
                                <div><strong>Show:</strong> {name}</div>
                                <div><strong>Type:</strong> {type}</div>
                                <div><strong>Capaciteit:</strong> {capacity} plaatsen</div>
                                {isMultiMode && (
                                    <div><strong>Datums:</strong> {dates.length} geselecteerd</div>
                                )}
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </AdminModal>
    );
};
