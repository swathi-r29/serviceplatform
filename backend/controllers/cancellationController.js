const Booking = require('../models/Booking');
const User = require('../models/User');
const axios = require('axios');
const { notifyBookingStatusChange } = require('../utils/notificationHelper'); // Assume similar to notifyBookingCreated

const calculateRefundAmount = (booking) => {
  if (booking.status === 'in-progress' || booking.status === 'completed') {
    throw new Error('Service already started or completed');
  }

  // If worker cancels (Rule 4), user gets 100% refund regardless of time
  if (booking.cancelledBy === 'worker' || booking.cancelledBy === 'admin') {
    return { refundAmount: booking.totalAmount, refundPercentage: 100, reason: 'Provider cancelled' };
  }

  // User cancels (Rules 1, 2, 3)
  if (booking.status === 'pending') {
    // Rule 1
    return { refundAmount: booking.totalAmount, refundPercentage: 100, reason: 'Cancelled before confirmation' };
  } else if (booking.status === 'accepted') {
    // Determine time difference
    if (!booking.scheduledDate || !booking.scheduledTime) {
      // Fallback
      return { refundAmount: booking.totalAmount, refundPercentage: 100, reason: 'Time missing' };
    }

    const scheduledDateTime = new Date(`${new Date(booking.scheduledDate).toDateString()} ${booking.scheduledTime}`);
    const now = new Date();
    const hoursDiff = (scheduledDateTime - now) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      // Rule 2
      const amount = Math.round(booking.totalAmount * 0.8);
      return { refundAmount: amount, refundPercentage: 80, reason: 'Cancelled >24hrs before schedule' };
    } else {
      // Rule 3
      const amount = Math.round(booking.totalAmount * 0.5);
      return { refundAmount: amount, refundPercentage: 50, reason: 'Cancelled <24hrs before schedule' };
    }
  }

  return { refundAmount: booking.totalAmount, refundPercentage: 100, reason: 'Other' };
};

exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

    const booking = await Booking.findById(bookingId).populate('user worker');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Determine cancelledBy
    if (booking.user._id.toString() === req.user._id.toString()) {
      booking.cancelledBy = 'user';
    } else if (req.user.role === 'worker' && booking.worker && booking.worker._id.toString() === req.user._id.toString()) {
      booking.cancelledBy = 'worker';
    } else if (req.user.role === 'admin') {
      booking.cancelledBy = 'admin';
    } else {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (['in-progress', 'completed', 'cancelled', 'rejected'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel booking in current status: ' + booking.status });
    }

    // Calculate refund
    let refundInfo;
    try {
      refundInfo = calculateRefundAmount(booking);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const { refundAmount, refundPercentage, reason: refundReasonStr } = refundInfo;

    // Razorpay interaction
    let refundId = null;
    let refundStatus = 'none';

    if (booking.paymentStatus === 'paid' && booking.razorpayPaymentId) {
      try {
        const authHeader = `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`;
        const response = await axios.post(
          `https://api.razorpay.com/v1/payments/${booking.razorpayPaymentId}/refund`,
          { amount: Math.round(refundAmount * 100) }, // in paise
          { headers: { Authorization: authHeader } }
        );

        refundId = response.data.id;
        refundStatus = 'processing';
        // Some refunds might be 'processed' immediately.
        if (response.data.status === 'processed') refundStatus = 'processed';
      } catch (rzpErr) {
        console.error('Razorpay refund error:', rzpErr.response ? rzpErr.response.data : rzpErr.message);
        refundStatus = 'failed';
      }
    }

    // Update booking
    booking.status = 'cancelled';
    booking.paymentStatus = (refundStatus === 'processing' || refundStatus === 'processed') ? 'refunded' : booking.paymentStatus;
    booking.cancellationReason = reason || refundReasonStr;
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;
    booking.refundId = refundId;
    booking.refundStatus = refundStatus;

    booking.statusHistory.push({
      status: 'cancelled',
      comment: `Cancelled by ${booking.cancelledBy}. Reason: ${reason || refundReasonStr}`,
      timestamp: new Date()
    });

    await booking.save();

    // If worker cancelled, increment their cancellationCount
    if (booking.cancelledBy === 'worker' && booking.worker) {
      await User.findByIdAndUpdate(booking.worker._id, { $inc: { cancellationCount: 1 } });
    }

    // Optional: send notifications using existing helper
    try {
        if (typeof notifyBookingStatusChange === 'function') {
           await notifyBookingStatusChange(booking);
        }
    } catch(notifErr) { console.log('Notification error:', notifErr.message); }

    const messageDetails = refundAmount > 0 
      ? `Refund of ₹${refundAmount} will be credited in 5-7 days`
      : `Booking cancelled successfully.`;

    if (refundStatus === 'failed') {
      return res.status(200).json({ // Return 200 so UI can update, but warn
        success: true,
        refundAmount,
        refundPercentage,
        refundId,
        message: 'Booking cancelled but refund failed. Admin has been notified.'
      });
    }

    return res.status(200).json({
      success: true,
      refundAmount,
      refundPercentage,
      refundId,
      message: messageDetails
    });

  } catch (error) {
    console.error('Cancellation error:', error);
    res.status(500).json({ message: 'Internal server error during cancellation' });
  }
};

exports.getRefundStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!booking.refundId) {
      return res.status(404).json({ message: 'No refund associated with this booking' });
    }

    const authHeader = `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`;
    const response = await axios.get(
      `https://api.razorpay.com/v1/refunds/${booking.refundId}`,
      { headers: { Authorization: authHeader } }
    );

    const rzpStatus = response.data.status; // usually 'pending', 'processed', or 'failed'
    
    let updatedStatus = booking.refundStatus;
    if (rzpStatus === 'processed') updatedStatus = 'processed';
    if (rzpStatus === 'failed') updatedStatus = 'failed';

    if (updatedStatus !== booking.refundStatus) {
      booking.refundStatus = updatedStatus;
      await booking.save();
    }

    res.status(200).json({
      refundStatus: updatedStatus,
      expectedCreditDate: '5-7 business days',
      razorpayStatus: rzpStatus
    });

  } catch (error) {
    console.error('Get refund status error:', error);
    res.status(500).json({ message: 'Internal server error while fetching refund status' });
  }
};
