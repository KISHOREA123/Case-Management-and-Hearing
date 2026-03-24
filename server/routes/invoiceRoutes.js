const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');

router.use(protect);

router.route('/')
    .get(getInvoices)
    .post(authorize('lawyer'), requirePermission('invoice_generate'), createInvoice);

router.route('/:id')
    .put(authorize('lawyer'), requirePermission('invoice_generate'), updateInvoice)
    .delete(authorize('lawyer'), requirePermission('invoice_generate'), deleteInvoice);

module.exports = router;
