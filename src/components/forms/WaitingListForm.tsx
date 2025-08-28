import React, { useState } from 'react';
import { Icon } from '../UI/Icon';
import type { ShowEvent, WaitingListEntry } from '../../types/types';
import { i18n } from '../../config/config';

interface WaitingListFormProps {
    show: ShowEvent;
    date: string;
    onAddToWaitingList: (entry: Omit<WaitingListEntry, 'id'>) => void;
    onClose: () => void;
}

export const WaitingListForm: React.FC<WaitingListFormProps> = ({ show, date, onAddToWaitingList, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [guests, setGuests] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddToWaitingList({ name, email, phone, guests, date });
        setSubmitted(true);
        setName('');
        setEmail('');
        setPhone('');
        setGuests(1);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 3000);
    };

    const dateObj = new Date(date + 'T00:00:00');
    const formattedDate = i18n.showInfo
        .replace('{dayOfWeek}', dateObj.toLocaleDateString('nl-NL', { weekday: 'long' }))
        .replace('{day}', dateObj.toLocaleDateString('nl-NL', { day: 'numeric' }))
        .replace('{month}', dateObj.toLocaleDateString('nl-NL', { month: 'long' }))
        .replace('{year}', dateObj.toLocaleDateString('nl-NL', { year: 'numeric' }))
        .replace('{showType}', show.type);
    
    if (submitted) {
        return (
            <div className="waitlist-success-card modern-card">
                <div className="success-header">
                    <div className="success-icon-large">
                        <Icon id="check" />
                    </div>
                    <h3 className="success-title">Toegevoegd aan wachtlijst!</h3>
                </div>
                <div className="success-content">
                    <p className="success-message">
                        U bent succesvol toegevoegd aan de wachtlijst voor <strong>{show.name}</strong>. 
                        We sturen u een email zodra er plaatsen beschikbaar komen.
                    </p>
                    <div className="success-details">
                        <div className="detail-item">
                            <Icon id="calendar" />
                            <span>{formattedDate}</span>
                        </div>
                        <div className="detail-item">
                            <Icon id="users" />
                            <span>{guests} {guests === 1 ? 'persoon' : 'personen'}</span>
                        </div>
                        <div className="detail-item">
                            <Icon id="mail" />
                            <span>{email}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-primary btn-wide">
                        <Icon id="arrow-left" />
                        Terug naar kalender
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="waitlist-container-modern">
            <div className="waitlist-header-card modern-card">
                <div className="header-icon">
                    <Icon id="clock" />
                </div>
                <div className="header-content">
                    <h2 className="waitlist-title">Wachtlijst - {show.name}</h2>
                    <p className="waitlist-date">{formattedDate}</p>
                </div>
                <button onClick={onClose} className="close-btn" aria-label="Sluiten">
                    <Icon id="close" />
                </button>
            </div>

            <div className="waitlist-info-card modern-card">
                <div className="info-badge">
                    <Icon id="info" />
                    <span>Vol</span>
                </div>
                <div className="info-content">
                    <h4>Deze show is momenteel vol</h4>
                    <p>Voeg jezelf toe aan de wachtlijst en we informeren je direct zodra er plaatsen vrijkomen.</p>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="waitlist-form-modern modern-card">
                <div className="form-section-modern">
                    <div className="section-header">
                        <Icon id="user" />
                        <h4>Contactgegevens</h4>
                    </div>
                    
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Volledige naam *</label>
                            <input 
                                id="name" 
                                type="text" 
                                className="form-input"
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                placeholder="Bijv. Jan van der Berg"
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">E-mailadres *</label>
                            <input 
                                id="email" 
                                type="email" 
                                className="form-input"
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                                placeholder="bijv@voorbeeld.nl" 
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone" className="form-label">Telefoonnummer *</label>
                            <input 
                                id="phone" 
                                type="tel" 
                                className="form-input"
                                value={phone} 
                                onChange={e => setPhone(e.target.value)}
                                placeholder="06 12 34 56 78" 
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="guests" className="form-label">Aantal personen *</label>
                            <div className="quantity-selector">
                                <button 
                                    type="button" 
                                    className="quantity-btn"
                                    onClick={() => setGuests(Math.max(1, guests - 1))}
                                    disabled={guests <= 1}
                                >
                                    <Icon id="minus" />
                                </button>
                                <span className="quantity-value">{guests}</span>
                                <button 
                                    type="button" 
                                    className="quantity-btn"
                                    onClick={() => setGuests(guests + 1)}
                                >
                                    <Icon id="plus" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        <Icon id="arrow-left" />
                        Annuleren
                    </button>
                    <button type="submit" className="btn-primary">
                        <Icon id="plus" />
                        Toevoegen aan wachtlijst
                    </button>
                </div>
            </form>
        </div>
    )
};
