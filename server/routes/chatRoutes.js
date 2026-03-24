const express = require('express');
const router = express.Router();
const { getConversation, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');

router.get('/case/:caseId', protect, getConversation);
router.post('/message', protect, requirePermission('message_send'), sendMessage);

module.exports = router;
