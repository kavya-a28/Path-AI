const express  = require('express');
const { generate, getMyRoadmap, updateMilestone, getTopicContent } = require('../controllers/roadmapController');
const protect  = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require a valid JWT
router.post('/generate',          protect, generate);
router.get('/me',                 protect, getMyRoadmap);
router.patch('/milestone',        protect, updateMilestone);
router.get('/topic-content',      protect, getTopicContent);

module.exports = router;
