import React, { useState } from 'react';
import { Icon } from '../ui/Icon';
import { AddShowModal } from './AddShowModal';
import { useConfirmation } from '../../context/ConfirmationProvider';
import { i18n } from '../../config/config';
import type { ShowEvent, AppConfig } from '../../types/types';

interface MultiSelectActionsProps {
    dates: string[];
    onClose: () => void;
    onAddShow: (event: Omit<ShowEvent, 'id'>, dates: string[]) => void;
    onDeleteShows: () => void;
    config: AppConfig;
}

export const MultiSelectActions: React.FC<MultiSelectActionsProps> = ({ 
    dates, 
    onClose, 
    onAddShow, 
    onDeleteShows, 
    config 
}) => {
    const { confirm } = useConfirmation();
    const [action, setAction] = useState<'add' | 'delete'>('add');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const handleApply = () => {
        if (action === 'add') {
            setIsAddModalOpen(true);
        }
        if (action === 'delete') {
            confirm({
                title: i18n.deleteShows,
                message: i18n.deleteConfirmMulti.replace('{count}', String(dates.length)),
                onConfirm: () => {
                    onDeleteShows();
                    onClose();
                },
                confirmButtonClass: 'delete-btn'
            });
        }
    };

    return (
        <>
            <div className="modal-backdrop" onClick={onClose}>
                <div className="modal-content multi-date-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>{i18n.multiActionTitle}</h3>
                        <button onClick={onClose} className="close-btn">
                            <Icon id="close"/>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="selected-dates-info">
                            <div className="dates-count">
                                <span className="count-number">{dates.length}</span>
                                <span className="count-label">datums geselecteerd</span>
                            </div>
                            <div className="dates-preview">
                                {dates.slice(0, 3).map((date, index) => (
                                    <span key={index} className="date-badge">
                                        {new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                                    </span>
                                ))}
                                {dates.length > 3 && (
                                    <span className="more-dates">+{dates.length - 3} meer</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Kies een actie</label>
                            <div className="action-cards">
                                <div 
                                    className={`action-card ${action === 'add' ? 'selected' : ''}`}
                                    onClick={() => setAction('add')}
                                >
                                    <div className="action-icon add-icon">➕</div>
                                    <div className="action-content">
                                        <h4>{i18n.addAction}</h4>
                                        <p>Voeg shows toe aan geselecteerde datums</p>
                                    </div>
                                    <div className="action-radio">
                                        <input 
                                            type="radio" 
                                            name="action" 
                                            value="add" 
                                            checked={action === 'add'} 
                                            onChange={() => setAction('add')}
                                        />
                                    </div>
                                </div>
                                
                                <div 
                                    className={`action-card ${action === 'delete' ? 'selected' : ''}`}
                                    onClick={() => setAction('delete')}
                                >
                                    <div className="action-icon delete-icon">🗑️</div>
                                    <div className="action-content">
                                        <h4>{i18n.deleteAction}</h4>
                                        <p>Verwijder alle shows van geselecteerde datums</p>
                                    </div>
                                    <div className="action-radio">
                                        <input 
                                            type="radio" 
                                            name="action" 
                                            value="delete" 
                                            checked={action === 'delete'} 
                                            onChange={() => setAction('delete')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            {i18n.cancel}
                        </button>
                        <button 
                            type="button" 
                            className={`submit-btn ${action === 'delete' ? 'delete-btn' : ''}`} 
                            onClick={handleApply}
                        >
                            {action === 'add' ? 'Shows Toevoegen' : 'Shows Verwijderen'}
                        </button>
                    </div>
                </div>
            </div>
            {isAddModalOpen && 
                <AddShowModal
                    onClose={() => {
                        setIsAddModalOpen(false);
                        onClose();
                    }}
                    onAdd={onAddShow}
                    config={config}
                    dates={dates}
                />
            }
        </>
    );
};
