const express = require('express');
const router = express.Router();
const { cancelBooking, getRefundStatus } = require('../controllers/cancellationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/cancel', cancelBooking);
router.get('/refund-status/:bookingId', getRefundStatus);

module.exports = router;
