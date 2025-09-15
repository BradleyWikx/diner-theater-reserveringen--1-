import React, { useState } from 'react';
import { Icon } from '../ui/Icon';
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
    const [drinkPackage, setDrinkPackage] = useState<'standard' | 'premium'>('standard');
    const [remarks, setRemarks] = useState('');
    const [acceptPartialBooking, setAcceptPartialBooking] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const waitlistEntry: Omit<WaitingListEntry, 'id'> = {
            name, 
            email, 
            phone, 
            guests, 
            date,
            showName: show.name,
            showType: show.type,
            drinkPackage,
            remarks,
            acceptPartialBooking,
            status: 'active',
            addedAt: new Date(),
            sourceChannel: 'website'
        };
        
        onAddToWaitingList(waitlistEntry);
        setSubmitted(true);
        
        // Reset form
        setName('');
        setEmail('');
        setPhone('');
        setGuests(1);
        setDrinkPackage('standard');
        setRemarks('');
        setAcceptPartialBooking(false);
        
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
            <div className="card">
                <div className="card-header text-center">
                    <Icon id="check" />
                    <h3 className="card-title">Toegevoegd aan wachtlijst!</h3>
                </div>
                <div className="card-body">
                    <p>
                        U bent succesvol toegevoegd aan de wachtlijst voor <strong>{show.name}</strong>. 
                        We sturen u een email zodra er plaatsen beschikbaar komen.
                    </p>
                    <div className="mt-4">
                        <p><strong>Datum:</strong> {formattedDate}</p>
                        <p><strong>Aantal:</strong> {guests} {guests === 1 ? 'persoon' : 'personen'}</p>
                        <p><strong>Email:</strong> {email}</p>
                    </div>
                    <button onClick={onClose} className="btn btn-primary mt-4 w-full">
                        <Icon id="arrow-left" />
                        Terug naar kalender
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <form onSubmit={handleSubmit} className="card">
            <div className="card-header">
                <h3 className="card-title">Plaats op wachtlijst</h3>
                <p>{show.name} - {formattedDate}</p>
            </div>
            <div className="card-body">
                <div className="form-group">
                    <label htmlFor="name" className="form-label">Naam</label>
                    <input type="text" id="name" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" id="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="phone" className="form-label">Telefoon</label>
                    <input type="tel" id="phone" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="guests" className="form-label">Aantal personen</label>
                    <input type="number" id="guests" className="form-control" value={guests} onChange={e => setGuests(parseInt(e.target.value))} min="1" required />
                </div>
                <div className="form-group">
                    <label className="form-label">Drankarrangement</label>
                    <select className="form-control" value={drinkPackage} onChange={e => setDrinkPackage(e.target.value as 'standard' | 'premium')}>
                        <option value="standard">Standaard</option>
                        <option value="premium">Premium</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="remarks" className="form-label">Opmerkingen</label>
                    <textarea id="remarks" className="form-control" value={remarks} onChange={e => setRemarks(e.target.value)}></textarea>
                </div>
                <div className="form-group">
                    <label className="flex items-center">
                        <input type="checkbox" checked={acceptPartialBooking} onChange={e => setAcceptPartialBooking(e.target.checked)} />
                        <span className="ml-2">Ik accepteer een deel van de boeking als niet alle plaatsen beschikbaar zijn.</span>
                    </label>
                </div>
            </div>
            <div className="card-footer flex justify-between">
                <button type="button" onClick={onClose} className="btn btn-secondary">Annuleren</button>
                <button type="submit" className="btn btn-primary">Plaats op wachtlijst</button>
            </div>
        </form>
    );
};
