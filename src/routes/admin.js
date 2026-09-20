const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');
const { authenticateAdmin } = require('../middleware/auth');
const {
  getAdminStats,
  getAllInquiries,
  updateInquiry,
  deleteInquiry,
  getAllBookings,
  updateBooking,
  deleteBooking
} = require('../services/storage');

/**
 * Helper to escape fields for CSV output
 */
function toCsvValue(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * POST /api/admin/login
 * Validates admin credentials and generates JWT token
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both administrator email and password.'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const expectedEmail = config.admin.email.trim().toLowerCase();
    const expectedPassword = config.admin.password;

    // Strictly check credentials (allowing trimmed comparison to prevent accidental space errors)
    const isEmailValid = (trimmedEmail === expectedEmail);
    const isPasswordValid = (password === expectedPassword || password.trim() === expectedPassword.trim());

    if (!isEmailValid || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid administrator email or password.'
      });
    }

    // Sign JWT Token
    const token = jwt.sign(
      {
        email: trimmedEmail,
        role: 'superadmin',
        iss: 'sukunix.com'
      },
      config.admin.jwtSecret,
      { expiresIn: config.admin.jwtExpiresIn || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      admin: {
        email: trimmedEmail,
        name: 'Sukunix Senior Leadership',
        role: 'Super Administrator'
      }
    });
  } catch (err) {
    console.error('[Admin Login Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred during authentication.'
    });
  }
});

/**
 * GET /api/admin/me
 * Validate current token and return profile
 */
router.get('/me', authenticateAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    admin: req.admin
  });
});

/**
 * GET /api/admin/stats
 * Telemetry and dashboard KPI stats
 */
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = await getAdminStats();
    res.status(200).json({
      success: true,
      stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/inquiries
 * List leads with search and status filtering
 */
router.get('/inquiries', authenticateAdmin, async (req, res) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await getAllInquiries({ status, search, page, limit });
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/admin/inquiries/:id
 * Update inquiry status or internal notes
 */
router.patch('/inquiries/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updatePayload = {};
    if (status) updatePayload.status = status;
    if (notes !== undefined) updatePayload.notes = notes;

    const updated = await updateInquiry(id, updatePayload);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Inquiry record not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry status updated successfully.',
      inquiry: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/admin/inquiries/:id
 * Remove or purge inquiry
 */
router.delete('/inquiries/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteInquiry(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Inquiry record not found.' });
    }
    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/bookings
 * List consultation bookings with search and status filtering
 */
router.get('/bookings', authenticateAdmin, async (req, res) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await getAllBookings({ status, search, page, limit });
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/admin/bookings/:id
 * Update consultation status or deposit status
 */
router.patch('/bookings/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { meetingStatus, depositStatus, meetingId, zoomLink, passcode } = req.body;

    const updatePayload = {};
    if (meetingStatus) {
      updatePayload['meeting.status'] = meetingStatus;
      updatePayload.meeting = { status: meetingStatus };
    }
    if (meetingId || zoomLink || passcode) {
      updatePayload.meeting = {
        ...(updatePayload.meeting || {}),
        ...(meetingId && { meetingId }),
        ...(zoomLink && { zoomLink }),
        ...(passcode && { passcode })
      };
    }
    if (depositStatus) {
      updatePayload['deposit.status'] = depositStatus;
      updatePayload.deposit = { status: depositStatus };
    }

    const updated = await updateBooking(id, updatePayload);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Booking record not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully.',
      booking: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/admin/bookings/:id
 * Remove or purge consultation booking
 */
router.delete('/bookings/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteBooking(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Booking record not found.' });
    }
    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/export/:type
 * Export Inquiries or Bookings as a standard CSV download
 */
router.get('/export/:type', authenticateAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const timestamp = new Date().toISOString().slice(0, 10);

    if (type === 'inquiries') {
      const { inquiries } = await getAllInquiries({ limit: 10000 });
      const headers = ['ID', 'Date', 'Client Name', 'Work Email', 'Service', 'Budget', 'Status', 'Message', 'IP'];
      const rows = inquiries.map(i => [
        toCsvValue(i._id),
        toCsvValue(i.createdAt || ''),
        toCsvValue(i.name || ''),
        toCsvValue(i.email || ''),
        toCsvValue(i.service || ''),
        toCsvValue(i.budget || ''),
        toCsvValue(i.status || 'new'),
        toCsvValue(i.message || ''),
        toCsvValue(i.ipAddress || '')
      ].join(','));

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="sukunix_inquiries_${timestamp}.csv"`);
      return res.status(200).send(csvContent);
    }

    if (type === 'bookings') {
      const { bookings } = await getAllBookings({ limit: 10000 });
      const headers = ['Booking Ref', 'Created At', 'Client Name', 'Email', 'WhatsApp', 'Company', 'Slot Date', 'Slot Time', 'Timezone', 'Deposit Currency', 'Deposit Amount', 'Payment Status', 'Meeting Status', 'Zoom Link', 'Meeting ID', 'Passcode'];
      const rows = bookings.map(b => [
        toCsvValue(b.bookingRef || ''),
        toCsvValue(b.createdAt || ''),
        toCsvValue(b.client?.name || ''),
        toCsvValue(b.client?.email || ''),
        toCsvValue(b.client?.whatsapp || ''),
        toCsvValue(b.client?.company || ''),
        toCsvValue(b.slot?.dateFormatted || b.slot?.date || ''),
        toCsvValue(b.slot?.time || ''),
        toCsvValue(b.slot?.timezone || ''),
        toCsvValue(b.deposit?.currency || 'INR'),
        toCsvValue(b.deposit?.amount || 499),
        toCsvValue(b.deposit?.status || 'paid'),
        toCsvValue(b.meeting?.status || 'scheduled'),
        toCsvValue(b.meeting?.zoomLink || ''),
        toCsvValue(b.meeting?.meetingId || ''),
        toCsvValue(b.meeting?.passcode || '')
      ].join(','));

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="sukunix_bookings_${timestamp}.csv"`);
      return res.status(200).send(csvContent);
    }

    return res.status(400).json({ success: false, error: 'Invalid export type. Use "inquiries" or "bookings".' });
  } catch (err) {
    console.error('[Admin Export Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
