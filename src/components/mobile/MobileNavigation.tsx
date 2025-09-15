import React, { useState, useEffect, useRef } from 'react';
import { useMobile, useTouchGestures } from '../../hooks/useMobile';
import { Icon } from '../ui/Icon';

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onToggle,
  onClose,
  children,
  title = "Menu"
}) => {
  const { isMobile } = useMobile();
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Touch gestures for swipe to close
  const touchGestures = useTouchGestures({
    onSwipeLeft: onClose,
    threshold: 50
  });

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && backdropRef.current && event.target === backdropRef.current) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Mobile Navigation Toggle Button */}
      <button
        className="nav-toggle"
        onClick={onToggle}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <Icon name={isOpen ? "x" : "menu"} size={24} />
      </button>

      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className={`mobile-nav-backdrop ${isOpen ? 'active' : ''}`}
        aria-hidden="true"
      />

      {/* Navigation Drawer */}
      <nav 
        ref={drawerRef}
        className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}
        {...touchGestures}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Navigation Header */}
        <div className="mobile-nav-header">
          <h2 className="mobile-nav-title">{title}</h2>
          <button
            className="mobile-nav-close"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="mobile-nav-items">
          {children}
        </div>
      </nav>
    </>
  );
};

interface MobileNavItemProps {
  onClick?: () => void;
  href?: string;
  icon?: string;
  active?: boolean;
  children: React.ReactNode;
}

export const MobileNavItem: React.FC<MobileNavItemProps> = ({
  onClick,
  href,
  icon,
  active = false,
  children
}) => {
  const commonProps = {
    className: `mobile-nav-item ${active ? 'active' : ''}`,
    children: (
      <>
        {icon && <Icon name={icon} className="mobile-nav-icon" />}
        <span>{children}</span>
      </>
    )
  };

  if (href) {
    return <a href={href} {...commonProps} />;
  }

  return (
    <button 
      {...commonProps} 
      onClick={onClick}
      type="button"
    />
  );
};
