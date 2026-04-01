const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { notifyBookingCreated } = require('../utils/notificationHelper');

const createBooking = async (req, res) => {
  try {
    const { serviceId, workerId, scheduledDate, scheduledTime, address, notes, locationCoords } = req.body;

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Calculate Discounts
    let subtotal = service.price;
    let volumeDiscount = 0;
    if (subtotal > 5000) {
      volumeDiscount = subtotal * 0.20;
    } else if (subtotal > 2000) {
      volumeDiscount = subtotal * 0.10;
    }

    let firstTimeDiscount = 0;
    const previousBookings = await Booking.countDocuments({ user: req.user._id });
    if (previousBookings === 0) {
      firstTimeDiscount = 200;
    }

    const totalAmount = Math.max(0, subtotal - volumeDiscount - firstTimeDiscount);

    const booking = await Booking.create({
      user: req.user._id,
      service: serviceId,
      worker: workerId,
      scheduledDate,
      scheduledTime,
      address,
      notes,
      totalAmount,
      status: 'pending',
      statusHistory: [{ status: 'pending', comment: 'Booking requested by user' }],
      locationCoords
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service')
      .populate('worker', 'name phone email')
      .populate('user', 'name phone email');

    await notifyBookingCreated(
      workerId,
      booking._id,
      req.user.name,
      service.name,
      req.app.get('io')
    );

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkDiscount = async (req, res) => {
  try {
    const previousBookings = await Booking.countDocuments({ user: req.user._id });
    console.log(`🔍 Checking discount for user ${req.user.name} (${req.user._id})`);
    console.log(`   Previous bookings found: ${previousBookings}`);

    res.json({
      isFirstBooking: previousBookings === 0,
      firstTimeDiscount: 200
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service')
      .populate('worker', 'name phone email rating')
      .populate('user', 'name phone email address');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBookingPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.paymentStatus = 'paid';
    booking.paymentMethod = paymentMethod;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  updateBookingPayment,
  cancelBooking,
  checkDiscount
};