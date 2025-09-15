import React, { useMemo, useRef, useState } from 'react';
import { Icon } from '../ui/Icon';
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

const formatTimeToNL = (date: Date): string => {
    return date.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit'
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
    const [printTemplate, setPrintTemplate] = useState<'standard' | 'compact' | 'table-numbers'>('standard');
    const [includeTableNumbers, setIncludeTableNumbers] = useState(true);
    const [sortBy, setSortBy] = useState<'arrival' | 'name' | 'guests'>('arrival');

    const handlePrint = () => {
        // Add print-specific styling
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        
        const printContent = printContentRef.current?.innerHTML || '';
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Gastenlijst ${show.name} - ${formatDateToNL(new Date(show.date + 'T12:00:00'))}</title>
                <style>
                    ${getPrintCSS()}
                </style>
            </head>
            <body>
                ${printContent}
                <div style="position: fixed; bottom: 10px; right: 10px; font-size: 8px; color: #666;">
                    Gegenereerd: ${new Date().toLocaleString('nl-NL')} | Theater Reserveringen Systeem
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const handleExportPDF = async () => {
        try {
            // Modern way to save PDF using browser's print to PDF
            const printContent = printContentRef.current?.innerHTML || '';
            const newWindow = window.open('', '_blank');
            if (!newWindow) return;
            
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Gastenlijst ${show.name} - ${formatDateToNL(new Date(show.date + 'T12:00:00'))}</title>
                    <style>
                        ${getPrintCSS()}
                        body { margin: 0; }
                        .export-hint {
                            position: fixed;
                            top: 10px;
                            left: 50%;
                            transform: translateX(-50%);
                            background: #dc2626;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 4px;
                            font-size: 12px;
                            z-index: 1000;
                            animation: fadeInOut 3s ease-in-out;
                        }
                        @keyframes fadeInOut {
                            0%, 100% { opacity: 0; }
                            20%, 80% { opacity: 1; }
                        }
                    </style>
                </head>
                <body>
                    <div class="export-hint">💡 Gebruik Ctrl+P en kies "Opslaan als PDF" om te exporteren</div>
                    ${printContent}
                </body>
                </html>
            `);
            
            newWindow.document.close();
            newWindow.focus();
            
            // Auto-trigger print dialog
            setTimeout(() => {
                newWindow.print();
            }, 100);
            
        } catch (error) {
            
        }
    };

    const getPrintCSS = () => `
        @page { 
            margin: 1cm; 
            size: A4; 
        }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            font-size: 12px; 
            line-height: 1.4;
            color: #333;
        }
        .print-header { 
            text-align: center; 
            border-bottom: 2px solid #dc2626; 
            padding-bottom: 15px; 
            margin-bottom: 20px; 
        }
        .print-header h1 { 
            color: #dc2626; 
            margin: 0; 
            font-size: 24px; 
        }
        .print-header h2 { 
            color: #666; 
            margin: 5px 0 0 0; 
            font-size: 16px; 
        }
        .print-stats { 
            display: flex; 
            justify-content: space-between; 
            margin: 15px 0; 
            padding: 10px; 
            background: #f8f9fa; 
            border-radius: 6px; 
        }
        .print-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
        }
        .print-table th, .print-table td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
        }
        .print-table th { 
            background: #dc2626; 
            color: white; 
            font-weight: 600; 
        }
        .print-table tr:nth-child(even) { 
            background: #f9f9f9; 
        }
        .table-number { 
            background: #dc2626; 
            color: white; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-weight: bold; 
            min-width: 30px; 
            text-align: center; 
        }
        .guest-info { 
            font-weight: 600; 
        }
        .celebration { 
            background: #fef3c7; 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-size: 10px; 
            color: #92400e; 
        }
        .premium { 
            background: #8b5cf6; 
            color: white; 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-size: 10px; 
        }
        .checked-in { 
            background: #10b981; 
            color: white; 
        }
        .footer-info { 
            margin-top: 20px; 
            font-size: 10px; 
            color: #666; 
            text-align: center; 
        }
    `;

    const totalGuests = reservations.filter(r => r.status === 'confirmed').reduce((sum, r) => sum + r.guests, 0);
    const checkedInGuests = reservations.filter(r => r.checkedIn && r.status === 'confirmed').reduce((sum, r) => sum + r.guests, 0);
    const checkInProgress = totalGuests > 0 ? (checkedInGuests / totalGuests) * 100 : 0;
    
    // Enhanced sorting and table numbering
    const sortedReservations = useMemo(() => {
        const filtered = reservations.filter(r => r.status === 'confirmed');
        
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.contactName.localeCompare(b.contactName);
                case 'guests':
                    return b.guests - a.guests;
                case 'arrival':
                default:
                    // Sort by creation date, then by name
                    const dateA = new Date(a.createdAt || '').getTime();
                    const dateB = new Date(b.createdAt || '').getTime();
                    if (dateA === dateB) {
                        return a.contactName.localeCompare(b.contactName);
                    }
                    return dateA - dateB;
            }
        });

        // Add sequential table numbers
        return sorted.map((reservation, index) => ({
            ...reservation,
            tableNumber: index + 1
        }));
    }, [reservations, sortBy]);

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
                    <div className="printable-controls">
                        <div className="print-options">
                            <select 
                                value={printTemplate} 
                                onChange={(e) => setPrintTemplate(e.target.value as any)}
                                className="print-template-select"
                            >
                                <option value="standard">🎭 Theater Standaard</option>
                                <option value="compact">📋 Compact</option>
                                <option value="table-numbers">🪑 Met Tafelnummers</option>
                            </select>
                            
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="sort-select"
                            >
                                <option value="arrival">⏰ Volgorde Aanmelding</option>
                                <option value="name">🔤 Alfabetisch</option>
                                <option value="guests">👥 Aantal Gasten</option>
                            </select>
                        </div>
                        
                        <div className="action-buttons">
                            <button onClick={handlePrint} className="btn-primary print-btn">
                                <Icon id="print"/> Print Gastenlijst
                            </button>
                            <button onClick={handleExportPDF} className="btn-secondary export-pdf-btn">
                                <Icon id="download"/> Exporteer PDF
                            </button>
                            <button onClick={onClose} className="icon-btn">
                                <Icon id="close"/>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="printable-content" ref={printContentRef}>
                    <div className="print-header">
                        <h1>🎭 {show.name}</h1>
                        <h2>{formatDateToNL(new Date(show.date + 'T12:00:00'))}</h2>
                        <div className="show-details">
                            <span>Type: {show.type}</span> • 
                            <span>Capaciteit: {show.capacity} gasten</span> • 
                            <span>Gegenereerd: {formatTimeToNL(new Date())}</span>
                        </div>
                    </div>
                    
                    {listType === 'checkin' && (
                        <>
                            <div className="print-stats">
                                <div className="stat-item">
                                    <strong>Totaal Reserveringen:</strong> {sortedReservations.length}
                                </div>
                                <div className="stat-item">
                                    <strong>Totaal Gasten:</strong> {totalGuests}
                                </div>
                                <div className="stat-item">
                                    <strong>Ingecheckt:</strong> {checkedInGuests} ({Math.round(checkInProgress)}%)
                                </div>
                                <div className="stat-item">
                                    <strong>Omzet:</strong> €{reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0).toFixed(2)}
                                </div>
                            </div>

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

                            {renderGuestListTemplate()}
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

                    <div className="footer-info">
                        Theater Reserveringen Systeem • Gegenereerd op {new Date().toLocaleString('nl-NL')} • 
                        {listType === 'checkin' ? 'Gastenlijst' : 'Keukenlijst'} voor {show.name}
                    </div>
                </div>
            </div>
        </div>
    );

    function renderGuestListTemplate() {
        switch (printTemplate) {
            case 'compact':
                return renderCompactTemplate();
            case 'table-numbers':
                return renderTableNumberTemplate();
            default:
                return renderStandardTemplate();
        }
    }

    function renderStandardTemplate() {
        return (
            <table className="print-table table-wrapper">
                <thead>
                    <tr>
                        <th>Naam</th>
                        <th>Gasten</th>
                        <th>Pakket</th>
                        <th>Viering</th>
                        <th>Totaal</th>
                        <th className="no-print">Status</th>
                        <th className="no-print">Acties</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedReservations.map(r => (
                        <tr key={r.id} className={r.checkedIn ? 'checked-in-row' : ''}>
                            <td>
                                <div className="guest-info">{r.contactName}</div>
                                <div className="cell-sub">{r.companyName}</div>
                                {r.phone && <div className="cell-sub">📞 {r.phone}</div>}
                            </td>
                            <td><strong>{r.guests}</strong></td>
                            <td>
                                <span className={r.drinkPackage === 'premium' ? 'premium' : ''}>
                                    {r.drinkPackage === 'premium' ? '⭐ Premium' : 'Standaard'}
                                </span>
                            </td>
                            <td>
                                {r.celebrationOccasion && (
                                    <span className="celebration">
                                        🎉 {r.celebrationOccasion}
                                        {r.celebrationName && ` (${r.celebrationName})`}
                                    </span>
                                )}
                            </td>
                            <td><strong>€{(r.totalPrice || 0).toFixed(2)}</strong></td>
                            <td className="no-print">
                                <span className={r.checkedIn ? 'checked-in' : ''}>
                                    {r.checkedIn ? '✅ Aanwezig' : '⏳ Wachtend'}
                                </span>
                            </td>
                            <td className="no-print">
                                <button 
                                    className={`check-in-btn ${r.checkedIn ? 'checked-in' : ''}`} 
                                    onClick={() => onToggleCheckIn(r.id)}
                                >
                                    <Icon id="check" />
                                    {r.checkedIn ? 'Uitgecheckt' : 'Check In'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td><strong>TOTAAL</strong></td>
                        <td><strong>{totalGuests}</strong></td>
                        <td></td>
                        <td></td>
                        <td><strong>€{reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0).toFixed(2)}</strong></td>
                        <td className="no-print"></td>
                        <td className="no-print"></td>
                    </tr>
                </tfoot>
            </table>
        );
    }

    function renderCompactTemplate() {
        return (
            <div className="compact-list">
                {sortedReservations.map(r => (
                    <div key={r.id} className={`compact-item ${r.checkedIn ? 'checked-in' : ''}`}>
                        <div className="compact-main">
                            <strong>{r.contactName}</strong> ({r.guests} pers.) - €{(r.totalPrice || 0).toFixed(2)}
                            {r.drinkPackage === 'premium' && <span className="premium"> ⭐</span>}
                            {r.celebrationOccasion && <span className="celebration"> 🎉</span>}
                        </div>
                        <div className="compact-sub">
                            {r.companyName && <span>{r.companyName} • </span>}
                            {r.phone && <span>📞 {r.phone}</span>}
                        </div>
                        <div className="no-print compact-actions">
                            <button 
                                className={`check-in-btn-compact ${r.checkedIn ? 'checked-in' : ''}`} 
                                onClick={() => onToggleCheckIn(r.id)}
                            >
                                {r.checkedIn ? '✅' : '⏳'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    function renderTableNumberTemplate() {
        return (
            <table className="print-table table-numbers-template">
                <thead>
                    <tr>
                        <th>Tafel</th>
                        <th>Naam</th>
                        <th>Gasten</th>
                        <th>Pakket</th>
                        <th>Opmerkingen</th>
                        <th className="no-print">Check-in</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedReservations.map(r => (
                        <tr key={r.id} className={r.checkedIn ? 'checked-in-row' : ''}>
                            <td>
                                <div className="table-number">{r.tableNumber}</div>
                            </td>
                            <td>
                                <div className="guest-info">{r.contactName}</div>
                                <div className="cell-sub">{r.companyName}</div>
                            </td>
                            <td><strong>{r.guests}</strong></td>
                            <td>
                                <span className={r.drinkPackage === 'premium' ? 'premium' : ''}>
                                    {r.drinkPackage === 'premium' ? '⭐ Premium' : 'Standaard'}
                                </span>
                            </td>
                            <td>
                                {r.celebrationOccasion && (
                                    <div>🎉 {r.celebrationOccasion}</div>
                                )}
                                {r.remarks && (
                                    <div className="remarks">💬 {r.remarks}</div>
                                )}
                            </td>
                            <td className="no-print">
                                <button 
                                    className={`check-in-btn ${r.checkedIn ? 'checked-in' : ''}`} 
                                    onClick={() => onToggleCheckIn(r.id)}
                                >
                                    {r.checkedIn ? '✅' : '⏳'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
};
