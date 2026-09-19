const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // Check if SMTP credentials are provided
  if (config.email.pass && config.email.pass.trim() !== '') {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });
    console.log(`[Mailer] Initialized SMTP transporter with host: ${config.email.host}`);
  } else {
    // Simulated/development transporter
    transporter = {
      sendMail: async (mailOpts) => {
        console.log('\n[Mailer Simulation] Email notification triggered:');
        console.log(`  To: ${mailOpts.to}`);
        console.log(`  Subject: ${mailOpts.subject}`);
        console.log(`  From: ${mailOpts.from}`);
        console.log('  (Configure EMAIL_PASS in .env or AWS SES for live delivery)\n');
        return { messageId: `sim_${Date.now()}` };
      }
    };
    console.log('[Mailer] No EMAIL_PASS provided, using simulated mail logger.');
  }

  return transporter;
}

/**
 * Dispatches notification when a client submits the Contact/Project Inquiry form
 */
async function sendInquiryNotification({ name, email, service, budget, message, _id }) {
  const mail = getTransporter();

  // 1. Alert to Sukunix Team (infosukunix@gmail.com)
  const teamHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #090d1a; padding: 24px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; color: #60a5fa;">New Client Project Inquiry</h2>
        <p style="margin: 6px 0 0; color: #94a3b8; font-size: 14px;">Submitted via sukunix.com consultation form</p>
      </div>
      <div style="padding: 24px; color: #1e293b;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 140px; font-weight: 600;">Client Name:</td>
            <td style="padding: 8px 0; font-weight: bold;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Work Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Capability Focus:</td>
            <td style="padding: 8px 0;">${service}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Budget Bracket:</td>
            <td style="padding: 8px 0;">${budget}</td>
          </tr>
        </table>
        
        <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px;">
          <strong style="display: block; margin-bottom: 8px; font-size: 13px; color: #475569; text-transform: uppercase;">Project Overview:</strong>
          <p style="margin: 0; white-space: pre-wrap; color: #0f172a; line-height: 1.6;">${message || 'No additional notes provided.'}</p>
        </div>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          Lead ID: ${_id || 'N/A'} &bull; Received: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST
        </div>
      </div>
    </div>
  `;

  // 2. Auto-reply to Client
  const clientHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #090d1a; padding: 24px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; color: #ffffff;">Sukunix Technologies</h2>
        <p style="margin: 6px 0 0; color: #60a5fa; font-size: 14px;">We have received your project inquiry</p>
      </div>
      <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for reaching out to Sukunix Technologies. Our senior engineering architects have received your architectural requirements for <strong>${service}</strong>.</p>
        <p>We review all submissions meticulously and a principal architect will respond with initial feasibility insights and next steps within <strong>one business day</strong>.</p>
        
        <div style="margin: 24px 0; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
          <h4 style="margin: 0 0 8px; color: #166534;">Need immediate discussion?</h4>
          <p style="margin: 0; font-size: 14px; color: #15803d;">
            You can reach our engineering pod directly via WhatsApp at 
            <a href="https://wa.me/${config.company.whatsapp}" style="font-weight: bold; color: #15803d; text-decoration: underline;">${config.company.phone}</a>
            or email us back at <a href="mailto:${config.company.email}" style="font-weight: bold; color: #15803d; text-decoration: underline;">${config.company.email}</a>.
          </p>
        </div>

        <p style="color: #64748b; font-size: 13px;">Warm regards,<br><strong>Sukunix Architecture & Solutions Team</strong><br><a href="${config.company.website}" style="color: #2563eb;">sukunix.com</a></p>
      </div>
    </div>
  `;

  // Send in parallel / non-blocking
  try {
    await Promise.allSettled([
      mail.sendMail({
        from: config.email.from,
        to: config.company.email,
        subject: `[New Lead] ${name} - ${service} (${budget})`,
        html: teamHtml
      }),
      mail.sendMail({
        from: config.email.from,
        to: email,
        subject: `Inquiry Received: Sukunix Engineering Pod`,
        html: clientHtml
      })
    ]);
  } catch (err) {
    console.error('[Mailer] Error dispatching inquiry emails:', err.message);
  }
}

/**
 * Dispatches notification when a client locks an Architecture Discovery Consultation
 */
async function sendBookingConfirmation(booking) {
  const mail = getTransporter();
  const { client, slot, meeting, bookingRef } = booking;

  const teamHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="background: #090d1a; padding: 24px; color: #ffffff;">
        <h2 style="margin: 0; color: #38bdf8;">Paid Discovery Consultation Confirmed</h2>
        <p style="margin: 4px 0 0; color: #94a3b8;">Booking Ref: <strong>${bookingRef}</strong></p>
      </div>
      <div style="padding: 24px; color: #1e293b;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #64748b;">Attendee:</td><td><strong>${client.name}</strong> (${client.company || 'N/A'})</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Work Email:</td><td><a href="mailto:${client.email}">${client.email}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">WhatsApp:</td><td><a href="https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}">${client.whatsapp}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Slot:</td><td><strong>${slot.dateFormatted} at ${slot.time} (${slot.timezone})</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Architecture Focus:</td><td>${client.service}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Zoom Link:</td><td><a href="${meeting.zoomLink}" style="color: #2563eb;">${meeting.zoomLink}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Meeting ID:</td><td><code>${meeting.meetingId}</code> | Passcode: <code>${meeting.passcode}</code></td></tr>
        </table>
      </div>
    </div>
  `;

  try {
    await Promise.allSettled([
      mail.sendMail({
        from: config.email.from,
        to: config.company.email,
        subject: `[Consultation Booked] ${client.name} - ${slot.dateFormatted} @ ${slot.time}`,
        html: teamHtml
      }),
      mail.sendMail({
        from: config.email.from,
        to: client.email,
        subject: `Confirmed: Sukunix Architecture Discovery Call (${bookingRef})`,
        html: teamHtml // same details formatted cleanly
      })
    ]);
  } catch (err) {
    console.error('[Mailer] Error dispatching booking emails:', err.message);
  }
}

module.exports = {
  sendInquiryNotification,
  sendBookingConfirmation
};
