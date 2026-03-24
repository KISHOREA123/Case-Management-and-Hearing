const express = require('express');
const router = express.Router();
const { getLawyers } = require('../controllers/lawyerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('admin'), getLawyers);

module.exports = router;
