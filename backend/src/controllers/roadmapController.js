/**
 * roadmapController.js  (v2)
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/roadmap/generate         →  generate + save roadmap
 * GET  /api/roadmap/me               →  fetch user's active roadmap
 * PATCH /api/roadmap/milestone        →  update milestone progress/status
 * PATCH /api/roadmap/session/:id      →  update session status
 * POST /api/roadmap/reschedule       →  dynamic rescheduling
 * GET  /api/roadmap/topic-content    →  AI text + catalog resources for topic
 * GET  /api/roadmap/topic-resources  →  catalog resources only (no AI)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Roadmap                       = require('../models/Roadmap');
const User                          = require('../models/User');
const { generateRoadmap }           = require('../services/roadmapGenerator');
const { generateTopicContent }      = require('../services/topicContentGenerator');
const {
  buildPracticeChallenge,
  executePractice
} = require('../services/practiceEngine');
const { getResourceForTopic }       = require('../data/resourceCatalog');
const { buildEmbedUrl, buildWatchUrl } = require('../services/youtubeService');
const {
  normalizePreferredLanguage,
  getLanguageDisplay
} = require('../utils/languagePreferences');
const {
  secondsToHours,
  isOvertime,
  enrichSessionTimeFields,
  enrichRoadmapSessions
} = require('../utils/timeSplit');
const {
  syncRoadmap,
  repackRemainingSessions,
  smartRepackWithCap,
  recalculateStats
} = require('../services/roadmapStats');

// ─── Generate & persist ───────────────────────────────────────────────────────

const generate = async (req, res) => {
  try {
    const userId  = req.user._id;
    const profile = req.body.profile || req.body;

    const domains = profile.domains || (profile.domain ? [profile.domain] : null);
    if (!domains || domains.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A "domain" or "domains" field is required in the profile.'
      });
    }

    const preferredLanguage = normalizePreferredLanguage(profile.preferredLanguage, domains[0]);
    const normProfile = {
      ...profile,
      domains,
      domain: domains[0],
      preferredLanguage,
      preferredLanguageDisplay: getLanguageDisplay(preferredLanguage)
    };

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
    enrichRoadmapSessions(roadmap);
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

    if (status === 'completed') {
      const next = roadmap.milestones.find(m => m.id === milestoneId + 1);
      if (next && next.status === 'locked') next.status = 'current';
    }

    syncRoadmap(roadmap);
    await roadmap.save();
    return res.status(200).json({ success: true, roadmap: roadmap.toObject() });
  } catch (err) {
    console.error('Update milestone error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Check if a session can be started ───────────────────────────────────────

const canStartSession = (roadmap, session) => {
  if (session.status === 'completed') return false;
  if (session.status === 'current') return true;
  if (session.status === 'missed') return true;

  // locked: allow if previous session (by id) is completed, or this is the first incomplete
  const prev = roadmap.dailySessions.find(s => s.id === session.id - 1);
  if (!prev) return true;
  return prev.status === 'completed';
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

    if (session.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Session already completed.' });
    }

    if (!canStartSession(roadmap, session)) {
      return res.status(400).json({
        success: false,
        message: 'Complete the previous session first.'
      });
    }

    // Demote other current sessions to locked
    roadmap.dailySessions.forEach(s => {
      if (s.status === 'current' && s.id !== sessionId) s.status = 'locked';
    });

    session.status = 'current';
    if (!session.learningStartedAt) {
      session.learningStartedAt = new Date();
    }
    enrichSessionTimeFields(session);
    syncRoadmap(roadmap);
    await roadmap.save();

    return res.status(200).json({ success: true, session, roadmap: roadmap.toObject() });
  } catch (err) {
    console.error('Start session error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Sync active time tracking ───────────────────────────────────────────────

const updateSessionTracking = async (req, res) => {
  try {
    const userId    = req.user._id;
    const sessionId = parseInt(req.params.id, 10);
    const {
      actualLearningSeconds,
      actualPracticeSeconds
    } = req.body;

    const roadmap = await Roadmap.findOne({ userId, status: 'active' });
    if (!roadmap) return res.status(404).json({ success: false, message: 'No active roadmap.' });

    const session = roadmap.dailySessions.find(s => s.id === sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

    enrichSessionTimeFields(session);

    if (actualLearningSeconds !== undefined) {
      session.actualLearningSeconds = Math.max(0, Number(actualLearningSeconds) || 0);
      session.actualLearningHours   = secondsToHours(session.actualLearningSeconds);
      session.learningOvertime      = isOvertime(
        session.actualLearningSeconds,
        session.estimatedLearningHours
      );
    }

    if (actualPracticeSeconds !== undefined) {
      session.actualPracticeSeconds = Math.max(0, Number(actualPracticeSeconds) || 0);
      session.actualPracticeHours   = secondsToHours(session.actualPracticeSeconds);
      session.practiceOvertime      = isOvertime(
        session.actualPracticeSeconds,
        session.estimatedPracticeHours
      );
    }

    await roadmap.save();
    return res.status(200).json({ success: true, session, roadmap: roadmap.toObject() });
  } catch (err) {
    console.error('Update session tracking error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Mark practice tab opened ─────────────────────────────────────────────────

const startPractice = async (req, res) => {
  try {
    const userId    = req.user._id;
    const sessionId = parseInt(req.params.id, 10);

    const roadmap = await Roadmap.findOne({ userId, status: 'active' });
    if (!roadmap) return res.status(404).json({ success: false, message: 'No active roadmap.' });

    const session = roadmap.dailySessions.find(s => s.id === sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

    if (!session.practiceStartedAt) {
      session.practiceStartedAt = new Date();
    }
    enrichSessionTimeFields(session);

    await roadmap.save();
    return res.status(200).json({ success: true, session, roadmap: roadmap.toObject() });
  } catch (err) {
    console.error('Start practice error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Submit & validate practice solution ─────────────────────────────────────

const runPractice = async (req, res) => {
  try {
    const userId    = req.user._id;
    const sessionId = parseInt(req.params.id, 10);
    const { solution } = req.body;

    const roadmap = await Roadmap.findOne({ userId, status: 'active' });
    if (!roadmap) return res.status(404).json({ success: false, message: 'No active roadmap.' });

    const session = roadmap.dailySessions.find(s => s.id === sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

    const resolvedLang = session.preferredLanguage || roadmap.profile?.preferredLanguage || '';
    const challenge = buildPracticeChallenge(session, roadmap.profile || {}, resolvedLang);
    const result = await executePractice({ solution, challenge, includeHidden: false });

    return res.status(200).json({
      success: true,
      passed: result.passed,
      compileError: result.compileError,
      testResults: result.testResults,
      feedback: result.compileError
        ? 'Compilation failed. Fix the error and run again.'
        : result.passed
        ? 'All visible test cases passed.'
        : 'Some visible test cases failed.'
    });
  } catch (err) {
    console.error('Run practice error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const submitPractice = async (req, res) => {
  try {
    const userId    = req.user._id;
    const sessionId = parseInt(req.params.id, 10);
    const { solution, actualPracticeSeconds } = req.body;

    const roadmap = await Roadmap.findOne({ userId, status: 'active' });
    if (!roadmap) return res.status(404).json({ success: false, message: 'No active roadmap.' });

    const session = roadmap.dailySessions.find(s => s.id === sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

    enrichSessionTimeFields(session);
    session.practiceAttempts = (session.practiceAttempts || 0) + 1;

    if (!session.practiceStartedAt) {
      session.practiceStartedAt = new Date();
    }

    // Language resolution (3-tier):
    // 1. roadmap.profile.preferredLanguage (set at generation time)
    // 2. User.profile.preferredLanguage in DB (fallback for old roadmaps)
    // 3. Domain default inside generateTopicContent
    let resolvedLang = roadmap.profile?.preferredLanguage || '';
    if (!resolvedLang) {
      try {
        const user = await User.findById(req.user._id).select('profile').lean();
        resolvedLang = user?.profile?.preferredLanguage || '';
      } catch (_) { /* non-fatal */ }
    }

    const challenge = buildPracticeChallenge(session, roadmap.profile || {}, resolvedLang);
    const result = await executePractice({
      solution,
      challenge,
      includeHidden: true
    });

    if (!result.passed) {
      await roadmap.save();
      return res.status(400).json({
        success:  false,
        valid:    false,
        feedback: result.compileError
          ? 'Compilation failed. Fix the error and submit again.'
          : 'Solution failed one or more required test cases.',
        compileError: result.compileError,
        testResults: result.testResults,
        session
      });
    }

    if (actualPracticeSeconds !== undefined) {
      session.actualPracticeSeconds = Math.max(0, Number(actualPracticeSeconds) || 0);
    }
    session.actualPracticeHours = secondsToHours(session.actualPracticeSeconds);
    session.practiceOvertime    = isOvertime(
      session.actualPracticeSeconds,
      session.estimatedPracticeHours
    );
    session.practiceCompleted   = true;
    session.practiceCompletedAt = new Date();

    await roadmap.save();
    return res.status(200).json({
      success:  true,
      valid:    true,
      feedback: 'Accepted. All required test cases passed.',
      testResults: result.testResults,
      session,
      roadmap:  roadmap.toObject()
    });
  } catch (err) {
    console.error('Submit practice error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update session status ────────────────────────────────────────────────────

const updateSession = async (req, res) => {
  try {
    const userId    = req.user._id;
    const sessionId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const validStatuses = ['completed', 'current', 'locked', 'missed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const roadmap = await Roadmap.findOne({ userId, status: 'active' });
    if (!roadmap) return res.status(404).json({ success: false, message: 'No active roadmap.' });

    const session = roadmap.dailySessions.find(s => s.id === sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

    enrichSessionTimeFields(session);

    if (status === 'completed' && !session.practiceCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Complete the practice challenge with a correct solution before marking this session done.'
      });
    }

    session.status = status;

    if (status === 'completed') {
      session.completedAt = new Date();

      // Auto-unlock next session
      const next = roadmap.dailySessions.find(s => s.id === sessionId + 1);
      if (next && next.status !== 'completed') {
        roadmap.dailySessions.forEach(s => {
          if (s.status === 'current' && s.id !== next.id) s.status = 'locked';
        });
        next.status = 'current';
      }

      // Advance currentDay when all sessions on this day are done
      const sessionDay   = session.day;
      const daysSessions = roadmap.dailySessions.filter(s => s.day === sessionDay);
      const allDayDone   = daysSessions.every(s => s.status === 'completed');
      if (allDayDone && roadmap.stats.currentDay <= sessionDay) {
        roadmap.stats.currentDay = sessionDay + 1;
      }
    }

    syncRoadmap(roadmap);
    await roadmap.save();
    return res.status(200).json({ success: true, roadmap: roadmap.toObject() });
  } catch (err) {
    console.error('Update session error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Dynamic rescheduling ─────────────────────────────────────────────────

const rescheduleRoadmap = async (req, res) => {
  try {
    const userId = req.user._id;
    const roadmap = await Roadmap.findOne({ userId, status: 'active' });
    if (!roadmap) return res.status(404).json({ success: false, message: 'No active roadmap.' });

    // Count missed sessions before reschedule
    const missedBefore = roadmap.dailySessions.filter(s => s.status === 'missed').length;
    const pendingBefore = roadmap.dailySessions.filter(s => s.status === 'locked' || s.status === 'current').length;

    // Smart repack: spread overload at +1h/day, preserving curriculum order
    const result = smartRepackWithCap(roadmap, null, 1);
    syncRoadmap(roadmap);

    await roadmap.save();

    // Build user-friendly message
    let message;
    if (missedBefore === 0) {
      message = `Roadmap optimised — ${pendingBefore} remaining sessions repacked.`;
    } else {
      const extraDays = Math.ceil(missedBefore / (roadmap.stats.hoursPerDay || 3));
      message = `${missedBefore} missed session(s) rescheduled across ~${extraDays} extra day(s) (+1h/day cap).`;
    }

    return res.status(200).json({
      success: true,
      roadmap:  roadmap.toObject(),
      message,
      summary: {
        missedRescheduled: missedBefore,
        totalRescheduled:  result.rescheduledCount,
        startDay:          result.startDay,
        extraCapPerDay:    result.extraCapPerDay
      }
    });
  } catch (err) {
    console.error('Reschedule roadmap error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get topic content (AI text + catalog video) ──────────────────────────────

const getTopicContent = async (req, res) => {
  try {
    const { topicName, domain, topicKey, preferredLanguage } = req.query;
    if (!topicName) {
      return res.status(400).json({ success: false, message: 'topicName is required.' });
    }

    // Language resolution (3-tier):
    // 1. What the frontend sent (from roadmap.profile or taskData)
    // 2. Fallback: read from User.profile in the DB (handles old roadmaps)
    // 3. Fallback: domain default inside generateTopicContent
    let resolvedLang = preferredLanguage || '';
    if (!resolvedLang) {
      try {
        const user = await User.findById(req.user._id).select('profile').lean();
        resolvedLang = user?.profile?.preferredLanguage || '';
      } catch (_) { /* non-fatal */ }
    }

    console.log(`[RoadmapCtrl] getTopicContent: topic="${topicName}" lang="${resolvedLang}"`);

    const content = await generateTopicContent(
      topicName,
      domain || 'general',
      topicKey || null,
      resolvedLang
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
    const { topicKey, preferredLanguage, domain } = req.query;
    if (!topicKey) {
      return res.status(400).json({ success: false, message: 'topicKey is required.' });
    }
    const resolvedLang = normalizePreferredLanguage(preferredLanguage, domain || 'general');
    const resource = getResourceForTopic(topicKey, resolvedLang, domain || 'general');

    const enriched = {
      ...resource,
      video: resource.video ? {
        ...resource.video,
        embedUrl: buildEmbedUrl(resource.video.id),
        watchUrl: buildWatchUrl(resource.video.id),
        thumbnailUrl: `https://i.ytimg.com/vi/${resource.video.id}/hqdefault.jpg`
      } : null,
      preferredLanguage: resolvedLang,
      preferredLanguageDisplay: getLanguageDisplay(resolvedLang)
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
  updateSessionTracking,
  startPractice,
  runPractice,
  submitPractice,
  updateSession,
  rescheduleRoadmap,
  getTopicContent,
  getTopicResources
};
