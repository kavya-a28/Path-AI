/**
 * dashboardController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/roadmap/dashboard/stats
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Roadmap = require('../models/Roadmap');
const { XP_PER_SESSION, XP_PER_MILESTONE } = require('../services/roadmapStats');
const { enrichSessionTimeFields } = require('../utils/timeSplit');

const formatSession = (s) => {
  enrichSessionTimeFields(s);
  return {
    id:             s.id,
    title:          s.title,
    topicKey:       s.topicKey,
    phaseTitle:     s.phaseTitle,
    day:            s.day,
    status:         s.status,
    estimatedHours: s.estimatedHours,
    estimatedLearningHours: s.estimatedLearningHours,
    estimatedPracticeHours: s.estimatedPracticeHours,
    domain:         s.domain,
    completedAt:    s.completedAt || null,
    topicPart:      s.topicPart,
    time:           s.time,
    embedUrl:       s.embedUrl,
    watchUrl:       s.watchUrl,
    videoId:        s.videoId,
    color:          s.color,
    icon:           s.icon,
    practiceCompleted:    s.practiceCompleted || false,
    practiceStartedAt:    s.practiceStartedAt || null,
    practiceCompletedAt:  s.practiceCompletedAt || null,
    actualLearningSeconds: s.actualLearningSeconds || 0,
    actualPracticeSeconds: s.actualPracticeSeconds || 0,
    actualLearningHours:   s.actualLearningHours || 0,
    actualPracticeHours:   s.actualPracticeHours || 0,
    learningOvertime:      s.learningOvertime || false,
    practiceOvertime:      s.practiceOvertime || false
  };
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const roadmap = await Roadmap.findOne({ userId, status: 'active' }).lean();

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'No active roadmap found.' });
    }

    const sessions    = roadmap.dailySessions || [];
    const totalSessions = sessions.length;
    const currentDay  = roadmap.stats?.currentDay || 1;
    const hoursPerDay = roadmap.stats?.hoursPerDay || 3;

    const completedSessions = sessions.filter(s => s.status === 'completed');
    const pendingSessions   = sessions.filter(s => s.status === 'missed');
    const masteryProgress   = totalSessions > 0
      ? Math.round((completedSessions.length / totalSessions) * 100)
      : 0;

    const studiedHours = completedSessions.reduce((sum, s) => sum + (s.estimatedHours || 1), 0);

    const weekStart = Math.max(1, currentDay - 6);
    const thisWeekSessions = sessions.filter(s => s.day >= weekStart && s.day <= currentDay);
    const weekCompleted    = thisWeekSessions.filter(s => s.status === 'completed').length;
    const weeklyGoal       = thisWeekSessions.length > 0
      ? Math.round((weekCompleted / thisWeekSessions.length) * 100)
      : 0;

    const todaySessions  = sessions.filter(s => s.day === currentDay);
    const todayCompleted = todaySessions.filter(s => s.status === 'completed').length;
    const todayPending   = todaySessions.filter(s => s.status === 'locked' || s.status === 'current').length;
    const todayMissed    = todaySessions.filter(s => s.status === 'missed').length;
    const todayTotal     = todayCompleted + todayPending + todayMissed;
    const completionPct  = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    // Current task: current session first, then first locked with prerequisites met
    const anyInProgress = sessions.find(s => s.status === 'current');
    const anyPending    = sessions.find(s => {
      if (s.status !== 'locked') return false;
      const prev = sessions.find(p => p.id === s.id - 1);
      return !prev || prev.status === 'completed';
    });
    const todayInProgress   = todaySessions.find(s => s.status === 'current');
    const todayFirstPending = todaySessions.find(s => s.status === 'locked');
    const currentTask = todayInProgress || todayFirstPending || anyInProgress || anyPending || null;

    const seenTopicKeys = new Set();
    if (currentTask?.topicKey) seenTopicKeys.add(currentTask.topicKey);

    const upNext = [];
    for (const s of sessions) {
      if (upNext.length >= 3) break;
      if (s.status !== 'locked' && s.status !== 'current') continue;
      if (s.id === currentTask?.id) continue;
      if (seenTopicKeys.has(s.topicKey)) continue;
      seenTopicKeys.add(s.topicKey);
      upNext.push(formatSession(s));
    }

    const completedMilestones = (roadmap.milestones || []).filter(m => m.status === 'completed').length;
    const xpScore = completedSessions.length * XP_PER_SESSION + completedMilestones * XP_PER_MILESTONE;

    const remaining = sessions.filter(s => s.status !== 'completed');
    const remainingHours = remaining.reduce((sum, s) => sum + (s.estimatedHours || 1), 0);
    const daysLeft = remaining.length > 0
      ? Math.max(1, Math.ceil(remainingHours / hoursPerDay))
      : 0;

    const missedSessions    = sessions.filter(s => s.status === 'missed');
    const completionRate    = (completedSessions.length + missedSessions.length) > 0
      ? Math.round((completedSessions.length / (completedSessions.length + missedSessions.length)) * 100)
      : 100;

    return res.status(200).json({
      success: true,
      stats: {
        weeklyGoal,
        studiedHours: Math.round(studiedHours * 10) / 10,
        masteryProgress,
        todayCompleted,
        todayPending,
        todayMissed,
        completionPct,
        completedSessions: completedSessions.length,
        totalSessions,
        currentDay,
        hoursPerDay,
        xpScore:           roadmap.stats?.xpScore       ?? xpScore,
        daysLeft,
        progressPercent:   roadmap.stats?.progressPercent ?? masteryProgress,
        // Streak
        streak:            roadmap.stats?.streak        ?? 0,
        longestStreak:     roadmap.stats?.longestStreak  ?? 0,
        // Completion tracking
        completionRate,
        missedTotal:       missedSessions.length,
        completedTotal:    completedSessions.length,
        pendingCount:      sessions.filter(s => s.status === 'locked' || s.status === 'current').length,
        pendingSessions:   missedSessions.map(formatSession),
        completedList:     completedSessions
          .sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0))
          .map(formatSession),
        currentTask: currentTask ? formatSession(currentTask) : null,
        upNext
      }
    });

  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats };
