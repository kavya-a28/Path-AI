const express = require('express');
const {
  getAllDomains,
  getQuestionnaire,
  getStartingQuestion,
  getQuestion
} = require('../controllers/questionnaireController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// All questionnaire routes require authentication
// GET /api/questionnaire                              → list all domains
router.get('/', protect, getAllDomains);

// GET /api/questionnaire/:domainName                  → full tree
router.get('/:domainName', protect, getQuestionnaire);

// GET /api/questionnaire/:domainName/start            → first question
router.get('/:domainName/start', protect, getStartingQuestion);

// GET /api/questionnaire/:domainName/question/:questionId → single question
router.get('/:domainName/question/:questionId', protect, getQuestion);

module.exports = router;
