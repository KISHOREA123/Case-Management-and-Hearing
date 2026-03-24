const express = require('express');
const router = express.Router();
const { getCourts, createCourt } = require('../controllers/courtController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getCourts);
router.post('/', authorize('admin'), createCourt);

module.exports = router;
