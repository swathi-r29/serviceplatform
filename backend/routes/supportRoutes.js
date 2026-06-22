const express = require('express');
const { 
  submitMessage, 
  getAllMessages, 
  updateMessageStatus, 
  deleteMessage 
} = require('../controllers/supportController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const router = express.Router();

// Public route to submit contact form
router.post('/submit', submitMessage);

// Admin routes
router.get('/messages', protect, checkRole('admin'), getAllMessages);
router.patch('/:id/status', protect, checkRole('admin'), updateMessageStatus);
router.delete('/:id', protect, checkRole('admin'), deleteMessage);

module.exports = router;
