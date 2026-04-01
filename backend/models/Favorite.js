const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure existence of either service or worker
favoriteSchema.pre('validate', async function () {
  if (!this.service && !this.worker) {
    throw new Error('Favorite must target either a service or a worker');
  }
});

// Ensure unique favorites per user for service or worker
favoriteSchema.index({ user: 1, service: 1 }, { unique: true, partialFilterExpression: { service: { $exists: true } } });
favoriteSchema.index({ user: 1, worker: 1 }, { unique: true, partialFilterExpression: { worker: { $exists: true } } });

module.exports = mongoose.model('Favorite', favoriteSchema);
