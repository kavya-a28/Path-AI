/**
 * roadmapStats.js — centralized roadmap stat & milestone sync logic
 *
 * Key functions:
 *   syncRoadmap(roadmap)                    — full sync after any mutation
 *   smartRepackWithCap(roadmap, startDay)   — smart reschedule with daily cap
 *   recalculateStats(roadmap)               — recompute all stats
 */

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
  // Group completed sessions by day, find consecutive days without missed days in between
  const completedDays = new Set(completed.map(s => s.day));
  const missedDays    = new Set(missed.map(s => s.day));

  // Build sorted list of all days that had any sessions
  const allDays = [...new Set(sessions.map(s => s.day))].sort((a, b) => a - b);

  let streak        = 0;
  let longestStreak = roadmap.stats.longestStreak || 0;
  let lastCompletedDay = roadmap.stats.lastCompletedDay || 0;
  let currentStreak = 0;

  // Walk days in order: if day is fully completed → streak++, if missed → reset
  for (const day of allDays) {
    const dayCompleted = getDayStatus(sessions, day) === 'completed';
    const dayMissed    = missedDays.has(day);

    if (dayCompleted) {
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
      lastCompletedDay = day;
    } else if (dayMissed) {
      // Missed day breaks streak
      currentStreak = 0;
    }
    // locked/current days (future) don't affect streak
  }

  roadmap.stats.streak          = currentStreak;
  roadmap.stats.longestStreak   = longestStreak;
  roadmap.stats.lastCompletedDay = lastCompletedDay;

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

// ─── Smart adaptive repack ────────────────────────────────────────────────────

/**
 * Smart adaptive reschedule v2.
 *
 * Determines the right "catch-up intensity" based on how large the backlog is,
 * then re-packs all non-completed sessions preserving curriculum order.
 *
 * Adaptive cap rules (extra hours above normal hoursPerDay):
 *   Light      (backlog ≤ 3 days worth of hours)  → +1.0 h/day
 *   Medium     (backlog 3–7 days)                 → +1.5 h/day
 *   Intensive  (backlog > 7 days)                 → +2.0 h/day
 *   Hard cap: never exceed 8 h/day or hoursPerDay*2, whichever is lower.
 *
 * Returns a rich summary used by the controller and frontend.
 *
 * @param {Object} roadmap        — mongoose document (mutated in-place)
 * @param {number|null} startDay  — override start day (default = currentDay)
 * @returns {Object}              summary with extraDays, mode, etc.
 */
const smartRepackWithCap = (roadmap, startDay = null) => {
  const sessions    = roadmap.dailySessions || [];
  const hoursPerDay = roadmap.stats?.hoursPerDay || 3;

  // ── 1. Snapshot the original end day ──────────────────────────────────────
  const allDayNums     = sessions.map(s => s.day).filter(Boolean);
  const originalEndDay = allDayNums.length > 0 ? Math.max(...allDayNums) : 1;

  // ── 2. Separate completed vs sessions to reschedule ───────────────────────
  const completed    = sessions.filter(s => s.status === 'completed');
  const toReschedule = sessions
    .filter(s => s.status !== 'completed')
    .sort((a, b) => a.id - b.id);   // preserve original curriculum order

  const missedSessions   = toReschedule.filter(s => s.status === 'missed');
  const missedCount      = missedSessions.length;
  const missedHours      = missedSessions.reduce((sum, s) => sum + (s.estimatedHours || 1), 0);
  const remainingHours   = toReschedule.reduce((sum, s) => sum + (s.estimatedHours || 1), 0);

  // ── 3. Pick adaptive mode based on MISSED TASK COUNT ────────────────────
  // < 4 missed  → Light    (+1.0h/day to absorb quickly)
  // 4–7 missed  → Medium   (+0h/day, just shift schedule / add extra day)
  // 8+ missed   → Intensive(+0h/day, just shift schedule / add extra days)
  let mode, extraCap;
  if (missedCount < 4) {
    mode     = 'light';
    extraCap = 1.0;
  } else if (missedCount <= 7) {
    mode     = 'medium';
    extraCap = 0;
  } else {
    mode     = 'intensive';
    extraCap = 0;
  }

  // Never exceed 8 h/day or 2× the user's daily preference
  const absoluteMax = Math.min(8, hoursPerDay * 2);
  const maxPerDay   = Math.min(absoluteMax, hoursPerDay + extraCap);

  // ── 4. Determine start day ────────────────────────────────────────────────
  const maxCompleted   = completed.length > 0 ? Math.max(...completed.map(s => s.day)) : 0;
  const effectiveStart = startDay ?? Math.max(roadmap.stats.currentDay || 1, maxCompleted + 1);

  // ── 5. Re-pack sessions onto days ─────────────────────────────────────────
  let day        = effectiveStart;
  let hoursInDay = 0;
  let isFirst    = true;

  toReschedule.forEach(session => {
    const hrs = session.estimatedHours || 1;

    // Roll to next day if this session won't fit
    if (hoursInDay > 0 && hoursInDay + hrs > maxPerDay) {
      day++;
      hoursInDay = 0;
    }

    session.day    = day;
    session.status = isFirst ? 'current' : 'locked';
    hoursInDay    += hrs;
    isFirst        = false;
  });

  // ── 6. Compute new end day & extra days added ─────────────────────────────
  const newEndDay     = toReschedule.length > 0
    ? Math.max(...toReschedule.map(s => s.day))
    : originalEndDay;

  const extraDaysAdded = Math.max(0, newEndDay - originalEndDay);

  if (toReschedule.length > 0) {
    roadmap.stats.totalDays = newEndDay;
  }

  // ── 7. Build rescheduled-sessions list for frontend table ─────────────────
  // Only includes sessions that were originally missed (not just pending)
  const rescheduledSessions = missedSessions.map(s => ({
    id:             s.id,
    title:          s.title,
    phaseTitle:     s.phaseTitle || '',
    estimatedHours: s.estimatedHours || 1,
    newDay:         s.day,   // already updated by step 5 above
    status:         s.status // now 'current' or 'locked'
  }));

  return {
    missedCount,
    missedHours,
    remainingHours,
    rescheduledCount: toReschedule.length,
    startDay:         effectiveStart,
    originalEndDay,
    newEndDay,
    extraDaysAdded,
    mode,
    extraCapPerDay:   extraCap,
    maxPerDay,
    rescheduledSessions
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
