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
    
    return (
        <div className="waiting-list-form">
            <button type="button" className="wizard-close-btn" onClick={onClose} aria-label={i18n.close}><Icon id="close"/></button>
            <h3>{i18n.waitingListFormTitle.replace('{showName}', show.name)}</h3>
            <p className="show-info-date">{formattedDate}</p>
            <p className="info-text">{i18n.waitingListInfo}</p>
            {submitted && <div className="confirmation-message">{i18n.waitingListConfirmed}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group"><label htmlFor="name">{i18n.fullName}</label><input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required /></div>
                <div className="form-group"><label htmlFor="email">E-mailadres</label><input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                <div className="form-group"><label htmlFor="phone">Telefoonnummer</label><input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required /></div>
                <div className="form-group"><label htmlFor="guests">{i18n.numberOfGuests}</label><input id="guests" type="number" value={guests} min="1" onChange={e => setGuests(parseInt(e.target.value, 10))} required /></div>
                <button type="submit" className="submit-btn">{i18n.joinWaitingList}</button>
            </form>
        </div>
    )
};
