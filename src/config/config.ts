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
    waitingList: 'Wachtlijst',
    fullyBooked: 'Uitverkocht',
    prevMonth: 'Vorige maand',
    nextMonth: 'Volgende maand',
    addAction: 'Toevoegen',
    addShowEventTitle: 'Nieuwe Voorstelling',
    cancel: 'Annuleren',
    showName: 'Voorstelling Naam',
    showType: 'Voorstelling Type',
    save: 'Opslaan',
    showsTypesCapacity: 'Voorstellingen & Capaciteit',
    bookingSettings: 'Reservering Instellingen',
    promoAndGifts: 'Promocodes & Cadeaus',
    archive: 'Archief',
    settings: 'Instellingen',
    saveChanges: 'Wijzigingen Opslaan',
    editReservation: 'Reservering Bewerken',
    numberOfGuests: 'Aantal Gasten',
    formPackage: 'Pakket',
    totalPrice: 'Totaalprijs',
    formCompany: 'Bedrijf',
    formSalutation: 'Aanhef',
    formContactPerson: 'Contactpersoon',
    formAddress: 'Adres',
    formHouseNumber: 'Huisnummer',
    formPostalCode: 'Postcode',
    formCity: 'Plaats',
    formPhone: 'Telefoon',
    formEmail: 'E-mail',
    formRemarks: 'Opmerkingen',
    promoCodes: 'Promocodes',
    settingsPromoDescription: 'Beheer promocodes en kortingen',
    settingsShowsDescription: 'Beheer voorstellingen en programma',
    settingsTypesDescription: 'Beheer types voorstellingen',
    settingsBookingDescription: 'Beheer reserveringsregels',
    code: 'Code',
    discountAmount: 'Kortingsbedrag',
    status: 'Status',
    actions: 'Acties',
    typePercentage: 'Percentage',
    typeFixed: 'Vast bedrag',
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
    // Additional missing properties
    date: 'Datum',
    capacity: 'Capaciteit',
    addShow: 'Voorstelling toevoegen',
    codeApplied: 'Code toegepast',
    voucherValidationError: 'Voucher validatie fout',
    voucherAppliedSuccess: 'Voucher succesvol toegepast',
    invalidCode: 'Ongeldige code',
    showInfo: 'Voorstelling informatie',
    awaitingApproval: 'Wacht op goedkeuring',
    provisionalBookingConfirm: 'Voorlopige reservering bevestigen',
    close: 'Sluiten',
    wizardStep1Title: 'Stap 1: Kies uw pakket',
    wizardStep1SubTitle: 'Selecteer het gewenste pakket',
    standardPackage: 'Standaard Pakket',
    packageStandard: 'Standaard',
    premiumPackage: 'Premium Pakket',
    packagePremium: 'Premium',
    provisionalBookingWarning: 'Dit is een voorlopige reservering',
    wizardStep2Title: 'Stap 2: Extra opties',
    wizardStep2SubTitle: 'Selecteer eventuele extra opties',
    addonMin25: 'Minimum 25 euro',
    wizardStep4Title: 'Stap 4: Persoonlijke gegevens',
    celebrationName: 'Naam viering',
    celebrationOccasion: 'Gelegenheid',
    formConsent: 'Toestemming',
    consentNewsletter: 'Nieuwsbrief toestemming',
    consentTerms: 'Algemene voorwaarden',
    wizardStep5Title: 'Stap 5: Overzicht',
    yourSelection: 'Uw selectie',
    edit: 'Bewerken',
    pricing: 'Prijzen',
    formAddons: 'Extra opties',
    joinWaitingList: 'Wachtlijst',
    waitingListAvailable: 'Wachtlijst beschikbaar',
    apiKeyMissing: 'API sleutel ontbreekt',
    aiError: 'AI fout',
    deleteShow: 'Voorstelling verwijderen',
    deleteShowConfirm: 'Voorstelling verwijderen bevestigen',
    showDeleted: 'Voorstelling verwijderd',
    selectDatePrompt: 'Selecteer een datum',
    noShowOnDate: 'Geen voorstelling op deze datum',
    startCheckIn: 'Inchecken starten',
    generating: 'Genereren',
    generateSummary: 'Samenvatting genereren',
    showClosedForBookings: 'Voorstelling gesloten voor reserveringen',
    showOpenForBookings: 'Voorstelling open voor reserveringen',
    aiSummary: 'AI Samenvatting',
    reservations: 'Reserveringen',
    guests: 'Gasten',
    fullName: 'Volledige naam',
    approveBooking: 'Reservering goedkeuren',
    denyBooking: 'Reservering afwijzen',
    checkedIn: 'Ingecheckt',
    waiting: 'Wachtend',
    deleteConfirmation: 'Verwijderen bevestigen',
    deleteConfirm: 'Verwijderen',
    noReservations: 'Geen reserveringen',
    noWaitingList: 'Geen wachtlijst',
    customerDetailTitle: 'Klant Details',
    backToCustomers: 'Terug naar klanten',
    totalBookings: 'Totaal reserveringen',
    totalSpent: 'Totaal uitgegeven',
    lastVisit: 'Laatste bezoek',
    bookingHistory: 'Reserveringsgeschiedenis',
    show: 'Voorstelling',
    waitlist: 'Wachtlijst',
    waitlistDescription: 'Wachtlijst beschrijving',
    totalWaitlist: 'Totaal wachtlijst',
    statusActive: 'Status actief',
    statusNotified: 'Status genotificeerd',
    statusConverted: 'Status geconverteerd',
    statusExpired: 'Status verlopen',
    notifyWaitlist: 'Wachtlijst notificeren',
    convertToBooking: 'Omzetten naar reservering',
    removeFromWaitlist: 'Verwijderen van wachtlijst',
    voucherDeleteConfirm: 'Voucher verwijderen bevestigen',
    voucherArchiveConfirm: 'Voucher archiveren bevestigen',
    voucherRestoreConfirm: 'Voucher herstellen bevestigen',
    voucherArchived: 'Voucher gearchiveerd',
    voucherActive: 'Voucher actief',
    voucherUsed: 'Voucher gebruikt',
    voucherExpired: 'Voucher verlopen',
    voucherExpiringSoon: 'Voucher verloopt binnenkort',
    theaterVouchers: 'Theater vouchers',
    createVoucher: 'Voucher aanmaken',
    voucherCode: 'Voucher code',
    voucherValue: 'Voucher waarde',
    issueDate: 'Uitgiftedatum',
    expiryDate: 'Vervaldatum',
    voucherStatus: 'Voucher status',
    voucherNotes: 'Voucher notities',
    voucherEdit: 'Voucher bewerken',
    extendExpiry: 'Vervaldatum verlengen',
    voucherRestore: 'Voucher herstellen',
    voucherArchive: 'Voucher archiveren',
    voucherDelete: 'Voucher verwijderen',
    overrideProtectionWarning: 'Bescherming overschrijven waarschuwing',
    proceedAnyway: 'Toch doorgaan',
    bulkCapacityManagement: 'Bulk capaciteit beheer',
    capacityManagementTitle: 'Capaciteit beheer titel',
    capacityManagementDescription: 'Capaciteit beheer beschrijving',
    thisWeek: 'Deze week',
    thisMonth: 'Deze maand',
    noShowsThisWeek: 'Geen voorstellingen deze week',
    noShowsThisMonth: 'Geen voorstellingen deze maand',
    booked: 'Gereserveerd',
    internal: 'Intern',
    external: 'Extern',
    remaining: 'Resterend',
    manualCapacityOverride: 'Handmatige capaciteit overschrijving',
    addExternalBooking: 'Externe reservering toevoegen',
    settingsSaved: 'Instellingen opgeslagen',
    deleteItemConfirmTitle: 'Item verwijderen bevestigen titel',
    deleteItemConfirmMessage: 'Item verwijderen bevestigen bericht',
    itemDeleted: 'Item verwijderd',
    archiveConfirmTitle: 'Archiveren bevestigen titel',
    archiveConfirmMessage: 'Archiveren bevestigen bericht',
    showTitles: 'Voorstelling titels',
    archiveItem: 'Item archiveren',
    delete: 'Verwijderen',
    addNew: 'Nieuwe toevoegen',
    showTypes: 'Voorstelling types',
    defaultCapacity: 'Standaard capaciteit',
    priceStandard: 'Prijs standaard',
    pricePremium: 'Prijs premium',
    bookingRules: 'Reserveringsregels',
    minGuestsPerBooking: 'Minimum gasten per reservering',
    maxGuestsPerBooking: 'Maximum gasten per reservering',
    bookingCutoffHours: 'Reservering afsnijdtijd uren',
    viewCalendar: 'Kalender bekijken',
    schedule: 'Schema',
    allReservations: 'Alle reserveringen',
    approvals: 'Goedkeuringen',
    vouchers: 'Vouchers',
    analytics: 'Analytics',
    customers: 'Klanten',
    capacityManagement: 'Capaciteit beheer',
    reports: 'Rapporten',
    reservationUpdated: 'Reservering bijgewerkt',
    waitingListConfirmed: 'Wachtlijst bevestigd',
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
    ],
    dayNames: [
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
        {
            id: 'merch_1',
            name: 'Luxe Programmaboekje',
            price: 12.50,
            description: 'Een prachtig aandenken vol met foto\'s en verhalen.',
            imageUrl: 'https://placehold.co/100x100/2a2a2a/f0b429?text=Boekje'
        },
        {
            id: 'merch_2',
            name: 'Fles Huiswijn',
            price: 24.00,
            description: 'Keuze uit rood, wit of rosé. Geniet thuis na.',
            imageUrl: 'https://placehold.co/100x100/2a2a2a/f0b429?text=Wijn'
        }
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
            type: 'value' as const,
            value: 100,
            persons: 0, // Default voor value type
            packageType: 'standard' as const,
            issueDate: '2024-01-15',
            expiryDate: '2025-01-15',
            status: 'active' as const,
            extendedCount: 0,
            notes: 'Nieuwjaarsactie'
        },
        {
            id: 'tv2',
            code: 'TB2024-C3D4',
            type: 'value' as const,
            value: 50,
            persons: 0, // Default voor value type
            packageType: 'standard' as const,
            issueDate: '2024-06-01',
            expiryDate: '2025-06-01',
            status: 'used' as const,
            usedDate: '2024-08-15',
            usedReservationId: '123',
            extendedCount: 0
        },
        {
            id: 'tv3',
            code: 'TB2024-DEMO1',
            type: 'persons' as const,
            value: 0, // Default voor persons type
            persons: 2,
            packageType: 'standard' as const,
            issueDate: '2024-08-01',
            expiryDate: '2025-08-01',
            status: 'active' as const,
            extendedCount: 0,
            notes: 'Demo personenbon voor 2 personen standaard'
        },
        {
            id: 'tv4',
            code: 'TB2024-DEMO2',
            type: 'persons' as const,
            value: 0, // Default voor persons type
            persons: 4,
            packageType: 'premium' as const,
            issueDate: '2024-08-01',
            expiryDate: '2025-08-01',
            status: 'active' as const,
            extendedCount: 0,
            notes: 'Demo personenbon voor 4 personen premium'
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
