const express = require('express');
const router = express.Router();
const { getCaseTypes, createCaseType, updateCaseType, deleteCaseType } = require('../controllers/caseTypeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getCaseTypes);
router.post('/', authorize('admin'), createCaseType);
router.put('/:id', authorize('admin'), updateCaseType);
router.delete('/:id', authorize('admin'), deleteCaseType);

module.exports = router;
