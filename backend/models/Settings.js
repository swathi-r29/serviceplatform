const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  systemNotifications: {
    type: Boolean,
    default: true
  },
  emailAlerts: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  allowNewRegistrations: {
    type: Boolean,
    default: true
  },
  defaultCommissionRate: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  supportEmail: {
    type: String,
    default: 'support@servicehub.com'
  },
  systemTimezone: {
    type: String,
    default: 'UTC',
    trim: true
  },
  backupFrequency: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    default: 'daily'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
