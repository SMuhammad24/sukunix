const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: [true, 'Work email is required'],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    service: {
      type: String,
      default: 'Enterprise Software Development',
      trim: true
    },
    budget: {
      type: String,
      default: '$25,000 – $75,000',
      trim: true
    },
    message: {
      type: String,
      default: '',
      trim: true,
      maxlength: 3000
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal_sent', 'closed', 'archived'],
      default: 'new'
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Helpful index for querying latest inquiries
inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ email: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
