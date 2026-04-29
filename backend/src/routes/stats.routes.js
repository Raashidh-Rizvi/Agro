const express = require('express');
const router = express.Router();
const { getSummaryStats } = require('../controllers/stats.controller');
const { protect } = require('../middleware/auth.middleware');

// All stats routes are protected
router.use(protect);

router.get('/summary', getSummaryStats);

module.exports = router;
