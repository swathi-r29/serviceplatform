const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null;

if (!razorpay) {
  console.warn('⚠️ WARNING: Razorpay keys are missing in .env. Payment functionality will be disabled.');
}

const createPaymentOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ message: 'Payment service is not configured. Please add Razorpay keys to .env' });
    }

    const {
      serviceId,
      workerId,
      scheduledDate,
      scheduledTime,
      address,
      locationCoords,
      notes,
      totalAmount
    } = req.body;

    // Validate required fields before touching Razorpay
    if (!serviceId || !workerId || !scheduledDate || !scheduledTime || !totalAmount) {
      return res.status(400).json({ message: 'Missing required booking details for payment order' });
    }

    const amountInPaise = Math.round(Number(totalAmount) * 100);
    if (amountInPaise <= 0) {
      return res.status(400).json({ message: 'Invalid totalAmount — must be greater than 0' });
    }

    // Booking details go into Razorpay order notes so they survive
    // the async Razorpay lifecycle without touching MongoDB yet.
    const bookingDetails = {
      serviceId,
      workerId,
      scheduledDate,
      scheduledTime,
      address: address || '',
      locationCoords: locationCoords ? JSON.stringify(locationCoords) : null,
      notes: notes || '',
      totalAmount: String(totalAmount),
      userId: req.user._id.toString()
    };

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${req.user._id.toString().slice(-6)}_${Date.now()}`,
      notes: bookingDetails   // Razorpay persists these server-side
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      bookingDetails   // echo back so frontend can pass in verify step
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ message: 'Payment service is not configured.' });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      booking.paymentStatus = 'paid';
      booking.paymentMethod = 'online';
      booking.paymentDetails = {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      };
      // Once paid, we can also set status to accepted if it fits the business logic
      if (booking.status === 'pending') {
        booking.status = 'accepted';
      }
      
      await booking.save();

      res.json({ success: true, message: 'Payment verified successfully', booking });
    } else {
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Razorpay Verification Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Payment-first flow: verify Razorpay signature and atomically create
 * the booking in one request. Called ONLY after the user completes
 * payment in the Razorpay modal.
 */
const verifyAndCreateBooking = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ message: 'Payment service is not configured.' });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingDetails
    } = req.body;

    // ── Step 1: Verify Razorpay signature ──────────────────────────────
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // ── Step 2: Idempotency — prevent duplicate bookings ───────────────
    const existing = await Booking.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existing) {
      return res.status(200).json({ success: true, bookingId: existing._id, duplicate: true });
    }

    // ── Step 3: Parse & validate booking details ───────────────────────
    const {
      serviceId,
      workerId,
      scheduledDate,
      scheduledTime,
      address,
      locationCoords,
      notes,
      totalAmount
    } = bookingDetails || {};

    if (!serviceId || !workerId || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ message: 'Incomplete booking details received.' });
    }

    // locationCoords may have been JSON-stringified for Razorpay notes
    let parsedCoords = locationCoords;
    if (typeof locationCoords === 'string') {
      try { parsedCoords = JSON.parse(locationCoords); } catch (_) { parsedCoords = null; }
    }

    // ── Step 4: Create booking — payment already confirmed ─────────────
    const booking = await Booking.create({
      user: req.user._id,
      service: serviceId,
      worker: workerId,
      scheduledDate,
      scheduledTime,
      address: address || '',
      notes: notes || '',
      locationCoords: parsedCoords || undefined,
      totalAmount: Number(totalAmount) || 0,
      status: 'pending',
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      statusHistory: [{
        status: 'pending',
        comment: 'Booking created after successful payment'
      }]
    });

    console.log(`✅ Booking created post-payment: ${booking._id} | Payment: ${razorpay_payment_id}`);

    return res.status(201).json({ success: true, bookingId: booking._id });

  } catch (error) {
    console.error('verifyAndCreateBooking Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: 'Booking validation failed', errors: messages });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPaymentOrder, verifyPayment, verifyAndCreateBooking };
