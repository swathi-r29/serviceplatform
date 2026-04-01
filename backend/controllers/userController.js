const User = require('../models/User');
const Booking = require('../models/Booking');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    if (!req.body.name || req.body.name.trim() === '') {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!req.body.phone || req.body.phone.trim() === '') {
      return res.status(400).json({ message: 'Phone is required' });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name.trim();
      user.phone = req.body.phone.trim();
      if (req.body.address !== undefined) user.address = req.body.address.trim();

      if (req.file) {
        user.profileImage = `/uploads/${req.file.filename}`;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profileImage: updatedUser.profileImage
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('service')
      .populate('worker', 'name phone email rating')
      .sort('-createdAt');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserBookings
};