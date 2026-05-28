const express = require('express');
const { startSession, handleMessage, getStatus } = require('../controllers/onboardingController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// All onboarding routes require authentication
router.post('/start', protect, startSession);
router.post('/message', protect, handleMessage);
router.get('/status', protect, getStatus);

module.exports = router;
