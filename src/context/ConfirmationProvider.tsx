import React, { ReactNode, createContext, useContext, useState } from 'react';
import { Icon } from '../components/UI/Icon';
import { useI18n } from '../hooks/useI18n';

interface ConfirmationOptions {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmButtonClass?: string;
    confirmText?: string;
}

interface ConfirmationContextType {
    confirm: (options: ConfirmationOptions) => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

interface ConfirmationProviderProps {
    children: ReactNode;
}

export const ConfirmationProvider: React.FC<ConfirmationProviderProps> = ({ children }) => {
    const { t } = useI18n();
    const [options, setOptions] = useState<ConfirmationOptions | null>(null);

    const confirm = (newOptions: ConfirmationOptions) => {
        setOptions(newOptions);
    };

    const handleClose = () => setOptions(null);

    const handleConfirm = () => {
        if (options) {
            options.onConfirm();
            handleClose();
        }
    };

    return (
        <ConfirmationContext.Provider value={{ confirm }}>
            {children}
            {options && (
                <div className="modal-overlay" onClick={handleClose}>
                    <div className="modal confirmation-modal" onClick={e => e.stopPropagation()}>
                        <button type="button" className="modal-close" onClick={handleClose} aria-label={t('common.close')}>
                            <Icon name="close"/>
                        </button>
                        
                        <div className="modal-content">
                            <h3>{options.title}</h3>
                            <p>{options.message}</p>
                            
                            <div className="modal-actions">
                                <button type="button" onClick={handleClose} className="btn-secondary">
                                    {t('common.cancel')}
                                </button>
                                <button type="button" onClick={handleConfirm} className={options.confirmButtonClass || 'btn-danger'}>
                                    {options.confirmText || t('common.confirm')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmationContext.Provider>
    );
};

export const useConfirmation = () => {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error('useConfirmation must be used within a ConfirmationProvider');
    }
    return context;
};
