const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true   // DB-level guard: one review per booking
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500,
      trim: true,
      default: ''
    },
    isVisible: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// ── Post-save hook: recalculate worker's average rating ─────────────────────
reviewSchema.post('save', async function () {
  try {
    const User = mongoose.model('User');

    const result = await mongoose.model('Review').aggregate([
      { $match: { worker: this.worker, isVisible: true } },
      {
        $group: {
          _id: '$worker',
          averageRating: { $avg: '$rating' },
          reviewCount:   { $sum: 1 }
        }
      }
    ]);

    if (result.length > 0) {
      const { averageRating, reviewCount } = result[0];
      await User.findByIdAndUpdate(this.worker, {
        rating:      Math.round(averageRating * 10) / 10, // 1 decimal place
        reviewCount
      });
    }
  } catch (err) {
    // Best-effort — never crash the request if rating update fails
    console.error('Review post-save hook — failed to update worker rating:', err.message);
  }
});

module.exports = mongoose.model('Review', reviewSchema);