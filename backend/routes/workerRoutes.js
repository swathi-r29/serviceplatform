const express = require('express');
const {
  getWorkerProfile,
  updateWorkerProfile,
  getWorkerBookings,
  acceptBooking,
  rejectBooking,
  startTravel,
  startService,
  completeBooking,
  getWorkerEarnings,
  getSkillPricing,
  updateSkillPricing
} = require('../controllers/workerController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const router = express.Router();

router.use(protect);
router.use(checkRole('worker'));

router.get('/profile', getWorkerProfile);
router.put('/profile', upload.single('profileImage'), updateWorkerProfile);
router.get('/bookings', getWorkerBookings);
router.put('/bookings/:id/accept', acceptBooking);
router.put('/bookings/:id/reject', rejectBooking);
router.put('/bookings/:id/start-travel', startTravel);
router.put('/bookings/:id/start-service', startService);
router.put('/bookings/:id/complete', completeBooking);
router.get('/earnings', getWorkerEarnings);
router.get('/skill-pricing', getSkillPricing);
router.put('/skill-pricing', updateSkillPricing);

module.exports = router;