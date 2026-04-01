
const Settings = require('../models/Settings');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all workers
const getAllWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' }).select('-password').sort('-createdAt');
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate('service', 'name price')
      .populate('worker', 'name phone email')
      .sort('-createdAt');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const allBookings = await Booking.find().populate('user worker');
    const validBookings = allBookings.filter(b => b.user && (b.worker || b.status === 'pending' || b.status === 'cancelled')); // Allow unassigned pending/cancelled
    const totalBookings = validBookings.length;

    const completedBookings = validBookings.filter(b => b.status === 'completed').length;
    const pendingApprovals = await User.countDocuments({ role: 'worker', status: 'pending' });

    // Calculate total revenue from completed bookings by verified users
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $match: { 'userDetails.0': { $exists: true } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Filter pending bookings to only count those with existing workers/users
    const allPending = await Booking.find({ status: 'pending' }).populate('user worker');
    const validPendingBookings = allPending.filter(b => b.user && b.worker);
    const pendingBookings = validPendingBookings.length;

    res.json({
      totalUsers,
      totalWorkers,
      totalBookings,
      completedBookings,
      pendingBookings,
      pendingApprovals,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recent bookings
const getRecentBookings = async (req, res) => {
  try {
    const allRecent = await Booking.find()
      .populate('user', 'name email')
      .populate('service', 'name category')
      .populate('worker', 'name')
      .sort('-createdAt');

    // Filter out ghost bookings and limit to 10
    const filteredRecent = allRecent.filter(b => b.user).slice(0, 10);
    res.json(filteredRecent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent updating admin role or other sensitive fields
    const allowedUpdates = ['name', 'email', 'phone', 'location', 'skills', 'isAvailable', 'profileImage'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(id, filteredUpdates, { new: true }).select('-password');
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send message to user
const sendMessageToUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a notification for the user
    const Notification = require('../models/Notification');
    const notification = new Notification({
      user: id,
      title: 'Message from Admin',
      message: message,
      type: 'admin_message'
    });

    await notification.save();

    // Emit notification via socket if available
    const io = req.app.get('io');
    if (io) {
      io.to(id).emit('notification', notification);
    }

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cascade delete associated bookings
    await Booking.deleteMany({
      $or: [
        { user: req.params.id },
        { worker: req.params.id }
      ]
    });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User and their associated bookings deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle user/worker status (Active/Inactive)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: { _id: user._id, isActive: user.isActive }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve worker
const approveWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'worker') {
      return res.status(400).json({ message: 'User is not a worker' });
    }

    user.status = 'approved';
    await user.save();

    res.json({ message: 'Worker approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject worker
const rejectWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'worker') {
      return res.status(400).json({ message: 'User is not a worker' });
    }

    user.status = 'rejected';
    await user.save();

    res.json({ message: 'Worker rejected successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get admin settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({
        systemNotifications: true,
        emailAlerts: true,
        maintenanceMode: false,
        allowNewRegistrations: true,
        defaultCommissionRate: 10,
        supportEmail: 'support@servicehub.com',
        systemTimezone: 'UTC',
        backupFrequency: 'daily'
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update admin settings
const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings(updates);
    } else {
      Object.keys(updates).forEach(key => {
        settings[key] = updates[key];
      });
    }

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getAllWorkers,
  getAllBookings,
  getAnalytics,
  getRecentBookings,
  updateUser,
  sendMessageToUser,
  deleteUser,
  approveWorker,
  rejectWorker,
  toggleUserStatus,
  getSettings,
  updateSettings
};
