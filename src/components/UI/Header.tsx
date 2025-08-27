import React from 'react';
import { Icon } from './Icon';
import { View } from '../../types/types';
import { i18n } from '../../config/config';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
    const { isAdmin } = useAuth();
    
    return (
        <header className="main-header">
            <div className="header-brand">
                <img 
                    src="https://irp.cdn-website.com/e8046ea7/dms3rep/multi/logo-ip.png" 
                    alt="Inspiration Point Valkenswaard" 
                    className="company-logo"
                />
                <h1>{i18n.header.title}</h1>
            </div>
            <nav>
                <button 
                    onClick={() => setCurrentView('book')} 
                    className={currentView === 'book' ? 'active' : ''} 
                    aria-pressed={currentView === 'book'}
                >
                    {i18n.bookShow.title}
                </button>
                {isAdmin && (
                    <button 
                        onClick={() => setCurrentView('admin')} 
                        className={currentView === 'admin' ? 'active' : ''} 
                        aria-pressed={currentView === 'admin'}
                    >
                        <Icon id="shield-check" />
                        {i18n.adminPanel.title}
                    </button>
                )}
            </nav>
        </header>
    );
};
