const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getNotifications, getUnreadCount, markAsRead, markAllAsRead } = require('../controllers/notificationController');

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
