import emailjs from 'emailjs-com';

/* 
🚫 EMAIL TIJDELIJK UITGESCHAKELD 🚫
---------------------------------
Voor het weer inschakelen van emails:
1. Zet EMAIL_ENABLED naar 'true' 
2. Test eerst met sendTestEmail() functie
3. Controleer EmailJS configuratie (service_tr61                <h3 style="color: #333; background: #f8f9fa; padding: 10px; border-left: 4px solid #A00000; margin: 0 0 15px 0;">🎭 Showdetails</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Voorstelling:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #A00000;">${bookingData.showTitle}</td></tr>, template_x57wkhf)

FUNCTIES DIE UITGESCHAKELD ZIJN:
- sendBookingNotification (nieuwe bookings)
- sendBookingConfirmationEmail (bij acceptatie)
- sendTestEmail (test functie)

Alle functies loggen nu alleen naar console.
*/

// 🚫 TIJDELIJK UITGESCHAKELD - Zet naar true wanneer app klaar is
const EMAIL_ENABLED = false;

export interface BookingEmailData {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress?: string;
    customerCity?: string;
    customerPostalCode?: string;
    customerCountry?: string;
    showTitle: string;
    showDate: string;
    showTime?: string;
    packageType: string;
    numberOfGuests: number;
    totalPrice: number;
    reservationId: string;
    selectedAddons?: string[];
}

// EmailJS Configuration
// EmailJS account credentials
const EMAILJS_SERVICE_ID = 'service_tr61ut5';         // Your EmailJS Service ID
const EMAILJS_TEMPLATE_ID = 'template_x57wkhf';       // Your EmailJS Template ID (Bevestiging Boeking)
const EMAILJS_PUBLIC_KEY = 'Hg7wnrppHvVxeyCrf';      // Your EmailJS Public Key

/**
 * Send booking notification email using EmailJS (browser-compatible)
 */
export const sendBookingNotification = async (bookingData: BookingEmailData): Promise<boolean> => {
    try {
        console.log('📧 Email tijdelijk uitgeschakeld...');
        
        // 🚫 TIJDELIJK UITGESCHAKELD - Alleen logging
        if (!EMAIL_ENABLED) {
            console.log('🔕 EMAIL UITGESCHAKELD - Alleen logging van booking data');
            console.log('📋 Booking data:', {
                customer: bookingData.customerName,
                email: bookingData.customerEmail,
                show: bookingData.showTitle,
                date: bookingData.showDate,
                guests: bookingData.numberOfGuests,
                price: bookingData.totalPrice
            });
            console.log('✅ Email zou succesvol verzonden zijn (maar is uitgeschakeld)');
            return true;
        }

        console.log('📧 Sending booking notification via EmailJS...');
        
        // For now, just log the email content since we need EmailJS setup
        const emailContent = formatBookingContent(bookingData);
        console.log('\n=== BOOKING NOTIFICATION ===');
        console.log(`To: bradleywielockx@gmail.com`);
        console.log(`Subject: 🎭 Nieuwe Theaterboeking - ${bookingData.customerName} - ${bookingData.showTitle}`);
        console.log('\n--- EMAIL CONTENT ---');
        console.log(emailContent.text);
        console.log('\n=== END NOTIFICATION ===\n');
        
        // Initialize EmailJS with your public key
        emailjs.init(EMAILJS_PUBLIC_KEY);
        
        const result = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                // Basis email info
                to_email: 'bradleywielockx@gmail.com',
                to_name: 'Bradley',
                from_name: 'Theater Reserveringen',
                subject: `🎭 Nieuwe Theaterboeking - ${bookingData.customerName} - ${bookingData.showTitle}`,
                
                // Klantgegevens
                customer_name: bookingData.customerName,
                customer_email: bookingData.customerEmail,
                customer_phone: bookingData.customerPhone,
                
                // Adres informatie
                customer_address: bookingData.customerAddress || 'Niet opgegeven',
                customer_city: bookingData.customerCity || 'Niet opgegeven',
                customer_postal_code: bookingData.customerPostalCode || 'Niet opgegeven',
                customer_country: bookingData.customerCountry || 'Nederland',
                
                // Show informatie
                show_title: bookingData.showTitle,
                show_date: bookingData.showDate,
                show_time: bookingData.showTime || 'Onbekende tijd',
                
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
        
        console.log('✅ EmailJS notification sent successfully:', result);
        return true;
        
    } catch (error) {
        console.error('❌ EmailJS email failed:', error);
        console.error('❌ Failed to send booking notification email');
        return false;
    }
};

/**
 * Send booking confirmation email after approval (TIJDELIJK UITGESCHAKELD)
 */
export const sendBookingConfirmationEmail = async (bookingData: BookingEmailData & { bookingNumber: string }): Promise<boolean> => {
    try {
        console.log('📧 Confirmation email tijdelijk uitgeschakeld...');
        
        // 🚫 TIJDELIJK UITGESCHAKELD - Alleen logging
        if (!EMAIL_ENABLED) {
            console.log('🔕 CONFIRMATION EMAIL UITGESCHAKELD - Alleen logging');
            console.log('✅ Confirmation email data:', {
                customer: bookingData.customerName,
                email: bookingData.customerEmail,
                show: bookingData.showTitle,
                date: bookingData.showDate,
                bookingNumber: bookingData.bookingNumber,
                guests: bookingData.numberOfGuests,
                price: bookingData.totalPrice
            });
            console.log('📧 Bevestigingsmail zou verzonden zijn naar:', bookingData.customerEmail);
            return true;
        }

        console.log('📧 Sending booking confirmation email via EmailJS...');
        
        // EmailJS implementation would go here when enabled
        console.log('✅ Confirmation email sent successfully (DISABLED)');
        return true;
        
    } catch (error) {
        console.error('❌ Confirmation email failed:', error);
        return false;
    }
};

/**
 * Send test email
 */
export const sendTestEmail = async (): Promise<boolean> => {
    try {
        console.log('📧 Test email tijdelijk uitgeschakeld...');
        
        // 🚫 TIJDELIJK UITGESCHAKELD
        if (!EMAIL_ENABLED) {
            console.log('🔕 TEST EMAIL UITGESCHAKELD');
            console.log('✅ Test email zou succesvol verzonden zijn (maar is uitgeschakeld)');
            return true;
        }

        console.log('📧 Sending test email via EmailJS...');
        
        // For now, just log the test email since we need EmailJS setup
        console.log('\n=== TEST EMAIL ===');
        console.log(`To: bradleywielockx@gmail.com`);
        console.log(`Subject: 🧪 Test Email from Theater System`);
        console.log('\n--- EMAIL CONTENT ---');
        console.log('This is a test email from the theater reservation system using EmailJS.');
        console.log('\n=== END TEST EMAIL ===\n');
        
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
        
        console.log('✅ EmailJS test email sent successfully:', result);
        return true;
        
    } catch (error) {
        console.error('❌ EmailJS test email failed:', error);
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
