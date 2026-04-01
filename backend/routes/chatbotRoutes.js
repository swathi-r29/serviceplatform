// backend/routes/chatbotRoutes.js

const express = require('express');
const {
  getChatResponse,
  getServiceSuggestions,
  getChatHistory
} = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public route - anyone can chat
router.post('/chat', getChatResponse);

// Get service suggestions
router.get('/suggestions', getServiceSuggestions);

// Protected route - fetch chat history for logged-in users
router.get('/history', protect, getChatHistory);

module.exports = router;