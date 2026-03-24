const express = require('express');
const router = express.Router();
const { getUpcomingDeadlines } = require('../controllers/deadlineController');
const { protect } = require('../middleware/auth');

router.get('/upcoming', protect, getUpcomingDeadlines);

module.exports = router;
