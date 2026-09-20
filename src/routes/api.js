const express = require('express');
const router = express.Router();
const { isDbConnected } = require('../config/db');
const config = require('../config');
const { saveInquiry, saveBooking, getStats } = require('../services/storage');
const { sendInquiryNotification, sendBookingConfirmation } = require('../services/mailer');
const { dispatchBookingWhatsApp } = require('../services/whatsapp');

/**
 * GET /api/health
 * AWS ALB / ECS / App Runner health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      type: 'MongoDB',
      connected: isDbConnected()
    },
    service: 'Sukunix Enterprise Web & Cloud Backend',
    version: '1.0.0'
  });
});

/**
 * GET /api/company
 * Public company contact metadata
 */
router.get('/company', (req, res) => {
  res.status(200).json({
    name: config.company.name,
    email: config.company.email,
    phone: config.company.phone,
    whatsapp: config.company.whatsapp,
    website: config.company.website
  });
});

/**
 * POST /api/contact
 * Handles project inquiry form submissions
 */
router.post('/contact', async (req, res) => {
  try {
    const { name, email, service, budget, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your full name.'
      });
    }

    if (!email || !email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid work email address.'
      });
    }

    const inquiryPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      service: service || 'Enterprise Software Development',
      budget: budget || '$25,000 – $75,000',
      message: (message || '').trim(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || ''
    };

    // 1. Save to MongoDB (with fallback storage)
    const saved = await saveInquiry(inquiryPayload);

    // 2. Dispatch notifications to infosukunix@gmail.com and client
    sendInquiryNotification(saved).catch(err => {
      console.warn('[API /contact] Mail notification warning:', err.message);
    });

    console.log(`[API /contact] Successfully received inquiry from ${inquiryPayload.name} <${inquiryPayload.email}>`);

    return res.status(201).json({
      success: true,
      message: 'Inquiry received successfully. Our engineering team will reach out within 1 business day.',
      leadId: saved._id
    });
  } catch (err) {
    console.error('[API /contact] Internal error:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing your inquiry. Please try again or email us directly at ' + config.company.email
    });
  }
});

/**
 * POST /api/book-consultation
 * Handles Architecture Discovery Session bookings
 */
router.post('/book-consultation', async (req, res) => {
  try {
    const { client, slot, meeting, deposit } = req.body;

    if (!client || !client.name || !client.email || !client.whatsapp) {
      return res.status(400).json({
        success: false,
        error: 'Client name, work email, and WhatsApp number are required.'
      });
    }

    if (!slot || !slot.date || !slot.time) {
      return res.status(400).json({
        success: false,
        error: 'Selected consultation slot is required.'
      });
    }

    const bookingRef = req.body.bookingRef || `SKX-${Math.floor(100000 + Math.random() * 900000)}`;

    const bookingPayload = {
      bookingRef,
      client: {
        name: client.name.trim(),
        email: client.email.trim().toLowerCase(),
        whatsapp: client.whatsapp.trim(),
        company: (client.company || 'Stealth / Confidential').trim(),
        service: client.service || 'Enterprise Web System'
      },
      slot: {
        date: slot.date,
        dateFormatted: slot.dateFormatted || slot.date,
        time: slot.time,
        timezone: slot.timezone || 'Asia/Kolkata (IST)'
      },
      deposit: {
        currency: (deposit && deposit.currency) || 'INR',
        amount: (deposit && deposit.amount) || 499,
        status: (deposit && deposit.status) || 'paid',
        paymentId: (deposit && deposit.paymentId) || ''
      },
      meeting: (() => {
        // Automatic Real Meeting Link Engine (Supports both Google Meet and Zoom):
        const reqPlatform = ((meeting && meeting.platform) || req.body.platform || 'google_meet').toLowerCase();
        const isZoom = reqPlatform.includes('zoom');
        const platformName = isZoom ? 'Zoom' : 'Google Meet';
        const cleanRef = bookingRef.toLowerCase().replace(/[^a-z0-9]/g, '');

        let effectiveUrl = '';

        if (isZoom) {
          if (config.meeting && config.meeting.zoomUrl && config.meeting.zoomUrl.trim()) {
            effectiveUrl = config.meeting.zoomUrl.trim();
          } else if (config.meeting && config.meeting.defaultUrl && config.meeting.defaultUrl.includes('zoom.us')) {
            effectiveUrl = config.meeting.defaultUrl.trim();
          } else {
            effectiveUrl = `https://meet.jit.si/sukunix-zoom-${cleanRef}`;
          }
        } else {
          if (config.meeting && config.meeting.googleMeetUrl && config.meeting.googleMeetUrl.trim()) {
            effectiveUrl = config.meeting.googleMeetUrl.trim();
          } else if (config.meeting && config.meeting.defaultUrl && config.meeting.defaultUrl.trim()) {
            effectiveUrl = config.meeting.defaultUrl.trim();
          } else {
            effectiveUrl = `https://meet.jit.si/sukunix-consultation-${cleanRef}`;
          }
        }

        const effectiveMeetingId = (meeting && meeting.meetingId && !meeting.meetingId.includes('random'))
          ? meeting.meetingId
          : bookingRef;
        const effectivePasscode = (meeting && meeting.passcode)
          ? meeting.passcode
          : `SKX${bookingRef.replace(/[^0-9]/g, '').slice(-3) || '2026'}`;

        return {
          platform: platformName,
          meetingId: effectiveMeetingId,
          passcode: effectivePasscode,
          zoomLink: effectiveUrl, // Compatible with zoomLink readers
          meetingUrl: effectiveUrl,
          status: 'scheduled'
        };
      })(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
    };

    // 1. Save to MongoDB (or local fallback)
    const saved = await saveBooking(bookingPayload);

    // 2. Dispatch notifications to infosukunix@gmail.com and client
    sendBookingConfirmation(bookingPayload).catch(err => {
      console.warn('[API /book-consultation] Mail notification warning:', err.message);
    });

    // 3. Dispatch automated WhatsApp & SMS notifications to both Client and Company (+91 8866279140)
    let waResult = null;
    try {
      waResult = await dispatchBookingWhatsApp(bookingPayload);
    } catch (waErr) {
      console.warn('[API /book-consultation] WhatsApp dispatch notice:', waErr.message);
    }

    console.log(`[API /book-consultation] Successfully booked consultation for ${bookingPayload.client.name} (${bookingRef})`);

    return res.status(201).json({
      success: true,
      message: 'Consultation session successfully confirmed.',
      bookingRef,
      meeting: bookingPayload.meeting,
      whatsapp: waResult
    });
  } catch (err) {
    console.error('[API /book-consultation] Internal error:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while reserving your consultation slot. Please contact ' + config.company.email
    });
  }
});

/**
 * GET /api/stats
 * Telemetry endpoint for inquiries & bookings
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.status(200).json({
      success: true,
      stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
