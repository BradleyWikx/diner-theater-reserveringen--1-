// Confirmation Provider - Updated to use new i18n structure
// Provides confirmation dialogs across the application

import React, { createContext, useContext, useState } from 'react';
import { Icon } from '../components/ui/Icon';
import { useI18n } from '../hooks/useI18n';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
};

export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useI18n();
  const [confirmationOptions, setConfirmationOptions] = useState<ConfirmationOptions | null>(null);

  const confirm = (options: ConfirmationOptions) => {
    setConfirmationOptions(options);
  };

  const handleConfirm = () => {
    if (confirmationOptions) {
      confirmationOptions.onConfirm();
      setConfirmationOptions(null);
    }
  };

  const handleCancel = () => {
    if (confirmationOptions?.onCancel) {
      confirmationOptions.onCancel();
    }
    setConfirmationOptions(null);
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {confirmationOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{confirmationOptions.title}</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={handleCancel}
                aria-label={t('common.close')}
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">{confirmationOptions.message}</p>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                onClick={handleCancel}
              >
                {confirmationOptions.cancelText || t('common.cancel')}
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleConfirm}
              >
                {confirmationOptions.confirmText || t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmationContext.Provider>
  );
};