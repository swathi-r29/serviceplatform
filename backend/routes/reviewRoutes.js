const express = require('express');
const { createReview, getWorkerReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const router = express.Router();

router.get('/worker/:workerId', getWorkerReviews);

router.use(protect);
router.use(checkRole('user'));

router.post('/', createReview);

module.exports = router;