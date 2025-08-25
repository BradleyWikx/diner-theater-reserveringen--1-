import emailjs from 'emailjs-com';

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
// You'll need to set up an account at https://emailjs.com and get these values
const EMAILJS_SERVICE_ID = 'your_service_id';  // Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'your_template_id'; // Replace with your EmailJS template ID  
const EMAILJS_USER_ID = 'your_user_id';        // Replace with your EmailJS user ID

/**
 * Send booking notification email using EmailJS (browser-compatible)
 */
export const sendBookingNotification = async (bookingData: BookingEmailData): Promise<boolean> => {
    try {
        console.log('📧 Sending booking notification via EmailJS...');
        
        // For now, just log the email content since we need EmailJS setup
        const emailContent = formatBookingContent(bookingData);
        console.log('\n=== BOOKING NOTIFICATION ===');
        console.log(`To: bradleywielockx@gmail.com`);
        console.log(`Subject: 🎭 Nieuwe Theaterboeking - ${bookingData.customerName} - ${bookingData.showTitle}`);
        console.log('\n--- EMAIL CONTENT ---');
        console.log(emailContent.text);
        console.log('\n=== END NOTIFICATION ===\n');
        
        // TODO: Uncomment when EmailJS is configured
        /*
        const result = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                to_email: 'bradleywielockx@gmail.com',
                to_name: 'Bradley',
                subject: `🎭 Nieuwe Theaterboeking - ${bookingData.customerName} - ${bookingData.showTitle}`,
                message: emailContent.text,
                customer_name: bookingData.customerName,
                customer_email: bookingData.customerEmail,
                show_title: bookingData.showTitle,
                show_date: bookingData.showDate,
                reservation_id: bookingData.reservationId,
                total_price: `€${bookingData.totalPrice.toFixed(2)}`
            },
            EMAILJS_USER_ID
        );
        
        console.log('✅ EmailJS notification sent successfully:', result);
        return true;
        */
        
        // For now, return true to simulate successful sending
        console.log('📝 Email notification logged (EmailJS not configured yet)');
        return true;
        
    } catch (error) {
        console.error('❌ EmailJS email failed:', error);
        console.error('❌ Failed to send booking notification email');
        return false;
    }
};

/**
 * Format booking data into email content
 */
function formatBookingContent(booking: BookingEmailData): { text: string; html: string } {
    const addressInfo = booking.customerAddress 
        ? `${booking.customerAddress}, ${booking.customerCity} ${booking.customerPostalCode}, ${booking.customerCountry}`
        : 'Geen adres opgegeven';
    
    const addonsText = booking.selectedAddons && booking.selectedAddons.length > 0
        ? booking.selectedAddons.map(addon => `• ${addon}`).join('\n')
        : 'Geen add-ons geselecteerd';
    
    const textContent = `🎭 NIEUWE THEATERBOEKING

👤 Klantgegevens:
Naam: ${booking.customerName}
Email: ${booking.customerEmail}
Telefoon: ${booking.customerPhone}
Adres: ${addressInfo}

🎪 Show Details:
Titel: ${booking.showTitle}
Datum: ${booking.showDate}
Tijd: ${booking.showTime || 'Onbekende tijd'}
Locatie: Diner Theater Locatie

📦 Pakket & Details:
Pakket: ${booking.packageType}
Aantal personen: ${booking.numberOfGuests}
Totaalprijs: €${booking.totalPrice.toFixed(2)}

🎁 Add-ons:
${addonsText}

🔖 Reservering ID: ${booking.reservationId}

---
Dit is een automatisch gegenereerde notificatie van het reserveringssysteem.`;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">🎭 Nieuwe Theaterboeking</h2>
            
            <h3 style="color: #34495e;">👤 Klantgegevens:</h3>
            <p><strong>Naam:</strong> ${booking.customerName}<br>
            <strong>Email:</strong> ${booking.customerEmail}<br>
            <strong>Telefoon:</strong> ${booking.customerPhone}<br>
            <strong>Adres:</strong> ${addressInfo}</p>
            
            <h3 style="color: #34495e;">🎪 Show Details:</h3>
            <p><strong>Titel:</strong> ${booking.showTitle}<br>
            <strong>Datum:</strong> ${booking.showDate}<br>
            <strong>Tijd:</strong> ${booking.showTime || 'Onbekende tijd'}<br>
            <strong>Locatie:</strong> Diner Theater Locatie</p>
            
            <h3 style="color: #34495e;">📦 Pakket & Details:</h3>
            <p><strong>Pakket:</strong> ${booking.packageType}<br>
            <strong>Aantal personen:</strong> ${booking.numberOfGuests}<br>
            <strong>Totaalprijs:</strong> €${booking.totalPrice.toFixed(2)}</p>
            
            <h3 style="color: #34495e;">🎁 Add-ons:</h3>
            <p>${addonsText.replace(/\n/g, '<br>')}</p>
            
            <p style="margin-top: 30px; padding: 10px; background-color: #ecf0f1; border-radius: 5px;">
                <strong>🔖 Reservering ID:</strong> ${booking.reservationId}
            </p>
            
            <hr style="margin-top: 30px;">
            <p style="color: #7f8c8d; font-size: 12px;">
                Dit is een automatisch gegenereerde notificatie van het reserveringssysteem.
            </p>
        </div>
    `;

    return { text: textContent, html: htmlContent };
}
