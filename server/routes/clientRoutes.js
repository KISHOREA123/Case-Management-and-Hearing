const express = require('express');
const router = express.Router();
const { getClients, createClient, updateClient, deleteClient } = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getClients)
    .post(authorize('admin', 'lawyer'), createClient);

router.route('/:id')
    .put(authorize('admin', 'lawyer'), updateClient)
    .delete(authorize('admin'), deleteClient);

module.exports = router;
