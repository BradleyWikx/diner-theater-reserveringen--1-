// MailerSend Email Service using Official SDK
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

export interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  showTitle: string;
  showDate: string;
  showTime: string;
  showLocation: string;
  packageType: string;
  numberOfPersons: number;
  totalPrice: number;
  dietaryRequirements?: string;
  specialRequests?: string;
  reservationId?: string;
  addons?: {
    preShowDrinks: boolean;
    afterParty: boolean;
    premiumPackage: boolean;
  };
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

const MAILERSEND_CONFIG = {
  accessToken: 'mlsn.7039caeacf8cdd5823070e1b8863f60fc578ad39f1e0e0da156186514d482477',
  fromEmail: 'noreply@dinertheater.nl',
  fromName: 'Diner Theater Reserveringen',
  toEmail: 'bradleywielockx@gmail.com'
};

// Initialize MailerSend
const mailerSend = new MailerSend({
  apiKey: MAILERSEND_CONFIG.accessToken,
});

// Format booking data for email content
function formatBookingContent(data: BookingEmailData): string {
  const addonsText = data.addons ? [
    data.addons.preShowDrinks ? '• Pre-show drankjes' : null,
    data.addons.afterParty ? '• After-party toegang' : null,
    data.addons.premiumPackage ? '• Premium pakket' : null
  ].filter(Boolean).join('\n') : '';

  const addressText = data.address ? 
    `${data.address.street}, ${data.address.city} ${data.address.postalCode}, ${data.address.country}` : '';

  return `
🎭 NIEUWE THEATERBOEKING

👤 Klantgegevens:
Naam: ${data.customerName}
Email: ${data.customerEmail}
Telefoon: ${data.customerPhone}
${addressText ? `Adres: ${addressText}` : ''}

🎪 Show Details:
Titel: ${data.showTitle}
Datum: ${data.showDate}
Tijd: ${data.showTime}
Locatie: ${data.showLocation}

📦 Pakket & Details:
Pakket: ${data.packageType}
Aantal personen: ${data.numberOfPersons}
Totaalprijs: €${data.totalPrice.toFixed(2)}

${addonsText ? `🎁 Add-ons:\n${addonsText}\n` : ''}

${data.dietaryRequirements ? `🍽️ Dieetwensen: ${data.dietaryRequirements}\n` : ''}

${data.specialRequests ? `💬 Speciale verzoeken: ${data.specialRequests}\n` : ''}

${data.reservationId ? `🔖 Reservering ID: ${data.reservationId}\n` : ''}

---
Dit is een automatisch gegenereerde notificatie van het reserveringssysteem.
  `.trim();
}

// Format content as HTML
function formatBookingContentHTML(data: BookingEmailData): string {
  const addonsText = data.addons ? [
    data.addons.preShowDrinks ? '<li>Pre-show drankjes</li>' : null,
    data.addons.afterParty ? '<li>After-party toegang</li>' : null,
    data.addons.premiumPackage ? '<li>Premium pakket</li>' : null
  ].filter(Boolean).join('') : '';

  const addressText = data.address ? 
    `${data.address.street}, ${data.address.city} ${data.address.postalCode}, ${data.address.country}` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Nieuwe Theaterboeking</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; }
    .section { margin-bottom: 20px; }
    .section h3 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
    .details { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
    .price { font-size: 1.2em; font-weight: bold; color: #27ae60; }
    .footer { background: #34495e; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 0.9em; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎭 Nieuwe Theaterboeking</h1>
  </div>
  
  <div class="content">
    <div class="section">
      <h3>👤 Klantgegevens</h3>
      <div class="details">
        <strong>Naam:</strong> ${data.customerName}<br>
        <strong>Email:</strong> ${data.customerEmail}<br>
        <strong>Telefoon:</strong> ${data.customerPhone}<br>
        ${addressText ? `<strong>Adres:</strong> ${addressText}<br>` : ''}
      </div>
    </div>

    <div class="section">
      <h3>🎪 Show Details</h3>
      <div class="details">
        <strong>Titel:</strong> ${data.showTitle}<br>
        <strong>Datum:</strong> ${data.showDate}<br>
        <strong>Tijd:</strong> ${data.showTime}<br>
        <strong>Locatie:</strong> ${data.showLocation}<br>
      </div>
    </div>

    <div class="section">
      <h3>📦 Pakket & Details</h3>
      <div class="details">
        <strong>Pakket:</strong> ${data.packageType}<br>
        <strong>Aantal personen:</strong> ${data.numberOfPersons}<br>
        <strong>Totaalprijs:</strong> <span class="price">€${data.totalPrice.toFixed(2)}</span><br>
      </div>
    </div>

    ${addonsText ? `
    <div class="section">
      <h3>🎁 Add-ons</h3>
      <div class="details">
        <ul>${addonsText}</ul>
      </div>
    </div>` : ''}

    ${data.dietaryRequirements ? `
    <div class="section">
      <h3>🍽️ Dieetwensen</h3>
      <div class="details">${data.dietaryRequirements}</div>
    </div>` : ''}

    ${data.specialRequests ? `
    <div class="section">
      <h3>💬 Speciale verzoeken</h3>
      <div class="details">${data.specialRequests}</div>
    </div>` : ''}

    ${data.reservationId ? `
    <div class="section">
      <h3>🔖 Reservering ID</h3>
      <div class="details">${data.reservationId}</div>
    </div>` : ''}
  </div>
  
  <div class="footer">
    Dit is een automatisch gegenereerde notificatie van het reserveringssysteem.
  </div>
</body>
</html>
  `.trim();
}

// Send email via MailerSend Official SDK
async function sendMailerSendEmail(subject: string, textContent: string, htmlContent: string): Promise<boolean> {
  try {
    const sentFrom = new Sender(MAILERSEND_CONFIG.fromEmail, MAILERSEND_CONFIG.fromName);
    const recipients = [
      new Recipient(MAILERSEND_CONFIG.toEmail, 'Bradley Wielockx')
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(subject)
      .setHtml(htmlContent)
      .setText(textContent);

    const response = await mailerSend.email.send(emailParams);
    console.log('✅ MailerSend email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('❌ MailerSend email failed:', error);
    return false;
  }
}

// Main function to send booking notification
export async function sendBookingNotification(bookingData: BookingEmailData): Promise<void> {
  console.log('📧 Sending booking notification via MailerSend SDK...');
  
  // Log booking details to console for debugging
  logBookingNotification(bookingData);
  
  const subject = `🎭 Nieuwe Theaterboeking - ${bookingData.customerName} - ${bookingData.showTitle}`;
  const textContent = formatBookingContent(bookingData);
  const htmlContent = formatBookingContentHTML(bookingData);
  
  try {
    const success = await sendMailerSendEmail(subject, textContent, htmlContent);
    
    if (success) {
      console.log('✅ Booking notification email sent successfully to bradleywielockx@gmail.com');
    } else {
      console.error('❌ Failed to send booking notification email');
    }
  } catch (error) {
    console.error('❌ Error sending booking notification:', error);
  }
}

// Log booking notification to console for development/debugging
export function logBookingNotification(data: BookingEmailData): void {
  console.log('\n=== BOOKING NOTIFICATION ===');
  console.log('To: bradleywielockx@gmail.com');
  console.log('Subject: 🎭 Nieuwe Theaterboeking -', data.customerName, '-', data.showTitle);
  console.log('\n--- EMAIL CONTENT ---');
  console.log(formatBookingContent(data));
  console.log('\n=== END NOTIFICATION ===\n');
}

// Test function to send a test email
export async function sendTestEmail(): Promise<void> {
  console.log('🧪 Sending test email via MailerSend SDK...');
  
  const testData: BookingEmailData = {
    customerName: 'Test Klant',
    customerEmail: 'test@example.com',
    customerPhone: '+31 6 12345678',
    showTitle: 'Test Diner Theater Show',
    showDate: '2025-08-30',
    showTime: '19:00',
    showLocation: 'Diner Theater Locatie',
    packageType: 'premium',
    numberOfPersons: 4,
    totalPrice: 120.00,
    dietaryRequirements: 'Vegetarisch',
    specialRequests: 'Tafel bij het raam graag',
    reservationId: 'TEST-' + Date.now(),
    addons: {
      preShowDrinks: true,
      afterParty: true,
      premiumPackage: true
    },
    address: {
      street: 'Teststraat 123',
      city: 'Amsterdam',
      postalCode: '1000 AA',
      country: 'Nederland'
    }
  };
  
  await sendBookingNotification(testData);
}
