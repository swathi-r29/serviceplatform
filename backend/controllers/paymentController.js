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
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    const options = {
      amount: Math.round(booking.totalAmount * 100), // Amount in paise
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
      notes: {
        bookingId: bookingId,
        userId: req.user._id.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
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

module.exports = { createPaymentOrder, verifyPayment };
