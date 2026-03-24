const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams for :id from parent route
const {
    getDeadlines,
    getUpcomingDeadlines,
    createDeadline,
    updateDeadline,
    deleteDeadline
} = require('../controllers/deadlineController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Nested under /api/cases/:id/deadlines
router.route('/')
    .get(getDeadlines)
    .post(authorize('admin', 'lawyer'), createDeadline);

// Flat routes for update/delete
router.route('/:id')
    .put(authorize('admin', 'lawyer'), updateDeadline)
    .delete(authorize('admin', 'lawyer'), deleteDeadline);

module.exports = router;
