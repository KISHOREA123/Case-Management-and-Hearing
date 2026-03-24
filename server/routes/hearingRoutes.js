const express = require('express');
const router = express.Router();
const {
    getHearings,
    createHearing,
    updateHearing,
    deleteHearing,
    getHearingNotes,
    addHearingNote
} = require('../controllers/hearingController');
const { protect, authorize } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');

router.use(protect);

router.route('/')
    .get(getHearings)
    .post(authorize('admin', 'lawyer'), requirePermission('hearing_create'), createHearing);

router.route('/:id')
    .put(authorize('admin', 'lawyer'), requirePermission('hearing_create'), updateHearing)
    .delete(authorize('admin', 'lawyer'), requirePermission('hearing_create'), deleteHearing);

router.route('/:id/notes')
    .get(getHearingNotes)
    .post(authorize('admin', 'lawyer'), requirePermission('hearing_create'), addHearingNote);

module.exports = router;
