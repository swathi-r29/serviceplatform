const express = require('express');
const Favorite = require('../models/Favorite');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const router = express.Router();

router.use(protect);
router.use(checkRole('user'));

// GET all favorite services and workers
router.get('/', async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('service')
      .populate('worker') // Populate worker as well
      .sort('-createdAt');

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CONNECTED UTILS: Toggle Service Favorite
router.put('/:serviceId/favorite', async (req, res) => {
  try {
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      service: req.params.serviceId
    });

    if (existingFavorite) {
      await Favorite.findByIdAndDelete(existingFavorite._id);
      res.json({ message: 'Removed from favorites' });
    } else {
      const favorite = await Favorite.create({
        user: req.user._id,
        service: req.params.serviceId
      });
      const populatedFavorite = await Favorite.findById(favorite._id).populate('service');
      res.status(201).json(populatedFavorite);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CONNECTED UTILS: Toggle Worker Favorite
router.put('/worker/:workerId', async (req, res) => {
  try {
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      worker: req.params.workerId
    });

    if (existingFavorite) {
      await Favorite.findByIdAndDelete(existingFavorite._id);
      res.json({ message: 'Removed from favorites' });
    } else {
      const favorite = await Favorite.create({
        user: req.user._id,
        worker: req.params.workerId
      });
      const populatedFavorite = await Favorite.findById(favorite._id).populate('worker');
      res.status(201).json(populatedFavorite);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST rebook a favorite service (legacy, for completed bookings)
router.post('/rebook/:id', async (req, res) => {
  try {
    const originalBooking = await Booking.findById(req.params.id);

    if (!originalBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (originalBooking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { scheduledDate, scheduledTime, address } = req.body;

    const newBooking = await Booking.create({
      user: req.user._id,
      service: originalBooking.service,
      worker: originalBooking.worker,
      scheduledDate: scheduledDate || originalBooking.scheduledDate,
      scheduledTime: scheduledTime || originalBooking.scheduledTime,
      address: address || originalBooking.address,
      totalAmount: originalBooking.totalAmount,
      status: 'pending'
    });

    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('service')
      .populate('worker', 'name phone email');

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
