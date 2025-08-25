import React, { useMemo, useRef } from 'react';
import { Icon } from '../UI/Icon';
import { i18n } from '../../config/config';
import type { ShowEvent, Reservation, AppConfig } from '../../types/types';

// Import utility functions
const formatDateToNL = (date: Date): string => {
    return date.toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

interface PrintableListModalProps {
    listType: 'checkin' | 'kitchen';
    onClose: () => void;
    show: ShowEvent;
    reservations: Reservation[];
    config: AppConfig;
    onToggleCheckIn: (id: string) => void;
}

export const PrintableListModal: React.FC<PrintableListModalProps> = ({ 
    listType, 
    onClose, 
    show, 
    reservations, 
    config, 
    onToggleCheckIn 
}) => {
    const printContentRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const totalGuests = reservations.filter(r => r.status === 'confirmed').reduce((sum, r) => sum + r.guests, 0);
    const checkedInGuests = reservations.filter(r => r.checkedIn && r.status === 'confirmed').reduce((sum, r) => sum + r.guests, 0);
    const checkInProgress = totalGuests > 0 ? (checkedInGuests / totalGuests) * 100 : 0;
    
    const kitchenData = useMemo(() => {
        const arrangements = { standard: 0, premium: 0 };
        const addons = new Map<string, number>();
        const specialRequests: { name: string, request: string }[] = [];
        
        reservations.forEach(r => {
            arrangements[r.drinkPackage] += r.guests;
            if (r.remarks) {
                specialRequests.push({name: r.contactName, request: r.remarks});
            }
            if (r.celebrationOccasion) {
                 specialRequests.push({name: r.contactName, request: `Viering: ${r.celebrationOccasion} (${r.celebrationName})`});
            }
            Object.entries(r.addons).forEach(([id, quantity]) => {
                const numQuantity = Number(quantity);
                if (numQuantity > 0) {
                    addons.set(id, (addons.get(id) || 0) + numQuantity);
                }
            });
        });
        return { arrangements, addons, specialRequests };
    }, [reservations]);
    
    const merchandiseMap = useMemo(() => new Map(config.merchandise.map(item => [item.id, item.name])), [config.merchandise]);
    const capSlogansMap = useMemo(() => new Map(config.capSlogans.map((slogan, index) => [`cap${index}`, slogan])), [config.capSlogans]);

    return (
        <div className="printable-modal-backdrop no-print">
            <div className="printable-modal">
                <div className="printable-header">
                    <h3>{listType === 'checkin' ? i18n.guestList : i18n.kitchenList}</h3>
                    <div>
                        <button onClick={handlePrint} className="btn-secondary">
                            <Icon id="print"/> {i18n.printList}
                        </button>
                        <button onClick={onClose} className="icon-btn">
                            <Icon id="close"/>
                        </button>
                    </div>
                </div>

                <div className="printable-content" ref={printContentRef}>
                    <div className="print-only-header">
                        <h2>
                            {i18n.printableViewFor
                                .replace('{showName}', show.name)
                                .replace('{date}', formatDateToNL(new Date(show.date + 'T12:00:00')))
                            }
                        </h2>
                        <h3>{listType === 'checkin' ? i18n.guestList : i18n.kitchenList}</h3>
                    </div>
                    
                    {listType === 'checkin' && (
                        <>
                            <div className="check-in-summary no-print">
                                <strong>{i18n.checkInStatus}:</strong>{' '}
                                {i18n.checkedInCount
                                    .replace('{checkedIn}', String(checkedInGuests))
                                    .replace('{total}', String(totalGuests))
                                }
                                <div className="check-in-progress-bar-container">
                                    <div className="check-in-progress-bar" style={{width: `${checkInProgress}%`}}></div>
                                </div>
                            </div>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>{i18n.fullName}</th>
                                            <th>{i18n.guests}</th>
                                            <th>{i18n.totalPrice}</th>
                                            <th className="no-print">{i18n.actions}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservations.map(r => (
                                            <tr key={r.id} className={r.checkedIn ? 'checked-in-row' : ''}>
                                                <td>
                                                    <div className="cell-main">{r.contactName}</div>
                                                    <div className="cell-sub">{r.companyName}</div>
                                                </td>
                                                <td>{r.guests}</td>
                                                <td>€{(r.totalPrice || 0).toFixed(2)}</td>
                                                <td className="no-print">
                                                    <button 
                                                        className={`check-in-btn ${r.checkedIn ? 'checked-in' : ''}`} 
                                                        onClick={() => onToggleCheckIn(r.id)}
                                                    >
                                                        <Icon id="check" />
                                                        {r.checkedIn ? i18n.checkedIn : i18n.checkIn}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td><strong>{i18n.total}</strong></td>
                                            <td><strong>{totalGuests}</strong></td>
                                            <td><strong>€{reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0).toFixed(2)}</strong></td>
                                            <td className="no-print"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </>
                    )}
                    
                    {listType === 'kitchen' && (
                        <>
                            <div className="kitchen-summary-grid">
                                <div className="summary-card">
                                    <h3>{i18n.arrangements} ({totalGuests} {i18n.guests})</h3>
                                    <ul>
                                        <li>{i18n.standardPackage}: <strong>{kitchenData.arrangements.standard}</strong></li>
                                        <li>{i18n.premiumPackage}: <strong>{kitchenData.arrangements.premium}</strong></li>
                                    </ul>
                                </div>
                                <div className="summary-card">
                                    <h3>{i18n.formAddons}</h3>
                                    <ul>
                                        {Array.from(kitchenData.addons.entries()).map(([id, quantity]) => (
                                            <li key={id}>
                                                {merchandiseMap.get(id) || capSlogansMap.get(id) || id}: <strong>{quantity}</strong>
                                            </li>
                                        ))}
                                        {kitchenData.addons.size === 0 && <li>Geen</li>}
                                    </ul>
                                </div>
                            </div>
                            <div className="card">
                                <h3>{i18n.specialRequests}</h3>
                                {kitchenData.specialRequests.length > 0 ? (
                                    <ul>
                                        {kitchenData.specialRequests.map((req, index) => 
                                            <li key={index}><strong>{req.name}:</strong> {req.request}</li>
                                        )}
                                    </ul>
                                ) : (
                                    <p className="no-data-message">Geen speciale verzoeken</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
