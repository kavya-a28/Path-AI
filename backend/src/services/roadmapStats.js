/**
 * roadmapStats.js — centralized roadmap stat & milestone sync logic
 *
 * Key functions:
 *   syncRoadmap(roadmap)                    — full sync after any mutation
 *   smartRepackWithCap(roadmap, startDay)   — smart reschedule with daily cap
 *   recalculateStats(roadmap)               — recompute all stats
 */

const { calculateStreakByDate } = require('./calendarScheduler');

const XP_PER_SESSION   = 30;   // video watched + notes
const XP_PER_MILESTONE = 250;

// ─── Milestone sync ───────────────────────────────────────────────────────────

/** Find the milestone that owns a session */
const findMilestoneForSession = (milestones, session) => {
  if (!session) return null;
  return milestones.find(ms =>
    (ms.domain === session.domain || !ms.domain) &&
    (ms.title === session.phaseTitle ||
      (ms.topics || []).some(t => t.topicKey === session.topicKey))
  ) || null;
};

/** Sync milestone progress/status from session completion state */
const syncMilestones = (roadmap) => {
  const sessions   = roadmap.dailySessions || [];
  const milestones = roadmap.milestones    || [];

  milestones.forEach(ms => {
    const phaseSessions = sessions.filter(s =>
      s.phaseTitle === ms.title && (s.domain === ms.domain || !ms.domain)
    );
    if (phaseSessions.length === 0) return;

    const done  = phaseSessions.filter(s => s.status === 'completed').length;
    const total = phaseSessions.length;
    ms.progress = Math.round((done / total) * 100);

    if (done === total) {
      ms.status = 'completed';
    } else if (phaseSessions.some(s => s.status === 'current' || s.status === 'completed')) {
      ms.status = 'current';
    } else {
      ms.status = ms.status === 'completed' ? 'completed' : 'locked';
    }

    // Mark individual topics completed when their session is done
    (ms.topics || []).forEach(topic => {
      const topicSession = phaseSessions.find(s => s.topicKey === topic.topicKey || s.title === topic.name);
      if (topicSession?.status === 'completed') topic.completed = true;
    });
  });

  // Unlock next milestone when previous is completed
  milestones.forEach((ms, i) => {
    if (ms.status === 'completed' && i + 1 < milestones.length) {
      const next = milestones[i + 1];
      if (next.status === 'locked') next.status = 'current';
    }
  });

  // Ensure at least one milestone is current if none completed all
  const hasCurrent = milestones.some(m => m.status === 'current');
  if (!hasCurrent) {
    const firstIncomplete = milestones.find(m => m.status !== 'completed');
    if (firstIncomplete) firstIncomplete.status = 'current';
  }
};

// ─── Day status helper ────────────────────────────────────────────────────────

/** Derive day-level status from sessions (for monthly map) */
const getDayStatus = (sessions, day) => {
  const daySessions = sessions.filter(s => s.day === day);
  if (daySessions.length === 0) return 'locked';
  if (daySessions.every(s => s.status === 'completed')) return 'completed';
  if (daySessions.some(s => s.status === 'missed')) return 'missed';
  if (daySessions.some(s => s.status === 'current' || s.status === 'completed')) return 'current';
  return 'locked';
};

// ─── Stats recalculation ──────────────────────────────────────────────────────

/** Recalculate all roadmap.stats fields including streak and XP */
const recalculateStats = (roadmap) => {
  const sessions    = roadmap.dailySessions || [];
  const milestones  = roadmap.milestones    || [];
  const hoursPerDay = roadmap.stats?.hoursPerDay || 3;
  const total       = sessions.length;

  const completed = sessions.filter(s => s.status === 'completed');
  const missed    = sessions.filter(s => s.status === 'missed');
  const remaining = sessions.filter(s => s.status !== 'completed');

  // Progress
  roadmap.stats.progressPercent = total > 0
    ? Math.round((completed.length / total) * 100)
    : 0;

  roadmap.stats.completedMilestones = milestones.filter(m => m.status === 'completed').length;
  roadmap.stats.totalCompleted      = completed.length;
  roadmap.stats.totalMissed         = missed.length;

  // XP: sessions * XP_PER_SESSION + milestone bonuses
  roadmap.stats.xpScore =
    completed.length * XP_PER_SESSION +
    roadmap.stats.completedMilestones * XP_PER_MILESTONE;

  roadmap.stats.totalSessions = total;

  // ── Streak calculation ────────────────────────────────────────────────────
  // Prefer date-based streak when sessions have scheduledDate;
  // fall back to day-number-based for legacy roadmaps.
  const hasDatedSessions = sessions.some(s => s.scheduledDate);

  let streak        = 0;
  let longestStreak = roadmap.stats.longestStreak || 0;

  if (hasDatedSessions) {
    // Date-based (accurate)
    const result = calculateStreakByDate(sessions);
    streak        = result.streak;
    longestStreak = Math.max(longestStreak, result.longestStreak);
  } else {
    // Legacy day-number-based fallback
    const completedDays = new Set(completed.map(s => s.day));
    const missedDays    = new Set(missed.map(s => s.day));
    const allDays = [...new Set(sessions.map(s => s.day))].sort((a, b) => a - b);

    let currentStreak = 0;
    for (const day of allDays) {
      const dayCompleted = getDayStatus(sessions, day) === 'completed';
      const dayMissed    = missedDays.has(day);
      if (dayCompleted) {
        currentStreak++;
        if (currentStreak > longestStreak) longestStreak = currentStreak;
      } else if (dayMissed) {
        currentStreak = 0;
      }
    }
    streak = currentStreak;
  }

  roadmap.stats.streak        = streak;
  roadmap.stats.longestStreak = longestStreak;

  // ── currentDay: first day with incomplete sessions ────────────────────────
  const incompleteDays = [...new Set(remaining.map(s => s.day))].sort((a, b) => a - b);
  if (incompleteDays.length > 0) {
    roadmap.stats.currentDay = incompleteDays[0];
  } else if (completed.length > 0) {
    const maxDay = Math.max(...completed.map(s => s.day));
    roadmap.stats.currentDay = maxDay + 1;
  } else {
    roadmap.stats.currentDay = 1;
  }

  // ── Days left ─────────────────────────────────────────────────────────────
  const allDayNums = [...new Set(sessions.map(s => s.day))];
  const maxDay  = allDayNums.length > 0 ? Math.max(...allDayNums) : 1;
  roadmap.stats.totalDays = maxDay;

  const remainingHours = remaining.reduce((sum, s) => sum + (s.estimatedHours || 1), 0);
  roadmap.stats.daysLeft = remaining.length > 0
    ? Math.max(1, Math.ceil(remainingHours / hoursPerDay))
    : 0;
};

// ─── Simple repack (existing behaviour) ──────────────────────────────────────

/** Pack non-completed sessions onto days starting from startDay (no cap) */
const repackRemainingSessions = (roadmap, startDay) => {
  const sessions    = roadmap.dailySessions || [];
  const hoursPerDay = roadmap.stats?.hoursPerDay || 3;

  const remaining = sessions
    .filter(s => s.status !== 'completed')
    .sort((a, b) => a.id - b.id);

  let day        = startDay;
  let hoursInDay = 0;
  let first      = true;

  remaining.forEach(session => {
    const hrs = session.estimatedHours || 1;
    if (hoursInDay > 0 && hoursInDay + hrs > hoursPerDay) {
      day++;
      hoursInDay = 0;
    }

    session.day = day;
    hoursInDay += hrs;

    if (session.status !== 'completed') {
      session.status = first ? 'current' : 'locked';
    }
    first = false;
  });

  if (remaining.length > 0) {
    roadmap.stats.totalDays = Math.max(...remaining.map(s => s.day));
  }
};

// ─── Smart repack with daily cap ─────────────────────────────────────────────

/**
 * Smart reschedule that spreads missed sessions evenly.
 *
 * Algorithm:
 *   1. Collect missed sessions (need to be re-inserted)
 *   2. Collect remaining pending/current sessions (already on future days)
 *   3. Build a merged list ordered by original session ID
 *   4. Fill each day up to (hoursPerDay + extraCapPerDay) hours
 *   5. Extra capacity is capped at extraCapPerDay per day to avoid overload
 *
 * @param {Object} roadmap         — mongoose document
 * @param {number} startDay        — day to start repacking from
 * @param {number} extraCapPerDay  — extra hours/day allowed for catch-up (default 1)
 */
const smartRepackWithCap = (roadmap, startDay = null, extraCapPerDay = 1) => {
  const sessions    = roadmap.dailySessions || [];
  const hoursPerDay = roadmap.stats?.hoursPerDay || 3;
  const maxPerDay   = hoursPerDay + extraCapPerDay;

  // Determine start day
  const completed     = sessions.filter(s => s.status === 'completed');
  const maxCompleted  = completed.length > 0 ? Math.max(...completed.map(s => s.day)) : 0;
  const effectiveStart = startDay ?? Math.max(roadmap.stats.currentDay || 1, maxCompleted + 1);

  // Sessions to reschedule: missed + current + locked (not completed)
  const toReschedule = sessions
    .filter(s => s.status !== 'completed')
    .sort((a, b) => a.id - b.id);   // preserve original curriculum order

  const missedCount  = toReschedule.filter(s => s.status === 'missed').length;

  let day        = effectiveStart;
  let hoursInDay = 0;
  let first      = true;

  toReschedule.forEach(session => {
    const hrs = session.estimatedHours || 1;

    // Start new day if this session won't fit
    if (hoursInDay > 0 && hoursInDay + hrs > maxPerDay) {
      day++;
      hoursInDay = 0;
    }

    session.day    = day;
    session.status = first ? 'current' : 'locked';
    hoursInDay    += hrs;
    first          = false;
  });

  if (toReschedule.length > 0) {
    roadmap.stats.totalDays = Math.max(...toReschedule.map(s => s.day));
  }

  return {
    missedCount,
    rescheduledCount: toReschedule.length,
    startDay:         effectiveStart,
    extraCapPerDay
  };
};

// ─── Full sync ────────────────────────────────────────────────────────────────

/** Run full post-mutation sync */
const syncRoadmap = (roadmap) => {
  syncMilestones(roadmap);
  recalculateStats(roadmap);
};

module.exports = {
  XP_PER_SESSION,
  XP_PER_MILESTONE,
  findMilestoneForSession,
  syncMilestones,
  getDayStatus,
  recalculateStats,
  repackRemainingSessions,
  smartRepackWithCap,
  syncRoadmap
};
