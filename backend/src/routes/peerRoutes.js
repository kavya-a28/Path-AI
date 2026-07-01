const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getRecommendations } = require('../controllers/peerController');

router.use(protect);
router.get('/recommendations', getRecommendations);

module.exports = router;
