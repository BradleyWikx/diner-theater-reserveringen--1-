import { TheaterVoucher } from '../types/types';

// Date utilities
export const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
};

export const formatDateToNL = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric'};
    return date.toLocaleDateString('nl-NL', { ...defaultOptions, ...options});
};

export const formatDate = (date: Date): string => {
    // Gebruik lokale datum om tijdzone problemen te voorkomen
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Text utilities
export const slugify = (text: string): string => {
    if (!text) return '';
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

export const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>\"']/g, '');
};

// Date range utilities
export const getWeekRange = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    // Europese week: maandag = start van week
    const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const startOfWeek = new Date(d.setDate(diffToMonday));
    const endOfWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6));
    return { start: formatDate(startOfWeek), end: formatDate(endOfWeek) };
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePostalCode = (postalCode: string): boolean => {
    const dutchPostalRegex = /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/;
    return dutchPostalRegex.test(postalCode);
};

// Voucher utilities
export const generateVoucherCode = (): string => {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const random2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TB${year}-${random}-${random2}`;
};

export const calculateExpiryDate = (issueDate: string, yearsValid: number = 1): string => {
    const date = new Date(issueDate);
    date.setFullYear(date.getFullYear() + yearsValid);
    return date.toISOString().split('T')[0];
};

export const isVoucherExpired = (voucher: TheaterVoucher): boolean => {
    return new Date() > new Date(voucher.expiryDate + 'T23:59:59');
};

export const getVoucherStatus = (voucher: TheaterVoucher): 'active' | 'used' | 'expired' | 'expiring_soon' => {
    if (voucher.status === 'used') return 'used';
    
    const today = new Date();
    const expiry = new Date(voucher.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring_soon';
    return 'active';
};

export const validateVoucherForUse = (voucher: TheaterVoucher | undefined, totalAmount: number): {
    valid: boolean;
    error?: string;
    warning?: string;
} => {
    if (!voucher) {
        return { valid: false, error: 'Theaterbon niet gevonden' };
    }
    
    if (voucher.status === 'used') {
        return { valid: false, error: 'Deze theaterbon is al gebruikt' };
    }
    
    if (voucher.status === 'archived') {
        return { valid: false, error: 'Deze theaterbon is gearchiveerd' };
    }
    
    if (isVoucherExpired(voucher)) {
        return { valid: false, error: 'Deze theaterbon is verlopen' };
    }
    
    // Allow voucher use if value is >= totalAmount
    if (voucher.value < totalAmount) {
        // Voucher value is less than total - customer pays remaining amount later
        const remainingAmount = totalAmount - voucher.value;
        return { 
            valid: true, 
            warning: `Theaterbon is toegepast. Klant betaalt restbedrag van €${remainingAmount.toFixed(2)} later.`
        };
    }
    
    // Warning if voucher value is higher than total - no refund given
    if (voucher.value > totalAmount) {
        const lostAmount = voucher.value - totalAmount;
        return { 
            valid: true, 
            warning: `Theaterbon is toegepast. Restbedrag van €${lostAmount.toFixed(2)} wordt niet terugbetaald.`
        };
    }
    
    return { valid: true, warning: 'Theaterbon is toegepast.' };
};

export const extendVoucherExpiry = (voucher: TheaterVoucher, monthsToAdd: number = 12): TheaterVoucher => {
    const newExpiry = new Date(voucher.expiryDate);
    newExpiry.setMonth(newExpiry.getMonth() + monthsToAdd);
    
    return {
        ...voucher,
        expiryDate: formatDate(newExpiry),
        status: 'extended',
        extendedCount: voucher.extendedCount + 1
    };
};

// Performance optimization utilities
export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number) => {
    let lastFunc: NodeJS.Timeout;
    let lastRan: number;
    return (...args: Parameters<T>) => {
        if (!lastRan) {
            func(...args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func(...args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
};

// Show time utilities
export const getShowTimes = (date: Date, showType: string, config?: any) => {
    // If config is provided, use dynamic show type times
    if (config) {
        const showTypeConfig = config.showTypes.find((st: any) => st.name === showType);
        if (showTypeConfig) {
            return {
                start: showTypeConfig.defaultStartTime || '19:30',
                end: showTypeConfig.defaultEndTime || '22:30'
            };
        }
    }
    
    // Fallback to default times based on type (for backwards compatibility)
    const showTimes = {
        'Dinner & Show': { start: '17:30', end: '22:30' },
        'High Wine & Borrelhap': { start: '16:00', end: '18:30' },
        'Concert': { start: '20:00', end: '23:00' },
        'Muziektheatercafé': { start: '20:30', end: '23:00' },
        'Comedy Night': { start: '20:00', end: '22:00' },
        'default': { start: '19:30', end: '22:30' }
    };
    return showTimes[showType as keyof typeof showTimes] || showTimes.default;
};

// CSS generation utilities
export const generateShowTypeCSS = (config: any) => {
    let css = '';
    config.showTypes.forEach((showType: any) => {
        if (showType.color) {
            const className = `show-type-${showType.id}`;
            css += `
.calendar-day.${className} {
    border-left: 4px solid ${showType.color};
    background: linear-gradient(135deg, ${showType.color}20, ${showType.color}08);
}

.calendar-day.${className}:hover {
    background: linear-gradient(135deg, ${showType.color}30, ${showType.color}15);
}
            `;
        }
    });
    return css;
};

// Calendar legend utilities
export const getShowLegend = (config: any) => {
    const legendItems = [];
    
    // Voeg alleen show types toe die gemarkeerd zijn om in legenda te verschijnen
    config.showTypes
        .filter((showType: any) => showType.showInLegend)
        .forEach((showType: any) => {
            legendItems.push({
                class: `show-type-${showType.id}`,
                label: showType.name,
                color: showType.color || '#6b7280' // gebruik grijze kleur als fallback
            });
        });
    
    // Voeg standaard status kleuren toe
    legendItems.push(
        { class: 'show-waitlist', label: 'Vol - Wachtlijst Beschikbaar! 📝', color: '#dc2626' }
    );
    
    return legendItems;
};

// Show color utilities
export const getShowColorClass = (event: any, config: any, guests: number) => {
    const eventDate = new Date(event.date + 'T12:00:00');
    const showTimes = getShowTimes(eventDate, event.type);
    const showTypeConfig = config.showTypes.find((type: any) => type.name === event.type || type.id === event.type);
    
    // NIEUWE LOGICA: Shows met 240+ gasten of gesloten shows krijgen rode kleur
    if (event.isClosed || guests >= 240) {
        return 'show-waitlist';
    }
    
    // Gebruik configuratie uit instellingen voor show type kleuren
    if (showTypeConfig && showTypeConfig.color) {
        return `show-type-${showTypeConfig.id}`;
    }
    
    // Fallback: bepaal kleur op basis van eigenschappen
    if (showTypeConfig) {
        const standardPrice = 70; // Basis prijs
        if (showTypeConfig.priceStandard > standardPrice || showTypeConfig.pricePremium > 95) {
            return 'show-premium';
        }
    }
    
    // Speciale tijden (bijvoorbeeld Matinee of late shows)
    if (event.type === 'Matinee') {
        return 'show-matinee';
    }
    
    if (showTimes.start && showTimes.start >= '19:30') {
        return 'show-late';
    }
    
    // Premiere shows
    if (event.type.toLowerCase().includes('première') || event.type.toLowerCase().includes('premiere')) {
        return 'show-premiere';
    }
    
    // Zorgheld shows (speciale evenementen)
    if (event.type.toLowerCase().includes('zorg') || event.type.toLowerCase().includes('held')) {
        return 'show-special';
    }
    
    // Standaard show
    return 'show-normal';
};
