import React from 'react';
import { Icon } from './Icon';
import { View } from '../../types/types';
import { i18n } from '../../config/config';

interface HeaderProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => (
    <header className="main-header">
        <h1><Icon id="logo" /> {i18n.header.title}</h1>
        <nav>
            <button onClick={() => setCurrentView('book')} className={currentView === 'book' ? 'active' : ''} aria-pressed={currentView === 'book'}>
                {i18n.bookShow.title}
            </button>
            <button onClick={() => setCurrentView('admin')} className={currentView === 'admin' ? 'active' : ''} aria-pressed={currentView === 'admin'}>
                {i18n.adminPanel.title}
            </button>
            <button onClick={() => setCurrentView('firebase')} className={currentView === 'firebase' ? 'active' : ''} aria-pressed={currentView === 'firebase'}>
                🔥 Firebase Test
            </button>
        </nav>
    </header>
);
