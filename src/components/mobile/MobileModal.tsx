import React, { useEffect, useRef, useState } from 'react';
import { useMobile, useTouchGestures } from '../../hooks/useMobile';
import { Icon } from '../UI/Icon';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnBackdrop?: boolean;
  closeOnSwipeDown?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnBackdrop = true,
  closeOnSwipeDown = true,
  showCloseButton = true,
  className = ''
}) => {
  const { isMobile, isSmallMobile } = useMobile();
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Touch gestures for swipe to close
  const touchGestures = useTouchGestures({
    onSwipeDown: closeOnSwipeDown ? onClose : undefined,
    threshold: 100
  });

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === modalRef.current) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // Focus management for accessibility
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements?.length) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Drag handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !closeOnSwipeDown) return;
    
    setIsDragging(true);
    const touch = e.touches[0];
    const startY = touch.clientY;
    
    const handleTouchMove = (moveE: TouchEvent) => {
      const currentY = moveE.touches[0].clientY;
      const diff = Math.max(0, currentY - startY);
      setDragOffset(diff);
    };
    
    const handleTouchEnd = () => {
      setIsDragging(false);
      
      if (dragOffset > 100) {
        onClose();
      } else {
        setDragOffset(0);
      }
      
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  if (!isOpen) return null;

  const modalSizeClass = isMobile ? `mobile-modal-${size}` : `modal-${size}`;
  const dragStyle = isDragging ? {
    transform: `translateY(${dragOffset}px)`,
    transition: 'none'
  } : {
    transform: dragOffset > 0 ? `translateY(0)` : undefined,
    transition: 'transform 0.3s ease'
  };

  return (
    <div 
      ref={modalRef}
      className={`modal-backdrop ${isMobile ? 'mobile-modal-backdrop' : ''} ${isOpen ? 'open' : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        ref={contentRef}
        className={`modal-container ${modalSizeClass} ${isMobile ? 'mobile-modal' : ''} ${isSmallMobile ? 'small-mobile-modal' : ''} ${className}`}
        style={dragStyle}
        onTouchStart={handleTouchStart}
        {...(isMobile ? touchGestures : {})}
      >
        {/* Mobile drag indicator */}
        {isMobile && closeOnSwipeDown && (
          <div className="mobile-modal-drag-indicator" />
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && (
              <h2 id="modal-title" className="modal-title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Close modal"
              >
                <Icon name="x" size={isMobile ? 20 : 16} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

interface MobileModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  actions?: React.ReactNode;
}

export const MobileModalHeader: React.FC<MobileModalHeaderProps> = ({
  title,
  subtitle,
  onClose,
  actions
}) => {
  return (
    <div className="mobile-modal-header">
      <div className="mobile-modal-header-content">
        <div className="mobile-modal-titles">
          <h3 className="mobile-modal-title">{title}</h3>
          {subtitle && <p className="mobile-modal-subtitle">{subtitle}</p>}
        </div>
        <div className="mobile-modal-header-actions">
          {actions}
          {onClose && (
            <button
              type="button"
              className="mobile-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              <Icon name="x" size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface MobileModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileModalFooter: React.FC<MobileModalFooterProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`mobile-modal-footer ${className}`}>
      {children}
    </div>
  );
};

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxHeight?: string | number;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxHeight = '90vh'
}) => {
  const { isMobile } = useMobile();
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  if (!isMobile) {
    return (
      <MobileModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        size="medium"
      >
        {children}
      </MobileModal>
    );
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const startY = e.touches[0].clientY;
    
    const handleTouchMove = (moveE: TouchEvent) => {
      const currentY = moveE.touches[0].clientY;
      const diff = Math.max(0, currentY - startY);
      setDragOffset(diff);
    };
    
    const handleTouchEnd = () => {
      setIsDragging(false);
      
      if (dragOffset > 100) {
        onClose();
      } else {
        setDragOffset(0);
      }
      
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  if (!isOpen) return null;

  const dragStyle = {
    transform: `translateY(${dragOffset}px)`,
    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  return (
    <div className="mobile-bottom-sheet-backdrop">
      <div 
        className="mobile-bottom-sheet"
        style={{ ...dragStyle, maxHeight }}
        onTouchStart={handleTouchStart}
      >
        <div className="mobile-bottom-sheet-handle" />
        
        {title && (
          <div className="mobile-bottom-sheet-header">
            <h3 className="mobile-bottom-sheet-title">{title}</h3>
          </div>
        )}
        
        <div className="mobile-bottom-sheet-content">
          {children}
        </div>
      </div>
    </div>
  );
};
