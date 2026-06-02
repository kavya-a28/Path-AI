/**
 * questionnaireController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * CRUD + lookup handlers for the DomainQuestionnaire collection.
 *
 * Endpoints exposed:
 *   GET  /api/questionnaire                     → list all domains (summary)
 *   GET  /api/questionnaire/:domainName         → full questionnaire for a domain
 *   GET  /api/questionnaire/:domainName/start   → first question only
 *   GET  /api/questionnaire/:domainName/question/:questionId → single question
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DomainQuestionnaire = require('../models/DomainQuestionnaire');

// ─── List all available domains ──────────────────────────────────────────────

const getAllDomains = async (req, res) => {
  try {
    const domains = await DomainQuestionnaire.find(
      {},
      'domainName displayName description startingPointId'
    ).lean();

    return res.status(200).json({
      success: true,
      count: domains.length,
      domains
    });
  } catch (err) {
    console.error('getAllDomains error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get full questionnaire for a domain ─────────────────────────────────────

const getQuestionnaire = async (req, res) => {
  try {
    const { domainName } = req.params;

    const doc = await DomainQuestionnaire.findOne({ domainName }).lean();
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `No questionnaire found for domain: ${domainName}`
      });
    }

    // Convert Map back to plain object for JSON response
    const questions = doc.questions instanceof Map
      ? Object.fromEntries(doc.questions)
      : doc.questions;

    return res.status(200).json({
      success: true,
      questionnaire: {
        domainName:      doc.domainName,
        displayName:     doc.displayName,
        description:     doc.description,
        startingPointId: doc.startingPointId,
        questions
      }
    });
  } catch (err) {
    console.error('getQuestionnaire error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get the starting question for a domain ──────────────────────────────────

const getStartingQuestion = async (req, res) => {
  try {
    const { domainName } = req.params;

    const doc = await DomainQuestionnaire.findOne({ domainName }).lean();
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `No questionnaire found for domain: ${domainName}`
      });
    }

    const questions = doc.questions instanceof Map
      ? Object.fromEntries(doc.questions)
      : doc.questions;

    const startQuestion = questions[doc.startingPointId];
    if (!startQuestion) {
      return res.status(500).json({
        success: false,
        message: 'startingPointId does not match any question in the questionnaire.'
      });
    }

    return res.status(200).json({
      success: true,
      domainName:      doc.domainName,
      displayName:     doc.displayName,
      startingPointId: doc.startingPointId,
      question:        startQuestion
    });
  } catch (err) {
    console.error('getStartingQuestion error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get a single question by ID ─────────────────────────────────────────────

const getQuestion = async (req, res) => {
  try {
    const { domainName, questionId } = req.params;

    const doc = await DomainQuestionnaire.findOne({ domainName }).lean();
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `No questionnaire found for domain: ${domainName}`
      });
    }

    const questions = doc.questions instanceof Map
      ? Object.fromEntries(doc.questions)
      : doc.questions;

    const question = questions[questionId];
    if (!question) {
      return res.status(404).json({
        success: false,
        message: `Question '${questionId}' not found in domain '${domainName}'.`
      });
    }

    return res.status(200).json({
      success: true,
      domainName,
      question,
      isLast: question.options.every(opt => opt.nextId === null)
    });
  } catch (err) {
    console.error('getQuestion error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllDomains, getQuestionnaire, getStartingQuestion, getQuestion };
