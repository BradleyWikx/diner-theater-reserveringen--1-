import emailjs from 'emailjs-com';

/* 
🎭 VOLLEDIG EMAIL SYSTEEM GEACTIVEERD 🎭
=======================================
Complete Email Workflow:
1. Provisional Booking Email - Direct na wizard submit
2. Admin Notification Email - Voor elke nieuwe booking  
3. Booking Confirmation Email - Bij goedkeuring door admin
4. Booking Rejection Email - Bij afwijzing door admin
5. Booking Modification Email - Bij wijzigingen
6. Manual Resend Option - Voor klanten die geen email hebben ontvangen

EmailJS Service: service_nh0qgkw
*/

// ✅ VOLLEDIG GEACTIVEERD
const EMAIL_ENABLED = true;

export interface BookingEmailData {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress?: string;
    customerCity?: string;
    customerPostalCode?: string;
    customerCountry?: string;
    companyName?: string;
    showTitle: string;
    showDate: string;
    showTime?: string;
    packageType: string;
    numberOfGuests: number;
    totalPrice: number;
    reservationId: string;
    selectedAddons?: string[];
    allergies?: string;
    preShowDrinks?: boolean;
    afterParty?: number; // Number of people for afterparty
    remarks?: string;
    promoCode?: string;
    discountAmount?: number;
}

// Enhanced EmailJS Configuration voor service_nh0qgkw
const EMAILJS_SERVICE_ID = 'service_nh0qgkw';         // Your new EmailJS Service ID
const EMAILJS_PUBLIC_KEY = 'Hg7wnrppHvVxeyCrf';      // Your EmailJS Public Key

// Template IDs voor verschillende email types
const EMAIL_TEMPLATES = {
    PROVISIONAL_BOOKING: 'template_provisional',        // Voor voorlopige booking bevestiging
    ADMIN_NOTIFICATION: 'template_admin_notify',       // Voor admin notificaties
    BOOKING_CONFIRMED: 'template_confirmed',           // Voor booking bevestiging
    BOOKING_REJECTED: 'template_rejected',             // Voor booking afwijzing
    BOOKING_MODIFIED: 'template_modified',             // Voor wijzigingen
    RESEND_CONFIRMATION: 'template_resend'             // Voor handmatig opnieuw versturen
};

/**
 * 🎭 SEND PROVISIONAL BOOKING EMAIL - Direct na wizard submit
 * Deze email wordt verstuurd zodra de klant de wizard heeft ingediend
 */
export const sendProvisionalBookingEmail = async (bookingData: BookingEmailData): Promise<boolean> => {
    try {
        if (!EMAIL_ENABLED) {
            console.log('📧 [PROVISIONAL] Email disabled - would send to:', bookingData.customerEmail);
            return true;
        }

        // Initialize EmailJS
        emailjs.init(EMAILJS_PUBLIC_KEY);
        
        const result = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAIL_TEMPLATES.PROVISIONAL_BOOKING,
            {
                // Email settings
                to_email: bookingData.customerEmail,
                to_name: bookingData.customerName,
                from_name: 'Theater Reserveringen',
                reply_to: 'info@theater.nl',
                subject: `🎭 Voorlopige Boeking Ontvangen - ${bookingData.showTitle}`,
                
                // Customer info
                customer_name: bookingData.customerName,
                customer_email: bookingData.customerEmail,
                customer_phone: bookingData.customerPhone,
                customer_address: bookingData.customerAddress || '',
                customer_city: bookingData.customerCity || '',
                customer_postal_code: bookingData.customerPostalCode || '',
                company_name: bookingData.companyName || '',
                
                // Show details
                show_title: bookingData.showTitle,
                show_date: formatDate(bookingData.showDate),
                show_time: bookingData.showTime || 'Nog te bevestigen',
                number_of_guests: bookingData.numberOfGuests,
                
                // Package info
                package_type: bookingData.packageType === 'premium' ? 'Premium Pakket' : 'Standaard Pakket',
                pre_show_drinks: bookingData.preShowDrinks ? 'Ja' : 'Nee',
                after_party: bookingData.afterParty ? `Ja (${bookingData.afterParty} personen)` : 'Nee',
                
                // Additional info
                allergies: bookingData.allergies || 'Geen aangegeven',
                remarks: bookingData.remarks || 'Geen opmerkingen',
                total_price: formatPrice(bookingData.totalPrice),
                promo_code: bookingData.promoCode || '',
                discount_amount: bookingData.discountAmount ? formatPrice(bookingData.discountAmount) : '',
                reservation_id: bookingData.reservationId,
                
                // Processing info
                processing_time: '1-3 werkdagen',
                contact_email: 'info@theater.nl',
                contact_phone: '+32 123 456 789'
            }
        );
        
        console.log('📧 [PROVISIONAL] Email sent successfully:', result);
        return true;
    } catch (error) {
        console.error('📧 [PROVISIONAL] Email failed:', error);
        return false;
    }
};

/**
 * 🎭 SEND ADMIN NOTIFICATION EMAIL - Voor nieuwe bookings
 * Deze email wordt verstuurd naar admin voor elke nieuwe booking
 */
export const sendAdminNotificationEmail = async (bookingData: BookingEmailData): Promise<boolean> => {
    try {
        if (!EMAIL_ENABLED) {
            console.log('📧 [ADMIN] Email disabled - would notify admin of booking:', bookingData.reservationId);
            return true;
        }

        emailjs.init(EMAILJS_PUBLIC_KEY);
        
        const result = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAIL_TEMPLATES.ADMIN_NOTIFICATION,
            {
                to_email: 'bradleywielockx@gmail.com',
                to_name: 'Admin',
                from_name: 'Theater Systeem',
                subject: `🚨 NIEUWE BOEKING - ${bookingData.customerName} - ${bookingData.showTitle}`,
                
                customer_name: bookingData.customerName,
                customer_email: bookingData.customerEmail,
                customer_phone: bookingData.customerPhone,
                customer_address: `${bookingData.customerAddress || ''} ${bookingData.customerCity || ''} ${bookingData.customerPostalCode || ''}`.trim(),
                company_name: bookingData.companyName || 'Geen bedrijf',
                
                show_title: bookingData.showTitle,
                show_date: formatDate(bookingData.showDate),
                number_of_guests: bookingData.numberOfGuests,
                package_type: bookingData.packageType === 'premium' ? 'Premium' : 'Standaard',
                
                extras: `
Borrels: ${bookingData.preShowDrinks ? 'Ja' : 'Nee'}
Afterparty: ${bookingData.afterParty ? `Ja (${bookingData.afterParty} personen)` : 'Nee'}
Allergieën: ${bookingData.allergies || 'Geen'}
Opmerkingen: ${bookingData.remarks || 'Geen'}`,
                
                total_price: formatPrice(bookingData.totalPrice),
                reservation_id: bookingData.reservationId,
                admin_url: `http://localhost:5176/admin?view=approvals`
            }
        );
        
        console.log('📧 [ADMIN] Notification sent successfully:', result);
        return true;
    } catch (error) {
        console.error('📧 [ADMIN] Notification failed:', error);
        return false;
    }
};

/**
 * 🎭 SEND BOOKING CONFIRMED EMAIL - Bij goedkeuring
 */
export const sendBookingConfirmedEmail = async (bookingData: BookingEmailData): Promise<boolean> => {
    try {
        if (!EMAIL_ENABLED) {
            console.log('📧 [CONFIRMED] Email disabled - would confirm booking:', bookingData.reservationId);
            return true;
        }

        emailjs.init(EMAILJS_PUBLIC_KEY);
        
        const result = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAIL_TEMPLATES.BOOKING_CONFIRMED,
            {
                to_email: bookingData.customerEmail,
                to_name: bookingData.customerName,
                from_name: 'Theater Reserveringen',
                subject: `✅ Booking Bevestigd - ${bookingData.showTitle} - ${formatDate(bookingData.showDate)}`,
                
                customer_name: bookingData.customerName,
                show_title: bookingData.showTitle,
                show_date: formatDate(bookingData.showDate),
                show_time: bookingData.showTime || 'Zie tickets voor exacte tijd',
                number_of_guests: bookingData.numberOfGuests,
                package_type: bookingData.packageType === 'premium' ? 'Premium Pakket' : 'Standaard Pakket',
                
                pre_show_drinks: bookingData.preShowDrinks ? 'Inbegrepen' : 'Niet geselecteerd',
                after_party: bookingData.afterParty ? `Inbegrepen (${bookingData.afterParty} personen)` : 'Niet geselecteerd',
                allergies: bookingData.allergies || 'Geen aangegeven',
                
                total_price: formatPrice(bookingData.totalPrice),
                reservation_id: bookingData.reservationId,
                
                // Instructions
                arrival_time: 'Gelieve 30 minuten voor aanvang aanwezig te zijn',
                parking_info: 'Gratis parking beschikbaar achter het theater',
                contact_info: 'Bij vragen: info@theater.nl of +32 123 456 789'
            }
        );
        
        console.log('📧 [CONFIRMED] Email sent successfully:', result);
        return true;
    } catch (error) {
        console.error('📧 [CONFIRMED] Email failed:', error);
        return false;
    }
};

/**
 * 🎭 SEND BOOKING REJECTED EMAIL - Bij afwijzing
 */
export const sendBookingRejectedEmail = async (bookingData: BookingEmailData, rejectionReason: string = ''): Promise<boolean> => {
    try {
        if (!EMAIL_ENABLED) {
            console.log('📧 [REJECTED] Email disabled - would reject booking:', bookingData.reservationId);
            return true;
        }

        emailjs.init(EMAILJS_PUBLIC_KEY);
        
        const result = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAIL_TEMPLATES.BOOKING_REJECTED,
            {
                to_email: bookingData.customerEmail,
                to_name: bookingData.customerName,
                from_name: 'Theater Reserveringen',
                subject: `❌ Booking Niet Goedgekeurd - ${bookingData.showTitle}`,
                
                customer_name: bookingData.customerName,
                show_title: bookingData.showTitle,
                show_date: formatDate(bookingData.showDate),
                reservation_id: bookingData.reservationId,
                
                rejection_reason: rejectionReason || 'Helaas was de voorstelling al vol geboekt op het moment van verwerking.',
                alternative_dates: 'Bekijk onze website voor alternatieve data: www.theater.nl',
                contact_info: 'Voor vragen kunt u contact opnemen via info@theater.nl of +32 123 456 789'
            }
        );
        
        console.log('📧 [REJECTED] Email sent successfully:', result);
        return true;
    } catch (error) {
        console.error('📧 [REJECTED] Email failed:', error);
        return false;
    }
};

/**
 * 🎭 SEND BOOKING MODIFIED EMAIL - Bij wijzigingen
 */
export const sendBookingModifiedEmail = async (bookingData: BookingEmailData, changes: string[]): Promise<boolean> => {
    try {
        if (!EMAIL_ENABLED) {
            console.log('📧 [MODIFIED] Email disabled - would send modification:', bookingData.reservationId);
            return true;
        }

        emailjs.init(EMAILJS_PUBLIC_KEY);
        
        const result = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAIL_TEMPLATES.BOOKING_MODIFIED,
            {
                to_email: bookingData.customerEmail,
                to_name: bookingData.customerName,
                from_name: 'Theater Reserveringen',
                subject: `🔄 Booking Gewijzigd - ${bookingData.showTitle}`,
                
                customer_name: bookingData.customerName,
                show_title: bookingData.showTitle,
                show_date: formatDate(bookingData.showDate),
                reservation_id: bookingData.reservationId,
                
                changes_made: changes.join('\n• '),
                total_price: formatPrice(bookingData.totalPrice),
                contact_info: 'Bij vragen: info@theater.nl of +32 123 456 789'
            }
        );
        
        console.log('📧 [MODIFIED] Email sent successfully:', result);
        return true;
    } catch (error) {
        console.error('📧 [MODIFIED] Email failed:', error);
        return false;
    }
};

/**
 * 🎭 RESEND CONFIRMATION EMAIL - Handmatig opnieuw versturen
 */
export const resendConfirmationEmail = async (bookingData: BookingEmailData, emailType: 'provisional' | 'confirmed' = 'confirmed'): Promise<boolean> => {
    try {
        if (!EMAIL_ENABLED) {
            console.log('📧 [RESEND] Email disabled - would resend:', emailType);
            return true;
        }

        if (emailType === 'provisional') {
            return await sendProvisionalBookingEmail(bookingData);
        } else {
            return await sendBookingConfirmedEmail(bookingData);
        }
    } catch (error) {
        console.error('📧 [RESEND] Email failed:', error);
        return false;
    }
};
                
                // Pakket informatie
                package_type: bookingData.packageType,
                number_of_guests: bookingData.numberOfGuests.toString(),
                total_price: `€${bookingData.totalPrice.toFixed(2)}`,
                
                // Add-ons
                selected_addons: bookingData.selectedAddons && bookingData.selectedAddons.length > 0 
                    ? bookingData.selectedAddons.join(', ') 
                    : 'Geen add-ons geselecteerd',
                
                // Reservering details
                reservation_id: bookingData.reservationId,
                
                // Volledige geformatteerde bericht
                message: emailContent.text,
                html_content: emailContent.html
            }
        );
        
        
        return true;
        
    } catch (error) {
        
        
        return false;
    }
};

/**
 * Send booking confirmation email after approval (TIJDELIJK UITGESCHAKELD)
 */
export const sendBookingConfirmationEmail = async (bookingData: BookingEmailData & { bookingNumber: string }): Promise<boolean> => {
    try {
        
        
        // 🚫 TIJDELIJK UITGESCHAKELD - Alleen logging
        if (!EMAIL_ENABLED) {
            
            return true;
        }

        
        
        // EmailJS implementation would go here when enabled
        
        return true;
        
    } catch (error) {
        
        return false;
    }
};

/**
 * Send test email
 */
export const sendTestEmail = async (): Promise<boolean> => {
    try {
        
        
        // 🚫 TIJDELIJK UITGESCHAKELD
        if (!EMAIL_ENABLED) {
            
            
            return true;
        }

        
        
        // For now, just log the test email since we need EmailJS setup
        
        
        
        
        
        
        
        // Initialize EmailJS with your public key
        emailjs.init(EMAILJS_PUBLIC_KEY);
        
        const result = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                to_email: 'bradleywielockx@gmail.com',
                to_name: 'Bradley',
                from_name: 'Theater Reserveringen',
                subject: '🧪 Test Email from Theater System',
                message: 'This is a test email from the theater reservation system using EmailJS.',
            }
        );
        
        
        return true;
        
    } catch (error) {
        
        return false;
    }
};

/**
 * Format booking data into email content
 */
function formatBookingContent(bookingData: BookingEmailData): { text: string; html: string } {
    const text = `
🎭 NIEUWE THEATERBOEKING

KLANTGEGEVENS:
Naam: ${bookingData.customerName}
E-mail: ${bookingData.customerEmail}
Telefoon: ${bookingData.customerPhone}

ADRESGEGEVENS:
Adres: ${bookingData.customerAddress || 'Niet opgegeven'}
Stad: ${bookingData.customerCity || 'Niet opgegeven'}
Postcode: ${bookingData.customerPostalCode || 'Niet opgegeven'}
Land: ${bookingData.customerCountry || 'Nederland'}

SHOWDETAILS:
Voorstelling: ${bookingData.showTitle}
Datum: ${bookingData.showDate}
Tijd: ${bookingData.showTime || 'Niet gespecificeerd'}

RESERVERINGSDETAILS:
Pakket type: ${bookingData.packageType}
Aantal personen: ${bookingData.numberOfGuests}
Totaalprijs: €${bookingData.totalPrice.toFixed(2)}
Reserveringsnummer: ${bookingData.reservationId}

ADD-ONS:
${bookingData.selectedAddons && bookingData.selectedAddons.length > 0 
    ? bookingData.selectedAddons.map(addon => `- ${addon}`).join('\n')
    : 'Geen add-ons geselecteerd'}
`;

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px;">
            <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #A00000;">
                <h1 style="color: #A00000; margin: 0; font-size: 24px;">🎭 Nieuwe Theaterboeking</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #333; background: #f8f9fa; padding: 10px; border-left: 4px solid #A00000; margin: 0 0 15px 0;">👤 Klantgegevens</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Naam:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.customerName}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>E-mail:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${bookingData.customerEmail}" style="color: #A00000;">${bookingData.customerEmail}</a></td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Telefoon:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="tel:${bookingData.customerPhone}" style="color: #A00000;">${bookingData.customerPhone}</a></td></tr>
                </table>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #333; background: #f8f9fa; padding: 10px; border-left: 4px solid #FFD700; margin: 0 0 15px 0;">📍 Adresgegevens</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Adres:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.customerAddress || 'Niet opgegeven'}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Stad:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.customerCity || 'Niet opgegeven'}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Postcode:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.customerPostalCode || 'Niet opgegeven'}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Land:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.customerCountry || 'Nederland'}</td></tr>
                </table>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #333; background: #f8f9fa; padding: 10px; border-left: 4px solid #FF9800; margin: 0 0 15px 0;">� Showdetails</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Voorstelling:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #FF9800;">${bookingData.showTitle}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Datum:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">${bookingData.showDate}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Tijd:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.showTime || 'Niet gespecificeerd'}</td></tr>
                </table>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #333; background: #f8f9fa; padding: 10px; border-left: 4px solid #FFD700; margin: 0 0 15px 0;">🎫 Reserveringsdetails</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Pakket type:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.packageType}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Aantal personen:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #FFD700; font-size: 16px;">${bookingData.numberOfGuests} personen</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Totaalprijs:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #32CD32; font-size: 18px;">€${bookingData.totalPrice.toFixed(2)}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Reserveringsnummer:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-family: monospace; background: #f5f5f5; padding: 5px; border-radius: 3px;">${bookingData.reservationId}</td></tr>
                </table>
            </div>
            
            ${bookingData.selectedAddons && bookingData.selectedAddons.length > 0 ? `
            <div style="margin-bottom: 25px;">
                <h3 style="color: #333; background: #f8f9fa; padding: 10px; border-left: 4px solid #A00000; margin: 0 0 15px 0;">🎁 Add-ons</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    ${bookingData.selectedAddons.map(addon => `<li style="padding: 3px 0; color: #555;">${addon}</li>`).join('')}
                </ul>
            </div>
            ` : `
            <div style="margin-bottom: 25px;">
                <h3 style="color: #333; background: #f8f9fa; padding: 10px; border-left: 4px solid #A00000; margin: 0 0 15px 0;">🎁 Add-ons</h3>
                <p style="color: #777; font-style: italic;">Geen add-ons geselecteerd</p>
            </div>
            `}
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e0e0e0; text-align: center;">
                <p style="margin: 0; color: #666; font-size: 14px;">Deze boeking is automatisch ontvangen via het online reserveringssysteem.</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Tijd van boeking: ${new Date().toLocaleString('nl-NL')}</p>
            </div>
        </div>
    `;

    return { text, html };
}
