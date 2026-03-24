const express = require('express');
const router = express.Router();
const { getCaseTimeline } = require('../controllers/timelineController');
const { protect } = require('../middleware/auth');

router.get('/:id', protect, getCaseTimeline);

module.exports = router;
