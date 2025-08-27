import React, { useState, useEffect } from 'react';
import { Icon } from '../UI/Icon';
import type { ShowEvent, Reservation, AppConfig } from '../../types/types';
import { i18n } from '../../config/config';

interface AddBookingModalProps {
    onClose: () => void;
    onAdd: (reservation: Omit<Reservation, 'id'>) => void;
    show: ShowEvent;
    date: string;
    config: AppConfig;
}

export const AddBookingModal: React.FC<AddBookingModalProps> = ({ 
    onClose, 
    onAdd, 
    show, 
    date, 
    config 
}) => {
    const [formData, setFormData] = useState({
        contactName: '',
        email: '',
        phone: '',
        guests: 2,
        address: '',
        houseNumber: '',
        postalCode: '',
        city: '',
        drinkPackage: 'standard' as 'standard' | 'premium',
        preShowDrinks: false,
        afterParty: false,
        remarks: '',
        salutation: 'Dhr.',
        companyName: '',
        celebrationName: '',
        celebrationOccasion: '',
        newsletter: false,
        promoCode: ''
    });

    const showType = config.showTypes.find(st => st.name === show.type);
    const showPrice = formData.drinkPackage === 'premium' ? showType?.pricePremium : showType?.priceStandard;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : 
                    type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const reservation: Omit<Reservation, 'id'> = {
            date: date,
            companyName: formData.companyName,
            salutation: formData.salutation,
            contactName: formData.contactName,
            address: formData.address,
            houseNumber: formData.houseNumber,
            postalCode: formData.postalCode,
            city: formData.city,
            phone: formData.phone,
            email: formData.email,
            guests: formData.guests,
            drinkPackage: formData.drinkPackage,
            preShowDrinks: formData.preShowDrinks,
            afterParty: formData.afterParty,
            remarks: formData.remarks,
            addons: {},
            celebrationName: formData.celebrationName,
            celebrationOccasion: formData.celebrationOccasion,
            newsletter: formData.newsletter,
            termsAccepted: true,
            totalPrice: (showPrice || 0) * formData.guests,
            promoCode: formData.promoCode,
            discountAmount: 0,
            checkedIn: false,
            status: 'confirmed',
            bookingSource: 'internal',
            createdAt: new Date().toISOString()
        };

        onAdd(reservation);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🎭 Handmatige Reservering Toevoegen</h3>
                    <button onClick={onClose} className="close-btn" aria-label="Sluiten">
                        <Icon id="close" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="show-info-card">
                        <h4>{show.name}</h4>
                        <p><Icon id="calendar" /> {new Date(date + 'T12:00:00').toLocaleDateString('nl-NL', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</p>
                        <p><Icon id="theater" /> {show.type}</p>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="salutation">Aanhef</label>
                            <select 
                                id="salutation" 
                                name="salutation"
                                value={formData.salutation}
                                onChange={handleInputChange}
                            >
                                <option value="Dhr.">Dhr.</option>
                                <option value="Mevr.">Mevr.</option>
                                <option value="Familie">Familie</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="contactName">Naam *</label>
                            <input 
                                type="text" 
                                id="contactName" 
                                name="contactName"
                                value={formData.contactName}
                                onChange={handleInputChange}
                                required 
                                placeholder="Voor- en achternaam"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="companyName">Bedrijfsnaam (optioneel)</label>
                            <input 
                                type="text" 
                                id="companyName" 
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                placeholder="Bedrijfsnaam"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">E-mail *</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required 
                                placeholder="voorbeeld@email.nl"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Telefoon</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+31 6 12345678"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Adres</label>
                            <input 
                                type="text" 
                                id="address" 
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Straatnaam"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="houseNumber">Huisnummer</label>
                            <input 
                                type="text" 
                                id="houseNumber" 
                                name="houseNumber"
                                value={formData.houseNumber}
                                onChange={handleInputChange}
                                placeholder="123A"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="postalCode">Postcode</label>
                            <input 
                                type="text" 
                                id="postalCode" 
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                placeholder="1234 AB"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="city">Plaats</label>
                            <input 
                                type="text" 
                                id="city" 
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="Amsterdam"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="guests">Aantal gasten *</label>
                            <input 
                                type="number" 
                                id="guests" 
                                name="guests"
                                value={formData.guests}
                                onChange={handleInputChange}
                                min="1" 
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="drinkPackage">Drankenpakket</label>
                            <select 
                                id="drinkPackage" 
                                name="drinkPackage"
                                value={formData.drinkPackage}
                                onChange={handleInputChange}
                            >
                                <option value="standard">Standaard (€{showType?.priceStandard})</option>
                                <option value="premium">Premium (€{showType?.pricePremium})</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <div className="checkbox-group">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        name="preShowDrinks"
                                        checked={formData.preShowDrinks}
                                        onChange={handleInputChange}
                                    />
                                    Pre-show drankjes
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="checkbox-group">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        name="afterParty"
                                        checked={formData.afterParty}
                                        onChange={handleInputChange}
                                    />
                                    After-party
                                </label>
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="celebrationName">Viering naam</label>
                            <input 
                                type="text" 
                                id="celebrationName" 
                                name="celebrationName"
                                value={formData.celebrationName}
                                onChange={handleInputChange}
                                placeholder="Jan's verjaardag"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="celebrationOccasion">Gelegenheid</label>
                            <input 
                                type="text" 
                                id="celebrationOccasion" 
                                name="celebrationOccasion"
                                value={formData.celebrationOccasion}
                                onChange={handleInputChange}
                                placeholder="Verjaardag, jubileum, etc."
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="remarks">Opmerkingen</label>
                            <textarea 
                                id="remarks" 
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                placeholder="Bijzondere wensen, dieetwensen, etc."
                                rows={3}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="promoCode">Promocode</label>
                            <input 
                                type="text" 
                                id="promoCode" 
                                name="promoCode"
                                value={formData.promoCode}
                                onChange={handleInputChange}
                                placeholder="Promocode (optioneel)"
                            />
                        </div>

                        <div className="form-group">
                            <div className="checkbox-group">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        name="newsletter"
                                        checked={formData.newsletter}
                                        onChange={handleInputChange}
                                    />
                                    Nieuwsbrief ontvangen
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="booking-summary">
                        <div className="summary-row">
                            <span>Aantal gasten:</span>
                            <span>{formData.guests}</span>
                        </div>
                        <div className="summary-row">
                            <span>Prijs per persoon:</span>
                            <span>€{showPrice}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Totaal:</span>
                            <span>€{(showPrice || 0) * formData.guests}</span>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Annuleren
                        </button>
                        <button type="submit" className="submit-btn">
                            <Icon id="plus" /> Reservering Toevoegen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
