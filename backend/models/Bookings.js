// backend/models/Booking.js

const bookingSchema = new mongoose.Schema({
  // ... existing fields ...
  
  totalAmount: {
    type: Number,
    required: true
  },
  tips: {
    type: Number,
    default: 0
  },
  bonus: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  workerPayoutStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  workerPayoutDate: {
    type: Date
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
  
  // ... other fields ...
}, {
  timestamps: true
});