const Review  = require('../models/Review');
const Booking = require('../models/Booking');

// ── Helpers ──────────────────────────────────────────────────────────────────

const buildRatingDistribution = (reviews) => {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if (dist[r.rating] !== undefined) dist[r.rating]++; });
  return dist;
};

// ── a) createReview ──────────────────────────────────────────────────────────
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // 1. Booking must exist
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // 2. Only the customer who made the booking can review
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to review this booking' });
    }

    // 3. Booking must be completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review a completed booking' });
    }

    // 4. Payment must be confirmed
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Payment must be completed before leaving a review' });
    }

    // 5. One review per booking
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    // 6. Rating must be 1–5 integer
    const parsedRating = parseInt(rating, 10);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    const review = await Review.create({
      booking:  bookingId,
      user:     req.user._id,
      worker:   booking.worker,
      service:  booking.service,
      rating:   parsedRating,
      comment:  comment ? comment.trim().slice(0, 500) : ''
    });

    const populated = await Review.findById(review._id)
      .populate('user',    'name profileImage')
      .populate('worker',  'name profileImage')
      .populate('service', 'name category');

    return res.status(201).json(populated);
  } catch (error) {
    console.error('createReview error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    res.status(500).json({ message: error.message });
  }
};

// ── b) getWorkerReviews ──────────────────────────────────────────────────────
exports.getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;

    const reviews = await Review.find({ worker: workerId, isVisible: true })
      .populate('user',    'name profileImage')
      .populate('service', 'name category')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0;
    const ratingDistribution = buildRatingDistribution(reviews);

    return res.status(200).json({
      summary: { averageRating, totalReviews, ratingDistribution },
      reviews
    });
  } catch (error) {
    console.error('getWorkerReviews error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── c) getUserReviews ────────────────────────────────────────────────────────
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('worker',  'name profileImage')
      .populate('service', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json(reviews);
  } catch (error) {
    console.error('getUserReviews error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── d) checkCanReview ────────────────────────────────────────────────────────
exports.checkCanReview = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ canReview: false, reason: 'not_found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(200).json({ canReview: false, reason: 'not_authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(200).json({ canReview: false, reason: 'not_completed' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(200).json({ canReview: false, reason: 'not_paid' });
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(200).json({ canReview: false, reason: 'already_reviewed' });
    }

    return res.status(200).json({ canReview: true, reason: 'can_review' });
  } catch (error) {
    console.error('checkCanReview error:', error);
    res.status(500).json({ message: error.message });
  }
};