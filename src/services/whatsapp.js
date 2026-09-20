const config = require('../config');

/**
 * Format client confirmation WhatsApp message
 */
function formatClientMessage(booking) {
  const { client, slot, meeting, bookingRef } = booking;
  const meetingUrl = meeting.zoomLink || meeting.meetingUrl || 'https://sukunix.com';
  const platformName = meeting.platform || (meetingUrl.includes('zoom.us') ? 'Zoom' : 'Google Meet');
  return `Hello ${client.name},

Your Paid Discovery Architecture Consultation with Sukunix Technologies is confirmed!

📅 Date & Time: ${slot.dateFormatted} at ${slot.time} (${slot.timezone})
📹 Platform: ${platformName}
🔗 Meeting Link: ${meetingUrl}
📋 Booking Ref: ${bookingRef}

Our senior engineering architect looks forward to our session. A calendar invite has also been dispatched to ${client.email}.

Best regards,
Sukunix Engineering Team
https://sukunix.com`;
}

/**
 * Format company admin alert WhatsApp message
 */
function formatCompanyAlertMessage(booking) {
  const { client, slot, meeting, bookingRef } = booking;
  const meetingUrl = meeting.zoomLink || meeting.meetingUrl || 'https://sukunix.com';
  const platformName = meeting.platform || (meetingUrl.includes('zoom.us') ? 'Zoom' : 'Google Meet');
  return `🚨 NEW SUKUNIX CONSULTATION BOOKING!

• Client: ${client.name} (${client.company || 'Undisclosed'})
• WhatsApp: ${client.whatsapp}
• Email: ${client.email}
• Slot: ${slot.dateFormatted} at ${slot.time} (${slot.timezone})
• Platform: ${platformName}
• Meeting Link: ${meetingUrl}
• Focus: ${client.service}
• Ref: ${bookingRef}`;
}

/**
 * Clean phone number to E.164 international format (e.g. +918866279140)
 */
function normalizePhone(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (!cleaned.startsWith('+')) {
    // Default to +91 if 10 digits without code
    if (cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  return cleaned;
}

/**
 * Send WhatsApp via Twilio REST API
 */
async function sendTwilioWhatsApp(to, body) {
  const { twilioAccountSid, twilioAuthToken, twilioWhatsappFrom } = config.messaging;
  if (!twilioAccountSid || !twilioAuthToken) {
    return false;
  }

  const cleanTo = normalizePhone(to);
  const formattedTo = `whatsapp:${cleanTo}`;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;

  const params = new URLSearchParams();
  params.append('To', formattedTo);
  params.append('From', twilioWhatsappFrom);
  params.append('Body', body);

  const authHeader = 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Twilio API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  console.log(`[WhatsApp Twilio] Successfully sent to ${formattedTo} (SID: ${data.sid})`);
  return true;
}

/**
 * Send WhatsApp via Meta WhatsApp Cloud API
 */
async function sendMetaWhatsApp(to, body) {
  const { metaPhoneNumberId, metaAccessToken } = config.messaging;
  if (!metaPhoneNumberId || !metaAccessToken) {
    return false;
  }

  const cleanTo = normalizePhone(to).replace(/[^0-9]/g, '');
  const url = `https://graph.facebook.com/v19.0/${metaPhoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanTo,
    type: 'text',
    text: { preview_url: true, body: body }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${metaAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Meta WhatsApp Cloud API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  console.log(`[WhatsApp Meta Cloud] Successfully sent to +${cleanTo} (ID: ${data.messages?.[0]?.id})`);
  return true;
}

/**
 * Dispatch booking webhook to Make.com / n8n / Zapier automation pipelines
 */
async function sendBookingWebhook(booking) {
  const webhookUrl = config.messaging.webhookUrl;
  if (!webhookUrl) return false;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'consultation.booked',
        ...booking,
        companyNotificationTarget: config.company.phone,
        companyEmail: config.company.email
      })
    });
    console.log(`[Webhook Automation] Dispatched to ${webhookUrl} (Status: ${res.status})`);
    return true;
  } catch (err) {
    console.warn('[Webhook Automation] Webhook failed:', err.message);
    return false;
  }
}

/**
 * Main dispatcher: Sends meeting link automatically to BOTH Client and Company Mobile Numbers
 */
async function dispatchBookingWhatsApp(booking) {
  const clientMsg = formatClientMessage(booking);
  const companyMsg = formatCompanyAlertMessage(booking);

  const clientPhone = normalizePhone(booking.client.whatsapp);
  const companyPhone = normalizePhone(config.company.phone);

  let clientSent = false;
  let companySent = false;

  // 1. Attempt Twilio WhatsApp (if configured)
  try {
    if (config.messaging.twilioAccountSid && config.messaging.twilioAuthToken) {
      console.log(`[WhatsApp Service] Dispatching via Twilio to Client (${clientPhone}) and Company (${companyPhone})...`);
      clientSent = await sendTwilioWhatsApp(clientPhone, clientMsg);
      companySent = await sendTwilioWhatsApp(companyPhone, companyMsg);
    }
  } catch (err) {
    console.warn('[WhatsApp Service] Twilio dispatch warning:', err.message);
  }

  // 2. Attempt Meta WhatsApp Cloud API (if configured and Twilio not used)
  if (!clientSent && config.messaging.metaPhoneNumberId && config.messaging.metaAccessToken) {
    try {
      console.log(`[WhatsApp Service] Dispatching via Meta Cloud API to Client (${clientPhone}) and Company (${companyPhone})...`);
      clientSent = await sendMetaWhatsApp(clientPhone, clientMsg);
      companySent = await sendMetaWhatsApp(companyPhone, companyMsg);
    } catch (err) {
      console.warn('[WhatsApp Service] Meta Cloud API dispatch warning:', err.message);
    }
  }

  // 3. Dispatch external webhook (Make.com / n8n) if configured
  await sendBookingWebhook(booking);

  // 4. Log simulation / status if automated API keys aren't added yet
  if (!clientSent || !companySent) {
    console.log('\n================================================================');
    console.log('📱 [AUTOMATED WHATSAPP DISPATCH RECORD]');
    console.log('----------------------------------------------------------------');
    console.log(`1. TO CLIENT NUMBER: ${clientPhone}`);
    console.log(clientMsg);
    console.log('----------------------------------------------------------------');
    console.log(`2. TO COMPANY NUMBER: ${companyPhone} (Sukunix)`);
    console.log(companyMsg);
    console.log('----------------------------------------------------------------');
    console.log('ℹ️  Tip: Add TWILIO_ACCOUNT_SID or WHATSAPP_ACCESS_TOKEN in .env for direct cloud SMS/WhatsApp delivery.');
    console.log('================================================================\n');
  }

  // Return direct wa.me links for instant frontend click-to-connect fallback
  const cleanCompanyNum = companyPhone.replace(/[^0-9]/g, '');
  const cleanClientNum = clientPhone.replace(/[^0-9]/g, '');

  return {
    clientSent,
    companySent,
    directCompanyWhatsAppUrl: `https://wa.me/${cleanCompanyNum}?text=${encodeURIComponent(companyMsg)}`,
    directClientWhatsAppUrl: `https://wa.me/${cleanClientNum}?text=${encodeURIComponent(clientMsg)}`
  };
}

module.exports = {
  dispatchBookingWhatsApp,
  formatClientMessage,
  formatCompanyAlertMessage,
  normalizePhone
};
