const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { notifyReviewReceived } = require('../utils/notificationHelper');

const createReview = async (req, res) => {
  try {
    const { bookingId, workerId, rating, comment, tags } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already submitted' });
    }

    const review = await Review.create({
      user: req.user._id,
      worker: workerId,
      booking: bookingId,
      rating,
      comment,
      isVerified: booking.status === 'completed',
      tags: tags || []
    });

    const worker = await User.findById(workerId);
    const totalRating = worker.rating * worker.reviewCount + rating;
    worker.reviewCount += 1;
    worker.rating = totalRating / worker.reviewCount;
    await worker.save();

    await notifyReviewReceived(
      workerId,
      review._id,
      req.user.name,
      rating,
      req.app.get('io')
    );

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWorkerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate('user', 'name profileImage')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getWorkerReviews
};