const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'location'],
    default: 'text'
  },
  imageUrl: String,
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [messageSchema],
  lastMessage: {
    type: String
  },
  lastMessageTime: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);