const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, checkout } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/item/:itemId', removeFromCart);
router.post('/checkout', checkout);

module.exports = router;
