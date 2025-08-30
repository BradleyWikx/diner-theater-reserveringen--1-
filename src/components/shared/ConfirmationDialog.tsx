import React from 'react';
import { AdminButton } from '../layout';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger' | 'warning';
  loading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false
}) => {
  if (!isOpen) return null;

  const getIconForVariant = () => {
    switch (variant) {
      case 'danger': return '⚠️';
      case 'warning': return '⚡';
      default: return '❓';
    }
  };

  const getColorForVariant = () => {
    switch (variant) {
      case 'danger': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`text-3xl ${getColorForVariant()}`}>
            {getIconForVariant()}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            
            <div className="flex gap-3 justify-end">
              <AdminButton
                variant="secondary"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelText}
              </AdminButton>
              
              <AdminButton
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? 'Processing...' : confirmText}
              </AdminButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bulk action confirmation dialog
interface BulkConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  itemCount: number;
  itemType: string;
  action: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const BulkConfirmationDialog: React.FC<BulkConfirmationDialogProps> = ({
  isOpen,
  title,
  itemCount,
  itemType,
  action,
  onConfirm,
  onCancel,
  loading = false
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      title={title}
      message={`Are you sure you want to ${action} ${itemCount} ${itemType}${itemCount !== 1 ? 's' : ''}? This action cannot be undone.`}
      confirmText={`${action} ${itemCount} ${itemType}${itemCount !== 1 ? 's' : ''}`}
      cancelText="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
      variant="danger"
      loading={loading}
    />
  );
};

// Delete confirmation dialog
interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  itemName: string;
  itemType: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  additionalInfo?: string;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  itemName,
  itemType,
  onConfirm,
  onCancel,
  loading = false,
  additionalInfo
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      title={`Delete ${itemType}`}
      message={`Are you sure you want to delete "${itemName}"? ${additionalInfo || 'This action cannot be undone.'}`}
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
      variant="danger"
      loading={loading}
    />
  );
};

// Custom hook for managing confirmation dialogs
export const useConfirmation = () => {
  const [confirmation, setConfirmation] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'default' | 'danger' | 'warning';
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const confirm = React.useCallback((options: {
    title: string;
    message: string;
    variant?: 'default' | 'danger' | 'warning';
    onConfirm: () => void;
    onCancel?: () => void;
  }) => {
    setConfirmation({
      isOpen: true,
      ...options
    });
  }, []);

  const handleConfirm = React.useCallback(() => {
    if (confirmation) {
      confirmation.onConfirm();
      setConfirmation(null);
    }
  }, [confirmation]);

  const handleCancel = React.useCallback(() => {
    if (confirmation?.onCancel) {
      confirmation.onCancel();
    }
    setConfirmation(null);
  }, [confirmation]);

  const ConfirmationComponent = React.useMemo(() => {
    if (!confirmation) return null;

    return (
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        variant={confirmation.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  }, [confirmation, handleConfirm, handleCancel]);

  return {
    confirm,
    ConfirmationComponent
  };
};

// Hook for delete confirmation
export const useDeleteConfirmation = () => {
  const [deleteState, setDeleteState] = React.useState<{
    isOpen: boolean;
    itemName: string;
    itemType: string;
    onConfirm: () => void;
    additionalInfo?: string;
    loading: boolean;
  } | null>(null);

  const confirmDelete = React.useCallback((options: {
    itemName: string;
    itemType: string;
    onConfirm: () => void;
    additionalInfo?: string;
  }) => {
    setDeleteState({
      isOpen: true,
      loading: false,
      ...options
    });
  }, []);

  const handleConfirm = React.useCallback(async () => {
    if (deleteState) {
      setDeleteState(prev => prev ? { ...prev, loading: true } : null);
      try {
        await deleteState.onConfirm();
        setDeleteState(null);
      } catch (error) {
        setDeleteState(prev => prev ? { ...prev, loading: false } : null);
        // Error handling should be done by the calling component
      }
    }
  }, [deleteState]);

  const handleCancel = React.useCallback(() => {
    setDeleteState(null);
  }, []);

  const DeleteConfirmationComponent = React.useMemo(() => {
    if (!deleteState) return null;

    return (
      <DeleteConfirmationDialog
        isOpen={deleteState.isOpen}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={deleteState.loading}
        additionalInfo={deleteState.additionalInfo}
      />
    );
  }, [deleteState, handleConfirm, handleCancel]);

  return {
    confirmDelete,
    DeleteConfirmationComponent
  };
};
