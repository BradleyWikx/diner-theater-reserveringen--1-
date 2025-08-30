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
            title={isMultiMode ? `${i18n.addAction} (${dates.length} datums)` : i18n.addShowEventTitle}
            subtitle={isMultiMode 
                ? `Voeg een voorstelling toe aan ${dates.length} geselecteerde datums`
                : 'Voeg een nieuwe voorstelling toe aan de planning'
            }
            size="md"
            footer={
                <AdminGrid columns={2} gap="sm" className="w-full">
                    <AdminButton
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        {i18n.cancel}
                    </AdminButton>
                    <AdminButton
                        type="submit"
                        variant="primary"
                        onClick={handleSubmit}
                    >
                        {isMultiMode ? `Toevoegen aan ${dates.length} datums` : i18n.addAction}
                    </AdminButton>
                </AdminGrid>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-md">
                <AdminFormGroup
                    label={i18n.showName}
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
                    label={i18n.showType}
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
                    label="Capaciteit"
                    htmlFor="capacity"
                    required
                    error={errors.capacity}
                >
                    <AdminInput
                        id="capacity"
                        type="number"
                        value={capacity}
                        onChange={e => setCapacity(parseInt(e.target.value) || 0)}
                        min={1}
                        max={1000}
                        error={!!errors.capacity}
                    />
                </AdminFormGroup>

                {!isMultiMode && (
                    <AdminFormGroup
                        label="Datum"
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
                    <div className="admin-card bg-admin-info-light border-admin-info p-md rounded-md">
                        <h4 className="text-admin-info font-semibold mb-xs">
                            📅 Geselecteerde datums:
                        </h4>
                        <div className="flex flex-wrap gap-xs">
                            {dates.slice(0, 5).map((date, index) => (
                                <span key={index} className="admin-badge admin-badge--info admin-badge--sm">
                                    {new Date(date).toLocaleDateString('nl-NL')}
                                </span>
                            ))}
                            {dates.length > 5 && (
                                <span className="admin-badge admin-badge--neutral admin-badge--sm">
                                    +{dates.length - 5} meer
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </form>
        </AdminModal>
    );
};
