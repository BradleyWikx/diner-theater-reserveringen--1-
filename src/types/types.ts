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
    phone: string;
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

export type View = 'book' | 'admin' | 'firebase';
export type AdminView = 'dashboard' | 'calendar' | 'reservations' | 'customers' | 'settings' | 'capacity' | 'reports' | 'customerDetail' | 'approvals' | 'waitlist' | 'analytics' | 'vouchers' | 'schedule';
export type SettingsTab = 'shows' | 'booking' | 'merchandise' | 'promo' | 'archive';

// 🎁 Enhanced Package Management Interfaces
export interface PackageItem {
    merchandiseId: string;
    quantity: number;
    required: boolean;
    alternatives?: string[];
}

export interface MerchandisePackage {
    id: string;
    name: string;
    description: string;
    type: 'merchandise' | 'vip' | 'custom' | 'seasonal';
    items: PackageItem[];
    originalPrice: number;
    packagePrice: number;
    discount: number;
    discountType: 'percentage' | 'fixed';
    minQuantity: number;
    maxQuantity: number;
    isActive: boolean;
    validFrom: string;
    validUntil: string;
    imageUrl?: string;
    tags: string[];
    salesCount: number;
    revenue: number;
    category: 'popular' | 'new' | 'premium' | 'limited';
}

// 🍷 Enhanced Borrel Management
export interface BorrelEvent {
    id: string;
    type: 'pre_show' | 'post_show';
    name: string;
    description: string;
    pricePerPerson: number;
    maxParticipants: number;
    currentParticipants: number;
    duration: number; // minutes
    location: string;
    isActive: boolean;
    requiresReservation: boolean;
    waitlistEnabled: boolean;
    includes: string[];
    imageUrl?: string;
    salesCount: number;
    revenue: number;
}

// 🛍️ Enhanced Merchandise Item
export interface EnhancedMerchandiseItem extends EditableItem {
    category: 'apparel' | 'programs' | 'gifts' | 'collectibles' | 'drinks' | 'food';
    description: string;
    images: string[];
    costPrice: number;
    stockQuantity: number;
    lowStockThreshold: number;
    tags: string[];
    salesData: {
        totalSold: number;
        revenue: number;
        conversionRate: number;
        averageRating: number;
    };
    isActive: boolean;
    isFeatured: boolean;
    weight?: number; // for shipping
    dimensions?: string;
}

export interface EditableItem {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
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
}

export interface PromoCode {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    isActive: boolean;
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

// 🎭 NIEUWE THEATERBON INTERFACE - Volledig gebruik systeem
export interface TheaterVoucher {
    id: string;
    code: string;
    value: number;                    // Vaste waarde die volledig gebruikt moet worden
    issueDate: string;               // Uitgiftedatum
    expiryDate: string;              // Vervaldatum (standaard 1 jaar)
    status: 'active' | 'used' | 'expired' | 'extended' | 'archived';
    usedDate?: string;               // Datum van gebruik
    usedReservationId?: string;      // Reservering waar bon gebruikt is - changed to string
    extendedCount: number;           // Aantal keer verlengd
    notes?: string;                  // Optionele notities
    archivedDate?: string;           // Datum van archivering
    archivedReason?: string;         // Reden van archivering
}

// 🛍️ NIEUWE MERCHANDISE SHOP INTERFACES
export interface ShopMerchandiseItem {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    discountType?: 'percentage' | 'fixed';
    imageUrl: string;
    galleryImages?: string[];
    category: string; // Nu dynamisch!
    type: string; // Nu dynamisch!
    featured: boolean;
    stock: number;
    stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
    lowStockThreshold: number;
    sizes?: string[];
    colors?: { name: string; hex: string; }[];
    rating: number;
    reviewCount: number;
    salesCount: number;
    tags: string[];
    specifications?: { [key: string]: string };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// 🎁 BUNDEL SYSTEEM
export interface ShopBundle {
    id: string;
    name: string;
    description: string;
    items: {
        itemId: string;
        quantity: number;
    }[];
    originalTotalPrice: number;
    bundlePrice: number;
    discount: number;
    discountType: 'percentage' | 'fixed';
    imageUrl: string;
    category: string;
    featured: boolean;
    isActive: boolean;
    validFrom?: string;
    validUntil?: string;
    minQuantity: number;
    maxQuantity?: number;
    createdAt: string;
    updatedAt: string;
}

// 🏷️ DYNAMISCHE CATEGORIEËN
export interface ShopCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
    showInWizard: boolean;
    wizardOrder?: number;
    parentCategory?: string;
    subCategories?: string[];
}

// 🎨 WIZARD LAYOUT CONFIGURATIE
export interface WizardLayoutSection {
    id: string;
    title: string;
    description: string;
    categoryIds: string[];
    displayType: 'grid' | 'list' | 'carousel';
    itemsPerRow: number;
    showPrices: boolean;
    showImages: boolean;
    showQuantity: boolean;
    order: number;
    isActive: boolean;
}

export interface ShopConfiguration {
    displaySettings: {
        itemsPerPage: number;
        gridColumns: { mobile: number; tablet: number; desktop: number };
        showPriceComparison: boolean;
        showStockLevels: boolean;
        enableWishlist: boolean;
        enableReviews: boolean;
        enableSocialSharing: boolean;
        defaultSortBy: 'featured' | 'price_low' | 'price_high' | 'rating' | 'name';
    };
    categories: {
        id: string;
        name: string;
        icon: string;
        color: string;
        isActive: boolean;
    }[];
    filterOptions: {
        enablePriceFilter: boolean;
        priceRanges: { min: number; max: number; label: string }[];
        enableCategoryFilter: boolean;
        enableBrandFilter: boolean;
        enableRatingFilter: boolean;
        enableStockFilter: boolean;
    };
    featuredSettings: {
        maxFeaturedItems: number;
        autoRotateFeatured: boolean;
        featuredBadgeText: string;
        featuredBadgeColor: string;
    };
}

export interface AppConfig {
    showNames: ArchivableItem[];
    showTypes: ShowType[];
    capSlogans: string[];
    merchandise: EditableItem[];
    // 🎁 Enhanced Package & Borrel Management
    merchandisePackages: MerchandisePackage[];
    borrelEvents: BorrelEvent[];
    enhancedMerchandise: EnhancedMerchandiseItem[];
    // 🛍️ NIEUWE MERCHANDISE SHOP - UITGEBREID MET BUNDELS & CATEGORIEËN
    shopMerchandise: ShopMerchandiseItem[];
    shopBundles: ShopBundle[];
    shopCategories: ShopCategory[];
    wizardLayout: WizardLayoutSection[];
    shopConfiguration: ShopConfiguration;
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
