const express = require('express');
const router = express.Router();
const { getPermissions, updatePermission, getMyPermissions } = require('../controllers/permissionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/me', getMyPermissions);
router.get('/', authorize('admin'), getPermissions);
router.put('/', authorize('admin'), updatePermission);

module.exports = router;
