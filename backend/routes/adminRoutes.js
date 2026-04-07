const express = require('express');
const {
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
} = require('../controllers/adminController');
console.log('--- ADMIN ROUTES DIAGNOSIS ---');
console.log('approveWorker type:', typeof approveWorker);
if (typeof approveWorker !== 'function') {
  console.error('CRITICAL: approveWorker is undefined or not a function!');
}
const { getChartData } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const { ensureSingleAdmin, preventAdminModification } = require('../middleware/admincheck');
const User = require('../models/User');
const router = express.Router();

// Apply middleware in order
router.use(protect);

// Public route to get admin info for chat functionality
router.get('/info', async (req, res) => {
  try {
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({ _id: adminUser._id, name: adminUser.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.use(checkRole('admin'));
router.use(ensureSingleAdmin);

// Define routes
router.get('/', (req, res) => {
  res.json(req.user);
});
router.get('/users', getAllUsers);
router.get('/workers', getAllWorkers);
router.get('/bookings', getAllBookings);
router.get('/analytics', getAnalytics);
router.get('/analytics/charts', getChartData);
router.get('/recent-bookings', getRecentBookings);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.put('/users/:id', updateUser);
router.patch('/workers/:id/approve', approveWorker);
router.patch('/workers/:id/reject', rejectWorker);
router.post('/users/:id/message', sendMessageToUser);
router.delete('/users/:id', preventAdminModification, deleteUser);
router.delete('/workers/:id', preventAdminModification, deleteUser);
router.patch('/users/:id/status', toggleUserStatus);
router.patch('/workers/:id/status', toggleUserStatus);

module.exports = router;