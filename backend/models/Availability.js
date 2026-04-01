const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlots: [{
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  isBlocked: {
    type: Boolean,
    default: false
  },
  note: {
    type: String
  }
}, {
  timestamps: true
});

availabilitySchema.index({ worker: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);