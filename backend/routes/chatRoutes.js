const express = require('express');
const {
  getChatByBooking,
  sendMessage,
  markMessagesAsRead,
  getUserChats,
  getChatByUsers,
  sendMessageToUser
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.get('/user-chats', getUserChats);
router.get('/booking/:bookingId', getChatByBooking);
router.post('/booking/:bookingId/message', sendMessage);
router.put('/booking/:bookingId/read', markMessagesAsRead);
router.get('/user/:userId', getChatByUsers);
router.post('/user/:userId/message', sendMessageToUser);

module.exports = router;