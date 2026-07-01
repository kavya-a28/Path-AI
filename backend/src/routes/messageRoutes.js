const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getConversations, getMessages, sendMessage, markAsRead, deleteMessage } = require('../controllers/messageController');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/conversations/:id', getMessages);
router.post('/send', sendMessage);
router.put('/read/:conversationId', markAsRead);
router.delete('/:messageId', deleteMessage);

module.exports = router;
