

// Initialize i18n before any components
import './src/i18n';

import React, { useState, useEffect, useMemo, useCallback, ReactNode, Fragment, useRef, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/context/AuthContext';
import { DiscreteAdminButton } from './src/components/admin/DiscreteAdminButton';
import PremiumDashboard from './PremiumDashboard';
import { AdminDashboardView } from './src/components/views/AdminDashboardView';
import { SimpleDashboard } from './src/components/views/SimpleDashboard';
import AdminApprovalsView from './src/components/views/AdminApprovalsView';
import AdminScheduleView from './src/components/views/AdminScheduleView';
import { AdminWaitlistView as NewAdminWaitlistView } from './src/components/views/AdminWaitlistView';
import { AdminVoucherView as NewAdminVoucherView } from './src/components/views/AdminVoucherView';
import { AdminCapacityView as NewAdminCapacityView } from './src/components/views/AdminCapacityView';
import ModernAdminCustomersView from './src/components/views/ModernAdminCustomersView';
import EnhancedAdminCalendarView from './src/components/calendar/AdminCalendarView';
import type { 
    ShowEvent, 
    InternalEvent, 
    SchedulePrintOptions, 
    ManagementReportData, 
    AddonQuantities, 
    Reservation, 
    WaitingListEntry,
    AnalyticsData,
    WaitlistMetrics,
    ConversionMetrics,
    RevenueMetrics,
    CustomerInsights,
    PredictiveMetrics,
    View,
    AdminView,
    SettingsTab,
    EditableItem,
    ArchivableItem,
    ShowType,
    PromoCode,
    GiftCard,
    BookingApproval,
    ApprovalRule,
    ApprovalCondition,
    WaitlistNotification,
    Customer,
    TheaterVoucher,
    AppConfig
} from './src/types/types';

// Import configuration
import { i18n, defaultConfig, calculateEndTime, calculateDoorsOpenTime } from './src/config/config';

// Import components
import { Icon } from './src/components/UI/Icon';
import { Header } from './src/components/UI/Header';

import { ToastProvider, useToast } from './src/context/ToastProvider';
import { ConfirmationProvider, useConfirmation } from './src/context/ConfirmationProvider';
import { BookingView } from './src/components/views/BookingView';
import { WaitingListForm } from './src/components/forms';
import { BulkDeleteModal, MultiSelectActions, PrintableListModal } from './src/components/modals';

// Import booking components
import { BookingSummary, BookingSummarySidebar, MobileBookingSummary } from './src/components/booking';

// Import hooks
import { useMediaQuery, useMobile, usePagination } from './src/hooks';

// Import shared components
import { WizardProgress, DynamicStyles } from './src/components/shared';

// Import Firebase services
import { firebaseService } from './src/services/firebaseService';
import { useInternalEvents, useShows, useReservations, useWaitingList } from './src/hooks/firebase/useFirebaseData';

// Import Email service
import { 
    sendBookingNotification, 
    sendProvisionalBookingEmail,
    sendAdminNotificationEmail,
    sendBookingConfirmedEmail,
    sendBookingRejectedEmail,
    sendBookingModifiedEmail,
    resendConfirmationEmail,
    type BookingEmailData 
} from './src/services/emailService';

// Import mobile utilities
import { initMobileOptimizations } from './src/utils/mobileUtils';

// 🔥 FIREBASE-FIRST INITIALIZATION - PROPER CONFIG MIGRATION
const initializeFirebaseCollections = async () => {
    try {
        // ✅ FIREBASE-ONLY: Check if application configuration exists
        const existingConfig = await firebaseService.config.getConfig();
        
        if (!existingConfig) {
            // Initialize with proper default configuration from config file
            // Import defaultConfig from the config file
            const { defaultConfig: configDefault } = await import('./src/config/config');
            await firebaseService.config.initializeConfig(configDefault);
            
        }
        
        // ✅ NO SAMPLE DATA: All shows should be added through admin panel
        // This ensures proper data management and intentional show creation
        
        return true;
        
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
};

// Import utilities
import { 
    getDaysInMonth, formatDateToNL, formatDate, slugify, sanitizeInput,
    getWeekRange, validateEmail, validatePhoneNumber, validatePostalCode,
    generateVoucherCode, calculateExpiryDate, isVoucherExpired, getVoucherStatus,
    validateVoucherForUse, extendVoucherExpiry, debounce, throttle, getShowTimes,
    generateShowTypeCSS
} from './src/utils/utilities';

import { 
    BarChart3, 
    DollarSign, 
    Users, 
    Calendar as CalendarIcon, 
    UserCheck, 
    Download, 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownRight, 
    Star, 
    Lightbulb, 
    AlertTriangle 
} from 'lucide-react';
import { 
    ResponsiveContainer, 
    LineChart, 
    CartesianGrid, 
    XAxis, 
    YAxis, 
    Tooltip, 
    Line, 
    PieChart, 
    Pie, 
    Cell 
} from 'recharts';

// --- I1N (Internationalization) - Dutch ---
// --- UTILITY FUNCTIONS & HOOKS ---

// --- NOTIFICATION & CONFIRMATION CONTEXT ---




// --- NOTIFICATION & CONFIRMATION CONTEXT ---

// ❌ DEPRECATED: usePersistentState replaced by Firebase integration in Step 4
// This function is no longer used - all data now comes from Firestore
const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue) {
                let parsed = JSON.parse(storedValue);

                if (Array.isArray(defaultValue)) {
                    return Array.isArray(parsed) ? parsed : defaultValue;
                }
                
                // MIGRATION LOGIC for pricing model
                if (key === 'appConfig' && parsed.prices && parsed.prices.weekend && parsed.showTypes && !parsed.showTypes[0].priceStandard) {
                    parsed.showTypes = parsed.showTypes.map((type: any) => {
                        let prices = parsed.prices.weekday; // default to weekday
                        if (type.name.includes('Weekend')) prices = parsed.prices.weekend;
                        if (type.name.includes('Zorgzame')) prices = parsed.prices.zorgHeld;
                        
                        return {
                            ...type,
                            priceStandard: prices ? prices.standard : 70,
                            pricePremium: prices ? prices.premium : 85
                        };
                    });
                    // Remove old price structure after migration
                    delete parsed.prices.weekend;
                    delete parsed.prices.weekday;
                    delete parsed.prices.zorgHeld;
                }

                 const deepMerge = (target: any, source: any): any => {
                    const output = { ...target };
                    const isObject = (item: any) => item && typeof item === 'object' && !Array.isArray(item);

                    if (isObject(target) && isObject(source)) {
                        Object.keys(source).forEach(key => {
                            const targetValue = target[key];
                            const sourceValue = source[key];
                            if (isObject(targetValue) && isObject(sourceValue)) {
                                output[key] = deepMerge(targetValue, sourceValue);
                            } else {
                                output[key] = sourceValue !== undefined ? sourceValue : targetValue;
                            }
                        });
                        Object.keys(target).forEach(key => {
                             if(source[key] === undefined) {
                                output[key] = target[key];
                             }
                        });
                    }
                    return output;
                };

                return deepMerge(defaultValue, parsed);
            }
            return defaultValue;
        } catch (error) {
            
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            
        }
    }, [key, state]);

    return [state, setState];
};

// --- NOTIFICATION & CONFIRMATION CONTEXT ---





// --- COMPONENTS ---

// --- COMPONENTS ---

const CalendarPopover = ({ data, view, config }: { 
    data: { event: ShowEvent, guests: number, element: HTMLElement } | null, 
    view?: View,
    config?: AppConfig 
}) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

    useEffect(() => {
        if (data && popoverRef.current) {
            const rect = data.element.getBoundingClientRect();
            const popoverRect = popoverRef.current.getBoundingClientRect();
            
            let top = rect.top - popoverRect.height - 8;
            let left = rect.left + (rect.width / 2) - (popoverRect.width / 2);

            if (top < 0) {
                top = rect.bottom + 8;
            }
            if (left < 0) {
                left = 5;
            }
            if (left + popoverRect.width > window.innerWidth) {
                left = window.innerWidth - popoverRect.width - 5;
            }

            setStyle({
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                opacity: 1,
            });
        }
    }, [data]);

    if (!data) return null;

    // Find the show type configuration to get pricing
    const showTypeConfig = config?.showTypes.find(type => type.name === data.event.type || type.id === data.event.type);
    const standardPrice = showTypeConfig?.priceStandard;
    const premiumPrice = showTypeConfig?.pricePremium;

    // Get the correct show times based on date and show type
    const eventDate = new Date(data.event.date + 'T12:00:00');
    const showTimes = getShowTimes(eventDate, data.event.type);
    const doorsOpenTime = calculateDoorsOpenTime(showTimes.start);
    const formattedDate = eventDate.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
    
    // Bepaal de status van de show - NIEUWE 240+ LOGICA  
    const isFullyBooked = data.guests >= 240; // Gewijzigd van data.event.capacity naar 240
    const isClosed = data.event.isClosed;
    
    let statusMessage = '';
    let statusClass = '';
    
    if (isClosed || isFullyBooked) {
        statusMessage = '📝 Vol - Wachtlijst beschikbaar!';
        statusClass = 'status-waitlist';
    } else {
        statusMessage = '✅ Beschikbaar';
        statusClass = 'status-available';
    }

    return (
        <div className="calendar-popover" ref={popoverRef} style={style}>
            <div className="popover-content">
                <div className="popover-title">{data.event.name}</div>
                <div className="popover-date">
                    {formattedDate}
                    {(() => {
                        const showType = config?.showTypes.find(st => st.name === data.event.type);
                        return showType?.showInLegend ? ` - ${data.event.type}` : '';
                    })()}
                </div>
                <div className="popover-times">
                    <div>Deuren: {doorsOpenTime}</div>
                    <div>Show: {showTimes.start} - {showTimes.end}</div>
                </div>
                <div className={`popover-status ${statusClass}`}>
                    {statusMessage}
                </div>
                {standardPrice && (
                    <div className="popover-info">
                        <span className="popover-label">Standaard:</span>
                        <span className="popover-value">€{standardPrice}</span>
                    </div>
                )}
                {premiumPrice && (
                    <div className="popover-info">
                        <span className="popover-label">Premium:</span>
                        <span className="popover-value">€{premiumPrice}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const Calendar = React.memo(({ month, onMonthChange, onDateClick, events, guestCountMap, selectedDate, view, isMultiSelectMode, multiSelectedDates, onMultiDateToggle, onDayHover, config }: {
    month: Date;
    onMonthChange: (newMonth: Date) => void;
    onDateClick: (date: string) => void;
    events: ShowEvent[];
    guestCountMap: Map<string, number>;
    selectedDate: string | null;
    view: View;
    isMultiSelectMode?: boolean;
    multiSelectedDates?: string[];
    onMultiDateToggle?: (date: string) => void;
    onDayHover?: (data: { event: ShowEvent, guests: number, element: HTMLDivElement } | null) => void;
    config: AppConfig;
}) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    const days = getDaysInMonth(year, monthIndex);
    // Europese kalender: maandag = 0, zondag = 6
    const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
    const europeanFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Converteer naar Europese week
    const paddingDays = Array(europeanFirstDay).fill(null);

    const eventMap = useMemo(() => new Map(events.map(event => [event.date, event])), [events]);

    const handlePrevMonth = () => onMonthChange(new Date(year, monthIndex - 1, 1));
    const handleNextMonth = () => onMonthChange(new Date(year, monthIndex + 1, 1));
    
    const getMarkerText = (event: ShowEvent, isFull: boolean) => {
        if (event.isClosed) return i18n.waitingList;
        if (isFull) return i18n.fullyBooked;
        return event.name;
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button onClick={handlePrevMonth} aria-label={i18n.prevMonth}><Icon id="chevron-left" /></button>
                <h2>{month.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={handleNextMonth} aria-label={i18n.nextMonth}><Icon id="chevron-right" /></button>
            </div>
            <div className="calendar-grid">
                {i18n.dayNames.map(day => <div key={day} className="day-name">{day}</div>)}
                {paddingDays.map((_, index) => <div key={`pad-${index}`} className="calendar-day other-month"></div>)}
                {days.map(day => {
                    const dateStr = formatDate(day);
                    const event = eventMap.get(dateStr);
                    const guests = guestCountMap.get(dateStr) || 0;
                    const capacityPercent = event ? (guests / event.capacity) * 100 : 0;
                    const isFull = event && guests >= event.capacity;
                    const isClickable = view === 'admin' || (view === 'book' && event);
                    const isMultiSelected = view === 'admin' && multiSelectedDates?.includes(dateStr);
                    const typeClass = event ? `show-type-${slugify(event.type)}` : '';
                    
                    let capacityClass = '';
                    let colorClass = '';
                    if (event) {
                        if (event.isClosed || isFull) capacityClass = 'capacity-full';
                        else if (capacityPercent > 85) capacityClass = 'capacity-high';
                        else if (capacityPercent > 50) capacityClass = 'capacity-medium';
                        else capacityClass = 'capacity-low';
                        
                        // Nieuwe kleurklasse gebaseerd op show eigenschappen
                        colorClass = getShowColorClass(event, config, guests);
                    }

                    let dayClassName = `calendar-day ${day.getMonth() !== monthIndex ? 'other-month' : ''} ${event ? 'has-event' : ''} ${event?.isClosed ? 'is-closed' : ''} ${isFull ? 'full-event' : ''} ${dateStr === selectedDate ? 'selected' : ''} ${isMultiSelected ? 'multi-selected' : ''} ${isClickable ? 'clickable' : ''} ${capacityClass} ${typeClass} ${colorClass}`;
                    
                    const handleDayClick = () => {
                        if (view === 'admin' && isMultiSelectMode && onMultiDateToggle) {
                            onMultiDateToggle(dateStr);
                        } else if (isClickable) {
                            onDateClick(dateStr);
                        }
                    };

                    const handleKeyDown = (e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleDayClick();
                        }
                    };

                    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
                        if (event && onDayHover) {
                            onDayHover({ event, guests, element: e.currentTarget });
                        }
                    };

                    const handleMouseLeave = () => {
                        if (onDayHover) {
                            onDayHover(null);
                        }
                    };

                    // Determine indicator type and color
                    const getShowIndicator = () => {
                        // Geen puntje meer nodig - kleuren worden nu via CSS classes getoond
                        return null;
                    };

                    return (
                        <div 
                            key={dateStr}
                            className={dayClassName}
                            onClick={handleDayClick}
                            onKeyDown={handleKeyDown}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            tabIndex={isClickable ? 0 : -1}
                            role="button"
                            aria-label={event ? `${i18n.bookShow.bookButton} ${event.name} op ${dateStr}` : `Datum ${dateStr}`}
                            aria-pressed={dateStr === selectedDate}
                        >
                            <span className="day-number">{day.getDate()}</span>
                            {getShowIndicator()}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

const CalendarLegend = ({ events, config }: { events: ShowEvent[], config: AppConfig }) => {
    const legendItems = getShowLegend(config);
    
    return (
        <div className="calendar-legend">
            <h4>🎭 Show Kleuren Legenda</h4>
            <div className="legend-grid">
                {legendItems.map(item => (
                    <div key={item.class} className="legend-item">
                        <div 
                            className={`legend-color-box ${item.class}`}
                            style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="legend-label">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AddPromoCodeModal = ({ promo, onClose, onSave, config }: { 
    promo: PromoCode | null, 
    onClose: () => void, 
    onSave: (promoData: Partial<PromoCode>) => void,
    config: AppConfig 
}) => {
    const [code, setCode] = useState(promo?.code || '');
    const [description, setDescription] = useState(promo?.description || '');
    const [type, setType] = useState<'percentage' | 'fixed'>(promo?.type || 'percentage');
    const [value, setValue] = useState(promo?.value || 0);
    const [isActive, setIsActive] = useState(promo?.isActive ?? true);
    const [validFrom, setValidFrom] = useState(promo?.validFrom || '');
    const [validUntil, setValidUntil] = useState(promo?.validUntil || '');
    const [usageLimit, setUsageLimit] = useState(promo?.usageLimit || '');
    const [minBookingValue, setMinBookingValue] = useState(promo?.minBookingValue || '');
    const [selectedShows, setSelectedShows] = useState<string[]>(promo?.appliesToShows || []);
    const [selectedShowTypes, setSelectedShowTypes] = useState<string[]>(promo?.appliesToShowTypes || []);

    const activeShowNames = useMemo(() => 
        config.showNames.filter(s => !s.archived).map(s => s.name), 
        [config.showNames]
    );
    const activeShowTypes = useMemo(() => 
        config.showTypes.filter(s => !s.archived).map(s => s.name), 
        [config.showTypes]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!code.trim()) {
            alert('Promocode is verplicht!');
            return;
        }

        if (value <= 0) {
            alert('Waarde moet groter zijn dan 0!');
            return;
        }

        if (type === 'percentage' && value > 100) {
            alert('Percentage kan niet hoger zijn dan 100%!');
            return;
        }

        if (validFrom && validUntil && validFrom > validUntil) {
            alert('Startdatum moet eerder zijn dan einddatum!');
            return;
        }

        const promoData: Partial<PromoCode> = {
            code: code.toUpperCase().trim(),
            description: description.trim(),
            type,
            value,
            isActive,
            usageCount: promo?.usageCount || 0,
            ...(validFrom && { validFrom }),
            ...(validUntil && { validUntil }),
            ...(usageLimit && { usageLimit: Number(usageLimit) }),
            ...(minBookingValue && { minBookingValue: Number(minBookingValue) }),
            ...(selectedShows.length > 0 && { appliesToShows: selectedShows }),
            ...(selectedShowTypes.length > 0 && { appliesToShowTypes: selectedShowTypes })
        };

        onSave(promoData);
        onClose();
    };

    const toggleShow = (showName: string) => {
        setSelectedShows(prev => 
            prev.includes(showName) 
                ? prev.filter(s => s !== showName)
                : [...prev, showName]
        );
    };

    const toggleShowType = (showType: string) => {
        setSelectedShowTypes(prev => 
            prev.includes(showType) 
                ? prev.filter(s => s !== showType)
                : [...prev, showType]
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal add-show-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{promo ? 'Promotie Bewerken' : 'Nieuwe Promotie'}</h3>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-content">
                    <div className="form-grid">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Promocode *</label>
                                <input 
                                    type="text" 
                                    value={code} 
                                    onChange={(e) => setCode(e.target.value.toUpperCase())} 
                                    placeholder="bijv. ZOMER2025"
                                    maxLength={20}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={isActive} 
                                        onChange={(e) => setIsActive(e.target.checked)} 
                                    />
                                    Actief
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Omschrijving</label>
                            <input 
                                type="text" 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                placeholder="bijv. Zomeractie 2025 - 20% korting"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Type Korting</label>
                                <select value={type} onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Vast bedrag (€)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Waarde *</label>
                                <input 
                                    type="number" 
                                    value={value} 
                                    onChange={(e) => setValue(Number(e.target.value))} 
                                    min="0"
                                    max={type === 'percentage' ? '100' : undefined}
                                    step={type === 'percentage' ? '1' : '0.01'}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Geldig Vanaf</label>
                                <input 
                                    type="date" 
                                    value={validFrom} 
                                    onChange={(e) => setValidFrom(e.target.value)} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Geldig Tot</label>
                                <input 
                                    type="date" 
                                    value={validUntil} 
                                    onChange={(e) => setValidUntil(e.target.value)} 
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Gebruikslimiet</label>
                                <input 
                                    type="number" 
                                    value={usageLimit} 
                                    onChange={(e) => setUsageLimit(e.target.value)} 
                                    placeholder="Onbeperkt"
                                    min="1"
                                />
                            </div>
                            <div className="form-group">
                                <label>Minimum Besteding (€)</label>
                                <input 
                                    type="number" 
                                    value={minBookingValue} 
                                    onChange={(e) => setMinBookingValue(e.target.value)} 
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>

                        {activeShowNames.length > 0 && (
                            <div className="form-group">
                                <label>Geldig voor Shows (laat leeg voor alle shows)</label>
                                <div className="checkbox-list">
                                    {activeShowNames.map(showName => (
                                        <label key={showName} className="checkbox-item">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedShows.includes(showName)}
                                                onChange={() => toggleShow(showName)}
                                            />
                                            {showName}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeShowTypes.length > 0 && (
                            <div className="form-group">
                                <label>Geldig voor Show Types (laat leeg voor alle types)</label>
                                <div className="checkbox-list">
                                    {activeShowTypes.map(showType => (
                                        <label key={showType} className="checkbox-item">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedShowTypes.includes(showType)}
                                                onChange={() => toggleShowType(showType)}
                                            />
                                            {showType}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Annuleren</button>
                        <button type="submit" className="btn-primary">
                            {promo ? 'Bijwerken' : 'Toevoegen'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddShowModal = ({ onClose, onAdd, config, dates }: { onClose: () => void, onAdd: (event: Omit<ShowEvent, 'id'>, dates: string[]) => void, config: AppConfig, dates: string[] }) => {
    const activeShowNames = useMemo(() => config.showNames.filter(s => !s.archived), [config.showNames]);
    const activeShowTypes = useMemo(() => config.showTypes.filter(s => !s.archived), [config.showTypes]);

    const [name, setName] = useState(activeShowNames[0]?.name || '');
    const [type, setType] = useState(activeShowTypes[0]?.name || '');
    const [capacity, setCapacity] = useState(activeShowTypes[0]?.defaultCapacity || 240);
    const [startTime, setStartTime] = useState(activeShowTypes[0]?.defaultStartTime || '19:30');
    const [endTime, setEndTime] = useState(activeShowTypes[0]?.defaultEndTime || '22:30');
    const [useCustomTimes, setUseCustomTimes] = useState(false);
    const [singleDate, setSingleDate] = useState(dates[0] || formatDate(new Date()));

    useEffect(() => {
        const selectedType = activeShowTypes.find(t => t.name === type);
        if (selectedType) {
            setCapacity(selectedType.defaultCapacity);
            const defaultStart = selectedType.defaultStartTime || '19:30';
            setStartTime(defaultStart);
            setEndTime(selectedType.defaultEndTime || calculateEndTime(defaultStart));
            setUseCustomTimes(false);
        }
    }, [type, activeShowTypes]);

    const selectedShowType = activeShowTypes.find(t => t.name === type);
    const canCustomizeTimes = selectedShowType?.allowCustomTimes !== false;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validatie voor tijden (24-uurs formaat)
        if (useCustomTimes) {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
                alert('Gebruik het juiste tijdformaat (UU:MM in 24-uurs formaat)!');
                return;
            }
            
            if (startTime >= endTime) {
                alert('Starttijd moet eerder zijn dan eindtijd!');
                return;
            }
        }
        
        const targetDates = dates.length > 0 ? dates : [singleDate];
        const newShow: Omit<ShowEvent, 'id'> = { 
            date: '', 
            name, 
            type, 
            capacity, 
            isClosed: false,
            startTime: useCustomTimes ? startTime : selectedShowType?.defaultStartTime,
            endTime: useCustomTimes ? endTime : selectedShowType?.defaultEndTime
        };
        onAdd(newShow, targetDates);
        onClose();
    };
    
    const isMultiMode = dates.length > 0;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{isMultiMode ? `${i18n.addAction} (${dates.length} datums)` : i18n.addShowEventTitle}</h3>
                    <button onClick={onClose} className="close-btn" aria-label={i18n.cancel}><Icon id="close" /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="showName">{i18n.showName}</label>
                        <select id="showName" value={name} onChange={e => setName(e.target.value)}>{activeShowNames.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}</select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="showType">{i18n.showType}</label>
                        <select id="showType" value={type} onChange={e => setType(e.target.value)}>{activeShowTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</select>
                    </div>
                     {!isMultiMode && (
                        <div className="form-group">
                            <label htmlFor="singleDate">{i18n.date}</label>
                            <input type="date" id="singleDate" value={singleDate} onChange={e => setSingleDate(e.target.value)} />
                        </div>
                     )}
                    <div className="form-group">
                        <label htmlFor="capacity">{i18n.capacity}</label>
                        <input type="number" id="capacity" value={capacity} min="1" onChange={e => setCapacity(Number(e.target.value))} />
                    </div>
                    
                    {/* Tijd instellingen */}
                    <div className="form-section">
                        <h4>⏰ Tijden</h4>
                        {canCustomizeTimes && (
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={useCustomTimes} 
                                        onChange={(e) => setUseCustomTimes(e.target.checked)} 
                                    />
                                    Aangepaste tijden gebruiken
                                </label>
                            </div>
                        )}
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="startTime">
                                    Starttijd {!useCustomTimes && selectedShowType && `(standaard: ${selectedShowType.defaultStartTime})`}
                                </label>
                                <input 
                                    type="time" 
                                    id="startTime" 
                                    value={startTime} 
                                    onChange={e => {
                                        const newStartTime = e.target.value;
                                        setStartTime(newStartTime);
                                        // Automatisch eindtijd berekenen bij wijzigen starttijd
                                        if (useCustomTimes) {
                                            setEndTime(calculateEndTime(newStartTime));
                                        }
                                    }}
                                    disabled={!useCustomTimes && canCustomizeTimes}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="endTime">
                                    Eindtijd (automatisch: starttijd + 3,5 uur) {!useCustomTimes && selectedShowType && `(standaard: ${selectedShowType.defaultEndTime})`}
                                </label>
                                <input 
                                    type="time" 
                                    id="endTime" 
                                    value={endTime} 
                                    onChange={e => setEndTime(e.target.value)}
                                    disabled={!useCustomTimes && canCustomizeTimes}
                                    style={{ backgroundColor: useCustomTimes ? '#f8f9fa' : 'inherit', fontStyle: useCustomTimes ? 'italic' : 'normal' }}
                                    title="Deze tijd wordt automatisch berekend op basis van de starttijd + 3,5 uur, maar kan handmatig worden aangepast"
                                />
                            </div>
                        </div>
                        
                        {!canCustomizeTimes && (
                            <p className="form-help-text">
                                Dit show type heeft vaste tijden: {selectedShowType?.defaultStartTime} - {selectedShowType?.defaultEndTime}
                            </p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary">{i18n.cancel}</button>
                        <button type="submit" className="submit-btn">{i18n.addShow}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Quick Add Booking Modal for admin use
const AddBookingModal = ({ onClose, onAdd, show, date, config }: { 
    onClose: () => void, 
    onAdd: (reservation: Omit<Reservation, 'id'>) => void, 
    show: ShowEvent, 
    date: string, 
    config: AppConfig 
}) => {
    const [contactName, setContactName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [guests, setGuests] = useState(2);
    const [drinkPackage, setDrinkPackage] = useState<'standard' | 'premium'>('standard');
    
    const showType = config.showTypes.find(st => st.name === show.type);
    const price = drinkPackage === 'premium' ? showType?.pricePremium : showType?.priceStandard;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const reservation: Omit<Reservation, 'id'> = {
            date,
            companyName: '',
            salutation: 'Dhr.',
            contactName,
            address: '',
            houseNumber: '',
            postalCode: '',
            city: '',
            phone,
            email,
            guests,
            drinkPackage,
            preShowDrinks: false,
            afterParty: false,
            remarks: '',
            addons: {},
            celebrationName: '',
            celebrationOccasion: '',
            newsletter: false,
            termsAccepted: true,
            totalPrice: (price || 0) * guests,
            promoCode: '',
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
                            <label htmlFor="contactName">Naam *</label>
                            <input 
                                type="text" 
                                id="contactName" 
                                value={contactName}
                                onChange={e => setContactName(e.target.value)}
                                required 
                                placeholder="Voor- en achternaam"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">E-mail *</label>
                            <input 
                                type="email" 
                                id="email" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required 
                                placeholder="voorbeeld@email.nl"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Telefoon</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="+31 6 12345678"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="guests">Aantal gasten *</label>
                            <input 
                                type="number" 
                                id="guests" 
                                value={guests}
                                onChange={e => setGuests(parseInt(e.target.value) || 0)}
                                min="1" 
                                required 
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="drinkPackage">Drankenpakket</label>
                            <select 
                                id="drinkPackage" 
                                value={drinkPackage}
                                onChange={e => setDrinkPackage(e.target.value as 'standard' | 'premium')}
                            >
                                <option value="standard">Standaard (€{showType?.priceStandard})</option>
                                <option value="premium">Premium (€{showType?.pricePremium})</option>
                            </select>
                        </div>
                    </div>

                    <div className="booking-summary">
                        <div className="summary-row total">
                            <span>Totaal:</span>
                            <span>€{(price || 0) * guests}</span>
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

// Functie om speciale show kenmerken te bepalen
const getShowColorClass = (event: ShowEvent, config: AppConfig, guests: number) => {
    const eventDate = new Date(event.date + 'T12:00:00');
    const showTimes = getShowTimes(eventDate, event.type);
    const showTypeConfig = config.showTypes.find(type => type.name === event.type || type.id === event.type);
    
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

// Legenda data voor kleuren - dynamisch gebaseerd op configuratie
const getShowLegend = (config: AppConfig) => {
    const legendItems = [];
    
    // Voeg alleen show types toe die gemarkeerd zijn om in legenda te verschijnen
    config.showTypes
        .filter(showType => showType.showInLegend)
        .forEach(showType => {
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

// Functie om dynamische CSS te genereren voor show type kleuren
// Component om dynamische CSS styles te injecteren
const QuantityStepper = ({ value, onChange, min = 0, max = 99, disabled = false, groupSize = 0 }: { 
    value: number, 
    onChange: (newValue: number) => void, 
    min?: number, 
    max?: number,
    disabled?: boolean,
    groupSize?: number
}) => {
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());

    const handleIncrement = () => !disabled && onChange(Math.min(max, value + 1));
    const handleDecrement = () => !disabled && onChange(Math.max(min, value - 1));
    
    const handleForGroup = () => {
        if (!disabled && groupSize > 0) {
            onChange(Math.min(max, groupSize));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputSubmit = () => {
        const numValue = parseInt(inputValue);
        if (!isNaN(numValue) && numValue >= min && numValue <= max) {
            onChange(numValue);
        } else {
            setInputValue(value.toString());
        }
        setShowInput(false);
    };

    const handleInputKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInputSubmit();
        } else if (e.key === 'Escape') {
            setInputValue(value.toString());
            setShowInput(false);
        }
    };

    React.useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    return (
        <div className={`quantity-stepper-wrapper ${disabled ? 'disabled' : ''}`}>
            <div className="quantity-stepper">
                <button type="button" onClick={handleDecrement} disabled={value <= min || disabled} aria-label="Minder">
                    <Icon id="remove" />
                </button>
                
                {showInput ? (
                    <input 
                        type="number"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputSubmit}
                        onKeyDown={handleInputKeyPress}
                        className="quantity-input"
                        min={min}
                        max={max}
                        autoFocus
                    />
                ) : (
                    <span 
                        className="quantity-value clickable" 
                        onClick={() => !disabled && setShowInput(true)}
                        title="Klik om getal in te voeren"
                    >
                        {value}
                    </span>
                )}
                
                <button type="button" onClick={handleIncrement} disabled={value >= max || disabled} aria-label="Meer">
                    <Icon id="add" />
                </button>
            </div>
            
            {groupSize > 0 && (
                <button 
                    type="button" 
                    onClick={handleForGroup} 
                    disabled={disabled}
                    className="group-button-wide"
                    title={`Voor hele groep (${groupSize} personen)`}
                >
                    Voor hele groep ({groupSize})
                </button>
            )}
        </div>
    );
};

const ReservationWizard = ({ show, date, onAddReservation, config, remainingCapacity, onClose }: { show: ShowEvent, date: string, onAddReservation: (res: Omit<Reservation, 'id'>) => void, config: AppConfig, remainingCapacity: number, onClose: () => void }) => {
    const WIZARD_STEPS = 5;
    const [currentStep, setCurrentStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [willExceedCapacity, setWillExceedCapacity] = useState(false);
    const [showCapacityWarning, setShowCapacityWarning] = useState(false);
    const isMobile = useMediaQuery('(max-width: 900px)');
    const { addToast } = useToast();

    const initialAddons = useMemo(() => {
        const addons: AddonQuantities = {};
        config.capSlogans.forEach((_, index) => { addons[`cap${index}`] = 0; });
        return addons;
    }, [config.capSlogans]);

    const [reservation, setReservation] = useState<Omit<Reservation, 'id' | 'totalPrice'>>({
        date,
        companyName: '', salutation: 'Dhr.', contactName: '', address: '', houseNumber: '',
        postalCode: '', city: '', phone: '', email: '', guests: 1,
        drinkPackage: 'standard', preShowDrinks: false, afterParty: false,
        remarks: '', addons: initialAddons, celebrationName: '', celebrationOccasion: '',
        newsletter: false, termsAccepted: false, checkedIn: false,
        status: 'provisional', bookingSource: 'internal', createdAt: new Date().toISOString()
    });
    
    const [priceDetails, setPriceDetails] = useState({ subtotal: 0, discount: 0, total: 0 });
    const [promoInput, setPromoInput] = useState('');
    const [appliedCode, setAppliedCode] = useState<{code: string; type: 'promo' | 'gift'; value: number} | null>(null);
    const [promoMessage, setPromoMessage] = useState('');

    // Shop states removed - merchandise functionality simplified
    const showImage = useMemo(() => config.showNames.find(sn => sn.name === show.name)?.imageUrl, [config.showNames, show.name]);
    const currentShowType = useMemo(() => config.showTypes.find(st => st.name === show.type), [config.showTypes, show.type]);
    const { minGuests, maxGuests } = config.bookingSettings;

    const updateReservation = (data: Partial<typeof reservation>) => {
        setReservation(prev => ({...prev, ...data}));
        
        // Check if the new guest count would exceed capacity
        if (data.guests !== undefined) {
            const newGuestCount = data.guests;
            const exceedsCapacity = newGuestCount > remainingCapacity;
            setWillExceedCapacity(exceedsCapacity);
            
            // Show capacity warning for large bookings (> 80% of remaining capacity)
            const isLargeBooking = newGuestCount > (remainingCapacity * 0.8);
            setShowCapacityWarning(isLargeBooking && !exceedsCapacity);
        }
    };

    // Auto-adjust booking status - all reservations are provisional and need admin approval
    useEffect(() => {
        setReservation(prev => ({...prev, status: 'provisional'}));
    }, []);

    useEffect(() => {
        const { guests, drinkPackage, preShowDrinks, afterParty, addons } = reservation;
        let basePricePerPerson = 0;
        if (currentShowType) {
            basePricePerPerson = drinkPackage === 'premium'
                ? currentShowType.pricePremium
                : currentShowType.priceStandard;
        }
        
        let subtotal = guests * basePricePerPerson;
        
        // Borrel items uit merchandise array
        const preShowDrinksPrice = config.merchandise.find(item => item.id === 'preShowDrinks')?.price || 0;
        const afterPartyPrice = config.merchandise.find(item => item.id === 'afterParty')?.price || 0;
        
        if (preShowDrinks && guests >= 25) subtotal += guests * preShowDrinksPrice;
        if (afterParty && guests >= 25) subtotal += guests * afterPartyPrice;
        
        // Regular merchandise items (simplified - no shopMerchandise)
        config.merchandise.forEach(item => {
            if (item.id !== 'preShowDrinks' && item.id !== 'afterParty') {
                 subtotal += (addons[item.id] || 0) * item.price;
            }
        });
        
        // Bundle functionality removed - simplified pricing
        
        const totalCaps = config.capSlogans.reduce((sum, _, i) => sum + (addons[`cap${i}`] || 0), 0);
        subtotal += totalCaps * config.prices.cap;

        let discount = 0;
        if (appliedCode) {
            if (appliedCode.type === 'promo') {
                const promo = config.promoCodes.find(p => p.code === appliedCode.code);
                if(promo && promo.value > 0) {
                    discount = promo.type === 'percentage'
                        ? subtotal * (promo.value / 100)
                        : promo.value;
                }
            } else { // theaterbon
                // Voor theaterbonnen: gebruik altijd volledige waarde
                const theaterVoucher = config.theaterVouchers.find(v => v.code === appliedCode.code);
                if (theaterVoucher) {
                    // Theaterbon gebruikt volledig bedrag, klant betaalt rest later of verliest overschot
                    discount = theaterVoucher.value;
                }
            }
        }
        
        // Voor theaterbonnen: laat totaal negatief worden (klant betaalt rest later)
        // Voor andere kortingen: limiteer tot subtotal
        const theaterVoucher = appliedCode && config.theaterVouchers.find(v => v.code === appliedCode.code);
        if (!theaterVoucher) {
            discount = Math.min(subtotal, discount);
        }
        
        const total = subtotal - discount;
        setPriceDetails({ subtotal, discount, total });
    }, [reservation, appliedCode, show.type, config, currentShowType]);
    
    const handleApplyCode = () => {
        const code = promoInput.trim().toUpperCase();
        setPromoMessage(''); 
        setAppliedCode(null);
        
        // Eerst proberen als promocode
        const promo = config.promoCodes.find(p => p.code.toUpperCase() === code);
        if (promo) {
            // --- NIEUWE VALIDATIESTAPPEN ---
            if (!promo.isActive) {
                setPromoMessage("Deze code is niet meer actief.");
                return;
            }

            const now = new Date();
            if (promo.validFrom && new Date(promo.validFrom) > now) {
                setPromoMessage("Deze code is nog niet geldig.");
                return;
            }
            if (promo.validUntil && new Date(promo.validUntil) < now) {
                setPromoMessage("Deze code is verlopen.");
                return;
            }
            if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
                setPromoMessage("Deze code heeft zijn limiet bereikt.");
                return;
            }
            if (promo.minBookingValue && priceDetails.subtotal < promo.minBookingValue) {
                setPromoMessage(`Minimale besteding is €${promo.minBookingValue.toFixed(2)}.`);
                return;
            }
            if (promo.appliesToShows?.length > 0 && !promo.appliesToShows.includes(show.name)) {
                setPromoMessage("Code is niet geldig voor deze show.");
                return;
            }
            if (promo.appliesToShowTypes?.length > 0 && !promo.appliesToShowTypes.includes(show.type)) {
                setPromoMessage("Code is niet geldig voor dit show type.");
                return;
            }
            // --- EINDE VALIDATIE ---

            // Als alle checks slagen, pas de korting toe
            const discountDisplay = promo.type === 'percentage' ? `${promo.value}%` : `€${promo.value.toFixed(2)}`;
            setAppliedCode({ code: promo.code, type: 'promo', value: promo.type === 'percentage' ? promo.value : promo.value });
            setPromoMessage(i18n.codeApplied.replace('{code}', promo.code).replace('{discount}', discountDisplay));
            return;
        }
        
        // Dan proberen als nieuwe theaterbon met flexibele type support
        const theaterVoucher = config.theaterVouchers.find(v => v.code.toUpperCase() === code);
        if (theaterVoucher) {
            const validation = validateVoucherForUse(theaterVoucher, priceDetails.subtotal);
            if (!validation.valid) {
                setPromoMessage(i18n.voucherValidationError.replace('{error}', validation.error || ''));
                return;
            }

            let discountAmount = 0;
            let discountDisplay = "";

            if (theaterVoucher.type === 'persons') {
                // Logica voor Personenbon
                const showTypeConfig = config.showTypes.find(st => st.name === show.type || st.id === show.type);
                if (showTypeConfig) {
                    const pricePerPerson = theaterVoucher.packageType === 'premium' 
                        ? showTypeConfig.pricePremium 
                        : showTypeConfig.priceStandard;

                    discountAmount = theaterVoucher.persons * pricePerPerson;
                    discountDisplay = `${theaterVoucher.persons}x ${theaterVoucher.packageType} arrangement`;

                    if (reservation.guests < theaterVoucher.persons) {
                        setPromoMessage(`⚠️ Let op: deze bon is voor ${theaterVoucher.persons} personen, maar je hebt ${reservation.guests} personen geselecteerd.`);
                        // Je kunt hier besluiten de boeking te blokkeren of een waarschuwing te geven.
                        return;
                    }
                } else {
                    setPromoMessage('⚠️ Kan prijsinformatie niet vinden voor dit type voorstelling.');
                    return;
                }
            } else {
                // Logica voor Waardebon (bestaande logica)
                discountAmount = theaterVoucher.value;
                discountDisplay = `€${theaterVoucher.value.toFixed(2)}`;
            }

            // Pas de state aan met de berekende korting
            setAppliedCode({ 
                code: theaterVoucher.code, 
                type: 'gift', 
                value: discountAmount // Gebruik de berekende korting
            });

            // Success bericht
            if (validation.warning) {
                setPromoMessage(`⚠️ ${validation.warning}`);
            } else {
                setPromoMessage(i18n.voucherAppliedSuccess
                    .replace('{code}', theaterVoucher.code)
                    .replace('{value}', discountDisplay));
            }
            return;
        }
        
        setPromoMessage(i18n.invalidCode);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting) return; // Voorkom dubbele submits
        
        // Laatste validatie voordat formulier wordt ingediend
        const errors = getStepValidationErrors();
        if (errors.length > 0) {
            const errorMessage = `⚠️ Controleer de volgende velden:\n\n• ${errors.join('\n• ')}`;
            addToast(errorMessage, 'error');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const reservationData = { 
                ...reservation, 
                totalPrice: priceDetails.total, 
                discountAmount: priceDetails.discount 
            };
            
            // Only add promoCode if it exists (Firebase doesn't accept undefined values)
            if (appliedCode?.code) {
                reservationData.promoCode = appliedCode.code;
            }
            
            // Toon tijdelijke bevestiging
            addToast('Reservering wordt verwerkt...', 'info');
            
            await onAddReservation(reservationData);
            setSubmitted(true);
            
            // Succes feedback
            addToast('Reservering succesvol ontvangen!', 'success');
            
        } catch (error) {
            console.error('Reservation submission failed:', error);
            addToast('Er ging iets mis bij het verwerken van uw reservering. Probeer het opnieuw.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const nextStep = () => {
        const errors = getStepValidationErrors();
        if (errors.length > 0) {
            // Toon waarschuwing voor ontbrekende velden met mooie opmaak
            const errorMessage = `⚠️ Vul eerst de verplichte velden in:\n\n• ${errors.join('\n• ')}`;
            addToast(errorMessage, 'error');
            return;
        }
        setCurrentStep(s => Math.min(s + 1, WIZARD_STEPS));
    };
    const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));
    const goToStep = (step: number) => setCurrentStep(Math.max(1, Math.min(step, WIZARD_STEPS)));

    const dateObj = new Date(date + 'T00:00:00');
    const formattedDate = i18n.showInfo
        .replace('{dayOfWeek}', dateObj.toLocaleDateString('nl-NL', { weekday: 'long' }))
        .replace('{day}', dateObj.toLocaleDateString('nl-NL', { day: 'numeric' }))
        .replace('{month}', dateObj.toLocaleDateString('nl-NL', { month: 'long' }))
        .replace('{year}', dateObj.toLocaleDateString('nl-NL', { year: 'numeric' }))
        .replace('{showType}', show.type);
    const showTimes = getShowTimes(dateObj, show.type, config);
    const doorsOpenTime = calculateDoorsOpenTime(showTimes.start);

    if (submitted) {
        // All reservations are now provisional and require approval
        return (
            <div className="wizard-confirmation">
                 <Icon id="clock" className="confirmation-icon" />
                 <h3>{i18n.awaitingApproval}</h3>
                 <p>{i18n.provisionalBookingConfirm}</p>
                 
                 <div className="confirmation-details">
                     <div className="confirmation-info">
                         <h4>📧 Wat gebeurt er nu?</h4>
                         <ul>
                             <li>✅ Uw reserveringsverzoek is ontvangen</li>
                             <li>📋 We controleren de beschikbaarheid</li>
                             <li>📧 U ontvangt binnen 24 uur een bevestiging</li>
                             <li>💳 Na bevestiging ontvangt u betaalinstructies</li>
                         </ul>
                     </div>
                     
                     <div className="provisional-notice">
                         <Icon id="info" />
                         <div>
                             <strong>Reserveringsnummer:</strong> {show.name} - {new Date(date + 'T12:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}
                             <br />
                             <small>Bewaar deze pagina als referentie</small>
                         </div>
                     </div>
                 </div>
                 
                 <button onClick={onClose} className="submit-btn">{i18n.close}</button>
            </div>
        )
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: // Arrangement & Gasten
                return (
                    <fieldset>
                        <legend>{i18n.wizardStep1Title}</legend>
                        <p className="fieldset-subtitle">{i18n.wizardStep1SubTitle}</p>
                        <div className="package-selection">
                            <div className={`package-card ${reservation.drinkPackage === 'standard' ? 'active' : ''}`} onClick={() => updateReservation({ drinkPackage: 'standard' })}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h4>{i18n.standardPackage}</h4>
                                    <div className="tooltip-container" onClick={(e) => e.stopPropagation()}>
                                        <span className="tooltip-icon">?</span>
                                        <div className="tooltip-content">
                                            <strong>Standaard Arrangement</strong>
                                            {'\n\n'}✓ Voorstelling
                                            {'\n'}✓ Dinerbuffet
                                            {'\n'}✓ Standaard drankenpakket
                                            {'\n\n'}Inclusief: Bier, wijn, frisdrank, koffie/thee
                                        </div>
                                    </div>
                                </div>
                                <p>{i18n.packageStandard}</p>
                                <div className="price">€{currentShowType?.priceStandard.toFixed(2) || '0.00'} p.p.</div>
                            </div>
                             <div className={`package-card ${reservation.drinkPackage === 'premium' ? 'active' : ''}`} onClick={() => updateReservation({ drinkPackage: 'premium' })}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h4>{i18n.premiumPackage}</h4>
                                    <div className="tooltip-container" onClick={(e) => e.stopPropagation()}>
                                        <span className="tooltip-icon">?</span>
                                        <div className="tooltip-content">
                                            <strong>Premium Arrangement</strong>
                                            {'\n\n'}✓ Voorstelling
                                            {'\n'}✓ Dinerbuffet
                                            {'\n'}✓ Premium drankenpakket
                                            {'\n\n'}Inclusief: Alle standaard dranken + sterke drank, speciale bieren en bubbels van het huis
                                        </div>
                                    </div>
                                </div>
                                <p>{i18n.packagePremium}</p>
                                <div className="price">€{currentShowType?.pricePremium.toFixed(2) || '0.00'} p.p.</div>
                            </div>
                        </div>
                        <div className="form-group guests-input">
                            <label htmlFor="guests">{i18n.numberOfGuests}</label>
                            <input id="guests" name="guests" type="number" min={minGuests} value={reservation.guests} 
                                   onChange={e => updateReservation({ guests: Math.max(minGuests, Number(e.target.value)) })} required />
                            
                            {/* Capacity Warnings - alleen voor admin */}
                            {willExceedCapacity && (
                                <div className="capacity-warning error">
                                    <Icon id="alert-triangle" />
                                    <div>
                                        <div>{i18n.provisionalBookingWarning}</div>
                                        <div className="capacity-warning-subtitle">
                                            {i18n.provisionalBookingConfirm}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </fieldset>
                );
            case 2: // Drankjes
                const borrelItems = config.merchandise.filter(item => ['preShowDrinks', 'afterParty'].includes(item.id));
                const preShowDrinksItem = borrelItems.find(item => item.id === 'preShowDrinks');
                const afterPartyItem = borrelItems.find(item => item.id === 'afterParty');
                
                return (
                    <fieldset>
                        <legend>{i18n.wizardStep2Title}</legend>
                        <p className="fieldset-subtitle">{i18n.wizardStep2SubTitle}</p>
                        <div className="checkbox-group large-checkboxes">
                            <label className={reservation.guests < 25 ? 'disabled' : ''}>
                                <input type="checkbox" name="preShowDrinks" checked={reservation.preShowDrinks} onChange={e => updateReservation({preShowDrinks: e.target.checked})} disabled={reservation.guests < 25} />
                                <div className="checkbox-content">
                                  <span className="checkbox-title">
                                    {preShowDrinksItem?.name} 
                                    {preShowDrinksItem?.price && ` (€${preShowDrinksItem.price.toFixed(2)} p.p.)`}
                                  </span>
                                  <span className="checkbox-subtitle">{i18n.addonMin25}</span>
                                </div>
                            </label>
                            <label className={reservation.guests < 25 ? 'disabled' : ''}>
                                <input type="checkbox" name="afterParty" checked={reservation.afterParty} onChange={e => updateReservation({afterParty: e.target.checked})} disabled={reservation.guests < 25} />
                                <div className="checkbox-content">
                                  <span className="checkbox-title">
                                    {afterPartyItem?.name} 
                                    {afterPartyItem?.price && ` (€${afterPartyItem.price.toFixed(2)} p.p.)`}
                                  </span>
                                  <span className="checkbox-subtitle">{i18n.addonMin25}</span>
                                </div>
                            </label>
                        </div>
                    </fieldset>
                );
            case 3: // Extra's
                const handleAddonNumberChange = (name: string, value: number) => {
                    updateReservation({ addons: {...reservation.addons, [name]: value }});
                };

                const merchandiseItems = config.merchandise;
                const capItems = config.capSlogans;

                return (
                    <fieldset>
                        <legend>🎁 Stap 3: Extra's en souvenirs</legend>
                        <p className="fieldset-subtitle">Maak uw avond nog specialer met onze optionele extra's.</p>

                        <div className="merchandise-grid-3cols">
                            {merchandiseItems.map(item => (
                                <div key={item.id} className="merchandise-card">
                                    <img 
                                        src={item.imageUrl || 'https://placehold.co/150x150/eee/ccc?text=Geen+Foto'} 
                                        alt={item.name} 
                                        className="merchandise-image" 
                                    />
                                    <div className="merchandise-content">
                                        <h4 className="merchandise-name">{item.name}</h4>
                                        <p className="merchandise-description">{item.description}</p>
                                        <div className="merchandise-price">€{item.price.toFixed(2)}</div>
                                        <div className="merchandise-controls">
                                            <QuantityStepper
                                                value={reservation.addons[item.id] || 0}
                                                onChange={(newValue) => handleAddonNumberChange(item.id, newValue)}
                                                groupSize={reservation.guests}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Sectie voor Petten in grid layout */}
                            {capItems.map((slogan, index) => {
                                const capId = `cap${index}`;
                                return (
                                    <div key={capId} className="merchandise-card">
                                        <img 
                                            src={'https://placehold.co/150x150/2a2a2a/f0b429?text=🧢'} 
                                            alt="Theater Pet" 
                                            className="merchandise-image" 
                                        />
                                        <div className="merchandise-content">
                                            <h4 className="merchandise-name">Theater Pet</h4>
                                            <p className="merchandise-description">"{slogan}"</p>
                                            <div className="merchandise-price">€{config.prices.cap.toFixed(2)}</div>
                                            <div className="merchandise-controls">
                                                <QuantityStepper
                                                    value={reservation.addons[capId] || 0}
                                                    onChange={(newValue) => handleAddonNumberChange(capId, newValue)}
                                                    groupSize={reservation.guests}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </fieldset>
                );
            case 4: // Gegevens
                 const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                    const { name, value, type } = e.target;
                    const isCheckbox = type === 'checkbox';
                    const processedValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;
                    updateReservation({ [name]: processedValue });
                };
                return (
                    <fieldset>
                        <legend>{i18n.wizardStep4Title}</legend>
                        <div className="form-grid">
                            <div className="form-group"><label htmlFor="companyName">{i18n.formCompany}</label><input id="companyName" name="companyName" type="text" value={reservation.companyName} onChange={handleFormChange} /></div>
                            <div className="form-group"><label htmlFor="salutation">{i18n.formSalutation}</label><select id="salutation" name="salutation" value={reservation.salutation} onChange={handleFormChange} required><option>Dhr.</option><option>Mevr.</option><option>N.v.t.</option></select></div>
                            <div className="form-group"><label htmlFor="contactName">{i18n.formContactPerson}</label><input id="contactName" name="contactName" type="text" value={reservation.contactName} onChange={handleFormChange} required /></div>
                            <div className="form-group"><label htmlFor="address">{i18n.formAddress}</label><input id="address" name="address" type="text" value={reservation.address} onChange={handleFormChange} required /></div>
                            <div className="form-group"><label htmlFor="houseNumber">{i18n.formHouseNumber}</label><input id="houseNumber" name="houseNumber" type="text" value={reservation.houseNumber} onChange={handleFormChange} required /></div>
                            <div className="form-group"><label htmlFor="postalCode">{i18n.formPostalCode}</label><input id="postalCode" name="postalCode" type="text" value={reservation.postalCode} onChange={handleFormChange} required /></div>
                            <div className="form-group"><label htmlFor="city">{i18n.formCity}</label><input id="city" name="city" type="text" value={reservation.city} onChange={handleFormChange} required /></div>
                            <div className="form-group">
                                <label htmlFor="country">Land *</label>
                                <select id="country" name="country" value={reservation.country || 'BE'} onChange={handleFormChange} required>
                                    <option value="BE">België</option>
                                    <option value="NL">Nederland</option>
                                    <option value="DE">Duitsland</option>
                                    <option value="FR">Frankrijk</option>
                                    <option value="LU">Luxemburg</option>
                                    <option value="OTHER">Ander land...</option>
                                </select>
                            </div>
                            {reservation.country === 'OTHER' && (
                                <div className="form-group">
                                    <label htmlFor="customCountry">Geef land op *</label>
                                    <input id="customCountry" name="customCountry" type="text" value={reservation.customCountry || ''} onChange={handleFormChange} required placeholder="Land invullen" />
                                </div>
                            )}
                            <div className="form-group phone-field-wide">
                                <label htmlFor="phoneCode">Telefoon *</label>
                                <div className="phone-input-group">
                                    <select name="phoneCode" value={reservation.phoneCode || '+32'} onChange={handleFormChange} className="phone-code-select">
                                        <option value="+32">+32 (BE)</option>
                                        <option value="+31">+31 (NL)</option>
                                        <option value="+49">+49 (DE)</option>
                                        <option value="+33">+33 (FR)</option>
                                        <option value="+352">+352 (LU)</option>
                                        <option value="OTHER">Andere</option>
                                    </select>
                                    <input 
                                        id="phone" 
                                        name="phone" 
                                        type="tel" 
                                        value={reservation.phone || ''} 
                                        onChange={handleFormChange} 
                                        required 
                                        placeholder="Telefoonnummer"
                                        className="phone-number-input"
                                    />
                                </div>
                                {reservation.phoneCode === 'OTHER' && (
                                    <input 
                                        name="customPhoneCode" 
                                        type="text" 
                                        value={reservation.customPhoneCode || ''} 
                                        onChange={handleFormChange} 
                                        placeholder="Bijv. +1" 
                                        className="custom-phone-code"
                                    />
                                )}
                            </div>
                            <div className="form-group"><label htmlFor="email">{i18n.formEmail}</label><input id="email" name="email" type="email" value={reservation.email} onChange={handleFormChange} required /></div>
                        </div>

                        {/* Allergieën Sectie - Heel belangrijk voor restaurant */}
                        <fieldset>
                            <legend>🥗 Allergieën & Dieetwensen</legend>
                            <div className="allergy-section">
                                <div className="form-group single-column">
                                    <label htmlFor="allergies" className="important-label">
                                        Heeft u allergieën, dieetwensen of bijzondere verzoeken? 
                                    </label>
                                    <textarea 
                                        id="allergies" 
                                        name="allergies" 
                                        value={reservation.allergies || ''} 
                                        onChange={handleFormChange}
                                        placeholder="Bijvoorbeeld: lactose-intolerant, vegetarisch, glutenvrij, noten-allergie, halal, kosher..."
                                        rows={3}
                                        className="allergy-textarea"
                                    />
                                    <div className="form-help-text">
                                        💡 Deze informatie wordt direct doorgegeven aan onze keuken voor een veilige en aangename culinaire ervaring.
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        {/* Factuuradres Sectie */}
                        <fieldset>
                            <legend>📄 Factuurgegevens</legend>
                            <div className="billing-section">
                                <div className="form-group single-column">
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            name="differentBillingAddress" 
                                            checked={reservation.differentBillingAddress || false} 
                                            onChange={handleFormChange}
                                        />
                                        Factuuradres wijkt af van contactadres
                                    </label>
                                </div>
                                
                                {reservation.differentBillingAddress && (
                                    <div className="billing-address-fields">
                                        <div className="form-grid">
                                            <div className="form-group"><label htmlFor="billingCompany">Bedrijfsnaam</label><input id="billingCompany" name="billingCompany" type="text" value={reservation.billingCompany || ''} onChange={handleFormChange} /></div>
                                            <div className="form-group"><label htmlFor="billingContact">Contactpersoon</label><input id="billingContact" name="billingContact" type="text" value={reservation.billingContact || ''} onChange={handleFormChange} /></div>
                                            <div className="form-group"><label htmlFor="billingAddress">Adres *</label><input id="billingAddress" name="billingAddress" type="text" value={reservation.billingAddress || ''} onChange={handleFormChange} required={reservation.differentBillingAddress} /></div>
                                            <div className="form-group"><label htmlFor="billingHouseNumber">Huisnummer *</label><input id="billingHouseNumber" name="billingHouseNumber" type="text" value={reservation.billingHouseNumber || ''} onChange={handleFormChange} required={reservation.differentBillingAddress} /></div>
                                            <div className="form-group"><label htmlFor="billingPostalCode">Postcode *</label><input id="billingPostalCode" name="billingPostalCode" type="text" value={reservation.billingPostalCode || ''} onChange={handleFormChange} required={reservation.differentBillingAddress} /></div>
                                            <div className="form-group"><label htmlFor="billingCity">Plaats *</label><input id="billingCity" name="billingCity" type="text" value={reservation.billingCity || ''} onChange={handleFormChange} required={reservation.differentBillingAddress} /></div>
                                        </div>
                                        <div className="form-group single-column">
                                            <label htmlFor="billingInstructions">Bijzonderheden factuurafhandeling</label>
                                            <textarea 
                                                id="billingInstructions" 
                                                name="billingInstructions" 
                                                value={reservation.billingInstructions || ''} 
                                                onChange={handleFormChange}
                                                placeholder="Bijvoorbeeld: BTW-nummer, PO-nummer, bijzondere verzendwensen..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend>Viering</legend>
                            <div className="celebration-fields">
                                <div className="form-group single-column">
                                    <label htmlFor="celebrationName">{i18n.celebrationName}</label>
                                    <input id="celebrationName" name="celebrationName" type="text" value={reservation.celebrationName} onChange={handleFormChange} placeholder="Bijvoorbeeld: Jan Jansen" />
                                </div>
                                <div className="form-group single-column">
                                    <label htmlFor="celebrationOccasion">{i18n.celebrationOccasion}</label>
                                    <input id="celebrationOccasion" name="celebrationOccasion" type="text" value={reservation.celebrationOccasion} onChange={handleFormChange} placeholder="Bijvoorbeeld: verjaardag, jubileum, pensioen" />
                                </div>
                            </div>
                        </fieldset>
                         <fieldset>
                            <legend>{i18n.formConsent}</legend>
                            <div className="form-group single-column">
                                <label htmlFor="remarks">{i18n.formRemarks}</label>
                                <textarea id="remarks" name="remarks" value={reservation.remarks} onChange={handleFormChange}></textarea>
                            </div>
                            <div className="checkbox-group">
                                <label><input type="checkbox" name="newsletter" checked={reservation.newsletter} onChange={handleFormChange} /> {i18n.consentNewsletter}</label>
                                <label><input type="checkbox" name="termsAccepted" checked={reservation.termsAccepted} onChange={handleFormChange} required /> {i18n.consentTerms}</label>
                            </div>
                        </fieldset>
                    </fieldset>
                );
            case 5: // Overzicht
                const { guests, drinkPackage, preShowDrinks, afterParty, addons, ...details } = reservation;
                const overviewShowType = config.showTypes.find(st => st.name === show.type);
                if (!overviewShowType) return null;
                
                return (
                    <fieldset className="final-summary-ticket">
                        {/* Show title and date in overlay box */}
                        <div className="show-info-overlay">
                            <h3 className="show-title-main">{show.name}</h3>
                            <p className="show-date-main">
                                {formattedDate}
                                {/* Show type only if it's in the legend (special shows) */}
                                {(() => {
                                    const showType = config.showTypes.find(st => st.name === show.type);
                                    return showType?.showInLegend ? ` - ${show.type}` : '';
                                })()}
                            </p>
                        </div>

                        {/* Show times overlapping bottom of overlay */}
                        <div className="show-times-cards">
                            <div className="time-info-card">
                                <span className="time-icon">🚪</span>
                                <span className="time-label">Deuren:</span>
                                <span className="time-value">{doorsOpenTime}</span>
                            </div>
                            <div className="time-info-card">
                                <span className="time-icon">🎭</span>
                                <span className="time-label">Show:</span>
                                <span className="time-value">{showTimes.start} - {showTimes.end}</span>
                            </div>
                        </div>

                        <legend>{i18n.wizardStep5Title}</legend>
                        <div className="wizard-summary">
                            <div className="summary-section">
                                <div className="summary-header"><h4>{i18n.yourSelection}</h4><button type="button" onClick={() => goToStep(1)} className="btn-text">{i18n.edit}</button></div>
                                <p><strong>{i18n.numberOfGuests}:</strong> {guests}</p>
                                <p><strong>{i18n.formPackage}:</strong> {drinkPackage === 'standard' ? i18n.standardPackage : i18n.packagePremium}</p>
                                <p><strong>{i18n.pricing}:</strong> €{(drinkPackage === 'standard' ? overviewShowType.priceStandard : overviewShowType.pricePremium).toFixed(2)} per persoon</p>
                            </div>
                            {(preShowDrinks || afterParty || Object.values(addons).some((v): v is number => typeof v === 'number' && v > 0)) && (
                            <div className="summary-section">
                                <div className="summary-header"><h4>{i18n.formAddons}</h4><button type="button" onClick={() => goToStep(2)} className="btn-text">{i18n.edit}</button></div>
                                <ul>
                                    {preShowDrinks && <li>Pre-show borrel ({guests} personen)</li>}
                                    {afterParty && <li>After party ({guests} personen)</li>}
                                    {Object.entries(addons).filter(([, val]) => typeof val === 'number' && val > 0).map(([key, val]) => (
                                        <li key={key}>
                                          {config.merchandise.find(m => m.id === key)?.name || key} x {val}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            )}
                            <div className="summary-section">
                                <div className="summary-header"><h4>{i18n.formContactPerson}</h4><button type="button" onClick={() => goToStep(4)} className="btn-text">{i18n.edit}</button></div>
                                <p>{details.contactName}</p>
                                <p>{details.address}, {details.houseNumber}</p>
                                <p>{details.postalCode}, {details.city}</p>
                                <p>{details.email} | {details.phone}</p>
                            </div>
                        </div>
                    </fieldset>
                );
            default: return null;
        }
    }

    const getStepValidationErrors = () => {
        const errors: string[] = [];
        
        if (currentStep === 1) {
            // Stap 1: Arrangement & Gasten
            if (!reservation.drinkPackage) {
                errors.push('Kies een arrangement: Standaard of Premium');
            }
            if (!reservation.guests || reservation.guests < 1) {
                errors.push('Vul een geldig aantal gasten in (minimaal 1)');
            }
            if (reservation.guests > (currentShowType?.defaultCapacity || 150)) {
                errors.push(`Maximum aantal gasten is ${currentShowType?.defaultCapacity || 150}`);
            }
        }
        
        if (currentStep === 4) {
            // Stap 4: Contactgegevens - verbeterde validatie
            if (!reservation.contactName?.trim()) errors.push('Naam van de contactpersoon is verplicht');
            if (!reservation.address?.trim()) errors.push('Straatnaam is verplicht');
            if (!reservation.houseNumber?.trim()) errors.push('Huisnummer is verplicht');
            if (!reservation.postalCode?.trim()) errors.push('Postcode is verplicht');
            if (!reservation.city?.trim()) errors.push('Woonplaats is verplicht');
            if (!reservation.phone?.trim()) errors.push('Telefoonnummer is verplicht');
            
            // E-mail validatie
            if (!reservation.email?.trim()) {
                errors.push('E-mailadres is verplicht');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reservation.email)) {
                errors.push('Voer een geldig e-mailadres in (bijvoorbeeld: naam@voorbeeld.nl)');
            }
            
            // Land validatie
            if (reservation.country === 'OTHER' && !reservation.customCountry?.trim()) {
                errors.push('Vul het land in wanneer u "Ander land" heeft gekozen');
            }
            
            // Telefoon validatie
            if (reservation.phoneCode === 'OTHER' && !reservation.customPhoneCode?.trim()) {
                errors.push('Vul de landcode in wanneer u "Andere" heeft gekozen');
            }
            
            // Validatie voor afwijkend factuuradres indien aangevinkt
            if (reservation.differentBillingAddress) {
                if (!reservation.billingAddress?.trim()) errors.push('Factuuradres is verplicht');
                if (!reservation.billingHouseNumber?.trim()) errors.push('Huisnummer voor factuuradres is verplicht');
                if (!reservation.billingPostalCode?.trim()) errors.push('Postcode voor factuuradres is verplicht');
                if (!reservation.billingCity?.trim()) errors.push('Plaats voor factuuradres is verplicht');
            }
        }
        
        if (currentStep === 5) {
            // Stap 5: Overzicht - alleen algemene voorwaarden
            if (!reservation.termsAccepted) errors.push('Accepteer de algemene voorwaarden om uw reservering te voltooien');
        }
        
        return errors;
    };
    
    const isStepValid = () => {
        return getStepValidationErrors().length === 0;
    };
    
    const summaryProps = {
        show, reservation, priceDetails, config, appliedCode, promoInput, 
        setPromoInput, onApplyCode: handleApplyCode, promoMessage,
        // Navigation props
        currentStep, totalSteps: WIZARD_STEPS, 
        onPrevStep: prevStep, onNextStep: nextStep,
        canGoNext: getStepValidationErrors().length === 0 && !isSubmitting,
        onSubmit: handleSubmit, isLastStep: currentStep === WIZARD_STEPS,
        isSubmitting
    }

    return (
        <form className={`wizard-form ${isMobile ? 'is-mobile' : ''}`} onSubmit={handleSubmit}>
             <div className={`wizard-main-content ${isMobile ? 'mobile-padding' : ''}`}>
                <div className="wizard-header">
                     <button type="button" className="wizard-close-btn" onClick={onClose} aria-label={i18n.close}><Icon id="close"/></button>
                </div>
                
                <div className="wizard-container">
                    <WizardProgress currentStep={currentStep} totalSteps={WIZARD_STEPS} />
                    <div className="wizard-step-container">
                        {renderStepContent()}
                    </div>
                </div>
            </div>
            
            {isMobile ? <MobileBookingSummary {...summaryProps} /> : <BookingSummarySidebar {...summaryProps} />}

        </form>
    );
};

const ShowSummary = ({ show, onStartBooking, isUnavailable, config, remainingCapacity }: { show: ShowEvent, onStartBooking: () => void, isUnavailable: boolean, config: AppConfig, remainingCapacity: number }) => {
    const showType = config.showTypes.find(st => st.name === show.type);
    if (!showType) return null;

    const dateObj = new Date(show.date + 'T12:00:00');
    const showTimes = getShowTimes(dateObj, show.type, config);
    const doorsOpenTime = calculateDoorsOpenTime(showTimes.start);
    const showImage = config.showNames.find(sn => sn.name === show.name)?.imageUrl;
    const formattedDate = dateObj.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="show-summary-panel-redesigned">
            <div className="summary-header-image-container">
                {showImage && <img src={showImage} alt={show.name} className="summary-header-image" />}
            </div>
            
            {/* Show title and date - no longer in overlay box */}
            <div className="show-header-section">
                <h3 className="show-title-redesigned">{show.name}</h3>
                <p className="show-date-redesigned">{formattedDate}</p>
                {showType?.showInLegend && (
                    <span className="show-type-badge">{show.type}</span>
                )}
            </div>

            {/* Show times as clean text - no boxes */}
            <div className="show-times-section">
                <p className="show-times-text">
                    <strong>Deuren:</strong> {doorsOpenTime} | <strong>Show:</strong> {showTimes.start} - {showTimes.end}
                </p>
            </div>

            <div className="summary-content">
                {/* Arrangement prices section with help icons */}
                <div className="arrangement-prices-section">
                    <h4>Arrangement Prijzen</h4>
                    <div className="price-items-with-help">
                        <div className="price-item-with-tooltip">
                            <div className="price-item">
                                <span>{i18n.standardPackage}</span>
                                <span className="price">€{showType.priceStandard.toFixed(2)}</span>
                            </div>
                            <div className="help-icon-container" title="Standaard arrangement bevat: welkomstdrankje, 4-gangen diner en toegang tot de show">
                                <Icon id="help-circle" />
                            </div>
                        </div>
                        <div className="price-item-with-tooltip">
                            <div className="price-item">
                                <span>{i18n.premiumPackage}</span>
                                <span className="price">€{showType.pricePremium.toFixed(2)}</span>
                            </div>
                            <div className="help-icon-container" title="Premium arrangement bevat: champagne ontvangst, 5-gangen diner met wijnarrangement, VIP-plaatsen en toegang tot de show">
                                <Icon id="help-circle" />
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={onStartBooking} className="submit-btn wide-btn booking-cta">
                    {isUnavailable ? i18n.joinWaitingList : i18n.bookShow.bookButton}
                </button>
                
                {isUnavailable && (
                    <div className="waitinglist-info">
                        <Icon id="info" />
                        <p>{i18n.waitingListAvailable}</p>
                    </div>
                )}

                {!isUnavailable && remainingCapacity <= 20 && (
                    <div className="availability-warning">
                        <Icon id="clock" />
                        <p>Nog slechts {remainingCapacity} plaatsen beschikbaar!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminDayDetails = ({ date, show, reservations, waitingList, onDeleteReservation, onDeleteWaitingList, onToggleCheckIn, config, onDeleteShow, onToggleShowStatus: handleToggleShowStatus, onEditReservation, onUpdateReservation, onAddBooking, onAddShow }: {
    date: string,
    show: ShowEvent | undefined,
    reservations: Reservation[],
    waitingList: WaitingListEntry[],
    onDeleteReservation: (id: string) => void,
    onDeleteWaitingList: (id: string) => void,
    onToggleCheckIn: (reservationId: string) => void,
    config: AppConfig,
    onDeleteShow: (showId: string) => void,
    onToggleShowStatus: (showId: string) => void,
    onEditReservation: (reservation: Reservation) => void,
    onUpdateReservation: (reservation: Reservation) => void,
    onAddBooking?: (date: string, show: ShowEvent) => void,
    onAddShow?: () => void,
}) => {
    const [aiSummary, setAiSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [viewingList, setViewingList] = useState<'checkin' | 'kitchen' | null>(null);
    const [reservationFilter, setReservationFilter] = useState<'all' | 'checked-in' | 'waiting' | 'premium' | 'celebrations' | 'provisional'>('all');
    const { confirm } = useConfirmation();
    const { addToast } = useToast();
    const merchandiseMap = useMemo(() => new Map(config.merchandise.map(item => [item.id, item.name])), [config.merchandise]);
    const capSlogansMap = useMemo(() => new Map(config.capSlogans.map((slogan, index) => [`cap${index}`, slogan])), [config.capSlogans]);

    // Filter reservations based on selected filter
    const filteredReservations = useMemo(() => {
        switch (reservationFilter) {
            case 'checked-in':
                return reservations.filter(r => r.checkedIn);
            case 'waiting':
                return reservations.filter(r => !r.checkedIn);
            case 'premium':
                return reservations.filter(r => r.drinkPackage === 'premium');
            case 'celebrations':
                return reservations.filter(r => r.celebrationOccasion && r.celebrationOccasion.trim() !== '');
            case 'provisional':
                return reservations.filter(r => r.status === 'provisional');
            default:
                return reservations;
        }
    }, [reservations, reservationFilter]);


    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        setError('');
        setAiSummary('');
        try {
            // AI functionality removed - feature disabled
            setError('AI samenvatting is momenteel niet beschikbaar.');
            return;
        } catch (e) {
            setError("AI samenvatting generatie mislukt.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleDeleteShow = () => {
        if (!show) return;
        confirm({
            title: i18n.deleteShow,
            message: i18n.deleteShowConfirm,
            onConfirm: () => {
                onDeleteShow(show.id);
                addToast(i18n.showDeleted, 'success');
            },
            confirmButtonClass: 'delete-btn'
        });
    }

    if (!date) {
        return <div className="placeholder-card card"><Icon id="calendar-day" className="placeholder-icon" /><p>{i18n.selectDatePrompt}</p></div>;
    }

    const dateObj = new Date(date + 'T12:00:00');
    const formattedDate = dateObj.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
    const showTimes = getShowTimes(dateObj, show?.type || 'Standaard', config);
    const doorsOpenTime = calculateDoorsOpenTime(showTimes.start);

    if (!show) {
        return (
            <div className="placeholder-card card">
                <div className="placeholder-header">
                    <h3>{formattedDate}</h3>
                    {onAddShow && (
                        <button onClick={onAddShow} className="btn-primary add-show-btn">
                            <Icon id="plus" /> Show Toevoegen
                        </button>
                    )}
                </div>
                <div className="placeholder-content">
                    <Icon id="show" className="placeholder-icon" />
                    <p>{i18n.noShowOnDate}</p>
                    <p className="placeholder-subtitle">Voeg een show toe om reserveringen te kunnen ontvangen</p>
                </div>
            </div>
        );
    }
    
    const toggleRow = (id: string) => setExpandedRow(prev => prev === id ? null : id);
    
    // Calculate stats for enhanced date details
    const totalGuests = reservations.reduce((acc, r) => acc + r.guests, 0);
    const waitingListGuests = waitingList.reduce((acc, wl) => acc + wl.guests, 0);
    const checkedInGuests = reservations.filter(r => r.checkedIn).reduce((acc, r) => acc + r.guests, 0);
    const capacityPercentage = Math.round((totalGuests / show.capacity) * 100);
    const totalRevenue = reservations.reduce((acc, r) => acc + (r.totalPrice || 0), 0);
    const premiumGuestsCount = reservations.filter(r => r.drinkPackage === 'premium').reduce((acc, r) => acc + r.guests, 0);
    const celebrationCount = reservations.filter(r => r.celebrationOccasion && r.celebrationOccasion.trim() !== '').length;
    
    const getReservationDetails = (reservation: Reservation) => {
        const allAddons = [];
        if(reservation.preShowDrinks) allAddons.push(`${merchandiseMap.get('preShowDrinks')} (x${reservation.guests})`);
        if(reservation.afterParty) allAddons.push(`${merchandiseMap.get('afterParty')} (x${reservation.guests})`);

        for (const [key, value] of Object.entries(reservation.addons)) {
            if (value > 0) {
                const name = merchandiseMap.get(key) || capSlogansMap.get(key) || key;
                allAddons.push(`${name} (x${value})`);
            }
        }
        
        return (
            <div className="reservation-details">
                <div className="detail-section"><strong>📞 Contact:</strong> {reservation.email} | {reservation.phone}</div>
                <div className="detail-section"><strong>📍 Adres:</strong> {reservation.address} {reservation.houseNumber}, {reservation.postalCode} {reservation.city}</div>
                <div className="detail-section"><strong>{i18n.formPackage}:</strong> {reservation.drinkPackage === 'premium' ? 'Premium' : 'Standaard'}</div>
                {(reservation.celebrationName || reservation.celebrationOccasion) && <div className="detail-section"><strong>🎉 Viering:</strong> {reservation.celebrationOccasion} ({reservation.celebrationName})</div>}
                {allAddons.length > 0 && <div className="detail-section"><strong>🍹 Borrels & Extra's:</strong> {allAddons.join(', ')}</div>}
                {reservation.allergies && <div className="detail-section"><strong>🥗 Allergieën/Dieet:</strong> {reservation.allergies}</div>}
                {reservation.remarks && <div className="detail-section"><strong>{i18n.formRemarks}:</strong> {reservation.remarks}</div>}
                {reservation.promoCode && <div className="detail-section"><strong>🎟️ Promocode:</strong> {reservation.promoCode} (-€{(reservation.discountAmount || 0).toFixed(2)})</div>}
                <div className="detail-section"><strong>{i18n.totalPrice}:</strong> €{(reservation.totalPrice || 0).toFixed(2)}</div>
                <div className="detail-section"><strong>📅 Geboekt op:</strong> {reservation.createdAt ? new Date(reservation.createdAt).toLocaleDateString('nl-NL') : 'Onbekend'}</div>
            </div>
        );
    };


    return (
        <>
            <div className="day-details card">
                <div className="day-details-header">
                    <div className="date-title-section">
                        <h3>{formattedDate}</h3>
                        <div className="show-badge">
                            <Icon id="theater" />
                            {show.name} - {show.type}
                        </div>
                        {/* Compact show times */}
                        <div className="calendar-show-times">
                            <div className="calendar-time-item">
                                <span className="time-label">Deuren</span>
                                <span className="time-value">{doorsOpenTime}</span>
                            </div>
                            <div className="calendar-time-item">
                                <span className="time-label">Show</span>
                                <span className="time-value">{showTimes.start}</span>
                            </div>
                        </div>
                    </div>
                    <div className="day-details-actions">
                        {show && onAddBooking && (
                            <button 
                                onClick={() => onAddBooking(date, show)} 
                                className="btn-primary add-booking-btn"
                            >
                                <Icon id="plus" /> Reservering Toevoegen
                            </button>
                        )}
                        <button onClick={() => setViewingList('checkin')} className="btn-secondary">
                            <Icon id="check" /> {i18n.startCheckIn}
                        </button>
                        <button onClick={handleGenerateSummary} disabled={isGenerating} className="btn-secondary">
                            {isGenerating ? <><Icon id="loader" className="spinning"/> {i18n.generating}</> : <><Icon id="sparkle" /> {i18n.generateSummary}</>}
                        </button>
                        <button onClick={handleDeleteShow} className="icon-btn delete-btn" title={i18n.deleteShow}>
                            <Icon id="trash" />
                        </button>
                    </div>
                </div>

                {/* Enhanced Stats Overview */}
                <div className="date-stats-overview">
                    <div className="stats-grid">
                        <div className="stat-card capacity">
                            <div className="stat-header">
                                <Icon id="users" />
                                <span>Bezetting</span>
                            </div>
                            <div className="stat-value">{totalGuests} / {show.capacity}</div>
                            <div className="capacity-bar">
                                <div 
                                    className="capacity-fill" 
                                    style={{
                                        width: `${Math.min(capacityPercentage, 100)}%`,
                                        backgroundColor: capacityPercentage > 90 ? '#FF6347' : capacityPercentage > 70 ? '#FFD700' : '#32CD32'
                                    }}
                                ></div>
                            </div>
                            <div className="stat-subtitle">{capacityPercentage}% vol</div>
                        </div>

                        <div className="stat-card revenue">
                            <div className="stat-header">
                                <Icon id="euro" />
                                <span>Omzet</span>
                            </div>
                            <div className="stat-value">€{totalRevenue.toFixed(2)}</div>
                            <div className="stat-subtitle">Totaal verwacht</div>
                        </div>

                        <div className="stat-card checkin">
                            <div className="stat-header">
                                <Icon id="check-circle" />
                                <span>Ingecheckt</span>
                            </div>
                            <div className="stat-value">{checkedInGuests}</div>
                            <div className="stat-subtitle">{Math.round((checkedInGuests / totalGuests) * 100) || 0}% aanwezig</div>
                        </div>

                        <div className="stat-card premium">
                            <div className="stat-header">
                                <Icon id="star" />
                                <span>Premium</span>
                            </div>
                            <div className="stat-value">{premiumGuestsCount}</div>
                            <div className="stat-subtitle">Premium gasten</div>
                        </div>
                    </div>

                    {waitingListGuests > 0 && (
                        <div className="waiting-indicator">
                            <Icon id="clock" />
                            <span>{waitingListGuests} gasten op wachtlijst</span>
                        </div>
                    )}

                    {celebrationCount > 0 && (
                        <div className="celebration-indicator">
                            <Icon id="gift" />
                            <span>{celebrationCount} speciale gelegenheden</span>
                        </div>
                    )}
                </div>

                <div className="status-toggle-wrapper">
                    <span>{show.isClosed ? i18n.showClosedForBookings : i18n.showOpenForBookings}</span>
                    <label className="switch">
                      <input type="checkbox" checked={!show.isClosed} onChange={() => handleToggleShowStatus(show.id)} />
                      <span className="slider round"></span>
                    </label>
                </div>

                {error && <p className="error-message">{error}</p>}
                {aiSummary && (
                    <div className="ai-summary">
                        <h4><Icon id="sparkle" /> {i18n.aiSummary}</h4>
                        <p style={{whiteSpace: "pre-wrap"}}>{aiSummary}</p>
                    </div>
                )}
            </div>
            
            <div className="card">
                <div className="reservations-header">
                    <h3>{i18n.reservations} ({reservations.reduce((acc, r) => acc + r.guests, 0)} {i18n.guests})</h3>
                    <div className="reservation-filters">
                        <select 
                            value={reservationFilter} 
                            onChange={(e) => setReservationFilter(e.target.value as any)}
                            className="filter-select"
                        >
                            <option value="all">Alle reserveringen</option>
                            <option value="checked-in">Ingecheckt</option>
                            <option value="waiting">Wachtend</option>
                            <option value="premium">Premium pakket</option>
                            <option value="celebrations">Vieringen</option>
                            <option value="provisional">Voorlopig</option>
                        </select>
                    </div>
                </div>
                 <div className="table-wrapper">
                    {filteredReservations.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>{i18n.fullName}</th>
                                    <th>{i18n.guests}</th>
                                    <th>Pakket</th>
                                    <th>{i18n.status}</th>
                                    <th>{i18n.actions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReservations.map(r => (
                                    <Fragment key={r.id}>
                                        <tr className={`${r.checkedIn ? 'checked-in-row' : ''} ${r.status === 'provisional' ? 'provisional-row' : ''} ${r.bookingSource === 'external' ? 'external-row' : ''}`}>
                                            <td onClick={() => toggleRow(r.id)} style={{cursor:'pointer'}}>
                                                <div className='cell-main'>
                                                    {r.contactName}
                                                    {r.status === 'provisional' && <span className="status-badge provisional">Voorlopig</span>}
                                                    {r.bookingSource === 'external' && <span className="status-badge external">Extern</span>}
                                                    {r.celebrationOccasion && r.celebrationOccasion.trim() !== '' && (
                                                        <span className="status-badge celebration">
                                                            <Icon id="gift" /> {r.celebrationOccasion}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className='cell-sub'>{r.companyName || r.email}</div>
                                            </td>
                                            <td>
                                                <span className="guest-count">{r.guests}</span>
                                            </td>
                                            <td>
                                                <span className={`package-badge ${r.drinkPackage}`}>
                                                    {r.drinkPackage === 'premium' ? (
                                                        <><Icon id="star" /> Premium</>
                                                    ) : (
                                                        <><Icon id="coffee" /> Standaard</>
                                                    )}
                                                </span>
                                            </td>
                                            <td>
                                                {r.status === 'provisional' ? (
                                                    <div className="provisional-actions">
                                                        <button className="btn-approve" onClick={() => onUpdateReservation({ ...r, status: 'confirmed' })}>
                                                            <Icon id="check" /> {i18n.approveBooking}
                                                        </button>
                                                        <button className="btn-deny" onClick={() => onUpdateReservation({ ...r, status: 'cancelled' })}>
                                                            <Icon id="close" /> {i18n.denyBooking}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className={`check-in-btn ${r.checkedIn ? 'checked-in' : ''}`} onClick={() => onToggleCheckIn(r.id)}>
                                                        <Icon id="check" />
                                                        {r.checkedIn ? i18n.checkedIn : i18n.waiting}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="actions-col">
                                                <button onClick={() => onEditReservation(r)} className="icon-btn" title={i18n.editReservation}><Icon id="edit"/></button>
                                                <button onClick={() => confirm({ title: i18n.deleteConfirmation, message: i18n.deleteConfirm, onConfirm: () => onDeleteReservation(r.id), confirmButtonClass: 'delete-btn'})} className="icon-btn"><Icon id="trash"/></button>
                                            </td>
                                        </tr>
                                        {expandedRow === r.id && (
                                            <tr className="detail-row"><td colSpan={5}>{getReservationDetails(r)}</td></tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="no-data-message">
                            {reservationFilter === 'all' ? i18n.noReservations : `Geen reserveringen met filter "${reservationFilter}"`}
                        </p>
                    )}
                 </div>
            </div>
            
             <div className="card">
                 <h3 className="waiting-list-header">{i18n.waitingList} ({waitingList.reduce((acc, wl) => acc + wl.guests, 0)} {i18n.guests})</h3>
                 <div className="table-wrapper">
                    {waitingList.length > 0 ? (
                        <table>
                            <thead><tr><th>{i18n.fullName}</th><th>{i18n.guests}</th><th>{i18n.actions}</th></tr></thead>
                            <tbody>
                                {waitingList.map(wl => (
                                    <tr key={wl.id}>
                                        <td>{wl.name}</td>
                                        <td>{wl.guests}</td>
                                        <td className="actions-col">
                                            <button onClick={() => confirm({ title: i18n.deleteConfirmation, message: i18n.deleteConfirm, onConfirm: () => onDeleteWaitingList(wl.id), confirmButtonClass: 'delete-btn' })} className="icon-btn"><Icon id="trash"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="no-data-message">{i18n.noWaitingList}</p>
                    )}
                 </div>
            </div>
            {viewingList && 
                <PrintableListModal
                    listType={viewingList}
                    onClose={() => setViewingList(null)}
                    show={show}
                    reservations={reservations}
                    config={config}
                    onToggleCheckIn={onToggleCheckIn}
                />
            }
        </>
    );
};

// 🎭 Old AdminCalendarView removed - replaced with EnhancedAdminCalendarView component

const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="pagination-controls">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="icon-btn"><Icon id="chevron-left" /></button>
            <span>Pagina {currentPage} van {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="icon-btn"><Icon id="chevron-right" /></button>
        </div>
    );
};


// 🎫 Enhanced Modern Admin Reservations View with Advanced Features
const AdminReservationsView = ({ reservations, showEvents, onDeleteReservation, onEditReservation }: { 
    reservations: Reservation[], 
    showEvents: ShowEvent[], 
    onDeleteReservation: (id: string) => void,
    onEditReservation: (reservation: Reservation) => void 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Reservation | 'showName', direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc'});
    const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
    const { confirm } = useConfirmation();

    const showMap = useMemo(() => new Map(showEvents.map(s => [s.date, s])), [showEvents]);
    
    // Enhanced analytics for reservations - only count confirmed reservations
    const reservationStats = useMemo(() => {
        const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
        const totalReservations = confirmedReservations.length;
        const totalRevenue = confirmedReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
        const totalGuests = confirmedReservations.reduce((sum, r) => sum + (r.guests || 0), 0);
        const avgBookingValue = totalReservations > 0 ? totalRevenue / totalReservations : 0;
        
        const today = formatDate(new Date());
        const todayReservations = reservations.filter(r => r.date === today && r.status === 'confirmed').length;
        
        return {
            totalReservations,
            totalRevenue,
            totalGuests,
            avgBookingValue,
            todayReservations
        };
    }, [reservations]);
    
    const sortedFilteredReservations = useMemo(() => {
        // Only show confirmed reservations in main reservation list
        let filtered = reservations.filter(r => {
            // First filter by status - only show confirmed reservations
            if (r.status !== 'confirmed') return false;
            
            const show = showMap.get(r.date);
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = (r.contactName && r.contactName.toLowerCase().includes(searchLower)) ||
                   (r.companyName && r.companyName.toLowerCase().includes(searchLower)) ||
                   (r.email && r.email.toLowerCase().includes(searchLower)) ||
                   (r.date && r.date.includes(searchLower)) ||
                   (show && show.name.toLowerCase().includes(searchLower));

            // Date filter
            let matchesDate = true;
            if (dateFilter !== 'all') {
                const today = new Date();
                const resDate = new Date(r.date);
                
                if (dateFilter === 'today') {
                    matchesDate = formatDate(resDate) === formatDate(today);
                } else if (dateFilter === 'week') {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    matchesDate = resDate >= weekAgo;
                } else if (dateFilter === 'month') {
                    matchesDate = resDate.getMonth() === today.getMonth() && 
                                 resDate.getFullYear() === today.getFullYear();
                }
            }

            return matchesSearch && matchesDate;
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                if (sortConfig.key === 'showName') {
                    aValue = showMap.get(a.date)?.name || '';
                    bValue = showMap.get(b.date)?.name || '';
                } else {
                    aValue = a[sortConfig.key as keyof Reservation];
                    bValue = b[sortConfig.key as keyof Reservation];
                }
                
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [reservations, searchTerm, sortConfig, showMap, statusFilter, dateFilter]);
    
    const { currentItems, currentPage, totalPages, goToPage } = usePagination(sortedFilteredReservations, 15);
    
    const requestSort = (key: keyof Reservation | 'showName') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Reservation | 'showName') => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? <Icon id="chevron-up" /> : <Icon id="chevron-down" />;
    };

    const exportData = (format: 'csv' | 'json') => {
        const data = sortedFilteredReservations.map(r => ({
            date: r.date || '',
            show: showMap.get(r.date)?.name || 'Onbekend',
            contactName: r.contactName || '',
            email: r.email || '',
            guests: r.guests || 0,
            totalPrice: r.totalPrice || 0,
            companyName: r.companyName || '',
        }));

        if (format === 'csv') {
            const csv = [
                'Datum,Show,Contact,Email,Gasten,Bedrag,Bedrijf',
                ...data.map(row => `${row.date},${row.show},${row.contactName},${row.email},${row.guests},${row.totalPrice},${row.companyName}`)
            ].join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reserveringen_${formatDate(new Date())}.csv`;
            a.click();
        } else {
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reserveringen_${formatDate(new Date())}.json`;
            a.click();
        }
    };

    return (
        <div className="modern-admin-reservations">
            {/* Modern Header Section */}
            <div className="admin-header-section">
                <div className="header-content">
                    <div className="header-text">
                        <h1 className="page-title">� Reserveringen Overzicht</h1>
                        <p className="page-subtitle">
                            Professioneel beheer van alle theater reserveringen
                        </p>
                    </div>
                    <div className="header-actions">
                        <button 
                            onClick={() => exportData('csv')} 
                            className="export-btn primary-export"
                        >
                            📊 Exporteer Data
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Dashboard */}
            <div className="stats-dashboard">
                <div className="stat-card highlight-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                        <div className="stat-number">{reservationStats.totalReservations}</div>
                        <div className="stat-label">Totaal Reserveringen</div>
                    </div>
                </div>
                <div className="stat-card revenue-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <div className="stat-number">€{reservationStats.totalRevenue.toLocaleString()}</div>
                        <div className="stat-label">Totale Omzet</div>
                    </div>
                </div>
                <div className="stat-card guests-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <div className="stat-number">{reservationStats.totalGuests}</div>
                        <div className="stat-label">Totaal Gasten</div>
                    </div>
                </div>
                <div className="stat-card average-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <div className="stat-number">€{Math.round(reservationStats.avgBookingValue)}</div>
                        <div className="stat-label">Gemiddelde Boeking</div>
                    </div>
                </div>
                <div className="stat-card today-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                        <div className="stat-number">
                            {sortedFilteredReservations.filter(r => {
                                const today = new Date().toDateString();
                                return new Date(r.date + 'T12:00:00').toDateString() === today;
                            }).length}
                        </div>
                        <div className="stat-label">Vandaag</div>
                    </div>
                </div>
                <div className="stat-card week-card">
                    <div className="stat-icon">📆</div>
                    <div className="stat-content">
                        <div className="stat-number">
                            {sortedFilteredReservations.filter(r => {
                                const now = new Date();
                                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                                const resDate = new Date(r.date + 'T12:00:00');
                                return resDate >= now && resDate <= weekFromNow;
                            }).length}
                        </div>
                        <div className="stat-label">Deze Week</div>
                    </div>
                </div>
            </div>

            {/* Advanced Filter Section */}
            <div className="advanced-filters">
                <div className="filter-section">
                    <div className="filter-group">
                        <label className="filter-label">🔍 Zoeken</label>
                        <div className="search-wrapper">
                            <Icon id="search"/>
                            <input 
                                type="text" 
                                className="modern-search-input"
                                placeholder="Zoek op naam, email, telefoon of bedrijf..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>
                    
                    <div className="filter-group">
                        <label className="filter-label">📅 Periode</label>
                        <select 
                            value={dateFilter} 
                            onChange={(e) => setDateFilter(e.target.value as any)}
                            className="modern-select"
                        >
                            <option value="all">Alle Periodes</option>
                            <option value="today">Vandaag</option>
                            <option value="week">Deze Week</option>
                            <option value="month">Deze Maand</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label className="filter-label">🎭 Show Filter</label>
                        <select className="modern-select">
                            <option>Alle Shows</option>
                            {Array.from(new Set(sortedFilteredReservations.map(r => showMap.get(r.date)?.name).filter(Boolean))).map(showName => (
                                <option key={showName} value={showName}>{showName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Quick Filters */}
                <div className="quick-filters">
                    <button 
                        className={`quick-filter-btn ${dateFilter === 'today' ? 'active' : ''}`}
                        onClick={() => setDateFilter('today')}
                    >
                        � Vandaag
                    </button>
                    <button 
                        className={`quick-filter-btn ${dateFilter === 'week' ? 'active' : ''}`}
                        onClick={() => setDateFilter('week')}
                    >
                        📆 Deze Week  
                    </button>
                    <button 
                        className="quick-filter-btn"
                        onClick={() => {
                            setSearchTerm('');
                            setDateFilter('all');
                        }}
                    >
                        🔄 Reset Filters
                    </button>
                </div>
            </div>

            {/* Professional Data Table */}
            <div className="professional-table-container">
                <div className="table-header">
                    <h2 className="table-title">Reserveringen Database</h2>
                    <div className="table-info">
                        <span className="result-count">{sortedFilteredReservations.length} resultaten</span>
                        <div className="view-options">
                            <button className="view-btn active">📋 Tabel</button>
                            <button className="view-btn">🎯 Compact</button>
                        </div>
                    </div>
                </div>

                {currentItems.length > 0 ? (
                    <>
                        <div className="table-scroll-container">
                            <table className="professional-table">
                                <thead>
                                    <tr>
                                        <th onClick={() => requestSort('date')} className="sortable-header">
                                            📅 Datum & Tijd {getSortIcon('date')}
                                        </th>
                                        <th onClick={() => requestSort('showName')} className="sortable-header">
                                            🎭 Show Details {getSortIcon('showName')}
                                        </th>
                                        <th onClick={() => requestSort('contactName')} className="sortable-header">
                                            👤 Klant Informatie {getSortIcon('contactName')}
                                        </th>
                                        <th onClick={() => requestSort('guests')} className="sortable-header">
                                            👥 Gasten {getSortIcon('guests')}
                                        </th>
                                        <th onClick={() => requestSort('totalPrice')} className="sortable-header">
                                            💰 Financieel {getSortIcon('totalPrice')}
                                        </th>
                                        <th className="actions-header">⚡ Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((r, index) => (
                                        <tr key={r.id} className={`professional-row ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}>
                                            <td data-label="Datum & Tijd">
                                                <div className="date-info-cell">
                                                    <div className="date-primary">{formatDateToNL(new Date(r.date + 'T12:00:00'))}</div>
                                                    <div className="time-info">🕐 19:30</div>
                                                    <div className="day-info">
                                                        {new Date(r.date + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short' })}
                                                    </div>
                                                </div>
                                            </td>
                                            <td data-label="Show Details">
                                                <div className="show-info-cell">
                                                    <div className="show-title">{showMap.get(r.date)?.name || 'Onbekende Show'}</div>
                                                    <div className="show-type">🎪 {showMap.get(r.date)?.type || 'Standaard'}</div>
                                                    <div className="venue-info">🏛️ Theater Locatie</div>
                                                </div>
                                            </td>
                                            <td data-label="Klant Informatie">
                                                <div className="customer-info-cell">
                                                    <div className="customer-header">
                                                        <div className="customer-avatar-modern">
                                                            {r.contactName ? r.contactName.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <div className="customer-details">
                                                            <div className="customer-name-modern">{r.contactName || 'Onbekende Klant'}</div>
                                                            <div className="customer-company">🏢 {r.companyName || 'Particulier'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="contact-details">
                                                        <div className="email-info">📧 {r.email || 'Geen email'}</div>
                                                        <div className="phone-info">📱 {r.phone || 'Geen telefoon'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td data-label="Gasten">
                                                <div className="guests-info-cell">
                                                    <div className="guest-count-badge">
                                                        <span className="guest-icon">👥</span>
                                                        <span className="guest-number">{r.guests}</span>
                                                    </div>
                                                    <div className="capacity-info">
                                                        {r.guests >= 8 ? '🔥 Grote Groep' : '👤 Standaard'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td data-label="Financieel">
                                                <div className="financial-info-cell">
                                                    <div className="price-main">€{(r.totalPrice || 0).toLocaleString('nl-NL', {minimumFractionDigits: 2})}</div>
                                                    <div className="price-per-person">
                                                        €{r.guests > 0 ? ((r.totalPrice || 0) / r.guests).toFixed(0) : '0'}/pers
                                                    </div>
                                                    <div className="payment-status">💳 Betaald</div>
                                                </div>
                                            </td>
                                            <td data-label="Acties">
                                                <div className="actions-cell-modern">
                                                    <button 
                                                        onClick={() => onEditReservation(r)} 
                                                        className="action-btn-modern edit-action" 
                                                        title="Bewerk reservering"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button 
                                                        onClick={() => confirm({ 
                                                            title: "Reservering Verwijderen", 
                                                            message: `Weet u zeker dat u de reservering van ${r.contactName} wilt verwijderen?`, 
                                                            onConfirm: () => onDeleteReservation(r.id), 
                                                            confirmButtonClass: 'delete-btn'
                                                        })} 
                                                        className="action-btn-modern delete-action" 
                                                        title="Verwijder reservering"
                                                    >
                                                        🗑️
                                                    </button>
                                                    <button className="action-btn-modern view-action" title="Bekijk details">
                                                        👁️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Modern Pagination */}
                        <div className="modern-table-footer">
                            <div className="pagination-info">
                                <span className="results-text">
                                    Resultaten {((currentPage - 1) * 15) + 1} - {Math.min(currentPage * 15, sortedFilteredReservations.length)} van {sortedFilteredReservations.length}
                                </span>
                            </div>
                            <div className="pagination-controls">
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="modern-no-data">
                        <div className="no-data-illustration">�</div>
                        <h3 className="no-data-title">Geen reserveringen gevonden</h3>
                        <p className="no-data-description">
                            Probeer uw zoekterm aan te passen of wijzig de actieve filters om meer resultaten te zien.
                        </p>
                        <button 
                            className="reset-filters-btn"
                            onClick={() => {
                                setSearchTerm('');
                                setDateFilter('all');
                            }}
                        >
                            🔄 Reset alle filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// 👥 Enhanced Modern Admin Customers View with CRM Features
const AdminCustomersView = ({ customers, onSelectCustomer }: { customers: Customer[], onSelectCustomer: (customer: Customer) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Customer, direction: 'asc' | 'desc' } | null>({ key: 'lastVisit', direction: 'desc'});
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [filterType, setFilterType] = useState<'all' | 'vip' | 'recent' | 'frequent'>('all');
    
    // Enhanced customer analytics
    const customerStats = useMemo(() => {
        const totalCustomers = customers.length;
        const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
        const avgSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;
        const vipCustomers = customers.filter(c => c.totalSpent > 500).length;
        const recentCustomers = customers.filter(c => {
            const lastVisit = new Date(c.lastVisit);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return lastVisit >= thirtyDaysAgo;
        }).length;

        return {
            totalCustomers,
            totalSpent,
            avgSpent,
            vipCustomers,
            recentCustomers
        };
    }, [customers]);
    
    const sortedFilteredCustomers = useMemo(() => {
        let filtered = customers.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 c.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            let matchesFilter = true;
            if (filterType === 'vip') {
                matchesFilter = c.totalSpent > 500;
            } else if (filterType === 'recent') {
                const lastVisit = new Date(c.lastVisit);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                matchesFilter = lastVisit >= thirtyDaysAgo;
            } else if (filterType === 'frequent') {
                matchesFilter = c.totalBookings >= 5;
            }

            return matchesSearch && matchesFilter;
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [customers, searchTerm, sortConfig, filterType]);

    const { currentItems, currentPage, totalPages, goToPage } = usePagination(sortedFilteredCustomers, 15);
    
    const requestSort = (key: keyof Customer) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Customer) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? <Icon id="chevron-up" /> : <Icon id="chevron-down" />;
    };

    const getCustomerTier = (customer: Customer) => {
        if (customer.totalSpent > 1000) return { tier: 'Platinum', color: '#8b5cf6' };
        if (customer.totalSpent > 500) return { tier: 'Gold', color: '#f59e0b' };
        if (customer.totalSpent > 200) return { tier: 'Silver', color: '#6b7280' };
        return { tier: 'Bronze', color: '#92400e' };
    };

    const exportCustomers = () => {
        const csv = [
            'Naam,Email,Totaal Boekingen,Totaal Besteed,Laatste Bezoek',
            ...sortedFilteredCustomers.map(c => 
                `${c.name},${c.email},${c.totalBookings},${c.totalSpent.toFixed(2)},${c.lastVisit}`
            )
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `klanten_${formatDate(new Date())}.csv`;
        a.click();
    };
    
    return (
        <div className="enhanced-customers-view">
            {/* Enhanced Header */}
            <div className="customers-header">
                <div className="customers-title-section">
                    <h2 className="customers-title">👥 Klanten Database</h2>
                    <p className="customers-subtitle">
                        Beheer klantrelaties en analyseer klantgedrag voor betere service
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="customers-stats-grid">
                    <div className="stat-item">
                        <div className="stat-value">{customerStats.totalCustomers}</div>
                        <div className="stat-label">Totaal Klanten</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">€{customerStats.totalSpent.toFixed(0)}</div>
                        <div className="stat-label">Totale Omzet</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">€{customerStats.avgSpent.toFixed(0)}</div>
                        <div className="stat-label">Gem. Besteding</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{customerStats.vipCustomers}</div>
                        <div className="stat-label">VIP Klanten</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{customerStats.recentCustomers}</div>
                        <div className="stat-label">Recent Actief</div>
                    </div>
                </div>

                {/* Enhanced Controls */}
                <div className="customers-controls">
                    <div className="customers-controls-left">
                        <div className="search-input-wrapper">
                            <Icon id="search"/>
                            <input 
                                type="text" 
                                className="search-input"
                                placeholder="Zoek klanten op naam of email..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        
                        <select 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="filter-select"
                        >
                            <option value="all">👥 Alle Klanten</option>
                            <option value="vip">⭐ VIP Klanten (€500+)</option>
                            <option value="recent">🕒 Recent Actief</option>
                            <option value="frequent">🔄 Frequent (5+ boekingen)</option>
                        </select>
                    </div>

                    <div className="customers-controls-right">
                        <div className="view-toggle">
                            <button 
                                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                                onClick={() => setViewMode('table')}
                                title="Tabel weergave"
                            >
                                📋
                            </button>
                            <button 
                                className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                                onClick={() => setViewMode('cards')}
                                title="Kaart weergave"
                            >
                                🎴
                            </button>
                        </div>
                        
                        <button 
                            onClick={exportCustomers} 
                            className="secondary-action-btn"
                        >
                            📊 Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Content */}
            {viewMode === 'table' ? (
                <div className="enhanced-table-container">
                    {currentItems.length > 0 ? (
                        <>
                            <table className="enhanced-table">
                                <thead>
                                    <tr>
                                        <th onClick={() => requestSort('name')} className="sortable-header">
                                            👤 Klant {getSortIcon('name')}
                                        </th>
                                        <th onClick={() => requestSort('totalBookings')} className="sortable-header">
                                            🎫 Boekingen {getSortIcon('totalBookings')}
                                        </th>
                                        <th onClick={() => requestSort('totalSpent')} className="sortable-header">
                                            💰 Besteed {getSortIcon('totalSpent')}
                                        </th>
                                        <th onClick={() => requestSort('lastVisit')} className="sortable-header">
                                            📅 Laatste Bezoek {getSortIcon('lastVisit')}
                                        </th>
                                        <th>⭐ Tier</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map(c => {
                                        const tierInfo = getCustomerTier(c);
                                        return (
                                            <tr key={c.email} onClick={() => onSelectCustomer(c)} className="table-row-interactive">
                                                <td>
                                                    <div className="customer-cell">
                                                        <div className="customer-avatar">
                                                            {c.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="customer-info">
                                                            <div className="customer-name">{c.name}</div>
                                                            <div className="customer-email">{c.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="bookings-cell">
                                                        <span className="bookings-count">{c.totalBookings}</span>
                                                        <span className="bookings-label">boekingen</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="amount-cell">€{c.totalSpent.toFixed(2)}</div>
                                                </td>
                                                <td>
                                                    <div className="date-cell">
                                                        <div className="date-main">{formatDateToNL(new Date(c.lastVisit + 'T12:00:00'))}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span 
                                                        className="tier-badge" 
                                                        style={{ 
                                                            backgroundColor: `${tierInfo.color}20`, 
                                                            color: tierInfo.color,
                                                            border: `1px solid ${tierInfo.color}40`
                                                        }}
                                                    >
                                                        {tierInfo.tier}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <div className="table-footer">
                                <div className="results-info">
                                    Resultaten {((currentPage - 1) * 15) + 1} - {Math.min(currentPage * 15, sortedFilteredCustomers.length)} van {sortedFilteredCustomers.length}
                                </div>
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                            </div>
                        </>
                    ) : (
                        <div className="no-data-state">
                            <div className="no-data-icon">👥</div>
                            <h3>Geen klanten gevonden</h3>
                            <p>Probeer uw zoekterm aan te passen of wijzig de filters.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="customers-cards-view">
                    {currentItems.length > 0 ? (
                        <>
                            <div className="customers-grid">
                                {currentItems.map(c => {
                                    const tierInfo = getCustomerTier(c);
                                    return (
                                        <div key={c.email} className="customer-card" onClick={() => onSelectCustomer(c)}>
                                            <div className="customer-card-header">
                                                <div className="customer-avatar-large">
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span 
                                                    className="tier-badge-card" 
                                                    style={{ 
                                                        backgroundColor: `${tierInfo.color}20`, 
                                                        color: tierInfo.color,
                                                        border: `1px solid ${tierInfo.color}40`
                                                    }}
                                                >
                                                    {tierInfo.tier}
                                                </span>
                                            </div>
                                            <div className="customer-card-body">
                                                <h3 className="customer-card-name">{c.name}</h3>
                                                <p className="customer-card-email">{c.email}</p>
                                                <div className="customer-card-stats">
                                                    <div className="card-stat">
                                                        <span className="card-stat-value">{c.totalBookings}</span>
                                                        <span className="card-stat-label">Boekingen</span>
                                                    </div>
                                                    <div className="card-stat">
                                                        <span className="card-stat-value">€{c.totalSpent.toFixed(0)}</span>
                                                        <span className="card-stat-label">Besteed</span>
                                                    </div>
                                                </div>
                                                <div className="customer-card-footer">
                                                    <span className="last-visit">
                                                        Laatste bezoek: {formatDateToNL(new Date(c.lastVisit + 'T12:00:00'))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="cards-pagination">
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                            </div>
                        </>
                    ) : (
                        <div className="no-data-state">
                            <div className="no-data-icon">👥</div>
                            <h3>Geen klanten gevonden</h3>
                            <p>Probeer uw zoekterm aan te passen of wijzig de filters.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const CustomerDetailView = ({ customer, onBack, showEvents, onEditReservation }: { 
    customer: Customer, 
    onBack: () => void, 
    showEvents: ShowEvent[],
    onEditReservation: (reservation: Reservation) => void;
}) => {
    const showMap = useMemo(() => {
        const map = new Map<string, ShowEvent>();
        showEvents.forEach(e => map.set(e.date, e));
        return map;
    }, [showEvents]);

    return (
        <>
            <div className="content-header">
                <h2>{i18n.customerDetailTitle}</h2>
                <button onClick={onBack} className="btn-secondary"><Icon id="arrow-left"/> {i18n.backToCustomers}</button>
            </div>
            <div className="dashboard-kpi-grid" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))'}}>
                <div className="kpi-card"><div className="kpi-content"><div className="kpi-value">{customer.name}</div><div className="kpi-label">{customer.email}</div></div></div>
                <div className="kpi-card"><div className="kpi-content"><div className="kpi-value">{customer.totalBookings}</div><div className="kpi-label">{i18n.totalBookings}</div></div></div>
                <div className="kpi-card"><div className="kpi-content"><div className="kpi-value">€{customer.totalSpent.toFixed(2)}</div><div className="kpi-label">{i18n.totalSpent}</div></div></div>
                <div className="kpi-card"><div className="kpi-content"><div className="kpi-value">{formatDateToNL(new Date(customer.lastVisit + 'T12:00:00'))}</div><div className="kpi-label">{i18n.lastVisit}</div></div></div>
            </div>
             <div className="card">
                <h3>{i18n.bookingHistory}</h3>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>{i18n.date}</th><th>{i18n.show}</th><th>{i18n.guests}</th><th>{i18n.totalPrice}</th><th>{i18n.actions}</th></tr>
                        </thead>
                        <tbody>
                            {customer.reservations.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(r => (
                                <tr key={r.id}>
                                    <td>{formatDateToNL(new Date(r.date + 'T12:00:00'))}</td>
                                    <td>{showMap.get(r.date)?.name || 'Onbekende Show'}</td>
                                    <td>{r.guests}</td>
                                    <td>€{r.totalPrice.toFixed(2)}</td>
                                    <td className="actions-col">
                                        <button onClick={() => onEditReservation(r)} className="icon-btn" title={i18n.editReservation}><Icon id="edit"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

//  Admin Waitlist View - Basic Implementation for Phase 1  
const AdminWaitlistView = ({ waitingList, showEvents }: {
    waitingList: WaitingListEntry[];
    showEvents: ShowEvent[];
}) => {
    const [filterShow, setFilterShow] = useState<string>('all');

    // Use existing waitingList structure and work with what we have
    const filteredWaitlist = filterShow === 'all' ? 
        waitingList : 
        waitingList.filter(entry => entry.date === filterShow);

    const waitlistByShow = useMemo(() => {
        const grouped = new Map<string, WaitingListEntry[]>();
        waitingList.forEach(entry => {
            const show = showEvents.find(s => s.date === entry.date);
            const key = `${entry.date}-${show?.name || 'Onbekende show'}`;
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(entry);
        });
        return Array.from(grouped.entries()).map(([key, entries]) => {
            const show = showEvents.find(s => s.date === entries[0].date);
            return {
                key,
                showDate: entries[0].date,
                showName: show?.name || 'Onbekende show',
                showType: show?.type || 'Onbekend type',
                entries: entries.sort((a, b) => (a.priority || 0) - (b.priority || 0))
            };
        });
    }, [waitingList, showEvents]);

    const handleNotify = (entry: WaitingListEntry) => {
        // For Phase 1, just console log - will implement email in later phase
        };

    const handleConvert = (entry: WaitingListEntry) => {
        // For Phase 1, just console log - will implement conversion in later phase
        };

    const handleRemove = (entry: WaitingListEntry) => {
        // For Phase 1, just console log - will implement removal in later phase
        };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'active': return 'var(--admin-success)';
            case 'notified': return 'var(--admin-warning)';
            case 'converted': return 'var(--admin-primary)';
            case 'expired': return 'var(--admin-danger)';
            default: return 'var(--admin-secondary)';
        }
    };

    return (
        <div className="waitlist-view">
            <div className="content-header">
                <h2><Icon id="clock" /> {i18n.waitlist}</h2>
                <p>{i18n.waitlistDescription}</p>
            </div>

            {/* KPI Cards */}
            <div className="dashboard-kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon"><Icon id="users"/></div>
                    <div className="kpi-content">
                        <div className="kpi-value">{waitingList.filter(w => (w.status || 'active') === 'active').length}</div>
                        <div className="kpi-label">{i18n.totalWaitlist}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon"><Icon id="check"/></div>
                    <div className="kpi-content">
                        <div className="kpi-value">{waitingList.filter(w => w.status === 'converted').length}</div>
                        <div className="kpi-label">Geconverteerd</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon"><Icon id="alert-triangle"/></div>
                    <div className="kpi-content">
                        <div className="kpi-value">{waitingList.filter(w => w.status === 'notified').length}</div>
                        <div className="kpi-label">Genotificeerd</div>
                    </div>
                </div>
            </div>

            {/* Waitlist by Show */}
            <div className="waitlist-overview">
                {waitlistByShow.length > 0 ? waitlistByShow.map(({ key, showDate, showName, showType, entries }) => (
                    <div key={key} className="card waitlist-show-card">
                        <div className="card-header">
                            <h3>{showName} - {showType}</h3>
                            <div className="show-info">
                                <span>{formatDateToNL(new Date(showDate + 'T12:00:00'))}</span>
                                <span className="waitlist-count">{entries.length} in wachtlijst</span>
                            </div>
                        </div>
                        
                        <div className="waitlist-queue">
                            {entries.map((entry, index) => (
                                <div key={entry.id} className="waitlist-entry">
                                    <div className="queue-position">#{index + 1}</div>
                                    <div className="customer-info">
                                        <div className="customer-name">{entry.name}</div>
                                        <div className="customer-details">
                                            {entry.email || 'Geen email'} • {entry.guests} gasten
                                        </div>
                                        <div className="entry-date">
                                            Toegevoegd: {entry.addedAt ? formatDateToNL(new Date(entry.addedAt)) : 'Onbekend'}
                                        </div>
                                    </div>
                                    <div className="entry-status">
                                        <span 
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(entry.status) }}
                                        >
                                            {entry.status === 'active' || !entry.status ? i18n.statusActive :
                                             entry.status === 'notified' ? i18n.statusNotified :
                                             entry.status === 'converted' ? i18n.statusConverted :
                                             entry.status === 'expired' ? i18n.statusExpired :
                                             entry.status}
                                        </span>
                                        {(entry.notificationsSent || 0) > 0 && (
                                            <div className="notification-count">
                                                {entry.notificationsSent} notificaties
                                            </div>
                                        )}
                                    </div>
                                    <div className="entry-actions">
                                        {(entry.status === 'active' || !entry.status) && (
                                            <>
                                                <button 
                                                    onClick={() => handleNotify(entry)}
                                                    className="btn-primary"
                                                    title={i18n.notifyWaitlist}
                                                >
                                                    📧
                                                </button>
                                                <button 
                                                    onClick={() => handleConvert(entry)}
                                                    className="btn-success"
                                                    title={i18n.convertToBooking}
                                                >
                                                    ✅
                                                </button>
                                            </>
                                        )}
                                        <button 
                                            onClick={() => handleRemove(entry)}
                                            className="btn-danger"
                                            title={i18n.removeFromWaitlist}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="no-data-state">
                        <div className="no-data-icon">📋</div>
                        <h3>Geen wachtlijst</h3>
                        <p>Er zijn momenteel geen klanten op de wachtlijst.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// 🎭 THEATERBON MANAGEMENT - Volledig gebruik systeem
const TheaterVoucherManagement = ({ 
    theaterVouchers, 
    onCreateVoucher, 
    onExtendVoucher, 
    onUpdateVoucher,
    onDeleteVoucher 
}: {
    theaterVouchers: TheaterVoucher[];
    onCreateVoucher: (voucher: Omit<TheaterVoucher, 'id'>) => void;
    onExtendVoucher: (voucherId: string, months: number) => void;
    onUpdateVoucher: (voucher: TheaterVoucher) => void;
    onDeleteVoucher?: (voucherId: string) => void;
}) => {
    const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired' | 'expiring_soon' | 'archived'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<TheaterVoucher | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [newVoucher, setNewVoucher] = useState({
        value: 50,
        notes: ''
    });

    // Filter vouchers
    const filteredVouchers = theaterVouchers.filter(voucher => {
        const matchesSearch = searchTerm === '' || 
            voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (voucher.notes && voucher.notes.toLowerCase().includes(searchTerm.toLowerCase()));
            
        if (!matchesSearch) return false;
        
        if (filter === 'all') return true;
        if (filter === 'archived') return voucher.status === 'archived';
        if (filter === 'expiring_soon') return getVoucherStatus(voucher) === 'expiring_soon';
        return getVoucherStatus(voucher) === filter;
    });

    // Statistics
    const stats = {
        total: theaterVouchers.length,
        active: theaterVouchers.filter(v => getVoucherStatus(v) === 'active').length,
        used: theaterVouchers.filter(v => v.status === 'used').length,
        expired: theaterVouchers.filter(v => getVoucherStatus(v) === 'expired').length,
        expiringSoon: theaterVouchers.filter(v => getVoucherStatus(v) === 'expiring_soon').length,
        archived: theaterVouchers.filter(v => v.status === 'archived').length,
        totalValue: theaterVouchers.filter(v => ['active', 'extended'].includes(v.status)).reduce((sum, v) => sum + v.value, 0),
        usedValue: theaterVouchers.filter(v => v.status === 'used').reduce((sum, v) => sum + v.value, 0)
    };

    const handleCreateVoucher = () => {
        // Voor nu maken we een standaard waardebon - dit zou eigenlijk via de AdminVoucherView moeten gaan
        const voucher: Omit<TheaterVoucher, 'id'> = {
            code: generateVoucherCode(),
            type: 'value', // Default type
            value: newVoucher.value,
            persons: 0, // Default voor value type
            packageType: 'standard', // Default
            issueDate: formatDate(new Date()),
            expiryDate: calculateExpiryDate(formatDate(new Date())),
            status: 'active',
            extendedCount: 0,
            notes: newVoucher.notes || undefined
        };
        
        onCreateVoucher(voucher);
        setNewVoucher({ value: 50, notes: '' });
        setShowCreateModal(false);
    };

    const handleEditVoucher = (voucher: TheaterVoucher) => {
        setEditingVoucher({...voucher});
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        if (editingVoucher) {
            onUpdateVoucher(editingVoucher);
            setShowEditModal(false);
            setEditingVoucher(null);
        }
    };

    const handleDeleteVoucher = (voucher: TheaterVoucher) => {
        if (confirm(i18n.voucherDeleteConfirm)) {
            if (onDeleteVoucher) {
                onDeleteVoucher(voucher.id);
            }
        }
    };

    const handleArchiveVoucher = (voucher: TheaterVoucher) => {
        if (confirm(i18n.voucherArchiveConfirm)) {
            const archivedVoucher: TheaterVoucher = {
                ...voucher,
                status: 'archived',
                archivedDate: formatDate(new Date()),
                archivedReason: 'Gearchiveerd door admin'
            };
            onUpdateVoucher(archivedVoucher);
        }
    };

    const handleRestoreVoucher = (voucher: TheaterVoucher) => {
        if (confirm(i18n.voucherRestoreConfirm)) {
            const restoredVoucher: TheaterVoucher = {
                ...voucher,
                status: 'active',
                archivedDate: undefined,
                archivedReason: undefined
            };
            onUpdateVoucher(restoredVoucher);
        }
    };

    const handleExtend = (voucher: TheaterVoucher) => {
        onExtendVoucher(voucher.id, 12); // Default 12 months extension
    };

    const getStatusBadgeClass = (voucher: TheaterVoucher) => {
        if (voucher.status === 'archived') return 'archived';
        const status = getVoucherStatus(voucher);
        switch(status) {
            case 'active': return 'success';
            case 'used': return 'neutral';
            case 'expired': return 'danger';
            case 'expiring_soon': return 'warning';
            default: return 'neutral';
        }
    };

    const getStatusText = (voucher: TheaterVoucher) => {
        if (voucher.status === 'archived') return i18n.voucherArchived;
        const status = getVoucherStatus(voucher);
        switch(status) {
            case 'active': return i18n.voucherActive;
            case 'used': return i18n.voucherUsed;
            case 'expired': return i18n.voucherExpired;
            case 'expiring_soon': return i18n.voucherExpiringSoon;
            default: return status;
        }
    };

    return (
        <div className="voucher-management">
            <div className="content-header">
                <h2><Icon id="gift" /> {i18n.theaterVouchers}</h2>
                <p>Beheer theaterbonnen met volledig waarde gebruik systeem</p>
                <button className="btn-create-voucher" onClick={() => setShowCreateModal(true)}>
                    <Icon id="plus" /> {i18n.createVoucher}
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="dashboard-kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon"><Icon id="gift"/></div>
                    <div className="kpi-content">
                        <div className="kpi-value">{stats.active}</div>
                        <div className="kpi-label">Actieve Bonnen</div>
                        <div className="kpi-subtitle">€{stats.totalValue.toLocaleString()} waarde</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon"><Icon id="check"/></div>
                    <div className="kpi-content">
                        <div className="kpi-value">{stats.used}</div>
                        <div className="kpi-label">Gebruikte Bonnen</div>
                        <div className="kpi-subtitle">€{stats.usedValue.toLocaleString()} omzet</div>
                    </div>
                </div>
                <div className="kpi-card warning">
                    <div className="kpi-icon"><Icon id="clock"/></div>
                    <div className="kpi-content">
                        <div className="kpi-value">{stats.expiringSoon}</div>
                        <div className="kpi-label">Verloopt Binnenkort</div>
                        <div className="kpi-subtitle">Binnen 30 dagen</div>
                    </div>
                </div>
                <div className="kpi-card info">
                    <div className="kpi-icon"><Icon id="archive"/></div>
                    <div className="kpi-content">
                        <div className="kpi-value">{stats.archived}</div>
                        <div className="kpi-label">Gearchiveerd</div>
                        <div className="kpi-subtitle">Uit omloop</div>
                    </div>
                </div>
                <div className="kpi-card danger">
                    <div className="kpi-icon"><Icon id="x"/></div>
                    <div className="kpi-content">
                        <div className="kpi-value">{stats.expired}</div>
                        <div className="kpi-label">Verlopen Bonnen</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>Status:</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                        <option value="all">Alle ({stats.total})</option>
                        <option value="active">Actief ({stats.active})</option>
                        <option value="expiring_soon">Verloopt Binnenkort ({stats.expiringSoon})</option>
                        <option value="used">Gebruikt ({stats.used})</option>
                        <option value="expired">Verlopen ({stats.expired})</option>
                        <option value="archived">Gearchiveerd ({stats.archived})</option>
                    </select>
                </div>
                
                <div className="search-group">
                    <input
                        type="text"
                        placeholder="Zoek op code of notities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <Icon id="search" className="search-icon" />
                </div>
            </div>

            {/* Vouchers Table */}
            <div className="data-table">
                <div className="table-header">
                    <h3>Theaterbonnen ({filteredVouchers.length})</h3>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>{i18n.voucherCode}</th>
                            <th>{i18n.voucherValue}</th>
                            <th>{i18n.issueDate}</th>
                            <th>{i18n.expiryDate}</th>
                            <th>{i18n.voucherStatus}</th>
                            <th>{i18n.voucherNotes}</th>
                            <th>Acties</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVouchers.map(voucher => (
                            <tr key={voucher.id}>
                                <td>
                                    <code className="voucher-code">{voucher.code}</code>
                                </td>
                                <td className="value-cell">
                                    €{voucher.value.toLocaleString()}
                                </td>
                                <td>{formatDateToNL(new Date(voucher.issueDate))}</td>
                                <td className={getVoucherStatus(voucher) === 'expiring_soon' ? 'expiring' : ''}>
                                    {formatDateToNL(new Date(voucher.expiryDate))}
                                    {voucher.extendedCount > 0 && (
                                        <span className="extension-badge">
                                            +{voucher.extendedCount}x verlengd
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <span className={`status-badge ${getStatusBadgeClass(voucher)}`}>
                                        {getStatusText(voucher)}
                                    </span>
                                </td>
                                <td>
                                    {voucher.notes ? (
                                        <span className="notes-preview" title={voucher.notes}>
                                            {voucher.notes.length > 30 ? voucher.notes.substring(0, 30) + '...' : voucher.notes}
                                        </span>
                                    ) : (
                                        <span className="no-notes">-</span>
                                    )}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        {voucher.status !== 'archived' && voucher.status !== 'used' && (
                                            <button
                                                className="btn-sm btn-primary"
                                                onClick={() => handleEditVoucher(voucher)}
                                                title={i18n.voucherEdit}
                                            >
                                                <Icon id="edit" /> {i18n.voucherEdit}
                                            </button>
                                        )}
                                        
                                        {getVoucherStatus(voucher) === 'expiring_soon' && voucher.status !== 'archived' && (
                                            <button
                                                className="btn-sm btn-warning"
                                                onClick={() => handleExtend(voucher)}
                                                title={i18n.extendExpiry}
                                            >
                                                <Icon id="clock" /> {i18n.extendExpiry}
                                            </button>
                                        )}
                                        
                                        {voucher.status === 'archived' ? (
                                            <button
                                                className="btn-sm btn-success"
                                                onClick={() => handleRestoreVoucher(voucher)}
                                                title={i18n.voucherRestore}
                                            >
                                                <Icon id="restore" /> {i18n.voucherRestore}
                                            </button>
                                        ) : voucher.status !== 'used' && (
                                            <button
                                                className="btn-sm btn-secondary"
                                                onClick={() => handleArchiveVoucher(voucher)}
                                                title={i18n.voucherArchive}
                                            >
                                                <Icon id="archive" /> {i18n.voucherArchive}
                                            </button>
                                        )}
                                        
                                        {voucher.status !== 'used' && (
                                            <button
                                                className="btn-sm btn-danger"
                                                onClick={() => handleDeleteVoucher(voucher)}
                                                title={i18n.voucherDelete}
                                            >
                                                <Icon id="trash" /> {i18n.voucherDelete}
                                            </button>
                                        )}
                                        
                                        {voucher.usedDate && voucher.usedReservationId && (
                                            <span className="used-info" title={`Gebruikt op ${voucher.usedDate}`}>
                                                <Icon id="check" /> #{voucher.usedReservationId}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {filteredVouchers.length === 0 && (
                    <div className="no-data">
                        <div className="no-data-icon">🎫</div>
                        <h3>Geen bonnen gevonden</h3>
                        <p>Geen theaterbonnen gevonden voor de huidige filters.</p>
                    </div>
                )}
            </div>

            {/* Create Voucher Modal */}
            {showCreateModal && (
                <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{i18n.createVoucher}</h3>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>{i18n.voucherValue}</label>
                                <div className="value-options">
                                    {[25, 50, 75, 100, 150, 200].map(value => (
                                        <button
                                            key={value}
                                            className={`value-option ${newVoucher.value === value ? 'selected' : ''}`}
                                            onClick={() => setNewVoucher(prev => ({...prev, value}))}
                                        >
                                            €{value}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    value={newVoucher.value}
                                    onChange={(e) => setNewVoucher(prev => ({...prev, value: parseInt(e.target.value) || 0}))}
                                    min="5"
                                    max="500"
                                    step="5"
                                    className="value-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>{i18n.voucherNotes} (optioneel)</label>
                                <textarea
                                    value={newVoucher.notes}
                                    onChange={(e) => setNewVoucher(prev => ({...prev, notes: e.target.value}))}
                                    placeholder="Bijv. Nieuwjaarsactie, Kerstcadeau, etc."
                                    rows={3}
                                />
                            </div>
                            
                            <div className="voucher-preview">
                                <div className="preview-label">Voorvertoning:</div>
                                <div className="voucher-card">
                                    <div className="voucher-header">Theaterbon</div>
                                    <div className="voucher-code">{generateVoucherCode()}</div>
                                    <div className="voucher-amount">€{newVoucher.value}</div>
                                    <div className="voucher-validity">
                                        Geldig tot: {formatDateToNL(new Date(calculateExpiryDate(formatDate(new Date()))))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-outline" onClick={() => setShowCreateModal(false)}>
                                <span>{i18n.cancel}</span>
                            </button>
                            <button className="btn-primary" onClick={handleCreateVoucher}>
                                <span><Icon id="gift" /> Theaterbon Aanmaken</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Voucher Modal */}
            {showEditModal && editingVoucher && (
                <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Bewerk Theaterbon {editingVoucher.code}</h3>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Code</label>
                                <input
                                    type="text"
                                    value={editingVoucher.code}
                                    onChange={(e) => setEditingVoucher({...editingVoucher, code: e.target.value})}
                                    disabled={editingVoucher.status === 'used'}
                                />
                                {editingVoucher.status === 'used' && (
                                    <small>Code kan niet worden gewijzigd omdat de bon al gebruikt is</small>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label>{i18n.voucherValue}</label>
                                <div className="value-options">
                                    {[25, 50, 75, 100, 150, 200].map(value => (
                                        <button
                                            key={value}
                                            className={`value-option ${editingVoucher.value === value ? 'selected' : ''}`}
                                            onClick={() => setEditingVoucher({...editingVoucher, value})}
                                            disabled={editingVoucher.status === 'used'}
                                        >
                                            €{value}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    value={editingVoucher.value}
                                    onChange={(e) => setEditingVoucher({...editingVoucher, value: parseInt(e.target.value) || 0})}
                                    min="5"
                                    max="500"
                                    step="5"
                                    className="value-input"
                                    disabled={editingVoucher.status === 'used'}
                                />
                                {editingVoucher.status === 'used' && (
                                    <small>Waarde kan niet worden gewijzigd omdat de bon al gebruikt is</small>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label>Vervaldatum</label>
                                <input
                                    type="date"
                                    value={editingVoucher.expiryDate}
                                    onChange={(e) => setEditingVoucher({...editingVoucher, expiryDate: e.target.value})}
                                    disabled={editingVoucher.status === 'used'}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>{i18n.voucherNotes} (optioneel)</label>
                                <textarea
                                    value={editingVoucher.notes || ''}
                                    onChange={(e) => setEditingVoucher({...editingVoucher, notes: e.target.value})}
                                    placeholder="Bijv. Nieuwjaarsactie, Kerstcadeau, etc."
                                    rows={3}
                                />
                            </div>

                            {editingVoucher.status === 'archived' && (
                                <div className="form-group">
                                    <label>Archief Reden</label>
                                    <textarea
                                        value={editingVoucher.archivedReason || ''}
                                        onChange={(e) => setEditingVoucher({...editingVoucher, archivedReason: e.target.value})}
                                        placeholder="Reden voor archivering..."
                                        rows={2}
                                        className="readonly-field"
                                        readOnly
                                    />
                                    <small>Gearchiveerd op: {editingVoucher.archivedDate && formatDateToNL(new Date(editingVoucher.archivedDate))}</small>
                                </div>
                            )}

                            {editingVoucher.status === 'used' && (
                                <div className="used-voucher-info">
                                    <h4>🎫 Gebruikt Voucher Info</h4>
                                    <p><strong>Gebruikt op:</strong> {editingVoucher.usedDate && formatDateToNL(new Date(editingVoucher.usedDate))}</p>
                                    {editingVoucher.usedReservationId && (
                                        <p><strong>Reservering:</strong> #{editingVoucher.usedReservationId}</p>
                                    )}
                                </div>
                            )}
                            
                            <div className="voucher-preview">
                                <div className="preview-label">Voorvertoning:</div>
                                <div className={`voucher-card ${editingVoucher.status === 'used' ? 'used' : editingVoucher.status === 'archived' ? 'archived' : ''}`}>
                                    <div className="voucher-header">Theaterbon</div>
                                    <div className="voucher-code">{editingVoucher.code}</div>
                                    <div className="voucher-amount">€{editingVoucher.value}</div>
                                    <div className="voucher-validity">
                                        {editingVoucher.status === 'used' ? 'Gebruikt' : 
                                         editingVoucher.status === 'archived' ? 'Gearchiveerd' :
                                         `Geldig tot: ${formatDateToNL(new Date(editingVoucher.expiryDate))}`}
                                    </div>
                                    {editingVoucher.status === 'archived' && (
                                        <div className="voucher-archived-stamp">GEARCHIVEERD</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-outline" onClick={() => setShowEditModal(false)}>
                                <span>{i18n.cancel}</span>
                            </button>
                            <button className="btn-primary" onClick={handleSaveEdit}>
                                <span><Icon id="check" /> Wijzigingen Opslaan</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const useAnalyticsData = (reservations: Reservation[], showEvents: ShowEvent[], config: AppConfig) => {
    const analytics = useMemo(() => {
        const today = formatDate(new Date());
        
        // Today's stats - only count confirmed reservations
        const todayReservations = reservations.filter(r => r.date === today && r.status === 'confirmed');
        const todayRevenue = todayReservations.reduce((sum, r) => sum + r.totalPrice, 0);
        const todayGuests = todayReservations.reduce((sum, r) => sum + r.guests, 0);

        // Recent Bookings (booked in last 7 days for future shows) - only count confirmed reservations
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentBookings = reservations
            .filter(r => {
                // Use createdAt instead of id for filtering - only confirmed reservations
                const createdDate = new Date(r.createdAt || r.date);
                return r.status === 'confirmed' && createdDate.getTime() >= sevenDaysAgo.getTime() && new Date(r.date) >= new Date(today);
            })
            .sort((a,b) => {
                // Sort by creation date, newest first
                const aCreated = new Date(a.createdAt || a.date).getTime();
                const bCreated = new Date(b.createdAt || b.date).getTime();
                return bCreated - aCreated;
            })
            .slice(0, 5);

        // Nearly Full Shows - only count confirmed reservations
        const guestCountMap = new Map<string, number>();
        reservations.filter(r => r.status === 'confirmed').forEach(r => {
            guestCountMap.set(r.date, (guestCountMap.get(r.date) || 0) + r.guests);
        });

        const nearlyFullShows = showEvents
            .filter(e => new Date(e.date) >= new Date(today))
            .map(e => ({...e, guests: guestCountMap.get(e.date) || 0}))
            .filter(e => e.guests / e.capacity >= 0.85 && e.guests / e.capacity < 1)
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);

        // Revenue by Show Type - only count confirmed reservations
        const revenueByShowType = new Map<string, number>();
        reservations.filter(r => r.status === 'confirmed').forEach(r => {
            const show = showEvents.find(e => e.date === r.date);
            if (show) {
                revenueByShowType.set(show.type, (revenueByShowType.get(show.type) || 0) + r.totalPrice);
            }
        });
        const showTypePopularity = Array.from(revenueByShowType.entries())
            .map(([name, revenue]) => ({ name, revenue}))
            .sort((a,b) => b.revenue - a.revenue);


        // Bookings per week (last 8 weeks) - only count confirmed reservations
        const weeklyBookingsData: { week: string, count: number }[] = [];
        for (let i = 7; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - (i * 7));
            const { start, end } = getWeekRange(date);
            const weekBookings = reservations.filter(r => r.status === 'confirmed' && r.date >= start && r.date <= end).length;
            const weekLabel = `${new Date(start+'T12:00:00').getDate()}/${new Date(start+'T12:00:00').getMonth()+1}`;
            weeklyBookingsData.push({ week: weekLabel, count: weekBookings });
        }

        // Calculate conversion rate (confirmed reservations vs total inquiries)
        const totalReservations = reservations.length;
        const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
        const conversionRate = totalReservations > 0 ? (confirmedReservations / totalReservations) * 100 : 0;

        // Calculate average table size
        const averageTableSize = totalReservations > 0 
            ? reservations.reduce((sum, r) => sum + r.guests, 0) / totalReservations 
            : 0;

        // Calculate average order value
        const avgOrderValue = totalReservations > 0 
            ? reservations.reduce((sum, r) => sum + r.totalPrice, 0) / totalReservations 
            : 0;

        // Calculate peak hours (default theater time)
        const peakHour = 19; // Standard theater show time
        
        return { 
            todayRevenue, 
            todayGuests, 
            recentBookings, 
            nearlyFullShows, 
            showTypePopularity, 
            weeklyBookingsData,
            conversionRate,
            averageTableSize,
            peakHour,
            totalReservations,
            confirmedReservations,
            avgOrderValue
        };
    }, [reservations, showEvents]);

    return analytics;
};

const BarChart = ({ data, labelKey, valueKey, title }: { data: any[], labelKey: string, valueKey: string, title: string }) => {
    const maxValue = useMemo(() => Math.max(...data.map(d => d[valueKey]), 0), [data, valueKey]);

    return (
        <div className="card">
            <h3>{title}</h3>
            <div className="analytics-chart-container">
                {data.map((item, index) => (
                    <div key={index} className="chart-bar-wrapper" title={`${item[labelKey]}: ${item[valueKey]}`}>
                        <div 
                            className="chart-bar"
                            style={{ height: `${maxValue > 0 ? (item[valueKey] / maxValue) * 100 : 0}%` }}
                        ></div>
                        <span className="chart-label">{item[labelKey]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminReportsView = ({ reservations, showEvents, config }: { reservations: Reservation[], showEvents: ShowEvent[], config: AppConfig }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('last30');
    const [reportType, setReportType] = useState('overview');
    
    const periodOptions = [
        { value: 'last7', label: 'Last 7 Days' },
        { value: 'last30', label: 'Last 30 Days' },
        { value: 'last90', label: 'Last 90 Days' },
        { value: 'thisYear', label: 'This Year' },
        { value: 'all', label: 'All Time' }
    ];

    const reportTypes = [
        { value: 'overview', label: 'Overview', icon: BarChart3 },
        { value: 'revenue', label: 'Revenue', icon: DollarSign },
        { value: 'customers', label: 'Customers', icon: Users },
        { value: 'shows', label: 'Shows', icon: CalendarIcon },
        { value: 'staff', label: 'Staff', icon: UserCheck }
    ];

    const filteredReservations = useMemo(() => {
        // Only include confirmed reservations in management reports
        const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
        if (selectedPeriod === 'all') return confirmedReservations;
        const now = new Date();
        let startDate = new Date();
        
        if (selectedPeriod === 'last7') startDate.setDate(now.getDate() - 7);
        else if (selectedPeriod === 'last30') startDate.setDate(now.getDate() - 30);
        else if (selectedPeriod === 'last90') startDate.setDate(now.getDate() - 90);
        else if (selectedPeriod === 'thisYear') startDate = new Date(now.getFullYear(), 0, 1);

        return confirmedReservations.filter(r => new Date(r.date) >= startDate);
    }, [reservations, selectedPeriod]);

    const stats = useMemo(() => {
        const totalRevenue = filteredReservations.reduce((sum, r) => sum + r.totalPrice, 0);
        const totalBookings = filteredReservations.length;
        const totalGuests = filteredReservations.reduce((sum, r) => sum + r.guests, 0);
        const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
        const totalDiscounts = filteredReservations.reduce((sum, r) => sum + (r.discountAmount || 0), 0);
        
        // Revenue by show type
        const revenueByShowType = new Map<string, number>();
        filteredReservations.forEach(r => {
            const show = showEvents.find(e => e.date === r.date);
            if(show) {
                revenueByShowType.set(show.type, (revenueByShowType.get(show.type) || 0) + r.totalPrice);
            }
        });

        // Bookings over time for chart
        const bookingsOverTime = new Map<string, number>();
        const revenueOverTime = new Map<string, number>();
        filteredReservations.forEach(r => {
            const dateKey = r.date;
            bookingsOverTime.set(dateKey, (bookingsOverTime.get(dateKey) || 0) + 1);
            revenueOverTime.set(dateKey, (revenueOverTime.get(dateKey) || 0) + r.totalPrice);
        });

        const timeSeriesData = Array.from(bookingsOverTime.entries())
            .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
            .map(([date, bookings]) => ({ 
                date, 
                bookings, 
                revenue: revenueOverTime.get(date) || 0 
            }));

        // Show performance analysis
        const showPerformance = Array.from(revenueByShowType.entries())
            .map(([showType, revenue]) => {
                const showBookings = filteredReservations.filter(r => {
                    const show = showEvents.find(e => e.date === r.date);
                    return show?.type === showType;
                }).length;
                
                return {
                    name: showType,
                    revenue,
                    bookings: showBookings,
                    avgValue: showBookings > 0 ? revenue / showBookings : 0
                };
            })
            .sort((a, b) => b.revenue - a.revenue);

        return {
            totalRevenue, 
            totalBookings,
            totalGuests, 
            avgBookingValue, 
            totalDiscounts,
            revenueByShowType: Array.from(revenueByShowType.entries()).map(([name, value]) => ({name, value})),
            timeSeriesData,
            showPerformance
        };
    }, [filteredReservations, showEvents]);

    // Calculate percentage changes (mock data for demo)
    const getPercentageChange = () => Math.floor(Math.random() * 20) - 10; // Random between -10 and +10

    return (
        <div className="enhanced-reports-view">
            {/* Reports Header */}
            <div className="reports-header">
                <div className="reports-title-section">
                    <h2 className="reports-title">
                        <BarChart3 className="title-icon" />
                        Reports & Analytics
                    </h2>
                    <p className="reports-subtitle">
                        Comprehensive insights into your diner theater performance
                    </p>
                </div>

                <div className="reports-controls">
                    <div className="report-type-selector">
                        {reportTypes.map(type => {
                            const IconComponent = type.icon;
                            return (
                                <button
                                    key={type.value}
                                    className={`report-type-btn ${reportType === type.value ? 'active' : ''}`}
                                    onClick={() => setReportType(type.value)}
                                >
                                    <IconComponent size={16} />
                                    {type.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="period-controls">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="period-select"
                        >
                            {periodOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        
                        <button className="export-report-btn">
                            <Download size={16} />
                            Export Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Metrics Overview */}
            <div className="reports-metrics-grid">
                <div className="metric-card revenue-metric">
                    <div className="metric-header">
                        <TrendingUp className="metric-icon" />
                        <span className="metric-label">Total Revenue</span>
                    </div>
                    <div className="metric-value">€{stats.totalRevenue.toLocaleString()}</div>
                    <div className={`metric-change ${Math.random() > 0.5 ? 'positive' : 'negative'}`}>
                        {Math.random() > 0.5 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {Math.abs(getPercentageChange())}% vs last period
                    </div>
                </div>

                <div className="metric-card bookings-metric">
                    <div className="metric-header">
                        <CalendarIcon className="metric-icon" />
                        <span className="metric-label">Total Bookings</span>
                    </div>
                    <div className="metric-value">{stats.totalBookings}</div>
                    <div className={`metric-change ${Math.random() > 0.5 ? 'positive' : 'negative'}`}>
                        {Math.random() > 0.5 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {Math.abs(getPercentageChange())}% vs last period
                    </div>
                </div>

                <div className="metric-card capacity-metric">
                    <div className="metric-header">
                        <Users className="metric-icon" />
                        <span className="metric-label">Total Guests</span>
                    </div>
                    <div className="metric-value">{stats.totalGuests}</div>
                    <div className={`metric-change ${Math.random() > 0.5 ? 'positive' : 'negative'}`}>
                        {Math.random() > 0.5 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {Math.abs(getPercentageChange())}% vs last period
                    </div>
                </div>

                <div className="metric-card rating-metric">
                    <div className="metric-header">
                        <Star className="metric-icon" />
                        <span className="metric-label">Avg Booking Value</span>
                    </div>
                    <div className="metric-value">€{stats.avgBookingValue.toFixed(0)}</div>
                    <div className={`metric-change ${Math.random() > 0.5 ? 'positive' : 'negative'}`}>
                        {Math.random() > 0.5 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {Math.abs(getPercentageChange())}% vs last period
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="reports-charts-section">
                {/* Revenue Trend Chart */}
                <div className="chart-container">
                    <div className="chart-header">
                        <h3 className="chart-title">Revenue & Bookings Trend</h3>
                        <div className="chart-legend">
                            <span className="legend-item">
                                <span className="legend-color revenue"></span>
                                Revenue
                            </span>
                            <span className="legend-item">
                                <span className="legend-color bookings"></span>
                                Bookings
                            </span>
                        </div>
                    </div>
                    <div className="chart-content">
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={stats.timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#666" />
                                <YAxis yAxisId="left" stroke="#666" />
                                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                                <Tooltip 
                                    contentStyle={{
                                        background: 'white',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Line 
                                    yAxisId="left"
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="var(--primary-color)" 
                                    strokeWidth={3}
                                    dot={{ fill: 'var(--primary-color)', strokeWidth: 2, r: 6 }}
                                />
                                <Line 
                                    yAxisId="right"
                                    type="monotone" 
                                    dataKey="bookings" 
                                    stroke="var(--accent-color-gold)" 
                                    strokeWidth={3}
                                    dot={{ fill: 'var(--accent-color-gold)', strokeWidth: 2, r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Show Performance & Revenue Distribution */}
                <div className="charts-row">
                    <div className="chart-container half-width">
                        <div className="chart-header">
                            <h3 className="chart-title">Show Performance</h3>
                        </div>
                        <div className="show-performance-list">
                            {stats.showPerformance.slice(0, 6).map((show, index) => (
                                <div key={index} className="show-performance-item">
                                    <div className="show-info">
                                        <span className="show-name">{show.name}</span>
                                        <div className="show-metrics">
                                            <span className="show-revenue">€{show.revenue.toLocaleString()}</span>
                                            <span className="show-bookings">{show.bookings} bookings</span>
                                            <span className="show-avg">€{show.avgValue.toFixed(0)} avg</span>
                                        </div>
                                    </div>
                                    <div className="performance-bar">
                                        <div 
                                            className="performance-fill"
                                            style={{ width: `${Math.min(100, (show.revenue / Math.max(...stats.showPerformance.map(s => s.revenue))) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="chart-container half-width">
                        <div className="chart-header">
                            <h3 className="chart-title">Revenue by Show Type</h3>
                        </div>
                        <div className="chart-content">
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={stats.revenueByShowType}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        dataKey="value"
                                        stroke="#fff"
                                        strokeWidth={2}
                                    >
                                        {stats.revenueByShowType.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => [`€${value}`, 'Revenue']}
                                        contentStyle={{
                                            background: 'white',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="segment-legend">
                                {stats.revenueByShowType.map((segment, index) => (
                                    <div key={index} className="segment-item">
                                        <span 
                                            className="segment-color"
                                            style={{ backgroundColor: `hsl(${index * 45}, 70%, 60%)` }}
                                        ></span>
                                        <span className="segment-name">{segment.name}</span>
                                        <span className="segment-value">€{segment.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Insights */}
            <div className="reports-insights">
                <div className="insights-header">
                    <h3 className="insights-title">
                        <Lightbulb className="insights-icon" />
                        Key Insights & Recommendations
                    </h3>
                </div>
                
                <div className="insights-grid">
                    <div className="insight-card positive">
                        <div className="insight-icon">
                            <TrendingUp size={24} />
                        </div>
                        <div className="insight-content">
                            <h4>Revenue Performance</h4>
                            <p>Total revenue of €{stats.totalRevenue.toLocaleString()} from {stats.totalBookings} bookings. Average booking value is €{stats.avgBookingValue.toFixed(0)}.</p>
                        </div>
                    </div>

                    <div className="insight-card info">
                        <div className="insight-icon">
                            <Users size={24} />
                        </div>
                        <div className="insight-content">
                            <h4>Guest Analytics</h4>
                            <p>Served {stats.totalGuests} guests this period. Popular shows drive higher capacity utilization.</p>
                        </div>
                    </div>

                    {stats.totalDiscounts > 0 && (
                        <div className="insight-card warning">
                            <div className="insight-icon">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="insight-content">
                                <h4>Discount Impact</h4>
                                <p>€{stats.totalDiscounts.toFixed(0)} in discounts applied. Monitor discount strategies for optimal revenue.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const AdminCapacityView = ({ showEvents, guestCountMap, onUpdateShowCapacity, onToggleShowStatus, onAddExternalBooking, config }: {
    showEvents: ShowEvent[],
    guestCountMap: Map<string, number>,
    onUpdateShowCapacity: (showId: string, newCapacity: number) => void,
    onToggleShowStatus?: (showId: string) => void,
    onAddExternalBooking?: (showId: string, guests: number) => void,
    config: AppConfig
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedShow, setSelectedShow] = useState<string | null>(null);
    const [externalBookingGuests, setExternalBookingGuests] = useState<number>(1);
    const [bulkCapacityMode, setBulkCapacityMode] = useState(false);
    const [bulkCapacityValue, setBulkCapacityValue] = useState<number>(240);
    const [activeTab, setActiveTab] = useState<'overview' | 'bulk-input'>('overview');
    const [bulkGuestCounts, setBulkGuestCounts] = useState<Map<string, number>>(new Map());
    const [focusedInputIndex, setFocusedInputIndex] = useState<number>(0);
    const { addToast } = useToast();
    const { confirm } = useConfirmation();
    
    // Get shows for current period
    const periodShows = useMemo(() => {
        const shows = showEvents.filter(show => {
            const showDate = new Date(show.date);
            const today = new Date();
            
            if (selectedPeriod === 'week') {
                const weekStart = new Date(currentDate);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                return showDate >= weekStart && showDate <= weekEnd;
            } else {
                return showDate.getMonth() === currentDate.getMonth() && 
                       showDate.getFullYear() === currentDate.getFullYear();
            }
        });
        
        if (searchTerm) {
            return shows.filter(show => 
                show.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                show.type.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return shows.sort((a, b) => a.date.localeCompare(b.date));
    }, [showEvents, currentDate, selectedPeriod, searchTerm]);

    // Calculate capacity metrics
    const getCapacityMetrics = (show: ShowEvent) => {
        const effectiveCapacity = show.manualCapacityOverride || show.capacity;
        const totalBooked = guestCountMap.get(show.date) || 0;
        const externalBooked = show.externalBookings || 0;
        const internalBooked = Math.max(0, totalBooked - externalBooked);
        const available = Math.max(0, effectiveCapacity - totalBooked);
        const utilizationPercent = effectiveCapacity > 0 ? (totalBooked / effectiveCapacity) * 100 : 0;
        
        return {
            effectiveCapacity,
            totalBooked,
            externalBooked,
            internalBooked,
            available,
            utilizationPercent,
            status: getCapacityStatus(utilizationPercent, show.isClosed)
        };
    };

    const getCapacityStatus = (utilization: number, isClosed?: boolean) => {
        if (isClosed) return 'closed';
        if (utilization >= 100) return 'full';
        if (utilization >= 90) return 'critical';
        if (utilization >= 80) return 'high';
        if (utilization >= 50) return 'medium';
        return 'low';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'low': return 'var(--admin-success)';
            case 'medium': return 'var(--admin-info)';
            case 'high': return 'var(--admin-warning)';
            case 'critical': return 'var(--admin-danger)';
            case 'full': return 'var(--admin-danger)';
            case 'closed': return 'var(--admin-secondary)';
            default: return 'var(--admin-text-secondary)';
        }
    };

    const handleCapacityUpdate = (showId: string, newCapacity: number) => {
        const show = showEvents.find(s => s.id === showId);
        if (!show) return;
        
        const currentBooked = guestCountMap.get(show.date) || 0;
        
        if (newCapacity < currentBooked) {
            confirm({
                title: i18n.overrideProtectionWarning,
                message: `Huidige bezetting (${currentBooked}) is hoger dan nieuwe capaciteit (${newCapacity}). Dit kan leiden tot problemen.`,
                onConfirm: () => {
                    onUpdateShowCapacity(showId, newCapacity);
                    addToast(`Capaciteit bijgewerkt naar ${newCapacity}`, 'success');
                },
                confirmText: i18n.proceedAnyway,
                confirmButtonClass: 'submit-btn'
            });
        } else {
            onUpdateShowCapacity(showId, newCapacity);
            addToast(`Capaciteit bijgewerkt naar ${newCapacity}`, 'success');
        }
    };

    const handleAddExternalBooking = (showId: string) => {
        if (onAddExternalBooking && externalBookingGuests > 0) {
            onAddExternalBooking(showId, externalBookingGuests);
            addToast(`${externalBookingGuests} externe gasten toegevoegd`, 'success');
            setExternalBookingGuests(1);
            setSelectedShow(null);
        }
    };

    const handleBulkCapacityUpdate = () => {
        const selectedShows = periodShows.filter(show => {
            // Apply to shows that don't have manual overrides or are currently selected
            return !show.manualCapacityOverride || selectedShow === show.id;
        });
        
        confirm({
            title: i18n.bulkCapacityManagement,
            message: `Capaciteit instellen op ${bulkCapacityValue} voor ${selectedShows.length} shows?`,
            onConfirm: () => {
                selectedShows.forEach(show => {
                    onUpdateShowCapacity(show.id, bulkCapacityValue);
                });
                addToast(`Bulk capaciteit bijgewerkt voor ${selectedShows.length} shows`, 'success');
                setBulkCapacityMode(false);
            },
            confirmText: 'Toepassen',
            confirmButtonClass: 'submit-btn'
        });
    };

    const navigatePeriod = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (selectedPeriod === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const formatPeriodTitle = () => {
        if (selectedPeriod === 'week') {
            const weekStart = new Date(currentDate);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return `${weekStart.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        } else {
            return currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
        }
    };

    // Initialize bulk guest counts with current values
    React.useEffect(() => {
        const newBulkCounts = new Map();
        showEvents.forEach(show => {
            const currentCount = guestCountMap.get(show.date) || 0;
            newBulkCounts.set(show.id, currentCount);
        });
        setBulkGuestCounts(newBulkCounts);
    }, [showEvents, guestCountMap]);

    // Get all shows chronologically for bulk input - ALLEEN TOEKOMSTIGE SHOWS
    const allShowsChronological = useMemo(() => {
        const now = new Date();
        
        return [...showEvents]
            .filter(show => {
                // Filter alleen toekomstige shows voor bulk invoer
                const showDateTime = new Date(show.date + 'T19:30:00');
                const showTimes = getShowTimes(new Date(show.date + 'T12:00:00'), show.type, config);
                
                // Gebruik echte showtijd als beschikbaar
                if (showTimes.start) {
                    const [hours, minutes] = showTimes.start.split(':');
                    showDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                }
                
                // Toon alleen shows die nog niet begonnen zijn
                return now < showDateTime;
            })
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [showEvents]);

    const handleBulkGuestCountChange = (showId: string, newCount: number) => {
        const newBulkCounts = new Map(bulkGuestCounts);
        newBulkCounts.set(showId, newCount);
        setBulkGuestCounts(newBulkCounts);
    };

    const saveBulkGuestCount = (showId: string, showDate: string) => {
        const newCount = bulkGuestCounts.get(showId) || 0;
        const currentCount = guestCountMap.get(showDate) || 0;
        
        if (newCount !== currentCount) {
            // Update the guest count via the external booking system
            const difference = newCount - currentCount;
            if (difference !== 0 && onAddExternalBooking) {
                onAddExternalBooking(showId, difference);
                addToast(`Gastenaantal bijgewerkt: ${currentCount} → ${newCount}`, 'success');
            }
            
            // VERBETERDE status update logica - check ook 12-uur cutoff
            if (onToggleShowStatus) {
                const show = showEvents.find(s => s.id === showId);
                if (show) {
                    const now = new Date();
                    const showDateTime = new Date(show.date + 'T19:30:00');
                    const showTimes = getShowTimes(new Date(show.date + 'T12:00:00'), show.type, config);
                    
                    // Gebruik echte showtijd als beschikbaar
                    if (showTimes.start) {
                        const [hours, minutes] = showTimes.start.split(':');
                        showDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    }
                    
                    // Check of booking cutoff (12 uur) bereikt is
                    const cutoffTime = new Date(showDateTime.getTime() - (12 * 60 * 60 * 1000));
                    const isBookingCutoffReached = now > cutoffTime;
                    
                    const shouldBeOpen = newCount < 240 && !isBookingCutoffReached;
                    const shouldBeClosed = newCount >= 240 || isBookingCutoffReached;
                    
                    if (shouldBeClosed && !show.isClosed) {
                        // Show moet gesloten worden
                        onToggleShowStatus(showId);
                        if (newCount >= 240) {
                            addToast(`🔒 Show automatisch gesloten bij ${newCount} gasten`, 'warning');
                        } else if (isBookingCutoffReached) {
                            addToast(`🔒 Show automatisch gesloten (12-uur cutoff bereikt)`, 'warning');
                        }
                    } else if (shouldBeOpen && show.isClosed && newCount < 240) {
                        // Show kan heropend worden als gasten onder 240 EN geen cutoff
                        if (!isBookingCutoffReached) {
                            onToggleShowStatus(showId);
                            addToast(`🟢 Show automatisch heropend bij ${newCount} gasten`, 'success');
                        } else {
                            addToast(`⚠️ Show blijft gesloten (12-uur cutoff actief ondanks ${newCount} gasten)`, 'info');
                        }
                    }
                }
            }
        }
    };

    const handleBulkInputKeyDown = (e: React.KeyboardEvent, showIndex: number, showId: string, showDate: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveBulkGuestCount(showId, showDate);
            
            // Move to next input
            if (showIndex < allShowsChronological.length - 1) {
                setFocusedInputIndex(showIndex + 1);
                setTimeout(() => {
                    const nextInput = document.querySelector(`input[data-show-index="${showIndex + 1}"]`) as HTMLInputElement;
                    if (nextInput) {
                        nextInput.focus();
                        nextInput.select();
                    }
                }, 50);
            }
        }
        if (e.key === 'Tab') {
            saveBulkGuestCount(showId, showDate);
        }
    };

    const getShowStatusForBulk = (show: ShowEvent, guestCount: number) => {
        const capacity = show.manualCapacityOverride || show.capacity;
        const now = new Date();
        const showDateTime = new Date(show.date + 'T19:30:00');
        const showTimes = getShowTimes(new Date(show.date + 'T12:00:00'), show.type, config);
        
        // Gebruik echte showtijd als beschikbaar
        if (showTimes.start) {
            const [hours, minutes] = showTimes.start.split(':');
            showDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        
        // Check timing constraints
        const cutoffTime = new Date(showDateTime.getTime() - (12 * 60 * 60 * 1000));
        const isBookingCutoffReached = now > cutoffTime;
        const warningTime = new Date(showDateTime.getTime() - (18 * 60 * 60 * 1000)); // 18 uur warning
        const isNearCutoff = now > warningTime && !isBookingCutoffReached;
        
        // Timing-based status heeft voorrang
        if (isBookingCutoffReached) {
            return { status: 'cutoff', color: '#6b7280', text: 'CUTOFF' };
        } else if (isNearCutoff) {
            const hoursLeft = Math.floor((cutoffTime.getTime() - now.getTime()) / (1000 * 60 * 60));
            return { status: 'warning', color: '#f59e0b', text: `${hoursLeft}U RESTEREND` };
        }
        
        // Normale guest-based logica
        if (show.isClosed) return { status: 'closed', color: '#6b7280', text: 'GESLOTEN' };
        if (guestCount >= 250) return { status: 'full', color: '#dc2626', text: 'OVERVOL' };
        if (guestCount >= 240) return { status: 'critical', color: '#ff4500', text: 'SLUITING' };
        if (guestCount >= 220) return { status: 'critical', color: '#ea580c', text: 'BIJNA VOL' };
        if (guestCount >= 180) return { status: 'high', color: '#d97706', text: 'DRUK' };
        if (guestCount >= 120) return { status: 'medium', color: '#65a30d', text: 'NORMAAL' };
        return { status: 'low', color: '#16a34a', text: 'RUIM' };
    };

    const resetAllBulkCounts = () => {
        confirm({
            title: 'Reset Alle Aantallen',
            message: 'Alle gastenaantallen resetten naar 0? Dit kan niet ongedaan gemaakt worden.',
            onConfirm: () => {
                const newBulkCounts = new Map();
                allShowsChronological.forEach(show => {
                    newBulkCounts.set(show.id, 0);
                });
                setBulkGuestCounts(newBulkCounts);
                addToast('Alle aantallen gereset', 'success');
            },
            confirmText: 'Reset Alles',
            confirmButtonClass: 'submit-btn'
        });
    };

    const autoCalculateFromReservations = () => {
        confirm({
            title: 'Auto-bereken Aantallen',
            message: 'Gastenaantallen automatisch berekenen uit bestaande reserveringen?',
            onConfirm: () => {
                const newBulkCounts = new Map();
                allShowsChronological.forEach(show => {
                    const currentCount = guestCountMap.get(show.date) || 0;
                    newBulkCounts.set(show.id, currentCount);
                });
                setBulkGuestCounts(newBulkCounts);
                addToast('Aantallen automatisch berekend', 'success');
            },
            confirmText: 'Auto-bereken',
            confirmButtonClass: 'submit-btn'
        });
    };

    return (
        <div className="capacity-management-view">
            <div className="content-header">
                <h2>{i18n.capacityManagementTitle}</h2>
                <p>{i18n.capacityManagementDescription}</p>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                >
                    📊 Overzicht & Beheer
                </button>
                <button 
                    onClick={() => setActiveTab('bulk-input')}
                    className={`tab-btn ${activeTab === 'bulk-input' ? 'active' : ''}`}
                >
                    ⚡ Bulk Invoer Gasten
                </button>
            </div>

            {activeTab === 'overview' ? (
                <>
                    {/* Controls */}
                    <div className="capacity-controls">
                <div className="period-navigation">
                    <button onClick={() => navigatePeriod('prev')} className="btn-secondary">
                        <Icon id="chevron-left" />
                    </button>
                    <div className="period-selector">
                        <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month')}>
                            <option value="week">{i18n.thisWeek}</option>
                            <option value="month">{i18n.thisMonth}</option>
                        </select>
                        <h3>{formatPeriodTitle()}</h3>
                    </div>
                    <button onClick={() => navigatePeriod('next')} className="btn-secondary">
                        <Icon id="chevron-right" />
                    </button>
                </div>
                
                <div className="capacity-tools">
                    <input
                        type="text"
                        placeholder="Zoek shows..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button 
                        onClick={() => setBulkCapacityMode(!bulkCapacityMode)}
                        className={`btn-secondary ${bulkCapacityMode ? 'active' : ''}`}
                    >
                        <Icon id="settings" /> {i18n.bulkCapacityManagement}
                    </button>
                </div>
            </div>

            {/* Bulk Capacity Controls */}
            {bulkCapacityMode && (
                <div className="bulk-capacity-panel">
                    <h4>{i18n.bulkCapacityManagement}</h4>
                    <div className="bulk-controls">
                        <input
                            type="number"
                            value={bulkCapacityValue}
                            onChange={(e) => setBulkCapacityValue(Number(e.target.value))}
                            min="1"
                            max="250"
                            className="capacity-input"
                        />
                        <button onClick={handleBulkCapacityUpdate} className="submit-btn">
                            Toepassen op {periodShows.length} shows
                        </button>
                        <button onClick={() => setBulkCapacityMode(false)} className="btn-secondary">
                            {i18n.cancel}
                        </button>
                    </div>
                </div>
            )}

            {/* Shows Grid */}
            <div className="capacity-grid">
                {periodShows.length === 0 ? (
                    <div className="no-shows-message">
                        <Icon id="calendar" className="placeholder-icon" />
                        <p>{selectedPeriod === 'week' ? i18n.noShowsThisWeek : i18n.noShowsThisMonth}</p>
                    </div>
                ) : (
                    periodShows.map(show => {
                        const metrics = getCapacityMetrics(show);
                        const showDate = new Date(show.date);
                        
                        return (
                            <div key={show.id} className={`capacity-card ${metrics.status}`}>
                                <div className="capacity-card-header">
                                    <div className="show-info">
                                        <h4>{show.name}</h4>
                                        <p className="show-meta">
                                            {showDate.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            <span className="show-type">{show.type}</span>
                                        </p>
                                    </div>
                                    <div className="capacity-status">
                                        <span 
                                            className={`status-indicator ${metrics.status}`}
                                            style={{ backgroundColor: getStatusColor(metrics.status) }}
                                        />
                                        {show.isClosed && <Icon id="lock" className="closed-icon" />}
                                    </div>
                                </div>

                                {/* Capacity Bar */}
                                <div className="capacity-visualization">
                                    <div className="capacity-bar">
                                        <div 
                                            className="capacity-fill"
                                            style={{ 
                                                width: `${Math.min(100, metrics.utilizationPercent)}%`,
                                                backgroundColor: getStatusColor(metrics.status)
                                            }}
                                        />
                                    </div>
                                    <div className="capacity-numbers">
                                        <span className="booked-count">{i18n.booked}: {metrics.totalBooked}</span>
                                        <span className="capacity-total">/ {metrics.effectiveCapacity}</span>
                                    </div>
                                </div>

                                {/* Detailed Breakdown */}
                                <div className="booking-breakdown">
                                    <div className="breakdown-item">
                                        <span className="breakdown-label">{i18n.internal}:</span>
                                        <span className="breakdown-value">{metrics.internalBooked}</span>
                                    </div>
                                    {metrics.externalBooked > 0 && (
                                        <div className="breakdown-item">
                                            <span className="breakdown-label">{i18n.external}:</span>
                                            <span className="breakdown-value">{metrics.externalBooked}</span>
                                        </div>
                                    )}
                                    <div className="breakdown-item">
                                        <span className="breakdown-label">{i18n.remaining}:</span>
                                        <span className="breakdown-value available">{metrics.available}</span>
                                    </div>
                                </div>

                                {/* Capacity Controls */}
                                <div className="capacity-controls-card">
                                    <div className="capacity-input-group">
                                        <label>{i18n.manualCapacityOverride}:</label>
                                        <input
                                            type="number"
                                            value={metrics.effectiveCapacity}
                                            onChange={(e) => handleCapacityUpdate(show.id, Number(e.target.value))}
                                            min="1"
                                            max="250"
                                            className="capacity-input"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.currentTarget.blur();
                                                }
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="show-controls">
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={!show.isClosed} 
                                                onChange={() => onToggleShowStatus?.(show.id)} 
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                        <span className="switch-label">
                                            {show.isClosed ? i18n.showClosedForBookings : i18n.showOpenForBookings}
                                        </span>
                                    </div>
                                </div>

                                {/* External Booking Section */}
                                <div className="external-booking-section">
                                    {selectedShow === show.id ? (
                                        <div className="external-booking-form">
                                            <input
                                                type="number"
                                                value={externalBookingGuests}
                                                onChange={(e) => setExternalBookingGuests(Number(e.target.value))}
                                                min="1"
                                                max={metrics.available}
                                                placeholder="Aantal gasten"
                                                className="guest-input"
                                            />
                                            <button
                                                onClick={() => handleAddExternalBooking(show.id)}
                                                className="btn-secondary small"
                                                disabled={externalBookingGuests > metrics.available}
                                            >
                                                <Icon id="add" /> Toevoegen
                                            </button>
                                            <button
                                                onClick={() => setSelectedShow(null)}
                                                className="btn-secondary small"
                                            >
                                                <Icon id="close" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedShow(show.id)}
                                            className="btn-text small"
                                            disabled={metrics.available === 0}
                                        >
                                            <Icon id="plus" /> {i18n.addExternalBooking}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
                </>
            ) : (
                /* Bulk Input Tab */
                <div className="bulk-input-tab">
                    <div className="bulk-input-header">
                        <h3>⚡ Bulk Invoer Gereserveerde Gasten</h3>
                        <p>Vul snel alle gastenaantallen in per show datum. Gebruik Enter om naar de volgende te gaan.</p>
                        <div className="bulk-input-tools">
                            <button onClick={autoCalculateFromReservations} className="btn-secondary">
                                🔄 Auto-bereken uit Reserveringen
                            </button>
                            <button onClick={resetAllBulkCounts} className="btn-secondary danger">
                                🗑️ Reset Alle Aantallen
                            </button>
                        </div>
                    </div>

                    <div className="bulk-input-table">
                        <div className="bulk-input-header-row">
                            <div className="bulk-col-date">Datum</div>
                            <div className="bulk-col-show">Show</div>
                            <div className="bulk-col-type">Type</div>
                            <div className="bulk-col-capacity">Capaciteit</div>
                            <div className="bulk-col-guests">Gasten</div>
                            <div className="bulk-col-status">Status</div>
                        </div>

                        {allShowsChronological.map((show, index) => {
                            const guestCount = bulkGuestCounts.get(show.id) || 0;
                            const capacity = show.manualCapacityOverride || show.capacity;
                            const statusInfo = getShowStatusForBulk(show, guestCount);
                            const showDate = new Date(show.date);

                            return (
                                <div key={show.id} className={`bulk-input-row ${statusInfo.status}`}>
                                    <div className="bulk-col-date">
                                        {showDate.toLocaleDateString('nl-NL', { 
                                            weekday: 'short', 
                                            day: 'numeric', 
                                            month: 'short' 
                                        })}
                                    </div>
                                    <div className="bulk-col-show">
                                        <strong>{show.name}</strong>
                                    </div>
                                    <div className="bulk-col-type">
                                        {show.type}
                                    </div>
                                    <div className="bulk-col-capacity">
                                        {capacity}
                                    </div>
                                    <div className="bulk-col-guests">
                                        <input
                                            type="number"
                                            min="0"
                                            max={300}
                                            value={guestCount}
                                            disabled={statusInfo.status === 'cutoff'}
                                            onChange={(e) => handleBulkGuestCountChange(show.id, parseInt(e.target.value) || 0)}
                                            onKeyDown={(e) => handleBulkInputKeyDown(e, index, show.id, show.date)}
                                            onBlur={() => saveBulkGuestCount(show.id, show.date)}
                                            onClick={(e) => {
                                                if (!e.currentTarget.disabled) {
                                                    e.currentTarget.select();
                                                    setFocusedInputIndex(index);
                                                }
                                            }}
                                            onFocus={(e) => {
                                                if (!e.currentTarget.disabled) {
                                                    e.currentTarget.select();
                                                    setFocusedInputIndex(index);
                                                }
                                            }}
                                            data-show-index={index}
                                            className={`bulk-guest-input ${focusedInputIndex === index ? 'focused' : ''} ${statusInfo.status === 'cutoff' ? 'disabled' : ''}`}
                                            placeholder="0"
                                            title={statusInfo.status === 'cutoff' ? 'Boekingen gesloten (12-uur regel)' : ''}
                                        />
                                    </div>
                                    <div className="bulk-col-status">
                                        <span 
                                            className="bulk-status-indicator"
                                            style={{ backgroundColor: statusInfo.color }}
                                        >
                                            {statusInfo.text}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bulk-input-footer">
                        <div className="bulk-progress">
                            📊 {allShowsChronological.filter(show => (bulkGuestCounts.get(show.id) || 0) > 0).length} van {allShowsChronological.length} shows bijgewerkt
                        </div>
                        <div className="bulk-legend">
                            <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#16a34a'}}></span> Ruim (0-119)</span>
                            <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#65a30d'}}></span> Normaal (120-179)</span>
                            <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#d97706'}}></span> Druk (180-219)</span>
                            <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#ea580c'}}></span> Bijna Vol (220-239)</span>
                            <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#ff4500'}}></span> Sluiting (240-249)</span>
                            <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#dc2626'}}></span> Overvol (250+)</span>
                            <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#f59e0b'}}></span> ⚠️ Bijna Cutoff</span>
                            <span className="legend-item"><span className="legend-color" style={{backgroundColor: '#6b7280'}}></span> ⏰ Cutoff/Gesloten</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

type ObjectArrayConfigKey = 'showNames' | 'showTypes' | 'promoCodes' | 'merchandise';

const SettingsView = ({ config, setConfig, events, setEvents }: { 
    config: AppConfig, 
    setConfig: React.Dispatch<React.SetStateAction<AppConfig>>,
    events?: ShowEvent[],
    setEvents?: React.Dispatch<React.SetStateAction<ShowEvent[]>>
}) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('shows');
    const [localConfig, setLocalConfig] = useState<AppConfig>(JSON.parse(JSON.stringify(config)));
    const [showPreview, setShowPreview] = useState(false);
    const { addToast } = useToast();
    const { confirm } = useConfirmation();

    const handleSave = () => {
        // Update existing shows with new showType default times if they don't have custom times
        if (events && setEvents) {
            const updatedEvents = events.map(event => {
                const oldShowType = config.showTypes.find(type => type.name === event.type);
                const newShowType = localConfig.showTypes.find(type => type.name === event.type);
                
                if (oldShowType && newShowType) {
                    // Update times only if the show doesn't have custom times set
                    const needsTimeUpdate = (
                        (!event.startTime || event.startTime === oldShowType.defaultStartTime) ||
                        (!event.endTime || event.endTime === oldShowType.defaultEndTime)
                    );
                    
                    if (needsTimeUpdate) {
                        return {
                            ...event,
                            startTime: event.startTime || newShowType.defaultStartTime,
                            endTime: event.endTime || newShowType.defaultEndTime
                        };
                    }
                }
                return event;
            });
            setEvents(updatedEvents);
        }
        
        setConfig(localConfig);
        addToast(i18n.settingsSaved, 'success');
    };

    const handleItemChange = <K extends ObjectArrayConfigKey>(section: K, index: number, field: keyof AppConfig[K][number], value: any) => {
        setLocalConfig(prev => {
            const newSection = [...prev[section]] as any[];
            newSection[index] = { ...newSection[index], [field]: value };
            
            // Automatisch eindtijd berekenen bij wijzigen van starttijd voor showTypes
            if (section === 'showTypes' && field === 'defaultStartTime' && typeof value === 'string') {
                const calculatedEndTime = calculateEndTime(value);
                newSection[index] = { ...newSection[index], defaultEndTime: calculatedEndTime };
            }
            
            return { ...prev, [section]: newSection };
        });
    };

    const handleAddItem = <K extends keyof AppConfig>(section: K, newItem: any) => {
        setLocalConfig(prev => ({
            ...prev,
            [section]: [...prev[section] as any[], newItem]
        }));
    };
    
    const handleDeleteItem = <K extends keyof AppConfig>(section: K, id: string) => {
        confirm({
            title: i18n.deleteItemConfirmTitle,
            message: i18n.deleteItemConfirmMessage,
            onConfirm: () => {
                setLocalConfig(prev => ({
                    ...prev,
                    [section]: (prev[section] as any[]).filter(item => item.id !== id)
                }));
                addToast(i18n.itemDeleted, 'success');
            },
            confirmButtonClass: 'delete-btn'
        });
    };

    const handleToggleArchive = (section: 'showNames' | 'showTypes', id: string) => {
        const item = localConfig[section].find(item => item.id === id);
        if (!item) return;

        confirm({
            title: i18n.archiveConfirmTitle,
            message: i18n.archiveConfirmMessage,
            onConfirm: () => {
                setLocalConfig(prev => ({
                    ...prev,
                    [section]: prev[section].map(i => i.id === id ? { ...i, archived: !i.archived } : i)
                }));
            }
        });
    };

    // State voor promo modal (buiten switch case vanwege Rules of Hooks)
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

    const handleEditPromo = (promo: PromoCode) => {
        setEditingPromo(promo);
        setIsPromoModalOpen(true);
    };

    const handleSavePromo = (promoData: Partial<PromoCode>) => {
        if (editingPromo) {
            // Bewerken van bestaande promo
            const updatedPromoCodes = localConfig.promoCodes.map(p => 
                p.id === editingPromo.id ? { ...p, ...promoData } : p
            );
            setLocalConfig({ ...localConfig, promoCodes: updatedPromoCodes });
        } else {
            // Toevoegen van nieuwe promo
            const newPromo: PromoCode = {
                id: `promo_${Date.now()}`,
                usageCount: 0,
                ...promoData
            } as PromoCode;
            setLocalConfig({ 
                ...localConfig, 
                promoCodes: [...localConfig.promoCodes, newPromo] 
            });
        }
    };

    const handleDeletePromo = (promoId: string) => {
        if (confirm('Weet je zeker dat je deze promocode wilt verwijderen?')) {
            const updatedPromoCodes = localConfig.promoCodes.filter(p => p.id !== promoId);
            setLocalConfig({ ...localConfig, promoCodes: updatedPromoCodes });
        }
    };

    const renderTabContent = () => {
        const archivedShowNames = localConfig.showNames.filter(s => s.archived);
        const archivedShowTypes = localConfig.showTypes.filter(s => s.archived);

        switch(activeTab) {
            case 'shows': return (
                <>
                    <div className="card settings-card">
                         <div className="settings-card-header">
                            <h3>{i18n.showTitles}</h3>
                            <p className="settings-description">{i18n.settingsShowsDescription}</p>
                         </div>
                        <ul className="editable-list">
                            {localConfig.showNames.filter(s => !s.archived).map((item, index) => (
                                <li key={item.id} className="setting-item">
                                    <img src={item.imageUrl} alt={item.name} className="setting-item-thumbnail" />
                                    <div className="setting-item-content-wrapper">
                                        <input type="text" value={item.name} onChange={e => handleItemChange('showNames', localConfig.showNames.indexOf(item), 'name', e.target.value)} />
                                        <input type="text" value={item.imageUrl} onChange={e => handleItemChange('showNames', localConfig.showNames.indexOf(item), 'imageUrl', e.target.value)} placeholder="Image URL"/>
                                    </div>
                                    <div className="setting-item-actions">
                                        <button onClick={() => handleToggleArchive('showNames', item.id)} className="icon-btn" title={i18n.archiveItem}><Icon id="archive"/></button>
                                        <button onClick={() => handleDeleteItem('showNames', item.id)} className="icon-btn" title={i18n.delete}><Icon id="trash"/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                         <button className="add-new-btn btn-secondary" onClick={() => handleAddItem('showNames', {id: `new_show_${Date.now()}`, name: 'Nieuwe Show', archived: false, imageUrl: 'https://placehold.co/150x100'})}>{i18n.addNew}</button>
                    </div>
                     <div className="card settings-card">
                         <div className="settings-card-header">
                            <h3>{i18n.showTypes}</h3>
                            <p className="settings-description">{i18n.settingsTypesDescription}</p>
                         </div>
                        <ul className="editable-list">
                            {localConfig.showTypes.filter(t => !t.archived).map((item, index) => {
                                return (
                                <li key={item.id} className="setting-item show-type-item">
                                    <div className="setting-item-content-wrapper">
                                        <div className="show-type-main-settings">
                                            <input type="text" value={item.name} onChange={e => handleItemChange('showTypes', localConfig.showTypes.indexOf(item), 'name', e.target.value)} />
                                        </div>
                                        <div className="show-type-sub-settings">
                                            <div className="form-group-inline"><label>{i18n.defaultCapacity}</label><input type="number" value={item.defaultCapacity} onChange={e => handleItemChange('showTypes', localConfig.showTypes.indexOf(item), 'defaultCapacity', Number(e.target.value))} /></div>
                                            <div className="form-group-inline"><label>{i18n.priceStandard}</label><input type="number" value={item.priceStandard} onChange={e => handleItemChange('showTypes', localConfig.showTypes.indexOf(item), 'priceStandard', Number(e.target.value))} /></div>
                                            <div className="form-group-inline"><label>{i18n.pricePremium}</label><input type="number" value={item.pricePremium} onChange={e => handleItemChange('showTypes', localConfig.showTypes.indexOf(item), 'pricePremium', Number(e.target.value))} /></div>
                                            
                                            {/* Nieuwe tijd instellingen */}
                                            <div className="form-group-inline">
                                                <label>🕐 Standaard Starttijd</label>
                                                <input 
                                                    type="time" 
                                                    value={item.defaultStartTime || '19:30'} 
                                                    onChange={e => handleItemChange('showTypes', localConfig.showTypes.indexOf(item), 'defaultStartTime', e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group-inline">
                                                <label>🕘 Standaard Eindtijd (automatisch berekend: starttijd + 3,5 uur)</label>
                                                <input 
                                                    type="time" 
                                                    value={item.defaultEndTime || '22:30'} 
                                                    onChange={e => handleItemChange('showTypes', localConfig.showTypes.indexOf(item), 'defaultEndTime', e.target.value)}
                                                    style={{ backgroundColor: '#f8f9fa', fontStyle: 'italic' }}
                                                    title="Deze tijd wordt automatisch berekend, maar kan handmatig worden aangepast"
                                                />
                                            </div>
                                            <div className="form-group-inline">
                                                <label>⚙️ Aangepaste Tijden Toestaan</label>
                                                <input 
                                                    type="checkbox" 
                                                    checked={item.allowCustomTimes !== false} 
                                                    onChange={e => handleItemChange('showTypes', localConfig.showTypes.indexOf(item), 'allowCustomTimes', e.target.checked)}
                                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                />
                                            </div>
                                            
                                            <div className="form-group-inline">
                                                <label>🎨 Kalender Kleur</label>
                                                <input 
                                                    type="color" 
                                                    value={item.color || '#A00000'} 
                                                    onChange={e => handleItemChange('showTypes', localConfig.showTypes.indexOf(item), 'color', e.target.value)}
                                                    style={{ width: '50px', height: '35px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                />
                                            </div>
                                            <div className="form-group-inline">
                                                <label>📋 Toon in Legenda</label>
                                                <input 
                                                    type="checkbox" 
                                                    checked={item.showInLegend || false} 
                                                    onChange={e => handleItemChange('showTypes', localConfig.showTypes.indexOf(item), 'showInLegend', e.target.checked)}
                                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="setting-item-actions">
                                        <button onClick={() => handleToggleArchive('showTypes', item.id)} className="icon-btn" title={i18n.archiveItem}><Icon id="archive"/></button>
                                        <button onClick={() => handleDeleteItem('showTypes', item.id)} className="icon-btn" title={i18n.delete}><Icon id="trash"/></button>
                                    </div>
                                </li>
                            )})}
                        </ul>
                         <button className="add-new-btn btn-secondary" onClick={() => {
                             const defaultStartTime = '19:30';
                             const defaultEndTime = calculateEndTime(defaultStartTime);
                             handleAddItem('showTypes', {
                                 id: `new_type_${Date.now()}`, 
                                 name: 'Nieuw Type', 
                                 archived: false, 
                                 defaultCapacity: 100, 
                                 priceStandard: 50, 
                                 pricePremium: 65, 
                                 color: '#A00000', 
                                 showInLegend: true,
                                 defaultStartTime: defaultStartTime,
                                 defaultEndTime: defaultEndTime,
                                 allowCustomTimes: true
                             });
                         }}>{i18n.addNew}</button>
                    </div>
                </>
            );
            case 'booking': return (
                <div className="card settings-card">
                     <div className="settings-card-header">
                         <h3>{i18n.bookingRules}</h3>
                         <p className="settings-description">{i18n.settingsBookingDescription}</p>
                     </div>
                         <div className="modal-body">
                            <div className="form-group">
                                <label>{i18n.minGuestsPerBooking}</label>
                                <input type="number" value={localConfig.bookingSettings.minGuests} onChange={e => setLocalConfig({...localConfig, bookingSettings: {...localConfig.bookingSettings, minGuests: Number(e.target.value)}})} />
                            </div>
                            <div className="form-group">
                                <label>{i18n.maxGuestsPerBooking}</label>
                                <input type="number" value={localConfig.bookingSettings.maxGuests} onChange={e => setLocalConfig({...localConfig, bookingSettings: {...localConfig.bookingSettings, maxGuests: Number(e.target.value)}})} />
                            </div>
                             <div className="form-group">
                                <label>{i18n.bookingCutoffHours}</label>
                                <input type="number" value={localConfig.bookingSettings.bookingCutoffHours} onChange={e => setLocalConfig({...localConfig, bookingSettings: {...localConfig.bookingSettings, bookingCutoffHours: Number(e.target.value)}})} />
                            </div>
                         </div>
                    </div>
            );
            case 'merchandise': return (
                <div className="card settings-card">
                    <div className="settings-card-header">
                        <h3>Extra's Beheren</h3>
                        <p className="settings-description">Beheer hier de extra's die klanten kunnen bijboeken in de wizard.</p>
                    </div>
                    <ul className="editable-list">
                        {/* Header Row */}
                        <li className="setting-item-header">
                            <span>Product</span>
                            <span>Prijs</span>
                            <span>Omschrijving</span>
                            <span>Afbeelding URL</span>
                        </li>
                        {/* Items */}
                        {localConfig.merchandise.map((item, index) => (
                            <li key={item.id} className="setting-item">
                                <div className="setting-item-content-wrapper merchandise-grid">
                                    <input type="text" value={item.name} placeholder="Naam van product" onChange={e => handleItemChange('merchandise', index, 'name', e.target.value)} />
                                    <input type="number" value={item.price} placeholder="Prijs" onChange={e => handleItemChange('merchandise', index, 'price', Number(e.target.value))} />
                                    <input type="text" value={item.description || ''} placeholder="Korte omschrijving" onChange={e => handleItemChange('merchandise', index, 'description', e.target.value)} />
                                    <input type="url" value={item.imageUrl || ''} placeholder="https://voorbeeld.com/foto.jpg" onChange={e => handleItemChange('merchandise', index, 'imageUrl', e.target.value)} />
                                </div>
                                <div className="setting-item-actions">
                                    <button onClick={() => handleDeleteItem('merchandise', item.id)} className="icon-btn" title="Verwijder"><Icon id="trash"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button className="add-new-btn btn-secondary" onClick={() => handleAddItem('merchandise', {id: `merch_${Date.now()}`, name: '', price: 0, description: '', imageUrl: ''})}>
                        Nieuwe Extra Toevoegen
                    </button>
                </div>
            );
            case 'promo': return (
                <>
                    <div className="settings-section-layout">
                        <div className="card settings-card">
                            <div className="settings-card-header">
                                <h3>Promoties & Kortingscodes</h3>
                                <p className="settings-description">Beheer marketingcampagnes en kortingen met geavanceerde regels.</p>
                                <button 
                                    onClick={() => { 
                                        setEditingPromo(null); 
                                        setIsPromoModalOpen(true); 
                                    }} 
                                    className="primary-action-btn"
                                >
                                    ➕ Nieuwe Promotie
                                </button>
                            </div>
                            
                            <div className="promo-cards-list">
                                {localConfig.promoCodes.map((promo) => (
                                    <div key={promo.id} className={`promo-card ${!promo.isActive ? 'disabled' : ''}`}>
                                        <div className="promo-card-header">
                                            <span className="promo-code">{promo.code}</span>
                                            <span className="promo-discount">
                                                {promo.type === 'percentage' ? `${promo.value}%` : `€${promo.value.toFixed(2)}`}
                                            </span>
                                        </div>
                                        <p className="promo-description">
                                            {promo.description || 'Geen omschrijving'}
                                        </p>
                                        <div className="promo-usage">
                                            <div className="usage-bar">
                                                <div 
                                                    className="usage-fill" 
                                                    style={{width: `${promo.usageLimit ? (promo.usageCount / promo.usageLimit) * 100 : 0}%`}}
                                                ></div>
                                            </div>
                                            <span>{promo.usageCount} / {promo.usageLimit || '∞'} gebruikt</span>
                                        </div>
                                        <div className="promo-card-footer">
                                            <span className="promo-status">
                                                Status: {promo.isActive ? 'Actief' : 'Inactief'}
                                            </span>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button 
                                                    onClick={() => handleEditPromo(promo)} 
                                                    className="icon-btn"
                                                    title="Bewerken"
                                                >
                                                    <Icon id="edit"/>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeletePromo(promo.id)} 
                                                    className="icon-btn"
                                                    title="Verwijderen"
                                                >
                                                    <Icon id="trash"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {localConfig.promoCodes.length === 0 && (
                                    <div style={{
                                        gridColumn: '1 / -1',
                                        textAlign: 'center',
                                        padding: '2rem',
                                        color: 'var(--text-color-light)'
                                    }}>
                                        Geen promoties aangemaakt. Klik op "Nieuwe Promotie" om te beginnen.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {isPromoModalOpen && (
                        <AddPromoCodeModal
                            promo={editingPromo}
                            onClose={() => setIsPromoModalOpen(false)}
                            onSave={handleSavePromo}
                            config={localConfig}
                        />
                    )}
                </>
            );
            case 'archive': return (
                <div className="settings-section-layout">
                    <div className="card settings-card">
                        <div className="settings-card-header">
                            <h3>Gearchiveerde Items</h3>
                            <p className="settings-description">Bekijk hier gearchiveerde items. Je kunt ze herstellen om ze weer bruikbaar te maken.</p>
                        </div>
                        {archivedShowNames.length > 0 && (
                            <div>
                                <h4>Shows</h4>
                                <ul className="archived-list">
                                    {archivedShowNames.map(item => (
                                        <li key={item.id}>
                                            <span>{item.name}</span>
                                            <button onClick={() => handleToggleArchive('showNames', item.id)} className="icon-btn restore-btn" title="Herstellen">
                                                <Icon id="restore"/>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {archivedShowTypes.length > 0 && (
                            <div>
                                <h4>Show Types</h4>
                                <ul className="archived-list">
                                    {archivedShowTypes.map(item => (
                                        <li key={item.id}>
                                            <span>{item.name}</span>
                                            <button onClick={() => handleToggleArchive('showTypes', item.id)} className="icon-btn restore-btn" title="Herstellen">
                                                <Icon id="restore"/>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {archivedShowNames.length === 0 && archivedShowTypes.length === 0 && (
                            <p className="empty-state">Geen gearchiveerde items</p>
                        )}
                    </div>
                </div>
            );
            default: return null;
        }
    }

    const settingsTabs: { id: SettingsTab, label: string, icon: string }[] = [
        { id: 'shows', label: i18n.showsTypesCapacity, icon: 'show' },
        { id: 'booking', label: i18n.bookingSettings, icon: 'settings' },
        { id: 'merchandise', label: 'Extra\'s', icon: 'tag' },
        { id: 'promo', label: i18n.promoAndGifts, icon: 'receipt' },
        { id: 'archive', label: i18n.archive, icon: 'archive' },
    ];

    return (
        <div className="new-settings-view">
            <div className="settings-sidebar">
                <div className="sidebar-header">
                    <h3>Instellingen</h3>
                </div>
                <nav className="settings-nav">
                    {settingsTabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon id={tab.icon} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <div className="settings-content-area">
                <div className="settings-content-header">
                    <h2>{settingsTabs.find(t => t.id === activeTab)?.label}</h2>
                    <button onClick={handleSave} className="submit-btn">
                        <Icon id="check" /> Wijzigingen Opslaan
                    </button>
                </div>
                <div className="settings-content-body">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    )
};

const EditReservationModal = ({ reservation, show, onClose, onSave }: {
    reservation: Reservation;
    show: ShowEvent;
    onClose: () => void;
    onSave: (updatedReservation: Reservation) => void;
}) => {
    const [formData, setFormData] = useState<Reservation>(reservation);
    const [emailSending, setEmailSending] = useState(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleSendEmail = async (emailType: 'provisional' | 'confirmed' = 'confirmed') => {
        setEmailSending(true);
        try {
            const emailData: BookingEmailData = {
                customerName: formData.contactName || 'Onbekend',
                customerEmail: formData.email || 'Niet opgegeven',
                customerPhone: formData.phone || 'Niet opgegeven',
                customerAddress: `${formData.address || ''} ${formData.houseNumber || ''}`.trim() || undefined,
                customerCity: formData.city || undefined,
                customerPostalCode: formData.postalCode || undefined,
                customerCountry: formData.country || 'Nederland',
                companyName: formData.companyName,
                showTitle: show?.name || 'Onbekende show',
                showDate: formData.date,
                showTime: show?.startTime || undefined,
                packageType: formData.drinkPackage || 'standard',
                numberOfGuests: formData.guests,
                totalPrice: formData.totalPrice || 0,
                reservationId: formData.id,
                allergies: formData.allergies,
                preShowDrinks: formData.preShowDrinks,
                afterParty: formData.afterParty ? formData.guests : undefined,
                remarks: formData.remarks,
                promoCode: formData.promoCode,
                discountAmount: formData.discountAmount
            };

            const success = await resendConfirmationEmail(emailData, emailType);
            if (success) {
                alert(`Email ${emailType === 'provisional' ? 'voorlopige boeking' : 'bevestiging'} succesvol verstuurd naar ${formData.email}!`);
            } else {
                alert('Er is een fout opgetreden bij het versturen van de email');
            }
        } catch (error) {
            console.error('Email send failed:', error);
            alert('Er is een fout opgetreden bij het versturen van de email');
        } finally {
            setEmailSending(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{i18n.editReservation}</h3>
                    <button onClick={onClose} className="close-btn" aria-label={i18n.cancel}><Icon id="close" /></button>
                </div>
                <form onSubmit={handleSave} className="modal-body">
                    <h4>{show.name} - {formatDateToNL(new Date(show.date + 'T12:00:00'))}</h4>
                    
                    {/* Booking Details Section */}
                    <div className="form-section">
                        <h5>📋 Boeking Details</h5>
                        <div className="form-grid">
                            <div className="form-group"><label>{i18n.numberOfGuests}</label><input value={formData.guests} disabled /></div>
                            <div className="form-group"><label>{i18n.formPackage}</label><input value={formData.drinkPackage === 'premium' ? 'Premium' : 'Standaard'} disabled /></div>
                            <div className="form-group"><label>{i18n.totalPrice}</label><input value={`€${formData.totalPrice.toFixed(2)}`} disabled /></div>
                        </div>
                    </div>

                    {/* Borrels & Extra's Section */}
                    <div className="form-section">
                        <h5>🍹 Borrels & Extra's</h5>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Pre-show borrel</label>
                                <input value={formData.preShowDrinks ? `✅ Ja (${formData.guests} personen)` : '❌ Nee'} disabled />
                            </div>
                            <div className="form-group">
                                <label>After party</label>
                                <input value={formData.afterParty ? `✅ Ja (${formData.guests} personen)` : '❌ Nee'} disabled />
                            </div>
                            {formData.promoCode && (
                                <div className="form-group">
                                    <label>Promocode</label>
                                    <input value={`${formData.promoCode} (-€${(formData.discountAmount || 0).toFixed(2)})`} disabled />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <hr style={{border: 'none', borderTop: '1px solid var(--border-color)', margin: 'var(--space-md) 0'}}/>
                    
                    {/* Contact Details Section */}
                    <div className="form-section">
                        <h5>👤 Contact Gegevens</h5>
                        <div className="form-grid">
                            <div className="form-group"><label htmlFor="companyName">{i18n.formCompany}</label><input id="companyName" name="companyName" type="text" value={formData.companyName} onChange={handleFormChange} /></div>
                            <div className="form-group"><label htmlFor="salutation">{i18n.formSalutation}</label><select id="salutation" name="salutation" value={formData.salutation} onChange={handleFormChange} required><option>Dhr.</option><option>Mevr.</option><option>N.v.t.</option></select></div>
                            <div className="form-group"><label htmlFor="contactName">{i18n.formContactPerson}</label><input id="contactName" name="contactName" type="text" value={formData.contactName} onChange={handleFormChange} required /></div>
                            <div className="form-group"><label htmlFor="address">{i18n.formAddress}</label><input id="address" name="address" type="text" value={formData.address} onChange={handleFormChange} required /></div>
                            <div className="form-group"><label htmlFor="houseNumber">{i18n.formHouseNumber}</label><input id="houseNumber" name="houseNumber" type="text" value={formData.houseNumber} onChange={handleFormChange} required /></div>
                            <div className="form-group"><label htmlFor="postalCode">{i18n.formPostalCode}</label><input id="postalCode" name="postalCode" type="text" value={formData.postalCode} onChange={handleFormChange} required /></div>
                            <div className="form-group"><label htmlFor="city">{i18n.formCity}</label><input id="city" name="city" type="text" value={formData.city} onChange={handleFormChange} required /></div>
                            <div className="form-group"><label htmlFor="phone">{i18n.formPhone}</label><input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleFormChange} required /></div>
                            <div className="form-group"><label htmlFor="email">{i18n.formEmail}</label><input id="email" name="email" type="email" value={formData.email} onChange={handleFormChange} required /></div>
                        </div>
                    </div>
                    
                    {/* Special Requirements Section */}
                    <div className="form-section">
                        <h5>🥗 Speciale Wensen</h5>
                        <div className="form-group">
                            <label htmlFor="allergies">Allergieën & Dieetwensen</label>
                            <textarea 
                                id="allergies" 
                                name="allergies" 
                                value={formData.allergies || ''} 
                                onChange={handleFormChange}
                                placeholder="Vermeld hier eventuele allergieën, dieetwensen of bijzondere verzoeken..."
                                rows={3}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="remarks">{i18n.formRemarks}</label>
                            <textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleFormChange} rows={2} />
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <div className="modal-footer-left">
                            <button 
                                type="button" 
                                onClick={() => handleSendEmail('confirmed')} 
                                className="btn-secondary"
                                disabled={emailSending}
                                title="Bevestiging email versturen naar klant"
                            >
                                📧 {emailSending ? 'Versturen...' : 'Email Versturen'}
                            </button>
                            {formData.status === 'provisional' && (
                                <button 
                                    type="button" 
                                    onClick={() => handleSendEmail('provisional')} 
                                    className="btn-tertiary"
                                    disabled={emailSending}
                                    title="Voorlopige booking email versturen naar klant"
                                >
                                    📨 Voorlopig Email
                                </button>
                            )}
                        </div>
                        <div className="modal-footer-right">
                            <button type="button" onClick={onClose} className="btn-secondary">{i18n.cancel}</button>
                            <button type="submit" className="submit-btn">{i18n.save}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminSidebar = ({ activeView, setActiveView } : { activeView: AdminView, setActiveView: (view: AdminView) => void }) => {
    // State voor het bijhouden welk submenu open is
    const [openMenu, setOpenMenu] = useState<string>('operations');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Close mobile menu when view changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [activeView]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const sidebar = document.querySelector('.admin-sidebar');
            const mobileBtn = document.querySelector('.mobile-menu-btn');
            if (mobileMenuOpen && sidebar && mobileBtn && 
                !sidebar.contains(event.target as Node) && 
                !mobileBtn.contains(event.target as Node)) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mobileMenuOpen]);

    // Nieuwe, gestructureerde menu data
    const navMenu = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', type: 'single' },
        {
            id: 'operations',
            label: 'Dagelijks Beheer',
            icon: 'calendar-day',
            type: 'group',
            subItems: [
                { id: 'calendar', label: i18n.viewCalendar, icon: 'calendar' },
                { id: 'capacity', label: i18n.capacityManagement, icon: 'capacity' },
            ],
        },
        {
            id: 'bookings',
            label: 'Boekingen',
            icon: 'receipt',
            type: 'group',
            subItems: [
                { id: 'reservations', label: i18n.allReservations, icon: 'receipt' },
                { id: 'approvals', label: i18n.approvals, icon: 'check-circle' },
                { id: 'waitlist', label: i18n.waitlist, icon: 'clock' },
            ],
        },
        {
            id: 'sales',
            label: 'Klanten & Verkoop',
            icon: 'users',
            type: 'group',
            subItems: [
                { id: 'customers', label: i18n.customers, icon: 'users' },
                { id: 'vouchers', label: i18n.vouchers, icon: 'gift' },
            ],
        },
        { id: 'settings', label: i18n.settings, icon: 'settings', type: 'single' },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button 
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
            >
                {mobileMenuOpen ? '✕' : '☰'}
            </button>
            
            {/* Mobile Overlay */}
            <div 
                className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />
            
            <nav className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <span>Inspiration Point</span>
                </div>
                <div className="sidebar-nav">
                {navMenu.map((item: any) => {
                    if (item.type === 'single') {
                        return (
                            <button
                                key={item.id}
                                className={`sidebar-link ${activeView === item.id ? 'active' : ''}`}
                                onClick={() => {
                                    console.log('🖱️ SIDEBAR CLICK:', item.id);
                                    console.log('- Setting adminView to:', item.id);
                                    setActiveView(item.id as AdminView);
                                }}
                                aria-current={activeView === item.id ? 'page' : undefined}
                            >
                                <Icon id={item.icon} className="icon" />
                                <span>{item.label}</span>
                            </button>
                        );
                    }

                    if (item.type === 'group') {
                        const isOpen = openMenu === item.id;
                        const isActiveGroup = item.subItems.some((sub: any) => sub.id === activeView);
                        return (
                            <div key={item.id} className={`nav-group ${isOpen ? 'open' : ''}`}>
                                <button
                                    className={`group-header ${isActiveGroup ? 'active-group' : ''}`}
                                    onClick={() => setOpenMenu(isOpen ? '' : item.id)}
                                >
                                    <div className="group-label">
                                        <Icon id={item.icon} className="icon" />
                                        <span>{item.label}</span>
                                    </div>
                                    <Icon id={isOpen ? 'chevron-down' : 'chevron-right'} className="chevron" />
                                </button>
                                <div className="submenu">
                                    {item.subItems.map((subItem: any) => (
                                        <button
                                            key={subItem.id}
                                            className={`submenu-link ${activeView === subItem.id ? 'active' : ''}`}
                                            onClick={() => setActiveView(subItem.id as AdminView)}
                                            aria-current={activeView === subItem.id ? 'page' : undefined}
                                        >
                                            <span>{subItem.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </nav>
        </>
    );
};

// 🧠 Phase 3: Advanced Analytics View

// 🧠 Phase 3: Advanced Analytics View
const AdminAnalyticsView = ({ waitingList, reservations, showEvents, config }: {
    waitingList: WaitingListEntry[];
    reservations: Reservation[];
    showEvents: ShowEvent[];
    config: AppConfig;
}) => {
    const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
    const [selectedMetric, setSelectedMetric] = useState<'overview' | 'conversion' | 'revenue' | 'predictions'>('overview');

    // 📊 Calculate Analytics Data
    const analyticsData = useMemo((): AnalyticsData => {
        const now = new Date();
        const cutoffDate = new Date();
        
        switch (analyticsTimeframe) {
            case '7d': cutoffDate.setDate(now.getDate() - 7); break;
            case '30d': cutoffDate.setDate(now.getDate() - 30); break;
            case '90d': cutoffDate.setDate(now.getDate() - 90); break;
            case 'all': cutoffDate.setFullYear(2020); break;
        }

        const filteredWaitlist = waitingList.filter(w => 
            new Date(w.addedAt || now) >= cutoffDate
        );
        const filteredReservations = reservations.filter(r => 
            new Date(r.createdAt) >= cutoffDate
        );

        // Waitlist Metrics
        const totalActive = filteredWaitlist.filter(w => w.status === 'active' || !w.status).length;
        const converted = filteredWaitlist.filter(w => w.status === 'converted').length;
        const notified = filteredWaitlist.filter(w => w.status === 'notified').length;
        const conversionRate = filteredWaitlist.length > 0 ? (converted / filteredWaitlist.length) * 100 : 0;
        const notificationResponseRate = notified > 0 ? (converted / notified) * 100 : 0;

        const waitTimeData = filteredWaitlist
            .filter(w => w.status === 'converted' && w.addedAt)
            .map(w => {
                const waitTime = (new Date(w.lastNotificationAt || now).getTime() - new Date(w.addedAt!).getTime()) / (1000 * 60 * 60 * 24);
                return waitTime;
            });
        const averageWaitTime = waitTimeData.length > 0 ? waitTimeData.reduce((a, b) => a + b, 0) / waitTimeData.length : 0;

        // Revenue Metrics
        const waitlistRevenuePotential = filteredWaitlist.reduce((total, w) => {
            const show = showEvents.find(s => s.date === w.date);
            const showTypeConfig = config.showTypes.find(st => st.name.toLowerCase() === show?.type?.toLowerCase());
            return total + (w.guests * (showTypeConfig?.priceStandard || 0));
        }, 0);

        const actualWaitlistRevenue = filteredWaitlist
            .filter(w => w.status === 'converted')
            .reduce((total, w) => {
                const show = showEvents.find(s => s.date === w.date);
                const showTypeConfig = config.showTypes.find(st => st.name.toLowerCase() === show?.type?.toLowerCase());
                return total + (w.guests * (showTypeConfig?.priceStandard || 0));
            }, 0);

        // Customer Insights
        const customerCounts = new Map<string, number>();
        filteredWaitlist.forEach(w => {
            const key = w.email || w.phone || w.name;
            customerCounts.set(key, (customerCounts.get(key) || 0) + 1);
        });
        const repeatWaitlistCustomers = Array.from(customerCounts.values()).filter(count => count > 1).length;

        const vipCustomers = filteredWaitlist.filter(w => w.customerSegment === 'vip').length;
        const vipWaitlistRatio = filteredWaitlist.length > 0 ? (vipCustomers / filteredWaitlist.length) * 100 : 0;

        const showRequestCounts = new Map<string, number>();
        filteredWaitlist.forEach(w => {
            showRequestCounts.set(w.date, (showRequestCounts.get(w.date) || 0) + 1);
        });
        const mostRequestedShows = Array.from(showRequestCounts.entries())
            .map(([date, requests]) => ({ date, requests }))
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 5);

        // Predictive Analytics (AI-like calculations)
        const predictCancellationProbability = (showDate: string): number => {
            const historical = filteredReservations.filter(r => r.date === showDate);
            const cancelled = historical.filter(r => r.status === 'cancelled').length;
            return historical.length > 0 ? (cancelled / historical.length) * 100 : 15; // default 15%
        };

        const calculateOptimalPrice = (showDate: string): number => {
            const show = showEvents.find(s => s.date === showDate);
            const basePrice = config.showTypes.find(st => st.name.toLowerCase() === show?.type?.toLowerCase())?.priceStandard || 0;
            const demand = showRequestCounts.get(showDate) || 0;
            const demandMultiplier = Math.min(1.5, 1 + (demand * 0.1)); // max 50% increase
            return Math.round(basePrice * demandMultiplier);
        };

        return {
            waitlistMetrics: {
                totalActive,
                averageWaitTime,
                conversionRate,
                notificationResponseRate,
                dropOffRate: 100 - conversionRate,
                peakRequestTimes: [] // Would need time tracking
            },
            conversionMetrics: {
                dailyConversions: [], // Would need daily breakdown
                channelPerformance: [
                    { channel: 'website', rate: 65 },
                    { channel: 'phone', rate: 80 },
                    { channel: 'email', rate: 45 },
                    { channel: 'walk-in', rate: 90 }
                ],
                segmentConversion: [
                    { segment: 'vip', rate: 85 },
                    { segment: 'regular', rate: 65 },
                    { segment: 'new', rate: 45 },
                    { segment: 'corporate', rate: 75 }
                ],
                timeToConversion: averageWaitTime * 24 // convert to hours
            },
            revenueMetrics: {
                waitlistRevenuePotential,
                actualWaitlistRevenue,
                averageWaitlistOrderValue: converted > 0 ? actualWaitlistRevenue / converted : 0,
                revenueByShow: Array.from(showRequestCounts.entries()).map(([showDate, requests]) => {
                    const show = showEvents.find(s => s.date === showDate);
                    const showTypeConfig = config.showTypes.find(st => st.name.toLowerCase() === show?.type?.toLowerCase());
                    const potential = requests * 2 * (showTypeConfig?.priceStandard || 0); // assume avg 2 guests
                    const actual = filteredWaitlist.filter(w => w.date === showDate && w.status === 'converted')
                        .reduce((sum, w) => sum + w.guests * (showTypeConfig?.priceStandard || 0), 0);
                    return { showDate, revenue: actual, potential };
                })
            },
            customerInsights: {
                repeatWaitlistCustomers,
                vipWaitlistRatio,
                averageGroupSize: filteredWaitlist.length > 0 ? 
                    filteredWaitlist.reduce((sum, w) => sum + w.guests, 0) / filteredWaitlist.length : 0,
                mostRequestedShows
            },
            predictiveMetrics: {
                expectedCancellations: showEvents.map(show => ({
                    date: show.date,
                    probability: predictCancellationProbability(show.date)
                })),
                optimalPricing: showEvents.map(show => ({
                    date: show.date,
                    suggestedPrice: calculateOptimalPrice(show.date),
                    confidence: 75 + Math.random() * 20 // 75-95% confidence
                })),
                demandForecast: showEvents.map(show => ({
                    date: show.date,
                    expectedDemand: (showRequestCounts.get(show.date) || 0) * 1.2 // 20% growth projection
                })),
                notificationOptimalTiming: [
                    { hour: 10, responseRate: 78 },
                    { hour: 14, responseRate: 65 },
                    { hour: 18, responseRate: 82 },
                    { hour: 20, responseRate: 71 }
                ]
            }
        };
    }, [waitingList, reservations, showEvents, config, analyticsTimeframe]);

    return (
        <div className="admin-analytics-container">
            <div className="admin-header">
                <div className="admin-header-main">
                    <h2>🧠 Smart Analytics Dashboard</h2>
                    <p>AI-gedreven inzichten en voorspellingen</p>
                </div>
                <div className="admin-header-actions">
                    <select 
                        value={analyticsTimeframe} 
                        onChange={(e) => setAnalyticsTimeframe(e.target.value as any)}
                        className="filter-select"
                    >
                        <option value="7d">Laatste 7 dagen</option>
                        <option value="30d">Laatste 30 dagen</option>
                        <option value="90d">Laatste 90 dagen</option>
                        <option value="all">Alle tijd</option>
                    </select>
                </div>
            </div>

            {/* Analytics Navigation */}
            <div className="analytics-nav">
                <button 
                    className={selectedMetric === 'overview' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => setSelectedMetric('overview')}
                >
                    📊 Overzicht
                </button>
                <button 
                    className={selectedMetric === 'conversion' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => setSelectedMetric('conversion')}
                >
                    🔄 Conversie
                </button>
                <button 
                    className={selectedMetric === 'revenue' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => setSelectedMetric('revenue')}
                >
                    💰 Omzet
                </button>
                <button 
                    className={selectedMetric === 'predictions' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => setSelectedMetric('predictions')}
                >
                    🔮 Voorspellingen
                </button>
            </div>

            {/* Analytics Content */}
            <div className="analytics-content">
                {selectedMetric === 'overview' && (
                    <div className="analytics-overview">
                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <div className="card-header">
                                    <h3>📋 Wachtlijst Status</h3>
                                </div>
                                <div className="card-content">
                                    <div className="metric-large">
                                        <span className="metric-value">{analyticsData.waitlistMetrics.totalActive}</span>
                                        <span className="metric-label">Actieve wachtenden</span>
                                    </div>
                                    <div className="metric-row">
                                        <div className="metric">
                                            <span className="metric-value">{analyticsData.waitlistMetrics.conversionRate.toFixed(1)}%</span>
                                            <span className="metric-label">Conversie rate</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-value">{analyticsData.waitlistMetrics.averageWaitTime.toFixed(1)}</span>
                                            <span className="metric-label">Gem. wachttijd (dagen)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="card-header">
                                    <h3>💰 Omzet Impact</h3>
                                </div>
                                <div className="card-content">
                                    <div className="metric-large">
                                        <span className="metric-value">€{analyticsData.revenueMetrics.actualWaitlistRevenue.toLocaleString()}</span>
                                        <span className="metric-label">Gerealiseerde omzet</span>
                                    </div>
                                    <div className="metric-row">
                                        <div className="metric">
                                            <span className="metric-value">€{analyticsData.revenueMetrics.waitlistRevenuePotential.toLocaleString()}</span>
                                            <span className="metric-label">Potentiële omzet</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-value">€{analyticsData.revenueMetrics.averageWaitlistOrderValue.toFixed(0)}</span>
                                            <span className="metric-label">Gem. orderwaarde</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="card-header">
                                    <h3>👥 Klant Inzichten</h3>
                                </div>
                                <div className="card-content">
                                    <div className="metric-large">
                                        <span className="metric-value">{analyticsData.customerInsights.averageGroupSize.toFixed(1)}</span>
                                        <span className="metric-label">Gem. groepsgrootte</span>
                                    </div>
                                    <div className="metric-row">
                                        <div className="metric">
                                            <span className="metric-value">{analyticsData.customerInsights.repeatWaitlistCustomers}</span>
                                            <span className="metric-label">Terugkerende klanten</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-value">{analyticsData.customerInsights.vipWaitlistRatio.toFixed(1)}%</span>
                                            <span className="metric-label">VIP ratio</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Most Requested Shows */}
                        <div className="analytics-card full-width">
                            <div className="card-header">
                                <h3>🎭 Meest Gevraagde Shows</h3>
                            </div>
                            <div className="card-content">
                                <div className="show-demand-list">
                                    {analyticsData.customerInsights.mostRequestedShows.map((show, index) => {
                                        const showEvent = showEvents.find(s => s.date === show.date);
                                        return (
                                            <div key={show.date} className="demand-item">
                                                <div className="demand-rank">#{index + 1}</div>
                                                <div className="demand-info">
                                                    <div className="demand-date">{new Date(show.date).toLocaleDateString('nl-NL')}</div>
                                                    <div className="demand-show">{showEvent?.name || 'Onbekende show'}</div>
                                                </div>
                                                <div className="demand-count">{show.requests} verzoeken</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedMetric === 'predictions' && (
                    <div className="analytics-predictions">
                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <div className="card-header">
                                    <h3>🔮 Annulering Voorspellingen</h3>
                                </div>
                                <div className="card-content">
                                    <div className="prediction-list">
                                        {analyticsData.predictiveMetrics.expectedCancellations
                                            .filter(pred => pred.probability > 20)
                                            .sort((a, b) => b.probability - a.probability)
                                            .slice(0, 5)
                                            .map(prediction => {
                                                const show = showEvents.find(s => s.date === prediction.date);
                                                return (
                                                    <div key={prediction.date} className="prediction-item">
                                                        <div className="prediction-info">
                                                            <div className="prediction-date">{new Date(prediction.date).toLocaleDateString('nl-NL')}</div>
                                                            <div className="prediction-show">{show?.name}</div>
                                                        </div>
                                                        <div className="prediction-score">
                                                            <div className="score-bar">
                                                                <div 
                                                                    className="score-fill" 
                                                                    style={{ width: `${prediction.probability}%` }}
                                                                ></div>
                                                            </div>
                                                            <span>{prediction.probability.toFixed(0)}% kans</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="card-header">
                                    <h3>💡 Optimale Prijsstelling</h3>
                                </div>
                                <div className="card-content">
                                    <div className="pricing-list">
                                        {analyticsData.predictiveMetrics.optimalPricing
                                            .filter(price => {
                                                const show = showEvents.find(s => s.date === price.date);
                                                const basePrice = config.showTypes.find(st => st.name.toLowerCase() === show?.type?.toLowerCase())?.priceStandard || 0;
                                                return price.suggestedPrice !== basePrice;
                                            })
                                            .slice(0, 5)
                                            .map(pricing => {
                                                const show = showEvents.find(s => s.date === pricing.date);
                                                const basePrice = config.showTypes.find(st => st.name.toLowerCase() === show?.type?.toLowerCase())?.priceStandard || 0;
                                                const increase = ((pricing.suggestedPrice - basePrice) / basePrice) * 100;
                                                return (
                                                    <div key={pricing.date} className="pricing-item">
                                                        <div className="pricing-info">
                                                            <div className="pricing-date">{new Date(pricing.date).toLocaleDateString('nl-NL')}</div>
                                                            <div className="pricing-show">{show?.name}</div>
                                                        </div>
                                                        <div className="pricing-suggestion">
                                                            <span className="suggested-price">€{pricing.suggestedPrice}</span>
                                                            <span className="price-change">
                                                                {increase > 0 ? '+' : ''}{increase.toFixed(0)}%
                                                            </span>
                                                            <span className="confidence">{pricing.confidence.toFixed(0)}% zekerheid</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="card-header">
                                    <h3>⏰ Optimale Notificatie Tijden</h3>
                                </div>
                                <div className="card-content">
                                    <div className="timing-chart">
                                        {analyticsData.predictiveMetrics.notificationOptimalTiming.map(timing => (
                                            <div key={timing.hour} className="timing-item">
                                                <div className="timing-hour">{timing.hour}:00</div>
                                                <div className="timing-bar">
                                                    <div 
                                                        className="timing-fill"
                                                        style={{ width: `${timing.responseRate}%` }}
                                                    ></div>
                                                </div>
                                                <div className="timing-rate">{timing.responseRate}%</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add other metric views for conversion and revenue */}
            </div>
        </div>
    );
};

const AdminPanel = ({ reservations, showEvents, waitingList, internalEvents, config, onAddShow, onAddReservation, onDeleteReservation, onDeleteWaitingList, onBulkDelete, setConfig, guestCountMap, onDeleteShow, onToggleShowStatus, onUpdateShowCapacity, onAddExternalBooking, onToggleCheckIn, customers, onUpdateReservation, onUpdateWaitingList, onNotifyWaitlist, onConvertWaitlistToReservation, onAddInternalEvent, onUpdateInternalEvent, onDeleteInternalEvent, onUpdateShowEvents, onBulkDeleteShows, onBulkOpenClose }: {
    reservations: Reservation[];
    showEvents: ShowEvent[];
    waitingList: WaitingListEntry[];
    internalEvents: InternalEvent[];
    config: AppConfig;
    onAddShow: (event: Omit<ShowEvent, 'id'>, dates: string[]) => void;
    onAddReservation: (reservation: Omit<Reservation, 'id'>) => void;
    onDeleteReservation: (id: string) => void;
    onDeleteWaitingList: (id: string) => void;
    onBulkDelete: (criteria: { type: 'name' | 'type' | 'date', value: string }, month?: Date) => void;
    setConfig: (config: AppConfig) => Promise<void>;
    guestCountMap: Map<string, number>;
    onDeleteShow: (showId: string) => void;
    onToggleShowStatus: (showId: string) => void;
    onUpdateShowCapacity: (showId: string, newCapacity: number) => void;
    onAddExternalBooking?: (showId: string, guests: number) => void;
    onToggleCheckIn: (id: string) => void;
    customers: Customer[];
    onUpdateReservation: (reservation: Reservation) => void;
    onUpdateWaitingList: (entry: WaitingListEntry) => void;
    onNotifyWaitlist: (entry: WaitingListEntry) => void;
    onConvertWaitlistToReservation: (entry: WaitingListEntry) => void;
    onUpdateShowEvents?: (shows: ShowEvent[]) => void;
    onBulkDeleteShows: (showIds: string[]) => void;
    onBulkOpenClose: (showIds: string[], action: 'open' | 'close') => void;
    onAddInternalEvent: (event: Omit<InternalEvent, 'id'>) => void;
    onUpdateInternalEvent: (event: InternalEvent) => void;
    onDeleteInternalEvent: (id: string) => void;
}) => {
    const [adminView, setAdminView] = useState<AdminView>('dashboard');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const { addToast } = useToast();
    const analytics = useAnalyticsData(reservations, showEvents, config);
    
    // 🎭 Enhanced Dashboard State
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [checkInReservationId, setCheckInReservationId] = useState<string | null>(null);
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [quickActionLoading, setQuickActionLoading] = useState<string | null>(null);

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setAdminView('customerDetail');
    }
    
    const handleBackToCustomers = () => {
        setSelectedCustomer(null);
        setAdminView('customers');
    }

    // 🚀 Quick Action Handlers
    const handleQuickCheckIn = (reservationId?: number) => {
        if (reservationId) {
            setCheckInReservationId(reservationId);
        }
        setShowCheckInModal(true);
    };

    const handleEmergencyMode = () => {
        setEmergencyMode(!emergencyMode);
        addToast(emergencyMode ? '🟢 Normale modus' : '🚨 Noodmodus geactiveerd', emergencyMode ? 'success' : 'warning');
    };

    const handleBroadcast = async () => {
        if (!broadcastMessage.trim()) return;
        
        setQuickActionLoading('broadcast');
        // Simulate broadcast
        await new Promise(resolve => setTimeout(resolve, 1500));
        addToast(`📢 Bericht verzonden naar ${reservations.length} gasten`, 'success');
        setBroadcastMessage('');
        setShowBroadcastModal(false);
        setQuickActionLoading(null);
    };

    const handleQuickBooking = () => {
        setQuickActionLoading('booking');
        // Quick booking logic
        setTimeout(() => {
            addToast('🎫 Snelle boeking geopend', 'info');
            setQuickActionLoading(null);
        }, 1000);
    };

    const handlePaymentAction = () => {
        setQuickActionLoading('payment');
        setTimeout(() => {
            addToast('💳 Betalingssysteem geopend', 'info');
            setQuickActionLoading(null);
        }, 1000);
    };

    const handleEditReservation = (reservation: Reservation) => {
        setEditingReservation(reservation);
    };

    const handleSaveReservation = async (updatedReservation: Reservation) => {
        const originalReservation = editingReservation;
        if (!originalReservation) return;
        
        try {
            // Detect changes for email notification
            const changes: string[] = [];
            if (originalReservation.contactName !== updatedReservation.contactName) {
                changes.push(`Naam: ${originalReservation.contactName} → ${updatedReservation.contactName}`);
            }
            if (originalReservation.email !== updatedReservation.email) {
                changes.push(`Email: ${originalReservation.email} → ${updatedReservation.email}`);
            }
            if (originalReservation.phone !== updatedReservation.phone) {
                changes.push(`Telefoon: ${originalReservation.phone} → ${updatedReservation.phone}`);
            }
            if (originalReservation.address !== updatedReservation.address || originalReservation.city !== updatedReservation.city) {
                changes.push(`Adres gewijzigd`);
            }
            if (originalReservation.allergies !== updatedReservation.allergies) {
                changes.push(`Allergieën: ${originalReservation.allergies || 'Geen'} → ${updatedReservation.allergies || 'Geen'}`);
            }
            if (originalReservation.remarks !== updatedReservation.remarks) {
                changes.push(`Opmerkingen gewijzigd`);
            }
            
            // Update reservation
            onUpdateReservation(updatedReservation);
            
            // Send modification email if there are changes
            if (changes.length > 0) {
                try {
                    const show = showEvents.find(e => e.date === updatedReservation.date);
                    const emailData: BookingEmailData = {
                        customerName: updatedReservation.contactName || 'Onbekend',
                        customerEmail: updatedReservation.email || 'Niet opgegeven',
                        customerPhone: updatedReservation.phone || 'Niet opgegeven',
                        customerAddress: `${updatedReservation.address || ''} ${updatedReservation.houseNumber || ''}`.trim() || undefined,
                        customerCity: updatedReservation.city || undefined,
                        customerPostalCode: updatedReservation.postalCode || undefined,
                        customerCountry: updatedReservation.country || 'Nederland',
                        companyName: updatedReservation.companyName,
                        showTitle: show?.name || 'Onbekende show',
                        showDate: updatedReservation.date,
                        showTime: show?.startTime || undefined,
                        packageType: updatedReservation.drinkPackage || 'standard',
                        numberOfGuests: updatedReservation.guests,
                        totalPrice: updatedReservation.totalPrice || 0,
                        reservationId: updatedReservation.id,
                        allergies: updatedReservation.allergies,
                        preShowDrinks: updatedReservation.preShowDrinks,
                        afterParty: updatedReservation.afterParty ? updatedReservation.guests : undefined,
                        remarks: updatedReservation.remarks,
                        promoCode: updatedReservation.promoCode,
                        discountAmount: updatedReservation.discountAmount
                    };
                    
                    await sendBookingModifiedEmail(emailData, changes);
                    console.log('📧 Modification email sent successfully');
                } catch (emailError) {
                    console.error('📧 Modification email failed:', emailError);
                    // Don't fail the reservation update for email errors
                }
            }
            
            addToast(i18n.reservationUpdated, 'success');
            setEditingReservation(null);
        } catch (error) {
            console.error('Failed to save reservation:', error);
            addToast('Fout bij opslaan reservering', 'error');
        }
    };

    const editingShowEvent = useMemo(() => {
        if (!editingReservation) return undefined;
        return showEvents.find(e => e.date === editingReservation.date);
    }, [editingReservation, showEvents]);

    const renderAdminContent = () => {
        console.log('🔍 DEBUG renderAdminContent:');
        console.log('- adminView:', adminView);
        console.log('- adminView type:', typeof adminView);
        console.log('- adminView === "dashboard":', adminView === 'dashboard');
        
        switch(adminView) {
            case 'dashboard':
                console.log('✅ Rendering SimpleDashboard with consistent styling');
                return (
                    <SimpleDashboard setActiveView={setAdminView} />
                );
                
            case 'reservations':
                return (
                    <AdminReservationsView 
                        reservations={reservations}
                        showEvents={showEvents}
                        onDeleteReservation={onDeleteReservation}
                        onEditReservation={handleEditReservation}
                    />
                );
                
            case 'calendar': 
                return (
                    <>
                        <EnhancedAdminCalendarView 
                            showEvents={showEvents} reservations={reservations} waitingList={waitingList}
                            onAddShow={onAddShow} onAddReservation={onAddReservation} onDeleteReservation={onDeleteReservation} onDeleteWaitingList={onDeleteWaitingList}
                            config={config} guestCountMap={guestCountMap} onBulkDelete={onBulkDelete}
                            onDeleteShow={onDeleteShow} onToggleShowStatus={onToggleShowStatus} onToggleCheckIn={onToggleCheckIn}
                            onEditReservation={handleEditReservation} onUpdateReservation={onUpdateReservation}
                        />
                    </>
                );
            case 'customers':
                console.log('🧑‍🤝‍🧑 Rendering ModernAdminCustomersView with customers:', {
                    count: customers?.length || 0,
                    sampleCustomer: customers?.[0],
                    reservationsCount: reservations?.length || 0
                });
                return <ModernAdminCustomersView customers={customers} onSelectCustomer={handleSelectCustomer} />;
            case 'customerDetail':
                 return selectedCustomer ? <CustomerDetailView customer={selectedCustomer} onBack={handleBackToCustomers} showEvents={showEvents} onEditReservation={handleEditReservation}/> : null;
            case 'approvals':
                return <AdminApprovalsView reservations={reservations} showEvents={showEvents} onUpdateReservation={onUpdateReservation} guestCountMap={guestCountMap} />;
            case 'waitlist':
                return (
                    <NewAdminWaitlistView 
                        waitlist={waitingList}
                        onNotifyWaitlist={onNotifyWaitlist}
                        onConvertToBooking={onConvertWaitlistToReservation}
                        onRemoveFromWaitlist={onDeleteWaitingList}
                    />
                );
            case 'vouchers':
                return (
                    <NewAdminVoucherView 
                        theaterVouchers={config.theaterVouchers}
                        onCreateVoucher={(voucher) => {
                            const newVoucher = { ...voucher, id: Date.now().toString() };
                            const updatedConfig = {
                                ...config,
                                theaterVouchers: [...config.theaterVouchers, newVoucher]
                            };
                            setConfig(updatedConfig);
                            addToast(`✅ Theaterbon ${newVoucher.code} aangemaakt`, 'success');
                        }}
                        onExtendVoucher={(voucherId, months) => {
                            const updatedConfig = {
                                ...config,
                                theaterVouchers: config.theaterVouchers.map(v => 
                                    v.id === voucherId ? extendVoucherExpiry(v, months) : v
                                )
                            };
                            setConfig(updatedConfig);
                            addToast(`📅 Theaterbon verlengd met ${months} maanden`, 'success');
                        }}
                        onUpdateVoucher={(updatedVoucher) => {
                            const updatedConfig = {
                                ...config,
                                theaterVouchers: config.theaterVouchers.map(v => 
                                    v.id === updatedVoucher.id ? updatedVoucher : v
                                )
                            };
                            setConfig(updatedConfig);
                            addToast('✅ Theaterbon bijgewerkt', 'success');
                        }}
                        onDeleteVoucher={(voucherId) => {
                            const updatedConfig = {
                                ...config,
                                theaterVouchers: config.theaterVouchers.filter(v => v.id !== voucherId)
                            };
                            setConfig(updatedConfig);
                            addToast(`🗑️ Theaterbon verwijderd`, 'success');
                        }}
                    />
                );
            case 'reports':
                return <AdminReportsView reservations={reservations} showEvents={showEvents} config={config} />;
            case 'capacity':
                return (
                    <NewAdminCapacityView 
                        showEvents={showEvents} 
                        guestCountMap={guestCountMap} 
                        onUpdateShowCapacity={onUpdateShowCapacity}
                        onAddExternalBooking={onAddExternalBooking}
                    />
                );
            case 'settings':
                return (
                     <>
                        <div className="content-header"><h2>{i18n.settings}</h2></div>
                        <SettingsView config={config} setConfig={setConfig} events={showEvents} setEvents={onUpdateShowEvents} />
                     </>
                );
            default: 
                console.log('❌ FALLBACK: Rendering PremiumDashboard (default case)');
                console.log('- Unexpected adminView:', adminView);
                return (
                    <PremiumDashboard 
                        config={config} 
                        i18n={i18n}
                        showEvents={showEvents}
                        reservations={reservations}
                        waitingList={waitingList}
                        onNavigate={(view, date) => {
                            setAdminView(view as AdminView);
                        }}
                    />
                );
        }
    }

    return (
        <div className="admin-layout">
            <AdminSidebar activeView={adminView} setActiveView={setAdminView} />
            <main className="admin-content">
                {renderAdminContent()}
            </main>
            {editingReservation && editingShowEvent && (
                <EditReservationModal
                    reservation={editingReservation}
                    show={editingShowEvent}
                    onClose={() => setEditingReservation(null)}
                    onSave={handleSaveReservation}
                />
            )}
        </div>
    );
};

const SvgDefs = () => (
    <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg">
      <symbol id="icon-logo" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></symbol>
      <symbol id="icon-chevron-left" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></symbol>
      <symbol id="icon-chevron-right" viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></symbol>
      <symbol id="icon-chevron-down" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></symbol>
      <symbol id="icon-chevron-up" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></symbol>
      <symbol id="icon-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></symbol>
      <symbol id="icon-add" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></symbol>
      <symbol id="icon-remove" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></symbol>
      <symbol id="icon-calendar" viewBox="0 0 24 24"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></symbol>
      <symbol id="icon-users" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></symbol>
      <symbol id="icon-check" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></symbol>
      <symbol id="icon-check-circle" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></symbol>
      <symbol id="icon-info" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></symbol>
      <symbol id="icon-sparkle" viewBox="0 0 24 24"><path d="M12 2.5l1.55 4.75h5.01l-4.05 2.94 1.55 4.75L12 11.25l-4.05 2.94 1.55-4.75-4.05-2.94h5.01L12 2.5z"/></symbol>
      <symbol id="icon-loader" viewBox="0 0 24 24"><path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/></symbol>
      <symbol id="icon-trash" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></symbol>
      <symbol id="icon-archive" viewBox="0 0 24 24"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.81.97H5.43l.81-.97zM5 19V8h14v11H5zm3-5h8v-2H8v2z"/></symbol>
      <symbol id="icon-restore" viewBox="0 0 24 24"><path d="M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-2-9c-4.97 0-9 4.03-9 9H0l4 4 4-4H5c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.51 0-2.91-.46-4.08-1.25l-1.47 1.47C8.04 19.8 9.94 20.5 12 20.5c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/></symbol>
      <symbol id="icon-dashboard" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></symbol>
      <symbol id="icon-calendar-day" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM5 7V5h14v2H5zm2 4h2v2H7v-2z"/></symbol>
      <symbol id="icon-receipt" viewBox="0 0 24 24"><path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20zM5 4.04L6.53 3l1.44 1.53L9.43 3l1.44 1.53L12.33 3l1.44 1.53L15.23 3l1.44 1.53L18.13 3l1.87 1.96V19.96l-1.87-1.96L16.77 19l-1.44-1.53L13.87 19l-1.44-1.53L10.97 19l-1.44-1.53L8.07 19l-1.44-1.53L5.17 19l-2.17-2.17V4.04z"/></symbol>
      <symbol id="icon-settings" viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></symbol>
      <symbol id="icon-lock" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></symbol>
      <symbol id="icon-arrow-left" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></symbol>
      <symbol id="icon-search" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></symbol>
      <symbol id="icon-edit" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></symbol>
      <symbol id="icon-print" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></symbol>
      <symbol id="icon-dollar" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-.9.6-1.5 1.7-1.5 1.2 0 1.6.6 1.8 1.3l2.1-.8c-.3-1.5-1.5-2.7-3.5-2.7-2.1 0-3.8 1.4-3.8 3.4 0 2.4 1.9 3.2 3.8 3.7 2.1.5 2.8 1.2 2.8 2.2 0 1.1-.8 1.6-1.9 1.6-1.4 0-2-.8-2.2-1.4l-2.2.8c.4 1.9 1.8 3 3.9 3 2.3 0 4.1-1.3 4.1-3.5 0-2.7-1.8-3.5-4-4z"/></symbol>
      <symbol id="icon-tag" viewBox="0 0 24 24"><path d="M20 12V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6l-4-4 4-4zM4 6h12v12H4V6zm8 2c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></symbol>
      <symbol id="icon-chart" viewBox="0 0 24 24"><path d="M5 9.2h3V19H5zM10.6 5h3v14h-3zm5.6 8h3v6h-3z"/></symbol>
      <symbol id="icon-capacity" viewBox="0 0 24 24"><path d="M3 19h18v2H3v-2zm10-5.82V3h-2v10.18L4.29 14.9 3.5 14l8.5 5 8.5-5-.79.9-6.71-1.72z"/></symbol>
      <symbol id="icon-show" viewBox="0 0 24 24"><path d="M18 4v5H6V4H4v7h16V4h-2zm-1.5 15h-9c-.83 0-1.5-.67-1.5-1.5V13h12v4.5c0 .83-.67 1.5-1.5 1.5zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></symbol>
      <symbol id="icon-alert-triangle" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></symbol>
      <symbol id="icon-clock" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></symbol>
      <symbol id="icon-plus" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></symbol>
      <symbol id="icon-trending-up" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></symbol>
      <symbol id="icon-trending-down" viewBox="0 0 24 24"><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"/></symbol>
      <symbol id="icon-analytics" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></symbol>
      <symbol id="icon-external-link" viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></symbol>
      <symbol id="icon-flag" viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></symbol>
      <symbol id="icon-calendar-week" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/></symbol>
      <symbol id="icon-gift" viewBox="0 0 24 24"><path d="M20 6h-2.6c.4-.8.6-1.8.6-3 0-1.7-1.3-3-3-3-.8 0-1.5.3-2 .8-.4-.5-1.2-.8-2-.8-1.7 0-3 1.3-3 3 0 1.2.2 2.2.6 3H4c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2zm-5-4c.6 0 1 .4 1 1s-.4 1-1 1h-1V3c0-.6.4-1 1-1zM9 3c0-.6.4-1 1-1s1 .4 1 1v1H9c-.6 0-1-.4-1-1zm3 15H6v-6h6v6zm0-8H4V8h8v2zm2 8v-6h6v6h-6zm6-8h-8V8h8v2z"/></symbol>
      <symbol id="icon-theater" viewBox="0 0 24 24"><path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/></symbol>
      <symbol id="icon-star" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></symbol>
      <symbol id="icon-euro" viewBox="0 0 24 24"><path d="M15 18.5A6.48 6.48 0 0 1 9.24 15H15v-2H8.58c-.05-.33-.08-.66-.08-1s.03-.67.08-1H15V9H9.24A6.48 6.48 0 0 1 15 5.5c1.61 0 3.09.59 4.23 1.57L21 5.3A8.96 8.96 0 0 0 15 3.5C10.8 3.5 7.27 6.46 6.44 10.5H4v1h2.44c0 .34.02.67.06 1H4v1h2.5c.83 4.04 4.36 7 8.5 7 2.24 0 4.31-.86 5.88-2.27L19.12 16.43A6.481 6.481 0 0 1 15 18.5z"/></symbol>
      <symbol id="icon-coffee" viewBox="0 0 24 24"><path d="M2 21V19H20V21H2M20 8V5L18 3H6L4 5V8C4 10.21 5.79 12 8 12H16C18.21 12 20 10.21 20 8M20 8H21C21.55 8 22 8.45 22 9V11C22 11.55 21.55 12 21 12H20V8M13 2V4H11V2H13Z"/></symbol>
      <symbol id="icon-help-circle" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></symbol>
    </svg>
  );

// Loading Spinner Component
const LoadingSpinner = ({ size = '24', className = '' }: { size?: string, className?: string }) => (
    <div className={`loading-spinner ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
        <div className="spinner-ring"></div>
    </div>
);

// Loading Button Component
const LoadingButton = ({ loading, children, ...props }: { loading: boolean, children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} disabled={loading || props.disabled}>
        {loading ? <LoadingSpinner size="16" /> : children}
    </button>
);

// Simple Error Boundary with try-catch wrapper
const withErrorBoundary = <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P) => {
        try {
            return <Component {...props} />;
        } catch (error) {
            return (
                <div className="error-boundary">
                    <h2>Er is iets misgegaan</h2>
                    <p>Probeer de pagina te vernieuwen of neem contact op met de beheerder.</p>
                    <button onClick={() => window.location.reload()} className="submit-btn">
                        Pagina Vernieuwen
                    </button>
                </div>
            );
        }
    };
};

// 📅 Schedule View Component voor Personeelsschema
const ScheduleView = ({ showEvents, internalEvents, onAddInternalEvent, onUpdateInternalEvent, onDeleteInternalEvent, config, reservations }: {
    showEvents: ShowEvent[];
    internalEvents: InternalEvent[];
    onAddInternalEvent: (event: Omit<InternalEvent, 'id'>) => void;
    onUpdateInternalEvent: (event: InternalEvent) => void;
    onDeleteInternalEvent: (id: string) => void;
    config: AppConfig;
    reservations?: Reservation[];
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [showAddEventModal, setShowAddEventModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [editingEvent, setEditingEvent] = useState<InternalEvent | null>(null);

    // Get current week dates
    const getWeekDates = (date: Date) => {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);
            weekDates.push(currentDate);
        }
        return weekDates;
    };

    const weekDates = getWeekDates(currentDate);
    
    // Internal event types met theater kleuren
    const internalEventTypes = [
        { type: 'repetitie' as const, label: 'Repetitie', color: 'var(--kleur-accent)' },
        { type: 'besloten-feest' as const, label: 'Besloten Feest', color: 'var(--kleur-secundair)' },
        { type: 'teammeeting' as const, label: 'Team Meeting', color: 'var(--kleur-primair)' },
        { type: 'schoonmaak' as const, label: 'Schoonmaak', color: 'var(--kleur-secundair-licht)' }
    ];

    // Get events for a specific date
    const getEventsForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        
        const publicShows = showEvents
            .filter(event => event.date === dateStr)
            .map(event => {
                // Gebruik custom tijden van event of fallback naar showType defaults
                const showType = config?.showTypes?.find(type => type.name === event.type);
                const startTime = event.startTime || showType?.defaultStartTime || '19:30';
                const endTime = event.endTime || showType?.defaultEndTime || '22:30';
                
                return {
                    ...event,
                    isPublic: true,
                    startTime,
                    endTime
                };
            });

        const internalEventsForDate = internalEvents
            .filter(event => event.date === dateStr)
            .map(event => ({
                ...event,
                isPublic: false
            }));

        return { publicShows, internalEvents: internalEventsForDate };
    };

    return (
        <div className="schedule-view">
            {/* Schedule Header */}
            <div className="schedule-header">
                <div className="schedule-title-section">
                    <h2 className="schedule-main-title">🎭 Personeelsplanning & Schema's</h2>
                    <p className="schedule-subtitle">Beheer interne events en print professionele planning overzichten</p>
                </div>
                
                <div className="schedule-controls">
                    <div className="view-controls">
                        <button 
                            className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
                            onClick={() => setViewMode('week')}
                        >
                            📅 Week
                        </button>
                    </div>
                    
                    <div className="date-navigation">
                        <button 
                            className="nav-btn"
                            onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
                        >
                            ◀ Vorige Week
                        </button>
                        <span className="current-period">
                            {weekDates[0]?.toLocaleDateString('nl-NL')} - {weekDates[6]?.toLocaleDateString('nl-NL')}
                        </span>
                        <button 
                            className="nav-btn"
                            onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
                        >
                            Volgende Week ▶
                        </button>
                    </div>

                    <div className="schedule-actions">
                        <button 
                            className="btn-primary"
                            onClick={() => {
                                setSelectedDate(new Date().toISOString().split('T')[0]);
                                setShowAddEventModal(true);
                            }}
                        >
                            ➕ Intern Event
                        </button>
                        <button className="btn-secondary" onClick={() => setShowPrintModal(true)}>
                            🖨️ Print Schema
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="schedule-legend">
                    <div className="legend-item public">
                        <span className="legend-color public-show"></span>
                        Publieke Shows
                    </div>
                    {internalEventTypes.map(type => (
                        <div key={type.type} className="legend-item">
                            <span className="legend-color" style={{backgroundColor: type.color}}></span>
                            {type.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Schedule Grid */}
            <div className="schedule-grid">
                {weekDates.map(date => {
                    const { publicShows, internalEvents: internals } = getEventsForDate(date);
                    const dateStr = date.toISOString().split('T')[0];
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    
                    return (
                        <div key={dateStr} className={`schedule-day ${isToday ? 'today' : ''}`}>
                            <div className="day-header">
                                <div className="day-name">
                                    {date.toLocaleDateString('nl-NL', { weekday: 'short' })}
                                </div>
                                <div className="day-date">{date.getDate()}</div>
                                <button 
                                    className="add-event-btn"
                                    onClick={() => {
                                        setSelectedDate(dateStr);
                                        setShowAddEventModal(true);
                                    }}
                                    title="Voeg intern event toe"
                                >
                                    +
                                </button>
                            </div>
                            
                            <div className="day-events">
                                {/* Public Shows */}
                                {publicShows.map(show => (
                                    <div key={show.id} className="event public-show">
                                        <div className="event-time">{show.startTime} - {show.endTime}</div>
                                        <div className="event-title">{show.name}</div>
                                        <div className="event-type">{show.type}</div>
                                    </div>
                                ))}
                                
                                {/* Internal Events */}
                                {internals.map(event => {
                                    const eventType = internalEventTypes.find(t => t.type === event.type);
                                    return (
                                        <div 
                                            key={event.id} 
                                            className="event internal-event"
                                            style={{ borderLeftColor: eventType?.color }}
                                            onClick={() => setEditingEvent(event)}
                                            title="Klik om te bewerken"
                                        >
                                            <div className="event-time">{event.startTime}</div>
                                            <div className="event-title">{event.title}</div>
                                            <div className="event-type">{eventType?.label}</div>
                                            {event.notes && <div className="event-notes">{event.notes}</div>}
                                        </div>
                                    );
                                })}
                                
                                {/* Empty state */}
                                {publicShows.length === 0 && internals.length === 0 && (
                                    <div className="empty-day">Geen events</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add/Edit Internal Event Modal */}
            {(showAddEventModal || editingEvent) && (
                <InternalEventModal
                    event={editingEvent}
                    selectedDate={selectedDate}
                    internalEventTypes={internalEventTypes}
                    onSave={(event) => {
                        if (editingEvent) {
                            onUpdateInternalEvent(event as InternalEvent);
                        } else {
                            onAddInternalEvent(event);
                        }
                        setShowAddEventModal(false);
                        setEditingEvent(null);
                    }}
                    onDelete={editingEvent ? () => {
                        onDeleteInternalEvent(editingEvent.id);
                        setEditingEvent(null);
                    } : undefined}
                    onClose={() => {
                        setShowAddEventModal(false);
                        setEditingEvent(null);
                    }}
                />
            )}

            {/* Print Modal */}
            {showPrintModal && (
                <SchedulePrintModal
                    showEvents={showEvents}
                    internalEvents={internalEvents}
                    reservations={reservations || []}
                    config={config}
                    onClose={() => setShowPrintModal(false)}
                />
            )}
        </div>
    );
};

// Internal Event Modal Component
const InternalEventModal = ({ event, selectedDate, internalEventTypes, onSave, onDelete, onClose }: {
    event?: InternalEvent | null;
    selectedDate: string;
    internalEventTypes: Array<{ type: InternalEvent['type']; label: string; color: string }>;
    onSave: (event: Omit<InternalEvent, 'id'> | InternalEvent) => void;
    onDelete?: () => void;
    onClose: () => void;
}) => {
    const [formData, setFormData] = useState({
        date: selectedDate || new Date().toISOString().split('T')[0],
        type: 'repetitie' as InternalEvent['type'],
        title: '',
        startTime: '10:00',
        endTime: '12:00',
        notes: '',
        assignedStaff: [] as string[]
    });

    useEffect(() => {
        if (event) {
            setFormData({
                date: event.date,
                type: event.type,
                title: event.title,
                startTime: event.startTime,
                endTime: event.endTime,
                notes: event.notes || '',
                assignedStaff: event.assignedStaff || []
            });
        }
    }, [event]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation: End time should be after start time
        if (formData.endTime <= formData.startTime) {
            alert('Eindtijd moet na de starttijd zijn!');
            return;
        }
        
        if (event) {
            onSave({ ...event, ...formData });
        } else {
            onSave(formData);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content schedule-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🎭 {event ? 'Bewerk' : 'Nieuw'} Intern Event</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="internal-event-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>📅 Datum</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>🏷️ Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as InternalEvent['type'] }))}
                                required
                            >
                                {internalEventTypes.map(type => (
                                    <option key={type.type} value={type.type}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>📝 Titel</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Bijv. Repetitie Act 1, Privé feest familie Van der Berg..."
                            required
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>🕐 Start Tijd</label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>🕕 Eind Tijd</label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>📋 Notities (optioneel)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Extra informatie: aantal personen, speciale vereisten, contactgegevens..."
                            rows={3}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>👥 Toegewezen Personeel (optioneel)</label>
                        <input
                            type="text"
                            value={formData.assignedStaff.join(', ')}
                            onChange={(e) => {
                                const staff = e.target.value.split(',').map(name => name.trim()).filter(name => name.length > 0);
                                setFormData(prev => ({ ...prev, assignedStaff: staff }));
                            }}
                            placeholder="bv. Jan, Marie, Peter"
                        />
                        <small className="form-help-text">Scheidt namen met komma's. Laat leeg als niet van toepassing.</small>
                    </div>
                    
                    <div className="modal-actions">
                        {onDelete && (
                            <button type="button" className="btn-danger" onClick={onDelete}>
                                🗑️ Verwijder
                            </button>
                        )}
                        <div className="action-buttons">
                            <button type="button" className="btn-secondary" onClick={onClose}>
                                Annuleer
                            </button>
                            <button type="submit" className="btn-primary">
                                {event ? '💾 Bijwerken' : '➕ Toevoegen'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// 🖨️ Schedule Print Modal Component
const SchedulePrintModal = ({ showEvents, internalEvents, reservations, config, onClose }: {
    showEvents: ShowEvent[];
    internalEvents: InternalEvent[];
    reservations: Reservation[];
    config: AppConfig;
    onClose: () => void;
}) => {
    const [printOptions, setPrintOptions] = useState<SchedulePrintOptions>({
        period: 'week',
        format: 'detailed',
        includePublicShows: true,
        includeInternalEvents: true,
        includeNotes: true,
        startDate: new Date().toISOString().split('T')[0],
        endDate: (() => {
            const date = new Date();
            date.setDate(date.getDate() + 7);
            return date.toISOString().split('T')[0];
        })()
    });

    const handlePeriodChange = (period: 'custom' | 'week' | 'month' | 'all') => {
        const today = new Date();
        let startDate = today.toISOString().split('T')[0];
        let endDate = today.toISOString().split('T')[0];

        switch (period) {
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay() + 1);
                startDate = weekStart.toISOString().split('T')[0];
                
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                endDate = weekEnd.toISOString().split('T')[0];
                break;
                
            case 'month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
                break;
                
            case 'all':
                const allEvents = [...showEvents, ...internalEvents];
                if (allEvents.length > 0) {
                    const dates = allEvents.map(e => e.date).sort();
                    startDate = dates[0];
                    endDate = dates[dates.length - 1];
                }
                break;
        }

        setPrintOptions(prev => ({ ...prev, period, startDate, endDate }));
    };

    const generateManagementReport = () => {
        const filteredShows = showEvents.filter(show => 
            show.date >= printOptions.startDate && show.date <= printOptions.endDate
        );

        const reportData: ManagementReportData[] = filteredShows.map(show => {
            const showReservations = reservations.filter(r => r.date === show.date);
            const totalGuests = showReservations.reduce((sum, r) => sum + r.guests, 0);
            const totalRevenue = showReservations.reduce((sum, r) => sum + r.totalPrice, 0);
            const capacity = show.capacity || 220; // Default theater capacity
            
            return {
                showName: show.name,
                date: show.date,
                capacity: capacity,
                booked: totalGuests,
                available: capacity - totalGuests,
                occupancyRate: Math.round((totalGuests / capacity) * 100),
                revenue: totalRevenue,
                showType: show.type
            };
        });

        return reportData;
    };

    const handlePrint = () => {
        const printContent = generatePrintContent();
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    const handleExportCSV = () => {
        const reportData = generateManagementReport();
        const headers = ["Datum", "Show", "Type", "Capaciteit", "Geboekt", "Bezetting (%)", "Omzet (€)"];
        const rows = reportData.map(show => 
            [
                new Date(show.date + 'T12:00:00').toLocaleDateString('nl-NL'),
                show.showName,
                show.showType,
                show.capacity,
                show.booked,
                show.occupancyRate,
                show.revenue.toFixed(2)
            ].join(',')
        );

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `management_rapport_${printOptions.startDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generatePrintContent = () => {
        if (printOptions.format === 'management') {
            return generateManagementPrintContent();
        } else if (printOptions.format === 'compact') {
            return generateCompactPrintContent();
        } else {
            return generateDetailedPrintContent();
        }
    };

    const generateDetailedPrintContent = () => {
        const filteredShows = printOptions.includePublicShows ? 
            showEvents.filter(show => show.date >= printOptions.startDate && show.date <= printOptions.endDate) : [];
        
        const filteredInternals = printOptions.includeInternalEvents ?
            internalEvents.filter(event => event.date >= printOptions.startDate && event.date <= printOptions.endDate) : [];

        const getAllDates = () => {
            const allDates = new Set<string>();
            filteredShows.forEach(show => allDates.add(show.date));
            filteredInternals.forEach(event => allDates.add(event.date));
            return Array.from(allDates).sort();
        };

        const dates = getAllDates();

        return `
            <html>
                <head>
                    <title>Personeelsschema - ${new Date(printOptions.startDate).toLocaleDateString('nl-NL')} t/m ${new Date(printOptions.endDate).toLocaleDateString('nl-NL')}</title>
                    <style>
                        @media print { @page { size: A4; margin: 15mm; } }
                        body { font-family: Arial, sans-serif; margin: 0; font-size: 12px; }
                        .header { text-align: center; margin-bottom: 25px; page-break-inside: avoid; }
                        .header h1 { margin: 0 0 10px 0; color: #333; }
                        .schedule-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        .schedule-table th, .schedule-table td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
                        .schedule-table th { background-color: #f5f5f5; font-weight: bold; font-size: 11px; }
                        .public-show { background-color: #e3f2fd; padding: 6px; margin: 3px 0; border-radius: 3px; }
                        .internal-event { background-color: #f3e5f5; padding: 6px; margin: 3px 0; border-radius: 3px; }
                        .event-time { font-weight: bold; color: #333; font-size: 11px; }
                        .event-title { font-size: 12px; margin-bottom: 2px; }
                        .event-notes { font-size: 10px; color: #666; font-style: italic; }
                        .event-staff { font-size: 10px; color: #555; margin-top: 2px; font-weight: 500; }
                        .no-events { color: #999; font-style: italic; font-size: 11px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>🎭 Personeelsschema (Gedetailleerd)</h1>
                        <p><strong>Periode:</strong> ${new Date(printOptions.startDate).toLocaleDateString('nl-NL')} t/m ${new Date(printOptions.endDate).toLocaleDateString('nl-NL')}</p>
                        <p><small>Gegenereerd: ${new Date().toLocaleDateString('nl-NL')} om ${new Date().toLocaleTimeString('nl-NL')}</small></p>
                    </div>
                    <table class="schedule-table">
                        <thead>
                            <tr>
                                <th style="width: 15%">Datum</th>
                                <th style="width: 42.5%">Publieke Shows</th>
                                <th style="width: 42.5%">Interne Events</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dates.map(date => {
                                const dateShows = filteredShows.filter(show => show.date === date);
                                const dateInternals = filteredInternals.filter(event => event.date === date);
                                const dateObj = new Date(date + 'T12:00:00');
                                
                                return `
                                    <tr>
                                        <td>
                                            <strong>${dateObj.toLocaleDateString('nl-NL')}</strong><br>
                                            <small>${dateObj.toLocaleDateString('nl-NL', { weekday: 'long' })}</small>
                                        </td>
                                        <td>
                                            ${dateShows.length > 0 ? dateShows.map(show => `
                                                <div class="public-show">
                                                    <div class="event-title"><strong>${show.name}</strong></div>
                                                    <div class="event-time">19:30 - 22:00</div>
                                                    <div style="font-size: 10px;">Type: ${show.type}</div>
                                                </div>
                                            `).join('') : '<span class="no-events">Geen shows</span>'}
                                        </td>
                                        <td>
                                            ${dateInternals.length > 0 ? dateInternals.map(event => `
                                                <div class="internal-event">
                                                    <div class="event-title"><strong>${event.title}</strong></div>
                                                    <div class="event-time">${event.startTime} - ${event.endTime}</div>
                                                    <div style="font-size: 10px;">Type: ${event.type.replace('-', ' ')}</div>
                                                    ${event.assignedStaff && event.assignedStaff.length > 0 ? `
                                                        <div class="event-staff" style="font-size: 10px; color: #555; margin-top: 2px;">
                                                            <strong>Team:</strong> ${event.assignedStaff.join(', ')}
                                                        </div>
                                                    ` : ''}
                                                    ${printOptions.includeNotes && event.notes ? `<div class="event-notes">${event.notes}</div>` : ''}
                                                </div>
                                            `).join('') : '<span class="no-events">Geen events</span>'}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;
    };

    const generateCompactPrintContent = () => {
        const filteredShows = printOptions.includePublicShows ? 
            showEvents.filter(show => show.date >= printOptions.startDate && show.date <= printOptions.endDate) : [];
        
        const filteredInternals = printOptions.includeInternalEvents ?
            internalEvents.filter(event => event.date >= printOptions.startDate && event.date <= printOptions.endDate) : [];

        const getAllDates = () => {
            const allDates = new Set<string>();
            filteredShows.forEach(show => allDates.add(show.date));
            filteredInternals.forEach(event => allDates.add(event.date));
            return Array.from(allDates).sort();
        };

        const dates = getAllDates();

        return `
            <html>
                <head>
                    <title>Personeelsschema Compact - ${new Date(printOptions.startDate).toLocaleDateString('nl-NL')} t/m ${new Date(printOptions.endDate).toLocaleDateString('nl-NL')}</title>
                    <style>
                        @media print { @page { size: A4; margin: 10mm; } }
                        body { font-family: Arial, sans-serif; margin: 0; font-size: 9px; line-height: 1.3; }
                        .header { text-align: center; margin-bottom: 15px; }
                        .header h1 { margin: 0 0 5px 0; font-size: 14px; }
                        .compact-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                        .date-block { border: 1px solid #ccc; padding: 8px; break-inside: avoid; }
                        .date-header { font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-bottom: 5px; font-size: 10px; }
                        .event-item { margin-bottom: 3px; padding: 2px; border-left: 3px solid; padding-left: 5px; }
                        .public-event { border-left-color: #A00000; }
                        .internal-event { border-left-color: #FFD700; }
                        .event-title { font-weight: 600; font-size: 9px; }
                        .event-time { color: #666; font-size: 8px; }
                        .event-staff { color: #555; font-size: 7px; font-weight: 500; }
                        .eco-note { text-align: center; margin-top: 20px; font-size: 8px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>🌱 Compact Personeelsschema</h1>
                        <p style="font-size: 10px;">${new Date(printOptions.startDate).toLocaleDateString('nl-NL')} t/m ${new Date(printOptions.endDate).toLocaleDateString('nl-NL')}</p>
                    </div>
                    <div class="compact-grid">
                        ${dates.map(date => {
                            const dateShows = filteredShows.filter(show => show.date === date);
                            const dateInternals = filteredInternals.filter(event => event.date === date);
                            const dateObj = new Date(date + 'T12:00:00');
                            
                            return `
                                <div class="date-block">
                                    <div class="date-header">
                                        ${dateObj.toLocaleDateString('nl-NL')} - ${dateObj.toLocaleDateString('nl-NL', { weekday: 'short' })}
                                    </div>
                                    ${dateShows.map(show => {
                                        const showType = config.showTypes.find(type => type.name === show.type);
                                        const showTime = show.startTime || showType?.defaultStartTime || '19:30';
                                        return `
                                        <div class="event-item public-event">
                                            <div class="event-title">${show.name}</div>
                                            <div class="event-time">${showTime} | ${show.type}</div>
                                        </div>`
                                    }).join('')}
                                    ${dateInternals.map(event => `
                                        <div class="event-item internal-event">
                                            <div class="event-title">${event.title}</div>
                                            <div class="event-time">${event.startTime} | ${event.type.replace('-', ' ')}</div>
                                            ${event.assignedStaff && event.assignedStaff.length > 0 ? `
                                                <div class="event-staff">Team: ${event.assignedStaff.join(', ')}</div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                    ${dateShows.length === 0 && dateInternals.length === 0 ? '<div style="color: #999; font-style: italic;">Geen events</div>' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="eco-note">🌱 Eco-vriendelijke compacte weergave - Minder papierverbruik</div>
                </body>
            </html>
        `;
    };

    const generateManagementPrintContent = () => {
        const reportData = generateManagementReport();
        const totalRevenue = reportData.reduce((sum, show) => sum + show.revenue, 0);
        const totalGuests = reportData.reduce((sum, show) => sum + show.booked, 0);
        const avgOccupancy = reportData.length > 0 ? Math.round(reportData.reduce((sum, show) => sum + show.occupancyRate, 0) / reportData.length) : 0;

        const topShows = [...reportData].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
        const bestOccupancy = [...reportData].sort((a, b) => b.occupancyRate - a.occupancyRate).slice(0, 3);

        return `
            <html>
                <head>
                    <title>Management Rapport - ${new Date(printOptions.startDate).toLocaleDateString('nl-NL')} t/m ${new Date(printOptions.endDate).toLocaleDateString('nl-NL')}</title>
                    <style>
                        @media print { @page { size: A4; margin: 15mm; } }
                        body { font-family: Arial, sans-serif; margin: 0; font-size: 11px; }
                        .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px; }
                        .kpi-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
                        .kpi-box { border: 1px solid #ddd; padding: 15px; text-align: center; background: #f9f9f9; }
                        .kpi-value { font-size: 24px; font-weight: bold; color: #333; }
                        .kpi-label { font-size: 12px; color: #666; margin-top: 5px; }
                        .report-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        .report-table th, .report-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        .report-table th { background-color: #333; color: white; font-size: 10px; }
                        .occupancy-bar { background: #f0f0f0; height: 12px; border-radius: 6px; overflow: hidden; }
                        .occupancy-fill { background: linear-gradient(90deg, #32CD32, #FFD700); height: 100%; }
                        .insights-section { margin-top: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                        .insight-box { border: 1px solid #ddd; padding: 15px; }
                        .insight-title { font-weight: bold; margin-bottom: 10px; color: #333; }
                        .insight-item { margin-bottom: 8px; font-size: 10px; }
                        .revenue-high { color: #059669; font-weight: bold; }
                        .revenue-low { color: #dc2626; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>📊 Management Rapport</h1>
                        <p><strong>Periode:</strong> ${new Date(printOptions.startDate).toLocaleDateString('nl-NL')} t/m ${new Date(printOptions.endDate).toLocaleDateString('nl-NL')}</p>
                        <p><small>Gegenereerd: ${new Date().toLocaleDateString('nl-NL')} om ${new Date().toLocaleTimeString('nl-NL')}</small></p>
                    </div>

                    <div class="kpi-section">
                        <div class="kpi-box">
                            <div class="kpi-value">€${totalRevenue.toLocaleString('nl-NL')}</div>
                            <div class="kpi-label">Totale Omzet</div>
                        </div>
                        <div class="kpi-box">
                            <div class="kpi-value">${totalGuests}</div>
                            <div class="kpi-label">Totaal Gasten</div>
                        </div>
                        <div class="kpi-box">
                            <div class="kpi-value">${avgOccupancy}%</div>
                            <div class="kpi-label">Gemiddelde Bezetting</div>
                        </div>
                    </div>

                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Datum</th>
                                <th>Show</th>
                                <th>Type</th>
                                <th>Capaciteit</th>
                                <th>Geboekt</th>
                                <th>Bezetting</th>
                                <th>Omzet</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportData.map(show => `
                                <tr style="${show.occupancyRate > 90 ? 'background-color: #e8f5e9;' : show.occupancyRate < 30 ? 'background-color: #ffeaa7;' : ''}">
                                    <td>${new Date(show.date + 'T12:00:00').toLocaleDateString('nl-NL')}</td>
                                    <td><strong>${show.showName}</strong></td>
                                    <td>${show.showType}</td>
                                    <td style="text-align: center;">${show.capacity}</td>
                                    <td style="text-align: center;">${show.booked}</td>
                                    <td>
                                        <div class="occupancy-bar" style="background-color: #e0e0e0; border-radius: 4px; overflow: hidden; height: 16px; position: relative;">
                                            <div class="occupancy-fill" style="width: ${show.occupancyRate}%; background-color: ${show.occupancyRate > 90 ? '#4CAF50' : show.occupancyRate > 70 ? '#FFC107' : show.occupancyRate > 40 ? '#FF9800' : '#f44336'}; height: 100%; transition: width 0.3s ease;"></div>
                                            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; color: white; text-shadow: 1px 1px 1px rgba(0,0,0,0.5);">
                                                ${show.occupancyRate}%
                                            </div>
                                        </div>
                                    </td>
                                    <td class="${show.revenue > 500 ? 'revenue-high' : show.revenue < 200 ? 'revenue-low' : ''}" style="text-align: right;">
                                        €${show.revenue.toLocaleString('nl-NL')}
                                        ${show.revenue > 750 ? ' 💰' : show.revenue < 150 ? ' ⚠️' : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="insights-section">
                        <div class="insight-box">
                            <div class="insight-title">🏆 Top 5 Shows (Omzet)</div>
                            ${topShows.map((show, i) => `
                                <div class="insight-item">
                                    ${i + 1}. <strong>${show.showName}</strong> - €${show.revenue.toLocaleString('nl-NL')}
                                </div>
                            `).join('')}
                        </div>
                        <div class="insight-box">
                            <div class="insight-title">📈 Beste Bezettingsgraden</div>
                            ${bestOccupancy.map((show, i) => `
                                <div class="insight-item">
                                    ${i + 1}. <strong>${show.showName}</strong> - ${show.occupancyRate}% (${show.booked}/${show.capacity})
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </body>
            </html>
        `;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content schedule-modal print-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🖨️ Print Opties</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="print-options-form">
                    <div className="form-section">
                        <label className="section-label">📅 Periode</label>
                        <div className="period-options">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="period"
                                    value="week"
                                    checked={printOptions.period === 'week'}
                                    onChange={(e) => handlePeriodChange(e.target.value as any)}
                                />
                                Deze Week
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="period"
                                    value="month"
                                    checked={printOptions.period === 'month'}
                                    onChange={(e) => handlePeriodChange(e.target.value as any)}
                                />
                                Deze Maand
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="period"
                                    value="all"
                                    checked={printOptions.period === 'all'}
                                    onChange={(e) => handlePeriodChange(e.target.value as any)}
                                />
                                Alle Shows
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="period"
                                    value="custom"
                                    checked={printOptions.period === 'custom'}
                                    onChange={(e) => handlePeriodChange(e.target.value as any)}
                                />
                                Aangepast Bereik
                            </label>
                        </div>
                        
                        {printOptions.period === 'custom' && (
                            <div className="date-range">
                                <div className="form-group">
                                    <label>Van Datum</label>
                                    <input
                                        type="date"
                                        value={printOptions.startDate}
                                        onChange={(e) => setPrintOptions(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tot Datum</label>
                                    <input
                                        type="date"
                                        value={printOptions.endDate}
                                        onChange={(e) => setPrintOptions(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-section">
                        <label className="section-label">📄 Print Formaat</label>
                        <div className="format-options">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="format"
                                    value="detailed"
                                    checked={printOptions.format === 'detailed'}
                                    onChange={(e) => setPrintOptions(prev => ({ ...prev, format: e.target.value as any }))}
                                />
                                <div>
                                    <strong>Gedetailleerd Schema</strong>
                                    <small>Volledige informatie, professionele lay-out</small>
                                </div>
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="format"
                                    value="compact"
                                    checked={printOptions.format === 'compact'}
                                    onChange={(e) => setPrintOptions(prev => ({ ...prev, format: e.target.value as any }))}
                                />
                                <div>
                                    <strong>🌱 Compact Schema (Eco)</strong>
                                    <small>Minder papierverbruik, essentiële info</small>
                                </div>
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="format"
                                    value="management"
                                    checked={printOptions.format === 'management'}
                                    onChange={(e) => setPrintOptions(prev => ({ ...prev, format: e.target.value as any }))}
                                />
                                <div>
                                    <strong>📊 Management Rapport</strong>
                                    <small>Bezetting, omzet, KPI's voor directie</small>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="form-section">
                        <label className="section-label">📋 Inhoud</label>
                        <div className="content-options">
                            <label className="checkbox-option">
                                <input
                                    type="checkbox"
                                    checked={printOptions.includePublicShows}
                                    onChange={(e) => setPrintOptions(prev => ({ ...prev, includePublicShows: e.target.checked }))}
                                />
                                Publieke Shows
                            </label>
                            <label className="checkbox-option">
                                <input
                                    type="checkbox"
                                    checked={printOptions.includeInternalEvents}
                                    onChange={(e) => setPrintOptions(prev => ({ ...prev, includeInternalEvents: e.target.checked }))}
                                />
                                Interne Events
                            </label>
                            {printOptions.format !== 'management' && (
                                <label className="checkbox-option">
                                    <input
                                        type="checkbox"
                                        checked={printOptions.includeNotes}
                                        onChange={(e) => setPrintOptions(prev => ({ ...prev, includeNotes: e.target.checked }))}
                                    />
                                    Notities & Opmerkingen
                                </label>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="modal-actions">
                    <div className="action-buttons">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Annuleer
                        </button>
                        {printOptions.format === 'management' && (
                            <button type="button" className="btn-secondary" onClick={handleExportCSV}>
                                📊 Exporteer CSV
                            </button>
                        )}
                        <button type="button" className="btn-primary" onClick={handlePrint}>
                            🖨️ Printen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AppContent = () => {
    const [view, setView] = useState<View>('book');
    const [adminSession, setAdminSession] = useState(false); // Track active admin session
    
    // ✅ FIREBASE: Use real-time hooks instead of manual state management
    const { 
        shows: events, 
        addShow: firebaseAddShow,
        updateShow: firebaseUpdateShow,
        deleteShow: firebaseDeleteShow,
        loading: showsLoading 
    } = useShows();
    
    const { 
        reservations, 
        addReservation: firebaseAddReservation,
        updateReservation: firebaseUpdateReservation,
        deleteReservation: firebaseDeleteReservation,
        loading: reservationsLoading
    } = useReservations();
    
    const { 
        waitingList, 
        addToWaitingList: firebaseAddWaitingListEntry,
        loading: waitingListLoading
    } = useWaitingList();
    
    // ✅ FIREBASE: Internal events now use Firebase hooks instead of local state
    const { 
        internalEvents, 
        addInternalEvent: firebaseAddInternalEvent,
        updateInternalEvent: firebaseUpdateInternalEvent,
        deleteInternalEvent: firebaseDeleteInternalEvent
    } = useInternalEvents();
    
    const [config, setConfig] = useState<AppConfig>(defaultConfig);
    const loading = showsLoading || reservationsLoading || waitingListLoading;
    const { addToast } = useToast();
    const { isAdmin } = useAuth();

    // Beveiligde view setter - admin views alleen voor ingelogde admins
    const setViewSecure = useCallback((newView: View, bypassCheck = false) => {
        if (newView === 'admin' && !isAdmin && !bypassCheck) {
            addToast('⚠️ Admin toegang vereist. Log eerst in via de © knop linksonder.', 'warning');
            return;
        }
        
        // Als we naar admin gaan met bypass (na login), start admin session
        if (newView === 'admin' && bypassCheck) {
            setAdminSession(true);
            }
        
        // Als we weg gaan van admin, stop admin session
        if (view === 'admin' && newView !== 'admin') {
            setAdminSession(false);
            }
        
        setView(newView);
    }, [isAdmin, addToast, loading, adminSession, view]);

    // Auto-redirect alleen bij uitloggen (niet tijdens actieve admin session)
    useEffect(() => {
        // Alleen redirect als we in admin view zijn EN geen actieve admin session EN gebruiker is niet admin
        if (view === 'admin' && !adminSession && !isAdmin && !loading) {
            setView('book');
        }
    }, [isAdmin, view, loading, adminSession]);
    
    // ✅ Bulk operations handlers for AdminShowsManager (as useCallback after hooks)
    const handleBulkDeleteShows = useCallback(async (showIds: string[]) => {
        try {
            // Delete each show from Firebase using the Firebase hook
            for (const showId of showIds) {
                await firebaseDeleteShow(showId);
            }
            
            addToast(`${showIds.length} shows verwijderd`, 'success');
            
        } catch (error) {
            addToast('Er is een fout opgetreden bij het verwijderen van shows', 'error');
        }
    }, [firebaseDeleteShow, addToast]);

    const handleBulkOpenClose = useCallback(async (showIds: string[], action: 'open' | 'close') => {
        try {
            for (const showId of showIds) {
                const show = events.find(s => s.id === showId);
                if (show) {
                    const updatedShow = { ...show, isClosed: action === 'close' };
                    await firebaseUpdateShow(showId, updatedShow);
                }
            }
            addToast(`${showIds.length} shows ${action === 'open' ? 'geopend' : 'gesloten'}`, 'success');
        } catch (error) {
            addToast(`Er is een fout opgetreden bij het ${action === 'open' ? 'openen' : 'sluiten'} van shows`, 'error');
        }
    }, [events, firebaseUpdateShow, addToast]);
    
    // Function to reload config from Firebase (shows/reservations auto-update via hooks)
    const reloadFirebaseData = useCallback(async () => {
        try {
            const configData = await firebaseService.config.getConfig();
            
            if (configData) {
                setConfig(configData);
            }
            
        } catch (error) {
            addToast('Error reloading config from Firebase', 'error');
        }
    }, [addToast]);
    
    // Load config from Firebase when component mounts (shows/reservations auto-loaded via hooks)
    useEffect(() => {
        const loadConfig = async () => {
            try {
                // 🏗️ Initialize Firebase collections with sample data if empty
                await initializeFirebaseCollections();
                
                const configData = await firebaseService.config.getConfig();
                
                // Load config from Firebase or use default
                if (configData) {
                    // Migratie: upgrade bestaande promoCodes met nieuwe velden
                    let needsConfigUpdate = false;
                    const upgradedPromoCodes = configData.promoCodes.map(promo => {
                        // Controleer of de promo de nieuwe velden heeft
                        if (promo.description === undefined || promo.usageCount === undefined) {
                            needsConfigUpdate = true;
                            return {
                                ...promo,
                                description: promo.description || '',
                                usageCount: promo.usageCount || 0
                            };
                        }
                        return promo;
                    });
                    
                    if (needsConfigUpdate) {
                        const upgradedConfig = { ...configData, promoCodes: upgradedPromoCodes };
                        await firebaseService.config.updateConfig(upgradedConfig);
                        setConfig(upgradedConfig);
                    } else {
                        setConfig(configData);
                    }
                } else {
                    await firebaseService.config.initializeConfig(defaultConfig);
                    setConfig(defaultConfig);
                }
                
            } catch (error) {
                console.error('Error loading config:', error);
            }
        };
        
        loadConfig();
    }, []); // Empty dependency array - only run once on mount
    
    const guestCountMap = useMemo(() => {
        const map = new Map<string, number>();
        // Only count confirmed reservations for capacity calculations
        reservations.filter(r => r.status === 'confirmed').forEach(r => {
            map.set(r.date, (map.get(r.date) || 0) + r.guests);
        });
        return map;
    }, [reservations]);
    
    // Optimize callback functions with useCallback for better performance
    const handleAddEvent = useCallback(async (event: Omit<ShowEvent, 'id'>, dates: string[]) => {
        try {
            const newEvents = dates.map(date => ({
                ...event,
                id: `${event.name.toLowerCase().replace(/\s+/g, '-')}-${date}`,
                date
            }));
            
            // Save all events to Firebase
            const savedEvents = await Promise.all(
                newEvents.map(newEvent => firebaseService.shows.addShow(newEvent))
            );
            
            // ✅ NO LOCAL STATE - Reload data from Firebase instead
            await reloadFirebaseData();
            
            addToast(`${dates.length === 1 ? 'Show' : dates.length + ' shows'} succesvol toegevoegd!`, 'success');
        } catch (error) {
            addToast('Fout bij toevoegen van shows', 'error');
        }
    }, [addToast, reloadFirebaseData]);

    const handleDeleteEvent = useCallback(async (eventId: string) => {
        try {
            // Delete from Firebase
            await firebaseService.shows.deleteShow(eventId);
            
            // ✅ NO LOCAL STATE - Reload data from Firebase instead
            await reloadFirebaseData();
            
            addToast('Show verwijderd!', 'success');
        } catch (error) {
            addToast('Fout bij verwijderen van show', 'error');
        }
    }, [addToast, reloadFirebaseData]);
    
    const customers = useMemo(() => {
        console.log('🧑‍🤝‍🧑 Generating customers from reservations:', {
            reservationsCount: reservations?.length || 0,
            sampleReservation: reservations?.[0]
        });
        
        if (!reservations || reservations.length === 0) {
            console.log('⚠️ No reservations found, returning empty customers array');
            return [];
        }
        
        const customerMap = new Map<string, {name: string, reservations: Reservation[]}>();
        reservations.forEach(r => {
            if(!customerMap.has(r.email)){
                customerMap.set(r.email, { name: r.contactName, reservations: [] });
            }
            customerMap.get(r.email)!.reservations.push(r);
        });
        
        const generatedCustomers = Array.from(customerMap.entries()).map(([email, data]) => {
            const sortedReservations = data.reservations.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return {
                email,
                name: data.name,
                totalBookings: data.reservations.length,
                totalSpent: data.reservations.reduce((sum, r) => sum + r.totalPrice, 0),
                firstVisit: sortedReservations[sortedReservations.length - 1].date,
                lastVisit: sortedReservations[0].date,
                reservations: sortedReservations
            }
        });
        
        console.log('✅ Generated customers:', {
            count: generatedCustomers.length,
            sampleCustomer: generatedCustomers[0]
        });
        
        return generatedCustomers;
    }, [reservations]);

    const handleAddShow = async (newShow: Omit<ShowEvent, 'id'>, dates: string[]) => {
        try {
            // Add each show to Firebase using hook
            for (const date of dates) {
                const showForDate = {
                    ...newShow,
                    date: date,
                };
                
                await firebaseAddShow(showForDate);
            }
            
            addToast('Shows toegevoegd', 'success');
        } catch (error) {
            addToast('Error bij toevoegen shows', 'error');
        }
    };

    const handleDeleteShow = async (showId: string) => {
        try {
            const showToDelete = events.find(e => e.id === showId);
            if(!showToDelete) return;

            // Delete from Firebase using hook - this will automatically update the UI via real-time listener
            await firebaseDeleteShow(showId);
            
            addToast('Show verwijderd', 'success');
            
            addToast('Show verwijderd', 'success');
        } catch (error) {
            addToast('Fout bij verwijderen show', 'error');
        }
    };

    const handleToggleShowStatus = async (showId: string) => {
        try {
            const showToUpdate = events.find(e => e.id === showId);
            if (!showToUpdate) return;
            
            const currentGuests = guestCountMap.get(showToUpdate.date) || 0;
            const newStatus = !showToUpdate.isClosed;
            
            // Voorkom heropening als er 240+ gasten zijn
            if (newStatus === false && currentGuests >= 240) {
                return; // Geen wijziging
            }
            
            // Update in Firebase using hook - this will automatically update the UI via real-time listener
            await firebaseUpdateShow(showId, { isClosed: newStatus });
            
        } catch (error) {
            addToast('Fout bij wijzigen show status', 'error');
        }
    };
    
    const handleAddReservation = useCallback(async (newReservation: Omit<Reservation, 'id'>) => {
        try {
            console.log('🎭 [DEBUG] Starting reservation process:', {
                customerName: newReservation.contactName,
                email: newReservation.email,
                status: newReservation.status,
                date: newReservation.date,
                guests: newReservation.guests
            });

            // Add to Firebase using the hook - this will automatically update the UI via real-time listener
            const savedReservation = await firebaseAddReservation(newReservation);
            console.log('🎭 [DEBUG] Reservation saved to Firebase:', savedReservation.id);
            
            // 📧 COMPLETE EMAIL WORKFLOW - Send both provisional and admin notification emails
            try {
                console.log('🎭 [DEBUG] Starting email workflow...');
                const show = events.find(e => e.date === newReservation.date);
                const emailData: BookingEmailData = {
                    customerName: newReservation.contactName || 'Onbekend',
                    customerEmail: newReservation.email || 'Niet opgegeven',
                    customerPhone: newReservation.phone || 'Niet opgegeven',
                    customerAddress: `${newReservation.address || ''} ${newReservation.houseNumber || ''}`.trim() || undefined,
                    customerCity: newReservation.city || undefined,
                    customerPostalCode: newReservation.postalCode || undefined,
                    customerCountry: newReservation.country || 'Nederland',
                    companyName: newReservation.companyName,
                    showTitle: show?.name || 'Onbekende show',
                    showDate: newReservation.date,
                    showTime: show?.time || undefined,
                    packageType: newReservation.drinkPackage || 'standard',
                    numberOfGuests: newReservation.guests,
                    totalPrice: newReservation.totalPrice || 0,
                    reservationId: savedReservation.id,
                    allergies: newReservation.allergies,
                    preShowDrinks: newReservation.preShowDrinks,
                    afterParty: newReservation.afterParty ? newReservation.guests : undefined, // Assume all guests for afterparty
                    remarks: newReservation.remarks,
                    promoCode: newReservation.promoCode,
                    discountAmount: newReservation.discountAmount,
                    selectedAddons: [
                        ...(newReservation.preShowDrinks ? ['Pre-show drinks'] : []),
                        ...(newReservation.afterParty ? ['After party'] : []),
                        ...(newReservation.drinkPackage === 'premium' ? ['Premium drankenpakket'] : []),
                        ...(newReservation.remarks ? [`Opmerkingen: ${newReservation.remarks}`] : [])
                    ]
                };
                
                console.log('🎭 [DEBUG] Email data prepared:', {
                    customerEmail: emailData.customerEmail,
                    showTitle: emailData.showTitle,
                    reservationId: emailData.reservationId
                });
                
                // 1. Send provisional booking email to customer
                console.log('🎭 [DEBUG] Sending provisional booking email...');
                await sendProvisionalBookingEmail(emailData);
                
                // 2. Send admin notification email
                console.log('🎭 [DEBUG] Sending admin notification email...');
                await sendAdminNotificationEmail(emailData);
                
                console.log('📧 Complete email workflow executed successfully');
            } catch (emailError) {
                console.error('📧 Email workflow failed:', emailError);
                // Don't fail the entire reservation for email errors
            }
            
            // AUTO-SLUITING/OPENING LOGICA bij nieuwe reserveringen
            const showDate = newReservation.date;
            const currentGuests = guestCountMap.get(showDate) || 0;
            const newTotalGuests = currentGuests + newReservation.guests;
            
            if (newTotalGuests >= 240) {
                // Auto-sluiten bij 240+ gasten - Update Firebase via hook
                const showToClose = events.find(e => e.date === showDate && !e.isClosed);
                if (showToClose) {
                    await firebaseUpdateShow(showToClose.id, { isClosed: true });
                }
            }

            // Update voucher/gift card status if used
            if(newReservation.promoCode && newReservation.discountAmount) {
                // Check if it's a theater voucher (nieuwe systeem)
                const voucherIndex = config.theaterVouchers.findIndex(v => 
                    v.code === newReservation.promoCode && v.status === 'active'
                );
            
                if (voucherIndex > -1) {
                    // Mark theater voucher as used (volledig gebruik)
                    const updatedVouchers = [...config.theaterVouchers];
                    updatedVouchers[voucherIndex] = {
                        ...updatedVouchers[voucherIndex],
                        status: 'used',
                        usedDate: formatDate(new Date()),
                        usedReservationId: savedReservation.id
                    };
                    const updatedConfig = {...config, theaterVouchers: updatedVouchers};
                    await firebaseService.config.updateConfig(updatedConfig);
                    // Update local config optimistically
                    setConfig(updatedConfig);
                    addToast(`🎫 Theaterbon ${newReservation.promoCode} gebruikt`, 'success');
                } else {
                    // Check if it's a promo code (nieuwe systeem)
                    const promoIndex = config.promoCodes.findIndex(p => 
                        p.code === newReservation.promoCode
                    );

                    if (promoIndex > -1) {
                        // Verhoog usage count voor promocode
                        const updatedPromoCodes = [...config.promoCodes];
                        updatedPromoCodes[promoIndex] = {
                            ...updatedPromoCodes[promoIndex],
                            usageCount: updatedPromoCodes[promoIndex].usageCount + 1
                        };
                        const updatedConfig = {...config, promoCodes: updatedPromoCodes};
                        await firebaseService.config.updateConfig(updatedConfig);
                        // Update local config optimistically
                        setConfig(updatedConfig);
                        addToast(`🎫 Promocode ${newReservation.promoCode} gebruikt`, 'success');
                    }
                }
            }
            
            addToast('Reservering succesvol toegevoegd!', 'success');
        } catch (error) {
            addToast('Fout bij toevoegen van reservering', 'error');
            // Fallback: reload from Firebase on error
            await reloadFirebaseData();
        }
    }, [config.theaterVouchers, addToast, guestCountMap, events, reloadFirebaseData]);

    // ✅ FIREBASE: Internal Events handlers now use Firebase
    const handleAddInternalEvent = useCallback(async (event: Omit<InternalEvent, 'id'>) => {
        try {
            await firebaseAddInternalEvent(event);
            addToast(`Intern event "${event.title}" toegevoegd`, 'success');
        } catch (error) {
            addToast('Fout bij toevoegen van intern event', 'error');
        }
    }, [firebaseAddInternalEvent, addToast]);

    const handleUpdateInternalEvent = useCallback(async (event: InternalEvent) => {
        try {
            await firebaseUpdateInternalEvent(event.id, event);
            addToast(`Intern event "${event.title}" bijgewerkt`, 'success');
        } catch (error) {
            addToast('Fout bij bijwerken van intern event', 'error');
        }
    }, [firebaseUpdateInternalEvent, addToast]);

    const handleDeleteInternalEvent = useCallback(async (id: string) => {
        try {
            const event = internalEvents.find(e => e.id === id);
            await firebaseDeleteInternalEvent(id);
            addToast(`Intern event${event ? ` "${event.title}"` : ''} verwijderd`, 'success');
        } catch (error) {
            addToast('Fout bij verwijderen van intern event', 'error');
        }
    }, [firebaseDeleteInternalEvent, internalEvents, addToast]);

    // Effect voor auto-sluiting van boekingen 12 uur voor voorstelling
    // TODO: This auto-closure logic should be moved to Firebase Cloud Functions for better reliability
    /*
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            
            setEvents(prevEvents => {
                return prevEvents.map(event => {
                    if (event.isClosed) return event; // Al gesloten, skip
                    
                    const showDateTime = new Date(event.date + 'T19:30:00');
                    const showTimes = getShowTimes(new Date(event.date + 'T12:00:00'), event.type);
                    
                    // Gebruik echte showtijd als beschikbaar
                    if (showTimes.start) {
                        const [hours, minutes] = showTimes.start.split(':');
                        showDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    }
                    
                    // Booking cutoff: 12 uur voor de voorstelling
                    const cutoffTime = new Date(showDateTime.getTime() - (12 * 60 * 60 * 1000));
                    
                    if (now > cutoffTime) {
                        return {...event, isClosed: true};
                    }
                    
                    return event;
                });
            });
        }, 60000); // Check elke minuut
        
        return () => clearInterval(interval);
    }, []);
    */

    const handleUpdateReservation = async (updatedReservation: Reservation) => {
        try {
            const previousReservation = reservations.find(r => r.id === updatedReservation.id);
            
            // Update in Firebase using hook - this will automatically update the UI via real-time listener
            await firebaseUpdateReservation(updatedReservation.id, updatedReservation);
            
            // 📧 SEND APPROPRIATE EMAIL BASED ON STATUS CHANGE
            if (previousReservation && previousReservation.status !== updatedReservation.status) {
                try {
                    const show = events.find(e => e.date === updatedReservation.date);
                    const emailData: BookingEmailData = {
                        customerName: updatedReservation.contactName || 'Onbekend',
                        customerEmail: updatedReservation.email || 'Niet opgegeven',
                        customerPhone: updatedReservation.phone || 'Niet opgegeven',
                        customerAddress: `${updatedReservation.address || ''} ${updatedReservation.houseNumber || ''}`.trim() || undefined,
                        customerCity: updatedReservation.city || undefined,
                        customerPostalCode: updatedReservation.postalCode || undefined,
                        customerCountry: updatedReservation.country || 'Nederland',
                        companyName: updatedReservation.companyName,
                        showTitle: show?.name || 'Onbekende show',
                        showDate: updatedReservation.date,
                        showTime: show?.time || undefined,
                        packageType: updatedReservation.drinkPackage || 'standard',
                        numberOfGuests: updatedReservation.guests,
                        totalPrice: updatedReservation.totalPrice || 0,
                        reservationId: updatedReservation.id,
                        allergies: updatedReservation.allergies,
                        preShowDrinks: updatedReservation.preShowDrinks,
                        afterParty: updatedReservation.afterParty ? updatedReservation.guests : undefined,
                        remarks: updatedReservation.remarks,
                        promoCode: updatedReservation.promoCode,
                        discountAmount: updatedReservation.discountAmount
                    };

                    if (updatedReservation.status === 'confirmed') {
                        // Send booking confirmed email
                        await sendBookingConfirmedEmail(emailData);
                        console.log('📧 Booking confirmed email sent');
                    } else if (updatedReservation.status === 'cancelled') {
                        // Send booking rejected email
                        await sendBookingRejectedEmail(emailData);
                        console.log('📧 Booking rejected email sent');
                    }
                } catch (emailError) {
                    console.error('📧 Status change email failed:', emailError);
                    // Don't fail the reservation update for email errors
                }
            }
            
            addToast(`Reservering ${updatedReservation.status === 'confirmed' ? 'goedgekeurd' : 'geannuleerd'}!`, 'success');
        } catch (error) {
            addToast('Er is een fout opgetreden bij het bijwerken van de reservering', 'error');
        }
    };
    
    const handleDeleteReservation = async (id: string) => {
        try {
            const deletedReservation = reservations.find(r => r.id === id);
            
            // Delete from Firebase using hook - this will automatically update the UI via real-time listener
            await firebaseDeleteReservation(id);
            
            // AUTO-OPENING LOGICA bij verwijderen reserveringen
            if (deletedReservation) {
                const showDate = deletedReservation.date;
                const currentGuests = guestCountMap.get(showDate) || 0;
                const newTotalGuests = Math.max(0, currentGuests - deletedReservation.guests);
                
                if (newTotalGuests < 240) {
                    // Auto-openen onder 240 gasten - Update Firebase via hook
                    const showToOpen = events.find(e => e.date === showDate && e.isClosed);
                    if (showToOpen) {
                        await firebaseUpdateShow(showToOpen.id, { isClosed: false });
                    }
                }
            }
            
            addToast('Reservering verwijderd', 'success');
        } catch (error) {
            addToast('Fout bij verwijderen van reservering', 'error');
            // Fallback: reload from Firebase on error
            await reloadFirebaseData();
        }
    };
    
    const handleAddWaitingList = async (newEntry: Omit<WaitingListEntry, 'id'>) => {
        try {
            const savedEntry = await firebaseService.waitingList.addWaitingListEntry(newEntry);
            
            // ✅ NO LOCAL STATE - Reload data from Firebase instead
            await reloadFirebaseData();
            
            addToast(i18n.waitingListConfirmed, 'success');
        } catch (error) {
            addToast('Fout bij toevoegen aan wachtlijst', 'error');
        }
    };

    const handleDeleteWaitingList = async (id: string) => {
        try {
            await firebaseService.waitingList.deleteWaitingListEntry(id);
            
            // ✅ NO LOCAL STATE - Reload data from Firebase instead
            await reloadFirebaseData();
            
            addToast('Wachtlijst item verwijderd', 'success');
        } catch (error) {
            addToast('Fout bij verwijderen van wachtlijst', 'error');
        }
    };

    // 🚀 Phase 2: Advanced Waitlist Management Functions
    const handleUpdateWaitingList = (updatedEntry: WaitingListEntry) => {
        // The Firebase hook will automatically handle updates via real-time listeners
        addToast('Wachtlijst bijgewerkt', 'success');
    };

    const handleNotifyWaitlist = (entry: WaitingListEntry) => {
        // Phase 2: Smart notification logic
        const updatedEntry = { 
            ...entry, 
            status: 'notified' as const,
            lastNotificationAt: new Date(),
            notificationsSent: (entry.notificationsSent || 0) + 1
        };
        
        handleUpdateWaitingList(updatedEntry);
        
        // Simulate notification (later will be real email/SMS)
        addToast(`📧 Notificatie verzonden naar ${entry.name}`, 'info');
        
        // Auto-detection: Check if there are available spots
        const show = events.find(s => s.date === entry.date);
        if (show) {
            const currentGuests = guestCountMap.get(entry.date) || 0;
            const availableSpots = show.capacity - currentGuests;
            
            if (availableSpots >= entry.guests) {
                // Set response deadline (24 hours)
                const deadline = new Date();
                deadline.setHours(deadline.getHours() + 24);
                
                const entryWithDeadline = {
                    ...updatedEntry,
                    responseDeadline: deadline
                };
                
                // The Firebase hook will automatically handle updates via real-time listeners
            }
        }
    };

    const handleConvertWaitlistToReservation = (entry: WaitingListEntry) => {
        const show = events.find(s => s.date === entry.date);
        if (!show) {
            addToast('Show niet gevonden', 'error');
            return;
        }

        const currentGuests = guestCountMap.get(entry.date) || 0;
        const availableSpots = show.capacity - currentGuests;
        
        if (availableSpots < entry.guests) {
            addToast(`Onvoldoende capaciteit. ${availableSpots} plaatsen beschikbaar, ${entry.guests} gevraagd.`, 'error');
            return;
        }

        // Create new reservation from waitlist entry
        const newReservation: Reservation = {
            id: Date.now().toString(),
            date: entry.date,
            companyName: '',
            salutation: 'Dhr.',
            contactName: entry.name,
            address: '',
            houseNumber: '',
            postalCode: '',
            city: '',
            phone: entry.phone || '',
            email: entry.email || '',
            guests: entry.guests,
            drinkPackage: 'standard',
            preShowDrinks: false,
            afterParty: false,
            remarks: 'Geconverteerd van wachtlijst',
            addons: {},
            newsletter: false,
            termsAccepted: true,
            totalPrice: calculatePrice(entry.guests, show.type, config),
            checkedIn: false,
            status: 'confirmed',
            bookingSource: 'internal',
            createdAt: new Date().toISOString()
        };

        // Add reservation using Firebase hook - real-time listeners will handle state updates automatically
        // TODO: Implement this using firebaseAddReservation when ready
        
        const convertedEntry = { 
            ...entry, 
            status: 'converted' as const,
            reservationId: newReservation.id
        };
        handleUpdateWaitingList(convertedEntry);
        
        addToast(`✅ ${entry.name} succesvol geconverteerd naar reservering!`, 'success');
        
        // Auto-notify next in queue if capacity allows
        autoNotifyNextInQueue(entry.date);
    };

    // 🤖 Auto-notification for next in queue
    const autoNotifyNextInQueue = (showDate: string) => {
        const show = events.find(s => s.date === showDate);
        if (!show) return;

        const updatedGuestCount = guestCountMap.get(showDate) || 0;
        const availableSpots = show.capacity - updatedGuestCount;
        
        if (availableSpots <= 0) return;

        // Find next active waitlist entry for this show
        const activeWaitlist = waitingList
            .filter(w => w.date === showDate && (w.status === 'active' || !w.status))
            .sort((a, b) => (a.priority || 0) - (b.priority || 0));
        
        const nextInQueue = activeWaitlist.find(w => w.guests <= availableSpots);
        
        if (nextInQueue) {
            // Delay to avoid immediate notification spam
            setTimeout(() => {
                handleNotifyWaitlist(nextInQueue);
            }, 2000);
        }
    };

    // Helper function to calculate price
    const calculatePrice = (guests: number, showType: string, config: AppConfig): number => {
        const showTypeConfig = config.showTypes.find(st => st.name.toLowerCase() === showType.toLowerCase());
        if (!showTypeConfig) return 0;
        
        return guests * showTypeConfig.priceStandard;
    };
    
    const handleBulkDelete = async (criteria: { type: 'name' | 'type' | 'date', value: string }, month?: Date) => {
        try {
            if(criteria.type === 'date') {
                const datesToDelete = criteria.value.split(',');
                // Find shows to delete
                const showsToDelete = events.filter(e => datesToDelete.includes(e.date));
                // Delete each show from Firebase
                for (const show of showsToDelete) {
                    await firebaseService.shows.deleteShow(show.id);
                }
                
                // ✅ NO LOCAL STATE - Reload data from Firebase instead
                await reloadFirebaseData();
                
                addToast(`${showsToDelete.length} shows verwijderd`, 'success');
                return;
            }

            if(!month) return;

            const year = month.getFullYear();
            const monthIndex = month.getMonth();
            
            // Find shows to delete for the specific month
            const showsToDelete = events.filter(e => {
                const eventDate = new Date(e.date);
                return e[criteria.type] === criteria.value && eventDate.getFullYear() === year && eventDate.getMonth() === monthIndex;
            });
            
            // Delete each show from Firebase
            for (const show of showsToDelete) {
                await firebaseService.shows.deleteShow(show.id);
            }
            
            // ✅ NO LOCAL STATE - Reload data from Firebase instead
            await reloadFirebaseData();
            
            addToast(`${showsToDelete.length} shows verwijderd`, 'success');
            
        } catch (error) {
            addToast('Er is een fout opgetreden bij het verwijderen', 'error');
        }
    };
    
    // TODO: These capacity management functions should be converted to use Firebase hooks
    /*
    const handleUpdateShowCapacity = (showId: string, newCapacity: number) => {
        setEvents(prev => prev.map(e => e.id === showId ? {...e, manualCapacityOverride: newCapacity, capacity: newCapacity} : e));
    };

    const handleAddExternalBooking = useCallback((showId: string, guests: number) => {
        setEvents(prev => prev.map(e => {
            if (e.id === showId) {
                const newExternalBookings = (e.externalBookings || 0) + guests;
                const currentInternalGuests = guestCountMap.get(e.date) || 0;
                const totalGuests = currentInternalGuests + newExternalBookings;
                
                // AUTO-SLUITING/OPENING LOGICA
                let shouldBeClosed = e.isClosed;
                if (totalGuests >= 240 && !e.isClosed) {
                    shouldBeClosed = true; // Auto-sluiten bij 240+ gasten
                } else if (totalGuests < 240 && e.isClosed) {
                    shouldBeClosed = false; // Auto-openen onder 240 gasten
                }
                
                return {...e, externalBookings: newExternalBookings, isClosed: shouldBeClosed};
            }
            return e;
        }));
        
        // Create a mock external reservation for tracking purposes
        const show = events.find(e => e.id === showId);
        if (show) {
            const externalReservation: Reservation = {
                id: Date.now().toString(),
                date: show.date,
                companyName: 'Externe Boeking',
                salutation: 'N.v.t.',
                contactName: `Externe groep (${guests} personen)`,
                address: 'Extern',
                houseNumber: '',
                postalCode: '',
                city: '',
                phone: '',
                email: 'extern@booking.com',
                guests,
                drinkPackage: 'standard',
                preShowDrinks: false,
                afterParty: false,
                remarks: 'Externe boeking - handmatig toegevoegd',
                addons: {},
                celebrationName: '',
                celebrationOccasion: '',
                newsletter: false,
                termsAccepted: true,
                totalPrice: 0,
                checkedIn: false,
                status: 'confirmed',
                bookingSource: 'external',
                createdAt: new Date().toISOString()
            };
            
            setReservations(prev => [...prev, externalReservation]);
        }
    }, [events]);
    */

    const handleUpdateShowEvents = useCallback((updatedEvents: ShowEvent[]) => {
        // Since we're using Firebase hooks, we should update each show individually
        updatedEvents.forEach(async (show) => {
            try {
                await firebaseUpdateShow(show.id, show);
            } catch (error) {
                console.error('Failed to update show:', error);
            }
        });
    }, [firebaseUpdateShow]);

    const handleToggleCheckIn = async (id: string) => {
        try {
            const reservation = reservations.find(r => r.id === id);
            if (!reservation) return;
            
            const updatedReservation = {...reservation, checkedIn: !reservation.checkedIn};
            
            // Update in Firebase using hook - this will automatically update the UI via real-time listener  
            await firebaseUpdateReservation(id, updatedReservation);
            
        } catch (error) {
            addToast('Er is een fout opgetreden bij het bijwerken van de check-in status', 'error');
        }
    };

    // 🔧 Config update handler that saves to Firebase
    const handleConfigUpdate = async (newConfig: AppConfig) => {
        try {
            // Save to Firebase first
            await firebaseService.config.updateConfig(newConfig);
            
            // Update local state
            setConfig(newConfig);
            
            } catch (error) {
            }
    };

    return (
        <div className={`container ${view === 'admin' ? 'admin-container' : ''}`}>
            <SvgDefs />
            <Header currentView={view} setCurrentView={setViewSecure} />
            
            {/* 🧪 EMAIL TEST BUTTON - Development Only */}
            <main>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
                            <p>Gegevens worden geladen uit Firebase...</p>
                        </div>
                    </div>
                ) : view === 'book' ? (
                    <BookingView
                        showEvents={events}
                        reservations={reservations}
                        onAddReservation={handleAddReservation}
                        config={config}
                        guestCountMap={guestCountMap}
                        onAddWaitingList={handleAddWaitingList}
                        Calendar={Calendar}
                        CalendarLegend={CalendarLegend}
                        CalendarPopover={CalendarPopover}
                        ShowSummary={ShowSummary}
                        ReservationWizard={ReservationWizard}
                        WaitingListForm={WaitingListForm}
                    />
                ) : (
                    <AdminPanel
                        reservations={reservations}
                        showEvents={events}
                        waitingList={waitingList}
                        internalEvents={internalEvents}
                        config={config}
                        onAddShow={handleAddShow}
                        onAddReservation={handleAddReservation}
                        onDeleteReservation={handleDeleteReservation}
                        onDeleteWaitingList={handleDeleteWaitingList}
                        onBulkDelete={handleBulkDelete}
                        setConfig={handleConfigUpdate}
                        guestCountMap={guestCountMap}
                        onDeleteShow={handleDeleteShow}
                        onToggleShowStatus={handleToggleShowStatus}
                        onUpdateShowCapacity={() => {/* TODO: Implement with Firebase hooks */}}
                        onAddExternalBooking={() => {/* TODO: Implement with Firebase hooks */}}
                        onToggleCheckIn={handleToggleCheckIn}
                        customers={customers}
                        onUpdateReservation={handleUpdateReservation}
                        onUpdateWaitingList={handleUpdateWaitingList}
                        onNotifyWaitlist={handleNotifyWaitlist}
                        onConvertWaitlistToReservation={handleConvertWaitlistToReservation}
                        onAddInternalEvent={handleAddInternalEvent}
                        onUpdateInternalEvent={handleUpdateInternalEvent}
                        onDeleteInternalEvent={handleDeleteInternalEvent}
                        onUpdateShowEvents={handleUpdateShowEvents}
                        onBulkDeleteShows={handleBulkDeleteShows}
                        onBulkOpenClose={handleBulkOpenClose}
                    />
                )}
            </main>
            
            <DynamicStyles config={config} />
            <DiscreteAdminButton 
                onAdminLogin={() => setViewSecure('admin', true)}
                onAdminLogout={() => {
                    setAdminSession(false);
                    setViewSecure('book');
                }}
            />
        </div>
    );
};

const App = () => {
    // Initialize mobile optimizations on app start
    useEffect(() => {
        const cleanup = initMobileOptimizations();
        return cleanup;
    }, []);

    return (
        <AuthProvider>
            <ToastProvider>
                <ConfirmationProvider>
                    <AppContent />
                </ConfirmationProvider>
            </ToastProvider>
        </AuthProvider>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

