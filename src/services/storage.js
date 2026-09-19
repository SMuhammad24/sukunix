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

function appendJsonFallback(filePath, record) {
  try {
    ensureDataDir();
    const records = readJsonFallback(filePath);
    records.unshift({
      ...record,
      _id: record._id || `fallback_${Date.now()}`,
      createdAt: new Date().toISOString()
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
  appendJsonFallback(INQUIRIES_FILE, inquiryData);
  return { ...inquiryData, _id: `local_${Date.now()}`, fallback: true };
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
  appendJsonFallback(BOOKINGS_FILE, bookingData);
  return { ...bookingData, _id: `local_${Date.now()}`, fallback: true };
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

module.exports = {
  saveInquiry,
  saveBooking,
  getStats
};
