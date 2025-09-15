import React, { useState, useMemo } from 'react';
import { Icon } from '../UI/Icon';
import { i18n, calculateDoorsOpenTime } from '../../config/config';
import { formatDateToNL, getShowTimes } from '../../utils/utilities';
import type { ShowEvent, Reservation, AppConfig, ShowType } from '../../types/types';

interface BookingSummaryProps {
    show: ShowEvent;
    reservation: Omit<Reservation, 'id' | 'totalPrice'>;
    priceDetails: { subtotal: number, discount: number, total: number };
    config: AppConfig;
    appliedCode: { code: string; type: 'promo' | 'gift'; value: number } | null;
    promoInput: string;
    setPromoInput: (value: string) => void;
    onApplyCode: () => void;
    promoMessage: string;
    // Navigation props
    currentStep?: number;
    totalSteps?: number;
    onPrevStep?: () => void;
    onNextStep?: () => void;
    canGoNext?: boolean;
    onSubmit?: () => void;
    isLastStep?: boolean;
    isSubmitting?: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
    show, 
    reservation, 
    priceDetails, 
    config, 
    appliedCode, 
    promoInput, 
    setPromoInput, 
    onApplyCode, 
    promoMessage,
    // Navigation props
    currentStep,
    totalSteps,
    onPrevStep,
    onNextStep,
    canGoNext,
    onSubmit,
    isLastStep,
    isSubmitting = false
}) => {
    const { guests, drinkPackage, preShowDrinks, afterParty, addons } = reservation;
    const merchandiseMap = useMemo(() => new Map(config.shopMerchandise.map(item => [item.id, item])), [config.shopMerchandise]);
    const capSlogansMap = useMemo(() => new Map(config.capSlogans.map((slogan, index) => [`cap${index}`, slogan])), [config.capSlogans]);
    
    // Get show type for time information using getShowTimes for consistency
    const dateObj = new Date(show.date + 'T12:00:00');
    const showTimes = getShowTimes(dateObj, show.type, config);
    
    // Use show-specific times if available, otherwise fall back to showType defaults from getShowTimes
    const startTime = show.startTime || showTimes.start;
    const endTime = show.endTime || showTimes.end;
    const doorsOpenTime = calculateDoorsOpenTime(startTime);

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">{i18n.bookingSummary}</h3>
            </div>
            <div className="card-body">
                <table className="table">
                    <tbody>
                        <tr>
                            <td><strong>{i18n.show}:</strong></td>
                            <td>{show.name}</td>
                        </tr>
                        <tr>
                            <td><strong>{i18n.date}:</strong></td>
                            <td>{formatDateToNL(new Date(show.date + 'T12:00:00'), { weekday: 'long', day: 'numeric', month: 'long' })}</td>
                        </tr>
                        <tr>
                            <td><strong>{i18n.bookShow.doorsOpen}:</strong></td>
                            <td>{doorsOpenTime}</td>
                        </tr>
                        <tr>
                            <td><strong>{i18n.bookShow.showStarts}:</strong></td>
                            <td>{startTime}</td>
                        </tr>
                        <tr>
                            <td><strong>{i18n.bookShow.showEnds}:</strong></td>
                            <td>{endTime}</td>
                        </tr>
                        <tr>
                            <td><strong>{i18n.numberOfGuests}:</strong></td>
                            <td>{guests}</td>
                        </tr>
                        <tr>
                            <td><strong>{i18n.formPackage}:</strong></td>
                            <td>{drinkPackage === 'standard' ? i18n.standardPackage : i18n.packagePremium}</td>
                        </tr>
                    </tbody>
                </table>

                {(preShowDrinks || afterParty || Object.values(addons).some(v => Number(v) > 0)) && (
                    <div className="mt-4">
                        <h4>{i18n.formAddons}</h4>
                        <ul className="list-group">
                            {preShowDrinks && <li className="list-group-item">{merchandiseMap.get('preShowDrinks')?.name} x {guests}</li>}
                            {afterParty && <li className="list-group-item">{merchandiseMap.get('afterParty')?.name}</li>}
                            {Object.entries(addons).filter(([, val]) => Number(val) > 0).map(([key, val]) => (
                                <li key={key} className="list-group-item">
                                    <span>{merchandiseMap.get(key)?.name || capSlogansMap.get(key) || key}</span>
                                    <span className="float-right">x {val}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mt-4">
                    <h4>Prijs</h4>
                    <table className="table">
                        <tbody>
                            <tr>
                                <td>Subtotaal</td>
                                <td className="text-right">€{priceDetails.subtotal.toFixed(2)}</td>
                            </tr>
                            {priceDetails.discount > 0 && (
                                <tr>
                                    <td>Korting ({appliedCode?.code})</td>
                                    <td className="text-right">- €{priceDetails.discount.toFixed(2)}</td>
                                </tr>
                            )}
                            <tr className="font-bold">
                                <td>Totaal</td>
                                <td className="text-right">€{priceDetails.total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <div className="form-group">
                        <label htmlFor="promo" className="form-label">Kortingscode</label>
                        <div className="flex">
                            <input type="text" id="promo" value={promoInput} onChange={e => setPromoInput(e.target.value)} className="form-control" />
                            <button onClick={onApplyCode} className="btn btn-primary ml-2">Toepassen</button>
                        </div>
                        {promoMessage && <p className="mt-2">{promoMessage}</p>}
                    </div>
                </div>
            </div>
            <div className="card-footer">
                {/* Navigation buttons (only show when navigation props are provided) */}
                {(currentStep && totalSteps && onPrevStep && onNextStep) && (
                    <div className="summary-navigation">
                        <button 
                            type="button" 
                            onClick={onPrevStep}
                            disabled={currentStep === 1}
                            className="btn-secondary"
                        >
                            Vorige
                        </button>
                        
                        <span className="step-indicator">
                            Stap {currentStep} van {totalSteps}
                        </span>
                        
                        {isLastStep ? (
                            <button 
                                type="button" 
                                onClick={onSubmit}
                                disabled={!canGoNext || isSubmitting}
                                className={`btn-primary ${isSubmitting ? 'loading' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        Verwerken...
                                    </>
                                ) : (
                                    'Bevestigen'
                                )}
                            </button>
                        ) : (
                            <button 
                                type="button" 
                                onClick={onNextStep}
                                disabled={!canGoNext || isSubmitting}
                                className="btn-primary"
                            >
                                Volgende
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Sidebar wrapper variant
export const BookingSummarySidebar: React.FC<BookingSummaryProps> = (props) => (
    <div className="booking-summary-sidebar">
        <BookingSummary {...props} />
    </div>
);

// Mobile variant with expand/collapse functionality
export const MobileBookingSummary: React.FC<BookingSummaryProps> = (props) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`mobile-booking-summary ${isExpanded ? 'expanded' : ''}`}>
            {isExpanded && <div className="mobile-summary-overlay" onClick={() => setIsExpanded(false)}></div>}
            <div className="mobile-summary-content">
                {isExpanded ? (
                    <div className="expanded-summary">
                        <button className="collapse-btn" onClick={() => setIsExpanded(false)} aria-label={i18n.collapse}>
                            <Icon id="chevron-down"/>
                            <span>{i18n.totalPrice}: <strong>€{props.priceDetails.total.toFixed(2)}</strong></span>
                        </button>
                        <div className="summary-scroll-area">
                            <BookingSummary {...props} />
                        </div>
                    </div>
                ) : (
                    <button className="collapsed-bar" onClick={() => setIsExpanded(true)} aria-label={i18n.expand}>
                        <Icon id="chevron-up"/>
                        <span>{i18n.summaryOfYourBookingMobile}</span>
                        <strong>€{props.priceDetails.total.toFixed(2)}</strong>
                    </button>
                )}
            </div>
        </div>
    );
};
