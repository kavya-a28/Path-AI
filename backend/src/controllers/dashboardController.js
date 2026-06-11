/**
 * dashboardController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/roadmap/dashboard/stats
 *
 * Returns all dashboard statistics computed live from MongoDB:
 *   weeklyGoal        – completed tasks this week ÷ total scheduled this week × 100
 *   studiedHours      – sum of estimatedHours for all completed sessions
 *   masteryProgress   – completed sessions ÷ total sessions × 100
 *   todayCompleted    – sessions completed on currentDay
 *   todayPending      – sessions locked/current on currentDay
 *   todayMissed       – sessions missed on currentDay
 *   completionPct     – todayCompleted ÷ (todayCompleted + todayPending + todayMissed) × 100
 *   currentTask       – IN_PROGRESS session first, else earliest PENDING
 *   upNext            – next 3 PENDING/IN_PROGRESS sessions after currentTask
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Roadmap = require('../models/Roadmap');

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

    // ── Mastery: completed ÷ total ────────────────────────────────────────────
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const masteryProgress   = totalSessions > 0
      ? Math.round((completedSessions.length / totalSessions) * 100)
      : 0;

    // ── Studied Hours: sum estimatedHours of completed sessions ───────────────
    const studiedHours = completedSessions.reduce((sum, s) => sum + (s.estimatedHours || 1), 0);

    // ── Weekly Goal: completed this week ÷ scheduled this week ───────────────
    // "This week" = sessions whose day falls within [currentDay-6, currentDay]
    const weekStart = Math.max(1, currentDay - 6);
    const thisWeekSessions  = sessions.filter(s => s.day >= weekStart && s.day <= currentDay);
    const weekCompleted     = thisWeekSessions.filter(s => s.status === 'completed').length;
    const weeklyGoal        = thisWeekSessions.length > 0
      ? Math.round((weekCompleted / thisWeekSessions.length) * 100)
      : 0;

    // ── Today's stats: sessions for currentDay ────────────────────────────────
    const todaySessions   = sessions.filter(s => s.day === currentDay);
    const todayCompleted  = todaySessions.filter(s => s.status === 'completed').length;
    const todayPending    = todaySessions.filter(s => s.status === 'locked' || s.status === 'current').length;
    const todayMissed     = todaySessions.filter(s => s.status === 'missed').length;
    const todayTotal      = todayCompleted + todayPending + todayMissed;
    const completionPct   = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    // ── Current Task: today's IN_PROGRESS first, else today's first PENDING ──
    const todayInProgress = todaySessions.find(s => s.status === 'current');
    const todayFirstPending = todaySessions.find(s => s.status === 'locked');
    // Fallback: any in-progress session, then any pending session across all days
    const anyInProgress = sessions.find(s => s.status === 'current');
    const anyPending    = sessions.find(s => s.status === 'locked');
    const currentTask   = todayInProgress || todayFirstPending || anyInProgress || anyPending || null;

    // ── Up Next: next unique topics (different topicKey), skip currentTask ─────
    // We want to show the FIRST session of each upcoming unique topic.
    // e.g. if 13 sessions are "Python for ML", show only 1 entry for it.
    const seenTopicKeys = new Set();
    if (currentTask?.topicKey) seenTopicKeys.add(currentTask.topicKey);

    const upNext = [];
    for (const s of sessions) {
      if (upNext.length >= 3) break;
      if (s.status !== 'locked' && s.status !== 'current') continue;
      if (s.id === currentTask?.id) continue;
      // Skip duplicate topics — only show the first session of each unique topic
      if (seenTopicKeys.has(s.topicKey)) continue;
      seenTopicKeys.add(s.topicKey);
      upNext.push({
        id:             s.id,
        title:          s.title,
        phaseTitle:     s.phaseTitle,
        day:            s.day,
        status:         s.status,
        estimatedHours: s.estimatedHours,
        topicKey:       s.topicKey,
        domain:         s.domain
      });
    }

    // ── Format currentTask for response ──────────────────────────────────────
    const currentTaskFormatted = currentTask ? {
      id:           currentTask.id,
      title:        currentTask.title,
      phaseTitle:   currentTask.phaseTitle,
      day:          currentTask.day,
      status:       currentTask.status,
      estimatedHours: currentTask.estimatedHours,
      topicKey:     currentTask.topicKey,
      domain:       currentTask.domain,
      topicPart:    currentTask.topicPart,
      time:         currentTask.time,
      embedUrl:     currentTask.embedUrl,
      watchUrl:     currentTask.watchUrl,
      videoId:      currentTask.videoId,
      color:        currentTask.color,
      icon:         currentTask.icon
    } : null;

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
        currentTask:  currentTaskFormatted,
        upNext
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats };
