const express = require('express');
const router = express.Router();
const { 
  getDashboardSummary,
  getRevenueChart,
  getCategoryBreakdown,
  getTopWorkers,
  getBookingTrends,
  getRecentActivity
} = require('../controllers/adminAnalyticsController');
const { protect, admin } = require('../middleware/auth');

router.use(protect);
router.use(admin);

router.get('/summary', getDashboardSummary);
router.get('/revenue-chart', getRevenueChart);
router.get('/categories', getCategoryBreakdown);
router.get('/top-workers', getTopWorkers);
router.get('/booking-trends', getBookingTrends);
router.get('/recent-activity', getRecentActivity);

module.exports = router;
