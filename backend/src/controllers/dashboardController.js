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

    const pendingCount = sessions.filter(s => s.status === 'locked' || s.status === 'current').length;
    
    // --- Dynamic Roadmap Health Score ---
    const healthConsistency = completionRate;
    const healthMissed = Math.max(0, 100 - (missedSessions.length * 5));
    const healthSkill = Math.min(100, Math.max(50, Math.round(masteryProgress * 1.2)));
    const healthDeadline = Math.max(0, 100 - (missedSessions.length * 2));

    const healthValue = Math.round((healthConsistency + healthMissed + healthSkill + healthDeadline) / 4);
    const healthTrend = healthValue >= 75 ? 'up' : 'down';

    const healthScore = {
      value: healthValue,
      trend: healthTrend,
      factors: [
        { name: 'Consistency', score: healthConsistency, color: 'from-emerald-400 to-emerald-500' },
        { name: 'Missed Tasks', score: healthMissed, color: 'from-blue-400 to-blue-500' },
        { name: 'Skill Balance', score: healthSkill, color: 'from-purple-400 to-purple-500' },
        { name: 'Deadline Adherence', score: healthDeadline, color: 'from-orange-400 to-orange-500' }
      ]
    };

    // --- Dynamic AI Insights ---
    const aiInsights = [];
    const streak = roadmap.stats?.streak || 0;
    
    if (streak >= 3) {
      aiInsights.push({ icon: '🔥', text: `Great job maintaining a ${streak} day learning streak!`, type: 'positive' });
    } else if (todayCompleted > 0) {
      aiInsights.push({ icon: '🎯', text: 'You made progress today. Keep up the momentum!', type: 'positive' });
    } else {
      aiInsights.push({ icon: '💡', text: 'Start a session today to build your learning streak.', type: 'suggestion' });
    }

    if (missedSessions.length > 0) {
      aiInsights.push({ icon: '⚠️', text: `You have ${missedSessions.length} missed tasks. Try to catch up this weekend.`, type: 'warning' });
    } else if (completedSessions.length > 0) {
      aiInsights.push({ icon: '✨', text: 'Perfect attendance! You have no missed tasks.', type: 'positive' });
    }

    // Only show the "under 50%" alert if the user has genuinely attempted
    // some sessions today (at least 1 completed or 1 missed), not just because
    // there are pending/locked sessions that haven't been started yet.
    const todayAttempted = todayCompleted + todayMissed;
    if (completionPct < 50 && todayAttempted > 0) {
      aiInsights.push({ icon: '⏰', text: `Your daily completion is under 50% (${todayCompleted}/${todayAttempted + todayPending} done today). Consider adjusting your schedule.`, type: 'alert' });
    } else if (studiedHours > 0) {
      aiInsights.push({ icon: '🧠', text: `You've invested ${Math.round(studiedHours * 10) / 10} hours into learning so far. Excellent dedication!`, type: 'positive' });
    }
    // 4th insight: active recovery mode notice
    const lastReschedule = roadmap.stats?.lastReschedule;
    if (lastReschedule?.extraDaysAdded > 0 && missedSessions.length > 0) {
      const modeEmoji = { light: '🟢', medium: '🟡', intensive: '🔴' }[lastReschedule.mode] || '📅';
      aiInsights.push({
        icon: modeEmoji,
        text: `Recovery mode (${lastReschedule.mode}): roadmap extended by ${lastReschedule.extraDaysAdded} day(s) to absorb ${lastReschedule.missedRescheduled} missed session(s). Complete tasks daily to recover.`,
        type: 'warning'
      });
    }

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
        pendingCount,
        pendingSessions:   missedSessions.map(formatSession),
        completedList:     completedSessions
          .sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0))
          .map(formatSession),
        currentTask: currentTask ? formatSession(currentTask) : null,
        upNext,
        healthScore,
        aiInsights,
        // Reschedule / overtime info
        totalDays:       roadmap.stats?.totalDays ?? 0,
        lastReschedule:  roadmap.stats?.lastReschedule
          ? {
              date:              roadmap.stats.lastReschedule.date,
              missedRescheduled: roadmap.stats.lastReschedule.missedRescheduled,
              extraDaysAdded:    roadmap.stats.lastReschedule.extraDaysAdded,
              mode:              roadmap.stats.lastReschedule.mode,
              originalEndDay:    roadmap.stats.lastReschedule.originalEndDay,
              newEndDay:         roadmap.stats.lastReschedule.newEndDay,
              totalRescheduled:  roadmap.stats.lastReschedule.totalRescheduled,
              extraCapPerDay:    roadmap.stats.lastReschedule.extraCapPerDay
            }
          : null
      }
    });

  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats };
