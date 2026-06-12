/**
 * calendarScheduler.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Converts logical day numbers into real calendar dates using a rolling 7-day
 * window. Only the next 7 days of sessions are ever scheduled at a time.
 *
 * Key functions:
 *   assignDates(roadmap, startDate, windowDays)  — stamp sessions with real dates
 *   markMissedByDate(roadmap)                    — date-based missed detection
 *   extendScheduleIfNeeded(roadmap)              — auto-extend window when <3 days remain
 *   rescheduleFromDate(roadmap, fromDate)        — smart repack from a given date
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Return a pure date string "YYYY-MM-DD" in local time (no timezone shift).
 */
function toDateStr(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * Parse "YYYY-MM-DD" or a Date object to a plain Date at midnight UTC.
 */
function toMidnight(dateInput) {
  if (!dateInput) return null;
  const str = typeof dateInput === 'string' ? dateInput : toDateStr(dateInput);
  return new Date(`${str}T00:00:00.000Z`);
}

/**
 * Add N days to a date, returning a new Date at midnight UTC.
 */
function addDays(date, n) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

/**
 * Today at midnight UTC.
 */
function todayMidnight() {
  return toMidnight(toDateStr(new Date()));
}

/**
 * Format a Date for display: "Mon, 12 Jun"
 */
function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    timeZone: 'UTC'
  });
}

/**
 * Return a relative label: "Today", "Tomorrow", "Yesterday", "12 Jun", "3 days ago"
 */
function relativeLabel(scheduledDate) {
  if (!scheduledDate) return null;
  const today   = todayMidnight();
  const sched   = toMidnight(scheduledDate);
  const diffMs  = sched - today;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0)  return 'Today';
  if (diffDays === 1)  return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1)  return `${Math.abs(diffDays)} days ago`;
  if (diffDays > 1)   return `In ${diffDays} days`;
  return formatDate(sched);
}

// ─── Core: Assign real calendar dates to unscheduled sessions ─────────────────

/**
 * Assign real calendar dates to the next `windowDays` calendar days worth
 * of sessions that currently have `scheduledDate === null`.
 *
 * Rules:
 *  - Already-scheduled sessions are left untouched
 *  - Sessions are taken in id order
 *  - At most `hoursPerDay` hours of sessions are assigned per calendar date
 *  - Skips weekends if profile.skipWeekends === true (future: respect freeTimeSlots)
 *
 * @param {Object} roadmap       Mongoose document
 * @param {Date}   startDate     First calendar date to use
 * @param {number} windowDays    How many calendar days to fill (default 7)
 * @returns {number}             Count of newly scheduled sessions
 */
function assignDates(roadmap, startDate = null, windowDays = 7) {
  const sessions    = roadmap.dailySessions || [];
  const hoursPerDay = roadmap.stats?.hoursPerDay || 3;
  const start       = toMidnight(startDate || toDateStr(new Date()));

  // Find first unscheduled session
  const unscheduled = sessions
    .filter(s => !s.scheduledDate && s.status !== 'completed')
    .sort((a, b) => a.id - b.id);

  if (unscheduled.length === 0) return 0;

  // Determine the window end date
  const windowEnd = addDays(start, windowDays);

  let cursorDate  = new Date(start);
  let hoursInDay  = 0;
  let scheduled   = 0;

  for (const session of unscheduled) {
    // Stop if we've gone past the window
    if (cursorDate >= windowEnd) break;

    const hrs = session.estimatedHours || 1;

    // Advance to next day if this session won't fit
    if (hoursInDay > 0 && hoursInDay + hrs > hoursPerDay) {
      cursorDate = addDays(cursorDate, 1);
      hoursInDay = 0;
      if (cursorDate >= windowEnd) break;
    }

    session.scheduledDate = new Date(cursorDate);
    hoursInDay += hrs;
    scheduled++;
  }

  // Track scheduling metadata
  if (!roadmap.stats.scheduleStartDate) {
    roadmap.stats.scheduleStartDate = start;
  }

  // Update lastScheduledDate to the furthest assigned date
  const scheduledDates = sessions
    .filter(s => s.scheduledDate)
    .map(s => new Date(s.scheduledDate).getTime());
  if (scheduledDates.length > 0) {
    roadmap.stats.lastScheduledDate = new Date(Math.max(...scheduledDates));
  }

  return scheduled;
}

// ─── Mark missed sessions by real date ────────────────────────────────────────

/**
 * Mark sessions as 'missed' where:
 *   session.scheduledDate < today AND status is 'locked' or 'current'
 *
 * Also marks unscheduled sessions that have day < currentDay as missed
 * (fallback for roadmaps before calendar migration).
 *
 * @param {Object} roadmap  Mongoose document
 * @returns {number}        Count of newly missed sessions
 */
function markMissedByDate(roadmap) {
  const today    = todayMidnight();
  const sessions = roadmap.dailySessions || [];
  let   marked   = 0;

  for (const session of sessions) {
    if (session.status === 'completed' || session.status === 'missed') continue;

    const shouldMiss =
      // Date-based: scheduled in the past and not done
      (session.scheduledDate && toMidnight(session.scheduledDate) < today) ||
      // Fallback for legacy sessions without scheduledDate
      (!session.scheduledDate && session.day < (roadmap.stats?.currentDay || 1));

    if (shouldMiss) {
      session.status = 'missed';
      marked++;
    }
  }

  return marked;
}

// ─── Auto-extend the scheduling window ────────────────────────────────────────

/**
 * Check if the scheduling window is running low (< 3 days of scheduled sessions
 * remain in the future). If so, assign dates for the next 7 days.
 *
 * Call this on every roadmap fetch to keep the window rolling.
 *
 * @param {Object} roadmap  Mongoose document
 * @returns {boolean}       true if new sessions were scheduled
 */
function extendScheduleIfNeeded(roadmap) {
  const today    = todayMidnight();
  const sessions = roadmap.dailySessions || [];

  // Count sessions scheduled in the future (not yet done)
  const futureSessions = sessions.filter(s => {
    if (s.status === 'completed') return false;
    if (!s.scheduledDate) return false;
    return toMidnight(s.scheduledDate) >= today;
  });

  // Count unique future dates
  const futureDates = new Set(
    futureSessions.map(s => toDateStr(s.scheduledDate))
  );

  // Extend if fewer than 3 days of future sessions remain
  if (futureDates.size < 3) {
    // Find the next unscheduled date (day after lastScheduledDate or tomorrow)
    const lastDate = roadmap.stats?.lastScheduledDate;
    const nextStart = lastDate
      ? addDays(toMidnight(lastDate), 1)
      : addDays(today, 0);

    const newlyScheduled = assignDates(roadmap, nextStart, 7);
    return newlyScheduled > 0;
  }

  return false;
}

// ─── Smart reschedule from a given date ──────────────────────────────────────

/**
 * Reassign real calendar dates to all non-completed sessions starting from
 * `fromDate` (default: tomorrow). Respects hoursPerDay + extraCapPerDay cap.
 *
 * This replaces `smartRepackWithCap` for the calendar-aware system.
 *
 * @param {Object} roadmap        Mongoose document
 * @param {Date}   fromDate       First date to assign (default: tomorrow)
 * @param {number} extraCapPerDay Extra hours allowed per day for catch-up (default 1)
 * @returns {Object}              Summary of what was rescheduled
 */
function rescheduleFromDate(roadmap, fromDate = null, extraCapPerDay = 1) {
  const today       = todayMidnight();
  const startDate   = fromDate ? toMidnight(fromDate) : addDays(today, 1);
  const hoursPerDay = roadmap.stats?.hoursPerDay || 3;
  const maxPerDay   = hoursPerDay + extraCapPerDay;

  // Clear all scheduledDates on non-completed sessions
  const toReschedule = (roadmap.dailySessions || [])
    .filter(s => s.status !== 'completed')
    .sort((a, b) => a.id - b.id);

  const missedCount = toReschedule.filter(s => s.status === 'missed').length;

  // Clear old dates
  toReschedule.forEach(s => { s.scheduledDate = null; });

  // Assign new dates
  let cursorDate = new Date(startDate);
  let hoursInDay = 0;
  let first      = true;

  toReschedule.forEach(session => {
    const hrs = session.estimatedHours || 1;

    if (hoursInDay > 0 && hoursInDay + hrs > maxPerDay) {
      cursorDate = addDays(cursorDate, 1);
      hoursInDay = 0;
    }

    session.scheduledDate = new Date(cursorDate);
    session.status = first ? 'current' : 'locked';
    hoursInDay += hrs;
    first = false;
  });

  // Update scheduling metadata
  roadmap.stats.lastScheduledDate = toReschedule.length > 0
    ? new Date(cursorDate)
    : null;

  // Recalculate day numbers based on new date order
  let dayNum  = 1;
  let lastStr = null;
  toReschedule.forEach(s => {
    const str = toDateStr(s.scheduledDate);
    if (str !== lastStr) { dayNum = (lastStr ? dayNum + 1 : 1); lastStr = str; }
    s.day = dayNum;
  });

  return {
    missedCount,
    rescheduledCount: toReschedule.length,
    startDate:        toDateStr(startDate),
    extraCapPerDay
  };
}

// ─── Date-based streak calculation ───────────────────────────────────────────

/**
 * Calculate current streak based on real calendar dates.
 * A streak day = a calendar date where ALL scheduled sessions are completed.
 * A break = a calendar date in the past where at least one session was missed.
 *
 * @param {Array} sessions  dailySessions array
 * @returns {{ streak, longestStreak }}
 */
function calculateStreakByDate(sessions) {
  const today = todayMidnight();

  // Group sessions by scheduledDate string
  const byDate = {};
  for (const s of sessions) {
    if (!s.scheduledDate) continue;
    const dateStr = toDateStr(s.scheduledDate);
    if (!byDate[dateStr]) byDate[dateStr] = [];
    byDate[dateStr].push(s);
  }

  // Sort all scheduled dates in ascending order (past → future)
  const allDates = Object.keys(byDate).sort();

  let streak        = 0;
  let longestStreak = 0;
  let currentStreak = 0;

  for (const dateStr of allDates) {
    const date      = toMidnight(dateStr);
    const dayGroup  = byDate[dateStr];
    const isToday   = date.getTime() === today.getTime();
    const isPast    = date < today;

    if (!isPast && !isToday) break; // don't look at future dates for streak

    const allDone   = dayGroup.every(s => s.status === 'completed');
    const anyMissed = dayGroup.some(s => s.status === 'missed');

    if (allDone) {
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else if (anyMissed || (isPast && !allDone)) {
      // Missed or past day not fully completed → breaks streak
      currentStreak = 0;
    }
    // In-progress today doesn't break streak yet
  }

  streak = currentStreak;
  return { streak, longestStreak };
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  toDateStr,
  toMidnight,
  addDays,
  todayMidnight,
  formatDate,
  relativeLabel,
  assignDates,
  markMissedByDate,
  extendScheduleIfNeeded,
  rescheduleFromDate,
  calculateStreakByDate
};
