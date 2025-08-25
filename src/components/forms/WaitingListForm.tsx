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
            <div className="waitlist-success-container">
                <div className="waitlist-success">
                    <div className="success-animation">
                        <div className="checkmark-circle">
                            <Icon id="check" className="checkmark-icon" />
                        </div>
                    </div>
                    <h3 className="success-title">🎉 Succesvol toegevoegd!</h3>
                    <p className="success-message">
                        U bent toegevoegd aan de wachtlijst voor <strong>{show.name}</strong>. 
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
                    </div>
                    <button onClick={onClose} className="btn-primary" style={{ marginTop: '20px' }}>
                        Terug naar kalender
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="waitlist-form-simple">
            <div className="waitlist-header">
                <div className="waitlist-header-icon">
                    <Icon id="clock" />
                </div>
                <h2 className="waitlist-title">Wachtlijst voor {show.name}</h2>
                <p className="waitlist-subtitle">{formattedDate}</p>
            </div>

            <div className="waitlist-info-card">
                <div className="info-icon">
                    <Icon id="info" />
                </div>
                <div className="info-content">
                    <h4>Show is momenteel vol</h4>
                    <p>Voeg jezelf toe aan de wachtlijst en we informeren je zodra er plaatsen beschikbaar komen.</p>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="waitlist-form">
                <div className="form-section">
                    <h4 className="section-title">
                        <Icon id="user" />
                        Persoonlijke gegevens
                    </h4>
                    
                    <div className="form-row">
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
                    </div>

                    <div className="form-row">
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
                    </div>

                    <div className="form-row">
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
                    </div>
                </div>

                <div className="form-section">
                    <h4 className="section-title">
                        <Icon id="users" />
                        Reservering details
                    </h4>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="guests" className="form-label">Aantal personen *</label>
                            <div className="number-input-wrapper">
                                <button 
                                    type="button" 
                                    className="number-btn minus"
                                    onClick={() => setGuests(Math.max(1, guests - 1))}
                                    disabled={guests <= 1}
                                >
                                    <Icon id="minus" />
                                </button>
                                <input 
                                    id="guests" 
                                    type="number" 
                                    className="number-input"
                                    value={guests} 
                                    min="1" 
                                    max="20"
                                    onChange={e => setGuests(Math.max(1, parseInt(e.target.value, 10) || 1))} 
                                    required 
                                />
                                <button 
                                    type="button" 
                                    className="number-btn plus"
                                    onClick={() => setGuests(Math.min(20, guests + 1))}
                                    disabled={guests >= 20}
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
                        Terug
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
