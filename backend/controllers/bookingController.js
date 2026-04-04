const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { notifyBookingCreated } = require('../utils/notificationHelper');
const { getServicePrice } = require('../utils/pricingHelper');

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  console.log(`📍 Distance Check: User(${lat1}, ${lon1}) <-> Worker(${lat2}, ${lon2})`);
  
  const R = 6371; // km
  const dLat = (Number(lat2) - Number(lat1)) * Math.PI / 180;
  const dLon = (Number(lon2) - Number(lon1)) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(Number(lat1) * Math.PI / 180) * Math.cos(Number(lat2) * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  const distance = Math.round(d * 10) / 10;
  console.log(`   📏 Result: ${distance} km`);
  return distance;
};

const getTravelFee = (distance) => {
  if (distance === null) return 30; // Base rate for local/platform fee
  if (distance <= 5) return 30; // Local flat fee
  return Math.round(distance * 10); // Outstation: ₹10/km
};

const createBooking = async (req, res) => {
  try {
    const { serviceId, workerId, scheduledDate, scheduledTime, address, notes, locationCoords } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const worker = await User.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Calculate distance and travel fee
    const distance = calculateDistance(
      locationCoords?.lat, locationCoords?.lng,
      worker.coordinates?.lat, worker.coordinates?.lng
    );
    const travelCharge = getTravelFee(distance);

    // 🚀 Senior Refactor: Use centralized Pricing Helper
    const priceResult = getServicePrice(worker, service.category, service, travelCharge);

    // Apply Platform-level discounts to the total (if any)
    let volumeDiscount = 0;
    if (priceResult.basePrice > 5000) {
      volumeDiscount = priceResult.basePrice * 0.20;
    } else if (priceResult.basePrice > 2000) {
      volumeDiscount = priceResult.basePrice * 0.10;
    }

    let firstTimeDiscount = 0;
    const previousBookings = await Booking.countDocuments({ user: req.user._id });
    if (previousBookings === 0) {
      firstTimeDiscount = 200;
    }

    const totalAmount = Math.max(0, priceResult.total - volumeDiscount - firstTimeDiscount);

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