const express = require('express');
const {
  getSubscriptionPlans,
  subscribeToPlan,
  getUserSubscription,
  cancelSubscription,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  getAllSubscriptions
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

// Public routes
router.get('/plans', getSubscriptionPlans);

// Protected user routes
router.use(protect);
router.post('/subscribe', subscribeToPlan);
router.get('/my-subscription', getUserSubscription);
router.post('/cancel', cancelSubscription);

// Admin routes
router.post('/plans', checkRole('admin'), createSubscriptionPlan);
router.put('/plans/:id', checkRole('admin'), updateSubscriptionPlan);
router.get('/all', checkRole('admin'), getAllSubscriptions);

module.exports = router;