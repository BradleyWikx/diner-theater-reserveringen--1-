import React, { useMemo, useState, useEffect } from 'react';
import { Icon } from '../UI/Icon';
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

    useEffect(() => {
        const selectedType = activeShowTypes.find(t => t.name === type);
        if (selectedType) {
            setCapacity(selectedType.defaultCapacity);
        }
    }, [type, activeShowTypes]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const targetDates = dates.length > 0 ? dates : [singleDate];
        const newShow: Omit<ShowEvent, 'id'> = { date: '', name, type, capacity, isClosed: false };
        onAdd(newShow, targetDates);
        onClose();
    };
    
    const isMultiMode = dates.length > 0;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{isMultiMode ? `${i18n.addAction} (${dates.length} datums)` : i18n.addShowEventTitle}</h3>
                    <button onClick={onClose} className="close-btn" aria-label={i18n.cancel}><Icon id="close" /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="showName">{i18n.showName}</label>
                        <select id="showName" value={name} onChange={e => setName(e.target.value)}>{activeShowNames.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}</select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="showType">{i18n.showType}</label>
                        <select id="showType" value={type} onChange={e => setType(e.target.value)}>{activeShowTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</select>
                    </div>
                     {!isMultiMode && (
                        <div className="form-group">
                            <label htmlFor="singleDate">{i18n.date}</label>
                            <input type="date" id="singleDate" value={singleDate} onChange={e => setSingleDate(e.target.value)} />
                        </div>
                     )}
                    <div className="form-group">
                        <label htmlFor="capacity">{i18n.capacity}</label>
                        <input type="number" id="capacity" value={capacity} min="1" onChange={e => setCapacity(Number(e.target.value))} />
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary">{i18n.cancel}</button>
                        <button type="submit" className="submit-btn">{i18n.addShow}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
