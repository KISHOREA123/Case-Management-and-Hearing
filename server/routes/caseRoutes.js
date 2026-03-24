const express = require('express');
const router = express.Router();
const {
    getCases,
    getCaseById,
    createCase,
    updateCase,
    deleteCase,
    searchCaseByNumber,
    requestAccess,
    getAccessRequests,
    handleAccessRequest
} = require('../controllers/caseController');
const { protect, authorize } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');

router.use(protect);

router.get('/search/:number', searchCaseByNumber);
router.post('/request-access', authorize('client'), requestAccess);
router.get('/access-requests', authorize('lawyer', 'admin'), getAccessRequests);
router.put('/access-requests/:id', authorize('lawyer', 'admin'), handleAccessRequest);

router.route('/')
    .get(getCases)
    .post(authorize('admin', 'lawyer'), requirePermission('case_create'), createCase);

router.route('/:id')
    .get(getCaseById)
    .put(authorize('admin', 'lawyer'), requirePermission('case_edit'), updateCase)
    .delete(authorize('admin', 'lawyer'), requirePermission('case_delete'), deleteCase);

module.exports = router;
