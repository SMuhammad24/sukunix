const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    client: {
      name: {
        type: String,
        required: [true, 'Attendee name is required'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'Attendee email is required'],
        trim: true,
        lowercase: true
      },
      whatsapp: {
        type: String,
        required: [true, 'WhatsApp number is required'],
        trim: true
      },
      company: {
        type: String,
        default: 'Stealth / Confidential',
        trim: true
      },
      service: {
        type: String,
        default: 'Enterprise Web System',
        trim: true
      }
    },
    slot: {
      date: {
        type: String,
        required: true
      },
      dateFormatted: {
        type: String,
        required: true
      },
      time: {
        type: String,
        required: true
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata (IST)'
      }
    },
    deposit: {
      currency: {
        type: String,
        default: 'INR'
      },
      amount: {
        type: Number,
        default: 499
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'credited_to_invoice', 'refunded'],
        default: 'paid'
      },
      paymentId: {
        type: String,
        default: ''
      }
    },
    meeting: {
      meetingId: {
        type: String,
        default: ''
      },
      passcode: {
        type: String,
        default: ''
      },
      zoomLink: {
        type: String,
        default: ''
      },
      status: {
        type: String,
        enum: ['scheduled', 'completed', 'rescheduled', 'cancelled'],
        default: 'scheduled'
      }
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ bookingRef: 1 }, { unique: true });
bookingSchema.index({ 'client.email': 1 });
bookingSchema.index({ 'slot.date': 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
