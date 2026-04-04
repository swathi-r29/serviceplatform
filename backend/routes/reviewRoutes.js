const express = require('express');
const {
  createReview,
  getWorkerReviews,
  getUserReviews,
  checkCanReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/worker/:workerId', getWorkerReviews);

// Auth required
router.use(protect);
router.post('/',                     createReview);
router.get('/my-reviews',            getUserReviews);
router.get('/can-review/:bookingId', checkCanReview);

module.exports = router;