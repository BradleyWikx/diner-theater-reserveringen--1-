// Types and Interfaces for Theater Reservation System

export interface ShowEvent {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: string;
  capacity: number;
  isClosed?: boolean;
  manualCapacityOverride?: number; // Admin can override default capacity
  externalBookings?: number; // Track external bookings separately
  startTime?: string; // HH:MM format - custom tijd of default van ShowType
  endTime?: string; // HH:MM format - custom tijd of default van ShowType
}

export interface InternalEvent {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'repetitie' | 'besloten-feest' | 'teammeeting' | 'onderhoud' | 'techniek' | 'catering' | 'schoonmaak' | 'andere';
  title: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  notes?: string;
  color?: string;
  assignedStaff?: string[]; // Toegewezen personeel
}

export interface SchedulePrintOptions {
  period: 'custom' | 'week' | 'month' | 'all';
  format: 'detailed' | 'compact' | 'management';
  includePublicShows: boolean;
  includeInternalEvents: boolean;
  includeNotes: boolean;
  startDate: string;
  endDate: string;
}

export interface ManagementReportData {
  showName: string;
  date: string;
  capacity: number;
  booked: number;
  available: number;
  occupancyRate: number;
  revenue: number;
  showType: string;
}

export interface AddonQuantities {
    [key: string]: number; // Allow dynamic keys for merchandise and caps
}

export interface Reservation {
    id: string; // Firestore document ID
    date: string; // YYYY-MM-DD
    companyName?: string;
    salutation: string;
    contactName: string;
    address: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country?: string; // Land selectie (BE, NL, DE, FR, LU, OTHER)
    customCountry?: string; // Aangepast land als OTHER gekozen
    phone: string;
    phoneCode?: string; // Landcode voor telefoon (+32, +31, etc.)
    customPhoneCode?: string; // Aangepaste landcode
    email: string;
    guests: number;
    drinkPackage: 'standard' | 'premium';
    preShowDrinks: boolean;
    afterParty: boolean;
    remarks?: string;
    addons: AddonQuantities;
    celebrationName?: string;
    celebrationOccasion?: string;
    newsletter: boolean;
    termsAccepted: boolean;
    totalPrice: number;
    promoCode?: string;
    discountAmount?: number;
    checkedIn: boolean;
    status: 'confirmed' | 'provisional' | 'waitlisted' | 'cancelled'; // Enhanced booking status
    bookingSource: 'internal' | 'external'; // Track booking source
    createdAt: string; // Timestamp for analytics
    approvedBy?: string; // Admin who approved provisional booking
    // STAP 6: New fields for allergies and billing address
    allergies?: string; // Allergieën en dieetwensen - heel belangrijk voor restaurant
    differentBillingAddress?: boolean; // Factuuradres wijkt af van contactadres
    billingCompany?: string; // Bedrijfsnaam voor factuur
    billingContact?: string; // Contactpersoon voor factuur
    billingAddress?: string; // Factuuradres
    billingHouseNumber?: string; // Huisnummer factuuradres
    billingPostalCode?: string; // Postcode factuuradres  
    billingCity?: string; // Plaats factuuradres
    billingInstructions?: string; // Bijzonderheden factuurafhandeling
}

export interface WaitingListEntry {
    id: string; // Firestore document ID
    name: string;
    email: string;
    phone: string;
    guests: number;
    date: string; // YYYY-MM-DD
    addedAt?: Date;
    status?: 'active' | 'notified' | 'converted' | 'expired' | 'removed';
    notificationsSent?: number;
    lastNotificationAt?: Date;
    priority?: number;
    responseDeadline?: Date;
    reservationId?: string; // Changed to string for Firestore
    // Phase 3: Analytics tracking
    sourceChannel?: 'website' | 'phone' | 'email' | 'walk-in' | 'referral';
    conversionScore?: number; // 0-100 likelihood to convert
    customerSegment?: 'vip' | 'regular' | 'new' | 'corporate';
    priceFlexibility?: 'high' | 'medium' | 'low'; // willingness to pay premium
    notes?: string;
}

// New Firestore-ready types

export interface Table {
    id: string; // Firestore document ID
    number: number;
    capacity: number;
    type: 'regular' | 'vip' | 'accessibility';
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    location: string; // e.g., 'main-floor', 'balcony', 'private-room'
    features: string[]; // e.g., ['wheelchair-accessible', 'near-stage', 'quiet']
    notes?: string;
    isActive: boolean;
}

export interface MenuItem {
    id: string; // Firestore document ID
    name: string;
    description: string;
    price: number;
    category: 'appetizer' | 'main' | 'dessert' | 'beverage' | 'special';
    dietaryInfo: string[]; // e.g., ['vegetarian', 'gluten-free', 'vegan']
    ingredients: string[];
    allergens: string[];
    isAvailable: boolean;
    preparationTime: number; // minutes
    popularity: number; // 1-5 rating
    imageUrl?: string;
    calories?: number;
    isSpecial: boolean;
    seasonalAvailability?: string; // e.g., 'winter', 'summer'
}

export interface MerchItem {
    id: string; // Firestore document ID
    name: string;
    description: string;
    price: number;
    costPrice: number;
    category: 'apparel' | 'programs' | 'gifts' | 'collectibles' | 'caps' | 'accessories';
    type: string; // specific subcategory like 'baseball-cap', 'hoodie', 'magnet'
    stock: number;
    lowStockThreshold: number;
    sizes?: string[]; // for apparel items
    colors?: string[]; // available colors
    imageUrl: string;
    galleryImages?: string[];
    tags: string[];
    isActive: boolean;
    isFeatured: boolean;
    weight?: number; // for shipping calculations
    dimensions?: string; // e.g., "10x15x5 cm"
    supplier?: string;
    supplierCode?: string;
    totalSold: number;
    revenue: number;
    averageRating: number;
    reviewCount: number;
    createdAt: string;
    updatedAt: string;
}

// Phase 3: Analytics Interfaces
export interface AnalyticsData {
    waitlistMetrics: WaitlistMetrics;
    conversionMetrics: ConversionMetrics;
    revenueMetrics: RevenueMetrics;
    customerInsights: CustomerInsights;
    predictiveMetrics: PredictiveMetrics;
}

export interface WaitlistMetrics {
    totalActive: number;
    averageWaitTime: number; // in days
    conversionRate: number; // percentage
    notificationResponseRate: number;
    dropOffRate: number;
    peakRequestTimes: { hour: number; count: number }[];
}

export interface ConversionMetrics {
    dailyConversions: { date: string; count: number }[];
    channelPerformance: { channel: string; rate: number }[];
    segmentConversion: { segment: string; rate: number }[];
    timeToConversion: number; // average hours
}

export interface RevenueMetrics {
    waitlistRevenuePotential: number;
    actualWaitlistRevenue: number;
    averageWaitlistOrderValue: number;
    revenueByShow: { showDate: string; revenue: number; potential: number }[];
}

export interface CustomerInsights {
    repeatWaitlistCustomers: number;
    vipWaitlistRatio: number;
    averageGroupSize: number;
    mostRequestedShows: { date: string; requests: number }[];
}

export interface PredictiveMetrics {
    expectedCancellations: { date: string; probability: number }[];
    optimalPricing: { date: string; suggestedPrice: number; confidence: number }[];
    demandForecast: { date: string; expectedDemand: number }[];
    notificationOptimalTiming: { hour: number; responseRate: number }[];
}

export type View = 'book' | 'admin';
export type AdminView = 'dashboard' | 'calendar' | 'reservations' | 'customers' | 'settings' | 'capacity' | 'reports' | 'customerDetail' | 'approvals' | 'waitlist' | 'analytics' | 'vouchers' | 'schedule';
export type SettingsTab = 'shows' | 'booking' | 'merchandise' | 'promo' | 'archive';

// Package management interfaces verwijderd - we gebruiken simpele merchandise lijst

export interface EditableItem {
    id: string;
    name: string;
    price: number;
    imageUrl?: string; // Optioneel, voor een klein icoontje
    description?: string; // Korte omschrijving toevoegen
}

export interface ArchivableItem {
    id: string;
    name: string;
    archived: boolean;
    imageUrl?: string;
}

export interface ShowType extends ArchivableItem {
    defaultCapacity: number;
    priceStandard: number;
    pricePremium: number;
    color?: string; // Kleur voor kalender weergave
    showInLegend?: boolean; // Of dit type getoond moet worden in de legenda
    defaultStartTime?: string; // HH:MM format, bijvoorbeeld "19:30"
    defaultEndTime?: string; // HH:MM format, bijvoorbeeld "22:30"
    allowCustomTimes?: boolean; // Of admins aangepaste tijden kunnen instellen
}

export interface PromoCode {
    id: string;
    code: string;
    description: string; // bv. "Zomeractie 2025"
    type: 'percentage' | 'fixed';
    value: number;
    isActive: boolean;

    // --- NIEUWE REGELS & LIMIETEN ---
    validFrom?: string; // Startdatum (YYYY-MM-DD)
    validUntil?: string; // Einddatum (YYYY-MM-DD)

    usageLimit?: number; // Hoe vaak de code in totaal gebruikt mag worden
    usageCount: number;  // Hoe vaak de code al is gebruikt (voor tracking)

    minBookingValue?: number; // Minimum bestelwaarde om de code te gebruiken

    // Beperk tot specifieke shows
    appliesToShows?: string[]; // Array van show names
    appliesToShowTypes?: string[]; // Array van show types
}

export interface GiftCard {
    id: string;
    code: string;
    initialBalance: number;
    currentBalance: number;
    isActive: boolean;
}

// --- APPROVAL SYSTEM INTERFACES ---

export interface BookingApproval {
    id: string;
    bookingId: string;
    reservationId: string; // Changed to string for Firestore
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Date;
    processedAt?: Date;
    processedBy?: string;
    notes?: string;
    escalated: boolean;
    priority: 'low' | 'medium' | 'high';
    autoApprovalEligible: boolean;
    rejectionReason?: string;
    capacityOverride: number; // How much capacity would be exceeded
    originalCapacity: number;
    requestedCapacity: number;
}

export interface ApprovalRule {
    id: string;
    name: string;
    conditions: ApprovalCondition[];
    action: 'auto_approve' | 'auto_reject' | 'require_approval';
    active: boolean;
}

export interface ApprovalCondition {
    type: 'capacity_exceed' | 'guest_count' | 'time_before_show' | 'customer_tier';
    operator: 'greater_than' | 'less_than' | 'equals' | 'between';
    value: number | string;
    secondValue?: number; // For 'between' operator
}

// --- WAITLIST SYSTEM INTERFACES ---

export interface WaitlistEntry {
    id: string; // Firestore document ID
    customerId: string;
    reservationId?: string; // Reference to original reservation if converted - changed to string
    showId: string;
    showDate: string; // YYYY-MM-DD
    showName: string;
    showType: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    requestedGuests: number;
    priority: number;
    addedAt: Date;
    notificationsSent: number;
    lastNotificationAt?: Date;
    responseDeadline?: Date;
    status: 'active' | 'notified' | 'converted' | 'expired' | 'removed';
    preferences: {
        acceptPartialBooking: boolean;
        maxWaitTime: number; // days
        preferredDates: string[]; // YYYY-MM-DD
    };
    conversionNotes?: string;
    notificationHistory: WaitlistNotification[];
}

export interface WaitlistNotification {
    id: string;
    sentAt: Date;
    type: 'availability_alert' | 'position_update' | 'conversion_offer';
    message: string;
    responseRequired: boolean;
    responseDeadline?: Date;
    responded: boolean;
    responseAt?: Date;
    responseType?: 'accept' | 'decline' | 'partial_accept';
}

export interface Customer {
    email: string;
    name: string;
    totalBookings: number;
    totalSpent: number;
    firstVisit: string;
    lastVisit: string;
    reservations: Reservation[];
}

// 🎭 NIEUWE THEATERBON INTERFACE - Flexibel systeem met waardebon en personenbon
export interface TheaterVoucher {
    id: string;
    code: string;
    type: 'value' | 'persons'; // HET NIEUWE TYPE VELD

    value: number; // Voor type 'value', het bedrag in euro's
    persons: number; // Voor type 'persons', het aantal personen
    packageType: 'standard' | 'premium'; // Voor type 'persons', welk arrangement

    issueDate: string;               // Uitgiftedatum
    expiryDate: string;              // Vervaldatum (standaard 1 jaar)
    status: 'active' | 'used' | 'expired' | 'extended' | 'archived';
    notes?: string;                  // Optionele notities

    // Velden die bijgehouden worden na gebruik
    usedDate?: string;               // Datum van gebruik
    usedReservationId?: string;      // Reservering waar bon gebruikt is - changed to string
    extendedCount: number;           // Aantal keer verlengd
    archivedDate?: string;           // Datum van archivering
    archivedReason?: string;         // Reden van archivering
}

// Oude shop interfaces verwijderd - we gebruiken nu alleen simple EditableItem

export interface AppConfig {
    showNames: ArchivableItem[];
    showTypes: ShowType[];
    capSlogans: string[];
    merchandise: EditableItem[]; // Simpele merchandise lijst - dit is alles wat we nodig hebben!
    promoCodes: PromoCode[];
    theaterVouchers: TheaterVoucher[];    // Nieuwe theaterbonnen systeem
    bookingSettings: {
        minGuests: number;
        maxGuests: number;
        bookingCutoffHours: number;
    };
    prices: {
        preShowOrAfterParty: number; // Legacy, prices now on merchandise items
        cap: number;
    };
}
