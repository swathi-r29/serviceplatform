const express = require('express');
const { createAdmin, checkAdminExists } = require('../controllers/adminCreationController');
const router = express.Router();

router.post('/create', createAdmin);
router.get('/check', checkAdminExists);

module.exports = router;