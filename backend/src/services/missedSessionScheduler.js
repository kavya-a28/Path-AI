/**
 * missedSessionScheduler.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs every hour after server startup.
 *
 * Marks sessions as 'missed' if:
 *   - session.scheduledDate < today  AND  status != completed   (date-based)
 *   - OR: session.day < currentDay AND no scheduledDate         (legacy fallback)
 *
 * Also auto-extends the 7-day rolling window when it's running low.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Roadmap = require('../models/Roadmap');
const {
  markMissedByDate,
  extendScheduleIfNeeded
} = require('./calendarScheduler');
const { syncRoadmap } = require('./roadmapStats');

async function runSchedulerCycle() {
  try {
    const roadmaps = await Roadmap.find({ status: 'active' });
    let totalMarked   = 0;
    let totalExtended = 0;

    for (const roadmap of roadmaps) {
      let changed = false;

      // 1. Mark overdue sessions as missed (date-based)
      const marked = markMissedByDate(roadmap);
      if (marked > 0) {
        totalMarked += marked;
        changed = true;
      }

      // 2. Extend rolling window if < 3 future days remain
      const extended = extendScheduleIfNeeded(roadmap);
      if (extended) {
        totalExtended++;
        changed = true;
      }

      // 3. Sync stats + save if anything changed
      if (changed) {
        syncRoadmap(roadmap);
        await roadmap.save();
      }
    }

    if (totalMarked > 0 || totalExtended > 0) {
      console.log(
        `[MissedScheduler] Marked ${totalMarked} session(s) as missed. ` +
        `Extended window for ${totalExtended} roadmap(s).`
      );
    }
  } catch (err) {
    console.error('[MissedScheduler] Error:', err.message);
  }
}

/**
 * Start the scheduler. Call this once after DB connects.
 * Runs immediately on start, then every hour.
 */
function startMissedSessionScheduler() {
  console.log('[MissedScheduler] Started — date-based missed detection, runs every hour');
  runSchedulerCycle();                               // run immediately on startup
  setInterval(runSchedulerCycle, 60 * 60 * 1000);   // then every hour
}

module.exports = { startMissedSessionScheduler };
