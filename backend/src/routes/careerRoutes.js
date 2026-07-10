const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/authMiddleware');
const { getInsights, refreshInsights, addRecommendedSkill } = require('../controllers/careerInsightsController');
const { getJobMatches, refreshJobMatches } = require('../controllers/jobMatchesController');

// GET /api/career/insights  —  personalised Market Insights (uses 24h cache)
router.get('/insights', protect, getInsights);

// POST /api/career/insights/refresh — Force-refresh market insights (bypasses cache)
router.post('/insights/refresh', protect, refreshInsights);

// POST /api/career/add-skill — Add an AI recommended skill to the roadmap
router.post('/add-skill', protect, addRecommendedSkill);

// GET /api/career/job-matches — Tavily-powered job matches based on user skills (6h cache)
router.get('/job-matches', protect, getJobMatches);

// POST /api/career/job-matches/refresh — Force-refresh job matches (bypass cache)
router.post('/job-matches/refresh', protect, refreshJobMatches);

module.exports = router;
