const express = require('express');
const { getSmartRecommendations, smartSearch, predictFairPrice } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect); // Ensure all AI features are for logged-in users

// Recommendation route
router.get('/recommendations', getSmartRecommendations);

// Smart NLP Search
router.post('/search', smartSearch);

// AI Price Prediction
router.post('/predict-price', predictFairPrice);

module.exports = router;
