const express = require('express');
const router = express.Router();
const { getCaseDocuments, uploadDocument, createFolder, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');

router.get('/case/:caseId', protect, getCaseDocuments);
router.post('/upload', protect, requirePermission('document_upload'), uploadDocument);
router.post('/folders', protect, requirePermission('document_upload'), createFolder);
router.delete('/:id', protect, requirePermission('document_upload'), deleteDocument);

module.exports = router;
