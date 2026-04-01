const express = require('express');
const { createPaymentOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const router = express.Router();

router.use(protect);
router.use(checkRole('user'));

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);

module.exports = router;