const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');

const exportBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('worker', 'name email')
      .populate('service', 'name');

    const csvData = bookings.map(booking => ({
      ID: booking._id,
      User: booking.user.name,
      Worker: booking.worker.name,
      Service: booking.service.name,
      Date: booking.date,
      Time: booking.time,
      Status: booking.status,
      Amount: booking.totalAmount
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');
    res.status(200).send(csvData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });

    const csvData = users.map(user => ({
      ID: user._id,
      Name: user.name,
      Email: user.email,
      Phone: user.phone,
      Location: user.location,
      Created: user.createdAt
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.status(200).send(csvData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' });

    const csvData = workers.map(worker => ({
      ID: worker._id,
      Name: worker.name,
      Email: worker.email,
      Phone: worker.phone,
      Skills: worker.skills.join(', '),
      Rating: worker.rating,
      Created: worker.createdAt
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="workers.csv"');
    res.status(200).send(csvData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { exportBookings, exportUsers, exportWorkers };
