import emailjs from '@emailjs/browser';

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

// ✅ EMAIL SYSTEEM GEACTIVEERD met juiste templates
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
    PROVISIONAL_BOOKING: 'template_e900xfs',           // Voor voorlopige booking bevestiging
    ADMIN_NOTIFICATION: 'template_admin_notify',       // Voor admin notificaties
    BOOKING_CONFIRMED: 'template_sc4hcps',             // Voor booking bevestiging (goedkeuring)
    BOOKING_REJECTED: 'template_rejected',             // Voor booking afwijzing
    BOOKING_MODIFIED: 'template_modified',             // Voor wijzigingen
    RESEND_CONFIRMATION: 'template_resend'             // Voor handmatig opnieuw versturen
};

// Helper Functions
const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('nl-BE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch {
        return dateString;
    }
};

const formatPrice = (price: number): string => {
    return `€${price.toFixed(2).replace('.', ',')}`;
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
                to_email: bookingData.customerEmail,
                to_name: bookingData.customerName,
                from_name: 'Theater Reserveringen',
                reply_to: 'info@theater.nl',
                subject: `🎭 Voorlopige Boeking Ontvangen - ${bookingData.showTitle}`,
                
                customer_name: bookingData.customerName,
                customer_email: bookingData.customerEmail,
                customer_phone: bookingData.customerPhone,
                customer_address: bookingData.customerAddress || '',
                customer_city: bookingData.customerCity || '',
                customer_postal_code: bookingData.customerPostalCode || '',
                company_name: bookingData.companyName || '',
                
                show_title: bookingData.showTitle,
                show_date: formatDate(bookingData.showDate),
                show_time: bookingData.showTime || 'Nog te bevestigen',
                number_of_guests: bookingData.numberOfGuests.toString(),
                
                package_type: bookingData.packageType === 'premium' ? 'Premium Pakket' : 'Standaard Pakket',
                pre_show_drinks: bookingData.preShowDrinks ? 'Ja' : 'Nee',
                after_party: bookingData.afterParty ? `Ja (${bookingData.afterParty} personen)` : 'Nee',
                
                allergies: bookingData.allergies || 'Geen aangegeven',
                remarks: bookingData.remarks || 'Geen opmerkingen',
                total_price: formatPrice(bookingData.totalPrice),
                promo_code: bookingData.promoCode || '',
                discount_amount: bookingData.discountAmount ? formatPrice(bookingData.discountAmount) : '',
                reservation_id: bookingData.reservationId,
                
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
                number_of_guests: bookingData.numberOfGuests.toString(),
                package_type: bookingData.packageType === 'premium' ? 'Premium' : 'Standaard',
                
                extras: `Borrels: ${bookingData.preShowDrinks ? 'Ja' : 'Nee'}
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
                number_of_guests: bookingData.numberOfGuests.toString(),
                package_type: bookingData.packageType === 'premium' ? 'Premium Pakket' : 'Standaard Pakket',
                
                pre_show_drinks: bookingData.preShowDrinks ? 'Inbegrepen' : 'Niet geselecteerd',
                after_party: bookingData.afterParty ? `Inbegrepen (${bookingData.afterParty} personen)` : 'Niet geselecteerd',
                allergies: bookingData.allergies || 'Geen aangegeven',
                
                total_price: formatPrice(bookingData.totalPrice),
                reservation_id: bookingData.reservationId,
                
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

// Legacy support - backward compatibility
export const sendBookingNotification = sendAdminNotificationEmail;