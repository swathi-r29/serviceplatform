const Notification = require('../models/Notification');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { 
  sendNewBookingEmail, 
  sendBookingAcceptedEmail, 
  sendServiceCompletedEmail 
} = require('./mailHelper');

const createNotification = async (userId, title, message, type, relatedId = null, relatedModel = null, io = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedId,
      relatedModel
    });
    if (io) {
      io.to(userId).emit('notification', notification.toObject());
    }
  } catch (error) {
    console.error('Notification creation error:', error);
  }
};

const notifyBookingCreated = async (workerId, bookingId, userName, serviceName, io = null) => {
  await createNotification(
    workerId,
    'New Booking Received!',
    `${userName} has booked ${serviceName}. Please review and accept.`,
    'booking',
    bookingId,
    'Booking',
    io
  );

  // Send Email to Worker
  try {
    const worker = await User.findById(workerId);
    const booking = await Booking.findById(bookingId);
    if (worker && booking) {
      const date = new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      await sendNewBookingEmail(
        worker.email,
        worker.name,
        userName,
        serviceName,
        date,
        booking.scheduledTime
      );
    }
  } catch (emailError) {
    console.error('Failed to send booking creation email:', emailError.message);
  }
};

const notifyBookingAccepted = async (userId, bookingId, workerName, serviceName, io = null) => {
  await createNotification(
    userId,
    'Booking Accepted!',
    `${workerName} has accepted your booking for ${serviceName}. Please make payment.`,
    'booking',
    bookingId,
    'Booking',
    io
  );

  // Send Email to User
  try {
    const user = await User.findById(userId);
    if (user) {
      await sendBookingAcceptedEmail(
        user.email,
        user.name,
        workerName,
        serviceName,
        bookingId
      );
    }
  } catch (emailError) {
    console.error('Failed to send booking acceptance email:', emailError.message);
  }
};

const notifyBookingRejected = async (userId, bookingId, workerName, serviceName) => {
  await createNotification(
    userId,
    'Booking Rejected',
    `${workerName} has rejected your booking for ${serviceName}.`,
    'booking',
    bookingId,
    'Booking'
  );
};

const notifyPaymentReceived = async (workerId, bookingId, userName, amount, io = null) => {
  await createNotification(
    workerId,
    'Payment Received!',
    `${userName} has completed payment of ₹${amount}. You can now start the service.`,
    'payment',
    bookingId,
    'Booking',
    io
  );
};

const notifyServiceCompleted = async (userId, bookingId, serviceName, io = null) => {
  await createNotification(
    userId,
    'Service Completed!',
    `Your ${serviceName} has been completed. Please submit a review.`,
    'booking',
    bookingId,
    'Booking',
    io
  );

  // Send Email to User
  try {
    const user = await User.findById(userId);
    if (user) {
      await sendServiceCompletedEmail(
        user.email,
        user.name,
        serviceName,
        bookingId
      );
    }
  } catch (emailError) {
    console.error('Failed to send service completion email:', emailError.message);
  }
};

const notifyWorkerOnTheWay = async (userId, bookingId, workerName, serviceName, io = null) => {
  await createNotification(
    userId,
    'Provider on the way!',
    `${workerName} is on their way to your location for ${serviceName}.`,
    'booking',
    bookingId,
    'Booking',
    io
  );
};

const notifyServiceInProgress = async (userId, bookingId, serviceName, io = null) => {
  await createNotification(
    userId,
    'Service in progress!',
    `Your ${serviceName} service has started.`,
    'booking',
    bookingId,
    'Booking',
    io
  );
};

const notifyReviewReceived = async (workerId, reviewId, userName, rating, io = null) => {
  await createNotification(
    workerId,
    'New Review!',
    `${userName} has rated you ${rating} stars. Check your reviews.`,
    'review',
    reviewId,
    'Review',
    io
  );
};

module.exports = {
  createNotification,
  notifyBookingCreated,
  notifyBookingAccepted,
  notifyBookingRejected,
  notifyPaymentReceived,
  notifyServiceCompleted,
  notifyWorkerOnTheWay,
  notifyServiceInProgress,
  notifyReviewReceived
};