/**
 * roadmapController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/roadmap/generate   →  generate + save roadmap from profile answers
 * GET  /api/roadmap/me         →  fetch the user's active roadmap
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Roadmap = require('../models/Roadmap');
const { generateRoadmap } = require('../services/roadmapGenerator');
const { generateTopicContent } = require('../services/topicContentGenerator');

// ─── Generate & persist ───────────────────────────────────────────────────────

const generate = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = req.body.profile || req.body; // accept either { profile:{} } or flat obj

    if (!profile || !profile.domain) {
      return res.status(400).json({
        success: false,
        message: 'A "domain" field is required in the profile.'
      });
    }

    // Generate via AI
    const { displayName, milestones, dailySessions, stats } = await generateRoadmap(profile);

    // Upsert — replace any existing active roadmap for this user
    const roadmap = await Roadmap.findOneAndUpdate(
      { userId, status: 'active' },
      {
        userId,
        domain:       profile.domain,
        displayName,
        profile,
        milestones,
        dailySessions,
        stats,
        status: 'active'
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      roadmap: roadmap.toObject()
    });
  } catch (err) {
    console.error('Roadmap generate error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Fetch user's active roadmap ─────────────────────────────────────────────

const getMyRoadmap = async (req, res) => {
  try {
    const userId = req.user._id;
    const roadmap = await Roadmap.findOne({ userId, status: 'active' }).lean();

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'No active roadmap found.' });
    }

    return res.status(200).json({ success: true, roadmap });
  } catch (err) {
    console.error('Get roadmap error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update milestone progress ────────────────────────────────────────────────

const updateMilestone = async (req, res) => {
  try {
    const userId     = req.user._id;
    const { milestoneId, progress, status } = req.body;

    const roadmap = await Roadmap.findOne({ userId, status: 'active' });
    if (!roadmap) return res.status(404).json({ success: false, message: 'No active roadmap.' });

    const ms = roadmap.milestones.find(m => m.id === milestoneId);
    if (!ms) return res.status(404).json({ success: false, message: 'Milestone not found.' });

    if (progress !== undefined) ms.progress = progress;
    if (status   !== undefined) ms.status   = status;

    // Recalculate overall progress
    const totalMs    = roadmap.milestones.length;
    const completed  = roadmap.milestones.filter(m => m.status === 'completed').length;
    const avgProgress= roadmap.milestones.reduce((s, m) => s + m.progress, 0) / totalMs;

    roadmap.stats.completedMilestones = completed;
    roadmap.stats.progressPercent     = Math.round(avgProgress);
    roadmap.stats.xpScore             = completed * 250 + Math.round(avgProgress) * 5;

    await roadmap.save();

    return res.status(200).json({ success: true, roadmap: roadmap.toObject() });
  } catch (err) {
    console.error('Update milestone error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get topic-specific learning content ──────────────────────────────────────

const getTopicContent = async (req, res) => {
  try {
    const { topicName, domain } = req.query;
    if (!topicName) {
      return res.status(400).json({ success: false, message: 'topicName is required.' });
    }
    const content = await generateTopicContent(topicName, domain || 'general');
    return res.status(200).json({ success: true, content });
  } catch (err) {
    console.error('Topic content error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { generate, getMyRoadmap, updateMilestone, getTopicContent };
