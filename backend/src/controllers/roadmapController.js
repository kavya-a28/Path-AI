/**
 * roadmapController.js  (v2)
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/roadmap/generate         →  generate + save roadmap
 * GET  /api/roadmap/me               →  fetch user's active roadmap
 * PATCH /api/roadmap/milestone        →  update milestone progress/status
 * PATCH /api/roadmap/session/:id      →  update session status
 * GET  /api/roadmap/topic-content    →  AI text + catalog resources for topic
 * GET  /api/roadmap/topic-resources  →  catalog resources only (no AI)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Roadmap                       = require('../models/Roadmap');
const { generateRoadmap }           = require('../services/roadmapGenerator');
const { generateTopicContent }      = require('../services/topicContentGenerator');
const { getResourceForTopic }       = require('../data/resourceCatalog');
const { buildEmbedUrl, buildWatchUrl } = require('../services/youtubeService');

// ─── Generate & persist ───────────────────────────────────────────────────────

const generate = async (req, res) => {
  try {
    const userId  = req.user._id;
    const profile = req.body.profile || req.body;

    // Accept either single domain or domains array
    const domains = profile.domains || (profile.domain ? [profile.domain] : null);
    if (!domains || domains.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A "domain" or "domains" field is required in the profile.'
      });
    }

    // Normalise profile for generator
    const normProfile = { ...profile, domains, domain: domains[0] };

    const { displayName, milestones, dailySessions, stats, generatedBy } =
      await generateRoadmap(normProfile);

    const roadmap = await Roadmap.findOneAndUpdate(
      { userId, status: 'active' },
      {
        userId,
        domain:      domains[0],
        domains,
        displayName,
        profile:     normProfile,
        milestones,
        dailySessions,
        stats,
        status:      'active',
        generatedBy
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, new: true }
    );

    return res.status(201).json({ success: true, roadmap: roadmap.toObject() });
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
    const userId = req.user._id;
    const { milestoneId, progress, status } = req.body;

    const roadmap = await Roadmap.findOne({ userId, status: 'active' });
    if (!roadmap) return res.status(404).json({ success: false, message: 'No active roadmap.' });

    const ms = roadmap.milestones.find(m => m.id === milestoneId);
    if (!ms) return res.status(404).json({ success: false, message: 'Milestone not found.' });

    if (progress !== undefined) ms.progress = progress;
    if (status   !== undefined) ms.status   = status;

    // Unlock next milestone when current is completed
    if (status === 'completed') {
      const next = roadmap.milestones.find(m => m.id === milestoneId + 1);
      if (next && next.status === 'locked') next.status = 'current';
    }

    const total    = roadmap.milestones.length;
    const completed= roadmap.milestones.filter(m => m.status === 'completed').length;
    const avg      = roadmap.milestones.reduce((s, m) => s + m.progress, 0) / total;

    roadmap.stats.completedMilestones = completed;
    roadmap.stats.progressPercent     = Math.round(avg);
    roadmap.stats.xpScore             = completed * 250 + Math.round(avg) * 5;

    await roadmap.save();
    return res.status(200).json({ success: true, roadmap: roadmap.toObject() });
  } catch (err) {
    console.error('Update milestone error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Mark session as started (IN_PROGRESS) ───────────────────────────────────

const startSession = async (req, res) => {
  try {
    const userId    = req.user._id;
    const sessionId = parseInt(req.params.id, 10);

    const roadmap = await Roadmap.findOne({ userId, status: 'active' });
    if (!roadmap) return res.status(404).json({ success: false, message: 'No active roadmap.' });

    const session = roadmap.dailySessions.find(s => s.id === sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

    // Only move to 'current' if it was locked (don't downgrade completed)
    if (session.status === 'locked') {
      session.status = 'current';
      await roadmap.save();
    }

    return res.status(200).json({ success: true, session });
  } catch (err) {
    console.error('Start session error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update session status ────────────────────────────────────────────────────

const updateSession = async (req, res) => {
  try {
    const userId    = req.user._id;
    const sessionId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const roadmap = await Roadmap.findOne({ userId, status: 'active' });
    if (!roadmap) return res.status(404).json({ success: false, message: 'No active roadmap.' });

    const session = roadmap.dailySessions.find(s => s.id === sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

    session.status = status;

    if (status === 'completed') {
      // Record exact completion time
      session.completedAt = new Date();

      // Unlock next locked session
      const next = roadmap.dailySessions.find(s => s.id === sessionId + 1);
      if (next && next.status === 'locked') next.status = 'locked'; // stays locked until user clicks start

      // Advance currentDay if ALL sessions for this day are done
      const sessionDay = session.day;
      const daysSessions = roadmap.dailySessions.filter(s => s.day === sessionDay);
      const allDayDone   = daysSessions.every(s => s.status === 'completed' || s.id === sessionId);
      if (allDayDone && roadmap.stats.currentDay <= sessionDay) {
        roadmap.stats.currentDay = sessionDay + 1;
      }

      // Recalculate overall mastery progress
      const totalSessions     = roadmap.dailySessions.length;
      const completedCount    = roadmap.dailySessions.filter(s => s.status === 'completed').length + 1; // +1 for this one
      roadmap.stats.progressPercent = totalSessions > 0
        ? Math.round((completedCount / totalSessions) * 100)
        : 0;
    }

    await roadmap.save();
    return res.status(200).json({ success: true, roadmap: roadmap.toObject() });
  } catch (err) {
    console.error('Update session error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get topic content (AI text + catalog video) ──────────────────────────────

const getTopicContent = async (req, res) => {
  try {
    const { topicName, domain, topicKey } = req.query;
    if (!topicName) {
      return res.status(400).json({ success: false, message: 'topicName is required.' });
    }
    const content = await generateTopicContent(
      topicName,
      domain || 'general',
      topicKey || null
    );
    return res.status(200).json({ success: true, content });
  } catch (err) {
    console.error('Topic content error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get topic resources from catalog only (no AI) ───────────────────────────

const getTopicResources = async (req, res) => {
  try {
    const { topicKey } = req.query;
    if (!topicKey) {
      return res.status(400).json({ success: false, message: 'topicKey is required.' });
    }
    const resource = getResourceForTopic(topicKey);

    // Enrich video with embed/watch URLs
    const enriched = {
      ...resource,
      video: resource.video ? {
        ...resource.video,
        embedUrl: buildEmbedUrl(resource.video.id),
        watchUrl: buildWatchUrl(resource.video.id),
        thumbnailUrl: `https://i.ytimg.com/vi/${resource.video.id}/hqdefault.jpg`
      } : null
    };

    return res.status(200).json({ success: true, resources: enriched });
  } catch (err) {
    console.error('Topic resources error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  generate,
  getMyRoadmap,
  updateMilestone,
  startSession,
  updateSession,
  getTopicContent,
  getTopicResources
};
