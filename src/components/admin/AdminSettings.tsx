import React, { useState, useEffect } from 'react';
import { useFirebaseConfig } from '../../hooks/firebase/useFirebaseConfig';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ToastProvider } from '../providers/ToastProvider';
import type { AppConfig } from '../../types/types';

interface AdminSettingsProps {
    onClose: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onClose }) => {
    const { config, loading, updateConfig } = useFirebaseConfig();
    const [localConfig, setLocalConfig] = useState<AppConfig | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (config) {
            setLocalConfig(config);
        }
    }, [config]);

    const handleMerchandiseChange = (id: string, field: string, value: string | number) => {
        if (!localConfig) return;
        
        const updatedMerchandise = localConfig.merchandise.map(item => 
            item.id === id ? { ...item, [field]: field === 'price' ? parseFloat(value as string) : value } : item
        );
        
        setLocalConfig({
            ...localConfig,
            merchandise: updatedMerchandise
        });
    };

    const handlePricesChange = (field: string, value: string) => {
        if (!localConfig) return;
        
        setLocalConfig({
            ...localConfig,
            prices: {
                ...localConfig.prices,
                [field]: parseFloat(value)
            }
        });
    };

    const handleSave = async () => {
        if (!localConfig) return;
        
        setSaving(true);
        try {
            await updateConfig(localConfig);
            ToastProvider.success('Instellingen succesvol opgeslagen!');
        } catch (error) {
            console.error('Error saving settings:', error);
            ToastProvider.error('Er is een fout opgetreden bij het opslaan');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !localConfig) {
        return <LoadingSpinner />;
    }

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2>🎛️ Instellingen</h2>
                    <button 
                        type="button" 
                        className="close-button" 
                        onClick={onClose}
                        aria-label="Sluiten"
                    >
                        ✕
                    </button>
                </div>

                <div className="admin-modal-body">
                    {/* Borrels & Drankjes Prijzen */}
                    <div className="settings-section">
                        <h3>🍹 Borrels & Drankjes</h3>
                        <div className="settings-grid">
                            {localConfig.merchandise
                                .filter(item => ['preShowDrinks', 'afterParty'].includes(item.id))
                                .map(item => (
                                    <div key={item.id} className="setting-item">
                                        <label>
                                            <span className="setting-label">{item.name}</span>
                                            <div className="price-input-group">
                                                <span className="currency">€</span>
                                                <input
                                                    type="number"
                                                    step="0.50"
                                                    min="0"
                                                    value={item.price}
                                                    onChange={(e) => handleMerchandiseChange(item.id, 'price', e.target.value)}
                                                    className="price-input"
                                                />
                                                <span className="per-person">per persoon</span>
                                            </div>
                                        </label>
                                        <label>
                                            <span className="setting-label">Beschrijving</span>
                                            <input
                                                type="text"
                                                value={item.description || ''}
                                                onChange={(e) => handleMerchandiseChange(item.id, 'description', e.target.value)}
                                                className="description-input"
                                            />
                                        </label>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Merchandise Prijzen */}
                    <div className="settings-section">
                        <h3>🛍️ Merchandise</h3>
                        <div className="settings-grid">
                            {localConfig.merchandise
                                .filter(item => !['preShowDrinks', 'afterParty'].includes(item.id))
                                .map(item => (
                                    <div key={item.id} className="setting-item">
                                        <label>
                                            <span className="setting-label">{item.name}</span>
                                            <div className="price-input-group">
                                                <span className="currency">€</span>
                                                <input
                                                    type="number"
                                                    step="0.50"
                                                    min="0"
                                                    value={item.price}
                                                    onChange={(e) => handleMerchandiseChange(item.id, 'price', e.target.value)}
                                                    className="price-input"
                                                />
                                            </div>
                                        </label>
                                        <label>
                                            <span className="setting-label">Beschrijving</span>
                                            <input
                                                type="text"
                                                value={item.description || ''}
                                                onChange={(e) => handleMerchandiseChange(item.id, 'description', e.target.value)}
                                                className="description-input"
                                            />
                                        </label>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Algemene Prijsinstellingen */}
                    <div className="settings-section">
                        <h3>💰 Algemene Prijzen</h3>
                        <div className="settings-grid">
                            <div className="setting-item">
                                <label>
                                    <span className="setting-label">Pre-show/After party basisprijs</span>
                                    <div className="price-input-group">
                                        <span className="currency">€</span>
                                        <input
                                            type="number"
                                            step="0.50"
                                            min="0"
                                            value={localConfig.prices.preShowOrAfterParty}
                                            onChange={(e) => handlePricesChange('preShowOrAfterParty', e.target.value)}
                                            className="price-input"
                                        />
                                        <span className="per-person">per persoon</span>
                                    </div>
                                </label>
                            </div>
                            <div className="setting-item">
                                <label>
                                    <span className="setting-label">Cap prijs</span>
                                    <div className="price-input-group">
                                        <span className="currency">€</span>
                                        <input
                                            type="number"
                                            step="0.50"
                                            min="0"
                                            value={localConfig.prices.cap}
                                            onChange={(e) => handlePricesChange('cap', e.target.value)}
                                            className="price-input"
                                        />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="admin-modal-footer">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="btn btn-secondary"
                        disabled={saving}
                    >
                        Annuleren
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSave}
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? 'Opslaan...' : '💾 Opslaan'}
                    </button>
                </div>
            </div>
        </div>
    );
};
