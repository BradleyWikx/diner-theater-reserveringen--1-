import React, { ReactNode, createContext, useContext, useState } from 'react';
import { Icon } from '../UI/Icon';
import { i18n } from '../../config/config';

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
                        <button type="button" className="modal-close" onClick={handleClose} aria-label={i18n.general.close}>
                            <Icon id="close"/>
                        </button>
                        
                        <div className="modal-content">
                            <h3>{options.title}</h3>
                            <p>{options.message}</p>
                            
                            <div className="modal-actions">
                                <button type="button" onClick={handleClose} className="btn-secondary">
                                    {i18n.general.cancel}
                                </button>
                                <button type="button" onClick={handleConfirm} className={options.confirmButtonClass || 'btn-danger'}>
                                    {options.confirmText || i18n.general.confirm}
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
