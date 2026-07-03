const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/authMiddleware');
const { getInsights, addRecommendedSkill } = require('../controllers/careerInsightsController');

// GET /api/career/insights  —  personalised Market Insights
router.get('/insights', protect, getInsights);

// POST /api/career/add-skill — Add an AI recommended skill to the roadmap
router.post('/add-skill', protect, addRecommendedSkill);

module.exports = router;
