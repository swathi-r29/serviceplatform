const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'AC Repair', 'Cooking', 'Pest Control', 'Appliance Repair', 'Moving & Packing', 'Home Tutoring', 'Salon & Spa', 'Gardening', 'Smart Home', 'Other']
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  workers: [{
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    price: {
      type: Number
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);