const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { sendRequest, acceptRequest, rejectRequest, getConnections, getPendingRequests } = require('../controllers/connectionController');

router.use(protect);

router.post('/request', sendRequest);
router.put('/:id/accept', acceptRequest);
router.put('/:id/reject', rejectRequest);
router.get('/', getConnections);
router.get('/pending', getPendingRequests);

module.exports = router;
