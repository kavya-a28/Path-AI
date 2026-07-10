const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/authMiddleware');
const { getInsights, refreshInsights, addRecommendedSkill } = require('../controllers/careerInsightsController');

// GET /api/career/insights  —  personalised Market Insights (uses 24h cache)
router.get('/insights', protect, getInsights);

// POST /api/career/insights/refresh — Force-refresh market insights (bypasses cache)
router.post('/insights/refresh', protect, refreshInsights);

// POST /api/career/add-skill — Add an AI recommended skill to the roadmap
router.post('/add-skill', protect, addRecommendedSkill);

module.exports = router;
