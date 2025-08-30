// Configuration file for theater reservation system - CLEAN VERSION
// Contains all application configuration including i18n strings and default settings

import type { AppConfig } from '../types/types';

// Utility function to calculate doors open time (30 minutes before show start)
export const calculateDoorsOpenTime = (showStartTime: string): string => {
    const [hours, minutes] = showStartTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes - 30; // 30 minutes earlier
    
    if (totalMinutes < 0) {
        // Handle case where doors would open the day before
        const adjustedMinutes = totalMinutes + 24 * 60;
        const newHours = Math.floor(adjustedMinutes / 60);
        const newMinutes = adjustedMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    }
    
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};

// Utility function to calculate end time (3.5 hours after start time)
export const calculateEndTime = (showStartTime: string): string => {
    const [hours, minutes] = showStartTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + (3.5 * 60); // Add 3.5 hours (210 minutes)
    
    // Handle next day overflow
    const adjustedMinutes = totalMinutes % (24 * 60);
    const newHours = Math.floor(adjustedMinutes / 60);
    const newMinutes = adjustedMinutes % 60;
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};

// Internationalization (Dutch) - all UI text strings
export const i18n = {
    header: {
        title: ''
    },
    bookShow: {
        title: 'Voorstelling Boeken',
        selectShow: 'Kies een voorstelling:',
        selectDate: 'Selecteer datum:',
        selectTime: 'Selecteer tijd:',
        seatsAvailable: 'plaatsen beschikbaar',
        closedDate: 'Gesloten op deze datum',
        bookButton: 'Boek nu',
        showTimes: 'Tijden',
        doorsOpen: 'Deuren open',
        showStarts: 'Voorstelling begint',
        showEnds: 'Voorstelling eindigt'
    },
    adminPanel: {
        title: 'Admin Beheer',
        showManagement: 'Voorstellingen Beheren',
        reservationsTitle: 'Reserveringen',
        showsTitle: 'Voorstellingen',
        configTitle: 'Configuratie',
        addShow: 'Nieuwe voorstelling toevoegen',
        editShow: 'Voorstelling bewerken',
        deleteShow: 'Verwijderen',
        toggleClosed: 'Open/Sluit',
        theaterBondsTitle: 'Theaterbonnen'
    },
    form: {
        name: 'Naam',
        email: 'E-mail',
        phone: 'Telefoon',
        address: 'Adres',
        city: 'Plaats',
        guests: 'Aantal gasten',
        specialRequests: 'Bijzondere verzoeken',
        submit: 'Reservering bevestigen',
        required: 'Verplicht veld'
    },
    reservation: {
        confirmationTitle: 'Reservering bevestigd!',
        confirmationText: 'Uw reservering is succesvol ontvangen.',
        reservationNumber: 'Reserveringsnummer',
        totalPrice: 'Totaalprijs',
        paymentInstructions: 'Betaalinstructies worden per e-mail verzonden.',
        paymentText: '💳 Betaling via iDEAL volgt per e-mail binnen 10 minuten.',
        thanksText: '🎭 Bedankt voor uw reservering! Tot ziens in het theater.',
        details: 'Reserveringsdetails',
        contact: 'Contactgegevens'
    },
    prices: {
        adult: 'Volwassenen',
        child: 'Kinderen (4-12)',
        senior: 'Senioren (65+)',
        perPerson: 'per persoon'
    },
    dates: {
        selectDate: 'Selecteer een datum',
        noShows: 'Geen voorstellingen beschikbaar'
    },
    errors: {
        fillAllFields: 'Vul alle verplichte velden in',
        invalidEmail: 'Voer een geldig e-mailadres in',
        invalidPhone: 'Voer een geldig telefoonnummer in',
        selectShow: 'Selecteer een voorstelling',
        minimumGuests: 'Minimum aantal gasten is 1',
        maximumGuests: 'Maximum aantal gasten bereikt',
        noAvailableShows: 'Geen beschikbare voorstellingen voor deze datum',
        bookingFailed: 'Reservering mislukt. Probeer het opnieuw.',
        networkError: 'Netwerkfout. Controleer uw verbinding.',
        soldOut: 'Deze voorstelling is uitverkocht',
        bookingDeadline: 'De boekingstermijn voor deze voorstelling is verstreken',
        invalidPromoCode: 'Ongeldige promocode',
        expiredPromoCode: 'Promocode is verlopen',
        usedPromoCode: 'Promocode is al gebruikt'
    },
    success: {
        reservationSaved: 'Reservering succesvol opgeslagen',
        emailSent: 'Bevestigingsmail verzonden',
        configUpdated: 'Configuratie bijgewerkt',
        showAdded: 'Voorstelling toegevoegd',
        showUpdated: 'Voorstelling bijgewerkt',
        showDeleted: 'Voorstelling verwijderd'
    },
    buttons: {
        save: 'Opslaan',
        cancel: 'Annuleren',
        edit: 'Bewerken',
        delete: 'Verwijderen',
        add: 'Toevoegen',
        back: 'Terug',
        next: 'Volgende',
        previous: 'Vorige',
        close: 'Sluiten',
        confirm: 'Bevestigen',
        reset: 'Reset'
    },
    months: [
        'januari', 'februari', 'maart', 'april', 'mei', 'juni',
        'juli', 'augustus', 'september', 'oktober', 'november', 'december'
    ],
    days: [
        'zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'
    ],
    daysShort: [
        'zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'
    ]
};

// Default application configuration
export const defaultConfig: AppConfig = {
    showNames: [
        { id: 'welkom-in-de-buurt', name: 'Welkom in de Buurt', archived: false, imageUrl: 'https://placehold.co/150x150/2a2a2a/f0b429?text=Voorstelling' },
        { id: 'het-leven-volgens-fred', name: 'Het Leven Volgens Fred', archived: false, imageUrl: 'https://placehold.co/150x150/2a2a2a/f0b429?text=Fred' },
        { id: 'de-gelukkige-huisvrouw', name: 'De Gelukkige Huisvrouw', archived: false, imageUrl: 'https://placehold.co/150x150/2a2a2a/f0b429?text=Huisvrouw' },
        { id: 'nachtcafe', name: 'Nachtcafé', archived: false, imageUrl: 'https://placehold.co/150x150/2a2a2a/f0b429?text=Nachtcafé' },
        { id: 'de-verloedering', name: 'De Verloedering', archived: false, imageUrl: 'https://placehold.co/150x150/2a2a2a/f0b429?text=Verloedering' },
    ],
    showTypes: [
        { 
            id: 'diner-theater', 
            name: 'Diner Theater', 
            archived: false, 
            defaultCapacity: 150, 
            priceStandard: 55, 
            pricePremium: 65,
            defaultStartTime: '18:00',
            defaultEndTime: '21:30', // 18:00 + 3.5 uur = 21:30
            allowCustomTimes: false
        },
        { 
            id: 'lunch-theater', 
            name: 'Lunch Theater', 
            archived: false, 
            defaultCapacity: 100, 
            priceStandard: 35, 
            pricePremium: 45,
            defaultStartTime: '12:00',
            defaultEndTime: '15:30', // 12:00 + 3.5 uur = 15:30
            allowCustomTimes: false
        },
        { 
            id: 'besloten-feest', 
            name: 'Besloten Feest', 
            archived: false, 
            defaultCapacity: 200, 
            priceStandard: 75, 
            pricePremium: 90,
            defaultStartTime: '19:00',
            defaultEndTime: '22:30', // 19:00 + 3.5 uur = 22:30
            allowCustomTimes: true
        },
        { 
            id: 'team-meeting', 
            name: 'Team Meeting', 
            archived: false, 
            defaultCapacity: 30, 
            priceStandard: 0, 
            pricePremium: 0,
            defaultStartTime: '10:00',
            defaultEndTime: '13:30', // 10:00 + 3.5 uur = 13:30
            allowCustomTimes: true
        },
        { 
            id: 'schoonmaak', 
            name: 'Schoonmaak', 
            archived: false, 
            defaultCapacity: 10, 
            priceStandard: 0, 
            pricePremium: 0,
            defaultStartTime: '09:00',
            defaultEndTime: '12:30', // 09:00 + 3.5 uur = 12:30
            allowCustomTimes: false
        },
    ],
    capSlogans: [
        "Meer pret in bed met een beetje vet",
        "Veel te dun is ook geen fun",
        "Lekker gluren naar de buren",
        "Mijn ziel heeft een ventiel",
        "Geen gezeik in onze wijk"
    ],
    merchandise: [
        { id: 'welcomePack', name: "'Welkom in de Buurt' Feestpakket", price: 10, description: "Compleet pakket voor een feestelijke avond", imageUrl: 'https://placehold.co/150x150/2a2a2a/f0b429?text=Pakket' },
        { id: 'backpack', name: "Duurzame Rugzak", price: 5, description: "Milieuvriendelijke rugzak met theater logo", imageUrl: 'https://placehold.co/150x150/2a2a2a/f0b429?text=Rugzak' },
        { id: 'ledHeadband', name: "LED Diadeem 'Ogen op Steeltjes'", price: 3.50, description: "Lichtgevend diadeem voor extra plezier", imageUrl: 'https://placehold.co/150x150/2a2a2a/f0b429?text=Diadeem' },
        { id: 'sunglasses', name: "Zonnebril 'Gluren naar de Buren'", price: 3.50, description: "Coole zonnebril in theater stijl", imageUrl: 'https://placehold.co/150x150/2a2a2a/f0b429?text=Zonnebril' },
        { id: 'foamstick', name: "Fun-Foamstick 'Zwieren & Zwaaien'", price: 2, description: "Foam stick voor extra animatie", imageUrl: 'https://placehold.co/150x150/2a2a2a/f0b429?text=Foamstick' },
        { id: 'flowerWreath', name: "Lichtgevende Bloemenkrans", price: 3.50, description: "Mooie bloemenkrans met LED verlichting", imageUrl: 'https://placehold.co/150x150/2a2a2a/f0b429?text=Krans' },
        { id: 'flowersForNeighbor', name: "De Buren in de Bloemen", price: 20, description: "Prachtig boeket voor de buren", imageUrl: 'https://placehold.co/150x150/2a2a2a/f0b429?text=Bloemen' },
        { id: 'preShowDrinks', name: "Borrel Vooraf", price: 15, description: "Gezellige borrel voorafgaand aan de voorstelling" },
        { id: 'afterParty', name: "AfterParty", price: 15, description: "Verleng de avond met een exclusieve afterparty" },
    ],
    promoCodes: [
        { id: 'VROEGBOEK', code: 'VROEGBOEK', type: 'percentage', value: 10, isActive: true },
        { id: 'GROEP20', code: 'GROEP20', type: 'fixed', value: 50, isActive: true },
        { id: 'NIEUWKLANT', code: 'NIEUWKLANT', type: 'percentage', value: 5, isActive: true },
    ],
    theaterVouchers: [
        {
            id: 'tv1',
            code: 'TB2024-A1B2',
            value: 100,
            issueDate: '2024-01-15',
            expiryDate: '2025-01-15',
            status: 'active',
            extendedCount: 0,
            notes: 'Nieuwjaarsactie'
        },
        {
            id: 'tv2',
            code: 'TB2024-C3D4',
            value: 50,
            issueDate: '2024-06-01',
            expiryDate: '2025-06-01',
            status: 'used',
            usedDate: '2024-08-15',
            usedReservationId: '123',
            extendedCount: 0
        },
    ],
    bookingSettings: {
        minGuests: 1,
        maxGuests: 999,
        bookingCutoffHours: 4,
    },
    prices: {
        preShowOrAfterParty: 15,
        cap: 5,
    }
};
