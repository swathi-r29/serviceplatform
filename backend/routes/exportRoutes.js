const express = require('express');
const {
  exportBookings,
  exportUsers,
  exportWorkers
} = require('../controllers/exportController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const router = express.Router();

router.use(protect);
router.use(checkRole('admin'));

router.get('/bookings', exportBookings);
router.get('/users', exportUsers);
router.get('/workers', exportWorkers);

module.exports = router;