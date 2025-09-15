import React, { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';
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
            <form onSubmit={handleSubmit} className="modal-content card" onClick={e => e.stopPropagation()}>
                <div className="card-header">
                    <h3 className="card-title">Handmatige Reservering Toevoegen</h3>
                    <button type="button" onClick={onClose} className="close-btn" aria-label="Sluiten">
                        <Icon id="close" />
                    </button>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-12">
                            <div className="card mb-4">
                                <div className="card-body">
                                    <h4 className="card-title">{show.name}</h4>
                                    <p><Icon id="calendar" /> {new Date(date + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p><Icon id="theater" /> {show.type}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">
                            <div className="form-group">
                                <label htmlFor="salutation" className="form-label">Aanhef</label>
                                <select id="salutation" name="salutation" value={formData.salutation} onChange={handleInputChange} className="form-control">
                                    <option value="Dhr.">Dhr.</option>
                                    <option value="Mevr.">Mevr.</option>
                                    <option value="Familie">Familie</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-8">
                            <div className="form-group">
                                <label htmlFor="contactName" className="form-label">Naam *</label>
                                <input type="text" id="contactName" name="contactName" value={formData.contactName} onChange={handleInputChange} required placeholder="Voor- en achternaam" className="form-control" />
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="form-group">
                                <label htmlFor="companyName" className="form-label">Bedrijfsnaam (optioneel)</label>
                                <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Bedrijfsnaam" className="form-control" />
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">E-mail *</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="voorbeeld@email.nl" className="form-control" />
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="form-group">
                                <label htmlFor="phone" className="form-label">Telefoon</label>
                                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+31 6 12345678" className="form-control" />
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="form-group">
                                <label htmlFor="address" className="form-label">Adres</label>
                                <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Straatnaam" className="form-control" />
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="form-group">
                                <label htmlFor="houseNumber" className="form-label">Huisnummer</label>
                                <input type="text" id="houseNumber" name="houseNumber" value={formData.houseNumber} onChange={handleInputChange} placeholder="123A" className="form-control" />
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="form-group">
                                <label htmlFor="postalCode" className="form-label">Postcode</label>
                                <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="1234 AB" className="form-control" />
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="form-group">
                                <label htmlFor="city" className="form-label">Plaats</label>
                                <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Amsterdam" className="form-control" />
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="form-group">
                                <label htmlFor="guests" className="form-label">Aantal gasten *</label>
                                <input type="number" id="guests" name="guests" value={formData.guests} onChange={handleInputChange} min="1" required className="form-control" />
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="form-group">
                                <label htmlFor="drinkPackage" className="form-label">Drankenpakket</label>
                                <select id="drinkPackage" name="drinkPackage" value={formData.drinkPackage} onChange={handleInputChange} className="form-control">
                                    <option value="standard">Standaard (€{showType?.priceStandard})</option>
                                    <option value="premium">Premium (€{showType?.pricePremium})</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-12">
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
                        </div>
                        <div className="col-12">
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
                        </div>
                        <div className="col-12">
                            <div className="form-group">
                                <label htmlFor="celebrationName" className="form-label">Viering naam</label>
                                <input 
                                    type="text" 
                                    id="celebrationName" 
                                    name="celebrationName"
                                    value={formData.celebrationName}
                                    onChange={handleInputChange}
                                    placeholder="Jan's verjaardag"
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="form-group">
                                <label htmlFor="celebrationOccasion" className="form-label">Gelegenheid</label>
                                <input 
                                    type="text" 
                                    id="celebrationOccasion" 
                                    name="celebrationOccasion"
                                    value={formData.celebrationOccasion}
                                    onChange={handleInputChange}
                                    placeholder="Verjaardag, jubileum, etc."
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="form-group">
                                <label htmlFor="remarks" className="form-label">Opmerkingen</label>
                                <textarea 
                                    id="remarks" 
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleInputChange}
                                    placeholder="Bijzondere wensen, dieetwensen, etc."
                                    rows={3}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="form-group">
                                <label htmlFor="promoCode" className="form-label">Promocode</label>
                                <input 
                                    type="text" 
                                    id="promoCode" 
                                    name="promoCode"
                                    value={formData.promoCode}
                                    onChange={handleInputChange}
                                    placeholder="Promocode (optioneel)"
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="col-12">
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
                    </div>
                    <div className="card mt-4">
                        <div className="card-body">
                             <div className="row">
                                <div className="col">Aantal gasten:</div>
                                <div className="col text-right">{formData.guests}</div>
                            </div>
                            <div className="row">
                                <div className="col">Prijs per persoon:</div>
                                <div className="col text-right">€{showPrice}</div>
                            </div>
                            <hr />
                            <div className="row font-bold">
                                <div className="col">Totaal:</div>
                                <div className="col text-right">€{(showPrice || 0) * formData.guests}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-footer flex justify-between">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Annuleren</button>
                    <button type="submit" className="btn btn-primary"><Icon id="plus" /> Reservering Toevoegen</button>
                </div>
            </form>
        </div>
    );
};
