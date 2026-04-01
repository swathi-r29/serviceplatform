const express = require('express');
const {
  getAvailability,
  setAvailability,
  blockDate,
  checkWorkerAvailability
} = require('../controllers/availabilityController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const router = express.Router();

router.get('/check', checkWorkerAvailability);

router.use(protect);
router.use(checkRole('worker'));

router.get('/', getAvailability);
router.post('/set', setAvailability);
router.post('/block', blockDate);

module.exports = router;