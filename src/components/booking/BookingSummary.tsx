import React, { useState, useMemo } from 'react';
import { Icon } from '../UI/Icon';
import { i18n } from '../../config/config';
import { formatDateToNL } from '../../utils/utilities';
import type { ShowEvent, Reservation, AppConfig } from '../../types/types';

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
    promoMessage
}) => {
    const { guests, drinkPackage, preShowDrinks, afterParty, addons } = reservation;
    const merchandiseMap = useMemo(() => new Map(config.shopMerchandise.map(item => [item.id, item])), [config.shopMerchandise]);
    const capSlogansMap = useMemo(() => new Map(config.capSlogans.map((slogan, index) => [`cap${index}`, slogan])), [config.capSlogans]);

    return (
        <>
            <h3>{i18n.bookingSummary}</h3>
            <div className="summary-section">
                <p><strong>{i18n.show}:</strong> {show.name}</p>
                <p><strong>{i18n.date}:</strong> {formatDateToNL(new Date(show.date + 'T12:00:00'), { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p><strong>{i18n.numberOfGuests}:</strong> {guests}</p>
                <p><strong>{i18n.formPackage}:</strong> {drinkPackage === 'standard' ? i18n.standardPackage : i18n.packagePremium}</p>
            </div>

            {(preShowDrinks || afterParty || Object.values(addons).some(v => Number(v) > 0)) && (
                <div className="summary-section">
                    <h4>{i18n.formAddons}</h4>
                    <ul>
                        {preShowDrinks && <li>{merchandiseMap.get('preShowDrinks')?.name} x {guests}</li>}
                        {afterParty && <li>{merchandiseMap.get('afterParty')?.name}</li>}
                        {Object.entries(addons).filter(([, val]) => Number(val) > 0).map(([key, val]) => (
                            <li key={key}>
                                <span>{merchandiseMap.get(key)?.name || capSlogansMap.get(key) || key}</span>
                                <span>x {val}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="summary-section">
                <h4>{i18n.promoCodeLabel}</h4>
                <div className="promo-code-group">
                    <input 
                        type="text" 
                        value={promoInput} 
                        onChange={(e) => setPromoInput(e.target.value)} 
                        placeholder="Voer code in" 
                    />
                    <button type="button" onClick={onApplyCode} className="btn-secondary">
                        {i18n.applyCode}
                    </button>
                </div>
                {promoMessage && <p className="promo-message">{promoMessage}</p>}
            </div>

            <div className="total-price-bar">
                <div className="price-breakdown">
                    <div className="price-line">
                        <span>{i18n.subtotal}</span>
                        <span>€{priceDetails.subtotal.toFixed(2)}</span>
                    </div>
                    {priceDetails.discount > 0 && (
                        <div className="price-line discount">
                            <span>{i18n.discount} ({appliedCode?.code})</span>
                            <span>-€{priceDetails.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="price-line total">
                        <span>
                            {priceDetails.total < 0 ? 'Restbedrag klant betaalt later' : i18n.totalPrice}
                        </span>
                        <strong>
                            {priceDetails.total < 0 ? `€${Math.abs(priceDetails.total).toFixed(2)}` : `€${priceDetails.total.toFixed(2)}`}
                        </strong>
                    </div>
                </div>
            </div>
        </>
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
