const express = require('express');
const { createPaymentOrder, verifyPayment, verifyAndCreateBooking } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const router = express.Router();

router.use(protect);
router.use(checkRole('user'));

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
// Payment-first flow: verify + create booking atomically
router.post('/verify-and-create', verifyAndCreateBooking);

module.exports = router;