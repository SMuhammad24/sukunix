const fs = require('fs');
const path = require('path');
const Inquiry = require('../models/Inquiry');
const Booking = require('../models/Booking');
const { isDbConnected } = require('../config/db');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// Ensure local fallback data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFallback(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`[Storage] Error reading fallback file ${filePath}:`, err.message);
  }
  return [];
}

function writeJsonFallback(filePath, records) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf8');
  } catch (err) {
    console.error(`[Storage] Failed to write fallback file ${filePath}:`, err.message);
  }
}

function appendJsonFallback(filePath, record) {
  try {
    ensureDataDir();
    const records = readJsonFallback(filePath);
    records.unshift({
      ...record,
      _id: record._id || `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: record.createdAt || new Date().toISOString()
    });
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf8');
  } catch (err) {
    console.error(`[Storage] Failed to write fallback file ${filePath}:`, err.message);
  }
}

/**
 * Save a new client project inquiry
 */
async function saveInquiry(inquiryData) {
  if (isDbConnected()) {
    try {
      const doc = new Inquiry(inquiryData);
      return await doc.save();
    } catch (dbErr) {
      console.warn('[Storage] MongoDB save failed, falling back to local file:', dbErr.message);
    }
  }
  // Fallback
  const fallbackRecord = {
    ...inquiryData,
    _id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    status: inquiryData.status || 'new',
    createdAt: new Date().toISOString()
  };
  appendJsonFallback(INQUIRIES_FILE, fallbackRecord);
  return fallbackRecord;
}

/**
 * Save a new consultation booking
 */
async function saveBooking(bookingData) {
  if (isDbConnected()) {
    try {
      const doc = new Booking(bookingData);
      return await doc.save();
    } catch (dbErr) {
      console.warn('[Storage] MongoDB booking save failed, falling back to local file:', dbErr.message);
    }
  }
  // Fallback
  const fallbackRecord = {
    ...bookingData,
    _id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString()
  };
  appendJsonFallback(BOOKINGS_FILE, fallbackRecord);
  return fallbackRecord;
}

/**
 * Get system stats (counts of leads and bookings)
 */
async function getStats() {
  let inquiryCount = 0;
  let bookingCount = 0;

  if (isDbConnected()) {
    try {
      inquiryCount = await Inquiry.countDocuments();
      bookingCount = await Booking.countDocuments();
      return { inquiryCount, bookingCount, source: 'mongodb' };
    } catch (err) {
      console.warn('[Storage] Error querying counts:', err.message);
    }
  }

  const inqs = readJsonFallback(INQUIRIES_FILE);
  const bks = readJsonFallback(BOOKINGS_FILE);
  return {
    inquiryCount: inqs.length,
    bookingCount: bks.length,
    source: 'local_fallback'
  };
}

/**
 * Get full admin statistics including status breakdown & revenue totals
 */
async function getAdminStats() {
  if (isDbConnected()) {
    try {
      const [totalInquiries, newInquiries, contactedInquiries] = await Promise.all([
        Inquiry.countDocuments(),
        Inquiry.countDocuments({ status: 'new' }),
        Inquiry.countDocuments({ status: { $in: ['contacted', 'qualified', 'proposal_sent'] } })
      ]);

      const [totalBookings, scheduledBookings, completedBookings, bookingsWithDeposit] = await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ 'meeting.status': 'scheduled' }),
        Booking.countDocuments({ 'meeting.status': 'completed' }),
        Booking.find({ 'deposit.status': { $in: ['paid', 'credited_to_invoice'] } }, 'deposit')
      ]);

      let totalDepositInr = 0;
      let totalDepositUsd = 0;
      bookingsWithDeposit.forEach(b => {
        if (b.deposit && b.deposit.currency === 'USD') {
          totalDepositUsd += Number(b.deposit.amount || 19);
        } else {
          totalDepositInr += Number(b.deposit?.amount || 499);
        }
      });

      return {
        source: 'mongodb',
        inquiries: {
          total: totalInquiries,
          new: newInquiries,
          contacted: contactedInquiries
        },
        bookings: {
          total: totalBookings,
          scheduled: scheduledBookings,
          completed: completedBookings,
          totalDepositInr,
          totalDepositUsd
        }
      };
    } catch (err) {
      console.warn('[Storage] getAdminStats error in MongoDB:', err.message);
    }
  }

  // Local fallback aggregation
  const inqs = readJsonFallback(INQUIRIES_FILE);
  const bks = readJsonFallback(BOOKINGS_FILE);

  let newInq = 0;
  let contactedInq = 0;
  inqs.forEach(i => {
    if (i.status === 'new') newInq++;
    else if (['contacted', 'qualified', 'proposal_sent'].includes(i.status)) contactedInq++;
  });

  let scheduledBks = 0;
  let completedBks = 0;
  let totalDepositInr = 0;
  let totalDepositUsd = 0;
  bks.forEach(b => {
    const meetingStatus = b.meeting?.status || 'scheduled';
    if (meetingStatus === 'scheduled') scheduledBks++;
    if (meetingStatus === 'completed') completedBks++;

    if (b.deposit && (b.deposit.status === 'paid' || b.deposit.status === 'credited_to_invoice')) {
      if (b.deposit.currency === 'USD') {
        totalDepositUsd += Number(b.deposit.amount || 19);
      } else {
        totalDepositInr += Number(b.deposit.amount || 499);
      }
    }
  });

  return {
    source: 'local_fallback',
    inquiries: {
      total: inqs.length,
      new: newInq,
      contacted: contactedInq
    },
    bookings: {
      total: bks.length,
      scheduled: scheduledBks,
      completed: completedBks,
      totalDepositInr,
      totalDepositUsd
    }
  };
}

/**
 * Fetch all Inquiries with search, filter, and pagination
 */
async function getAllInquiries({ status, search, page = 1, limit = 50 } = {}) {
  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const pageLimit = parseInt(limit, 10);

  if (isDbConnected()) {
    try {
      const query = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { name: regex },
          { email: regex },
          { service: regex },
          { message: regex }
        ];
      }

      const [total, inquiries] = await Promise.all([
        Inquiry.countDocuments(query),
        Inquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageLimit).lean()
      ]);

      return { total, inquiries, page: parseInt(page, 10), limit: pageLimit, source: 'mongodb' };
    } catch (err) {
      console.warn('[Storage] getAllInquiries MongoDB error:', err.message);
    }
  }

  // Local fallback
  let list = readJsonFallback(INQUIRIES_FILE);
  if (status && status !== 'all') {
    list = list.filter(i => (i.status || 'new') === status);
  }
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    list = list.filter(i =>
      (i.name && i.name.toLowerCase().includes(s)) ||
      (i.email && i.email.toLowerCase().includes(s)) ||
      (i.service && i.service.toLowerCase().includes(s)) ||
      (i.message && i.message.toLowerCase().includes(s))
    );
  }

  // Sort descending by date
  list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const total = list.length;
  const inquiries = list.slice(skip, skip + pageLimit);
  return { total, inquiries, page: parseInt(page, 10), limit: pageLimit, source: 'local_fallback' };
}

/**
 * Update an inquiry record
 */
async function updateInquiry(id, updateData) {
  if (isDbConnected()) {
    try {
      const updated = await Inquiry.findByIdAndUpdate(id, { $set: updateData }, { new: true });
      if (updated) return updated;
    } catch (err) {
      console.warn('[Storage] updateInquiry MongoDB error:', err.message);
    }
  }

  // Fallback
  const list = readJsonFallback(INQUIRIES_FILE);
  const index = list.findIndex(i => String(i._id) === String(id));
  if (index !== -1) {
    list[index] = { ...list[index], ...updateData, updatedAt: new Date().toISOString() };
    writeJsonFallback(INQUIRIES_FILE, list);
    return list[index];
  }
  return null;
}

/**
 * Delete an inquiry
 */
async function deleteInquiry(id) {
  if (isDbConnected()) {
    try {
      const deleted = await Inquiry.findByIdAndDelete(id);
      if (deleted) return true;
    } catch (err) {
      console.warn('[Storage] deleteInquiry MongoDB error:', err.message);
    }
  }

  // Fallback
  const list = readJsonFallback(INQUIRIES_FILE);
  const filtered = list.filter(i => String(i._id) !== String(id));
  if (filtered.length !== list.length) {
    writeJsonFallback(INQUIRIES_FILE, filtered);
    return true;
  }
  return false;
}

/**
 * Fetch all Bookings with search, filter, and pagination
 */
async function getAllBookings({ status, search, page = 1, limit = 50 } = {}) {
  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const pageLimit = parseInt(limit, 10);

  if (isDbConnected()) {
    try {
      const query = {};
      if (status && status !== 'all') {
        query['meeting.status'] = status;
      }
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { bookingRef: regex },
          { 'client.name': regex },
          { 'client.email': regex },
          { 'client.whatsapp': regex },
          { 'client.company': regex }
        ];
      }

      const [total, bookings] = await Promise.all([
        Booking.countDocuments(query),
        Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageLimit).lean()
      ]);

      return { total, bookings, page: parseInt(page, 10), limit: pageLimit, source: 'mongodb' };
    } catch (err) {
      console.warn('[Storage] getAllBookings MongoDB error:', err.message);
    }
  }

  // Local fallback
  let list = readJsonFallback(BOOKINGS_FILE);
  if (status && status !== 'all') {
    list = list.filter(b => (b.meeting?.status || 'scheduled') === status);
  }
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    list = list.filter(b =>
      (b.bookingRef && b.bookingRef.toLowerCase().includes(s)) ||
      (b.client?.name && b.client.name.toLowerCase().includes(s)) ||
      (b.client?.email && b.client.email.toLowerCase().includes(s)) ||
      (b.client?.whatsapp && b.client.whatsapp.toLowerCase().includes(s)) ||
      (b.client?.company && b.client.company.toLowerCase().includes(s))
    );
  }

  // Sort descending by date
  list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const total = list.length;
  const bookings = list.slice(skip, skip + pageLimit);
  return { total, bookings, page: parseInt(page, 10), limit: pageLimit, source: 'local_fallback' };
}

/**
 * Update a booking record
 */
async function updateBooking(id, updateData) {
  if (isDbConnected()) {
    try {
      const updated = await Booking.findByIdAndUpdate(id, { $set: updateData }, { new: true });
      if (updated) return updated;
      // also try by bookingRef
      const updatedByRef = await Booking.findOneAndUpdate({ bookingRef: id }, { $set: updateData }, { new: true });
      if (updatedByRef) return updatedByRef;
    } catch (err) {
      console.warn('[Storage] updateBooking MongoDB error:', err.message);
    }
  }

  // Fallback
  const list = readJsonFallback(BOOKINGS_FILE);
  const index = list.findIndex(b => String(b._id) === String(id) || String(b.bookingRef) === String(id));
  if (index !== -1) {
    list[index] = {
      ...list[index],
      ...updateData,
      meeting: { ...list[index].meeting, ...(updateData.meeting || {}) },
      deposit: { ...list[index].deposit, ...(updateData.deposit || {}) },
      updatedAt: new Date().toISOString()
    };
    writeJsonFallback(BOOKINGS_FILE, list);
    return list[index];
  }
  return null;
}

/**
 * Delete a booking
 */
async function deleteBooking(id) {
  if (isDbConnected()) {
    try {
      const deleted = await Booking.findByIdAndDelete(id);
      if (deleted) return true;
      const deletedByRef = await Booking.findOneAndDelete({ bookingRef: id });
      if (deletedByRef) return true;
    } catch (err) {
      console.warn('[Storage] deleteBooking MongoDB error:', err.message);
    }
  }

  // Fallback
  const list = readJsonFallback(BOOKINGS_FILE);
  const filtered = list.filter(b => String(b._id) !== String(id) && String(b.bookingRef) !== String(id));
  if (filtered.length !== list.length) {
    writeJsonFallback(BOOKINGS_FILE, filtered);
    return true;
  }
  return false;
}

module.exports = {
  saveInquiry,
  saveBooking,
  getStats,
  getAdminStats,
  getAllInquiries,
  updateInquiry,
  deleteInquiry,
  getAllBookings,
  updateBooking,
  deleteBooking
};
