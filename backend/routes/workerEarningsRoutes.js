// backend/routes/workerEarningsRoutes.js

const express = require('express');
const {
  getDetailedEarnings,
  getEarningsSummary,
  getPayoutHistory,
  processWorkerPayout
} = require('../controllers/workerEarningsController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

// Protect all routes - worker only
router.use(protect);
router.use(checkRole('worker'));

// Get earnings summary (for dashboard) - main endpoint
router.get('/', getEarningsSummary);

// Get detailed earnings data (for tracker component)
router.get('/detailed', getDetailedEarnings);

// Get earnings summary (for dashboard)
router.get('/summary', getEarningsSummary);

// Get payout history
router.get('/payout-history', getPayoutHistory);

// Admin route for processing payouts
router.post('/process-payout', checkRole('admin'), processWorkerPayout);

module.exports = router;