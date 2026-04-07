const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'on-the-way', 'in-progress', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [
    {
      status: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      comment: String
    }
  ],
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'upi'],
    default: 'cash'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  baseServicePrice: {
    type: Number
  },
  travelFee: {
    type: Number
  },
  paymentDetails: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String
  },
  notes: {
    type: String
  },
  locationCoords: {
    lat: { type: Number },
    lng: { type: Number }
  },
  cancelledBy: {
    type: String,
    enum: ['user', 'worker', 'admin']
  },
  cancellationReason: {
    type: String,
    maxLength: 300
  },
  cancelledAt: {
    type: Date
  },
  refundAmount: {
    type: Number
  },
  refundId: {
    type: String
  },
  refundStatus: {
    type: String,
    enum: ['none', 'processing', 'processed', 'failed'],
    default: 'none'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);