const express = require('express');
const router = express.Router();
const {
    getCases,
    getCaseById,
    createCase,
    updateCase,
    deleteCase
} = require('../controllers/caseController');
const { protect, authorize } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');

router.use(protect);

router.route('/')
    .get(getCases)
    .post(authorize('admin', 'lawyer'), requirePermission('case_create'), createCase);

router.route('/:id')
    .get(getCaseById)
    .put(authorize('admin', 'lawyer'), requirePermission('case_edit'), updateCase)
    .delete(authorize('admin', 'lawyer'), requirePermission('case_delete'), deleteCase);

module.exports = router;
