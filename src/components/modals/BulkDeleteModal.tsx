import React, { useState, useEffect } from 'react';
import { Icon } from '../UI/Icon';
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

    useEffect(() => {
        if (deleteMode === 'name') {
            setSelection(config.showNames[0]?.name || '');
        } else {
            setSelection(config.showTypes[0]?.name || '');
        }
    }, [deleteMode, config]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const monthName = month.toLocaleString('nl-NL', { month: 'long', year: 'numeric' });
        const message = i18n.bulkDeleteWarning.replace('{selection}', selection).replace('{month}', monthName);
        
        confirm({
            title: i18n.bulkDeleteTitle,
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
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{i18n.bulkDeleteTitle}</h3>
                    <button onClick={onClose} className="close-btn">
                        <Icon id="close"/>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <p>
                        {i18n.bulkDeleteTitle} voor{' '}
                        <strong>{month.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}</strong>
                    </p>
                    <div className="form-group">
                        <label>{i18n.deleteMode}</label>
                        <div className="radio-group">
                            <label>
                                <input 
                                    type="radio" 
                                    name="deleteMode" 
                                    value="name" 
                                    checked={deleteMode === 'name'} 
                                    onChange={() => setDeleteMode('name')} 
                                />{' '}
                                {i18n.deleteByShowName}
                            </label>
                            <label>
                                <input 
                                    type="radio" 
                                    name="deleteMode" 
                                    value="type" 
                                    checked={deleteMode === 'type'} 
                                    onChange={() => setDeleteMode('type')} 
                                />{' '}
                                {i18n.deleteByShowType}
                            </label>
                        </div>
                    </div>
                    <div className="form-group">
                        <select value={selection} onChange={e => setSelection(e.target.value)}>
                            {options.map(item => 
                                <option key={item.id} value={item.name}>{item.name}</option>
                            )}
                        </select>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            {i18n.cancel}
                        </button>
                        <button type="submit" className="delete-btn" disabled={!selection}>
                            {i18n.deleteShows}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
