require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sukunix',
  
  // Company Contact Details
  company: {
    name: 'Sukunix Technologies',
    email: process.env.COMPANY_EMAIL || 'infosukunix@gmail.com',
    phone: process.env.COMPANY_PHONE || '+91 8866279140',
    whatsapp: process.env.COMPANY_WHATSAPP || '918866279140',
    website: process.env.WEBSITE_URL || 'https://sukunix.com',
  },

  // Email Service (Gmail SMTP or AWS SES SMTP)
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || 'infosukunix@gmail.com',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || '"Sukunix Engineering" <infosukunix@gmail.com>'
  },

  // Automated WhatsApp & SMS Messaging Providers
  messaging: {
    // Twilio WhatsApp / SMS Provider
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886', // Twilio default sandbox
    twilioSmsFrom: process.env.TWILIO_PHONE_NUMBER || '',

    // Meta WhatsApp Cloud API Provider
    metaPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    metaAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',

    // External Automation Webhook (Make.com / n8n / Zapier)
    webhookUrl: process.env.BOOKING_WEBHOOK_URL || ''
  },

  // Security / CORS
  corsOrigin: process.env.CORS_ORIGIN || '*'
};
