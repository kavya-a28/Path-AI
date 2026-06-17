const express = require('express');
const {
  generate,
  getMyRoadmap,
  updateMilestone,
  startSession,
  updateSessionTracking,
  startPractice,
  submitPractice,
  updateSession,
  rescheduleRoadmap,
  getTopicContent,
  getTopicResources
} = require('../controllers/roadmapController');
const { getDashboardStats } = require('../controllers/dashboardController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require a valid JWT
router.post('/generate',              protect, generate);
router.get('/me',                     protect, getMyRoadmap);
router.patch('/milestone',            protect, updateMilestone);
router.patch('/session/:id/start',    protect, startSession);   // mark IN_PROGRESS
router.patch('/session/:id/tracking', protect, updateSessionTracking);
router.patch('/session/:id/practice/start', protect, startPractice);
router.post('/session/:id/practice/submit', protect, submitPractice);
router.patch('/session/:id',          protect, updateSession);  // mark COMPLETED / MISSED
router.post('/reschedule',            protect, rescheduleRoadmap);
router.get('/topic-content',          protect, getTopicContent);
router.get('/topic-resources',        protect, getTopicResources);

// Dashboard analytics
router.get('/dashboard/stats',        protect, getDashboardStats);

module.exports = router;
