const express = require('express');
const { getUserProfile, updateUserProfile, getUserBookings } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const router = express.Router();

router.use(protect);
router.use(checkRole('user'));

router.get('/profile', getUserProfile);
router.put('/profile', upload.single('profileImage'), updateUserProfile);
router.get('/bookings', getUserBookings);

module.exports = router;